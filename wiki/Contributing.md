<p align="center">
  <img src="../assets/Orion-logo_nobg.png" alt="Orion logo" width="200" />
</p>

# Contributing

We welcome community contributions across code, docs, plugins, and operational guidance.

## Quick Checklist

- Read the project [CONTRIBUTING.md](../CONTRIBUTING.md) for coding standards and workflows.
- Familiarize yourself with the [Architecture Overview](Architecture.md) and [Operations Playbook](Operations.md).
- Open an issue describing bugs or proposals before submitting large changes.

## Development Workflow

1. Fork the repository and clone locally.
2. Install dependencies with `pnpm install`.
3. Run `pnpm lint` and `pnpm test` (when available) before pushing.
4. Use `pnpm --filter <package> dev` for hot reload while working on a specific component.
5. Include unit/integration tests where possible.

## Documentation Contributions

- Update the relevant wiki pages or Markdown docs (`docs/` directory) to reflect changes.
- Add diagrams via Mermaid blocks where they add clarity.
- Keep content concise, accurate, and aligned with the project tone.

## Feature Proposals

- Describe the user problem, proposed solution, and alternatives.
- Outline any API changes or migration steps.
- Consider plugin-based extensions when possible.

## Code Style

- TypeScript-first with strict compiler options.
- Use shared utilities from `@orion/shared` to avoid duplication.
- Add comments sparingly to clarify non-obvious logic.

## Community

- Join discussions via GitHub Issues and Discussions (roadmap).
- Participate in release planning and triage sessions.
- Help review PRs to share context and keep quality high.

## Code of Conduct

Orion follows the [Code of Conduct](../CODE_OF_CONDUCT.md). Please report any violations to the maintainers listed in that document.
