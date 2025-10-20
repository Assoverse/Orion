import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sudoPrompt from "sudo-prompt";
import dns from "dns2";
import { DnsProvider, DnsRecordSummary } from "./DnsProvider.js";

interface LocalProviderOptions {
  baseDomain: string;
  mode: "hosts" | "dns-server";
  hostsFile?: string;
  dnsPort?: number;
  defaultIp?: string;
  allowSudo?: boolean;
  ttl?: number;
}

type HostsEntry = {
  ip: string;
  host: string;
};

const START_MARKER = "# >>> Orion DNS Manager START";
const END_MARKER = "# <<< Orion DNS Manager END";

export class LocalProvider implements DnsProvider {
  private readonly hostsFile: string;
  private readonly dnsPort: number;
  private readonly records = new Map<string, { ip: string; ttl?: number }>();
  private server?: ReturnType<typeof dns.createServer>;

  constructor(private readonly options: LocalProviderOptions) {
    this.hostsFile =
      options.hostsFile ??
      (process.platform === "win32"
        ? path.join(
            process.env.SystemRoot ?? "C:\\Windows",
            "System32",
            "drivers",
            "etc",
            "hosts"
          )
        : "/etc/hosts");
    this.dnsPort = options.dnsPort ?? 5353;
  }

  async create(subdomain: string, ip: string, ttl?: number): Promise<void> {
    const hostname = this.fqdn(subdomain);
    if (this.options.mode === "hosts") {
      await this.ensureHostsEntry(hostname, ip);
    } else {
      this.records.set(this.normalizeName(hostname), { ip, ttl });
      await this.ensureDnsServer();
    }
  }

  async delete(subdomain: string): Promise<void> {
    const hostname = this.fqdn(subdomain);
    if (this.options.mode === "hosts") {
      await this.removeHostsEntry(hostname);
    } else {
      this.records.delete(this.normalizeName(hostname));
    }
  }

  async list(): Promise<DnsRecordSummary[]> {
    if (this.options.mode === "hosts") {
      const entries = await this.readHostsEntries();
      return entries
        .filter((entry) => entry.host.endsWith(this.options.baseDomain))
        .map((entry) => ({
          name: entry.host,
          type: "A",
          value: entry.ip,
        }));
    }
    return Array.from(this.records.entries()).map(([name, record]) => ({
      name,
      type: "A",
      value: record.ip,
      ttl: record.ttl ?? this.options.ttl,
    }));
  }

  private fqdn(subdomain: string): string {
    if (!subdomain) {
      return this.options.baseDomain;
    }
    return `${subdomain}.${this.options.baseDomain}`;
  }

  private async ensureHostsEntry(hostname: string, ip: string) {
    const entries = await this.readHostsEntries();
    const filtered = entries.filter((entry) => entry.host !== hostname);
    filtered.push({ ip, host: hostname });
    await this.writeHostsEntries(filtered);
  }

  private async removeHostsEntry(hostname: string) {
    const entries = await this.readHostsEntries();
    const filtered = entries.filter((entry) => entry.host !== hostname);
    await this.writeHostsEntries(filtered);
  }

  private async readHostsEntries(): Promise<HostsEntry[]> {
    const file = await this.readHostsFile();
    const managedBlock = this.extractManagedBlock(file);
    if (!managedBlock) {
      return [];
    }
    return managedBlock
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .flatMap((line) => {
        const parts = line.split(/\s+/);
        if (parts.length < 2) return [];
        const [ip, ...hosts] = parts;
        return hosts.map((host) => ({ ip, host }));
      });
  }

  private async writeHostsEntries(entries: HostsEntry[]) {
    const grouped = new Map<string, string[]>();
    for (const entry of entries) {
      const hosts = grouped.get(entry.ip) ?? [];
      hosts.push(entry.host);
      grouped.set(entry.ip, hosts);
    }
    const managedLines = Array.from(grouped.entries()).map(
      ([ip, hosts]) => `${ip} ${hosts.join(" ")} # Orion DNS`
    );
    const content = await this.readHostsFile();
    const unmanaged = this.removeManagedBlock(content);
    const newBlock =
      managedLines.length === 0
        ? ""
        : `${START_MARKER}\n# Managed by Orion DNS Manager\n${managedLines.join(
            "\n"
          )}\n${END_MARKER}`;
    const nextContent = [unmanaged.trimEnd(), newBlock]
      .filter(Boolean)
      .join("\n\n")
      .concat("\n");

    try {
      await writeFile(this.hostsFile, nextContent, "utf-8");
    } catch (error) {
      if (
        (error as NodeJS.ErrnoException).code === "EACCES" &&
        this.options.allowSudo !== false &&
        !this.options.hostsFile
      ) {
        await this.writeHostsWithSudo(nextContent);
        return;
      }
      throw error;
    }
  }

  private async readHostsFile(): Promise<string> {
    try {
      return await readFile(this.hostsFile, "utf-8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        await this.ensureHostsDir();
        return "";
      }
      throw error;
    }
  }

  private async ensureHostsDir() {
    const dir = path.dirname(this.hostsFile);
    await mkdir(dir, { recursive: true });
  }

  private extractManagedBlock(content: string): string | null {
    const start = content.indexOf(START_MARKER);
    const end = content.indexOf(END_MARKER);
    if (start === -1 || end === -1 || end < start) {
      return null;
    }
    return content.slice(start + START_MARKER.length, end).trim();
  }

  private removeManagedBlock(content: string): string {
    const start = content.indexOf(START_MARKER);
    const end = content.indexOf(END_MARKER);
    if (start === -1 || end === -1 || end < start) {
      return content;
    }
    const before = content.slice(0, start).trimEnd();
    const after = content.slice(end + END_MARKER.length).trimStart();
    return [before, after].filter(Boolean).join("\n\n");
  }

  private async writeHostsWithSudo(content: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const command = `cat <<'EOF' | tee ${this.hostsFile} >/dev/null\n${content}\nEOF`;
      sudoPrompt.exec(
        command,
        { name: "Orion DNS Manager" },
        (error, _stdout, stderr) => {
          if (error) {
            reject(
              new Error(`Failed to update hosts file with sudo: ${stderr}`)
            );
          } else {
            resolve();
          }
        }
      );
    });
  }

  private async ensureDnsServer() {
    if (this.server) {
      return;
    }
    const server = dns.createServer(
      (request, send, _rinfo) => {
        const [question] = request.questions ?? [];
        if (!question) {
          const empty = dns.Packet.createResponseFromRequest(request);
          send(empty);
          return;
        }
        const hostname = this.normalizeName(question.name);
        const record = this.records.get(hostname) ?? this.records.get("*");
        const response = dns.Packet.createResponseFromRequest(request);
        if (record) {
          response.answers.push({
            name: question.name,
            type: dns.Packet.TYPE.A,
            class: dns.Packet.CLASS.IN,
            ttl: record.ttl ?? this.options.ttl ?? 60,
            address: record.ip,
          });
        } else if (this.options.defaultIp) {
          response.answers.push({
            name: question.name,
            type: dns.Packet.TYPE.A,
            class: dns.Packet.CLASS.IN,
            ttl: this.options.ttl ?? 60,
            address: this.options.defaultIp,
          });
        }
        send(response);
      }
    );

    this.server = server;
    await new Promise<void>((resolve, reject) => {
      server.on("listening", () => resolve());
      server.on("error", (error: unknown) => reject(error));
      server.listen(this.dnsPort);
    });
  }

  private normalizeName(name: string): string {
    return name.replace(/\.$/, "").toLowerCase();
  }
}
