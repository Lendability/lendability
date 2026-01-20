import { describe, it, expect } from 'vitest'
import { decide } from '../decision'

describe('decide', () => {
  it('prioritizes GATING over FIXABLE', () => {
    const { verdict, status } = decide([
      {
        ruleId: 'GATE-001',
        severity: 'FIXABLE',
        status: 'GATING',
        category: 'INPUT',
        reason: 'Missing prerequisite data.',
        fix: 'Provide required documents.',
      },
    ])

    expect(status).toBe('GATING')
    expect(verdict).toBe('NOT_YET_LENDABLE')
  })
})
