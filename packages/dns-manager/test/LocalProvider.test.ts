import { describe, expect, it } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { LocalProvider } from "../src/providers/LocalProvider.js";

const makeHostsFile = () => {
  const dir = mkdtempSync(path.join(tmpdir(), "orion-local-"));
  const file = path.join(dir, "hosts");
  writeFileSync(file, "127.0.0.1 localhost\n", "utf-8");
  return { dir, file };
};

describe("LocalProvider hosts mode", () => {
  it("adds and removes entries", async () => {
    const { dir, file } = makeHostsFile();
    try {
      const provider = new LocalProvider({
        baseDomain: "orion",
        mode: "hosts",
        hostsFile: file,
        allowSudo: false,
      });

      await provider.create("dev", "127.0.0.1");
      const contentAfterCreate = readFileSync(file, "utf-8");
      expect(contentAfterCreate).toContain("dev.orion");

      const list = await provider.list();
      expect(list).toEqual([
        { name: "dev.orion", type: "A", value: "127.0.0.1" },
      ]);

      await provider.delete("dev");
      const contentAfterDelete = readFileSync(file, "utf-8");
      expect(contentAfterDelete).not.toContain("dev.orion");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
