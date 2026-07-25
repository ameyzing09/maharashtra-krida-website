import { createContext, useEffect, useReducer } from "react";
import { BadmintonRegistrationState, CategoryEntry, Organization } from "../types/badminton";
import { clearDraft, loadDraft, saveDraft } from "../utils/badmintonDraft";

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

// Resume an in-progress registration (e.g. after a failed payment hard-redirects
// back to this page and wipes in-memory state) but never resume a stale orderId.
function initState(): BadmintonRegistrationState {
  const draft = loadDraft();
  if (!draft) return initial;
  return { ...initial, step: draft.step, organization: draft.organization, entries: draft.entries };
}

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
  const [state, dispatch] = useReducer(reducer, undefined, initState);

  useEffect(() => {
    if (!state.organization && state.entries.length === 0) {
      clearDraft();
      return;
    }
    saveDraft({ step: state.step, organization: state.organization, entries: state.entries });
  }, [state.step, state.organization, state.entries]);

  return (
    <BadmintonRegistrationContext.Provider value={{ state, dispatch }}>
      {children}
    </BadmintonRegistrationContext.Provider>
  );
};
