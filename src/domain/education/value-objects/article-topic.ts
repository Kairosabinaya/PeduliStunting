export const ARTICLE_TOPICS = [
  "kehamilan",
  "persalinan",
  "nifas",
  "bayi",
  "balita",
  "gizi",
  "imunisasi",
  "perkembangan",
  "kesehatan_umum",
] as const;

export type ArticleTopic = (typeof ARTICLE_TOPICS)[number];

export function isArticleTopic(value: string): value is ArticleTopic {
  return (ARTICLE_TOPICS as readonly string[]).includes(value);
}
