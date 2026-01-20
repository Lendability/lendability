import { EvaluationResult, RuleFailure } from './types'

export function decide(failures: RuleFailure[]): EvaluationResult {
  const hasFatal = failures.some(f => f.severity === 'FATAL')
  const hasFixable = failures.some(f => f.severity === 'FIXABLE')

  if (hasFatal) {
    return { verdict: 'NOT_YET_LENDABLE', status: 'FATAL', failures }
  }

  if (hasFixable) {
    return { verdict: 'NOT_YET_LENDABLE', status: 'FIXABLE', failures }
  }

  return { verdict: 'MEETS_SME_LENDER_CRITERIA', status: 'PASS', failures: [] }
}
