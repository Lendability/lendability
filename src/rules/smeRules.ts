/**
 * Standard SME Lending Rules
 * 
 * Deterministic rules based on mainstream SME lender criteria.
 * Rules are separated from execution for auditability.
 */

import { Rule, RuleContext, FixSeverity } from "../types/index.js";

/**
 * Calculate Loan-to-Value ratio
 */
function calculateLTV(context: RuleContext): number {
  const { loanAmount, gdv } = context.scheme.financials;
  return gdv > 0 ? (loanAmount / gdv) * 100 : 0;
}

/**
 * Calculate Loan-to-Cost ratio
 */
function calculateLTC(context: RuleContext): number {
  const { loanAmount, totalCost } = context.scheme.financials;
  return totalCost > 0 ? (loanAmount / totalCost) * 100 : 0;
}

/**
 * Standard SME lending rules for property development
 */
export const smeRules: Rule[] = [
  // Financial Rules
  {
    id: "FIN-001",
    name: "Maximum LTV Ratio",
    category: "financial",
    description: "Loan-to-Value ratio must not exceed 70%",
    required: true,
    weight: 10,
    evaluate: (context: RuleContext) => {
      const ltv = calculateLTV(context);
      const maxLTV = 70;

      if (ltv <= maxLTV) {
        return {
          ruleId: "FIN-001",
          passed: true,
        };
      }

      return {
        ruleId: "FIN-001",
        passed: false,
        fix: {
          id: `${context.scheme.schemeId}-FIN-001`,
          severity: FixSeverity.CRITICAL,
          description: `LTV ratio exceeds maximum allowed (${maxLTV}%)`,
          field: "financials.loanAmount",
          expected: `LTV ≤ ${maxLTV}%`,
          actual: `${ltv.toFixed(2)}%`,
        },
      };
    },
  },

  {
    id: "FIN-002",
    name: "Maximum LTC Ratio",
    category: "financial",
    description: "Loan-to-Cost ratio must not exceed 75%",
    required: true,
    weight: 10,
    evaluate: (context: RuleContext) => {
      const ltc = calculateLTC(context);
      const maxLTC = 75;

      if (ltc <= maxLTC) {
        return {
          ruleId: "FIN-002",
          passed: true,
        };
      }

      return {
        ruleId: "FIN-002",
        passed: false,
        fix: {
          id: `${context.scheme.schemeId}-FIN-002`,
          severity: FixSeverity.CRITICAL,
          description: `LTC ratio exceeds maximum allowed (${maxLTC}%)`,
          field: "financials.loanAmount",
          expected: `LTC ≤ ${maxLTC}%`,
          actual: `${ltc.toFixed(2)}%`,
        },
      };
    },
  },

  {
    id: "FIN-003",
    name: "Minimum Equity Contribution",
    category: "financial",
    description: "Minimum 25% equity contribution required",
    required: true,
    weight: 9,
    evaluate: (context: RuleContext) => {
      const { equity, totalCost } = context.scheme.financials;
      const equityPercent = totalCost > 0 ? (equity / totalCost) * 100 : 0;
      const minEquity = 25;

      if (equityPercent >= minEquity) {
        return {
          ruleId: "FIN-003",
          passed: true,
        };
      }

      return {
        ruleId: "FIN-003",
        passed: false,
        fix: {
          id: `${context.scheme.schemeId}-FIN-003`,
          severity: FixSeverity.CRITICAL,
          description: `Equity contribution below minimum required (${minEquity}%)`,
          field: "financials.equity",
          expected: `Equity ≥ ${minEquity}%`,
          actual: `${equityPercent.toFixed(2)}%`,
        },
      };
    },
  },

  {
    id: "FIN-004",
    name: "Minimum GDV-to-Cost Ratio",
    category: "financial",
    description: "GDV must be at least 120% of total cost (profit margin)",
    required: true,
    weight: 8,
    evaluate: (context: RuleContext) => {
      const { gdv, totalCost } = context.scheme.financials;
      const gdvRatio = totalCost > 0 ? (gdv / totalCost) * 100 : 0;
      const minRatio = 120;

      if (gdvRatio >= minRatio) {
        return {
          ruleId: "FIN-004",
          passed: true,
        };
      }

      return {
        ruleId: "FIN-004",
        passed: false,
        fix: {
          id: `${context.scheme.schemeId}-FIN-004`,
          severity: FixSeverity.MAJOR,
          description: `GDV-to-Cost ratio below minimum (${minRatio}%)`,
          field: "financials.gdv",
          expected: `GDV/Cost ≥ ${minRatio}%`,
          actual: `${gdvRatio.toFixed(2)}%`,
        },
      };
    },
  },

  // Experience Rules
  {
    id: "EXP-001",
    name: "Minimum Developer Experience",
    category: "experience",
    description: "Developer must have at least 3 years of experience",
    required: true,
    weight: 8,
    evaluate: (context: RuleContext) => {
      const { experienceYears } = context.scheme.developer;
      const minYears = 3;

      if (experienceYears >= minYears) {
        return {
          ruleId: "EXP-001",
          passed: true,
        };
      }

      return {
        ruleId: "EXP-001",
        passed: false,
        fix: {
          id: `${context.scheme.schemeId}-EXP-001`,
          severity: FixSeverity.CRITICAL,
          description: `Developer experience below minimum (${minYears} years)`,
          field: "developer.experienceYears",
          expected: `Experience ≥ ${minYears} years`,
          actual: `${experienceYears} years`,
        },
      };
    },
  },

  {
    id: "EXP-002",
    name: "Completed Projects Track Record",
    category: "experience",
    description: "Developer must have completed at least 2 similar projects",
    required: true,
    weight: 7,
    evaluate: (context: RuleContext) => {
      const { completedProjects } = context.scheme.developer;
      const minProjects = 2;

      if (completedProjects >= minProjects) {
        return {
          ruleId: "EXP-002",
          passed: true,
        };
      }

      return {
        ruleId: "EXP-002",
        passed: false,
        fix: {
          id: `${context.scheme.schemeId}-EXP-002`,
          severity: FixSeverity.CRITICAL,
          description: `Completed projects below minimum (${minProjects})`,
          field: "developer.completedProjects",
          expected: `Completed projects ≥ ${minProjects}`,
          actual: `${completedProjects}`,
        },
      };
    },
  },

  {
    id: "EXP-003",
    name: "No Default History",
    category: "experience",
    description: "Developer must have no default history",
    required: true,
    weight: 10,
    evaluate: (context: RuleContext) => {
      const { defaultHistory } = context.scheme.developer;

      if (!defaultHistory) {
        return {
          ruleId: "EXP-003",
          passed: true,
        };
      }

      return {
        ruleId: "EXP-003",
        passed: false,
        fix: {
          id: `${context.scheme.schemeId}-EXP-003`,
          severity: FixSeverity.CRITICAL,
          description: "Developer has default history",
          field: "developer.defaultHistory",
          expected: "No default history",
          actual: "Default history present",
        },
      };
    },
  },

  // Development Rules
  {
    id: "DEV-001",
    name: "Maximum Construction Period",
    category: "development",
    description: "Construction period must not exceed 24 months",
    required: true,
    weight: 6,
    evaluate: (context: RuleContext) => {
      const { constructionPeriod } = context.scheme.development;
      const maxPeriod = 24;

      if (constructionPeriod <= maxPeriod) {
        return {
          ruleId: "DEV-001",
          passed: true,
        };
      }

      return {
        ruleId: "DEV-001",
        passed: false,
        fix: {
          id: `${context.scheme.schemeId}-DEV-001`,
          severity: FixSeverity.MAJOR,
          description: `Construction period exceeds maximum (${maxPeriod} months)`,
          field: "development.constructionPeriod",
          expected: `Period ≤ ${maxPeriod} months`,
          actual: `${constructionPeriod} months`,
        },
      };
    },
  },

  {
    id: "DEV-002",
    name: "Minimum Project Size",
    category: "development",
    description: "Project must have at least 2 units or 5000 sq ft",
    required: true,
    weight: 5,
    evaluate: (context: RuleContext) => {
      const { units, squareFeet } = context.scheme.development;
      const minUnits = 2;
      const minSqFt = 5000;

      if (units >= minUnits || squareFeet >= minSqFt) {
        return {
          ruleId: "DEV-002",
          passed: true,
        };
      }

      return {
        ruleId: "DEV-002",
        passed: false,
        fix: {
          id: `${context.scheme.schemeId}-DEV-002`,
          severity: FixSeverity.MAJOR,
          description: `Project size below minimum (${minUnits} units or ${minSqFt} sq ft)`,
          field: "development",
          expected: `Units ≥ ${minUnits} OR Square Feet ≥ ${minSqFt}`,
          actual: `${units} units, ${squareFeet} sq ft`,
        },
      };
    },
  },

  // Document Quality Rule (AI-bounded)
  {
    id: "DOC-001",
    name: "Document Quality Score",
    category: "document",
    description: "AI-assessed document quality must be at least 70/100",
    required: false,
    weight: 3,
    evaluate: (context: RuleContext) => {
      const documentQuality = context.scheme.aiScores?.documentQuality;
      const minScore = 70;

      // If AI score not available, pass by default (AI is optional)
      if (documentQuality === undefined) {
        return {
          ruleId: "DOC-001",
          passed: true,
        };
      }

      if (documentQuality >= minScore) {
        return {
          ruleId: "DOC-001",
          passed: true,
        };
      }

      return {
        ruleId: "DOC-001",
        passed: false,
        fix: {
          id: `${context.scheme.schemeId}-DOC-001`,
          severity: FixSeverity.MINOR,
          description: `Document quality score below threshold (${minScore}/100)`,
          field: "aiScores.documentQuality",
          expected: `Score ≥ ${minScore}`,
          actual: `${documentQuality}`,
        },
      };
    },
  },
];
