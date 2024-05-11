import { Reducer } from "../../..";
import { MarketEvent } from "../MarketEventSchema";
import { UserList } from "../values";

export const UserListReducer =
  (): Reducer<UserList, MarketEvent> =>
  (state, event): UserList | undefined => {
    switch (event.type) {
      case "internal.millimart.market.v1.UserEntered":
        state = state ?? [];
        const isFound = !!state.find((user) => user.id === event.data.user.id);
        return isFound ? state : [...state, event.data.user];
      case "internal.millimart.market.v1.UserLeft":
        state = state ?? [];
        return state.filter((user) => user.id !== event.data.userId);
    }
    return state;
  };
