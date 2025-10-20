import { describe, expect, it, vi, beforeEach } from "vitest";

const onMock = vi.fn();
const killMock = vi.fn();
const spawnMock = vi.fn(() => ({
  on: onMock,
  kill: killMock,
}));

vi.mock("node:child_process", () => ({
  spawn: spawnMock,
}));

import { ServiceRunner } from "../src/runtime/service-runner.js";
import type { OrionService } from "@orion/shared";

describe("ServiceRunner", () => {
  beforeEach(() => {
    spawnMock.mockClear();
    onMock.mockClear();
    killMock.mockClear();
  });

  it("injects PORT env from service definition", () => {
    const runner = new ServiceRunner({ workspaceRoot: process.cwd() });
    const service: OrionService = {
      name: "api",
      path: ".",
      entry: "index.ts",
      runtime: "node",
      replicas: 1,
      env: {},
      resources: {},
      ports: [{ name: "http", port: 4000 }],
      hooks: undefined,
      plugins: [],
      autoscaling: undefined,
      serverless: undefined,
      labels: {},
      dependencies: [],
      type: "node",
    };

    runner.launch(service, "replica-1");

    expect(spawnMock).toHaveBeenCalledWith("node", ["index.ts"], expect.objectContaining({
      cwd: expect.any(String),
      env: expect.objectContaining({
        PORT: "4000",
        ORION_REPLICA_ID: "replica-1",
        ORION_SERVICE_NAME: "api",
        ORION_MANAGED: "true",
      }),
    }));
  });
});
