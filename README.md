# Lendability Engine

Deterministic finance-readiness and lendability engine for SME property development schemes.

## Purpose

A rule-based system that assesses whether a property development scheme meets mainstream SME lender criteria.

## Design Principles

1. **Deterministic and auditable** - Every decision is traceable and reproducible
2. **Rules separated from execution** - Rules are defined independently from the engine
3. **AI used only for bounded scoring** - AI is limited to optional document extraction and quality scoring
4. **Binary lender-style outputs** - Clear verdict (APPROVED/REJECTED) + actionable fix list

## Status

Active development. Internal use only.

## Installation

```bash
npm install
npm run build
```

## Usage

### Basic Assessment

```typescript
import { AssessmentEngine, smeRules, SchemeData } from '@lendability/engine';

// Create engine with standard SME rules
const engine = new AssessmentEngine(smeRules);

// Define scheme data
const scheme: SchemeData = {
  schemeId: "SCH-001",
  info: {
    name: "Riverside Development",
    type: "residential",
    location: "Manchester, UK",
  },
  financials: {
    totalCost: 1000000,
    landCost: 300000,
    buildCost: 700000,
    gdv: 1400000,
    equity: 300000,
    loanAmount: 700000,
  },
  development: {
    units: 4,
    squareFeet: 8000,
    constructionPeriod: 18,
  },
  developer: {
    name: "Riverside Developments Ltd",
    experienceYears: 5,
    completedProjects: 3,
    defaultHistory: false,
  },
};

// Run assessment
const result = engine.assess(scheme);

console.log(result.verdict); // APPROVED or REJECTED
console.log(result.fixes); // List of required fixes
```

### Output Format

Assessment results include:

- **Verdict**: Binary `APPROVED` or `REJECTED`
- **Fixes**: Prioritized list of issues to address
  - ID and rule reference
  - Severity (CRITICAL, MAJOR, MINOR)
  - Description and field
  - Expected vs actual values
- **Summary**: Statistics on rules passed/failed
- **Timestamp**: When assessment was performed

## Standard SME Rules

The engine includes 10 standard rules covering:

### Financial Rules (FIN)
- **FIN-001**: Maximum LTV ratio (70%)
- **FIN-002**: Maximum LTC ratio (75%)
- **FIN-003**: Minimum equity contribution (25%)
- **FIN-004**: Minimum GDV-to-Cost ratio (120%)

### Experience Rules (EXP)
- **EXP-001**: Minimum developer experience (3 years)
- **EXP-002**: Completed projects track record (2 projects)
- **EXP-003**: No default history

### Development Rules (DEV)
- **DEV-001**: Maximum construction period (24 months)
- **DEV-002**: Minimum project size (2 units or 5000 sq ft)

### Document Rules (DOC)
- **DOC-001**: AI document quality score (70/100) - optional

## Architecture

```
src/
├── types/          # Core type definitions
│   └── index.ts    # SchemeData, Rule, AssessmentResult, etc.
├── engine/         # Assessment engine
│   └── AssessmentEngine.ts
├── rules/          # Rule definitions (separated from execution)
│   └── smeRules.ts # Standard SME lending rules
├── examples/       # Usage examples
│   └── basic-assessment.ts
└── index.ts        # Main export
```

## Running Examples

```bash
npm run build
node dist/examples/basic-assessment.js
```

## Development

### Build
```bash
npm run build
```

### Type Check
```bash
npm run typecheck
```

## Key Features

### Deterministic Evaluation
- All rules produce consistent results for the same input
- No randomness or non-deterministic behavior
- Full audit trail of decision logic

### Separated Rules
- Rules defined independently in `src/rules/`
- Easy to add, modify, or disable rules
- Rules include metadata (category, weight, description)

### Actionable Fixes
- Every failed rule generates a specific fix
- Fixes include severity levels for prioritization
- Clear expected vs actual values for quick resolution

### Bounded AI Use
- AI scores are optional (scheme works without them)
- AI limited to document quality and market viability scoring
- All business logic remains deterministic

## License

UNLICENSED - Internal use only
