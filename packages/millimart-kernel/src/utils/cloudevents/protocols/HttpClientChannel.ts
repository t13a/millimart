import { EventEmitter } from "events";
import { ZodType } from "zod";
import { EventHandler } from "../../../utils/eventbus";
import { Channel, ChannelEventMap } from "../../eventstore/subscription";
import { CloudEvent } from "../CloudEventSchema";
import { CloudEventDecoder } from "./CloudEventDecoder";
import {
  CloudEventEncoder,
  CloudEventEncoderOptions,
} from "./CloudEventEncoder";

export type HttpClientChannelOptions<
  CE extends CloudEvent,
  Schema extends ZodType<CE>,
> =
  | HttpClientChannelSendOnlyOptions
  | HttpClientChannelReceiveOptions<CE, Schema>;

type HttpClientChannelBaseOptions = {
  encoderOptions?: CloudEventEncoderOptions;
  requestInit?: RequestInit;
};

type HttpClientChannelSendOnlyOptions = HttpClientChannelBaseOptions & {
  receive: false;
};

type HttpClientChannelReceiveOptions<
  CE extends CloudEvent,
  Schema extends ZodType<CE>,
> = HttpClientChannelBaseOptions & {
  receive: true;
  schema: Schema;
};

export class HttpClientChannel<
    CE extends CloudEvent,
    Schema extends ZodType<CE>,
  >
  extends EventEmitter<ChannelEventMap<CE>>
  implements Channel<CE>
{
  private receivedEvents: CE[] = [];

  constructor(
    readonly sink: string,
    private url: string,
    private options?: HttpClientChannelOptions<CE, Schema>,
  ) {
    super({ captureRejections: true });
  }

  async receive(handler: EventHandler<CE>): Promise<boolean> {
    const event = this.receivedEvents.shift();
    if (!event) {
      return false;
    }
    await handler(event);
    this.emit("receive", event);
    return true;
  }

  async send(event: CE): Promise<void> {
    const requestInit = new CloudEventEncoder(
      event,
      this.options?.encoderOptions,
    ).toRequestInit(this.options?.requestInit);

    const response = await fetch(this.url, requestInit);

    if (this.options?.receive) {
      const receivedEvent = await new CloudEventDecoder(
        this.options.schema,
      ).fromResponse(response);
      this.receivedEvents.push(receivedEvent);
    }

    this.emit("send", event);
  }
}
