import { describe, it, expect } from 'vitest'
import { evaluate, SME_MAINSTREAM_BANDS_V1 } from '../index'

const BASE_INPUT = {
  scheme: { units: 4 },
  planning: { stage: 'FULL' },
  appraisal: {
    gdv: 1_000_000,
    total_cost: 800_000,
    equity: 200_000,
    build_cost: 500_000,
    contingency: 40_000, // 8%
  },
  programme: { build_months: 10 },
}

describe('Lendability engine – first lender rules', () => {
  it('PASS when all thresholds are met', () => {
    const result = evaluate(BASE_INPUT, SME_MAINSTREAM_BANDS_V1)
    expect(result.verdict).toBe('MEETS_SME_LENDER_CRITERIA')
    expect(result.status).toBe('PASS')
    expect(result.failures.length).toBe(0)
  })

  it('GATING when planning stage insufficient', () => {
    const bad = { ...BASE_INPUT, planning: { stage: 'PRE_APP' } }
    const result = evaluate(bad, SME_MAINSTREAM_BANDS_V1)
    expect(result.verdict).toBe('NOT_YET_LENDABLE')
    expect(result.status).toBe('GATING')
    expect(result.failures.some(f => f.ruleId === 'PREREQ_PLANNING_STAGE')).toBe(true)
  })

  it('GATING when PiP without TDC', () => {
    const bad = { ...BASE_INPUT, planning: { stage: 'PIP', hasTdc: false } }
    const result = evaluate(bad, SME_MAINSTREAM_BANDS_V1)
    expect(result.verdict).toBe('NOT_YET_LENDABLE')
    expect(result.status).toBe('GATING')
    expect(result.failures.some(f => f.ruleId === 'PREREQ_PLANNING_STAGE')).toBe(true)
  })

  it('FIXABLE when contingency below minimum', () => {
    const bad = {
      ...BASE_INPUT,
      appraisal: { ...BASE_INPUT.appraisal, contingency: 10_000 }, // 2%
    }
    const result = evaluate(bad, SME_MAINSTREAM_BANDS_V1)
    expect(result.verdict).toBe('NOT_YET_LENDABLE')
    expect(result.status).toBe('FIXABLE')
    expect(result.failures.some(f => f.ruleId === 'FIN-021')).toBe(true)
  })

  it('FATAL when LTGDV above maximum', () => {
    // increase leverage by reducing equity
    const bad = {
      ...BASE_INPUT,
      appraisal: { ...BASE_INPUT.appraisal, equity: 50_000 },
    }
    const result = evaluate(bad, SME_MAINSTREAM_BANDS_V1)
    expect(result.verdict).toBe('NOT_YET_LENDABLE')
    expect(result.status).toBe('FATAL')
    expect(result.failures.some(f => f.ruleId === 'FIN-030')).toBe(true)
  })
})
