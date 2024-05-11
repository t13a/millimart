import { Dispatcher, ReadOnlyEventStore } from "../../../utils";
import { MarketCommand } from "../MarketCommandSchema";
import { MarketEvent } from "../MarketEventSchema";

export type MarketCommandDispatcherContext = {
  store: ReadOnlyEventStore<MarketEvent>;
  source: string;
};

export type MarketCommandDispatcher<C extends MarketCommand> = (
  context: MarketCommandDispatcherContext,
) => Dispatcher<C, MarketEvent>;
