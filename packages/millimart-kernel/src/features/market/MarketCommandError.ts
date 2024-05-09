import { Item, User } from "./values";

export type MarketCommandErrorDataMap = {
  ItemAlreadyExistsError: {
    item: Item;
  };
  UserAlreadyExistsError: {
    user: User;
  };
  UserNotFoundError: {
    userId: User["id"];
  };
};

export class MarketCommandError<
  Type extends keyof MarketCommandErrorDataMap,
> extends Error {
  constructor(
    readonly type: Type,
    readonly data: MarketCommandErrorDataMap[Type],
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}
