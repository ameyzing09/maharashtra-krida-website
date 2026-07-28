import { createContext, Dispatch } from "react";
import { BadmintonRegistrationState, CategoryEntry, Organization } from "../types/badminton";
import { loadDraft } from "../utils/badmintonDraft";

// Kept apart from BadmintonRegistrationProvider.tsx so that file exports only a
// component — mixing the two breaks React Fast Refresh
// (react-refresh/only-export-components).

export type BadmintonAction =
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
export function initState(): BadmintonRegistrationState {
  const draft = loadDraft();
  if (!draft) return initial;
  return { ...initial, step: draft.step, organization: draft.organization, entries: draft.entries };
}

export function reducer(
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
  dispatch: Dispatch<BadmintonAction>;
} | null>(null);
