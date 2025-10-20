<p align="center">
  <img src="../../assets/Orion-logo_nobg.png" alt="Orion logo" width="200" />
</p>

# Orion DNS Providers

## DigitalOcean
- REST API v2: `POST /v2/domains/:domain/records`
- Auth: `Authorization: Bearer <token>`
- Payload:
  ```json
  { "type": "A", "name": "dev", "data": "1.2.3.4", "ttl": 300 }
  ```
- `delete` looks up the record ID and issues `DELETE /records/:id`.

## Cloudflare
- Endpoint: `POST https://api.cloudflare.com/client/v4/zones/:zoneId/dns_records`
- Auth: `Authorization: Bearer <token>`
- Payload:
  ```json
  { "type": "A", "name": "dev.example.com", "content": "1.2.3.4", "ttl": 120, "proxied": false }
  ```
- `delete` uses `DELETE .../dns_records/:id` after listing records.

## AWS Route53
- Client: `@aws-sdk/client-route-53` (v3)
- Primary command: `ChangeResourceRecordSetsCommand` (`UPSERT` to create/update, `DELETE` to remove)
- Listing: `ListResourceRecordSetsCommand` filtered by type `A`

## Wildcard provider
- No external DNS. Stores routes in a JSON file (`routes.json`) consumed by the Orion proxy.
- Example:
  ```json
  {
    "dev.assoverse.app": "137.184.55.12",
    "staging.assoverse.app": "137.184.55.13"
  }
  ```

## Local provider
- Designed for `*.orion` or local development environments.
- Two modes:
  1. `hosts` – updates `hostsFile` (default `/etc/hosts`, optional sudo escalation).
  2. `dns-server` – runs a local DNS server (`dns2`) on `dnsPort` (5353 by default).
- `list` returns managed entries.
- Example config:
  ```yaml
  dns:
    provider: local
    baseDomain: orion
    local:
      mode: dns-server
      dnsPort: 5353
      defaultIp: 127.0.0.1
    environments:
      dev:
        subdomain: dev
        ip: 127.0.0.1
  ```

## SSL automation
- `autoSSL: true` calls `ensureWildcardCertificate`.
- Checks for `example.com.key` and `example.com.crt` inside `ssl.certDir` (`/etc/orion/certs` by default).
- Can execute `certbot` via `ssl.certbotCommand`.

## Common errors
- Missing credentials: the manager throws an explicit error.
- Invalid token: provider returns the API error body (surfaced via `response.text()` for debugging).
- Existing records: `create` performs an `UPSERT` (Route53) or relies on provider errors (DigitalOcean/Cloudflare).
