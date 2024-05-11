import { useStream } from "../../../utils";
import { MarketCommandError } from "../MarketCommandError";
import { RegisterUserCommand } from "../MarketCommandSchema";
import { UserReducer } from "../reducers";
import { createMarketEvent } from "../rules";
import { MarketCommandDispatcher } from "./types";

export const RegisterUserCommandDispatcher: MarketCommandDispatcher<
  RegisterUserCommand
> = ({ store, source }) =>
  async function* (command) {
    const { replay: replay2 } = useStream(store.read());
    const { id: userId } = command.data.user;

    const [user] = await replay2(UserReducer({ userId }));
    if (user !== undefined) {
      throw new MarketCommandError("UserAlreadyExistsError", { userId });
    }

    yield createMarketEvent("UserEntered", {
      source,
      data: { user: command.data.user },
    });
  };
