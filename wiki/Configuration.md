<p align="center">
  <img src="../assets/Orion-logo_nobg.png" alt="Orion logo" width="200" />
</p>

# Configuration Reference

Orion uses a declarative YAML document (default: `orion.yaml`) to describe services, nodes, plugins, and environment metadata. Every deployment starts by applying this configuration via the CLI.

## Top-Level Schema

```yaml
apiVersion: orion/v1
kind: Config
metadata:
  name: local-demo
  environment: dev
spec:
  services: []
  nodes: []
  plugins: []
  dns: {}
```

### `metadata`

- `name`: Cluster or workload identifier (surfaced in dashboard + API).
- `environment`: Free-form string (e.g., `dev`, `staging`, `prod`) used for grouping.

### `spec.services[]`

Each service entry describes how Orion should launch and supervise a process.

| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✅ | Unique identifier within the configuration. |
| `path` | ✅ | Relative path to the project directory. |
| `entry` | ✅ (for Node/Bun) | Entry file executed by Node.js. |
| `type` | Optional | Special runtimes (e.g., `nextjs`) for tailored hooks. |
| `runtime` | ✅ | `node`, `bun`, or `deno`. |
| `command` | Optional | Custom command (e.g., `pnpm dev`). Overrides default entry. |
| `replicas` | ✅ | Number of desired instances. |
| `env` | Optional | Map of environment variables. |
| `ports[]` | Optional | Named ports for HTTP/TCP exposure. |
| `hooks` | Optional | Lifecycle hooks backed by plugins. |

Example service:

```yaml
- name: api-users
  path: ./services/api-users
  entry: src/index.ts
  runtime: node
  replicas: 2
  env:
    NODE_ENV: production
  ports:
    - name: http
      port: 8080
```

### `spec.nodes[]`

Describe static targets when you want to pin agents to known machines.

```yaml
- name: node-01
  labels:
    region: eu-west
    capacity: high
```

If omitted, Orion schedules across any agent that connects.

### `spec.plugins[]`

List of plugin package names to load. Hooks can be referenced in services:

```yaml
plugins:
  - @orion/plugin-monitoring
services:
  - name: api
    hooks:
      beforeStart: monitoring:register
      onFailure: monitoring:alert
```

### `spec.dns`

Optional DNS automation declaration:

```yaml
dns:
  provider: cloudflare           # digitalocean | aws | wildcard | local
  baseDomain: example.com
  ttl: 300
  autoSSL: true
  credentials:
    cloudflare:
      zoneId: ${CF_ZONE_ID}
      token: ${CF_API_TOKEN}
```

## Validation

- `@orion/shared` ships a Zod schema (`configSchema`) used by both the CLI and control plane.
- Invalid configs fail fast in the CLI before contacting the API.
- Runtime errors are surfaced via CLI output, dashboard status, and future events.

## Tips

- Keep environment-specific overrides in separate files (e.g., `orion.dev.yaml`, `orion.prod.yaml`).
- Combine with `.env` and `env:` entries for secrets; future versions will integrate with secret stores.
- Use labels on services and nodes to prepare for advanced schedulers and affinity rules.
