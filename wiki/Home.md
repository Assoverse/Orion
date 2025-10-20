<p align="center">
  <img src="../assets/Orion-logo_nobg.png" alt="Orion logo" width="200" />
</p>

# Orion Wiki

Welcome to the Orion knowledge base. This wiki centralizes everything you need to understand, operate, and extend the JavaScript-first orchestration platform.

## Quick Navigation

- [Getting Started](Getting-Started.md)
- [Architecture Overview](Architecture.md)
- [Configuration Reference](Configuration.md)
- [Control Plane & API](Control-Plane.md)
- [Node Agent](Agent.md)
- [CLI Guide](CLI.md)
- [Dashboard](Dashboard.md)
- [DNS Manager](DNS-Manager.md)
- [Operations Playbook](Operations.md)
- [Troubleshooting & FAQ](Troubleshooting.md)
- [Contributing](Contributing.md)

## What Is Orion?

Orion delivers Kubernetes-style orchestration tailored to JavaScript runtimes. It comprises:

- A **TypeScript control plane** powered by Fastify, reconciliation controllers, and a scheduler.
- **Agents** that supervise Node, Bun, and Deno processes across your machines.
- A **CLI** (`orion`) to declare, apply, and inspect environments.
- A **Next.js dashboard** for real-time visibility.
- A **DNS manager** for multi-provider automation.

## Core Concepts

- **Declarative configuration** (`orion.yaml`) describes services, plugins, nodes, and environment metadata.
- **Desired state vs. actual state** drives reconciliation loops and scheduling decisions.
- **Agents** connect to the control plane through WebSocket, exchanging heartbeats and launch commands.
- **Plugins and hooks** extend service lifecycle events to integrate with third-party systems.

Dive into the linked sections for deep dives, workflows, and operational guides.
