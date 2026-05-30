// Stub aliased to `next/navigation` under vitest (see vitest.config.ts). The
// real module ships server/client export conditions the vite test resolver (no
// Next plugin) cannot follow, so any client component reading `usePathname()`
// etc. fails to import. This stub provides inert hooks so route-aware
// components (ChildNav, FloatingHeader, …) are unit-testable.

export function usePathname(): string {
  return "/";
}

export function useRouter(): {
  push: () => void;
  replace: () => void;
  back: () => void;
  forward: () => void;
  refresh: () => void;
  prefetch: () => void;
} {
  return {
    push: () => {},
    replace: () => {},
    back: () => {},
    forward: () => {},
    refresh: () => {},
    prefetch: () => {},
  };
}

export function useSearchParams(): URLSearchParams {
  return new URLSearchParams();
}

export function useParams(): Record<string, string> {
  return {};
}

export function redirect(): never {
  throw new Error("redirect() called in test stub");
}

export function notFound(): never {
  throw new Error("notFound() called in test stub");
}
