import { describe, expect, it } from "vitest";
import { Scheduler } from "../src/scheduler/scheduler.js";
import type { StateStore, ServiceRecord, NodeRecord } from "../src/state/state-store.js";

const createStore = (nodes: NodeRecord[]): StateStore =>
  ({
    listNodes: async () => nodes,
  } as unknown as StateStore);

describe("Scheduler", () => {
  it("assigns replicas using round-robin", async () => {
    const nodes: NodeRecord[] = [
      { id: "node-1", name: "node-1", address: "127.0.0.1", labels: {}, capacity: {}, status: "ready" },
      { id: "node-2", name: "node-2", address: "127.0.0.2", labels: {}, capacity: {}, status: "ready" },
    ];
    const store = createStore(nodes);
    const scheduler = new Scheduler(store);
    const service: ServiceRecord = {
      id: "svc-1",
      name: "service",
      path: ".",
      replicas: 3,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      env: {},
      resources: {},
      ports: [],
      hooks: undefined,
      plugins: [],
      autoscaling: undefined,
      serverless: undefined,
      labels: {},
      dependencies: [],
      type: "node",
      entry: "index.ts",
      runtime: "node",
    };

    const assignments = await scheduler.schedule(service);
    expect(assignments).toHaveLength(3);
    expect(assignments.map((assignment) => assignment.node.id)).toEqual([
      "node-1",
      "node-2",
      "node-1",
    ]);
  });

  it("returns empty assignments when no nodes are available", async () => {
    const scheduler = new Scheduler(createStore([]));
    const service = {
      id: "svc-2",
      name: "service",
      path: ".",
      replicas: 1,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      env: {},
      resources: {},
      ports: [],
      hooks: undefined,
      plugins: [],
      autoscaling: undefined,
      serverless: undefined,
      labels: {},
      dependencies: [],
      type: "node",
      entry: "index.ts",
      runtime: "node",
    } satisfies ServiceRecord;

    const assignments = await scheduler.schedule(service);
    expect(assignments).toEqual([]);
  });
});
