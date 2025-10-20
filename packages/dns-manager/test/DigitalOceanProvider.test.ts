import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("undici", () => ({
  fetch: vi.fn(),
}));

import { fetch } from "undici";
import { DigitalOceanProvider } from "../src/providers/DigitalOceanProvider.js";

const fetchMock = vi.mocked(fetch);

const okResponse = (body: unknown = {}): Response =>
  ({
    ok: true,
    status: 200,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response);

const listResponse = {
  domain_records: [
    { id: 1, type: "A", name: "dev", data: "1.1.1.1", ttl: 300 },
  ],
};

describe("DigitalOceanProvider", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("creates A record", async () => {
    fetchMock.mockResolvedValueOnce(okResponse());
    const provider = new DigitalOceanProvider({
      token: "token",
      baseDomain: "example.com",
    });

    await provider.create("dev", "1.2.3.4", 120);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/domains/example.com/records"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          type: "A",
          name: "dev",
          data: "1.2.3.4",
          ttl: 120,
        }),
      })
    );
  });

  it("lists records", async () => {
    fetchMock.mockResolvedValueOnce(okResponse(listResponse));
    const provider = new DigitalOceanProvider({
      token: "token",
      baseDomain: "example.com",
    });

    const records = await provider.list();
    expect(records).toEqual([
      { id: "1", name: "dev", type: "A", value: "1.1.1.1", ttl: 300 },
    ]);
  });

  it("deletes records", async () => {
    fetchMock
      .mockResolvedValueOnce(okResponse(listResponse))
      .mockResolvedValueOnce(okResponse());
    const provider = new DigitalOceanProvider({
      token: "token",
      baseDomain: "example.com",
    });

    await provider.delete("dev");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/records/1"),
      expect.objectContaining({ method: "DELETE" })
    );
  });
});
