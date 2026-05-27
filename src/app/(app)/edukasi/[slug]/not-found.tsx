import Link from "next/link";

import { buttonVariants } from "@/components/primitives/button";
import { EmptyState } from "@/components/primitives/empty-state";
import { EDUCATION_DETAIL_COPY } from "@/config/education";

export default function EdukasiDetailNotFound() {
  return (
    <div className="space-y-6 md:space-y-8">
      <EmptyState
        title={EDUCATION_DETAIL_COPY.notFoundTitle}
        description={EDUCATION_DETAIL_COPY.notFoundDescription}
        action={
          <Link
            href="/edukasi"
            prefetch={false}
            className={buttonVariants({ variant: "primary" })}
          >
            {EDUCATION_DETAIL_COPY.notFoundAction}
          </Link>
        }
      />
    </div>
  );
}
