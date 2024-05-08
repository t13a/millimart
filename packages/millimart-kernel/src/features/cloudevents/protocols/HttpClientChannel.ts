import assert from "assert";
import { ZodType } from "zod";
import { CloudEventDecoder } from ".";
import { EventChannel, EventHandler } from "../../../utils/eventbus";
import { CloudEvent } from "../CloudEventSchema";
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
> implements EventChannel<CE>
{
  private receiveHandler: EventHandler<CE> | undefined;

  constructor(
    private url: string | URL,
    private options?: HttpClientChannelOptions<CE, Schema>,
  ) {}

  receive(handler: EventHandler<CE> | undefined): void {
    this.receiveHandler = handler;
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

      assert(this.receiveHandler !== undefined);
      await this.receiveHandler(receivedEvent);
    }
  }
}
