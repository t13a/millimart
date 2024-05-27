import { Item, ItemRef } from "../values";

export type ItemRefLike = { item: Pick<Item, "id"> };

export const toItemRef = (ref: ItemRef | ItemRefLike): ItemRef => {
  if ("item" in ref) {
    return { itemId: ref.item.id };
  } else {
    return { itemId: ref.itemId };
  }
};
