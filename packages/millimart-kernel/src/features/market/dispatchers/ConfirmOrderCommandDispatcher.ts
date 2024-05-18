import { ccy } from "../../..";
import { MarketCommandError } from "../MarketCommandError";
import { ConfirmOrderCommand } from "../MarketCommandSchema";
import { createMarketEvent } from "../rules";
import { MarketCommandDispatcherHelper } from "./MarketCommandDispatcherHelper";
import { MarketCommandDispatcher } from "./types";

export const ConfirmOrderCommandDispatcher: MarketCommandDispatcher<
  ConfirmOrderCommand
> = ({ store, source }) =>
  async function* (command) {
    const helper = new MarketCommandDispatcherHelper({ store, source });
    const order = command.data.order;

    // Validate seller.
    await helper.getUserOrThrow(order.seller);

    // Validate buyer.
    const buyer = await helper.getUserOrThrow(order.buyer);
    if (ccy.sub(buyer.balance, order.amount).value < 0) {
      throw new MarketCommandError("UserBalanceInsufficient", order.buyer);
    }

    // Validate items.
    for (const item of order.items) {
      await helper.getItemOrThrow(item);
    }

    yield createMarketEvent("OrderConfirmed", {
      source,
      data: { order },
    });
  };
