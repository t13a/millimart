import { CloudEvent, CloudEventMap, CloudEventType } from "./CloudEventSchema";

export type CloudEventHandler<CE extends CloudEvent> = (
  event: CE,
) => unknown | Promise<unknown>;

export type CloudEventHandlerMap<
  CE extends CloudEvent,
  TypePrefix extends string = "",
> = {
  [TypeName in CloudEventType<CE, TypePrefix>]: CloudEventHandler<
    CloudEventMap<CE, TypePrefix>[TypeName]
  >;
};

export const handleCloudEvent = async <
  CE extends CloudEvent,
  TypePrefix extends string,
  TypeName extends CloudEventType<CE, TypePrefix>,
>(
  event: CloudEventMap<CE, TypePrefix>[TypeName],
  typePrefix: TypePrefix,
  handlers: Partial<CloudEventHandlerMap<CE, TypePrefix>>,
): Promise<void> => {
  const typeName = event.type.substring(typePrefix.length) as TypeName;
  const handler = handlers[typeName];
  if (!handler) {
    return;
  }
  await handler(event);
};
