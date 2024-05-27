import { EventEmitter } from "events";
import { Channel, ChannelEventMap, Consumer, Producer } from "./types";

export type CallbackChannelProps<E> = {
  receiveCallback: Producer<E | undefined>;
  sendCallback: Consumer<E>;
};

export class CallbackChannel<E>
  extends EventEmitter<ChannelEventMap<E>>
  implements Channel<E>
{
  constructor(private props: CallbackChannelProps<E>) {
    super({ captureRejections: true });
  }

  async receive(consumer: Consumer<E>): Promise<boolean> {
    const event = await this.props.receiveCallback();
    if (event === undefined) {
      return false;
    }
    await consumer(event);
    this.emit("receive", event);
    return true;
  }

  async send(event: E): Promise<void> {
    this.props.sendCallback(event);
    this.emit("send", event);
  }
}
