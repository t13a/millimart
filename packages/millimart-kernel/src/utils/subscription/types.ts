import EventEmitter from "events";
import { EventHandler, EventStore } from "..";
import {
  Subscription,
  SubscriptionRequest,
  SubscriptionResend,
  SubscriptionStatus,
} from "./SubscriptionSchema";

export interface EventBus2<E> {
  readonly channels: ReadonlyMap<string, Channel<E>>;
  readonly source: string;
  readonly store: EventStore<E>;
  readonly subscriptions: SubscriptionManager;
}

export type SubscriptionManagerEventMap = {
  resend: [id: string, resend: SubscriptionResend];
  subscribe: [subscription: Subscription];
  unsubscribe: [id: string];
  update: [subscription: Subscription];
};

export interface SubscriptionManager
  extends EventEmitter<SubscriptionManagerEventMap>,
    Iterable<Subscription> {
  get(id: string): Subscription | undefined;
  has(id: string): boolean;
  resend(id: string, resend: SubscriptionResend): void;
  subscribe(request: SubscriptionRequest): Subscription;
  unsubscribe(id: string): void;
  update(id: string, status: SubscriptionStatus): void;
}

export type ChannelEventMap<E> = {
  receive: [event: E];
};

export interface Channel<E> extends EventEmitter<ChannelEventMap<E>> {
  receive(handler: EventHandler<E>): Promise<void>;
  sink: string;
}
