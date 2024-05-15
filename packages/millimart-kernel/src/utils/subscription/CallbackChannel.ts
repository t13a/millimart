import { EventEmitter } from "events";
import { EventHandler } from "../eventbus";
import { Channel, ChannelEventMap } from "./types";

export type CallbackChannelProps<E> = {
  receiveCallback: (sink: string) => (E | undefined) | Promise<E | undefined>;
  sink: string;
};

export class CallbackChannel<E>
  extends EventEmitter<ChannelEventMap<E>>
  implements Channel<E>
{
  constructor(private props: CallbackChannelProps<E>) {
    super({ captureRejections: true });
  }

  get sink(): string {
    return this.props.sink;
  }

  async receive(handler: EventHandler<E>): Promise<boolean> {
    const event = await this.props.receiveCallback(this.sink);
    if (event === undefined) {
      return false;
    }
    await handler(event);
    this.emit("receive", event);
    return true;
  }
}
