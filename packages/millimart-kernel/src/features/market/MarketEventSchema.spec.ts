import { describe, expect, it } from "vitest";
import { MarketEventSchema } from "./MarketEventSchema";
import { createMarketEvent } from "./rules/createMarketEvent";

describe("MarketEventSchema", () => {
  it("parses an event (UserEntered)", () => {
    const event = createMarketEvent("UserEntered", {
      source: "millimart.internal",
      data: {
        user: {
          id: "johnsmith",
          balance: { currency: "TMP", value: 1000 },
          emoji: "👨",
        },
      },
    });
    expect(MarketEventSchema.parse(event)).toBeTruthy();
  });

  it("parses an event (UserLeft)", () => {
    const event = createMarketEvent("UserLeft", {
      source: "millimart.internal",
      data: {
        userId: "johnsmith",
      },
    });
    expect(MarketEventSchema.parse(event)).toBeTruthy();
  });

  it("parses an event (ItemRegistered)", () => {
    const event = createMarketEvent("ItemRegistered", {
      source: "millimart.internal",
      data: {
        item: {
          id: "tomato",
          name: "Tomato",
          emoji: "🍅",
        },
      },
    });
    expect(MarketEventSchema.parse(event)).toBeTruthy();
  });

  it("parses an event (OrderConfirmed)", () => {
    const event = createMarketEvent("OrderConfirmed", {
      source: "millimart.internal",
      data: {
        order: {
          id: 123,
          sellerId: "alice",
          buyerId: "bob",
          items: [{ itemId: "tomato", quantity: 2 }],
          amount: { currency: "TMP", value: 20 },
        },
      },
    });
    expect(MarketEventSchema.parse(event)).toBeTruthy();
  });
});
