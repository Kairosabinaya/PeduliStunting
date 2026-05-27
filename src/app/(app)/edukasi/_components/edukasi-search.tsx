"use client";

// Client Component reason: the search field debounces user input and pushes
// the resulting URL via `useRouter`, which both require browser APIs.

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import {
  EDUCATION_COPY,
  EDUCATION_SEARCH_MAX_LENGTH,
  EDUCATION_SEARCH_MIN_LENGTH,
} from "@/config/education";

import {
  buildEdukasiHref,
  type ParsedEdukasiFilters,
} from "../_lib/filters";

interface EdukasiSearchProps {
  readonly filters: ParsedEdukasiFilters;
}

const DEBOUNCE_MS = 300;

/**
 * Debounced search field that mirrors its state into the URL. Empty input
 * clears the `cari` param; queries shorter than the minimum length are
 * tolerated locally but only pushed once they cross the threshold so the
 * server-side filter does not flap on every keystroke.
 */
export function EdukasiSearch({ filters }: EdukasiSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState<string>(filters.search ?? "");
  const [isPending, startTransition] = useTransition();
  const lastPushedRef = useRef<string>(filters.search ?? "");
  const [prevFilterSearch, setPrevFilterSearch] = useState<string | null>(
    filters.search ?? null,
  );

  if ((filters.search ?? null) !== prevFilterSearch) {
    setPrevFilterSearch(filters.search ?? null);
    setValue(filters.search ?? "");
  }

  useEffect(() => {
    lastPushedRef.current = filters.search ?? "";
  }, [filters.search]);

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed === lastPushedRef.current) return;

    const nextSearch =
      trimmed.length === 0
        ? null
        : trimmed.length >= EDUCATION_SEARCH_MIN_LENGTH &&
            trimmed.length <= EDUCATION_SEARCH_MAX_LENGTH
          ? trimmed
          : undefined;

    if (nextSearch === undefined) return;

    const timer = window.setTimeout(() => {
      lastPushedRef.current = trimmed;
      const href = buildEdukasiHref(filters, { search: nextSearch });
      startTransition(() => {
        router.push(href, { scroll: false });
      });
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [value, filters, router]);

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = value.trim();
        const nextSearch = trimmed.length === 0 ? null : trimmed;
        lastPushedRef.current = trimmed;
        const href = buildEdukasiHref(filters, { search: nextSearch });
        startTransition(() => {
          router.push(href, { scroll: false });
        });
      }}
      className="space-y-1.5"
    >
      <Label htmlFor="edukasi-search">{EDUCATION_COPY.searchLabel}</Label>
      <Input
        id="edukasi-search"
        type="search"
        inputMode="search"
        autoComplete="off"
        spellCheck={false}
        maxLength={EDUCATION_SEARCH_MAX_LENGTH}
        placeholder={EDUCATION_COPY.searchPlaceholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-busy={isPending}
      />
    </form>
  );
}
