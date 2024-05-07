import { beforeEach, describe, expect, it } from "vitest";
import { fromAsync } from "../misc";
import { EventStoreError } from "./EventStoreError";
import { InMemoryEventStore } from "./InMemoryEventStore";
import { EventStore } from "./types";

type TestEvent = {
  id: string;
  data: string;
};

describe("InMemoryEventStore", () => {
  describe("read()", () => {
    it("iterates all events", async () => {
      const store = new InMemoryEventStore<TestEvent>((event) => event.id);

      const e1 = { id: "1", data: "Foo" };
      const e2 = { id: "2", data: "Bar" };
      const e3 = { id: "3", data: "Baz" };
      [e1, e2, e3].forEach(async (e) => await store.append(e));

      expect(await fromAsync(store.read())).toStrictEqual([e1, e2, e3]);
    });

    it("iterates nothing if no events are appended", async () => {
      const store = new InMemoryEventStore<TestEvent>((event) => event.id);

      expect(await fromAsync(store.read())).toStrictEqual([]);
    });
  });

  describe("read(eventId)", () => {
    let store: EventStore<TestEvent>;
    const e1 = { id: "1", data: "A" };
    const e2 = { id: "2", data: "B" };
    const e3 = { id: "3", data: "C" };

    beforeEach(async () => {
      store = new InMemoryEventStore<TestEvent>((event) => event.id);
      [e1, e2, e3].forEach(async (e) => await store.append(e));
    });

    it("returns the specified event", async () => {
      expect(await store.read("1")).toStrictEqual(e1);
      expect(await store.read("2")).toStrictEqual(e2);
      expect(await store.read("3")).toStrictEqual(e3);
    });

    it("throws an error if event not found", async () => {
      await expect(async () => await store.read("4")).rejects.toBeInstanceOf(
        EventStoreError,
      );
    });
  });

  describe("read(options)", () => {
    let store: EventStore<TestEvent>;
    const e1 = { id: "1", data: "A" };
    const e2 = { id: "2", data: "B" };
    const e3 = { id: "3", data: "C" };
    const e4 = { id: "4", data: "D" };
    const e5 = { id: "5", data: "E" };

    beforeEach(async () => {
      store = new InMemoryEventStore<TestEvent>((event) => event.id);
      [e1, e2, e3, e4, e5].forEach(async (e) => await store.append(e));
    });

    it("iterates events that match options (fromEventId)", async () => {
      expect(
        await fromAsync(
          store.read({
            fromEventId: "2",
          }),
        ),
      ).toStrictEqual([e2, e3, e4, e5]);
    });

    it("iterates events that match options (toEventId)", async () => {
      expect(
        await fromAsync(
          store.read({
            toEventId: "4",
          }),
        ),
      ).toStrictEqual([e1, e2, e3, e4]);
    });

    it("iterates events that match options (maxCount)", async () => {
      expect(
        await fromAsync(
          store.read({
            maxCount: 3,
          }),
        ),
      ).toStrictEqual([e1, e2, e3]);
    });

    it("iterates events that match options (fromEventId, toEventId)", async () => {
      expect(
        await fromAsync(
          store.read({
            fromEventId: "2",
            toEventId: "4",
          }),
        ),
      ).toStrictEqual([e2, e3, e4]);
    });

    it("iterates events that match options (fromEventId, toEventId, maxCount)", async () => {
      expect(
        await fromAsync(
          store.read({
            fromEventId: "2",
            toEventId: "4",
            maxCount: 2,
          }),
        ),
      ).toStrictEqual([e2, e3]);
    });
  });
});
