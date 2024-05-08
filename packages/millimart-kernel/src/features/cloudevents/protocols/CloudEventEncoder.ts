import { CloudEvent as CloudEventObject, HTTP, Message } from "cloudevents";
import { CloudEvent } from "../CloudEventSchema";

export type CloudEventEncoderMode = "binary" | "structured";

export type CloudEventEncoderOptions = {
  mode?: CloudEventEncoderMode;
  strict?: boolean;
};

export class CloudEventEncoder<CE extends CloudEvent> {
  ce: CloudEventObject;
  mode: CloudEventEncoderMode;

  constructor(
    event: CE,
    private options?: CloudEventEncoderOptions,
  ) {
    this.ce = new CloudEventObject(event, this.options?.strict);
    this.mode = this.options?.mode ?? "binary";
  }

  toMessage(): Message {
    const serializers = {
      binary: HTTP.binary,
      structured: HTTP.structured,
    };
    return serializers[this.mode](this.ce);
  }

  toRequestInit(baseInit?: RequestInit): RequestInit {
    const message = this.toMessage();
    const method = baseInit?.method ?? "POST";
    const headers = new Headers(baseInit?.headers);
    for (const [name, value] of Object.entries(message.headers)) {
      switch (typeof value) {
        case "string":
          headers.append(name, value);
          break;
        case "object":
          for (const v of value) {
            headers.append(name, v);
          }
          break;
      }
    }
    const body = message.body as any;
    return { ...baseInit, method, headers, body };
  }
}
