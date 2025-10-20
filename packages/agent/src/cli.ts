#!/usr/bin/env node
import { createAgent } from "./index.js";

const parseArgs = () => {
  const args = process.argv.slice(2);
  const config: Record<string, string> = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.replace(/^--/, "");
      const value = args[i + 1];
      if (value && !value.startsWith("--")) {
        config[key] = value;
        i += 1;
      } else {
        config[key] = "true";
      }
    }
  }
  return config;
};

const main = async () => {
  const config = parseArgs();
  const controlPlaneUrl =
    config["control-plane"] ??
    process.env.ORION_CONTROL_PLANE_URL ??
    "ws://localhost:6060/ws";

  const agent = createAgent({
    controlPlaneUrl,
    nodeId: config["node-id"] ?? process.env.ORION_NODE_ID,
    name: config["name"] ?? process.env.ORION_NODE_NAME,
    workspaceRoot: config["workspace-root"] ?? process.env.ORION_WORKSPACE_ROOT,
  });

  await agent.start();
};

main().catch((error) => {
  console.error("[orion-agent] failed to start", error);
  process.exit(1);
});
