import { describe, expect, it } from "vitest";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { DnsManager, type DnsConfig } from "../src/DnsManager.js";

describe("DnsManager integration", () => {
  it("syncs environments using wildcard provider", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "orion-dns-manager-"));
    const routesFile = path.join(dir, "routes.json");
    const certDir = path.join(dir, "certs");
    writeFileSync(path.join(certDir, "example.com.key"), "key", { encoding: "utf-8", mode: 0o600 });
    writeFileSync(path.join(certDir, "example.com.crt"), "cert", { encoding: "utf-8", mode: 0o600 });

    const config: DnsConfig = {
      provider: "wildcard",
      baseDomain: "example.com",
      ttl: 120,
      autoSSL: true,
      ssl: { certDir },
      wildcard: { routesFile },
      environments: {
        dev: { subdomain: "dev", ip: "10.0.0.1" },
        staging: { subdomain: "staging", ip: "10.0.0.2" },
      },
    };

    try {
      const manager = new DnsManager(config);
      await manager.syncAll();
      const routes = JSON.parse(readFileSync(routesFile, "utf-8"));
      expect(routes).toMatchObject({
        "dev.example.com": "10.0.0.1",
        "staging.example.com": "10.0.0.2",
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
