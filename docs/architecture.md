# Lendability Engine – Architecture

## Purpose
Deterministic underwriting decision engine for SME property lending.
Separates lender logic from UI, data sources, and AI.

## Core Principles
- Deterministic (no AI in decision path)
- Minimal public contract
- Explicit gating vs risk failure
- Precedence enforced by tests

## Public API
### evaluate(input, bands) → EvaluationResult
Returns:
- verdict: MEETS_SME_LENDER_CRITERIA | NOT_YET_LENDABLE
- status: PASS | FIXABLE | FATAL | GATING
- failures: RuleFailure[]

No metrics or internals exposed.

## Debug API
### evaluateDetailed(input, bands) → { result, debug }
Used for:
- UI explanations
- PDFs
- Lender packs
- Auditing

## Decision Semantics
Precedence:
1. GATING – missing prerequisites
2. FATAL – deal-breaking risk
3. FIXABLE – mitigatable issues
4. PASS – lendable

Verdict mapping:
- PASS → MEETS_SME_LENDER_CRITERIA
- otherwise → NOT_YET_LENDABLE

## Gating Rules
Gating indicates the deal cannot yet be assessed, not that it is bad.

Current gating rules:
- Planning stage insufficient (PRE_APP, NONE, PiP without TDC)

## Rule Design
- Rules emit failures, never verdicts
- Decision logic is centralized
- Rules are order-independent

## Testing Strategy
- decision.test.ts → precedence and mapping
- evaluator.test.ts → end-to-end behaviour
- Golden path + negative cases locked

## Future Extensions
- Build regs / technical pack gating
- Ground conditions (mining / SI)
- Exit evidence
- Borrower experience
