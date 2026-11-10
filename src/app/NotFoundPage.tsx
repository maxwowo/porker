import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Logo } from "../components/Logo";
import { PigMascot } from "../components/PigMascot";
import { ThemeToggle } from "../components/ThemeToggle";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <ThemeToggle />
      </header>
      <main className="mx-auto flex max-w-xl flex-col items-center px-5 py-10 text-center sm:py-16">
        <PigMascot className="w-52" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-pink-strong">
          404
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-[-0.04em] text-ink">
          This pig is lost.
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink-muted">
          That page does not exist. The table is back this way.
        </p>
        <Button size="lg" className="mt-6" onClick={() => navigate("/")}>
          <ArrowLeft className="size-4.5" />
          Back to the lobby
        </Button>
      </main>
    </div>
  );
}
