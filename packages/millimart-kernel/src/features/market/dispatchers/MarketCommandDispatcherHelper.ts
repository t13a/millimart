import { reduce } from "../../../utils";
import { MarketCommandError } from "../MarketCommandError";
import { ItemReducer, UserReducer } from "../reducers";
import { ItemRefLike, UserRefLike, toItemRef, toUserRef } from "../rules";
import { Item, ItemRef, User, UserRef } from "../values";
import { MarketCommandDispatcherProps } from "./types";

export class MarketCommandDispatcherHelper {
  constructor(private props: MarketCommandDispatcherProps) {}

  async getItem(itemRef: ItemRef | ItemRefLike): Promise<Item | undefined> {
    const { state } = await reduce(
      new ItemReducer(toItemRef(itemRef)),
      this.props.store.read(),
    );
    return state;
  }

  async getItemOrThrow(itemRef: ItemRef | ItemRefLike): Promise<Item> {
    const item = await this.getItem(itemRef);
    if (!item) {
      throw new MarketCommandError("ItemNotExistsError", toItemRef(itemRef));
    }
    return item;
  }

  async getUser(userRef: UserRef | UserRefLike): Promise<User | undefined> {
    const { state } = await reduce(
      new UserReducer(toUserRef(userRef)),
      this.props.store.read(),
    );
    return state;
  }

  async getUserOrThrow(userRef: UserRef | UserRefLike): Promise<User> {
    const user = await this.getUser(userRef);
    if (!user) {
      throw new MarketCommandError("UserNotExistsError", toUserRef(userRef));
    }
    return user;
  }
}
