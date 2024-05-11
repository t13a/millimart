import { uuidv7 } from "uuidv7";
import {
  CloudEvent,
  CloudEventType,
  ExtractCloudEvent,
} from "./CloudEventSchema";

export type ExtractCloudEventTypeName<
  CE extends CloudEvent,
  TypePrefix extends string,
> = CloudEventType<CE> extends `${TypePrefix}${infer U}` ? U : string;

export type CreateCloudEventFactoryPartialAttributes<CE extends CloudEvent> =
  Omit<CE, "id" | "specversion" | "type"> & Partial<Pick<CE, "id">>;

export const createCloudEventFactory =
  <CE extends CloudEvent, TypePrefix extends string>(typePrefix: TypePrefix) =>
  <
    TypeName extends ExtractCloudEventTypeName<CE, TypePrefix>,
    Type extends `${TypePrefix}${TypeName}`,
    Attributes extends ExtractCloudEvent<CE, Type>,
  >(
    typeName: TypeName,
    partialAttributes: CreateCloudEventFactoryPartialAttributes<Attributes>,
  ): Attributes => {
    const { id, source, time, ...rest } = partialAttributes;
    return {
      id: id ?? uuidv7(),
      source,
      specversion: "1.0",
      type: `${typePrefix}${typeName}`,
      time: time ?? new Date().toISOString(),
      ...(rest as any), // FIXME
    };
  };
