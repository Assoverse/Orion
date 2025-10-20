<p align="center">
  <img src="../assets/Orion-logo_nobg.png" alt="Orion logo" width="200" />
</p>

# CLI Guide

The `orion` CLI is your primary interface for configuring and inspecting clusters. It wraps the control plane API with a user-friendly workflow.

## Installation

During development, run the CLI in watch mode:

```bash
pnpm --filter @orion/cli run dev
```

In production, install from the published package (roadmap).

## Commands

| Command | Description |
|---------|-------------|
| `orion init` | Scaffold a starter `orion.yaml` with sample services and comments. |
| `orion apply -f <file>` | Validate and submit configuration to the control plane. |
| `orion get services` | List declared services with desired/actual replica counts. |
| `orion get nodes` | Display connected agents, labels, and heartbeat status. |
| `orion logs <resource>` | Stream logs for a service or replica (streaming coming soon). |
| `orion exec <service> -- <cmd>` | Execute commands inside a running replica (roadmap). |
| `orion dashboard` | Launch the Next.js dashboard locally. |

All commands accept `--api-url` and `--config` overrides (see `packages/cli/src` for options).

## Workflow

1. Edit `orion.yaml` to describe services.
2. Run `orion apply -f orion.yaml`.
3. Use `orion get services` to confirm reconciliation.
4. Tail logs or open the dashboard for deeper observability.

## Error Handling

- Validation errors include path information from the Zod schema.
- API connectivity issues show the target URL and HTTP status.
- Logs command prints friendly hints when streaming is not yet available.

## Extending the CLI

- Each command lives under `packages/cli/src/commands`.
- Compose new commands by extending Commander.js definitions.
- Shared types and helpers come from `@orion/shared`.
