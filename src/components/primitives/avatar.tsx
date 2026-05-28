import Image from "next/image";
import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { initialsOf } from "@/lib/initials";
import { cn } from "@/lib/cn";

const avatarVariants = cva(
  "relative inline-flex select-none items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-semibold uppercase tracking-wide text-primary-foreground",
  {
    variants: {
      size: {
        sm: "h-6 w-6 text-[10px]",
        md: "h-8 w-8 text-xs",
        lg: "h-10 w-10 text-sm",
        xl: "h-16 w-16 text-lg",
        "2xl": "h-24 w-24 text-2xl",
      },
      ring: {
        none: "",
        default: "ring-2 ring-border ring-offset-2 ring-offset-background",
        accent: "ring-2 ring-brand-400 ring-offset-2 ring-offset-background",
      },
    },
    defaultVariants: {
      size: "md",
      ring: "none",
    },
  },
);

const SIZE_TO_PX: Record<
  NonNullable<VariantProps<typeof avatarVariants>["size"]>,
  number
> = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 64,
  "2xl": 96,
};

export interface AvatarProps
  extends
    Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof avatarVariants> {
  readonly src?: string | null | undefined;
  readonly displayName?: string | null;
  readonly email?: string | null;
  /**
   * Override the auto-derived alt text. Defaults to the display name when
   * provided, falling back to a generic "Foto profil" label.
   */
  readonly alt?: string;
}

/**
 * Circular avatar that renders a user-uploaded photo when available and a
 * two-letter initials fallback otherwise. Used in the floating header,
 * sign-up preview, and account page.
 *
 * @example
 * ```tsx
 * <Avatar src={profile.avatarUrl} displayName={profile.displayName} email={user.email} size="lg" />
 * ```
 *
 * @example
 * ```tsx
 * <Avatar displayName="Budi Santoso" size="2xl" ring="accent" />
 * ```
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { className, size, ring, src, displayName, email, alt, ...rest },
  ref,
) {
  const variantSize = size ?? "md";
  const px = SIZE_TO_PX[variantSize];
  const initials = initialsOf(displayName, email);
  const hasSrc = typeof src === "string" && src.length > 0;
  const resolvedAlt =
    alt ?? (displayName ? `Foto profil ${displayName}` : "Foto profil");

  return (
    <span
      ref={ref}
      className={cn(avatarVariants({ size: variantSize, ring }), className)}
      {...rest}
    >
      {hasSrc ? (
        <Image
          src={src}
          alt={resolvedAlt}
          width={px}
          height={px}
          sizes={`${String(px)}px`}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden className="leading-none">
          {initials}
        </span>
      )}
    </span>
  );
});

export { avatarVariants };
