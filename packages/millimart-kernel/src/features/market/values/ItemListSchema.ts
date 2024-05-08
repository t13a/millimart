import { z } from "zod";
import { ItemSchema } from "./ItemSchema";

export type ItemList = z.infer<typeof ItemListSchema>;
export const ItemListSchema = ItemSchema.array();
