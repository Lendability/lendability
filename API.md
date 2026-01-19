# API Reference

## Core Classes

### AssessmentEngine

Main engine for evaluating schemes against rules.

#### Constructor

```typescript
new AssessmentEngine(rules: Rule[])
```

**Parameters:**
- `rules`: Array of Rule objects to evaluate

**Example:**
```typescript
import { AssessmentEngine, smeRules } from '@lendability/engine';

const engine = new AssessmentEngine(smeRules);
```

#### Methods

##### assess(scheme: SchemeData): AssessmentResult

Evaluates a scheme against all rules and returns a verdict.

**Parameters:**
- `scheme`: SchemeData object containing all scheme information

**Returns:** AssessmentResult with verdict, fixes, and summary

**Example:**
```typescript
const result = engine.assess(scheme);
console.log(result.verdict); // "APPROVED" or "REJECTED"
console.log(result.fixes); // Array of Fix objects
```

##### getRules(): Rule[]

Returns all rules currently loaded in the engine.

**Returns:** Array of Rule objects

##### getRulesByCategory(category: Rule["category"]): Rule[]

Returns rules filtered by category.

**Parameters:**
- `category`: One of "financial", "experience", "development", or "document"

**Returns:** Array of Rule objects in the specified category

## Types

### SchemeData

Input data structure for a property development scheme.

```typescript
interface SchemeData {
  schemeId: string;
  info: {
    name: string;
    type: "residential" | "commercial" | "mixed";
    location: string;
  };
  financials: {
    totalCost: number;
    landCost: number;
    buildCost: number;
    gdv: number;
    equity: number;
    loanAmount: number;
  };
  development: {
    units: number;
    squareFeet: number;
    constructionPeriod: number;
  };
  developer: {
    name: string;
    experienceYears: number;
    completedProjects: number;
    defaultHistory: boolean;
  };
  aiScores?: {
    documentQuality?: number;
    marketViability?: number;
  };
}
```

### AssessmentResult

Output from an assessment.

```typescript
interface AssessmentResult {
  verdict: Verdict;
  fixes: Fix[];
  timestamp: Date;
  summary: {
    totalRules: number;
    passedRules: number;
    failedRules: number;
  };
}
```

### Verdict

Binary assessment outcome.

```typescript
enum Verdict {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}
```

### Fix

A required correction to make a scheme compliant.

```typescript
interface Fix {
  id: string;
  ruleId: string;
  severity: FixSeverity;
  description: string;
  field?: string;
  expected?: string;
  actual?: string;
}
```

### FixSeverity

Priority level for fixes.

```typescript
enum FixSeverity {
  CRITICAL = "CRITICAL",
  MAJOR = "MAJOR",
  MINOR = "MINOR"
}
```

### Rule

Definition of an evaluation rule.

```typescript
interface Rule {
  id: string;
  name: string;
  category: "financial" | "experience" | "development" | "document";
  description: string;
  evaluate: (context: RuleContext) => RuleResult;
  required: boolean;
  weight?: number;
}
```

### RuleContext

Context passed to rule evaluation functions.

```typescript
interface RuleContext {
  scheme: SchemeData;
  metadata?: Record<string, unknown>;
}
```

### RuleResult

Result from evaluating a single rule.

```typescript
interface RuleResult {
  ruleId: string;
  passed: boolean;
  fix?: Omit<Fix, "ruleId">;
}
```

## Standard Rules

### Financial Rules (FIN)

#### FIN-001: Maximum LTV Ratio
- **Limit**: 70%
- **Severity**: CRITICAL
- **Formula**: (loanAmount / gdv) * 100

#### FIN-002: Maximum LTC Ratio
- **Limit**: 75%
- **Severity**: CRITICAL
- **Formula**: (loanAmount / totalCost) * 100

#### FIN-003: Minimum Equity Contribution
- **Minimum**: 25%
- **Severity**: CRITICAL
- **Formula**: (equity / totalCost) * 100

#### FIN-004: Minimum GDV-to-Cost Ratio
- **Minimum**: 120%
- **Severity**: MAJOR
- **Formula**: (gdv / totalCost) * 100

### Experience Rules (EXP)

#### EXP-001: Minimum Developer Experience
- **Minimum**: 3 years
- **Severity**: CRITICAL

#### EXP-002: Completed Projects Track Record
- **Minimum**: 2 projects
- **Severity**: CRITICAL

#### EXP-003: No Default History
- **Requirement**: defaultHistory must be false
- **Severity**: CRITICAL

### Development Rules (DEV)

#### DEV-001: Maximum Construction Period
- **Maximum**: 24 months
- **Severity**: MAJOR

#### DEV-002: Minimum Project Size
- **Minimum**: 2 units OR 5000 sq ft
- **Severity**: MAJOR

### Document Rules (DOC)

#### DOC-001: Document Quality Score
- **Minimum**: 70/100
- **Severity**: MINOR
- **Note**: Optional - passes if AI score not provided

## Usage Examples

### Basic Assessment

```typescript
import { AssessmentEngine, smeRules, SchemeData } from '@lendability/engine';

const engine = new AssessmentEngine(smeRules);

const scheme: SchemeData = {
  schemeId: "SCH-001",
  // ... scheme data
};

const result = engine.assess(scheme);

if (result.verdict === "APPROVED") {
  console.log("Scheme approved!");
} else {
  console.log("Fixes required:");
  result.fixes.forEach(fix => {
    console.log(`- [${fix.severity}] ${fix.description}`);
  });
}
```

### Custom Rules

```typescript
import { AssessmentEngine, smeRules, Rule, FixSeverity } from '@lendability/engine';

const customRule: Rule = {
  id: "CUSTOM-001",
  name: "Custom Check",
  category: "financial",
  description: "My custom requirement",
  required: true,
  evaluate: (context) => {
    // Your logic
    return { ruleId: "CUSTOM-001", passed: true };
  }
};

const engine = new AssessmentEngine([...smeRules, customRule]);
```

### Filtering by Category

```typescript
const financialRules = engine.getRulesByCategory("financial");
console.log(`${financialRules.length} financial rules loaded`);
```
