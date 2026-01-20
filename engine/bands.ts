export type MainstreamBands = {
  min_margin_on_cost: number
  min_contingency_pct: number
  max_ltgdv: number
  max_ltc: number
  max_build_months_per_unit: number
  allowed_planning_statuses: Array<'FULL' | 'OUTLINE' | 'RESERVED_MATTERS'>
}

export const SME_MAINSTREAM_BANDS_V1: MainstreamBands = {
  min_margin_on_cost: 0.15,
  min_contingency_pct: 0.05,
  max_ltgdv: 0.65,
  max_ltc: 0.85,
  max_build_months_per_unit: 2.5,
  allowed_planning_statuses: ['FULL', 'OUTLINE', 'RESERVED_MATTERS'],
}
