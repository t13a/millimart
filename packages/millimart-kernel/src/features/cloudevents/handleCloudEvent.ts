import {
  CloudEvent,
  CloudEventType,
  ExtractCloudEvent,
} from "./CloudEventSchema";

export type CloudEventHandler<CE extends CloudEvent> = (
  event: CE,
) => unknown | Promise<unknown>;

export type CloudEventHandlerMap<CE extends CloudEvent> = {
  [T in CloudEventType<CE>]: CloudEventHandler<ExtractCloudEvent<CE, T>>;
};

export const handleCloudEvent = async <
  CE extends CloudEvent,
  T extends CloudEventType<CE>,
>(
  event: ExtractCloudEvent<CE, T>,
  handlers: Partial<CloudEventHandlerMap<CE>>,
): Promise<void> => {
  const type: T = event.type;
  const handler: CloudEventHandlerMap<CE>[T] | undefined = handlers[type];
  if (!handler) {
    return;
  }
  await handler(event);
};
