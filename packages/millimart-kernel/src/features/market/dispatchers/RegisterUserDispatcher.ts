import { ReadOnlyEventStore } from "../../../utils";
import { useReducer } from "../../../utils/reducer/useReducer";
import { RegisterUserCommand } from "../MarketCommandSchema";
import { MarketEvent } from "../MarketEventSchema";
import { UserReducer } from "../reducers";
import { createMarketEvent } from "../rules";

export type RegisterUserDispatcherProps = {
  store: ReadOnlyEventStore<MarketEvent>;
  source: string;
};

export const RegisterUserDispatcher = ({
  store,
  source,
}: RegisterUserDispatcherProps) => {
  const { safeReplay } = useReducer(store.read());

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
    await useReducer([newEvent]).replay(userReducer, user); // XXX: Uncomprehensible to normal mankind.

    // Yield new event.
    yield newEvent;
  };
};
