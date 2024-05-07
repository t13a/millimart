import { EventChannel } from "../eventbus";

export interface Actor<T> {
  readonly name: string;
  attach<U extends T>(channel: EventChannel<U>): void;
  detach(): void;
}
