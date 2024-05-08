import { Item, User } from "./values";

export type MarketErrorDataMap = {
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

export class MarketError<Type extends keyof MarketErrorDataMap> extends Error {
  constructor(
    readonly type: Type,
    readonly data: MarketErrorDataMap[Type],
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}
