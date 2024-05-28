import { ccy } from "../../../..";
import { createMarketEvent } from "../../rules";
import { MarketCommandError } from "../MarketCommandError";
import { MarketCommandHelper } from "../MarketCommandHelper";
import { ConfirmOrderCommand } from "../MarketCommandSchema";
import { MarketCommandHandler } from "./types";

export const ConfirmOrderCommandHandler: MarketCommandHandler<
  ConfirmOrderCommand
> = ({ store, source }) =>
  async function* (command) {
    const helper = new MarketCommandHelper({ store, source });
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
