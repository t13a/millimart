import { MarketEvent } from "../MarketEventSchema";
import { ItemList } from "../values";

export const ItemListReducer =
  () =>
  (state: ItemList | undefined, event: MarketEvent): ItemList | undefined => {
    if (state === undefined) {
      state = [];
    }

    switch (event.type) {
      case "internal.millimart.market.v1.ItemRegistered":
        if (!state.find((item) => item.id === event.data.item.id)) {
          return [...state, event.data.item];
        }
        break;
    }

    return state;
  };
