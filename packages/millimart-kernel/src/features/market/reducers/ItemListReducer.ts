import { Reducer } from "../../../utils";
import { MarketEvent } from "../MarketEventSchema";
import { ItemList } from "../values";

export class ItemListReducer implements Reducer<ItemList, MarketEvent> {
  init(): ItemList {
    return [];
  }

  next(state: ItemList, event: MarketEvent): ItemList {
    switch (event.type) {
      case "internal.millimart.market.v1.ItemRegistered":
        const found = !!state.find((item) => item.id === event.data.item.id);
        return found ? state : [...state, event.data.item];
    }
    return state;
  }
}
