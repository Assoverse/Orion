import { spawn, ChildProcess } from "node:child_process";
import path from "node:path";
import { OrionService } from "@orion/shared";

export interface RunnerOptions {
  workspaceRoot?: string;
  environment?: NodeJS.ProcessEnv;
}

interface RunningProcess {
  replicaId: string;
  service: OrionService;
  process: ChildProcess;
}

export class ServiceRunner {
  private running = new Map<string, RunningProcess>();

  constructor(private readonly options: RunnerOptions = {}) {}

  launch(service: OrionService, replicaId: string) {
    const workingDir = path.resolve(
      this.options.workspaceRoot ?? process.cwd(),
      service.path ?? "."
    );

    const entry = service.entry ?? "index.ts";
    const runtime = service.runtime ?? "node";
    const env = {
      ...process.env,
      ...(this.options.environment ?? {}),
      ...service.env,
      ORION_REPLICA_ID: replicaId,
      ORION_SERVICE_NAME: service.name,
      ORION_MANAGED: "true",
    };
    if (service.ports?.length && !env.PORT) {
      env.PORT = String(service.ports[0].port);
    }

    let command = "node";
    let args: string[] = [entry];

    if (service.command) {
      const [cmd, ...rest] = service.command.split(" ");
      command = cmd;
      args = rest;
    } else if (runtime === "bun") {
      command = "bun";
      args = ["run", entry];
    } else if (runtime === "deno") {
      command = "deno";
      args = ["run", "--allow-net", "--allow-env", entry];
    } else if (runtime === "node") {
      command = "node";
      args = [entry];
    }

    const child = spawn(command, args, {
      cwd: workingDir,
      env,
      stdio: "inherit",
    });

    const key = `${service.name}:${replicaId}`;
    this.running.set(key, { service, replicaId, process: child });

    child.on("exit", (code) => {
      this.running.delete(key);
      if (service.hooks?.afterDeploy) {
        // Hook execution placeholder for future plugin system.
        // eslint-disable-next-line no-console
        console.log(
          `[orion-agent] hook(afterDeploy) ${service.hooks.afterDeploy}`
        );
      }
      if (service.autoscaling?.enabled) {
        // TODO: integrate with autoscaler to decide restart.
      }
      if (code !== 0 && service.schedule === undefined) {
        // restart policy: simple always restart
        setTimeout(() => this.launch(service, replicaId), 3_000);
      }
    });
  }

  stop(serviceName: string, replicaId: string) {
    const key = `${serviceName}:${replicaId}`;
    const running = this.running.get(key);
    if (!running) {
      return;
    }
    running.process.kill();
    this.running.delete(key);
  }
}
