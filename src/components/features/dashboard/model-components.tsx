import { DASHBOARD_MODEL } from "@/config/dashboard";

/**
 * The prediction explained as four plain-language steps (a numbered flow), with
 * the honest "local model" callout. This is the primary, lay-friendly take; the
 * formal equation lives in {@link ModelEquation} below it.
 */
export function ModelComponents() {
  return (
    <div className="space-y-5">
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {DASHBOARD_MODEL.components.map((component) => (
          <li key={component.step}>
            <div className="h-full rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary">
                {component.step}
              </span>
              <p className="mt-3 font-semibold text-foreground">
                {component.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {component.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <p className="rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm text-foreground">
        {DASHBOARD_MODEL.localNote}
      </p>
    </div>
  );
}
