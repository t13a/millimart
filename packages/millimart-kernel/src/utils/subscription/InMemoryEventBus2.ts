import { randomUUID } from "crypto";
import { EventStore, ExtractEventId } from "../eventstore";
import { fromAsync } from "../misc";
import { CallbackChannel } from "./CallbackChannel";
import { InMemorySubscriptionManager } from "./InMemorySubscriptionManager";
import { Channel, EventBus2, SubscriptionManager } from "./types";

export type InMemoryEventBus2Props<E> = {
  source: string;
  store: EventStore<E>;
  extractEventId: ExtractEventId<E>;
  generateSubscriptionId?: () => string;
};

export class InMemoryEventBus2<E> implements EventBus2<E> {
  private _subscriptions: SubscriptionManager;
  private _channels = new Map<string, Channel<E>>();
  private lastEventId: string | undefined = undefined;
  private generateSubscriptionId: () => string;

  constructor(private props: InMemoryEventBus2Props<E>) {
    // TODO Remove listener when event bus disposed.
    this.props.store.on("append", async (event) => {
      const eventId = this.props.extractEventId(event);
      if (!this.lastEventId) {
        this.lastEventId = await this.readLastEventId(eventId);
      }
    });

    this._subscriptions = new InMemorySubscriptionManager({
      resend: () => {
        return {}; // TODO
      },
      subscribe: ({ sink, config }) => {
        const id = this.generateSubscriptionId();
        const subscription = { id, sink, config, status: {} }; // TODO
        const channel = new CallbackChannel<E>({
          sink,
          callback: async () => {
            return undefined as any; // TODO
          },
        });
        this._channels.set(sink, channel);
        return subscription;
      },
      unsubscribe: (id) => {
        const subscription = this._subscriptions.get(id);
        if (!subscription) {
          return;
        }
        this._channels.delete(subscription.sink);
      },
    });

    this.generateSubscriptionId =
      props.generateSubscriptionId ??
      (() => {
        const id = randomUUID().toString();
        return this._subscriptions.has(id) ? this.generateSubscriptionId() : id;
      });
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

  private async readLastEventId(
    fromEventId: string | undefined,
  ): Promise<string | undefined> {
    const lastEvent = (
      await fromAsync(
        this.props.store.read({
          direction: "backwards",
          fromEventId,
          skipCount: 1,
          maxCount: 1,
        }),
      )
    ).at(0);
    return lastEvent ? this.props.extractEventId(lastEvent) : undefined;
  }
}
