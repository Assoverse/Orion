<p align="center">
  <img src="../assets/Orion-logo_nobg.png" alt="Orion logo" width="200" />
</p>

# Dashboard

The Orion dashboard is a Next.js 14 + Tailwind application that surfaces live cluster insights.

## Launching

```bash
scripts/dev.sh          # starts control plane, agent, dashboard
# or
pnpm --filter @orion/dashboard dev
```

By default the dashboard is available on http://localhost:3000.

## Key Views

- **Cluster Overview**: summary of services, nodes, and recent events.
- **Services**: table with desired vs actual replicas, runtime, and ports.
- **Nodes**: connected agents with labels, heartbeat timestamps, and reported metrics.
- **Logs (roadmap)**: live streaming of stdout/stderr per service replica.

## Data Sources

- Polls `/api/services` and `/api/nodes` from the control plane.
- WebSocket streaming is planned for near-real-time updates without polling.

## Configuration

- Tailwind for styling with design tokens defined in `packages/dashboard/tailwind.config.ts`.
- Environment variables (e.g., `NEXT_PUBLIC_ORION_API_URL`) control target APIs.

## Customization Ideas

- Add custom dashboards per environment via dynamic routes.
- Embed plugin metrics panels (Prometheus, Grafana) via iframes or API integration.
- Extend with authentication once RBAC lands in the control plane.
