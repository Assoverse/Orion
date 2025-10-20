<p align="center">
  <img src="../../assets/Orion-logo_nobg.png" alt="Orion logo" width="200" />
</p>

# @orion/dns-manager

Multi-provider DNS automation for Orion. The package exposes a unified API to create, delete, and synchronise subdomains per environment (dev, staging, prod) with built-in providers: DigitalOcean, Cloudflare, AWS Route53, wildcard proxy, and local DNS. Optional wildcard SSL automation is included.

## Installation

```bash
pnpm add @orion/dns-manager
```

## Configuration

Declare environments in `orion.config.yaml`:

```yaml
dns:
  provider: digitalocean            # cloudflare | aws | wildcard | local
  baseDomain: assoverse.app
  autoSSL: true
  ttl: 300
  ssl:
    certDir: /etc/orion/certs
    certbotCommand: certbot
    email: ops@assoverse.app
  wildcard:
    routesFile: .orion/routes.json
  local:
    mode: hosts
    hostsFile: ./tmp/hosts
  credentials:
    digitalocean:
      token: ${DO_API_TOKEN}
    cloudflare:
      zoneId: ${CF_ZONE_ID}
      token: ${CF_API_TOKEN}
    aws:
      zoneId: ${AWS_ZONE_ID}
      accessKeyId: ${AWS_ACCESS_KEY_ID}
      secretAccessKey: ${AWS_SECRET_ACCESS_KEY}
  environments:
    dev:
      subdomain: dev
      ip: 137.184.55.12
    staging:
      subdomain: staging
      ip: 137.184.55.13
    prod:
      subdomain: ""
      ip: 137.184.55.14
```

## Usage

```ts
import { DnsManager } from "@orion/dns-manager";
import { loadConfig } from "@orion/config";

const config = await loadConfig("orion.config.yaml");
const dnsManager = new DnsManager(config.dns);

await dnsManager.createRecord("dev");
await dnsManager.listRecords();
await dnsManager.syncAll();
await dnsManager.deleteRecord("staging");
```

Console output:

```
✅ Created subdomain dev.assoverse.app
🗑️ Deleted record staging.assoverse.app
```

## Supported providers

- **DigitalOcean** – REST API v2 for A records.
- **Cloudflare** – DNS records API with optional `proxied` flag.
- **AWS Route53** – AWS SDK v3 using `ChangeResourceRecordSets`.
- **Wildcard** – No external DNS; writes `routes.json` for Orion’s proxy.
- **Local** – Manages `*.orion` via `/etc/hosts` or a local DNS server (`dns2`).

## Automatic SSL

When `autoSSL: true`, the manager checks for an existing wildcard certificate (`*.domain.com`) in `ssl.certDir`. If missing, it can invoke `certbot` (configurable command) or warn the operator.

## Tests

```bash
pnpm --filter @orion/dns-manager test
```

## Roadmap

- Per-environment TTL overrides.
- Automatic preview domains per Git branch.
- Local record caching.
- GitHub webhook integration for ephemeral domains.
