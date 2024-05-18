import { Reducer2 } from "../../../utils";
import { MarketEvent } from "../MarketEventSchema";
import { User, UserRef } from "../values";

export class UserReducer implements Reducer2<User | undefined, MarketEvent> {
  constructor(private userRef: UserRef) {}

  init(): User | undefined {
    return undefined;
  }

  next(state: User | undefined, event: MarketEvent): User | undefined {
    switch (event.type) {
      case "internal.millimart.market.v1.UserEntered":
        if (event.data.user.id !== this.userRef.userId) {
          return state;
        }
        if (state !== undefined) {
          return state;
        }
        return event.data.user;
      case "internal.millimart.market.v1.UserLeft":
        if (event.data.userId !== this.userRef.userId) {
          return state;
        }
        if (state === undefined) {
          return state;
        }
        return undefined;
    }
    return state;
  }
}
