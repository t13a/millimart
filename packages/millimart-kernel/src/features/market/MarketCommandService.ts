import { EventStore, fromAsync } from "../../utils";
import { MarketCommand } from "./MarketCommandSchema";
import { MarketEvent } from "./MarketEventSchema";
import {
  ConfirmOrderCommandDispatcher,
  RegisterItemCommandDispatcher,
  RegisterUserCommandDispatcher,
} from "./dispatchers";

export type MarketCommandServiceProps = {
  source: string;
  store: EventStore<MarketEvent>;
};

export class MarketCommandService {
  constructor(private props: MarketCommandServiceProps) {}

  dispatch(command: MarketCommand): AsyncIterable<MarketEvent> {
    switch (command.type) {
      case "internal.millimart.market.v1.ConfirmOrder":
        return ConfirmOrderCommandDispatcher(this.props)(command);
      case "internal.millimart.market.v1.RegisterItem":
        return RegisterItemCommandDispatcher(this.props)(command);
      case "internal.millimart.market.v1.RegisterUser":
        return RegisterUserCommandDispatcher(this.props)(command);
    }
  }

  async execute(command: MarketCommand): Promise<void> {
    const events = await fromAsync(this.dispatch(command));
    events.forEach((e) => this.props.store.append(e));
  }
}
