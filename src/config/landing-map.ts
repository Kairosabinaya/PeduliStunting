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

/** Blur radius (px) applied to the map wrapper at each scroll keypoint.
 *  Lighter than the original tuning so the map reads as a clear-but-soft
 *  texture instead of a dense fog. */
export const LANDING_MAP_BLUR_KEYPOINTS = {
  hero: 16,
  mid: 10,
  cta: 3,
} as const;

/** Saturation multiplier at each scroll keypoint. Lower at top = subtle,
 *  higher at bottom = vivid reveal. */
export const LANDING_MAP_SATURATE_KEYPOINTS = {
  hero: 1.1,
  mid: 1.25,
  cta: 1.45,
} as const;

/** Wrapper opacity. Higher than the previous tuning so the map peeks
 *  through more clearly — "blurnya lebih transparent dikit" per user
 *  feedback. Still capped well below 1.0 at the hero so the foreground
 *  hero card remains the visual lead. */
export const LANDING_MAP_OPACITY_KEYPOINTS = {
  hero: 0.45,
  mid: 0.6,
  cta: 0.75,
} as const;

/**
 * Static fallback when the user prefers reduced motion. Mid-keyframe values
 * give the same "map present but subdued" feel without subscribing to
 * scroll position.
 */
export const LANDING_REDUCED_MOTION_FALLBACK = {
  blur: 10,
  saturate: 1.25,
  opacity: 0.6,
} as const;
