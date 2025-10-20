import { access, mkdir } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { DnsProvider } from "./providers/DnsProvider.js";
import { DigitalOceanProvider } from "./providers/DigitalOceanProvider.js";
import { CloudflareProvider } from "./providers/CloudflareProvider.js";
import { AwsRoute53Provider } from "./providers/AwsRoute53Provider.js";
import { WildcardProvider } from "./providers/WildcardProvider.js";
import { LocalProvider } from "./providers/LocalProvider.js";

export type DnsProviderType =
  | "digitalocean"
  | "cloudflare"
  | "aws"
  | "wildcard"
  | "local";

export interface EnvironmentConfig {
  subdomain: string;
  ip: string;
  ttl?: number;
}

export interface ProviderCredentials {
  digitalocean?: { token?: string };
  cloudflare?: { token?: string; zoneId?: string; proxied?: boolean };
  aws?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    zoneId?: string;
    region?: string;
  };
}

export interface LocalProviderConfig {
  mode: "hosts" | "dns-server";
  hostsFile?: string;
  dnsPort?: number;
  defaultIp?: string;
  allowSudo?: boolean;
}

export interface WildcardProviderConfig {
  routesFile?: string;
}

export interface SslConfig {
  certDir?: string;
  email?: string;
  certbotCommand?: string;
  extraArgs?: string[];
}

export interface DnsConfig {
  provider: DnsProviderType;
  baseDomain: string;
  autoSSL?: boolean;
  ssl?: SslConfig;
  ttl?: number;
  environments: Record<string, EnvironmentConfig>;
  credentials?: ProviderCredentials;
  local?: LocalProviderConfig;
  wildcard?: WildcardProviderConfig;
}

export class DnsManager {
  private providerInstance?: DnsProvider;

  constructor(private readonly config: DnsConfig) {}

  async createRecord(env: string): Promise<void> {
    const envConfig = this.requireEnvironment(env);
    const provider = this.getProvider();
    await provider.create(envConfig.subdomain ?? "", envConfig.ip, this.resolveTtl(envConfig));
    const fqdn = this.fqdn(envConfig.subdomain);
    console.log(`✅ Created subdomain ${fqdn}`);
    if (this.config.autoSSL) {
      await this.ensureWildcardCertificate();
    }
  }

  async deleteRecord(env: string): Promise<void> {
    const envConfig = this.requireEnvironment(env);
    const provider = this.getProvider();
    await provider.delete(envConfig.subdomain ?? "");
    console.log(`🗑️ Deleted record ${this.fqdn(envConfig.subdomain)}`);
  }

  async listRecords(): Promise<void> {
    const provider = this.getProvider();
    const records = await provider.list();
    console.table(records.map((record) => ({
      name: record.name,
      type: record.type,
      value: record.value,
      ttl: record.ttl,
    })));
  }

  async syncAll(): Promise<void> {
    for (const key of Object.keys(this.config.environments)) {
      await this.createRecord(key);
    }
  }

