import { Dispatcher, ReadonlyEventStore } from "../../../utils";
import { MarketCommand } from "../MarketCommandSchema";
import { MarketEvent } from "../MarketEventSchema";

export type MarketCommandDispatcherProps = {
  store: ReadonlyEventStore<MarketEvent>;
  source: string;
};

export type MarketCommandDispatcher<C extends MarketCommand> = (
  props: MarketCommandDispatcherProps,
) => Dispatcher<C, MarketEvent>;
