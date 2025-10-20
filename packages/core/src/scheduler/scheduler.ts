import { NodeRecord, ServiceRecord, StateStore } from "../state/state-store.js";
import { logger } from "../logger.js";

export interface SchedulingAssignment {
  service: ServiceRecord;
  node: NodeRecord;
  replicaId: string;
}

export class Scheduler {
  private cursor = 0;

  constructor(private readonly store: StateStore) {}

  async schedule(service: ServiceRecord): Promise<SchedulingAssignment[]> {
    const nodes = await this.store.listNodes();
    if (!nodes.length) {
      logger.warn("No nodes available for scheduling", { service: service.name });
      return [];
    }
    const assignments: SchedulingAssignment[] = [];
    for (let i = 0; i < service.replicas; i += 1) {
      const node = nodes[this.cursor % nodes.length];
      this.cursor += 1;
      const replicaId = `${service.name}-replica-${i + 1}`;
      assignments.push({ service, node, replicaId });
    }
    logger.debug("Scheduler produced assignments", {
      service: service.name,
      replicas: assignments.length,
    });
    return assignments;
  }
}
