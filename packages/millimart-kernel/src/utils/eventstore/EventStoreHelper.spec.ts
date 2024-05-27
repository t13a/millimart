import { describe, expect, it } from "vitest";
import { EventStoreError } from "./EventStoreError";
import { EventStoreHelper } from "./EventStoreHelper";
import { InMemoryEventStore } from "./InMemoryEventStore";

type TestEvent = {
  id: string;
  data: string;
};

const e1 = { id: "1", data: "A" };
const e2 = { id: "2", data: "B" };
const e3 = { id: "3", data: "C" };

const store = new InMemoryEventStore<TestEvent>((event) => event.id);
await store.append(e1);
await store.append(e2);
await store.append(e3);

const emptyStore = new InMemoryEventStore<TestEvent>((event) => event.id);

describe("EventStoreHelper", () => {
  describe("has", async () => {
    it("returns true if the event exists", async () => {
      const helper = new EventStoreHelper(store);
      expect(await helper.has("1")).toBe(true);
    });

    it("returns false if the event does not exist", async () => {
      const helper = new EventStoreHelper(store);
      expect(await helper.has("4")).toBe(false);
    });
  });

  describe("readFirstOne", async () => {
    it("returns the first event", async () => {
      const helper = new EventStoreHelper(store);
      expect(await helper.readFirstOne()).toStrictEqual(e1);
    });

    it("returns the first event (filter)", async () => {
      const helper = new EventStoreHelper(store);
      expect(await helper.readFirstOne((e) => e.data !== "A")).toStrictEqual(
        e2,
      );
    });

    it("returns nothing if there is no event", async () => {
      const helper = new EventStoreHelper(emptyStore);
      expect(await helper.readFirstOne()).toBeUndefined();
    });
  });

  describe("readLastOne", () => {
    it("returns the last event", async () => {
      const helper = new EventStoreHelper(store);
      expect(await helper.readLastOne()).toStrictEqual(e3);
    });

    it("returns the last event (filter)", async () => {
      const helper = new EventStoreHelper(store);
      expect(await helper.readLastOne((e) => e.data !== "C")).toStrictEqual(e2);
    });

    it("returns nothing if there is no event", async () => {
      const helper = new EventStoreHelper(emptyStore);
      expect(await helper.readLastOne()).toBeUndefined();
    });
  });

  describe("readNextOne", () => {
    it("returns the next event by ID", async () => {
      const helper = new EventStoreHelper(store);
      expect(await helper.readNextOne("1")).toStrictEqual(e2);
    });

    it("returns the next event by ID (filter)", async () => {
      const helper = new EventStoreHelper(store);
      expect(
        await helper.readNextOne("1", (e) => e.data !== "B"),
      ).toStrictEqual(e3);
    });

    it("returns nothing if the next event does not exist", async () => {
      const helper = new EventStoreHelper(store);
      expect(await helper.readNextOne("3")).toBeUndefined();
    });
  });

  describe("readOne", () => {
    it("returns the event by ID", async () => {
      const helper = new EventStoreHelper(store);
      expect(await helper.readOne("1")).toStrictEqual(e1);
      expect(await helper.readOne("2")).toStrictEqual(e2);
      expect(await helper.readOne("3")).toStrictEqual(e3);
    });

    it("throws an error if the event does not exist", async () => {
      const helper = new EventStoreHelper(store);
      expect(() => helper.readOne("4")).rejects.toThrowError(EventStoreError);
    });
  });

  describe("readPrevOne", () => {
    it("returns the previous event by ID", async () => {
      const helper = new EventStoreHelper(store);
      expect(await helper.readPrevOne("3")).toStrictEqual(e2);
    });

    it("returns the previous event by ID (filter)", async () => {
      const helper = new EventStoreHelper(store);
      expect(
        await helper.readPrevOne("3", (e) => e.data !== "B"),
      ).toStrictEqual(e1);
    });

    it("returns nothing if the previous event does not exist", async () => {
      const helper = new EventStoreHelper(store);
      expect(await helper.readPrevOne("1")).toBeUndefined();
    });
  });
});
