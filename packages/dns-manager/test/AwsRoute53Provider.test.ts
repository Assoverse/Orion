import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.fn();

vi.mock("@aws-sdk/client-route-53", () => {
  return {
    Route53Client: vi.fn().mockImplementation(() => ({
      send: sendMock,
    })),
    ChangeResourceRecordSetsCommand: vi
      .fn()
      .mockImplementation((input: unknown) => ({ input })),
    ListResourceRecordSetsCommand: vi
      .fn()
      .mockImplementation((input: unknown) => ({ input })),
  };
});

import { AwsRoute53Provider } from "../src/providers/AwsRoute53Provider.js";
import {
  ChangeResourceRecordSetsCommand,
  ListResourceRecordSetsCommand,
} from "@aws-sdk/client-route-53";

const listResult = {
  ResourceRecordSets: [
    {
      Name: "dev.example.com.",
      Type: "A",
      TTL: 300,
      ResourceRecords: [{ Value: "3.3.3.3" }],
    },
  ],
};

describe("AwsRoute53Provider", () => {
  beforeEach(() => {
    sendMock.mockReset();
  });

  it("creates record via UPSERT", async () => {
    sendMock.mockResolvedValueOnce({});
    const provider = new AwsRoute53Provider({
      accessKeyId: "key",
      secretAccessKey: "secret",
      zoneId: "Z1",
      baseDomain: "example.com",
    });

    await provider.create("dev", "3.3.3.3", 120);

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          ChangeBatch: expect.objectContaining({
            Changes: [
              expect.objectContaining({
                Action: "UPSERT",
              }),
            ],
          }),
        }),
      })
    );
  });

  it("lists records", async () => {
    sendMock
      .mockResolvedValueOnce(listResult)
      .mockResolvedValueOnce(listResult);
    const provider = new AwsRoute53Provider({
      accessKeyId: "key",
      secretAccessKey: "secret",
      zoneId: "Z1",
      baseDomain: "example.com",
    });

    const records = await provider.list();
    expect(sendMock).toHaveBeenCalledWith(
      expect.any(ListResourceRecordSetsCommand as unknown as Function)
    );
    expect(records).toEqual([
      {
        name: "dev.example.com",
        type: "A",
        value: "3.3.3.3",
        ttl: 300,
      },
    ]);
  });

  it("deletes existing record", async () => {
    sendMock
      .mockResolvedValueOnce(listResult)
      .mockResolvedValueOnce({});
    const provider = new AwsRoute53Provider({
      accessKeyId: "key",
      secretAccessKey: "secret",
      zoneId: "Z1",
      baseDomain: "example.com",
    });

    await provider.delete("dev");
    expect(sendMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          ChangeBatch: expect.objectContaining({
            Changes: [
              expect.objectContaining({ Action: "DELETE" }),
            ],
          }),
        }),
      })
    );
  });
});
