import { createContext } from "react";

// Kept apart from ThemeProvider.tsx so that file exports only a component —
// mixing the two breaks React Fast Refresh (react-refresh/only-export-components).

export type Theme = "light" | "dark";

export type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
