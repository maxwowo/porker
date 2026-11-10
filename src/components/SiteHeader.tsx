import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
      <Logo />
      <div className="flex items-center gap-2">
        {children}
        <ThemeToggle />
      </div>
    </header>
  );
}
