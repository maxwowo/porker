import { EyeOff, Ghost, TimerReset } from "lucide-react";
import { Logo, PigMark } from "../../components/Logo";
import { PigMascot } from "../../components/PigMascot";
import { ThemeToggle } from "../../components/ThemeToggle";
import { CreateRoomForm } from "./CreateRoomForm";

const features = [
  {
    icon: EyeOff,
    title: "Face-down by default",
    body: "Votes stay secret until the table reveals them together. No accidental anchoring.",
  },
  {
    icon: Ghost,
    title: "No sign-up, no noise",
    body: "No accounts, emails, ads, or analytics. Open a link, pick a name, start pointing.",
  },
  {
    icon: TimerReset,
    title: "Rooms clean themselves up",
    body: "Every table disappears 24 hours after the last activity. Nothing lingers.",
  },
];

export function HomePage() {
  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(ellipse_at_top,var(--pink-soft),transparent_68%)] opacity-80"
      />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <span className="hidden text-xs font-medium text-ink-muted sm:inline">
            No accounts. No ads. No nonsense.
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative">
        <section className="mx-auto max-w-6xl px-5 pb-14 pt-8 sm:pt-14 lg:pb-24">
          <div className="grid items-start gap-10 lg:grid-cols-[1.06fr_0.94fr] lg:gap-14">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-pink/20 bg-pink-soft/70 px-3 py-1.5 text-xs font-semibold text-pink-strong">
                <PigMark className="size-3.5" />
                Anonymous planning poker
              </span>

              <h1 className="mt-6 font-display text-[clamp(2.9rem,7vw,5rem)] font-bold leading-[0.94] tracking-[-0.055em] text-ink">
                Point stories,
                <br />
                <span className="text-pink-strong">not fingers.</span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-ink-muted sm:text-lg">
                A calm, anonymous planning table for your team. Pick a card, reveal together, and
                get back to building.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-ink-muted">
                {["No sign-up", "Private votes", "Self-cleaning rooms"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-line bg-surface/75 px-3 py-1.5"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <PigMascot className="mt-8 w-56 sm:w-64 lg:mt-7" />
            </div>

            <CreateRoomForm />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16">
          <div className="grid gap-3 sm:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-[1.35rem] border border-line bg-surface/80 p-5 shadow-[0_18px_40px_-32px_rgba(60,30,26,0.4)]"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-pink-soft text-pink-strong">
                  <feature.icon className="size-4.5" />
                </span>
                <h2 className="mt-4 font-display text-base font-bold tracking-[-0.01em] text-ink">
                  {feature.title}
                </h2>
                <p className="mt-1.5 text-sm leading-6 text-ink-muted">{feature.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-line/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <PigMark className="size-4 text-pink-strong" />
            <span className="font-display font-semibold text-ink">Porker</span>
            <span>— planning poker without the noise.</span>
          </div>
          <span>Rooms expire 24 hours after the last activity. No tracking.</span>
        </div>
      </footer>
    </div>
  );
}
