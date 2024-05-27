import { describe, expect, it } from "vitest";
import { InMemoryEventStore } from "../InMemoryEventStore";
import { InMemorySubscriptionManager } from "./InMemorySubscriptionManager";

type TestEvent = {
  id: string;
};

describe("InMemorySubscriptionManager", () => {
  describe("create", () => {
    it("creates a subscription", async () => {
      const store = new InMemoryEventStore<TestEvent>((e) => e.id);
      const manager = new InMemorySubscriptionManager({ store });

      const subscription = manager.create();

      expect(manager.get(subscription.id)).toBe(subscription);
      expect(manager.has(subscription.id)).toBe(true);
    });
  });

  describe("delete", () => {
    it("deletes a subscription", async () => {
      const store = new InMemoryEventStore<TestEvent>((e) => e.id);
      const manager = new InMemorySubscriptionManager({ store });
      const subscription = manager.create({});

      const deleted = manager.delete(subscription.id);

      expect(deleted).toBe(true);
      expect(manager.get(subscription.id)).toBe(undefined);
      expect(manager.has(subscription.id)).toBe(false);
    });

    it("does nothing if the subscription already deleted", async () => {
      const store = new InMemoryEventStore<TestEvent>((e) => e.id);
      const manager = new InMemorySubscriptionManager({ store });
      const subscription = manager.create({});

      manager.delete(subscription.id);
      const deleted = manager.delete(subscription.id);

      expect(deleted).toBe(false);
    });
  });

  describe("on", () => {
    describe("create/delete", () => {
      it("is emitted when a subscription is created/deleted", async () => {
        const store = new InMemoryEventStore<TestEvent>((e) => e.id);
        const manager = new InMemorySubscriptionManager({ store });
        const result: string[] = [];
        manager.on("create", (s) =>
          result.push(`subscription ${s.id} created`),
        );
        manager.on("delete", (s) =>
          result.push(`subscription ${s.id} deleted`),
        );

        const s1 = manager.create();
        const s2 = manager.create();
        expect(result).toStrictEqual([
          `subscription ${s1.id} created`,
          `subscription ${s2.id} created`,
        ]);

        manager.delete(s1.id);
        manager.delete(s2.id);
        expect(result).toStrictEqual([
          `subscription ${s1.id} created`,
          `subscription ${s2.id} created`,
          `subscription ${s1.id} deleted`,
          `subscription ${s2.id} deleted`,
        ]);
      });
    });
  });
});
