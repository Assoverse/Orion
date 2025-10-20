<p align="center">
  <img src="../assets/Orion-logo_nobg.png" alt="Orion logo" width="200" />
</p>

# Orion Architecture

```mermaid
graph TD
  subgraph Control Plane
    API[API Server (Fastify)] --> Scheduler
    Scheduler --> ControllerManager[Controller Manager]
    ControllerManager --> StateStore[(SQLite/MongoDB)]
  end

  subgraph Node Agent
    Agent[Orion Agent]
    ServiceRunner[Service Runner]
  end

  CLI[Orion CLI] --> API
  Dashboard[Next.js Dashboard] --> API
  Agent -->|WebSocket| API
  API -->|Events/Commands| Agent
  Agent --> ServiceRunner
  ServiceRunner --> Apps[Node/Bun/Deno Services]

  subgraph Developers
    Devs[(JS Developers)] --> CLI
    Devs --> Dashboard
  end
```

## Components

- **API Server** – Fastify + WebSocket (SSE) serving REST endpoints for `apply`, `get services/nodes`, and a real-time channel for agents and dashboard.
- **Scheduler** – Round-robin placement with awareness of declared resources.
- **Controller Manager** – Reconciliation loops (services → replicas, jobs, health checks).
- **State Store** – SQLite by default (`.orion/state.sqlite`) with a path to MongoDB.
- **Agent** – Node 20+ daemon; WebSocket client emitting heartbeats/metrics and launching child processes.
- **CLI** – Commander-based interface for applying configs, inspecting resources, streaming logs (coming soon), executing commands, and launching the dashboard.
- **Dashboard** – Next.js + Tailwind UI consuming REST APIs (and future WebSocket streaming).

## Workflow: apply → run

1. `orion apply -f orion.yaml` loads the configuration and validates it via the shared Zod schema.
2. `POST /api/apply` persists the desired state to SQLite and triggers reconciliation.
3. The scheduler produces assignments (service ↔ node ↔ replica).
4. Launch events are pushed to agents over WebSocket.
5. Agents spawn the requested processes (Node/Bun/Deno), monitor health, and send heartbeats.
6. The dashboard polls/streams service and node state for live visualisation.

## Extensibility

- **Plugins** – Hook system (`beforeStart`, `afterDeploy`, `onFailure`, etc.) planned for the control plane.
- **Federation** – Multiple control planes can federate through a central Orion API.
- **Serverless** – Policies for cron/queue/HTTP triggers; agents can spin workloads up and down.

## Security

- Planned JWT auth + RBAC (Admin / Developer / ReadOnly) on API endpoints.
- TLS (wss://) recommended for production control plane ↔ agent communication.
