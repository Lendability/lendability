import { RuleFailure, Severity } from './types'

export function get(obj: any, path: string) {
  return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj)
}

export function thresholdMin(
  ctx: any,
  field: string,
  min: number,
  meta: { id: string; severity: Severity; category: string; reason: string; fix: string }
): RuleFailure | null {
  const value = get(ctx, field)
  if (typeof value === 'number' && value >= min) return null

  return {
    ruleId: meta.id,
    severity: meta.severity,
    category: meta.category,
    reason: meta.reason,
    fix: meta.fix,
    evidence: { [field]: value },
  }
}
