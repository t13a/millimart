import { Message } from "cloudevents";
import { CloudEvent } from "../CloudEventSchema";

export class CloudEventBatchEncoder<CE extends CloudEvent> {
  constructor(private events: CE[]) {}

  toMessage(): Message {
    return {
      headers: { "content-type": "application/cloudevents-batch+json" },
      body: JSON.stringify(this.events),
    };
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
