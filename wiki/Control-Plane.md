<p align="center">
  <img src="../assets/Orion-logo_nobg.png" alt="Orion logo" width="200" />
</p>

# Control Plane & API

The control plane is the heart of Orion. It exposes REST and WebSocket interfaces, persists desired state, and drives reconciliation loops.

## Responsibilities

- Accept new configurations (`POST /api/apply`) and validate them.
- Persist desired state to SQLite (default) or MongoDB.
- Schedule replicas across connected agents.
- Issue launch/stop commands over WebSocket.
- Expose cluster state for CLI and dashboard consumers.

## REST API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Liveness/readiness probe returning `{ "status": "ok" }`. |
| `/api/services` | GET | Returns `{ items: ServiceRecord[] }` describing desired & observed state. |
| `/api/nodes` | GET | Returns `{ items: NodeRecord[] }` for connected agents. |
| `/api/apply` | POST | Accepts an `OrionConfig` payload and triggers reconciliation. |

All responses are JSON. Future versions will add JWT-based authentication and RBAC scopes.

## WebSocket Gateway

- Path: `ws://<api-host>/ws`
- Agents authenticate via a handshake (`hello` message) including node metadata.
- Heartbeats are streamed every ~5 seconds with CPU/memory info.
- Command messages (`launch`, `stop`, `update`) are pushed to agents as the scheduler reconciles state.

### Message Formats

| Direction | Type | Payload |
|-----------|------|---------|
| Agent → API | `hello` | `{ nodeId, name, address, labels }` |
| Agent → API | `heartbeat` | `{ timestamp, metrics: { cpu, memory } }` |
| Agent → API | `status` (planned) | `{ service, replicaId, state }` |
| API → Agent | `launch` | `{ service, replicaId }` |
| API → Agent | `stop` (planned) | `{ serviceName, replicaId }` |
| API → Agent | `update` (future) | `{ serviceName, config }` |

## Persistence Layer

- **SQLite**: default embedded database (`.orion/state.sqlite`) suited for local and small deployments.
- **MongoDB**: target datastore for larger clusters; see roadmap for supported migrations.

## Scheduler

- Current strategy: round-robin assignment over available nodes/agents.
- Planned enhancements: resource weighting, labels/affinity, warm pools, failure domains.

## Controllers

- **Service Controller**: ensures desired replicas exist; reconciles updates and restarts.
- **Job Controller** (roadmap): supports one-off tasks.
- **Plugin Controller**: wires lifecycle hooks and optional background workers.

## Observability

- REST endpoints power the dashboard’s polling mode today.
- Upcoming features: WebSocket streaming for dashboard metrics, structured events, and integration hooks.
