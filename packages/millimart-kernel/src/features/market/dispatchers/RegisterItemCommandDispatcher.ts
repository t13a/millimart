import { MarketCommandError } from "../MarketCommandError";
import { RegisterItemCommand } from "../MarketCommandSchema";
import { createMarketEvent } from "../rules";
import { MarketCommandDispatcherHelper } from "./MarketCommandDispatcherHelper";
import { MarketCommandDispatcher } from "./types";

export const RegisterItemCommandDispatcher: MarketCommandDispatcher<
  RegisterItemCommand
> = ({ store, source }) =>
  async function* (command) {
    const helper = new MarketCommandDispatcherHelper({ store, source });
    const itemRef = { itemId: command.data.item.id };
    const item = await helper.getItem(itemRef);

    // Validate item.
    if (item !== undefined) {
      throw new MarketCommandError("ItemAlreadyExistsError", itemRef);
    }

    yield createMarketEvent("ItemRegistered", {
      source,
      data: { item: command.data.item },
    });
  };
