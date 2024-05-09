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
  describe("append", () => {
    it("appends an events at the end", async () => {
      const store: EventStore<TestEvent> = new InMemoryEventStore((e) => e.id);
      const e1 = { id: "1", data: "A" };
      const e2 = { id: "2", data: "B" };
      const e3 = { id: "3", data: "C" };

      await store.append(e1);
      await store.append(e2);
      await store.append(e3);

      expect(await fromAsync(store.read())).toStrictEqual([e1, e2, e3]);
    });

    it("throws an error if event ID is duplicated", async () => {
      const store: EventStore<TestEvent> = new InMemoryEventStore((e) => e.id);
      const e1 = { id: "1", data: "A" };

      await store.append(e1);

      await expect(async () => await store.append(e1)).rejects.toThrowError(
        EventStoreError,
      );
    });
  });

  describe("read", () => {
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

    it("iterates all events", async () => {
      expect(await fromAsync(store.read())).toStrictEqual([e1, e2, e3, e4, e5]);
    });

    it("iterates nothing if no events are appended", async () => {
      const store = new InMemoryEventStore<TestEvent>((event) => event.id);
      expect(await fromAsync(store.read())).toStrictEqual([]);
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

  describe("readOne", () => {
    let store: EventStore<TestEvent>;
    const e1 = { id: "1", data: "A" };
    const e2 = { id: "2", data: "B" };
    const e3 = { id: "3", data: "C" };

    beforeEach(async () => {
      store = new InMemoryEventStore<TestEvent>((event) => event.id);
      [e1, e2, e3].forEach(async (e) => await store.append(e));
    });

    it("returns the specified event", async () => {
      expect(await store.readOne("1")).toStrictEqual(e1);
      expect(await store.readOne("2")).toStrictEqual(e2);
      expect(await store.readOne("3")).toStrictEqual(e3);
    });

    it("throws an error if event not found", async () => {
      await expect(async () => await store.readOne("4")).rejects.toBeInstanceOf(
        EventStoreError,
      );
    });
  });
});
