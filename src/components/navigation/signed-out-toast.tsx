"use client";

// Client because it reads the URL query flag and fires a toast — both
// browser-only concerns.

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { SIGN_OUT_NOTICE_COPY } from "@/config/auth";
import {
  SIGNED_OUT_NOTICE_PARAM,
  SIGNED_OUT_NOTICE_VALUE,
} from "@/config/routes";

/**
 * Surfaces the post-sign-out confirmation toast when the user lands on the
 * landing page after signing out (`?notice=signed-out`). The flag is removed
 * from the URL once shown so a refresh or back-navigation never replays it.
 *
 * Renders nothing; it only orchestrates the toast as a side effect. Mount it
 * inside a `<Suspense>` boundary because it reads `useSearchParams`.
 */
export function SignedOutToast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const firedRef = useRef(false);

  const signedOut =
    params.get(SIGNED_OUT_NOTICE_PARAM) === SIGNED_OUT_NOTICE_VALUE;

  useEffect(() => {
    if (!signedOut || firedRef.current) return;
    firedRef.current = true;

    toast.success(SIGN_OUT_NOTICE_COPY.toastTitle, {
      description: SIGN_OUT_NOTICE_COPY.toastDescription,
    });

    const next = new URLSearchParams(params);
    next.delete(SIGNED_OUT_NOTICE_PARAM);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [signedOut, params, pathname, router]);

  return null;
}
