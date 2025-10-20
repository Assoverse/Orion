<p align="center">
  <img src="../assets/Orion-logo_nobg.png" alt="Orion logo" width="200" />
</p>

# Orion Plugin Model

Orion is designed to be extensible through plugins declared in `orion.yaml`.

## Declaring plugins

```yaml
spec:
  plugins:
    - @orion/plugin-vercel
    - @orion/plugin-monitoring
  services:
    - name: api-users
      hooks:
        beforeStart: monitoring:register
        afterDeploy: vercel:notify
```

## Lifecycle

1. **Loading** – Plugins are resolved from `node_modules` or a custom directory.
2. **Setup** – Each plugin receives the `OrionContext` (store, scheduler, notifier, logger).
3. **Hooks** – Controllers trigger lifecycle hooks (`beforeStart`, `afterDeploy`, `onFailure`, etc.).

## Proposed API

```ts
export interface OrionPlugin {
  name: string;
  setup(context: OrionContext): void | Promise<void>;
  hooks?: {
    beforeStart?(args: HookArgs): Promise<void> | void;
    afterDeploy?(args: HookArgs): Promise<void> | void;
  };
}
```

`HookArgs` includes `service`, `replicaId`, `node`, and a contextualised logger. Plugins can emit metrics, send webhooks, or adjust runtime environment variables.

## Roadmap

- CLI helpers: `orion plugin add <name>` to install/register providers.
- GitHub Action marketplace for provisioning Orion clusters.
- Official plugins:
  - `@orion/plugin-monitoring` (Prometheus exporter)
  - `@orion/plugin-rbac` (dynamic policies)
  - `@orion/plugin-vercel` (preview environments)
