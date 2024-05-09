import { UserReducer, createMarketEvent } from "..";
import { ReadOnlyEventStore } from "../../../utils";
import { useStream } from "../../../utils/reducer/useStream";
import { RegisterUserCommand } from "../MarketCommandSchema";
import { MarketEvent } from "../MarketEventSchema";

export type RegisterUserDispatcherProps = {
  store: ReadOnlyEventStore<MarketEvent>;
  source: string;
};

export const RegisterUserDispatcher = ({
  store,
  source,
}: RegisterUserDispatcherProps) => {
  const { safeReplay } = useStream(store.read());

  return async function* (
    command: RegisterUserCommand,
  ): AsyncIterable<MarketEvent> {
    const { id: userId } = command.data.user;
    const userReducer = UserReducer({ userId });

    // Replay current state.
    const [user, errors] = await safeReplay(userReducer);
    if (errors) {
      console.warn(errors);
    }

    // Validate next state.
    const newEvent = createMarketEvent("UserEntered", {
      source,
      data: { user: command.data.user },
    });
    await useStream([newEvent]).replay(userReducer, user); // XXX: Uncomprehensible to normal mankind.

    // Yield new event.
    yield newEvent;
  };
};