  private getProvider(): DnsProvider {
    if (this.providerInstance) {
      return this.providerInstance;
    }
    const provider = this.config.provider;
    const credentials = this.config.credentials ?? {};
    switch (provider) {
      case "digitalocean": {
        const token = credentials.digitalocean?.token ?? process.env.DO_API_TOKEN;
        if (!token) {
          throw new Error("DigitalOcean token missing (set credentials.digitalocean.token)");
        }
        this.providerInstance = new DigitalOceanProvider({
          token,
          baseDomain: this.config.baseDomain,
          ttl: this.config.ttl,
        });
        break;
      }
      case "cloudflare": {
        const token = credentials.cloudflare?.token ?? process.env.CF_API_TOKEN;
        const zoneId = credentials.cloudflare?.zoneId ?? process.env.CF_ZONE_ID;
        if (!token || !zoneId) {
          throw new Error("Cloudflare credentials missing (token/zoneId)");
        }
        this.providerInstance = new CloudflareProvider({
          token,
          zoneId,
          baseDomain: this.config.baseDomain,
          ttl: this.config.ttl,
          proxied: credentials.cloudflare?.proxied,
        });
        break;
      }
      case "aws": {
        const accessKeyId =
          credentials.aws?.accessKeyId ?? process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey =
          credentials.aws?.secretAccessKey ?? process.env.AWS_SECRET_ACCESS_KEY;
        const zoneId = credentials.aws?.zoneId ?? process.env.AWS_ZONE_ID;
        if (!accessKeyId || !secretAccessKey || !zoneId) {
          throw new Error("AWS credentials missing (accessKeyId/secretAccessKey/zoneId)");
        }
        this.providerInstance = new AwsRoute53Provider({
          accessKeyId,
          secretAccessKey,
          zoneId,
          region: credentials.aws?.region,
          baseDomain: this.config.baseDomain,
          ttl: this.config.ttl,
        });
        break;
      }
      case "wildcard": {
        this.providerInstance = new WildcardProvider({
          baseDomain: this.config.baseDomain,
          routesFile: this.config.wildcard?.routesFile,
        });
        break;
      }
      case "local": {
        const local = this.config.local;
        if (!local) {
          throw new Error("Local provider requires config.local");
        }
        this.providerInstance = new LocalProvider({
          baseDomain: this.config.baseDomain,
          mode: local.mode,
          hostsFile: local.hostsFile,
          dnsPort: local.dnsPort,
          defaultIp: local.defaultIp,
          allowSudo: local.allowSudo,
          ttl: this.config.ttl,
        });
        break;
      }
      default:
        const unreachable: never = provider;
        throw new Error(`Unsupported provider: ${String(unreachable)}`);
    }
    return this.providerInstance;
  }

  private requireEnvironment(env: string): EnvironmentConfig {
    const config = this.config.environments[env];
    if (!config) {
      throw new Error(`Environment ${env} not found in DNS config`);
    }
    return config;
  }

  private fqdn(subdomain: string): string {
    if (!subdomain) {
      return this.config.baseDomain;
    }
    return `${subdomain}.${this.config.baseDomain}`;
  }

  private resolveTtl(envConfig: EnvironmentConfig): number | undefined {
    return envConfig.ttl ?? this.config.ttl;
  }

  private async ensureWildcardCertificate(): Promise<void> {
    const sslConfig = this.config.ssl ?? {};
    const certDir = sslConfig.certDir ?? "/etc/orion/certs";
    const wildcardDomain = `*.${this.config.baseDomain}`;
    const keyPath = path.join(certDir, `${this.config.baseDomain}.key`);
    const certPath = path.join(certDir, `${this.config.baseDomain}.crt`);

    const exists = await this.certificateExists(keyPath, certPath);
    if (exists) {
      return;
    }

    console.log(`🔐 Generating wildcard certificate for ${wildcardDomain}`);
    await mkdir(certDir, { recursive: true });

    if (sslConfig.certbotCommand) {
      await this.runCertbot(certDir, wildcardDomain, sslConfig);
    } else {
      console.warn(
        `⚠️  Wildcard certificate missing for ${wildcardDomain}. Provide ssl.certbotCommand or install manually.`
      );
    }
  }

  private async certificateExists(keyPath: string, certPath: string): Promise<boolean> {
    try {
      await Promise.all([access(keyPath), access(certPath)]);
      return true;
    } catch {
      return false;
    }
  }

  private runCertbot(certDir: string, wildcardDomain: string, sslConfig: SslConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const email = sslConfig.email ?? process.env.ORION_SSL_EMAIL;
      const args = [
        "certonly",
        "--manual",
        "--preferred-challenges",
        "dns",
        "--agree-tos",
        "--manual-public-ip-logging-ok",
        "--non-interactive",
        "--config-dir",
        certDir,
        "--work-dir",
        certDir,
        "--logs-dir",
        certDir,
        "-d",
        wildcardDomain,
      ];
      if (email) {
        args.push("--email", email);
      } else {
        args.push("--register-unsafely-without-email");
      }
      if (sslConfig.extraArgs?.length) {
        args.push(...sslConfig.extraArgs);
      }
      const command = sslConfig.certbotCommand ?? "certbot";
      const child = spawn(command, args, { stdio: "inherit" });
      child.on("exit", (code) => {
        if (code === 0) {
          console.log(`✅ Certificate issued for ${wildcardDomain}`);
          resolve();
        } else {
          reject(new Error(`certbot exited with code ${code}`));
        }
      });
      child.on("error", (error) => reject(error));
    });
  }
}
