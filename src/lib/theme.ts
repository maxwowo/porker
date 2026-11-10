import type { Theme } from "../app/theme-context";
import { readJson, writeJson } from "./storage";

const THEME_KEY = "porker:theme";

export function storedTheme(): Theme | null {
  const value = readJson<unknown>(THEME_KEY);
  return value === "light" || value === "dark" ? value : null;
}

export function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function saveTheme(theme: Theme): void {
  writeJson(THEME_KEY, theme);
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}
