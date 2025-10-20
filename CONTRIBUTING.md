# Contributing to Orion

Thank you for considering a contribution! Orion is a TypeScript-first orchestration platform and we welcome pull requests across control plane, agent, CLI, dashboard, DNS manager, docs, and examples.

## Prerequisites

- Node.js 20+
- pnpm 8+
- SQLite installed locally

## Setup

```bash
pnpm install
pnpm build
```

To run the full stack locally:

```bash
scripts/dev.sh
```

The script starts the control plane (`@orion/core`), local agent (`@orion/agent`), and dashboard (`@orion/dashboard`).

## Tests

Every package exposes `pnpm --filter <package> test`. Unit tests use Vitest.

## Linting & style

- TypeScript strict mode is enforced. Avoid `any` unless there is a clear justification.
- ESLint + Prettier (configure locally as you prefer).
- Only add comments when they clarify tricky logic—keep code self-explanatory when possible.

## Commit guidelines

- Use atomic, descriptive commits (`feat:`, `fix:`, `docs:`, etc.).
- Include scripts or instructions to reproduce changes.
- Respect the [Code of Conduct](CODE_OF_CONDUCT.md).

## Pull requests

1. Describe the problem and the proposed solution.
2. Add or update tests/examples where applicable.
3. Ensure the change is backward compatible (CLI, REST, WebSocket APIs).
4. Link related issues and update the [CHANGELOG.md](CHANGELOG.md) when necessary.

Thank you for helping improve Orion!
