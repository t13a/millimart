import { User, UserRef } from "../values";

export type UserRefLike = { user: Pick<User, "id"> };

export const toUserRef = (ref: UserRef | UserRefLike): UserRef => {
  if ("user" in ref) {
    return { userId: ref.user.id };
  } else {
    return { userId: ref.userId };
  }
};
