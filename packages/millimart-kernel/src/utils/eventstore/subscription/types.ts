import EventEmitter from "events";
import { Channel } from "../channel";
import { EventStore } from "../types";

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

export type Subscription = {
  id: string;
  sink: string;
  config: SubscriptionConfig;
  status: SubscriptionStatus;
};

export type SubscriptionRequest = {
  sink: string;
  config?: SubscriptionConfig;
  resend?: SubscriptionResend;
};

export type SubscriptionConfig = Record<string, unknown>;

export type SubscriptionResend =
  | {
      from: "First";
    }
  | {
      from: "Next";
      lastEventId?: string;
    };

export type SubscriptionStatus = {
  lastEventId?: string;
};
