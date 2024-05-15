import { describe, expect, it } from "vitest";
import { SequentialSubscriptionIdFactory } from "./SequentialSubscriptionIdFactory";
import { SubscriptionManager } from "./types";

describe("SequentialSubscriptionIdFactory", () => {
  it("generates sequential subscription ID", () => {
    const generateSubscriptionId = SequentialSubscriptionIdFactory(
      undefined as any as SubscriptionManager,
    );

    const result: string[] = [];
    result.push(generateSubscriptionId());
    result.push(generateSubscriptionId());
    result.push(generateSubscriptionId());

    expect(result).toStrictEqual(["1", "2", "3"]);
  });
});
