import { RuleFailure, Severity } from './types'

export function get(obj: any, path: string) {
  return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj)
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
