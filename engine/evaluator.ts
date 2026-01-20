import { computeMetrics } from './metrics'
import { decide } from './decision'
import { EvaluationContext, EvaluationResult, RuleFailure } from './types'
import { thresholdMin } from './rules'

export function evaluate(input: any, bands: any): EvaluationResult {
  const metrics = computeMetrics(input)

  const ctx: EvaluationContext = {
    input,
    metrics,
    bands,
  }

  const failures: RuleFailure[] = []

  // Example rule: margin on cost
  const fail = thresholdMin(
    ctx,
    'metrics.margin_on_cost',
    bands.min_margin_on_cost,
    {
      id: 'FIN-014',
      severity: 'FATAL',
      category: 'METRIC',
      reason: 'Margin on cost below mainstream lender minimum.',
      fix: 'Increase GDV, reduce costs, or inject more equity.',
    }
  )

  if (fail) failures.push(fail)

  return decide(failures)
}
