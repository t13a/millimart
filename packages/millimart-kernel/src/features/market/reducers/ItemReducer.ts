import { MarketError, MarketEvent } from "..";
import { Item } from "../values";

export type ItemReducerProps = {
  itemId: Item["id"];
};

export const ItemReducer =
  ({ itemId }: ItemReducerProps) =>
  (state: Item | undefined, event: MarketEvent): Item | undefined => {
    switch (event.type) {
      case "internal.millimart.market.v1.ItemRegistered": {
        if (event.data.id !== itemId) {
          return state;
        }
        if (state !== undefined) {
          throw new MarketError("ItemAlreadyExistsError", {
            item: event.data,
          });
        }
        return event.data;
      }
    }

    return state;
  };
