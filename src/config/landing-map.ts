/**
 * Landing-before-login map-background transition keypoints.
 *
 * The unauthenticated `/map` route renders the interactive choropleth as a
 * decorative backdrop, with a `filter: blur() saturate()` overlay whose
 * intensity is scroll-linked. Three keypoints — top-of-hero, mid-content,
 * final-CTA — interpolate via `motion/react` `useScroll` + `useTransform`.
 *
 * Filter (not backdrop-filter) is animated because the wrapper is its own
 * composited layer: animating `filter` is a single rasterization per state
 * change, while animating `backdrop-filter` re-rasterizes the stacking
 * context behind it on every frame — unacceptable on mid-range Android per
 * the project performance budget.
 */

/**
 * Subtle backdrop tuning. The landing-before-login surface is dominated by
 * the 11-ACT scrollytelling content; the map sits BEHIND those sections as
 * an ambient reminder that the product is real and live, NOT as a visual
 * focal point. Keypoints are deliberately conservative so the map never
 * fights the foreground for attention.
 */

/** Blur radius (px) applied to the map wrapper at each scroll keypoint. */
export const LANDING_MAP_BLUR_KEYPOINTS = {
  hero: 28,
  mid: 22,
  cta: 14,
} as const;

/** Saturation multiplier at each scroll keypoint. Lower at top = subtle,
 *  higher at bottom = vivid reveal. */
export const LANDING_MAP_SATURATE_KEYPOINTS = {
  hero: 1.0,
  mid: 1.15,
  cta: 1.35,
} as const;

/** Wrapper opacity. Lower across the board so the map is a hint, not a
 *  feature. Even at the final CTA it stays partially translucent. */
export const LANDING_MAP_OPACITY_KEYPOINTS = {
  hero: 0.25,
  mid: 0.35,
  cta: 0.5,
} as const;

/**
 * Static fallback when the user prefers reduced motion. Mid-keyframe values
 * give the same "map present but subdued" feel without subscribing to
 * scroll position.
 */
export const LANDING_REDUCED_MOTION_FALLBACK = {
  blur: 22,
  saturate: 1.15,
  opacity: 0.35,
} as const;
