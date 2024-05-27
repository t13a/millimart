import { nextTick } from "process";
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

    it("emits an event if any listener added", async () => {
      const store: EventStore<TestEvent> = new InMemoryEventStore((e) => e.id);
      const result: TestEvent[] = [];
      store.on("append", (event: TestEvent) => result.push(event));

      const e1 = { id: "1", data: "A" };
      await store.append(e1);

      expect(result).toStrictEqual([e1]);
    });

    it("emits an error event if any listener failed (sync)", async () => {
      const store: EventStore<TestEvent> = new InMemoryEventStore((e) => e.id);
      const errors: unknown[] = [];
      store.on("append", () => {
        throw new Error("Test");
      });
      store.on("error", (error) => errors.push(error));

      const e1 = { id: "1", data: "A" };
      await store.append(e1);

      expect(errors.length).toBe(1);
      expect(errors[0]).instanceOf(Error);
    });

    it("emits an error event if any listener failed (async)", async () => {
      const store: EventStore<TestEvent> = new InMemoryEventStore((e) => e.id);
      const errors: unknown[] = [];
      store.on("append", async () => {
        throw new Error("Test");
      });
      store.on("error", (error) => errors.push(error));

      const e1 = { id: "1", data: "A" };
      await store.append(e1);
      await new Promise((resolve) => nextTick(resolve, 0));

      expect(errors.length).toBe(1);
      expect(errors[0]).instanceOf(Error);
    });
  });

  describe("extractEventId", () => {
    it("returns an event ID from an event", () => {
      const store: EventStore<TestEvent> = new InMemoryEventStore((e) => e.id);

      const e1 = { id: "1", data: "A" };

      expect(store.extractEventId(e1)).toBe("1");
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

    it("iterates all events (backwards)", async () => {
      expect(
        await fromAsync(store.read({ direction: "backwards" })),
      ).toStrictEqual([e5, e4, e3, e2, e1]);
    });

    it("iterates nothing if no events are appended", async () => {
      const store = new InMemoryEventStore<TestEvent>((event) => event.id);
      expect(await fromAsync(store.read())).toStrictEqual([]);
    });

    it("iterates nothing if no events are appended (backwards)", async () => {
      const store = new InMemoryEventStore<TestEvent>((event) => event.id);
      expect(
        await fromAsync(store.read({ direction: "backwards" })),
      ).toStrictEqual([]);
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

    it("iterates events that match options (fromEventId, backwards)", async () => {
      expect(
        await fromAsync(
          store.read({
            direction: "backwards",
            fromEventId: "2",
          }),
        ),
      ).toStrictEqual([e2, e1]);
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

    it("iterates events that match options (toEventId, backwards)", async () => {
      expect(
        await fromAsync(
          store.read({
            direction: "backwards",
            toEventId: "4",
          }),
        ),
      ).toStrictEqual([e5, e4]);
    });

    it("iterates events that match options (skipCount < length)", async () => {
      expect(
        await fromAsync(
          store.read({
            skipCount: 3,
          }),
        ),
      ).toStrictEqual([e4, e5]);
    });

    it("iterates events that match options (skipCount < length, backwards)", async () => {
      expect(
        await fromAsync(
          store.read({
            direction: "backwards",
            skipCount: 3,
          }),
        ),
      ).toStrictEqual([e2, e1]);
    });

    it("iterates events that match options (skipCount = length)", async () => {
      expect(
        await fromAsync(
          store.read({
            skipCount: 5,
          }),
        ),
      ).toStrictEqual([]);
    });

    it("iterates events that match options (skipCount = length, backwards)", async () => {
      expect(
        await fromAsync(
          store.read({
            direction: "backwards",
            skipCount: 5,
          }),
        ),
      ).toStrictEqual([]);
    });

    it("iterates events that match options (skipCount > length)", async () => {
      expect(
        await fromAsync(
          store.read({
            skipCount: 7,
          }),
        ),
      ).toStrictEqual([]);
    });

    it("iterates events that match options (skipCount > length, backwards)", async () => {
      expect(
        await fromAsync(
          store.read({
            direction: "backwards",
            skipCount: 7,
          }),
        ),
      ).toStrictEqual([]);
    });

    it("iterates events that match options (maxCount < length)", async () => {
      expect(
        await fromAsync(
          store.read({
            maxCount: 3,
          }),
        ),
      ).toStrictEqual([e1, e2, e3]);
    });

    it("iterates events that match options (maxCount < length, backwards)", async () => {
      expect(
        await fromAsync(
          store.read({
            direction: "backwards",
            maxCount: 3,
          }),
        ),
      ).toStrictEqual([e5, e4, e3]);
    });

    it("iterates events that match options (maxCount = length)", async () => {
      expect(
        await fromAsync(
          store.read({
            maxCount: 5,
          }),
        ),
      ).toStrictEqual([e1, e2, e3, e4, e5]);
    });

    it("iterates events that match options (maxCount = length, backwards)", async () => {
      expect(
        await fromAsync(
          store.read({
            direction: "backwards",
            maxCount: 5,
          }),
        ),
      ).toStrictEqual([e5, e4, e3, e2, e1]);
    });

    it("iterates events that match options (maxCount > length)", async () => {
      expect(
        await fromAsync(
          store.read({
            maxCount: 7,
          }),
        ),
      ).toStrictEqual([e1, e2, e3, e4, e5]);
    });

    it("iterates events that match options (maxCount > length, backwards)", async () => {
      expect(
        await fromAsync(
          store.read({
            direction: "backwards",
            maxCount: 7,
          }),
        ),
      ).toStrictEqual([e5, e4, e3, e2, e1]);
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

    it("iterates events that match options (fromEventId, toEventId, backwards)", async () => {
      expect(
        await fromAsync(
          store.read({
            direction: "backwards",
            fromEventId: "4",
            toEventId: "2",
          }),
        ),
      ).toStrictEqual([e4, e3, e2]);
    });

    it("iterates events that match options (fromEventId, toEventId, skipCount)", async () => {
      expect(
        await fromAsync(
          store.read({
            fromEventId: "2",
            toEventId: "4",
            skipCount: 1,
          }),
        ),
      ).toStrictEqual([e3, e4]);
    });

    it("iterates events that match options (fromEventId, toEventId, skipCount, backwards)", async () => {
      expect(
        await fromAsync(
          store.read({
            direction: "backwards",
            fromEventId: "4",
            toEventId: "2",
            skipCount: 1,
          }),
        ),
      ).toStrictEqual([e3, e2]);
    });

    it("iterates events that match options (fromEventId, toEventId, skipCount, maxCount)", async () => {
      expect(
        await fromAsync(
          store.read({
            fromEventId: "2",
            toEventId: "4",
            skipCount: 1,
            maxCount: 1,
          }),
        ),
      ).toStrictEqual([e3]);
    });

    it("iterates events that match options (fromEventId, toEventId, skipCount, maxCount, backwards)", async () => {
      expect(
        await fromAsync(
          store.read({
            direction: "backwards",
            fromEventId: "4",
            toEventId: "2",
            skipCount: 1,
            maxCount: 1,
          }),
        ),
      ).toStrictEqual([e3]);
    });
  });
});
