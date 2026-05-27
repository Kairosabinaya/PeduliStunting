import type {
  ChildId,
  ChildMilestoneId,
  MilestoneId,
  UserId,
} from "@/domain/shared/ids";
import type { DateOnly } from "@/domain/shared/date-only";

export const CHILD_MILESTONE_STATUSES = [
  "not_checked",
  "achieved",
  "delayed",
] as const;

export type ChildMilestoneStatus = (typeof CHILD_MILESTONE_STATUSES)[number];

export class ChildMilestone {
  readonly id: ChildMilestoneId;
  readonly userId: UserId;
  readonly childId: ChildId;
  readonly milestoneId: MilestoneId;
  readonly status: ChildMilestoneStatus;
  readonly checkedAt: DateOnly | null;
  readonly note: string | null;

  constructor(props: {
    id: ChildMilestoneId;
    userId: UserId;
    childId: ChildId;
    milestoneId: MilestoneId;
    status: ChildMilestoneStatus;
    checkedAt: DateOnly | null;
    note: string | null;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.childId = props.childId;
    this.milestoneId = props.milestoneId;
    this.status = props.status;
    this.checkedAt = props.checkedAt;
    this.note = props.note;
  }
}
