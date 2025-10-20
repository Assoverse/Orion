import { FastifyInstance } from "fastify";
import websocket from "@fastify/websocket";
import { randomUUID } from "node:crypto";
import { AgentRegistry } from "../runtime/agent-registry.js";
import { StateStore } from "../state/state-store.js";
import { generateId } from "@orion/shared";
import { logger } from "../logger.js";

interface AgentHelloPayload {
  nodeId: string;
  name: string;
  address: string;
  labels?: Record<string, string>;
}

export const registerWebsocket = async (
  app: FastifyInstance,
  agents: AgentRegistry,
  store: StateStore
) => {
  await app.register(websocket);

  app.get(
    "/ws",
    { websocket: true },
    async (connection, req) => {
      const socketId = randomUUID();
      let nodeId = req.headers["x-orion-node-id"] as string | undefined;
      let registered = false;

      connection.socket.on("message", async (raw) => {
        try {
          const message = JSON.parse(raw.toString());
          if (message.type === "hello") {
            const payload = message.payload as AgentHelloPayload;
            nodeId = payload.nodeId ?? generateId("node");
            agents.register({
              id: socketId,
              nodeId,
              send(event, eventPayload) {
                connection.socket.send(
                  JSON.stringify({ type: event, payload: eventPayload })
                );
              },
              launchService({ service, replicaId }) {
                connection.socket.send(
                  JSON.stringify({
                    type: "launch",
                    payload: { service, replicaId },
                  })
                );
              },
            });

            await store.upsertNode({
              id: nodeId,
              name: payload.name ?? nodeId,
              address:
                payload.address ??
                req.socket.remoteAddress ??
                "unknown-address",
              labels: payload.labels ?? {},
              capacity: {},
              status: "ready",
              lastHeartbeat: Date.now(),
            });

            registered = true;
            logger.info("Agent handshake completed", {
              nodeId,
              socketId,
            });
            return;
          }

          if (message.type === "heartbeat" && nodeId) {
            await store.updateNodeHeartbeat(nodeId);
          }

          if (message.type === "status" && nodeId) {
            logger.debug("Agent status update", { nodeId, payload: message.payload });
          }
        } catch (error) {
          logger.error("Failed to handle agent message", {
            error: (error as Error).message,
          });
        }
      });

      connection.socket.on("close", () => {
        if (registered && nodeId) {
          agents.unregister(nodeId);
        }
      });
    }
  );
};
