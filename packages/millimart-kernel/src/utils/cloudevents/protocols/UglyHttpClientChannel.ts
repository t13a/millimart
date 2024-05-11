import {
  CloudEvent as CloudEventObject,
  EmitterFunction,
  Options,
  emitterFor,
  httpTransport,
} from "cloudevents";
import { SendOnlyEventChannel } from "../../../utils/eventbus";
import { CloudEvent } from "../CloudEventSchema";

export class UglyHttpClientChannel<CE extends CloudEvent>
  implements SendOnlyEventChannel<CE>
{
  private emit: EmitterFunction;

  constructor(
    private url: string | URL,
    private options?: Options,
  ) {
    this.emit = emitterFor(httpTransport(this.url), this.options);
  }

  async send(event: CE): Promise<void> {
    const ce = new CloudEventObject<CE["data"]>({ data: null, ...event });
    await this.emit(ce);
  }
}
