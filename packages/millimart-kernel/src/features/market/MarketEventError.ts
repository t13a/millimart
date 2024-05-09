import { Item, User } from "./values";

export type MarketEventErrorDataMap = {
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

export class MarketEventError<
  Type extends keyof MarketEventErrorDataMap,
> extends Error {
  constructor(
    readonly type: Type,
    readonly data: MarketEventErrorDataMap[Type],
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}
