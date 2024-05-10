import { ActorTemplate, ActorTemplateProps } from "../../utils/actor";
import { EventHandler } from "../../utils/eventbus";
import { handleCloudEvent } from "../cloudevents";
import {
  RegisterItemCommand,
  RegisterUserCommand,
} from "./MarketCommandSchema";
import { MarketEventError } from "./MarketEventError";
import {
  ItemRegisteredEvent,
  MarketEvent,
  MarketEventTypePrefix,
  OrderConfirmedEvent,
  UserEnteredEvent,
  UserLeftEvent,
} from "./MarketEventSchema";
import { ItemReducer, UserReducer } from "./reducers";
import { createMarketEvent } from "./rules";

export type MarketAgentProps = Omit<ActorTemplateProps<MarketEvent>, "handler">;

export class MarketAgent extends ActorTemplate<MarketEvent> {
  constructor(props: MarketAgentProps) {
    const p = MarketEventTypePrefix;
    const handler: EventHandler<MarketEvent> = async (event) => {
      await handleCloudEvent(event, {
        [`${p}ItemRegistered`]: async (e) => await this.handleItemRegistered(e),
        [`${p}OrderConfirmed`]: async (e) => await this.handleOrderConfirmed(e),
        [`${p}UserEntered`]: async (e) => await this.handleUserEntered(e),
        [`${p}UserLeft`]: async (e) => await this.handleUserLeft(e),
      });
    };
    super({ ...props, handler });
  }

  private async handleItemRegistered(
    _event: ItemRegisteredEvent,
  ): Promise<void> {}

  private async handleOrderConfirmed(
    _event: OrderConfirmedEvent,
  ): Promise<void> {}

  private async handleUserEntered(_event: UserEnteredEvent): Promise<void> {}

  private async handleUserLeft(_event: UserLeftEvent): Promise<void> {}

  async registerItem(command: RegisterItemCommand): Promise<void> {
    const item = await this.store.replay(
      ItemReducer({ itemId: command.data.item.id }),
    );

    if (item !== undefined) {
      throw new MarketEventError("ItemAlreadyExistsError", { item });
    }

    await this.store.append(
      createMarketEvent("ItemRegistered", {
        source: this.name,
        data: command.data,
      }),
    );
  }

  async registerUser(command: RegisterUserCommand): Promise<void> {
    const user = await this.store.replay(
      UserReducer({ userId: command.data.user.id }),
    );

    if (user !== undefined) {
      throw new MarketEventError("UserAlreadyExistsError", { user });
    }

    await this.store.append(
      createMarketEvent("UserEntered", {
        source: this.name,
        data: command.data,
      }),
    );
  }
}
