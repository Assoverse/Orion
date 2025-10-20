<p align="center">
  <img src="../../assets/Orion-logo_nobg.png" alt="Orion logo" width="200" />
</p>

# Orion DNS Manager – Architecture

```mermaid
graph TD
  OrionConfig[orion.config.yaml] -->|load| DnsManager
  subgraph Providers
    DigitalOcean
    Cloudflare
    Route53[AWS Route53]
    WildcardProxy[Wildcard Proxy]
    LocalDNS[Local DNS]
  end
  DnsManager -->|create/delete/list| Providers
  DnsManager -->|syncAll| Providers
  DnsManager -->|ensure wildcard cert| Certbot[Let’s Encrypt / certbot]
  WildcardProxy --> RoutesFile[routes.json]
  LocalDNS --> HostsFile[/etc/hosts]
  LocalDNS --> DnsServer[dns2 server]
```

## Execution flow

1. `DnsManager` reads the `dns` section from `orion.config.yaml`.
2. Depending on `provider`, it instantiates DigitalOcean, Cloudflare, AWS Route53, Wildcard, or Local providers.
3. `createRecord` and `deleteRecord` delegate to the selected provider.
4. `syncAll` iterates through environments (`dev`, `staging`, `prod`, …) and ensures records exist.
5. When `autoSSL: true`, the manager checks `ssl.certDir` for a wildcard certificate and can invoke `certbot` if missing.
6. The Wildcard provider writes a JSON routing table consumed by the Orion proxy.
7. The Local provider updates `/etc/hosts` (hosts mode) or starts a DNS server (`dns2`) in `dns-server` mode.

## Key components

- **DnsManager** – High-level façade handling logging, orchestration, and optional SSL automation.
  - `createRecord`, `deleteRecord`, `listRecords`, `syncAll`
  - `ensureWildcardCertificate` for auto SSL
- **Providers** – Implement the `create`, `delete`, and `list` contract per platform.
- **Configuration** – `orion.config.yaml` centralises provider selection, credentials, environments, TTL, and SSL flags.
- **SSL Automation** – Pluggable wrapper around `certbot` (or future ACME clients).

## Security & observability

- API tokens are loaded from `dns.credentials` or environment variables.
- Explicit log markers (`✅`, `🗑️`, `⚠️`) highlight operations.
- Future enhancements include tracing, metrics collection, and audit trails.
