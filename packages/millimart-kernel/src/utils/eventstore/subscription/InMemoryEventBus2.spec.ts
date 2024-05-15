import { describe, expect, it } from "vitest";
import { SubscriptionError } from ".";
import { InMemoryEventStore } from "..";
import { InMemoryEventBus2 } from "./InMemoryEventBus2";
import { SequentialSubscriptionIdFactory } from "./SequentialSubscriptionIdFactory";

type TestEvent = {
  id: string;
  data: unknown;
};

const source = "/producer";

describe("InMemoryEventBus2", () => {
  describe("channels", () => {
    it("creates a channel when subscribed", async () => {
      const store = new InMemoryEventStore<TestEvent>((e) => e.id);
      const bus = new InMemoryEventBus2({ source, store });
      expect(bus.channels.size).toBe(0);

      const subscription = await bus.subscriptions.subscribe({
        sink: "/consumers/1",
      });

      expect(bus.channels.size).toBe(1);
      expect(bus.channels.get(subscription.sink)!.sink).toBe(subscription.sink);
    });

    it("deletes a channel when unsubscribed", async () => {
      const store = new InMemoryEventStore<TestEvent>((e) => e.id);
      const bus = new InMemoryEventBus2({ source, store });
      const subscription = await bus.subscriptions.subscribe({
        sink: "/consumers/1",
      });

      bus.subscriptions.unsubscribe(subscription.id);

      expect(bus.channels.size).toBe(0);
      expect(bus.channels.get(subscription.sink)).toBeUndefined();
    });

    it("receives events for each channel", async () => {
      const store = new InMemoryEventStore<TestEvent>((e) => e.id);
      const bus = new InMemoryEventBus2({ source, store });
      const s1 = await bus.subscriptions.subscribe({ sink: "/consumers/1" });
      const s2 = await bus.subscriptions.subscribe({ sink: "/consumers/2" });
      const c1 = bus.channels.get(s1.sink)!;
      const c2 = bus.channels.get(s2.sink)!;

      const e1: TestEvent = { id: "1", data: "A" };
      const e2: TestEvent = { id: "2", data: "B" };
      const e3: TestEvent = { id: "3", data: "C" };
      await store.append(e1);
      await store.append(e2);
      await store.append(e3);

      const r1: TestEvent[] = [];
      await c1.receive((e) => r1.push(e));
      await c1.receive((e) => r1.push(e));
      await c1.receive((e) => r1.push(e));

      const r2: TestEvent[] = [];
      await c2.receive((e) => r2.push(e));
      await c2.receive((e) => r2.push(e));
      await c2.receive((e) => r2.push(e));

      expect(r1).toStrictEqual([e1, e2, e3]);
      expect(r2).toStrictEqual([e1, e2, e3]);
    });

    it("updates subscription status", async () => {
      const store = new InMemoryEventStore<TestEvent>((e) => e.id);
      const bus = new InMemoryEventBus2({ source, store });
      const s = await bus.subscriptions.subscribe({
        sink: "/consumers/1",
      });
      const channel = bus.channels.get(s.sink)!;

      const e1: TestEvent = { id: "1", data: "A" };
      const e2: TestEvent = { id: "2", data: "B" };
      const e3: TestEvent = { id: "3", data: "C" };
      await store.append(e1);
      await store.append(e2);
      await store.append(e3);
      expect(bus.subscriptions.getById(s.id)?.status).toStrictEqual({});

      const result: TestEvent[] = [];
      await channel.receive((e) => result.push(e));
      expect(bus.subscriptions.getById(s.id)?.status).toStrictEqual({
        lastEventId: "1",
      });

      await channel.receive((e) => result.push(e));
      expect(bus.subscriptions.getById(s.id)?.status).toStrictEqual({
        lastEventId: "2",
      });

      await channel.receive((e) => result.push(e));
      expect(bus.subscriptions.getById(s.id)?.status).toStrictEqual({
        lastEventId: "3",
      });
    });
  });

  describe("subscriptions", () => {
    describe("subscribe", () => {
      it("creates new subscription", async () => {
        const store = new InMemoryEventStore<TestEvent>((e) => e.id);
        const bus = new InMemoryEventBus2({
          source,
          store,
          subscriptionIdFactory: SequentialSubscriptionIdFactory,
        });

        const subscription = await bus.subscriptions.subscribe({
          sink: "/consumers/1",
        });

        expect(subscription).toStrictEqual({
          id: "1",
          sink: "/consumers/1",
          config: {},
          status: {},
        });
      });

      it("creates new subscription (config)", async () => {
        const store = new InMemoryEventStore<TestEvent>((e) => e.id);
        const bus = new InMemoryEventBus2({
          source,
          store,
          subscriptionIdFactory: SequentialSubscriptionIdFactory,
        });

        const subscription = await bus.subscriptions.subscribe({
          sink: "/consumers/1",
          config: {
            param1: "abc",
            param2: 123,
          },
        });

        expect(subscription).toStrictEqual({
          id: "1",
          sink: "/consumers/1",
          config: {
            param1: "abc",
            param2: 123,
          },
          status: {},
        });
      });
    });

    it("creates new subscription (resend from first)", async () => {
      const store = new InMemoryEventStore<TestEvent>((e) => e.id);
      const bus = new InMemoryEventBus2({
        source,
        store,
        subscriptionIdFactory: SequentialSubscriptionIdFactory,
      });

      const e1: TestEvent = { id: "1", data: "A" };
      const e2: TestEvent = { id: "2", data: "B" };
      const e3: TestEvent = { id: "3", data: "C" };
      await store.append(e1);
      await store.append(e2);
      await store.append(e3);

      const subscription = await bus.subscriptions.subscribe({
        sink: "/consumers/1",
        resend: { from: "First" },
      });

      expect(subscription).toStrictEqual({
        id: "1",
        sink: "/consumers/1",
        config: {},
        status: {},
      });
    });

    it("creates new subscription (resend from next)", async () => {
      const store = new InMemoryEventStore<TestEvent>((e) => e.id);
      const bus = new InMemoryEventBus2({
        source,
        store,
        subscriptionIdFactory: SequentialSubscriptionIdFactory,
      });

      const e1: TestEvent = { id: "1", data: "A" };
      const e2: TestEvent = { id: "2", data: "B" };
      const e3: TestEvent = { id: "3", data: "C" };
      await store.append(e1);
      await store.append(e2);
      await store.append(e3);

      const subscription = await bus.subscriptions.subscribe({
        sink: "/consumers/1",
        resend: { from: "Next" },
      });

      expect(subscription).toStrictEqual({
        id: "1",
        sink: "/consumers/1",
        config: {},
        status: {
          lastEventId: "3",
        },
      });
    });

    it("creates new subscription (resend from next event)", async () => {
      const store = new InMemoryEventStore<TestEvent>((e) => e.id);
      const bus = new InMemoryEventBus2({
        source,
        store,
        subscriptionIdFactory: SequentialSubscriptionIdFactory,
      });

      const e1: TestEvent = { id: "1", data: "A" };
      const e2: TestEvent = { id: "2", data: "B" };
      const e3: TestEvent = { id: "3", data: "C" };
      await store.append(e1);
      await store.append(e2);
      await store.append(e3);

      const subscription = await bus.subscriptions.subscribe({
        sink: "/consumers/1",
        resend: { from: "Next", lastEventId: "2" },
      });

      expect(subscription).toStrictEqual({
        id: "1",
        sink: "/consumers/1",
        config: {},
        status: {
          lastEventId: "2",
        },
      });
    });

    it("throws an error if the event not exists (resend from next event)", async () => {
      const store = new InMemoryEventStore<TestEvent>((e) => e.id);
      const bus = new InMemoryEventBus2({
        source,
        store,
        subscriptionIdFactory: SequentialSubscriptionIdFactory,
      });

      const e1: TestEvent = { id: "1", data: "A" };
      const e2: TestEvent = { id: "2", data: "B" };
      const e3: TestEvent = { id: "3", data: "C" };
      await store.append(e1);
      await store.append(e2);
      await store.append(e3);

      expect(() =>
        bus.subscriptions.subscribe({
          sink: "/consumers/1",
          resend: { from: "Next", lastEventId: "4" },
        }),
      ).rejects.toThrowError(SubscriptionError);
    });
  });
});
