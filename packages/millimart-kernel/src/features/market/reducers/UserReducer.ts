import { MarketEventError } from "../MarketEventError";
import { MarketEvent } from "../MarketEventSchema";
import { User } from "../values";

export type UserReducerProps = {
  userId: User["id"];
};

export const UserReducer =
  ({ userId }: UserReducerProps) =>
  (state: User | undefined, event: MarketEvent): User | undefined => {
    switch (event.type) {
      case "internal.millimart.market.v1.UserEntered": {
        if (event.data.user.id !== userId) {
          return state;
        }
        if (state !== undefined) {
          throw new MarketEventError("UserAlreadyExistsError", {
            user: event.data.user,
          });
        }
        return event.data.user;
      }

      case "internal.millimart.market.v1.UserLeft": {
        if (event.data.userId !== userId) {
          return state;
        }
        if (state === undefined) {
          throw new MarketEventError("UserNotFoundError", {
            userId: event.data.userId,
          });
        }
        return undefined;
      }
    }

    return state;
  };
