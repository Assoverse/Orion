export interface DnsRecordSummary {
  id?: string;
  name: string;
  type: string;
  value: string;
  ttl?: number;
}

export interface DnsProvider {
  create(subdomain: string, ip: string, ttl?: number): Promise<void>;
  delete(subdomain: string): Promise<void>;
  list(): Promise<DnsRecordSummary[]>;
}

export type ProviderContext = {
  baseDomain: string;
};
