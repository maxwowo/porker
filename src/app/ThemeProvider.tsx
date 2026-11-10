import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { applyTheme, saveTheme, storedTheme, systemTheme } from "../lib/theme";
import { ThemeContext } from "./theme-context";
import type { Theme } from "./theme-context";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => storedTheme() ?? systemTheme());

  useLayoutEffect(() => {
    applyTheme(theme);
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
