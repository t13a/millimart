import { HTTP, Message } from "cloudevents";
import z from "zod";
import { CloudEventError } from "../CloudEventError";
import { CloudEvent } from "../CloudEventSchema";

export class CloudEventDecoder<
  CE extends CloudEvent,
  Schema extends z.ZodType<CE>,
> {
  constructor(private schema: Schema) {}

  fromMessage(message: Message): z.infer<Schema> {
    if (!HTTP.isEvent(message)) {
      throw new CloudEventError("NoCloudEventError", { message });
    }
    const event = HTTP.toEvent(message);
    if (Array.isArray(event)) {
      throw new CloudEventError(
        "NotImplementedError",
        {},
        "JSON Batch format is not implemented",
      );
    }
    const event2 = Object.fromEntries(
      Object.entries(event).filter(([_k, v]) => v !== undefined),
    );
    return this.schema.parse(event2);
  }

  async fromResponse(response: Response | Promise<Response>) {
    const awaitedResponse = await response;
    const headers = Object.fromEntries(awaitedResponse.headers.entries());
    const message: Message = {
      headers,
      body: await awaitedResponse.text(),
    };
    return this.fromMessage(message);
  }
}
