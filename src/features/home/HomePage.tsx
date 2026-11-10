import { EyeOff, Ghost, TimerReset } from "lucide-react";
import { IconBadge } from "../../components/IconBadge";
import { PigMark } from "../../components/Logo";
import { PigMascot } from "../../components/PigMascot";
import { Pill } from "../../components/Pill";
import { SiteHeader } from "../../components/SiteHeader";
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

const highlights = ["No sign-up", "Private votes", "Self-cleaning rooms"];

export function HomePage() {
  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(ellipse_at_top,var(--pink-soft),transparent_68%)] opacity-80"
      />

      <div className="relative">
        <SiteHeader>
          <span className="hidden text-xs font-medium text-ink-muted sm:inline">
            No accounts. No ads. No nonsense.
          </span>
        </SiteHeader>
      </div>

      <main className="relative">
        <section className="mx-auto max-w-6xl px-5 pb-14 pt-8 sm:pt-14 lg:pb-24">
          <div className="grid items-start gap-10 lg:grid-cols-[1.06fr_0.94fr] lg:gap-14">
            <div>
              <Pill tone="accent">
                <PigMark className="size-3.5" />
                Anonymous planning poker
              </Pill>

              <h1 className="mt-6 font-display text-[clamp(2.9rem,7vw,5rem)] font-bold leading-[0.94] tracking-[-0.055em] text-ink">
                Point stories,
                <br />
                <span className="text-pink-strong">not fingers.</span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-ink-muted sm:text-lg">
                A calm, anonymous planning table for your team. Pick a card, reveal together, and
                get back to building.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {highlights.map((highlight) => (
                  <Pill key={highlight}>{highlight}</Pill>
                ))}
              </div>

              <PigMascot className="mt-8 w-56 sm:w-64 lg:mt-7" />
            </div>

            <CreateRoomForm />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-16">
          <div className="grid gap-3 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="rounded-card border border-line bg-surface/80 p-5 shadow-panel"
              >
                <IconBadge size="sm">
                  <Icon className="size-4.5" />
                </IconBadge>
                <h2 className="mt-4 font-display text-base font-bold tracking-[-0.01em] text-ink">
                  {title}
                </h2>
                <p className="mt-1.5 text-sm leading-6 text-ink-muted">{body}</p>
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
