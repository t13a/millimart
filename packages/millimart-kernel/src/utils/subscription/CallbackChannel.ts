import { EventEmitter } from "events";
import { EventHandler } from "../eventbus";
import { Channel, ChannelEventMap } from "./types";

export type CallbackChannelProps<E> = {
  callback: (sink: string) => E | Promise<E>; // TODO Allow undefined.
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

  async receive(handler: EventHandler<E>): Promise<void> {
    // TODO Consider undefined
    const event = await this.props.callback(this.sink);
    handler(event);
    this.emit("receive", event);
  }
}
