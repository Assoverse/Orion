<p align="center">
  <img src="../assets/Orion-logo_nobg.png" alt="Orion logo" width="200" />
</p>

# Getting Started

This guide walks you from a fresh checkout to a running Orion environment on your laptop.

## Prerequisites

- Node.js 20+
- `pnpm` (preferred package manager)
- `bash` (for provided helper scripts)
- macOS, Linux, or WSL2

Optional but recommended:

- `mkcert` or `openssl` for generating local TLS certificates
- A DigitalOcean, Cloudflare, or AWS account if you intend to test DNS automation

## Install Dependencies

```bash
pnpm install
```

This bootstraps every workspace package (control plane, agent, CLI, dashboard, shared libraries).

## Start the Stack

```bash
scripts/dev.sh
```

The script launches:

- `@orion/core` control plane (Fastify API + WebSocket)
- `@orion/agent` connected to the local control plane
- `@orion/dashboard` on http://localhost:3000

## Apply a Sample Configuration

```bash
pnpm --filter @orion/cli run dev
orion init                 # creates a baseline orion.yaml if missing
orion apply -f orion.yaml  # deploys services from the repo examples
```

The default `orion.yaml` deploys:

- `examples/simple-service` (HTTP API on port 4000)
- `examples/next-app` (Next.js site) with live reload

Inspect the cluster using:

```bash
orion get services
orion get nodes
orion logs service/<name>
```

## Explore the Dashboard

Open http://localhost:3000 to monitor services, nodes, and heartbeats in real time. Future releases will stream logs and replica status directly in the UI.

## Next Steps

- Review the [Configuration Reference](Configuration.md) to tailor services, plugins, and DNS.
- Read the [Architecture Overview](Architecture.md) to understand the control plane.
- Follow the [Operations Playbook](Operations.md) for multi-node or production-style setups.
