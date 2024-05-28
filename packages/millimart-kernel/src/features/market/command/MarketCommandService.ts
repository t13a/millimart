import { EventStore, fromAsync } from "../../../utils";
import { MarketEvent } from "../MarketEventSchema";
import { MarketCommand } from "./MarketCommandSchema";
import {
  ConfirmOrderCommandHandler,
  RegisterItemCommandHandler,
  RegisterUserCommandHandler,
} from "./handlers";

export type MarketCommandServiceProps = {
  source: string;
  store: EventStore<MarketEvent>;
};

export class MarketCommandService {
  constructor(private props: MarketCommandServiceProps) {}

  dispatch(command: MarketCommand): AsyncIterable<MarketEvent> {
    switch (command.type) {
      case "internal.millimart.market.v1.ConfirmOrder":
        return ConfirmOrderCommandHandler(this.props)(command);
      case "internal.millimart.market.v1.RegisterItem":
        return RegisterItemCommandHandler(this.props)(command);
      case "internal.millimart.market.v1.RegisterUser":
        return RegisterUserCommandHandler(this.props)(command);
    }
  }

  async execute(command: MarketCommand): Promise<void> {
    const events = await fromAsync(this.dispatch(command));
    events.forEach((e) => this.props.store.append(e));
  }
}
