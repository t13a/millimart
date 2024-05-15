import { describe, expect, it } from "vitest";
import { RandomSubscriptionIdFactory } from "./RandomSubscriptionIdFactory";
import { Subscription } from "./SubscriptionSchema";
import { ReadonlySubscriptionManager } from "./types";

class StubReadonlySubscriptionManager implements ReadonlySubscriptionManager {
  constructor(private map: Map<string, Subscription>) {}

  getById(id: string): Subscription | undefined {
    return this.map.get(id);
  }

  getBySink(_sink: string): Subscription | undefined {
    throw new Error("Method not implemented.");
  }

  hasById(id: string): boolean {
    return this.map.has(id);
  }

  hasBySink(_sink: string): boolean {
    throw new Error("Method not implemented.");
  }

  [Symbol.iterator](): Iterator<Subscription> {
    return this.map.values();
  }
}

describe("RandomSubscriptionIdFactory", () => {
  it("generates random subscription ID", () => {
    const map = new Map<string, Subscription>();
    const subscriptions = new StubReadonlySubscriptionManager(map);
    const generateSubscriptionId = RandomSubscriptionIdFactory(subscriptions);

    const subscribe = (id: string) =>
      map.set(id, { id, sink: id, config: {}, status: {} });

    // Hard to test. ¯\_(ツ)_/¯
    subscribe(generateSubscriptionId());
    subscribe(generateSubscriptionId());
    subscribe(generateSubscriptionId());

    expect(Array.from(subscriptions).length).toBe(3);
  });
});
