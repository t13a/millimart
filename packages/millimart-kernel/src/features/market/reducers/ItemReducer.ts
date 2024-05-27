import { Reducer } from "../../../utils";
import { MarketEvent } from "../MarketEventSchema";
import { Item, ItemRef } from "../values";

export class ItemReducer implements Reducer<Item | undefined, MarketEvent> {
  constructor(private itemRef: ItemRef) {}

  init(): Item | undefined {
    return undefined;
  }

  next(state: Item | undefined, event: MarketEvent): Item | undefined {
    switch (event.type) {
      case "internal.millimart.market.v1.ItemRegistered":
        if (event.data.item.id !== this.itemRef.itemId) {
          return state;
        }
        if (state !== undefined) {
          return state;
        }
        return event.data.item;
    }
    return state;
  }
}
