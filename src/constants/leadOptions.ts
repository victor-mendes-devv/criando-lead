export const FATURAMENTO_OPTIONS = [
  "- 50MIL",
  "50 MIL A 250 MIL",
  "250 MIL A 1 MILHAO",
  "ACIMA DE 1 MILHAO",
  "NAO TEM",
] as const;

export const VENDE_NO_ML_OPTIONS = ["SIM", "NAO"] as const;

export type FaturamentoOption = (typeof FATURAMENTO_OPTIONS)[number];
export type VendeNoMlOption = (typeof VENDE_NO_ML_OPTIONS)[number];

// Helpers for validation
export const FATURAMENTO_VALIDOS: readonly string[] =
  FATURAMENTO_OPTIONS as readonly string[];
export const VENDE_VALIDOS: readonly string[] =
  VENDE_NO_ML_OPTIONS as readonly string[];
