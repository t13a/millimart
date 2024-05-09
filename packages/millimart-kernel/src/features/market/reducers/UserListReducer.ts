import { MarketEvent } from "..";
import { UserList } from "../values";

export const UserListReducer =
  () =>
  (state: UserList | undefined, event: MarketEvent): UserList | undefined => {
    if (state === undefined) {
      state = [];
    }

    switch (event.type) {
      case "internal.millimart.market.v1.UserEntered":
        if (!state.find((user) => user.id === event.data.id)) {
          return [...state, event.data];
        }
        break;
      case "internal.millimart.market.v1.UserLeft":
        return state.filter((user) => user.id !== event.data.userId);
    }

    return state;
  };
