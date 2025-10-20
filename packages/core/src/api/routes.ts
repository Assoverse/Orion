import { FastifyInstance } from "fastify";
import { configSchema } from "@orion/shared";
import { StateStore } from "../state/state-store.js";
import { logger } from "../logger.js";

interface RoutesOptions {
  store: StateStore;
}

export const registerRoutes = async (
  app: FastifyInstance,
  options: RoutesOptions
) => {
  const { store } = options;

  app.get("/health", async () => ({ status: "ok" }));

  app.get("/api/services", async () => {
    const services = await store.listServices();
    return { items: services };
  });

  app.get("/api/nodes", async () => {
    const nodes = await store.listNodes();
    return { items: nodes };
  });

  app.post("/api/apply", async (request, reply) => {
    const payload = request.body;
    const parsed = configSchema.safeParse(payload);
    if (!parsed.success) {
      reply.status(400).send({
        message: "Invalid configuration",
        issues: parsed.error.issues,
      });
      return;
    }

    await store.applyConfig(parsed.data);
    logger.info("Configuration applied via API", {
      services: parsed.data.spec.services.length,
    });
    reply.status(202).send({ status: "accepted" });
  });
};
