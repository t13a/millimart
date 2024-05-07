import { describe, expect, it } from "vitest";
import { EventHandler } from ".";
import { InMemoryEventBus } from "./InMemoryEventBus";

type TestEvent = {
  type: "Foo" | "Bar";
  data: string;
};

type TestInfo = {
  name: string;
};

describe("InMemoryEventBus", () => {
  describe("publish", () => {
    it("sends a event to all subscribers", async () => {
      const bus = new InMemoryEventBus<TestEvent>();

      const result1: TestEvent[] = [];
      const result2: TestEvent[] = [];
      bus.subscribe({ handler: (e) => result1.push(e) });
      bus.subscribe({ handler: (e) => result2.push(e) });

      const e1: TestEvent = { type: "Foo", data: "1" };
      const e2: TestEvent = { type: "Bar", data: "2" };
      await bus.publish(e1);
      await bus.publish(e2);

      expect(result1).toStrictEqual([e1, e2]);
      expect(result2).toStrictEqual([e1, e2]);
    });

    it("sends a event to specific subscribers (by handler)", async () => {
      const bus = new InMemoryEventBus<TestEvent>();

      const result1: TestEvent[] = [];
      const result2: TestEvent[] = [];
      const handler1: EventHandler<TestEvent> = (e) => result1.push(e);
      const handler2: EventHandler<TestEvent> = (e) => result2.push(e);
      bus.subscribe({ handler: handler1 });
      bus.subscribe({ handler: handler2 });

      const e1: TestEvent = { type: "Foo", data: "1" };
      const e2: TestEvent = { type: "Bar", data: "2" };
      await bus.publish(e1, (s) => s.handler !== handler1);
      await bus.publish(e2, (s) => s.handler !== handler2);

      expect(result1).toStrictEqual([e2]);
      expect(result2).toStrictEqual([e1]);
    });

    it("sends a event to specific subscribers (by info)", async () => {
      const bus = new InMemoryEventBus<TestEvent, TestInfo>();

      const result1: TestEvent[] = [];
      const result2: TestEvent[] = [];
      const handler1: EventHandler<TestEvent> = (e) => result1.push(e);
      const handler2: EventHandler<TestEvent> = (e) => result2.push(e);
      bus.subscribe({ handler: handler1, info: { name: "alice" } });
      bus.subscribe({ handler: handler2, info: { name: "bob" } });

      const e1: TestEvent = { type: "Foo", data: "1" };
      const e2: TestEvent = { type: "Bar", data: "2" };
      await bus.publish(e1, (s) => s.info?.name === "alice");
      await bus.publish(e2, (s) => s.info?.name === "bob");

      expect(result1).toStrictEqual([e1]);
      expect(result2).toStrictEqual([e2]);
    });
  });

  describe("subscribe", () => {
    it("receives all events", async () => {
      const bus = new InMemoryEventBus<TestEvent>();

      const result1: TestEvent[] = [];
      const result2: TestEvent[] = [];
      bus.subscribe({ handler: (e) => result1.push(e) });
      bus.subscribe({ handler: (e) => result2.push(e) });

      const e1: TestEvent = { type: "Foo", data: "1" };
      const e2: TestEvent = { type: "Bar", data: "2" };
      await bus.publish(e1);
      await bus.publish(e2);

      expect(result1).toStrictEqual([e1, e2]);
      expect(result2).toStrictEqual([e1, e2]);
    });

    it("receives specific events that match the predicate", async () => {
      const bus = new InMemoryEventBus<TestEvent>();

      const result1: TestEvent[] = [];
      const result2: TestEvent[] = [];
      bus.subscribe({
        handler: (e) => result1.push(e),
        predicate: (e) => e.type === "Foo",
      });
      bus.subscribe({
        handler: (e) => result2.push(e),
        predicate: (e) => e.type === "Bar",
      });

      const e1: TestEvent = { type: "Foo", data: "1" };
      const e2: TestEvent = { type: "Bar", data: "2" };
      await bus.publish(e1);
      await bus.publish(e2);

      expect(result1).toStrictEqual([e1]);
      expect(result2).toStrictEqual([e2]);
    });
  });

  describe("subscribe (unsubscribe)", () => {
    it("stops to receive events", async () => {
      const bus = new InMemoryEventBus<TestEvent>();

      const result1: TestEvent[] = [];
      const result2: TestEvent[] = [];
      const unsubscribe1 = bus.subscribe({ handler: (e) => result1.push(e) });
      const unsubscribe2 = bus.subscribe({ handler: (e) => result2.push(e) });

      unsubscribe1();

      const e1: TestEvent = { type: "Foo", data: "1" };
      await bus.publish(e1);
      expect(result1).toStrictEqual([]);
      expect(result2).toStrictEqual([e1]);

      unsubscribe2();

      const e2: TestEvent = { type: "Bar", data: "2" };
      await bus.publish(e2);
      expect(result1).toStrictEqual([]);
      expect(result2).toStrictEqual([e1]);
    });
  });
});
