#!/usr/bin/env node
import "dotenv/config";
import { createServer } from "./server.js";
import { SQLiteStateStore } from "./state/sqlite-store.js";
import { AgentRegistry } from "./runtime/agent-registry.js";
import { Scheduler } from "./scheduler/scheduler.js";
import { ServiceController } from "./controllers/service-controller.js";
import { logger } from "./logger.js";

const bootstrap = async () => {
  const store = new SQLiteStateStore({
    filepath: process.env.ORION_STATE_DB,
  });
  await store.initialize();

  const agents = new AgentRegistry();
  const scheduler = new Scheduler(store);
  const serviceController = new ServiceController(store, scheduler, agents);

  const server = await createServer({
    store,
    agents,
    scheduler,
    serviceController,
    port: Number(process.env.ORION_PORT ?? 6060),
    host: process.env.ORION_HOST ?? "0.0.0.0",
  });

  await server.start();
};

bootstrap().catch((error) => {
  logger.fatal("Unable to bootstrap Orion control plane", {
    error: (error as Error).message,
  });
  process.exit(1);
});
