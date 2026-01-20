export function computeMetrics(input: any) {
  const gdv = Number(input?.appraisal?.gdv ?? 0)
  const totalCost = Number(input?.appraisal?.total_cost ?? 0)
  const equity = Number(input?.appraisal?.equity ?? 0)
  const buildCost = Number(input?.appraisal?.build_cost ?? 0)
  const contingency = Number(input?.appraisal?.contingency ?? 0)
  const units = Number(input?.scheme?.units ?? 0)
  const buildMonths = Number(input?.programme?.build_months ?? 0)

  return {
    margin_on_cost: totalCost > 0 ? (gdv - totalCost) / totalCost : null,
    margin_on_gdv: gdv > 0 ? (gdv - totalCost) / gdv : null,
    ltc: totalCost > 0 ? (totalCost - equity) / totalCost : null,
    ltgdv: gdv > 0 ? (totalCost - equity) / gdv : null,
    contingency_pct: buildCost > 0 ? contingency / buildCost : null,
    build_months_per_unit: units > 0 ? buildMonths / units : null,
  }
}
