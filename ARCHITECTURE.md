# Architecture

## Overview

The Lendability Engine is designed with clear separation of concerns and deterministic behavior.

## Core Components

### 1. Types (`src/types/`)

Defines all interfaces and types used throughout the system:

- **SchemeData**: Input data structure for property development schemes
- **Rule**: Interface for rule definitions
- **RuleResult**: Result of evaluating a single rule
- **AssessmentResult**: Complete assessment output with verdict and fixes
- **Fix**: Specific requirement that must be addressed
- **Verdict**: Binary outcome (APPROVED/REJECTED)

### 2. Engine (`src/engine/`)

**AssessmentEngine**: Core execution engine that:
- Takes a set of rules and scheme data
- Executes all rules deterministically
- Aggregates results into a binary verdict
- Generates prioritized fix list
- Provides audit trail via summary statistics

Key features:
- **Deterministic**: Same input always produces same output
- **Stateless**: No side effects or persistent state
- **Auditable**: Clear traceability from input to verdict

### 3. Rules (`src/rules/`)

Rule definitions separated from execution logic.

**smeRules**: Standard mainstream SME lender criteria including:
- Financial ratios (LTV, LTC, equity, GDV margins)
- Developer experience requirements
- Project characteristics
- Optional AI-scored document quality

Each rule is self-contained and includes:
- Unique identifier
- Category classification
- Clear description
- Evaluation function (deterministic)
- Weight for potential future scoring

## Design Patterns

### Rule Pattern

Rules follow a consistent structure:

```typescript
{
  id: "UNIQUE-ID",
  name: "Human-readable name",
  category: "financial" | "experience" | "development" | "document",
  description: "What this rule checks",
  required: true | false,
  evaluate: (context) => {
    // Deterministic evaluation logic
    if (passes) {
      return { ruleId: id, passed: true };
    }
    return {
      ruleId: id,
      passed: false,
      fix: { /* specific fix details */ }
    };
  }
}
```

### Severity Levels

Fixes are prioritized by severity:
- **CRITICAL**: Must be fixed (regulatory/policy requirements)
- **MAJOR**: Should be fixed (significant risk factors)
- **MINOR**: Nice to fix (quality improvements)

### Binary Verdict

The engine produces a strict binary decision:
- **APPROVED**: No fixes required, scheme meets all criteria
- **REJECTED**: One or more fixes required

This mirrors real lender decision processes.

## Data Flow

```
SchemeData → AssessmentEngine → Rules → RuleResults → AssessmentResult
                                                      ↓
                                            Verdict + Fixes
```

1. Input: SchemeData (structured property development information)
2. Engine: Loads rules and creates execution context
3. Evaluation: Each rule evaluates the scheme independently
4. Aggregation: Results combined into verdict and fix list
5. Output: Binary verdict with prioritized, actionable fixes

## Extensibility

### Adding Custom Rules

Rules are easily extensible:

```typescript
import { Rule, FixSeverity } from '@lendability/engine';

const customRule: Rule = {
  id: "CUSTOM-001",
  name: "My Custom Rule",
  category: "financial",
  description: "Custom requirement",
  required: true,
  evaluate: (context) => {
    // Your logic here
  }
};

// Combine with standard rules
const allRules = [...smeRules, customRule];
const engine = new AssessmentEngine(allRules);
```

### AI Integration (Bounded)

AI scores are optional and bounded:

```typescript
scheme.aiScores = {
  documentQuality: 85,  // 0-100 scale
  marketViability: 72   // 0-100 scale
};
```

Rules can reference AI scores but:
- Must handle missing scores gracefully
- Scores are always 0-100 bounded ranges
- AI never makes the final decision (deterministic rules do)
- AI is for enhancement only (document extraction, quality scoring)

## Audit Trail

Every assessment provides:
- Timestamp of evaluation
- Total rules evaluated
- Number passed/failed
- Complete list of fixes with severity
- Deterministic verdict

This enables full auditability and reproducibility.
