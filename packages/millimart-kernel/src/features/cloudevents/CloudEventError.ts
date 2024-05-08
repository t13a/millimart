import { Message } from "cloudevents";

export type CloudEventErrorDataMap = {
  NoCloudEventError: {
    message: Message;
  };
  NotImplementedError: {};
};

export class CloudEventError<
  Type extends keyof CloudEventErrorDataMap,
> extends Error {
  constructor(
    readonly type: Type,
    readonly data: CloudEventErrorDataMap[Type],
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}
