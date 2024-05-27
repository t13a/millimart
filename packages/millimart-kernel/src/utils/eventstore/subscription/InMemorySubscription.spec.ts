import { describe, expect, it } from "vitest";
import { EventStoreError } from "../EventStoreError";
import { EventFilter } from "../EventStoreHelper";
import { InMemoryEventStore } from "../InMemoryEventStore";
import { InMemorySubscription } from "./InMemorySubscription";
import { SubscriptionPosition } from "./types";

type TestEvent = {
  id: string;
};

const store = new InMemoryEventStore<TestEvent>((e) => e.id);
const e1: TestEvent = { id: "e1" };
const e2: TestEvent = { id: "e2" };
const e3: TestEvent = { id: "e3" };
await store.append(e1);
await store.append(e2);
await store.append(e3);

const emptyStore = new InMemoryEventStore<TestEvent>((e) => e.id);

describe("InMemorySubscription", async () => {
  describe("receive", () => {
    it("consumes events (from the start)", async () => {
      const subscription = new InMemorySubscription({
        id: "1",
        store,
      });
      expect(subscription.position).toStrictEqual({
        from: "Start",
      } satisfies SubscriptionPosition);

      {
        const events: TestEvent[] = [];
        const received = await subscription.receive((e) => events.push(e));
        expect(events).toStrictEqual([e1]);
        expect(received).toBe(true);
        expect(subscription.position).toStrictEqual({
          from: "Next",
          lastEventId: e1.id,
        } satisfies SubscriptionPosition);
      }

      {
        const events: TestEvent[] = [];
        const received = await subscription.receive((e) => events.push(e));
        expect(events).toStrictEqual([e2]);
        expect(received).toBe(true);
        expect(subscription.position).toStrictEqual({
          from: "Next",
          lastEventId: e2.id,
        } satisfies SubscriptionPosition);
      }

      {
        const events: TestEvent[] = [];
        const received = await subscription.receive((e) => events.push(e));
        expect(events).toStrictEqual([e3]);
        expect(received).toBe(true);
        expect(subscription.position).toStrictEqual({
          from: "Next",
          lastEventId: e3.id,
        } satisfies SubscriptionPosition);
      }

      {
        const events: TestEvent[] = [];
        const received = await subscription.receive((e) => events.push(e)); // Do nothing.
        expect(events).toStrictEqual([]);
        expect(received).toBe(false);
        expect(subscription.position).toStrictEqual({
          from: "Next",
          lastEventId: e3.id,
        } satisfies SubscriptionPosition);
      }
    });

    it("consumes events (from the next of the specified event)", async () => {
      const subscription = new InMemorySubscription({
        id: "1",
        request: {
          position: { from: "Next", lastEventId: e1.id },
        },
        store,
      });

      const events: TestEvent[] = [];
      await subscription.receive((e) => events.push(e));
      await subscription.receive((e) => events.push(e));
      await subscription.receive((e) => events.push(e)); // Do nothing.
      await subscription.receive((e) => events.push(e)); // Do nothing.

      expect(events).toStrictEqual([e2, e3]);
    });

    it("consumes events (from the end)", async () => {
      const subscription = new InMemorySubscription({
        id: "1",
        request: {
          position: { from: "End" },
        },
        store,
      });

      const events: TestEvent[] = [];
      await subscription.receive((e) => events.push(e));
      await subscription.receive((e) => events.push(e)); // Do nothing.
      await subscription.receive((e) => events.push(e)); // Do nothing.
      await subscription.receive((e) => events.push(e)); // Do nothing.

      expect(events).toStrictEqual([e3]);
    });

    it("does nothing if there are no event", async () => {
      const subscription = new InMemorySubscription({
        id: "1",
        store: emptyStore,
      });

      const events: TestEvent[] = [];
      await subscription.receive((e) => events.push(e)); // Do nothing.
      await subscription.receive((e) => events.push(e)); // Do nothing.
      await subscription.receive((e) => events.push(e)); // Do nothing.
      await subscription.receive((e) => events.push(e)); // Do nothing.

      expect(events).toStrictEqual([]);
    });

    it("throws an error if the specified event does not exist", async () => {
      const subscription = new InMemorySubscription({
        id: "1",
        request: {
          position: { from: "Next", lastEventId: "e0" },
        },
        store: emptyStore,
      });

      const events: TestEvent[] = [];
      expect(() =>
        subscription.receive((e) => events.push(e)),
      ).rejects.toThrowError(EventStoreError);
    });
  });

  describe("update", () => {
    it("modifies the filter", async () => {
      const subscription = new InMemorySubscription({
        id: "1",
        store,
      });

      {
        const events: TestEvent[] = [];
        await subscription.receive((e) => events.push(e));
        expect(events).toStrictEqual([e1]);
      }

      subscription.update({ filter: (e) => e.id !== e2.id });

      {
        const events: TestEvent[] = [];
        await subscription.receive((e) => events.push(e));
        expect(events).toStrictEqual([e3]);
      }
    });

    it("modifies the position", async () => {
      const subscription = new InMemorySubscription({
        id: "1",
        store,
      });

      {
        const events: TestEvent[] = [];
        await subscription.receive((e) => events.push(e));
        expect(events).toStrictEqual([e1]);
      }

      subscription.update({ position: { from: "Next", lastEventId: e1.id } });

      {
        const events: TestEvent[] = [];
        await subscription.receive((e) => events.push(e));
        expect(events).toStrictEqual([e2]);
      }
    });
  });

  describe("on", () => {
    describe("filter", () => {
      it("is emitted when the filter modified", async () => {
        const subscription = new InMemorySubscription({
          id: "1",
          store,
        });
        const filters: EventFilter<TestEvent>[] = [];
        subscription.on("filter", (f) => filters.push(f));

        const f1: EventFilter<TestEvent> = (e) => e.id === e1.id;
        const f2: EventFilter<TestEvent> = (e) => e.id === e2.id;
        subscription.update({ filter: f1 });
        subscription.update({ filter: f2 });

        expect(filters).toStrictEqual([f1, f2]);
      });

      it("is not emitted when the filter not modified", async () => {
        const f1: EventFilter<TestEvent> = (e) => e.id === e1.id;
        const subscription = new InMemorySubscription({
          id: "1",
          request: { filter: f1 },
          store,
        });

        const filters: EventFilter<TestEvent>[] = [];
        subscription.on("filter", (f) => filters.push(f));

        subscription.update({ filter: f1 });
        subscription.update({ filter: f1 });

        expect(filters).toStrictEqual([]);
      });
    });

    describe("position", () => {
      it("is emitted when the position modified", async () => {
        const subscription = new InMemorySubscription({
          id: "1",
          store,
        });
        const positions: SubscriptionPosition[] = [];
        subscription.on("position", (p) => positions.push(p));

        const p1: SubscriptionPosition = { from: "Next", lastEventId: e1.id };
        const p2: SubscriptionPosition = { from: "Next", lastEventId: e2.id };
        subscription.update({ position: p1 });
        subscription.update({ position: p2 });

        expect(positions).toStrictEqual([p1, p2]);
      });

      it("is not emitted when the position not modified", async () => {
        const p1: SubscriptionPosition = { from: "Next", lastEventId: e1.id };
        const subscription = new InMemorySubscription({
          id: "1",
          request: { position: p1 },
          store,
        });
        const positions: SubscriptionPosition[] = [];
        subscription.on("position", (p) => positions.push(p));

        subscription.update({ position: p1 });
        subscription.update({ position: p1 });

        expect(positions).toStrictEqual([]);
      });

      it("is emitted when the event received", async () => {
        const subscription = new InMemorySubscription({
          id: "1",
          store,
        });
        const positions: SubscriptionPosition[] = [];
        subscription.on("position", (p) => positions.push(p));

        const received = await subscription.receive(() => {});

        expect(positions).toStrictEqual([
          { from: "Next", lastEventId: e1.id },
        ] satisfies SubscriptionPosition[]);
        expect(received).toBe(true);
      });

      it("is not emitted when the event not received", async () => {
        const subscription = new InMemorySubscription({
          id: "1",
          store: emptyStore,
        });
        const positions: SubscriptionPosition[] = [];
        subscription.on("position", (p) => positions.push(p));

        const received = await subscription.receive(() => {});

        expect(positions).toStrictEqual([]);
        expect(received).toBe(false);
      });

      it("is not emitted when failed to receive the event", async () => {
        const subscription = new InMemorySubscription({
          id: "1",
          store: store,
        });
        const positions: SubscriptionPosition[] = [];
        subscription.on("position", (p) => positions.push(p));

        expect(() =>
          subscription.receive(() => {
            throw new Error("Failed to consume");
          }),
        ).rejects.toThrowError(Error);
        expect(positions).toStrictEqual([]);
      });
    });
  });
});
