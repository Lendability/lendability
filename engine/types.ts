export type Severity = 'FATAL' | 'FIXABLE'
export type Verdict = 'MEETS_SME_LENDER_CRITERIA' | 'NOT_YET_LENDABLE'
export type VerdictStatus = 'PASS' | 'FIXABLE' | 'FATAL' | 'GATING'

export type PlanningStage =
  | 'NONE'
  | 'PRE_APP'
  | 'PIP'
  | 'OUTLINE'
  | 'FULL'

export type BuildRegsStage = 'NONE' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED'

export interface PlanningInput {
  stage: PlanningStage
  /**
   * True only when Technical Details Consent is secured (PIP -> TDC).
   * Only relevant if stage === 'PIP'.
   */
  hasTdc?: boolean
}

export interface TechnicalPackInput {
  /**
   * Whether a cost plan / QS budget exists.
   * Lenders usually gate if missing.
   */
  hasCostPlan?: boolean

  /**
   * Whether working drawings exist (RIBA 4-ish).
   * Helps lenders validate buildability + costs.
   */
  hasWorkingDrawings?: boolean

  /**
   * Building Regulations progress.
   */
  buildRegsStage?: BuildRegsStage

  /**
   * Whether a mining / ground risk survey is available when required.
   * (Requirement is conditional; see rule notes.)
   */
  hasMiningSurvey?: boolean

  /**
   * If true, the site is in an area where mining risk checks are required.
   * (Keep this simple for now; later this can be derived from constraints.)
   */
  miningRiskArea?: boolean
}

export interface EvaluationInput {
  planning: PlanningInput
  technicalPack: TechnicalPackInput
  scheme?: Record<string, any>
  appraisal?: Record<string, any>
  programme?: Record<string, any>
  [key: string]: any
}

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
  input: EvaluationInput
  metrics: Metrics
  aiScores?: Record<string, any>
  bands?: Record<string, any>
}
