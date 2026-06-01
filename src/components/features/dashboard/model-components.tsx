import { Card } from "@/components/primitives/card";
import { DASHBOARD_MODEL } from "@/config/dashboard";

/**
 * The prediction explained as four plain-language steps (a numbered flow). The
 * honest "local model" caveat and the formal equation live behind the equation
 * disclosure in {@link ModelSection}, keeping this band scannable.
 */
export function ModelComponents() {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {DASHBOARD_MODEL.components.map((component) => (
        <li key={component.step}>
          <Card
            elevation="sm"
            padding="md"
            className="h-full transition-shadow hover:shadow-md"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {component.step}
            </span>
            <p className="mt-3 font-semibold text-foreground">
              {component.title}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {component.body}
            </p>
          </Card>
        </li>
      ))}
    </ol>
  );
}
