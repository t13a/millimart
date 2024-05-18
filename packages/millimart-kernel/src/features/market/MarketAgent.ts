import { createMarketCommand } from ".";
import {
  ActorTemplate,
  ActorTemplateProps,
  EventHandler,
  handleCloudEvent,
} from "../../utils";
import {
  MarketCommand,
  RegisterItemCommand,
  RegisterUserCommand,
} from "./MarketCommandSchema";
import {
  ItemRegisteredEvent,
  MarketEvent,
  MarketEventTypePrefix,
  OrderConfirmedEvent,
  UserEnteredEvent,
  UserLeftEvent,
} from "./MarketEventSchema";
import {
  MarketCommandDispatcher,
  RegisterItemCommandDispatcher,
  RegisterUserCommandDispatcher,
} from "./dispatchers";

export class MarketAgent extends ActorTemplate<MarketEvent> {
  constructor(props: ActorTemplateProps<MarketEvent>) {
    const handler: EventHandler<MarketEvent> = async (event) => {
      await handleCloudEvent(event, MarketEventTypePrefix, {
        ItemRegistered: async (e) => await this.handleItemRegistered(e),
        OrderConfirmed: async (e) => await this.handleOrderConfirmed(e),
        UserEntered: async (e) => await this.handleUserEntered(e),
        UserLeft: async (e) => await this.handleUserLeft(e),
      });
    };
    super(handler, props);
  }

  private async handleItemRegistered(
    _event: ItemRegisteredEvent,
  ): Promise<void> {}

  private async handleOrderConfirmed(
    _event: OrderConfirmedEvent,
  ): Promise<void> {}

  private async handleUserEntered(_event: UserEnteredEvent): Promise<void> {}

  private async handleUserLeft(_event: UserLeftEvent): Promise<void> {}

  private dispatch<C extends MarketCommand>(
    dispatcher: MarketCommandDispatcher<C>,
    command: C,
  ) {
    return dispatcher({ store: this.store, source: this.name })(command);
  }

  public async registerItem(data: RegisterItemCommand["data"]): Promise<void> {
    await this.append(
      this.dispatch(
        RegisterItemCommandDispatcher,
        createMarketCommand("RegisterItem", data),
      ),
    );
  }

  public async registerUser(data: RegisterUserCommand["data"]): Promise<void> {
    await this.append(
      this.dispatch(
        RegisterUserCommandDispatcher,
        createMarketCommand("RegisterUser", data),
      ),
    );
  }
}
