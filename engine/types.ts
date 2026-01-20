export type Severity = 'FATAL' | 'FIXABLE'
export type Verdict = 'MEETS_SME_LENDER_CRITERIA' | 'NOT_YET_LENDABLE'
export type VerdictStatus = 'PASS' | 'FIXABLE' | 'FATAL' | 'GATING'

export interface RuleFailure {
  ruleId: string
  severity: Severity
  category: string
  reason: string
  fix: string
  evidence?: Record<string, unknown>
}

export interface EvaluationResult {
  verdict: Verdict
  status: VerdictStatus
  failures: RuleFailure[]
}

export interface EvaluationContext {
  input: Record<string, any>
  metrics: Record<string, number | null>
  aiScores?: Record<string, any>
  bands?: Record<string, any>
}
