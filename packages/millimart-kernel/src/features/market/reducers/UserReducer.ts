import { Reducer } from "../../../utils";
import { MarketEvent } from "../MarketEventSchema";
import { User, UserRef } from "../values";

export const UserReducer =
  ({ userId }: UserRef): Reducer<User, MarketEvent> =>
  (state, event) => {
    switch (event.type) {
      case "internal.millimart.market.v1.UserEntered":
        if (event.data.user.id !== userId) {
          return state;
        }
        if (state !== undefined) {
          return state;
        }
        return event.data.user;
      case "internal.millimart.market.v1.UserLeft":
        if (event.data.userId !== userId) {
          return state;
        }
        if (state === undefined) {
          return state;
        }
        return undefined;
    }
    return state;
  };
