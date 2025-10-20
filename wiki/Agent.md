<p align="center">
  <img src="../assets/Orion-logo_nobg.png" alt="Orion logo" width="200" />
</p>

# Node Agent

The Orion agent is a lightweight Node.js daemon responsible for executing workloads on each machine.

## Responsibilities

- Maintain a persistent WebSocket connection with the control plane.
- Advertise node identity, labels, and capabilities.
- Spawn service processes using Node.js, Bun, or Deno.
- Watch child processes and perform restarts according to policy.
- Report heartbeats (CPU, memory, status) and execution logs.

## Process Lifecycle

1. Agent connects and sends a `hello` payload.
2. Scheduler assigns a replica; control plane emits a `launch` command.
3. Agent resolves the service definition (path, entry/command, env, ports).
4. Child process starts; stdout/stderr are streamed to the agent logger.
5. Failures trigger retries with exponential backoff (configurable roadmap).
6. On graceful shutdown, agent cleans up child processes before exiting.

## Configuration Hooks

- `env`: environment variables injected before spawn.
- `ports`: exposes named ports; future releases will integrate with DNS and service discovery.
- `hooks`: plugin-driven callbacks to enrich the lifecycle (metrics, alerts, etc.).

## Local Development

- Agents run locally via `scripts/dev.sh` and connect to the control plane on localhost.
- Logs appear in the terminal running the agent and will surface in dashboard/CLI streaming commands.

## Future Enhancements

- Sandboxed execution (Firecracker, containers) for untrusted workloads.
- Resource quotas and cgroup integration on Linux hosts.
- Secure zero-trust channels with mutual TLS.
