import { computeMetrics } from './metrics'
import { decide } from './decision'
import { EvaluationContext, EvaluationInput, EvaluationResult, EvaluationOutput, RuleFailure } from './types'
import { prereqPlanningStage, thresholdMin, thresholdMax } from './rules'
import { MainstreamBands } from './bands'

export function evaluate(input: EvaluationInput, bands: MainstreamBands): EvaluationResult {
  return evaluateDetailed(input, bands).result
}

export function evaluateDetailed(input: EvaluationInput, bands: MainstreamBands): EvaluationOutput {
  const metrics = computeMetrics(input)

  const ctx: EvaluationContext = {
    input,
    metrics,
    bands,
  }

  const failures: RuleFailure[] = []

  // -------------------------
  // INPUT / PLANNING (GATING)
  // -------------------------
  const planningGate = prereqPlanningStage(ctx.input)
  if (planningGate) failures.push(planningGate)

  // -------------------------
  // CORE METRICS (FATAL)
  // -------------------------
  const fatalMetricRules: Array<RuleFailure | null> = [
    thresholdMin(ctx, 'metrics.margin_on_cost', bands.min_margin_on_cost, {
      id: 'FIN-014',
      severity: 'FATAL',
      category: 'METRIC',
      reason: 'Margin on cost below mainstream lender minimum.',
      fix: 'Increase GDV, reduce costs, or inject more equity.',
    }),
    thresholdMax(ctx, 'metrics.ltgdv', bands.max_ltgdv, {
      id: 'FIN-030',
      severity: 'FATAL',
      category: 'METRIC',
      reason: 'LTGDV above mainstream lender maximum.',
      fix: 'Increase equity, reduce total cost, or reduce leverage requested.',
    }),
    thresholdMax(ctx, 'metrics.ltc', bands.max_ltc, {
      id: 'FIN-031',
      severity: 'FATAL',
      category: 'METRIC',
      reason: 'LTC above mainstream lender maximum.',
      fix: 'Increase equity or reduce total cost to meet leverage band.',
    }),
  ]

  for (const f of fatalMetricRules) if (f) failures.push(f)

  // -------------------------
  // FIXABLE METRICS (FIXABLE)
  // -------------------------
  const fixableRules: Array<RuleFailure | null> = [
    thresholdMin(ctx, 'metrics.contingency_pct', bands.min_contingency_pct, {
      id: 'FIN-021',
      severity: 'FIXABLE',
      category: 'METRIC',
      reason: 'Contingency allowance below mainstream expectations.',
      fix: 'Increase contingency to at least 5–7% of build cost and re-run.',
    }),
    thresholdMax(ctx, 'metrics.build_months_per_unit', bands.max_build_months_per_unit, {
      id: 'PRG-010',
      severity: 'FIXABLE',
      category: 'STRUCTURAL',
      reason: 'Build programme appears slow for unit count.',
      fix: 'Provide a detailed build programme or adjust timeline assumptions.',
    }),
  ]

  for (const f of fixableRules) if (f) failures.push(f)

  const { verdict, status } = decide(failures)

  return { result: { verdict, status, failures }, debug: { metrics } }
}
