import Fastify from "fastify";
import fastifySSE from "fastify-sse-v2";
import { logger } from "./logger.js";
import { registerRoutes } from "./api/routes.js";
import { registerWebsocket } from "./api/websocket.js";
import { StateStore } from "./state/state-store.js";
import { AgentRegistry } from "./runtime/agent-registry.js";
import { ServiceController } from "./controllers/service-controller.js";
import { Scheduler } from "./scheduler/scheduler.js";

export interface ServerOptions {
  port?: number;
  host?: string;
  store: StateStore;
  agents: AgentRegistry;
  scheduler: Scheduler;
  serviceController: ServiceController;
}

export const createServer = async (options: ServerOptions) => {
  const app = Fastify({
    logger: true,
  });

  await app.register(fastifySSE);
  await registerRoutes(app, { store: options.store });
  await registerWebsocket(app, options.agents, options.store);

  const port = options.port ?? Number(process.env.ORION_PORT ?? 6060);
  const host = options.host ?? process.env.ORION_HOST ?? "0.0.0.0";

  options.serviceController.start();

  const start = async () => {
    try {
      await app.listen({ port, host });
      logger.info("Orion control plane listening", { port, host });
    } catch (error) {
      logger.error("Failed to start Orion control plane", {
        error: (error as Error).message,
      });
      process.exit(1);
    }
  };

  return { app, start };
};
