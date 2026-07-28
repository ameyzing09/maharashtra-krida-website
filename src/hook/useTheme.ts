import { useContext } from "react";
import { ThemeContext, ThemeContextValue } from "../context/themeContext";

export default function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
