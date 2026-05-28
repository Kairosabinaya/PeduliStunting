"use client";

// Imunisasi schedule modal triggered from ACT 8. Uses the existing
// `<Modal>` primitive (native `<dialog>` with scrim + ESC close). The
// grid renders months 0..24 along the x-axis and each vaccine row marks
// the months it is scheduled for. Cells include accessible aria-labels
// so screen readers can announce the vaccine + month combination.

import { useId, useState } from "react";

import { Button } from "@/components/primitives/button";
import { Modal } from "@/components/primitives/modal";
import { POSYANDU_COPY } from "@/config/edukasi";
import {
  IMMUNIZATION_MONTHS,
  IMMUNIZATION_VACCINES,
  type ImmunizationVaccineCategory,
} from "@/data/edukasi/posyandu";

const CATEGORY_TO_FILL: Record<ImmunizationVaccineCategory, string> = {
  tuberculosis: "bg-primary",
  polio: "bg-primary-soft",
  combo: "bg-accent",
  pneumococcal: "bg-edu-warm",
  rotavirus: "bg-edu-flag",
  measles: "bg-info",
  hepatitis: "bg-success",
  encephalitis: "bg-warning",
};

function ImmunizationGrid() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-1 text-xs">
        <caption className="sr-only">
          Jadwal imunisasi dasar. Setiap baris adalah jenis vaksin, setiap kolom
          adalah bulan ke-0 sampai bulan ke-24, sel berwarna menandai dosis
          terjadwal.
        </caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-elevated bg-surface text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {POSYANDU_COPY.monthLabel}
            </th>
            {IMMUNIZATION_MONTHS.map((month) => (
              <th
                key={month}
                scope="col"
                className="px-1 text-center text-[10px] font-medium text-muted-foreground"
              >
                {month}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {IMMUNIZATION_VACCINES.map((vaccine) => (
            <tr key={vaccine.id}>
              <th
                scope="row"
                className="sticky left-0 z-elevated bg-surface px-2 py-2 text-left text-xs font-semibold text-foreground"
                title={`${POSYANDU_COPY.preventsLabel}: ${vaccine.prevents}`}
              >
                {vaccine.label}
              </th>
              {IMMUNIZATION_MONTHS.map((month) => {
                const scheduled = vaccine.recommendedMonths.includes(month);
                return (
                  <td
                    key={month}
                    className="h-6 w-6 rounded-sm align-middle"
                    aria-label={
                      scheduled
                        ? `${vaccine.label} terjadwal pada bulan ke-${month}. Mencegah ${vaccine.prevents}.`
                        : undefined
                    }
                  >
                    <span
                      className={`block h-full w-full rounded-sm ${scheduled ? CATEGORY_TO_FILL[vaccine.category] : "bg-muted/40"}`}
                      title={
                        scheduled
                          ? `${vaccine.label} · bulan ke-${month}`
                          : undefined
                      }
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-xs text-muted-foreground">
        {POSYANDU_COPY.legendDose}: kotak berwarna menandai dosis yang
        direkomendasikan pada bulan tersebut. Hover sel untuk rincian.
      </p>
    </div>
  );
}

export function ImmunizationModalLauncher() {
  const [open, setOpen] = useState(false);
  const triggerId = useId();
  return (
    <>
      <Button
        id={triggerId}
        size="lg"
        variant="primary"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={POSYANDU_COPY.scheduleAriaLabel}
      >
        {POSYANDU_COPY.scheduleCta}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={POSYANDU_COPY.modalTitle}
        description={POSYANDU_COPY.modalSubtitle}
        variant="centered"
        className="md:w-[min(100%-2rem,52rem)]"
        footer={
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {POSYANDU_COPY.modalCloseLabel}
          </Button>
        }
      >
        <ImmunizationGrid />
      </Modal>
    </>
  );
}
