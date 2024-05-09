import { describe, expect, it } from "vitest";
import { MarketEvent, MarketEventError, createMarketEvent } from "..";
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
    data: { item: { id: "apple", name: "Apple", emoji: "🍎" } },
  }),
  createMarketEvent("ItemRegistered", {
    source: "/",
    data: { item: { id: "broccoli", name: "Broccoli 1", emoji: "🥦" } },
  }),
  createMarketEvent("ItemRegistered", {
    source: "/",
    data: { item: { id: "broccoli", name: "Broccoli 2", emoji: "🥦" } },
  }),
];

describe("ItemReducer", () => {
  it("replays the item state from the events", () => {
    const state = validEvents.reduce(
      ItemReducer({ itemId: "broccoli" }),
      undefined,
    );
    expect(state).toStrictEqual({
      id: "broccoli",
      name: "Broccoli",
      emoji: "🥦",
    });
  });

  it("returns nothing if item is not registered", () => {
    const state = [].reduce(ItemReducer({ itemId: "broccoli" }), undefined);
    expect(state).toStrictEqual(undefined);
  });

  it("throws an error if the item is already registered", () => {
    expect(() =>
      invalidEvents.reduce(ItemReducer({ itemId: "broccoli" }), undefined),
    ).toThrowError(MarketEventError);
  });
});
