import { describe, expect, it } from "vitest";
import { EventBusAdapter, EventBusAdapterOptions } from "./EventBusAdapter";
import { InMemoryEventBus } from "./InMemoryEventBus";

type TestEvent = {
  type: "Foo" | "Bar" | "Baz";
  data: string;
};

type TestInfo = {
  name: string;
};

describe("EventBusAdapter", () => {
  describe("send/receive", () => {
    it("sends an event to the bus, and receives all events", async () => {
      const bus = new InMemoryEventBus<TestEvent>();
      const adapter1 = new EventBusAdapter(bus);
      const adapter2 = new EventBusAdapter(bus);
      const adapter3 = new EventBusAdapter(bus);

      const result1: TestEvent[] = [];
      const result2: TestEvent[] = [];
      const result3: TestEvent[] = [];
      adapter1.receive((e) => result1.push(e));
      adapter2.receive((e) => result2.push(e));
      adapter3.receive((e) => result3.push(e));

      const e1: TestEvent = { type: "Foo", data: "1" };
      const e2: TestEvent = { type: "Bar", data: "2" };
      const e3: TestEvent = { type: "Baz", data: "3" };
      adapter1.send(e1);
      adapter2.send(e2);
      adapter3.send(e3);

      expect(result1).toStrictEqual([e1, e2, e3]);
      expect(result2).toStrictEqual([e1, e2, e3]);
      expect(result3).toStrictEqual([e1, e2, e3]);
    });

    it("sends an event to the bus, and receives all events except sent by oneself", async () => {
      const bus = new InMemoryEventBus<TestEvent>();
      const options: EventBusAdapterOptions<TestEvent> = {
        sendPredicate: ({ self }) => !self,
      };
      const adapter1 = new EventBusAdapter(bus, options);
      const adapter2 = new EventBusAdapter(bus, options);
      const adapter3 = new EventBusAdapter(bus, options);

      const result1: TestEvent[] = [];
      const result2: TestEvent[] = [];
      const result3: TestEvent[] = [];
      adapter1.receive((e) => result1.push(e));
      adapter2.receive((e) => result2.push(e));
      adapter3.receive((e) => result3.push(e));

      const e1: TestEvent = { type: "Foo", data: "1" };
      const e2: TestEvent = { type: "Bar", data: "2" };
      const e3: TestEvent = { type: "Baz", data: "3" };
      adapter1.send(e1);
      adapter2.send(e2);
      adapter3.send(e3);

      expect(result1).toStrictEqual([e2, e3]);
      expect(result2).toStrictEqual([e1, e3]);
      expect(result3).toStrictEqual([e1, e2]);
    });

    it("sends an event to the bus, and receives all events to specific subscribers", async () => {
      const bus = new InMemoryEventBus<TestEvent, TestInfo>();
      const adapter1 = new EventBusAdapter(bus, {
        info: { name: "alice" },
        sendPredicate: ({ target }) => target?.name === "bob",
      });
      const adapter2 = new EventBusAdapter(bus, {
        info: { name: "bob" },
        sendPredicate: ({ target }) => target?.name === "carol",
      });
      const adapter3 = new EventBusAdapter(bus, {
        info: { name: "carol" },
        sendPredicate: ({ target }) => target?.name === "alice",
      });

      const result1: TestEvent[] = [];
      const result2: TestEvent[] = [];
      const result3: TestEvent[] = [];
      adapter1.receive((e) => result1.push(e));
      adapter2.receive((e) => result2.push(e));
      adapter3.receive((e) => result3.push(e));

      const e1: TestEvent = { type: "Foo", data: "1" };
      const e2: TestEvent = { type: "Bar", data: "2" };
      const e3: TestEvent = { type: "Baz", data: "3" };
      adapter1.send(e1);
      adapter2.send(e2);
      adapter3.send(e3);

      expect(result1).toStrictEqual([e3]);
      expect(result2).toStrictEqual([e1]);
      expect(result3).toStrictEqual([e2]);
    });

    it("sends an event to the bus, and receives specific events match the predicate", async () => {
      const bus = new InMemoryEventBus<TestEvent>();
      const adapter1 = new EventBusAdapter(bus, {
        receivePredicate: (e) => e.type === "Foo",
      });
      const adapter2 = new EventBusAdapter(bus, {
        receivePredicate: (e) => e.type === "Bar",
      });
      const adapter3 = new EventBusAdapter(bus, {
        receivePredicate: (e) => e.type === "Baz",
      });

      const result1: TestEvent[] = [];
      const result2: TestEvent[] = [];
      const result3: TestEvent[] = [];
      adapter1.receive((e) => result1.push(e));
      adapter2.receive((e) => result2.push(e));
      adapter3.receive((e) => result3.push(e));

      const e1: TestEvent = { type: "Foo", data: "1" };
      const e2: TestEvent = { type: "Bar", data: "2" };
      const e3: TestEvent = { type: "Baz", data: "3" };
      adapter1.send(e1);
      adapter2.send(e2);
      adapter3.send(e3);

      expect(result1).toStrictEqual([e1]);
      expect(result2).toStrictEqual([e2]);
      expect(result3).toStrictEqual([e3]);
    });
  });
});
