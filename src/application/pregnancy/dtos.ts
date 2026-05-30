import type { Pregnancy } from "@/domain/pregnancy/entities/pregnancy";
import type {
  PregnancyEvent,
  PregnancyEventData,
  PregnancyEventKind,
} from "@/domain/pregnancy/entities/pregnancy-event";

export interface PregnancyDto {
  readonly id: string;
  readonly userId: string;
  readonly hpht: string;
  readonly expectedDue: string | null;
  readonly initialWeightKg: number | null;
  readonly heightCm: number | null;
  readonly notes: string | null;
  readonly archivedAt: string | null;
}

export interface PregnancyEventDto {
  readonly id: string;
  readonly userId: string;
  readonly pregnancyId: string;
  readonly kind: PregnancyEventKind;
  readonly eventDate: string;
  readonly data: PregnancyEventData;
  readonly note: string | null;
}

export function toPregnancyDto(item: Pregnancy): PregnancyDto {
  return {
    id: item.id,
    userId: item.userId,
    hpht: item.hpht,
    expectedDue: item.expectedDue,
    initialWeightKg: item.initialWeightKg,
    heightCm: item.heightCm,
    notes: item.notes,
    archivedAt: item.archivedAt,
  };
}

export function toPregnancyEventDto(item: PregnancyEvent): PregnancyEventDto {
  return {
    id: item.id,
    userId: item.userId,
    pregnancyId: item.pregnancyId,
    kind: item.kind,
    eventDate: item.eventDate,
    data: item.data,
    note: item.note,
  };
}
