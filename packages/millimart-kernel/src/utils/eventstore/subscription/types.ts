import EventEmitter from "events";
import { EventFilter } from "../EventStoreHelper";
import { Consumer } from "../channel";

export type SubscriptionManagerEventMap<E> = {
  create: [subscription: Subscription<E>];
  delete: [subscription: Subscription<E>];
};

export interface SubscriptionManager<E>
  extends EventEmitter<SubscriptionManagerEventMap<E>>,
    Iterable<Subscription<E>> {
  create(request?: SubscriptionRequest<E>): Subscription<E>;
  delete(id: string): boolean;
  get(id: string): Subscription<E> | undefined;
  has(id: string): boolean;
}

export type SubscriptionEventMap<E> = {
  filter: [filter: EventFilter<E>];
  position: [position: SubscriptionPosition];
};

export interface Subscription<E>
  extends EventEmitter<SubscriptionEventMap<E>>,
    AsyncIterable<E> {
  readonly id: string;
  readonly filter: EventFilter<E>;
  readonly position: SubscriptionPosition;
  receive(consumer: Consumer<E>): Promise<boolean>;
  update(request: SubscriptionRequest<E>): void;
}

export type SubscriptionRequest<E> = {
  readonly filter?: EventFilter<E>;
  readonly position?: SubscriptionPosition;
};

export type SubscriptionPosition =
  | {
      readonly from: "Start";
    }
  | {
      readonly from: "Next";
      readonly lastEventId: string;
    }
  | {
      readonly from: "End";
    };
