import { createContext } from "react";
import { AuthContextType } from "../types";

// Kept apart from AuthProvider.tsx so that file exports only a component —
// mixing the two breaks React Fast Refresh (react-refresh/only-export-components).

export const initialAuthState: AuthContextType = {
  user: null,
  status: "loading",
};

export const AuthContext = createContext(initialAuthState);
