import {
  ChangeResourceRecordSetsCommand,
  ListResourceRecordSetsCommand,
  Route53Client,
  type ResourceRecordSet,
} from "@aws-sdk/client-route-53";
import { DnsProvider, DnsRecordSummary } from "./DnsProvider.js";

interface AwsRoute53ProviderOptions {
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
  zoneId: string;
  baseDomain: string;
  ttl?: number;
}

export class AwsRoute53Provider implements DnsProvider {
  private client: Route53Client;

  constructor(private readonly options: AwsRoute53ProviderOptions) {
    this.client = new Route53Client({
      region: options.region ?? "us-east-1",
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      },
    });
  }

  async create(subdomain: string, ip: string, ttl?: number): Promise<void> {
    const record: ResourceRecordSet = {
      Name: this.fqdn(subdomain),
      Type: "A",
      TTL: ttl ?? this.options.ttl ?? 300,
      ResourceRecords: [{ Value: ip }],
    };

    await this.client.send(
      new ChangeResourceRecordSetsCommand({
        HostedZoneId: this.options.zoneId,
        ChangeBatch: {
          Changes: [
            {
              Action: "UPSERT",
              ResourceRecordSet: record,
            },
          ],
        },
      })
    );
  }

  async delete(subdomain: string): Promise<void> {
    const records = await this.listRecordsInternal();
    const fqdn = this.fqdn(subdomain);
    const record = records.find(
      (item) => item.Name === fqdn && item.Type === "A"
    );
    if (!record) {
      return;
    }

    await this.client.send(
      new ChangeResourceRecordSetsCommand({
        HostedZoneId: this.options.zoneId,
        ChangeBatch: {
          Changes: [
            {
              Action: "DELETE",
              ResourceRecordSet: {
                ...record,
              },
            },
          ],
        },
      })
    );
  }

  async list(): Promise<DnsRecordSummary[]> {
    const records = await this.listRecordsInternal();
    return records.map((record) => ({
      name: (record.Name ?? this.options.baseDomain).replace(/\.$/, ""),
      type: record.Type ?? "A",
      value: record.ResourceRecords?.[0]?.Value ?? "",
      ttl: record.TTL ?? this.options.ttl,
    }));
  }

  private async listRecordsInternal(): Promise<ResourceRecordSet[]> {
    const result = await this.client.send(
      new ListResourceRecordSetsCommand({
        HostedZoneId: this.options.zoneId,
        MaxItems: 100,
      })
    );
    return (result.ResourceRecordSets ?? []).filter(
      (record) => (record.Type ?? "") === "A"
    );
  }

  private fqdn(subdomain: string): string {
    const base = this.options.baseDomain.endsWith(".")
      ? this.options.baseDomain
      : `${this.options.baseDomain}.`;
    if (!subdomain) {
      return base;
    }
    return `${subdomain}.${base}`;
  }
}
