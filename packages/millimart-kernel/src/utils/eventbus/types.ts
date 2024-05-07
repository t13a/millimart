export interface EventChannel<T>
  extends SendOnlyEventChannel<T>,
    ReceiveOnlyEventChannel<T> {}

export interface SendOnlyEventChannel<T> {
  send(event: T): Promise<void>;
}

export interface ReceiveOnlyEventChannel<T> {
  receive(handler?: EventHandler<T>): void;
}

export type EventHandler<T, U = unknown> = (event: T) => U | Promise<U>;

export interface EventBus<T, I = undefined> {
  publish(
    event: T,
    predicate?: (subscription: Subscription<T, I>) => boolean,
  ): Promise<void>;
  subscribe(subscription: Subscription<T, I>): Unsubscribe;
}

export type Subscription<T, I = undefined> = {
  handler: EventHandler<T>;
  predicate?: (event: T) => boolean;
  info?: I;
};

export type Unsubscribe = () => void;
