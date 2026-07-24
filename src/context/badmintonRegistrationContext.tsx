import { createContext, useReducer } from "react";
import { BadmintonRegistrationState, CategoryEntry, Organization } from "../types/badminton";

type BadmintonAction =
  | { type: "SET_ORG"; payload: Organization }
  | { type: "ADD_ENTRY"; payload: CategoryEntry }
  | { type: "REMOVE_ENTRY"; payload: string }
  | { type: "SET_ORDER"; payload: string }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "RESET" };

const initial: BadmintonRegistrationState = {
  step: 0,
  organization: null,
  entries: [],
  orderId: "",
};

function reducer(
  state: BadmintonRegistrationState,
  action: BadmintonAction
): BadmintonRegistrationState {
  switch (action.type) {
    case "SET_ORG":
      return { ...state, organization: action.payload };
    case "ADD_ENTRY":
      return { ...state, entries: [...state.entries, action.payload] };
    case "REMOVE_ENTRY":
      return { ...state, entries: state.entries.filter((e) => e.id !== action.payload) };
    case "SET_ORDER":
      return { ...state, orderId: action.payload };
    case "NEXT":
      return { ...state, step: (state.step + 1) as BadmintonRegistrationState["step"] };
    case "BACK":
      return { ...state, step: (state.step - 1) as BadmintonRegistrationState["step"] };
    case "RESET":
      return initial;
    default:
      return state;
  }
}

export const BadmintonRegistrationContext = createContext<{
  state: BadmintonRegistrationState;
  dispatch: React.Dispatch<BadmintonAction>;
} | null>(null);

export const BadmintonRegistrationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initial);
  return (
    <BadmintonRegistrationContext.Provider value={{ state, dispatch }}>
      {children}
    </BadmintonRegistrationContext.Provider>
  );
};
