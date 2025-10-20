<p align="center">
  <img src="../assets/Orion-logo_nobg.png" alt="Orion logo" width="200" />
</p>

# Orion API

## REST endpoints

### `GET /health`
- **200** `{ "status": "ok" }`
- Used for readiness/liveness probes.

### `GET /api/services`
- **200** `{ items: ServiceRecord[] }`
- Each `ServiceRecord` contains `id`, `name`, `replicas`, `status`, `env`, `ports`, `hooks`, and autoscaling metadata.

### `GET /api/nodes`
- **200** `{ items: NodeRecord[] }`
- Reports connected agents with heartbeat info.

### `POST /api/apply`
- **Body**: `OrionConfig` (see `@orion/shared` → `configSchema`).
- **202** `{ "status": "accepted" }`
- Validates and persists configuration, then triggers reconciliation.

## WebSocket

### Endpoint
`GET ws://<api-host>/ws`

### Agent → control plane messages

| Type        | Payload                                      | Description                               |
|-------------|----------------------------------------------|-------------------------------------------|
| `hello`     | `{ nodeId, name, address, labels }`          | Initial handshake / registration          |
| `heartbeat` | `{ timestamp, metrics: { cpu, memory } }`    | Sent every 5 seconds with metrics         |
| `status`    | `{ service, replicaId, state }`              | Replica lifecycle updates (planned)       |

### Control plane → agent messages

| Type     | Payload                               | Description                   |
|----------|---------------------------------------|-------------------------------|
| `launch` | `{ service, replicaId }`               | Start a replica on the agent  |
| `stop`   | `{ serviceName, replicaId }` *(todo)* | Stop a replica                |
| `update` | `{ serviceName, config }` *(future)*  | Push config updates/hooks     |

## SDK (planned)

- `@orion/sdk` will provide a typed client targeting REST + WebSocket APIs.
- JWT auth & RBAC scopes will secure production deployments.
