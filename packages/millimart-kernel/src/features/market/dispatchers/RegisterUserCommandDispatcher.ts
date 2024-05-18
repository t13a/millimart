import { MarketCommandError } from "../MarketCommandError";
import { RegisterUserCommand } from "../MarketCommandSchema";
import { createMarketEvent } from "../rules";
import { MarketCommandDispatcherHelper } from "./MarketCommandDispatcherHelper";
import { MarketCommandDispatcher } from "./types";

export const RegisterUserCommandDispatcher: MarketCommandDispatcher<
  RegisterUserCommand
> = ({ store, source }) =>
  async function* (command) {
    const helper = new MarketCommandDispatcherHelper({ store, source });
    const userRef = { userId: command.data.user.id };
    const user = await helper.getUser(userRef);

    // Validate user.
    if (user !== undefined) {
      throw new MarketCommandError("UserAlreadyExistsError", userRef);
    }

    yield createMarketEvent("UserEntered", {
      source,
      data: { user: command.data.user },
    });
  };
