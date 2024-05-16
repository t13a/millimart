import { EventEmitter } from "events";
import { EventHandler } from "../../eventbus";
import { Channel, ChannelEventMap } from "./types";

export type CallbackChannelProps<E> = {
  receiveCallback: () => (E | undefined) | Promise<E | undefined>;
  sendCallback: EventHandler<E>;
  sink: string;
};

export class CallbackChannel<E>
  extends EventEmitter<ChannelEventMap<E>>
  implements Channel<E>
{
  constructor(private props: CallbackChannelProps<E>) {
    super({ captureRejections: true });
  }

  async receive(handler: EventHandler<E>): Promise<boolean> {
    const event = await this.props.receiveCallback();
    if (event === undefined) {
      return false;
    }
    await handler(event);
    this.emit("receive", event);
    return true;
  }

  async send(event: E): Promise<void> {
    this.props.sendCallback(event);
    this.emit("send", event);
  }

  get sink(): string {
    return this.props.sink;
  }
}
