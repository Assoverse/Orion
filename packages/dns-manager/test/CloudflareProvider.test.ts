import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("undici", () => ({
  fetch: vi.fn(),
}));

import { fetch } from "undici";
import { CloudflareProvider } from "../src/providers/CloudflareProvider.js";

const fetchMock = vi.mocked(fetch);

const okResponse = (body: unknown = { result: [] }): Response =>
  ({
    ok: true,
    status: 200,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response);

const listBody = {
  result: [
    { id: "123", type: "A", name: "dev.example.com", content: "2.2.2.2", ttl: 60 },
  ],
};

describe("CloudflareProvider", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("creates record", async () => {
    fetchMock.mockResolvedValueOnce(okResponse());
    const provider = new CloudflareProvider({
      token: "token",
      zoneId: "zone",
      baseDomain: "example.com",
    });

    await provider.create("dev", "2.2.2.2", 120);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/dns_records"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          type: "A",
          name: "dev.example.com",
          content: "2.2.2.2",
          ttl: 120,
          proxied: false,
        }),
      })
    );
  });

  it("lists records", async () => {
    fetchMock.mockResolvedValueOnce(okResponse(listBody));
    const provider = new CloudflareProvider({
      token: "token",
      zoneId: "zone",
      baseDomain: "example.com",
    });

    const records = await provider.list();
    expect(records).toEqual([
      { id: "123", name: "dev.example.com", type: "A", value: "2.2.2.2", ttl: 60 },
    ]);
  });

  it("deletes record", async () => {
    fetchMock
      .mockResolvedValueOnce(okResponse(listBody))
      .mockResolvedValueOnce(okResponse());
    const provider = new CloudflareProvider({
      token: "token",
      zoneId: "zone",
      baseDomain: "example.com",
    });

    await provider.delete("dev");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/dns_records/123"),
      expect.objectContaining({ method: "DELETE" })
    );
  });
});
