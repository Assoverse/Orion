import { OrionService } from "@orion/shared";
import { logger } from "../logger.js";

export interface LaunchRequest {
  service: OrionService;
  replicaId: string;
}

export interface AgentConnection {
  id: string;
  nodeId: string;
  send(event: string, payload: unknown): void;
  launchService(request: LaunchRequest): void;
}

export class AgentRegistry {
  private agents = new Map<string, AgentConnection>();

  register(agent: AgentConnection) {
    this.agents.set(agent.nodeId, agent);
    logger.info("Agent registered", { nodeId: agent.nodeId });
  }

  unregister(nodeId: string) {
    this.agents.delete(nodeId);
    logger.info("Agent unregistered", { nodeId });
  }

  get(nodeId: string): AgentConnection | undefined {
    return this.agents.get(nodeId);
  }

  broadcast(event: string, payload: unknown) {
    for (const agent of this.agents.values()) {
      agent.send(event, payload);
    }
  }
}
