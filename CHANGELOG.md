# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-11-23
### Added
- Initial public release of Orion monorepo.
- Control plane (`@orion/core`) with scheduler, reconciliation loop, and WebSocket agent coordination.
- Node agent (`@orion/agent`) with process supervision and metrics heartbeats.
- CLI (`@orion/cli`) providing `init`, `apply`, `get`, `logs`, `exec`, and `dashboard` commands.
- Dashboard (`@orion/dashboard`) built with Next.js + Tailwind for cluster visibility.
- Shared schemas (`@orion/shared`) with Zod validation.
- DNS Manager (`@orion/dns-manager`) supporting DigitalOcean, Cloudflare, AWS Route53, wildcard proxy, and local providers with optional wildcard SSL automation.
- Example services for Node, Next.js, Vite, and PWA deployments.
- Comprehensive documentation (`docs/`) covering architecture, APIs, providers, and plugins.
- Open source assets: LICENSE, Code of Conduct, Security policy, Support guidelines, Contribution guide, Issue templates.
