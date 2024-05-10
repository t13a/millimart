import { z } from "zod";
import { UserSchema } from "./UserSchema";

export type UserRef = z.infer<typeof UserRefSchema>;
export const UserRefSchema = z.object({
  userId: UserSchema.shape.id,
});
