import { ItemRef, UserRef } from "../values";

export type MarketCommandErrorDataMap = {
  ItemAlreadyExistsError: ItemRef;
  ItemNotExistsError: ItemRef;
  UserAlreadyExistsError: UserRef;
  UserNotExistsError: UserRef;
  UserBalanceInsufficient: UserRef;
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
