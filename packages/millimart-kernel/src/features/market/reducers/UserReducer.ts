import { MarketError, MarketEvent } from "..";
import { User } from "../values";

export type UserReducerProps = {
  userId: User["id"];
};

export const UserReducer =
  ({ userId }: UserReducerProps) =>
  (state: User | undefined, event: MarketEvent): User | undefined => {
    switch (event.type) {
      case "internal.millimart.market.v1.UserEntered": {
        if (event.data.id !== userId) {
          return state;
        }
        if (state !== undefined) {
          throw new MarketError("UserAlreadyExistsError", {
            user: event.data,
          });
        }
        return event.data;
      }

      case "internal.millimart.market.v1.UserLeft": {
        if (event.data.userId !== userId) {
          return state;
        }
        if (state === undefined) {
          throw new MarketError("UserNotFoundError", {
            userId: event.data.userId,
          });
        }
        return undefined;
      }
    }

    return state;
  };
