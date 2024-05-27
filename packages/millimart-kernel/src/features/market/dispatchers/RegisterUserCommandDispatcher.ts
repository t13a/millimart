import { MarketCommandError } from "../MarketCommandError";
import { RegisterUserCommand } from "../MarketCommandSchema";
import { createMarketEvent, toUserRef } from "../rules";
import { MarketCommandDispatcherHelper } from "./MarketCommandDispatcherHelper";
import { MarketCommandDispatcher } from "./types";

export const RegisterUserCommandDispatcher: MarketCommandDispatcher<
  RegisterUserCommand
> = ({ store, source }) =>
  async function* (command) {
    const helper = new MarketCommandDispatcherHelper({ store, source });
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
