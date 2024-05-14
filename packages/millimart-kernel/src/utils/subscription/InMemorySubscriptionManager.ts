import EventEmitter from "events";
import {
  Subscription,
  SubscriptionRequest,
  SubscriptionResend,
  SubscriptionStatus,
} from "./SubscriptionSchema";
import { SubscriptionManager, SubscriptionManagerEventMap } from "./types";

export type InMemorySubscriptionManagerProps = {
  resend: (id: string, resend: SubscriptionResend) => SubscriptionStatus;
  subscribe: (request: SubscriptionRequest) => Subscription;
  unsubscribe: (id: string) => void;
};

export class InMemorySubscriptionManager
  extends EventEmitter<SubscriptionManagerEventMap>
  implements SubscriptionManager
{
  private map = new Map<string, Subscription>();

  constructor(private props: InMemorySubscriptionManagerProps) {
    super({ captureRejections: true });
  }

  get(id: string): Subscription | undefined {
    return this.map.get(id);
  }

  has(id: string): boolean {
    return this.map.has(id);
  }

  subscribe(request: SubscriptionRequest): Subscription {
    const subscription = this.props.subscribe(request);
    this.map.set(subscription.id, subscription);
    this.emit("subscribe", subscription);
    return subscription;
  }

  resend(id: string, resend: SubscriptionResend): void {
    const subscription = this.map.get(id);
    if (subscription) {
      const status = this.props.resend(id, resend);
      this.update(id, status);
    }
  }

  update(id: string, status: SubscriptionStatus): void {
    const oldSubscription = this.map.get(id);
    if (!oldSubscription) {
      return;
    }
    const newSubscription = { ...oldSubscription, status };
    this.map.set(id, newSubscription);
    this.emit("update", newSubscription);
  }

  unsubscribe(id: string): void {
    if (!this.map.has(id)) {
      return;
    }
    this.props.unsubscribe(id);
    this.map.delete(id);
    this.emit("unsubscribe", id);
  }

  [Symbol.iterator](): Iterator<Subscription> {
    return this.map.values();
  }
}
