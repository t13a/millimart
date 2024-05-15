import EventEmitter from "events";
import { EventHandler } from "../eventbus";
import { EventStore } from "../eventstore";
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
  setResend: [subscription: Subscription];
  setStatus: [subscription: Subscription];
  subscribe: [subscription: Subscription];
  unsubscribe: [id: string];
};

export interface SubscriptionManager
  extends ReadonlySubscriptionManager,
    EventEmitter<SubscriptionManagerEventMap> {
  setResend(id: string, resend: SubscriptionResend): Promise<Subscription>;
  setStatus(id: string, status: SubscriptionStatus): Subscription;
  subscribe(request: SubscriptionRequest): Promise<Subscription>;
  unsubscribe(id: string): void;
}

export interface ReadonlySubscriptionManager extends Iterable<Subscription> {
  getById(id: string): Subscription | undefined;
  getBySink(sink: string): Subscription | undefined;
  hasById(id: string): boolean;
  hasBySink(sink: string): boolean;
}

export type SubscriptionIdFactory = (
  subscriptions: ReadonlySubscriptionManager,
) => () => string;

export type ChannelEventMap<E> = {
  newEvent: []; // WIP
  receive: [event: E | undefined];
};

export interface Channel<E> extends EventEmitter<ChannelEventMap<E>> {
  receive(handler: EventHandler<E>): Promise<boolean>;
  sink: string;
}
