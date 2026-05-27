import type { MilestoneId } from "@/domain/shared/ids";

export const MILESTONE_DOMAINS = [
  "gross_motor",
  "fine_motor",
  "language",
  "social",
] as const;

export type MilestoneDomain = (typeof MILESTONE_DOMAINS)[number];

export class Milestone {
  readonly id: MilestoneId;
  readonly code: string;
  readonly domain: MilestoneDomain;
  readonly minAgeMonths: number;
  readonly maxAgeMonths: number;
  readonly description: string;
  readonly sourceLabel: string | null;
  readonly displayOrder: number;

  constructor(props: {
    id: MilestoneId;
    code: string;
    domain: MilestoneDomain;
    minAgeMonths: number;
    maxAgeMonths: number;
    description: string;
    sourceLabel: string | null;
    displayOrder: number;
  }) {
    this.id = props.id;
    this.code = props.code;
    this.domain = props.domain;
    this.minAgeMonths = props.minAgeMonths;
    this.maxAgeMonths = props.maxAgeMonths;
    this.description = props.description;
    this.sourceLabel = props.sourceLabel;
    this.displayOrder = props.displayOrder;
  }
}
