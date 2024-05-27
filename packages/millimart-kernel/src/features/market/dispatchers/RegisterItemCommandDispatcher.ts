import { MarketCommandError } from "../MarketCommandError";
import { RegisterItemCommand } from "../MarketCommandSchema";
import { createMarketEvent, toItemRef } from "../rules";
import { MarketCommandDispatcherHelper } from "./MarketCommandDispatcherHelper";
import { MarketCommandDispatcher } from "./types";

export const RegisterItemCommandDispatcher: MarketCommandDispatcher<
  RegisterItemCommand
> = ({ store, source }) =>
  async function* (command) {
    const helper = new MarketCommandDispatcherHelper({ store, source });
    const item = await helper.getItem(command.data);

    // Validate item.
    if (item !== undefined) {
      throw new MarketCommandError(
        "ItemAlreadyExistsError",
        toItemRef(command.data),
      );
    }

    yield createMarketEvent("ItemRegistered", {
      source,
      data: { item: command.data.item },
    });
  };
