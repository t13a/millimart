/** @deprecated */
export interface EventChannel<T>
  extends SendOnlyEventChannel<T>,
    ReceiveOnlyEventChannel<T> {}

/** @deprecated */
export interface SendOnlyEventChannel<T> {
  send(event: T): Promise<void>;
}

/** @deprecated */
export interface ReceiveOnlyEventChannel<T> {
  receive(handler?: EventHandler<T>): void;
}

/** @deprecated */
export type EventHandler<T, U = unknown> = (event: T) => U | Promise<U>;

/** @deprecated */
export interface EventBus<T, I = undefined> {
  publish(
    event: T,
    predicate?: (subscription: Subscription<T, I>) => boolean,
  ): Promise<void>;
  subscribe(subscription: Subscription<T, I>): Unsubscribe;
}

/** @deprecated */
export type Subscription<T, I = undefined> = {
  handler: EventHandler<T>;
  predicate?: (event: T) => boolean;
  info?: I;
};

/** @deprecated */
export type Unsubscribe = () => void;
