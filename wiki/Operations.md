<p align="center">
  <img src="../assets/Orion-logo_nobg.png" alt="Orion logo" width="200" />
</p>

# Operations Playbook

This playbook covers day‑2 operations for running Orion clusters beyond local development.

## Deployment Modes

- **Single-node lab**: control plane + agent on one machine (default `scripts/dev.sh`).
- **Multi-node**: run control plane on a central host; install agents on worker machines pointing at the API URL.
- **Hybrid cloud**: combine cloud VMs with on-premise agents using secure tunnels.

## Control Plane Deployment

1. Build the control plane package:
   ```bash
   pnpm --filter @orion/core build
   ```
2. Configure environment variables (`ORION_PORT`, `ORION_DB_PATH`, etc.).
3. Use a process manager (systemd, PM2, supervisord) for high availability.
4. Place the control plane behind HTTPS (nginx, Caddy, Traefik) and enable TLS for WebSocket connections.

## Agent Rollout

1. Install Node.js 20+ on each node.
2. Deploy the agent package (`@orion/agent`) or bundle into a Docker image if desired.
3. Configure:
   ```bash
   export ORION_API_URL=https://control-plane.example.com
   export ORION_NODE_NAME=node-01
   ```
4. Run the agent as a service; ensure outbound WebSocket connectivity.

## Scaling Services

- Update the `replicas` field in `orion.yaml`.
- Run `orion apply -f orion.yaml`.
- Scheduler assigns additional replicas; monitor via `orion get services`.

## Rolling Updates

- Modify environment variables, command, or entry point.
- Apply the new configuration; controllers gracefully restart affected replicas.
- For zero-downtime updates, stagger changes by splitting services or using multiple configs (roadmap enhancements).

## Data Persistence

- Default SQLite database lives at `.orion/state.sqlite`.
- For production, migrate to MongoDB and set the corresponding connection string.
- Back up the state store before upgrades or major changes.

## Observability

- Collect agent logs via systemd journal or central logging (e.g., Loki, Elasticsearch).
- Use `orion logs` to inspect service output.
- Plan monitoring integrations via plugin hooks (Prometheus exporter on roadmap).

## Disaster Recovery

- Keep snapshots of the state store plus `orion.yaml`.
- Reapply the configuration to reconstruct services on new hardware.
- Reissue DNS records using the DNS manager sync command (planned).

## Security Checklist

- Enforce TLS on control plane endpoints.
- Provision API authentication (JWT/RBAC roadmap) when available.
- Isolate agents on private networks; use VPN or tunnel for remote nodes.
- Rotate provider credentials stored in DNS configuration.

## Automation Ideas

- Integrate `orion apply` into CI/CD pipelines.
- Schedule `orion get` status checks and alert on replica drift.
- Use infrastructure-as-code (Terraform, Pulumi) to provision control plane hosting and DNS prerequisites.
