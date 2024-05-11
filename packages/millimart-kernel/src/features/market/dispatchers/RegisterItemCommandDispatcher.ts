import { useStream } from "../../../utils";
import { MarketCommandError } from "../MarketCommandError";
import { RegisterItemCommand } from "../MarketCommandSchema";
import { ItemReducer } from "../reducers";
import { createMarketEvent } from "../rules";
import { MarketCommandDispatcher } from "./types";

export const RegisterItemCommandDispatcher: MarketCommandDispatcher<
  RegisterItemCommand
> = ({ store, source }) =>
  async function* (command) {
    const { replay: replay2 } = useStream(store.read());
    const { id: itemId } = command.data.item;

    const [item] = await replay2(ItemReducer({ itemId }));
    if (item !== undefined) {
      throw new MarketCommandError("ItemAlreadyExistsError", { itemId });
    }

    yield createMarketEvent("ItemRegistered", {
      source,
      data: { item: command.data.item },
    });
  };
