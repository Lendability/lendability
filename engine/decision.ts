import type { RuleFailure, Verdict, VerdictStatus } from './types'

export function decide(failures: RuleFailure[]): { verdict: Verdict; status: VerdictStatus } {
  const status: VerdictStatus =
    failures.some(f => f.status === 'GATING') ? 'GATING'
    : failures.some(f => f.severity === 'FATAL') ? 'FATAL'
    : failures.some(f => f.severity === 'FIXABLE') ? 'FIXABLE'
    : 'PASS'

  const verdict: Verdict = status === 'PASS'
    ? 'MEETS_SME_LENDER_CRITERIA'
    : 'NOT_YET_LENDABLE'

  return { verdict, status }
}
