import { Message } from "cloudevents";

export type CloudEventErrorMap = {
  NoCloudEventError: {
    message: Message;
  };
  NotImplementedError: {};
};

export class CloudEventError<
  Name extends keyof CloudEventErrorMap,
> extends Error {
  constructor(
    readonly name: Name,
    readonly data: CloudEventErrorMap[Name],
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}
