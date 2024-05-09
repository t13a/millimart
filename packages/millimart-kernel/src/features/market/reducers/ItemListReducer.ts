import { MarketEvent } from "..";
import { ItemList } from "../values";

export const ItemListReducer =
  () =>
  (state: ItemList | undefined, event: MarketEvent): ItemList | undefined => {
    if (state === undefined) {
      state = [];
    }

    switch (event.type) {
      case "internal.millimart.market.v1.ItemRegistered":
        if (!state.find((item) => item.id === event.data.id)) {
          return [...state, event.data];
        }
        break;
    }

    return state;
  };
