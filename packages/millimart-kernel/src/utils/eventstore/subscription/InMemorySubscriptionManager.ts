import { randomUUID } from "crypto";
import EventEmitter from "events";
import { ReadonlyEventStore } from "../types";
import { InMemorySubscription } from "./InMemorySubscription";
import {
  Subscription,
  SubscriptionManager,
  SubscriptionManagerEventMap,
  SubscriptionRequest,
} from "./types";

export type InMemorySubscriptionManagerProps<E> = {
  store: ReadonlyEventStore<E>;
};

export class InMemorySubscriptionManager<E>
  extends EventEmitter<SubscriptionManagerEventMap<E>>
  implements SubscriptionManager<E>
{
  private map = new Map<string, Subscription<E>>();
  private generateId: () => string;

  constructor(private props: InMemorySubscriptionManagerProps<E>) {
    super({ captureRejections: true });

    this.generateId = () => {
      const id = randomUUID().toString();
      return this.has(id) ? this.generateId() : id;
    };
  }

  create(request?: SubscriptionRequest<E>): Subscription<E> {
    const subscription = new InMemorySubscription<E>({
      id: this.generateId(),
      request,
      store: this.props.store,
    });
    this.map.set(subscription.id, subscription);
    this.emit("create", subscription);
    return subscription;
  }

  delete(id: string): boolean {
    const subscription = this.map.get(id);
    if (!subscription) {
      return false;
    }
    this.map.delete(id);
    this.emit("delete", subscription);
    return true;
  }

  get(id: string): Subscription<E> | undefined {
    return this.map.get(id);
  }

  has(id: string): boolean {
    return this.map.has(id);
  }

  [Symbol.iterator](): Iterator<Subscription<E>> {
    return this.map.values();
  }
}
