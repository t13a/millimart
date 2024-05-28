import { createMarketEvent, toUserRef } from "../../rules";
import { MarketCommandError } from "../MarketCommandError";
import { MarketCommandHelper } from "../MarketCommandHelper";
import { RegisterUserCommand } from "../MarketCommandSchema";
import { MarketCommandHandler } from "./types";

export const RegisterUserCommandHandler: MarketCommandHandler<
  RegisterUserCommand
> = ({ store, source }) =>
  async function* (command) {
    const helper = new MarketCommandHelper({ store, source });
    const user = await helper.getUser(command.data);

    // Validate user.
    if (user !== undefined) {
      throw new MarketCommandError(
        "UserAlreadyExistsError",
        toUserRef(command.data),
      );
    }

    yield createMarketEvent("UserEntered", {
      source,
      data: { user: command.data.user },
    });
  };
