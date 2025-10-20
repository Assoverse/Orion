import { fetch } from "undici";
import { DnsProvider, DnsRecordSummary } from "./DnsProvider.js";

interface CloudflareProviderOptions {
  token: string;
  zoneId: string;
  baseDomain: string;
  ttl?: number;
  proxied?: boolean;
}

interface CloudflareRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
}

export class CloudflareProvider implements DnsProvider {
  private readonly apiBase = "https://api.cloudflare.com/client/v4";

  constructor(private readonly options: CloudflareProviderOptions) {}

  async create(subdomain: string, ip: string, ttl?: number): Promise<void> {
    const name = this.fqdn(subdomain);
    const response = await fetch(
      `${this.apiBase}/zones/${this.options.zoneId}/dns_records`,
      {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          type: "A",
          name,
          content: ip,
          ttl: ttl ?? this.options.ttl ?? 300,
          proxied: this.options.proxied ?? false,
        }),
      }
    );
    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Cloudflare create failed (${response.status}): ${body}`
      );
    }
  }

  async delete(subdomain: string): Promise<void> {
    const records = await this.list();
    const targetName = this.fqdn(subdomain);
    const matches = records.filter((record) => record.name === targetName);
    for (const record of matches) {
      if (!record.id) continue;
      const response = await fetch(
        `${this.apiBase}/zones/${this.options.zoneId}/dns_records/${record.id}`,
        {
          method: "DELETE",
          headers: this.headers(),
        }
      );
      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          `Cloudflare delete failed (${response.status}): ${body}`
        );
      }
    }
  }

  async list(): Promise<DnsRecordSummary[]> {
    const response = await fetch(
      `${this.apiBase}/zones/${this.options.zoneId}/dns_records?per_page=200&type=A`,
      {
        method: "GET",
        headers: this.headers(),
      }
    );
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Cloudflare list failed (${response.status}): ${body}`);
    }
    const data = (await response.json()) as { result: CloudflareRecord[] };
    return data.result.map((record) => ({
      id: record.id,
      name: record.name,
      type: record.type,
      value: record.content,
      ttl: record.ttl,
    }));
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.options.token}`,
      "Content-Type": "application/json",
    };
  }

  private fqdn(subdomain: string): string {
    if (!subdomain) {
      return this.options.baseDomain;
    }
    return `${subdomain}.${this.options.baseDomain}`;
  }
}
