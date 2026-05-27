import type { CoefficientSummaryDto } from "@/application/model/dtos";
import type { IndicatorDefinitionDto } from "@/application/region/dtos";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { DASHBOARD_WHATIF_SECTION } from "@/config/dashboard";
import type { AppError } from "@/domain/errors/app-error";
import type { Result } from "@/domain/shared/result";

import { WhatIfSlider } from "./what-if-slider";

export interface WhatIfSectionProps {
  readonly coefficients: Result<CoefficientSummaryDto, AppError>;
  readonly dictionary: Result<readonly IndicatorDefinitionDto[], AppError>;
}

export function WhatIfSection({ coefficients, dictionary }: WhatIfSectionProps) {
  if (!coefficients.ok) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{DASHBOARD_WHATIF_SECTION.title}</CardTitle>
          <CardDescription>
            {DASHBOARD_WHATIF_SECTION.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorState
            title={DASHBOARD_WHATIF_SECTION.errorTitle}
            description={coefficients.error.message}
          />
        </CardContent>
      </Card>
    );
  }

  const items = coefficients.value.items;
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{DASHBOARD_WHATIF_SECTION.title}</CardTitle>
          <CardDescription>
            {DASHBOARD_WHATIF_SECTION.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title={DASHBOARD_WHATIF_SECTION.noCoefficientsTitle}
            description={DASHBOARD_WHATIF_SECTION.noCoefficientsDescription}
          />
        </CardContent>
      </Card>
    );
  }

  const dictionaryIndex = dictionary.ok
    ? indexDictionary(dictionary.value)
    : new Map<string, IndicatorDefinitionDto>();

  const choices = items.map((summary) => {
    const definition = dictionaryIndex.get(summary.predictorCode);
    return {
      code: summary.predictorCode,
      label: definition?.name ?? summary.predictorCode,
      summary,
      unit: definition?.unit ?? null,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{DASHBOARD_WHATIF_SECTION.title}</CardTitle>
        <CardDescription>
          {DASHBOARD_WHATIF_SECTION.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <WhatIfSlider choices={choices} />
      </CardContent>
    </Card>
  );
}

function indexDictionary(
  items: readonly IndicatorDefinitionDto[],
): Map<string, IndicatorDefinitionDto> {
  const map = new Map<string, IndicatorDefinitionDto>();
  for (const item of items) {
    map.set(item.code, item);
  }
  return map;
}
