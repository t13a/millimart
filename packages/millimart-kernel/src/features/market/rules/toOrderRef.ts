import { Order, OrderRef } from "../values";

export type OrderRefLike = { order: Pick<Order, "id"> };

export const toOrderRef = (ref: OrderRef | OrderRefLike): OrderRef => {
  if ("order" in ref) {
    return { orderId: ref.order.id };
  } else {
    return { orderId: ref.orderId };
  }
};
