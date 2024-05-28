import { createMarketEvent, toItemRef } from "../../rules";
import { MarketCommandError } from "../MarketCommandError";
import { MarketCommandHelper } from "../MarketCommandHelper";
import { RegisterItemCommand } from "../MarketCommandSchema";
import { MarketCommandHandler } from "./types";

export const RegisterItemCommandHandler: MarketCommandHandler<
  RegisterItemCommand
> = ({ store, source }) =>
  async function* (command) {
    const helper = new MarketCommandHelper({ store, source });
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
