import EventEmitter from "events";
import { SubscriptionError } from "./SubscriptionError";
import {
  Subscription,
  SubscriptionRequest,
  SubscriptionResend,
  SubscriptionStatus,
} from "./SubscriptionSchema";
import { SubscriptionManager, SubscriptionManagerEventMap } from "./types";

export type InMemorySubscriptionManagerProps = {
  resend: (resend: SubscriptionResend) => Promise<SubscriptionStatus>;
  subscribe: (request: SubscriptionRequest) => Promise<Subscription>;
  unsubscribe: (id: string) => void;
};

export class InMemorySubscriptionManager
  extends EventEmitter<SubscriptionManagerEventMap>
  implements SubscriptionManager
{
  private mapById = new Map<string, Subscription>();
  private mapBySink = new Map<string, Subscription>();

  constructor(private props: InMemorySubscriptionManagerProps) {
    super({ captureRejections: true });
  }

  getById(id: string): Subscription | undefined {
    return this.mapById.get(id);
  }

  getBySink(sink: string): Subscription | undefined {
    return this.mapBySink.get(sink);
  }

  hasById(id: string): boolean {
    return this.mapById.has(id);
  }

  hasBySink(sink: string): boolean {
    return this.mapBySink.has(sink);
  }

  async setResend(
    id: string,
    resend: SubscriptionResend,
  ): Promise<Subscription> {
    const oldSubscription = this.mapById.get(id);
    if (!oldSubscription) {
      throw new SubscriptionError("NoSubscriptionError", {
        subscriptionId: id,
      });
    }
    const status = await this.props.resend(resend);
    const newSubscription = this.setStatus(id, status);
    this.emit("setResend", newSubscription);
    return newSubscription;
  }

  setStatus(id: string, status: SubscriptionStatus): Subscription {
    const oldSubscription = this.mapById.get(id);
    if (!oldSubscription) {
      throw new SubscriptionError("NoSubscriptionError", {
        subscriptionId: id,
      });
    }
    const newSubscription = { ...oldSubscription, status };
    this.mapById.set(id, newSubscription);
    this.mapBySink.set(newSubscription.sink, newSubscription);
    this.emit("setStatus", newSubscription);
    return newSubscription;
  }

  async subscribe(request: SubscriptionRequest): Promise<Subscription> {
    if (this.mapBySink.has(request.sink)) {
      throw new SubscriptionError("DuplicateSinkError", { sink: request.sink });
    }
    const subscription = await this.props.subscribe(request);
    this.mapById.set(subscription.id, subscription);
    this.mapBySink.set(subscription.sink, subscription);
    this.emit("subscribe", subscription);
    return subscription;
  }

  unsubscribe(id: string): void {
    const subscription = this.mapById.get(id);
    if (!subscription) {
      throw new SubscriptionError("NoSubscriptionError", {
        subscriptionId: id,
      });
    }
    this.props.unsubscribe(id);
    this.mapById.delete(id);
    this.mapBySink.delete(subscription.sink);
    this.emit("unsubscribe", id);
  }

  [Symbol.iterator](): Iterator<Subscription> {
    return this.mapById.values();
  }
}
