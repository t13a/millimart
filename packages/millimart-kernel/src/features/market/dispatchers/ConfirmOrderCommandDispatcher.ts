import { ccy } from "../../..";
import { useStream } from "../../../utils";
import { MarketCommandError } from "../MarketCommandError";
import { ConfirmOrderCommand } from "../MarketCommandSchema";
import { ItemReducer, UserReducer } from "../reducers";
import { createMarketEvent } from "../rules";
import { MarketCommandDispatcher } from "./types";

export const ConfirmOrderCommandDispatcher: MarketCommandDispatcher<
  ConfirmOrderCommand
> = ({ store, source }) =>
  async function* (command) {
    const { replay } = useStream(store.read());
    const { order } = command.data;

    const [sellerState] = await replay(UserReducer(order.seller));
    if (sellerState === undefined) {
      throw new MarketCommandError("UserNotExistsError", order.seller);
    }

    const [buyerState] = await replay(UserReducer(order.buyer));
    if (buyerState === undefined) {
      throw new MarketCommandError("UserNotExistsError", order.buyer);
    }

    for (const item of order.items) {
      const [itemState] = await replay(ItemReducer(item));
      if (itemState === undefined) {
        throw new MarketCommandError("ItemNotExistsError", item);
      }
    }

    if (ccy.sub(buyerState.balance, order.amount).value < 0) {
      throw new MarketCommandError("UserBalanceInsufficient", order.buyer);
    }

    yield createMarketEvent("OrderConfirmed", {
      source,
      data: { order },
    });
  };
