import { Scheduler } from "../scheduler/scheduler.js";
import {
  DeploymentRecord,
  ServiceRecord,
  StateStore,
} from "../state/state-store.js";
import { logger } from "../logger.js";
import { AgentRegistry } from "../runtime/agent-registry.js";

const RECONCILE_INTERVAL_MS = 5_000;

export class ServiceController {
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly store: StateStore,
    private readonly scheduler: Scheduler,
    private readonly agents: AgentRegistry
  ) {}

  start() {
    if (this.timer) {
      return;
    }
    this.timer = setInterval(() => void this.reconcile(), RECONCILE_INTERVAL_MS);
    logger.info("Service controller started");
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private async reconcile() {
    const services = await this.store.listServices();
    for (const service of services) {
      await this.ensureService(service);
    }
  }

  private async ensureService(service: ServiceRecord) {
    const deployments = await this.store.listDeployments();
    const serviceDeployments = deployments.filter(
      (deployment) => deployment.serviceId === service.id
    );
    if (serviceDeployments.length >= service.replicas) {
      return;
    }
    const assignments = await this.scheduler.schedule(service);
    for (const assignment of assignments) {
      const agent = this.agents.get(assignment.node.id);
      if (!agent) {
        logger.warn("No agent available for node", {
          node: assignment.node.name,
          service: service.name,
        });
        continue;
      }

      const deployment: DeploymentRecord = {
        id: `${assignment.node.id}-${assignment.replicaId}`,
        serviceId: service.id,
        nodeId: assignment.node.id,
        replicaId: assignment.replicaId,
        status: "pending",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await this.store.upsertDeployment(deployment);
      await this.store.upsertService({ ...service, status: "running" });
      agent.launchService({
        service,
        replicaId: assignment.replicaId,
      });
      logger.info("Instructed agent to launch service replica", {
        service: service.name,
        replica: assignment.replicaId,
        node: assignment.node.name,
      });
    }
  }
}
