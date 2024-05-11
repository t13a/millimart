import { Reducer } from "../../../utils";
import { MarketEvent } from "../MarketEventSchema";
import { Item, ItemRef } from "../values";

export const ItemReducer =
  ({ itemId }: ItemRef): Reducer<Item, MarketEvent> =>
  (state, event) => {
    switch (event.type) {
      case "internal.millimart.market.v1.ItemRegistered":
        if (event.data.item.id !== itemId) {
          return state;
        }
        if (state !== undefined) {
          return state;
        }
        return event.data.item;
    }
    return state;
  };
