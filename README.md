# Orion

> Kubernetes for JS Devs – orchestrateur JavaScript/TypeScript pour services Node, Bun et Deno.

Orion est un control plane full TypeScript capable d'orchestrer des services JavaScript sans conteneurs. Il gère la planification, le déploiement, la supervision et le redémarrage automatique de vos applications Node.js, Next.js, Express, Vite, Bun ou Deno, en local ou sur plusieurs machines.

## Points clés

- **Control plane Fastify** avec planificateur round-robin et reconciler inspiré de Kubernetes.
- **Agent léger** s'exécutant sur chaque machine, lançant vos services via `child_process` ou `bun/deno`.
- **CLI declarative-first** (`orion apply`, `orion get`, `orion logs`) pour piloter vos clusters.
- **Dashboard Next.js + Tailwind** offrant une vue en temps réel des services, nodes et replicas.
- **Configuration déclarative** via `orion.yaml`, validée par Zod.
- **Extensibilité** pensée pour plugins, hooks et intégrations CI/CD.

## Monorepo

```
/packages
  core        # Control plane Fastify + scheduler + controllers
  agent       # Daemon Node.js (WebSocket client + runner)
  cli         # Interface en ligne de commande
  dashboard   # Application Next.js / Tailwind
  shared      # Types, schémas, utilitaires communs
/examples
  simple-service
  next-app
/docs
  architecture.md
  api.md
  plugins.md
```

Le projet utilise pnpm + turborepo pour orchestrer les builds (`pnpm install && pnpm build`).

## Démarrage rapide

1. **Installer les dépendances**

```bash
pnpm install
```

2. **Lancer l'environnement complet** (control plane + agent + dashboard)

```bash
scripts/dev.sh
```

3. **Appliquer une configuration**

```bash
pnpm --filter @orion/cli run dev
# Dans un autre terminal
orion init
orion apply -f orion.yaml
```

4. **Explorer le dashboard**

Visitez http://localhost:3000 pour visualiser services, nodes, logs live.

## Configuration YAML

```yaml
apiVersion: orion/v1
kind: Config
metadata:
  name: demo
  environment: dev
spec:
  services:
    - name: api-users
      path: ./examples/simple-service
      entry: src/index.ts
      runtime: node
      replicas: 2
      env:
        NODE_ENV: development
      ports:
        - name: http
          port: 4000
    - name: web
      path: ./examples/next-app
      type: nextjs
      runtime: node
      replicas: 1
  nodes: []
```

## Paquets principaux

- **@orion/core** – expose une API REST + WebSocket (`/api/apply`, `/api/services`, `/ws`). Scheduler round-robin et boucle de réconciliation démarrées automatiquement.
- **@orion/agent** – daemon Node 20+, gère la connexion WebSocket, envoie des heartbeats (CPU/Mem via pidusage) et lance les services localement.
- **@orion/cli** – CLI Commander.js + Chalk + Ora. Commandes : `init`, `apply`, `get services`, `logs`, `exec`, `dashboard`.
- **@orion/dashboard** – Next.js 14, React 18, Tailwind. Vue cluster overview, liste services/nodes, placeholder streaming logs.
- **@orion/shared** – Schéma Zod (`configSchema`), utilitaires `createLogger`, `generateId`, helpers temps.

## Roadmap v1 → v1.5

- [ ] Streaming des logs et exécution à distance (`orion logs --follow`, `orion exec`).
- [ ] Auto-scaling CPU/mémoire selon policies déclarées.
- [ ] Plugins (ex: `@orion/plugin-vercel`) avec hooks `beforeStart` / `afterDeploy`.
- [ ] Auth & RBAC via JWT.
- [ ] Mode serverless (triggers HTTP/cron/queue) et connecteurs Redis/RabbitMQ.
- [ ] Federation multi-clusters et preview environments.

## Licence

Projet licencié sous [Apache 2.0](LICENSE).

## Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour guides d'installation et de contribution.
# Orion
