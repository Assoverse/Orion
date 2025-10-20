import WebSocket, { RawData } from "ws";
import os from "node:os";
import pidusage from "pidusage";
import { OrionService } from "@orion/shared";
import { ServiceRunner } from "./runtime/service-runner.js";

export interface AgentOptions {
  controlPlaneUrl: string;
  nodeId?: string;
  name?: string;
  workspaceRoot?: string;
}

interface LaunchMessage {
  type: "launch";
  payload: {
    service: OrionService;
    replicaId: string;
  };
}

export class OrionAgent {
  private ws?: WebSocket;
  private heartbeatTimer?: NodeJS.Timeout;
  private readonly runner: ServiceRunner;

  constructor(private readonly options: AgentOptions) {
    this.runner = new ServiceRunner({ workspaceRoot: options.workspaceRoot });
  }

  async start() {
    await this.connect();
  }

  private async connect() {
    this.ws = new WebSocket(this.options.controlPlaneUrl);

    this.ws.on("open", () => {
      this.send("hello", {
        nodeId: this.options.nodeId ?? os.hostname(),
        name: this.options.name ?? os.hostname(),
        address: os.hostname(),
        labels: {
          os: os.platform(),
          arch: os.arch(),
        },
      });

      this.emitHeartbeat();
      this.heartbeatTimer = setInterval(() => {
        void this.emitHeartbeat();
      }, 5_000);
    });

    this.ws.on("close", () => {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = undefined;
      }
      setTimeout(() => this.connect(), 3_000);
    });

    this.ws.on("message", (raw: RawData) => {
      try {
        const message = JSON.parse(raw.toString()) as LaunchMessage;
        if (message.type === "launch") {
          const { service, replicaId } = message.payload;
          this.runner.launch(service, replicaId);
        }
      } catch (error) {
        console.error(`[orion-agent] Failed to handle message`, error);
      }
    });
  }

  private async emitHeartbeat() {
    const usage = await pidusage(process.pid);
    this.send("heartbeat", {
      timestamp: Date.now(),
      metrics: {
        cpu: usage.cpu,
        memory: usage.memory,
      },
    });
  }

  private send(type: string, payload: unknown) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    this.ws.send(JSON.stringify({ type, payload }));
  }
}

export const createAgent = (options: AgentOptions) => new OrionAgent(options);
