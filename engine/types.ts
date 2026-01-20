export type Severity = 'FATAL' | 'FIXABLE'
export type Verdict = 'MEETS_SME_LENDER_CRITERIA' | 'NOT_YET_LENDABLE'
export type VerdictStatus = 'PASS' | 'FIXABLE' | 'FATAL' | 'GATING'

export interface RuleFailure {
  ruleId: string
  severity: Severity
  /**
   * Optional workflow state. Use only when the rule cannot be evaluated yet
   * due to missing prerequisites (e.g. missing planning permission / docs).
   */
  status?: 'GATING'
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

export type Metrics = Record<string, number | null>

export interface EvaluationDebug {
  metrics: Metrics
}

export interface EvaluationOutput {
  result: EvaluationResult
  debug?: EvaluationDebug
}

export interface EvaluationContext {
  input: Record<string, any>
  metrics: Metrics
  aiScores?: Record<string, any>
  bands?: Record<string, any>
}
