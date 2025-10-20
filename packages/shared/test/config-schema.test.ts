import { describe, expect, it } from "vitest";
import { configSchema } from "../src/schemas/config.js";

describe("configSchema", () => {
  it("parses minimal config", () => {
    const result = configSchema.safeParse({
      apiVersion: "orion/v1",
      kind: "Config",
      spec: {
        services: [
          {
            name: "demo",
            path: ".",
          },
        ],
        nodes: [],
        plugins: [],
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid port value", () => {
    const result = configSchema.safeParse({
      apiVersion: "orion/v1",
      kind: "Config",
      spec: {
        services: [
          {
            name: "demo",
            ports: [{ name: "http", port: 90000 }],
          },
        ],
        nodes: [],
        plugins: [],
      },
    });
    expect(result.success).toBe(false);
  });
});
