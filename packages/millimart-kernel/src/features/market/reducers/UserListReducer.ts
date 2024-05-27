import { Reducer } from "../../../utils";
import { MarketEvent } from "../MarketEventSchema";
import { UserList } from "../values";

export class UserListReducer implements Reducer<UserList, MarketEvent> {
  init(): UserList {
    return [];
  }

  next(state: UserList, event: MarketEvent): UserList {
    switch (event.type) {
      case "internal.millimart.market.v1.UserEntered":
        const found = !!state.find((user) => user.id === event.data.user.id);
        return found ? state : [...state, event.data.user];
      case "internal.millimart.market.v1.UserLeft":
        state = state ?? [];
        return state.filter((user) => user.id !== event.data.userId);
    }
    return state;
  }
}
