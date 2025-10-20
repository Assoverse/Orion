import { fetch } from "undici";
import { DnsProvider, DnsRecordSummary } from "./DnsProvider.js";

interface DigitalOceanProviderOptions {
  token: string;
  baseDomain: string;
  ttl?: number;
}

interface DigitalOceanRecord {
  id: number;
  type: string;
  name: string;
  data: string;
  ttl: number;
}

export class DigitalOceanProvider implements DnsProvider {
  private readonly apiBase = "https://api.digitalocean.com/v2";

  constructor(private readonly options: DigitalOceanProviderOptions) {}

  async create(subdomain: string, ip: string, ttl?: number): Promise<void> {
    const recordName = this.normalizeName(subdomain);
    const response = await fetch(
      `${this.apiBase}/domains/${this.options.baseDomain}/records`,
      {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          type: "A",
          name: recordName,
          data: ip,
          ttl: ttl ?? this.options.ttl ?? 300,
        }),
      }
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `DigitalOcean create failed (${response.status}): ${body}`
      );
    }
  }

  async delete(subdomain: string): Promise<void> {
    const records = await this.list();
    const name = this.normalizeName(subdomain);
    const matches = records.filter((record) => record.name === name);
    for (const record of matches) {
      if (!record.id) continue;
      const response = await fetch(
        `${this.apiBase}/domains/${this.options.baseDomain}/records/${record.id}`,
        {
          method: "DELETE",
          headers: this.headers(),
        }
      );
      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          `DigitalOcean delete failed (${response.status}): ${body}`
        );
      }
    }
  }

  async list(): Promise<DnsRecordSummary[]> {
    const response = await fetch(
      `${this.apiBase}/domains/${this.options.baseDomain}/records?per_page=200`,
      {
        method: "GET",
        headers: this.headers(),
      }
    );
    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `DigitalOcean list failed (${response.status}): ${body}`
      );
    }
    const data = (await response.json()) as {
      domain_records: DigitalOceanRecord[];
    };
    return data.domain_records
      .filter((record) => record.type === "A")
      .map((record) => ({
        id: String(record.id),
        name: record.name,
        type: record.type,
        value: record.data,
        ttl: record.ttl,
      }));
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.options.token}`,
      "Content-Type": "application/json",
    };
  }

  private normalizeName(subdomain: string): string {
    if (!subdomain || subdomain === "@") {
      return "@";
    }
    return subdomain;
  }
}
