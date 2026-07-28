import React, { useEffect, useReducer } from "react";
import { clearDraft, saveDraft } from "../utils/badmintonDraft";
import {
  BadmintonRegistrationContext,
  initState,
  reducer,
} from "./badmintonRegistrationContext";

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
