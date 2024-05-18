import { reduce } from "../../../utils";
import { MarketCommandError } from "../MarketCommandError";
import { ItemReducer, UserReducer } from "../reducers";
import { Item, ItemRef, User, UserRef } from "../values";
import { MarketCommandDispatcherProps } from "./types";

export class MarketCommandDispatcherHelper {
  constructor(private props: MarketCommandDispatcherProps) {}

  async getItem(itemRef: ItemRef): Promise<Item | undefined> {
    const { state } = await reduce(
      new ItemReducer(itemRef),
      this.props.store.read(),
    );
    return state;
  }

  async getItemOrThrow(itemRef: ItemRef): Promise<Item> {
    const item = await this.getItem(itemRef);
    if (item === undefined) {
      throw new MarketCommandError("ItemNotExistsError", itemRef);
    }
    return item;
  }

  async getUser(userRef: UserRef): Promise<User | undefined> {
    const { state } = await reduce(
      new UserReducer(userRef),
      this.props.store.read(),
    );
    return state;
  }

  async getUserOrThrow(userRef: UserRef): Promise<User> {
    const user = await this.getUser(userRef);
    if (user === undefined) {
      throw new MarketCommandError("UserNotExistsError", userRef);
    }
    return user;
  }
}
