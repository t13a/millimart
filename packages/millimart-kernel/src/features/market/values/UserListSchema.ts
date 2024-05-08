import { z } from "zod";
import { UserSchema } from "./UserSchema";

export type UserList = z.infer<typeof UserListSchema>;
export const UserListSchema = UserSchema.array();
