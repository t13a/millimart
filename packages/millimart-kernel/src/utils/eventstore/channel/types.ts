import EventEmitter from "events";

export type ChannelEventMap<E> = {
  send: [event: E];
  receive: [event: E];
};

export interface Channel<E> extends SendOnlyChannel<E>, ReceiveOnlyChannel<E> {}

export interface SendOnlyChannel<E> extends EventEmitter<ChannelEventMap<E>> {
  send(event: E): Promise<void>;
}

export interface ReceiveOnlyChannel<E>
  extends EventEmitter<ChannelEventMap<E>> {
  receive(consumer: Consumer<E>): Promise<boolean>;
}

export type Producer<E> = () => E | Promise<E>;

export type Consumer<E, T = unknown> = (event: E) => T | Promise<T>;
