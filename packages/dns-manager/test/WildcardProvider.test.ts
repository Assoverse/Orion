import { describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { WildcardProvider } from "../src/providers/WildcardProvider.js";

const makeTempFile = () => {
  const dir = mkdtempSync(path.join(tmpdir(), "orion-wildcard-"));
  return { dir, file: path.join(dir, "routes.json") };
};

describe("WildcardProvider", () => {
  it("persists routes", async () => {
    const { dir, file } = makeTempFile();
    try {
      const provider = new WildcardProvider({
        baseDomain: "example.com",
        routesFile: file,
      });
      await provider.create("dev", "4.4.4.4");
      const list = await provider.list();
      expect(list).toEqual([
        { name: "dev.example.com", type: "A", value: "4.4.4.4" },
      ]);
      await provider.delete("dev");
      expect(await provider.list()).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
