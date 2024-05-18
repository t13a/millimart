import { describe, expect, it } from "vitest";
import { reduce } from "../../../utils";
import { MarketEvent } from "../MarketEventSchema";
import { createMarketEvent } from "../rules";
import { ItemReducer } from "./ItemReducer";

const validEvents: MarketEvent[] = [
  createMarketEvent("ItemRegistered", {
    source: "/",
    data: { item: { id: "apple", name: "Apple", emoji: "🍎" } },
  }),
  createMarketEvent("ItemRegistered", {
    source: "/",
    data: { item: { id: "broccoli", name: "Broccoli", emoji: "🥦" } },
  }),
  createMarketEvent("ItemRegistered", {
    source: "/",
    data: { item: { id: "cherry", name: "Cherry", emoji: "🍒" } },
  }),
];

const invalidEvents: MarketEvent[] = [
  createMarketEvent("ItemRegistered", {
    source: "/",
    data: { item: { id: "broccoli", name: "Broccoli", emoji: "🥦" } },
  }),
  createMarketEvent("ItemRegistered", {
    source: "/",
    data: {
      item: { id: "broccoli", name: "Broccoli (Duplicated)", emoji: "🥦" },
    },
  }),
];

describe("ItemReducer", () => {
  it("replays the item state from the events", () => {
    const { state } = reduce(
      new ItemReducer({ itemId: "broccoli" }),
      validEvents,
    );
    expect(state).toStrictEqual({
      id: "broccoli",
      name: "Broccoli",
      emoji: "🥦",
    });
  });

  it("returns nothing if item is not registered", () => {
    const { state } = reduce(new ItemReducer({ itemId: "broccoli" }), []);
    expect(state).toStrictEqual(undefined);
  });

  it("ignores the event if the item is already registered", () => {
    const { state } = reduce(
      new ItemReducer({ itemId: "broccoli" }),
      invalidEvents,
    );
    expect(state).toStrictEqual({
      id: "broccoli",
      name: "Broccoli",
      emoji: "🥦",
    });
  });
});
