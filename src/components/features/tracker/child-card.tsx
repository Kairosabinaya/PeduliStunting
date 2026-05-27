import Link from "next/link";

import type { ChildDto } from "@/application/tracking/dtos";
import { Badge } from "@/components/primitives/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { SEX_LABEL, trackerChildRoute } from "@/config/tracker";

export interface ChildCardProps {
  readonly child: ChildDto;
}

/**
 * Summary card for a single child shown on the tracker list page. Wraps the
 * entire card body in a {@link Link} so the whole card is the navigation
 * target, while exposing a smaller "Lihat detail" affordance for sighted
 * users. The detail route follows the canonical
 * `tracker/anak/{childId}` slug (see STATE.md §5.2).
 *
 * @example
 * ```tsx
 * <ChildCard child={child} />
 * ```
 */
export function ChildCard({ child }: ChildCardProps) {
  const sexLabel = SEX_LABEL[child.sex];
  const birthDateLabel = new Date(child.birthDate).toLocaleDateString("id-ID");
  const detailHref = trackerChildRoute(child.id);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="primary">{sexLabel}</Badge>
          <Badge tone="neutral">Lahir {birthDateLabel}</Badge>
        </div>
        <CardTitle>
          <Link
            href={detailHref}
            className="focus-visible:ring-ring rounded-sm outline-none focus-visible:ring-2"
          >
            {child.name}
          </Link>
        </CardTitle>
        {child.notes ? <CardDescription>{child.notes}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <dl className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>
            <dt>BB lahir</dt>
            <dd className="text-foreground">
              {child.birthWeightKg !== null ? `${child.birthWeightKg} kg` : "-"}
            </dd>
          </div>
          <div>
            <dt>PB lahir</dt>
            <dd className="text-foreground">
              {child.birthLengthCm !== null ? `${child.birthLengthCm} cm` : "-"}
            </dd>
          </div>
        </dl>
        <Link
          href={detailHref}
          className="focus-visible:ring-ring inline-flex items-center rounded-sm text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2"
        >
          Lihat detail
        </Link>
      </CardContent>
    </Card>
  );
}
