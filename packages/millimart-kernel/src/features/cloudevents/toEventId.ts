import { CloudEvent } from "./CloudEventSchema";

export const toEventId = (event: CloudEvent): string =>
  `${event.source}-${event.id}`;
