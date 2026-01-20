import { EvaluationInput, RuleFailure, Severity } from './types'

export function get(obj: any, path: string) {
  return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj)
}

export function prereqPlanningStage(input: EvaluationInput): RuleFailure[] {
  const stage = input.planning?.stage
  const hasTdc = input.planning?.hasTdc === true

  if (!stage || stage === 'NONE' || stage === 'PRE_APP') {
    return [{
      ruleId: 'PREREQ_PLANNING_STAGE',
      severity: 'FIXABLE',
      status: 'GATING',
      category: 'INPUT',
      reason:
        'Planning stage insufficient for underwriting (need at least Outline, Full, or PiP with TDC).',
      fix: 'Secure at least Outline consent or PiP with TDC before re-submission.',
    }]
  }

  if (stage === 'PIP' && !hasTdc) {
    return [{
      ruleId: 'PREREQ_PLANNING_STAGE',
      severity: 'FIXABLE',
      status: 'GATING',
      category: 'INPUT',
      reason: 'PiP without Technical Details Consent (TDC) is insufficient for underwriting.',
      fix: 'Provide TDC evidence or progress to Outline/Full consent.',
    }]
  }

  return []
}

export function prereqTechnicalPack(input: EvaluationInput): RuleFailure[] {
  const tp = input.technicalPack ?? {}

  if (tp.hasCostPlan !== true) {
    return [{
      ruleId: 'PREREQ_TECHNICAL_PACK',
      severity: 'FIXABLE',
      status: 'GATING',
      category: 'INPUT',
      reason: 'Missing cost plan / QS budget (required for underwriting).',
      fix: 'Provide a cost plan or QS budget for review.',
    }]
  }

  if (tp.hasWorkingDrawings !== true) {
    return [{
      ruleId: 'PREREQ_TECHNICAL_PACK',
      severity: 'FIXABLE',
      status: 'GATING',
      category: 'INPUT',
      reason: 'Missing working drawings (required for underwriting).',
      fix: 'Provide working drawings or equivalent design pack.',
    }]
  }

  const br = tp.buildRegsStage ?? 'NONE'
  if (br === 'NONE' || br === 'IN_PROGRESS') {
    return [{
      ruleId: 'PREREQ_TECHNICAL_PACK',
      severity: 'FIXABLE',
      status: 'GATING',
      category: 'INPUT',
      reason: 'Building Regulations not sufficiently progressed (need at least SUBMITTED).',
      fix: 'Submit Building Regulations or provide evidence of submission.',
    }]
  }

  if (tp.miningRiskArea === true && tp.hasMiningSurvey !== true) {
    return [{
      ruleId: 'PREREQ_TECHNICAL_PACK',
      severity: 'FIXABLE',
      status: 'GATING',
      category: 'INPUT',
      reason: 'Mining risk area flagged but mining/ground risk survey is missing.',
      fix: 'Provide the mining/ground risk survey.',
    }]
  }

  return []
}

export function prereqExitEvidence(input: EvaluationInput): RuleFailure[] {
  const exit = input.exitEvidence ?? {}

  const hasEvidence =
    exit.hasAgentAppraisal === true ||
    exit.hasComparableEvidence === true

  if (!hasEvidence) {
    return [{
      ruleId: 'PREREQ_EXIT_EVIDENCE',
      severity: 'FIXABLE',
      status: 'GATING',
      category: 'INPUT',
      reason: 'No exit evidence provided (agent appraisal or comparable sales required).',
      fix: 'Provide an agent appraisal or comparable sales evidence.',
    }]
  }

  return []
}

function failure(
  ctx: any,
  field: string,
  meta: { id: string; severity: Severity; category: string; reason: string; fix: string }
): RuleFailure {
  const value = get(ctx, field)
  return {
    ruleId: meta.id,
    severity: meta.severity,
    category: meta.category,
    reason: meta.reason,
    fix: meta.fix,
    evidence: { [field]: value },
  }
}

export function presence(
  ctx: any,
  field: string,
  meta: { id: string; severity: Severity; category: string; reason: string; fix: string }
): RuleFailure | null {
  const v = get(ctx, field)
  const ok = v !== undefined && v !== null && v !== ''
  return ok ? null : failure(ctx, field, meta)
}

export function enumAllowed(
  ctx: any,
  field: string,
  allowed: any[],
  meta: { id: string; severity: Severity; category: string; reason: string; fix: string }
): RuleFailure | null {
  const v = get(ctx, field)
  return allowed.includes(v) ? null : failure(ctx, field, meta)
}

export function thresholdMin(
  ctx: any,
  field: string,
  min: number,
  meta: { id: string; severity: Severity; category: string; reason: string; fix: string }
): RuleFailure | null {
  const value = get(ctx, field)
  if (typeof value === 'number' && value >= min) return null

  return failure(ctx, field, meta)
}

export function thresholdMax(
  ctx: any,
  field: string,
  max: number,
  meta: { id: string; severity: Severity; category: string; reason: string; fix: string }
): RuleFailure | null {
  const value = get(ctx, field)
  if (typeof value === 'number' && value <= max) return null
  return failure(ctx, field, meta)
}
