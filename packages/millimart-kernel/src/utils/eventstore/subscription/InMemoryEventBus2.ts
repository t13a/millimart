import { SubscriptionError } from ".";
import { EventStore } from "..";
import { CallbackChannel } from "./CallbackChannel";
import { InMemorySubscriptionManager } from "./InMemorySubscriptionManager";
import { RandomSubscriptionIdFactory } from "./RandomSubscriptionIdFactory";
import { SubscriptionResend, SubscriptionStatus } from "./SubscriptionSchema";
import {
  Channel,
  EventBus2,
  SubscriptionIdFactory,
  SubscriptionManager,
} from "./types";

export type InMemoryEventBus2Props<E> = {
  source: string;
  store: EventStore<E>;
  subscriptionIdFactory?: SubscriptionIdFactory;
};

export class InMemoryEventBus2<E> implements EventBus2<E> {
  private _channels = new Map<string, Channel<E>>();
  private _subscriptions = this.createSubscriptionManager();
  private generateSubscriptionId: () => string;
  private lastEventId: string | undefined = undefined;

  constructor(private props: InMemoryEventBus2Props<E>) {
    // TODO Remove listener when event bus disposed.
    this.props.store.on("append", async (event) => {
      this.lastEventId = this.props.store.extractEventId(event);
      for (const subscription of this._subscriptions) {
        if (subscription.status.lastEventId !== this.lastEventId) {
          continue;
        }
        const channel = this._channels.get(subscription.sink);
        if (channel === undefined) {
          continue;
        }
        channel.emit("send", event);
      }
    });

    this.generateSubscriptionId = this.props.subscriptionIdFactory
      ? this.props.subscriptionIdFactory(this._subscriptions)
      : RandomSubscriptionIdFactory(this._subscriptions);
  }

  get channels(): ReadonlyMap<string, Channel<E>> {
    return this._channels;
  }

  get source(): string {
    return this.props.source;
  }

  get store(): EventStore<E> {
    return this.props.store;
  }

  get subscriptions(): SubscriptionManager {
    return this._subscriptions;
  }

  private createChannel(sink: string): Channel<E> {
    const channel = new CallbackChannel<E>({
      receiveCallback: () => this.handleReceive(sink),
      sendCallback: () => {}, // Do nothing
      sink,
    });
    channel.on("receive", (event) => {
      const subscription = this._subscriptions.getBySink(sink);
      if (subscription === undefined) {
        return;
      }
      const id = subscription.id;
      const lastEventId = this.props.store.extractEventId(event);
      this._subscriptions.setStatus(id, { lastEventId });
    });
    return channel;
  }

  private async handleReceive(sink: string): Promise<E | undefined> {
    const subscription = this._subscriptions.getBySink(sink);
    if (subscription === undefined) {
      return;
    }
    const lastEventId = subscription.status.lastEventId;
    return lastEventId
      ? await this.store.readNextOne(lastEventId)
      : await this.store.readFirstOne();
  }

  private createSubscriptionManager(): SubscriptionManager {
    return new InMemorySubscriptionManager({
      resend: async (resend) => {
        return await this.handleResend(resend);
      },
      subscribe: async ({ sink, config, resend }) => {
        const id = this.generateSubscriptionId();
        const status = resend ? await this.handleResend(resend) : {};
        const subscription = { id, sink, config: config ?? {}, status };
        this._channels.set(sink, this.createChannel(sink));
        return subscription;
      },
      unsubscribe: (id) => {
        const subscription = this._subscriptions.getById(id);
        this._channels.delete(subscription!.sink);
      },
    });
  }

  private async handleResend(
    resend: SubscriptionResend,
  ): Promise<SubscriptionStatus> {
    switch (resend.from) {
      case "First":
        return {};
      case "Next":
        if (resend.lastEventId) {
          const lastEvent = await this.store.readOne(resend.lastEventId);
          if (lastEvent === undefined) {
            throw new SubscriptionError("NoEventError", {
              eventId: resend.lastEventId,
            });
          }
          return { lastEventId: resend.lastEventId };
        } else {
          const lastEvent = await this.store.readLastOne();
          return {
            lastEventId: lastEvent
              ? this.store.extractEventId(lastEvent)
              : undefined,
          };
        }
    }
  }
}
