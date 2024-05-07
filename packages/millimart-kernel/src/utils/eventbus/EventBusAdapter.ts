import { EventBus, EventChannel, EventHandler, Unsubscribe } from "./types";

export type EventBusAdapterOptions<T, S = undefined> = {
  info?: S;
  sendPredicate?: EventBusAdapterSendPredicate<T, S>;
  receivePredicate?: EventBusAdapterReceivePredicate<T>;
};

export type EventBusAdapterSendPredicate<T, S = undefined> = (context: {
  event: T;
  self: boolean;
  target?: S;
}) => boolean;

export type EventBusAdapterReceivePredicate<T> = (event: T) => boolean;

export class EventBusAdapter<T, S = undefined> implements EventChannel<T> {
  private receiveHandler?: EventHandler<T>;
  private unsubscrive?: Unsubscribe;

  constructor(
    private bus: EventBus<T, S>,
    private options?: EventBusAdapterOptions<T, S>,
  ) {}

  receive(handler?: EventHandler<T>): void {
    if (this.unsubscrive) {
      this.unsubscrive();
      this.unsubscrive = undefined;
    }

    this.receiveHandler = handler;

    if (this.receiveHandler) {
      this.unsubscrive = this.bus.subscribe({
        handler: this.receiveHandler,
        predicate: this.options?.receivePredicate,
        info: this.options?.info,
      });
    }
  }

  async send(event: T): Promise<void> {
    this.bus.publish(
      event,
      (subscription) =>
        !!!this.options?.sendPredicate ||
        this.options.sendPredicate({
          event,
          self: subscription.handler === this.receiveHandler,
          target: subscription.info,
        }),
    );
  }
}
