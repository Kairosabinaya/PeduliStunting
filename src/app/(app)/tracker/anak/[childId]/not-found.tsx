import Link from "next/link";

import { buttonVariants } from "@/components/primitives/button";
import { ErrorState } from "@/components/primitives/error-state";
import { CHILD_DETAIL_COPY, TRACKER_ROUTE } from "@/config/tracker";

export default function ChildNotFound() {
  return (
    <ErrorState
      title={CHILD_DETAIL_COPY.notFoundTitle}
      description={CHILD_DETAIL_COPY.notFoundDescription}
      action={
        <Link
          href={TRACKER_ROUTE}
          className={buttonVariants({ variant: "primary" })}
        >
          {CHILD_DETAIL_COPY.notFoundCta}
        </Link>
      }
    />
  );
}
