import { uuidv7 } from "uuidv7";
import { CloudEvent, CloudEventMap, CloudEventType } from "./CloudEventSchema";

export type CreateCloudEventFactoryPartialAttributes<CE extends CloudEvent> =
  Omit<CE, "id" | "specversion" | "type"> & Partial<Pick<CE, "id">>;

export const createCloudEventFactory =
  <CE extends CloudEvent, TypePrefix extends string>(typePrefix: TypePrefix) =>
  <
    TypeName extends CloudEventType<CE, TypePrefix>,
    E extends CloudEventMap<CE, TypePrefix>[TypeName],
  >(
    typeName: TypeName,
    partialAttributes: CreateCloudEventFactoryPartialAttributes<E>,
  ) => {
    const { id, source, time, ...rest } = partialAttributes;
    return {
      id: id ?? uuidv7(),
      source,
      specversion: "1.0",
      type: `${typePrefix}${typeName}`,
      time: time ?? new Date().toISOString(),
      ...rest,
    } as E;
  };
