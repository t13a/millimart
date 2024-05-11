import { MarketEvent } from "../MarketEventSchema";
import { ItemList } from "../values";

export const ItemListReducer =
  () =>
  (state: ItemList | undefined, event: MarketEvent): ItemList | undefined => {
    switch (event.type) {
      case "internal.millimart.market.v1.ItemRegistered":
        state = state ?? [];
        const isFound = !!state.find((item) => item.id === event.data.item.id);
        return isFound ? state : [...state, event.data.item];
    }
    return state;
  };
