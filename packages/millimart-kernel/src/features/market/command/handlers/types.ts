import { ReadonlyEventStore } from "../../../../utils";
import { MarketEvent } from "../../MarketEventSchema";
import { MarketCommand } from "../MarketCommandSchema";

export type MarketCommandHandlerProps = {
  store: ReadonlyEventStore<MarketEvent>;
  source: string;
};

export type MarketCommandHandler<C extends MarketCommand> = (
  props: MarketCommandHandlerProps,
) => (command: C) => AsyncIterable<MarketEvent>;
