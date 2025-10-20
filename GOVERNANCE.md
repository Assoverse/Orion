# Governance

Orion is an open-source project maintained by a core team responsible for the roadmap, releases, and overall quality. The governance model is a lightweight meritocracy.

## Roles

- **Maintainers** – Guide the project vision, approve significant pull requests, publish releases.
- **Reviewers** – Active contributors with review privileges for specific areas (control plane, agent, CLI, dashboard, DNS manager, etc.).
- **Contributors** – Anyone submitting code, documentation, tests, or support.

## Decision process

- Standard changes follow the pull-request workflow. At least one maintainer must approve changes that affect public APIs or security-sensitive paths.
- Roadmap decisions are discussed publicly (issues or discussions). Maintainers aim for consensus.
- Formal votes are rarely needed. When required, a simple majority of active maintainers decides.

## Releases

- Releases follow semantic versioning. Announcements are published in the [CHANGELOG.md](CHANGELOG.md) and tagged in Git.
- Any maintainer may cut a release once CI passes and docs are up to date.

## Onboarding maintainers / reviewers

- New maintainers are nominated by an existing maintainer based on sustained, high-quality contributions.
- Nominations remain open for community feedback for seven days. Without major objections, the nomination is accepted.

## Conflict resolution

- Maintainers first attempt to resolve disagreements through discussion (private or public).
- If consensus cannot be reached, a vote among maintainers decides the outcome by simple majority.

## Evolution

Governance may evolve as the project grows. Proposed changes are discussed publicly and ratified through pull requests.
