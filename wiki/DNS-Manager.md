<p align="center">
  <img src="../assets/Orion-logo_nobg.png" alt="Orion logo" width="200" />
</p>

# DNS Manager

The `@orion/dns-manager` package automates DNS provisioning for Orion-managed services across multiple providers.

## Supported Providers

- DigitalOcean
- Cloudflare
- AWS Route53
- Wildcard proxy (writes to JSON + reverse proxy)
- Local DNS (hosts file or lightweight DNS server)

## Configuration Example

```yaml
dns:
  provider: digitalocean
  baseDomain: example.com
  ttl: 300
  autoSSL: true
  credentials:
    digitalocean:
      token: ${DO_API_TOKEN}
  wildcard:
    routesFile: .orion/routes.json
  local:
    mode: hosts
    hostsFile: ./tmp/hosts
```

Store provider credentials as environment variables referenced in the config.

## Capabilities

- `create`: register A/AAAA/CNAME records for services and environments.
- `delete`: clean up DNS records when services are removed.
- `list/sync`: reconcile state between desired entries and provider records.
- `ensure wildcard cert`: optional integration with certbot to manage TLS.

## Workflow

1. Configure DNS section in `orion.yaml`.
2. Apply with `orion apply -f orion.yaml`.
3. DNS manager controllers reconcile records whenever services scale up/down.

## Local Development

- Use the `local` provider to write entries into `/etc/hosts` or a development DNS file.
- Pair with reverse proxies (Caddy, Traefik) via the wildcard proxy provider.

## Roadmap

- Automated certificate deployment to agents.
- Pluggable interface to support additional providers (GCP, Azure DNS).
- UI integration in the dashboard for DNS status.
