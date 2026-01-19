/**
 * Standard SME Lending Rules
 * 
 * Deterministic rules based on mainstream SME lender criteria.
 * Rules are separated from execution for auditability.
 */

import { Rule, RuleContext, FixSeverity } from "../types/index.js";

// Rule threshold constants
const MAX_LTV_PERCENT = 70;
const MAX_LTC_PERCENT = 75;
const MIN_EQUITY_PERCENT = 25;
const MIN_GDV_TO_COST_PERCENT = 120;
const MIN_DEVELOPER_EXPERIENCE_YEARS = 3;
const MIN_COMPLETED_PROJECTS = 2;
const MAX_CONSTRUCTION_PERIOD_MONTHS = 24;
const MIN_UNITS = 2;
const MIN_SQUARE_FEET = 5000;
const MIN_DOCUMENT_QUALITY_SCORE = 70;

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
    description: `Loan-to-Value ratio must not exceed ${MAX_LTV_PERCENT}%`,
    required: true,
    weight: 10,
    evaluate: (context: RuleContext) => {
      const ltv = calculateLTV(context);

      if (ltv <= MAX_LTV_PERCENT) {
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
          description: `LTV ratio exceeds maximum allowed (${MAX_LTV_PERCENT}%)`,
          field: "financials.loanAmount",
          expected: `LTV ≤ ${MAX_LTV_PERCENT}%`,
          actual: `${ltv.toFixed(2)}%`,
        },
      };
    },
  },

  {
    id: "FIN-002",
    name: "Maximum LTC Ratio",
    category: "financial",
    description: `Loan-to-Cost ratio must not exceed ${MAX_LTC_PERCENT}%`,
    required: true,
    weight: 10,
    evaluate: (context: RuleContext) => {
      const ltc = calculateLTC(context);

      if (ltc <= MAX_LTC_PERCENT) {
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
          description: `LTC ratio exceeds maximum allowed (${MAX_LTC_PERCENT}%)`,
          field: "financials.loanAmount",
          expected: `LTC ≤ ${MAX_LTC_PERCENT}%`,
          actual: `${ltc.toFixed(2)}%`,
        },
      };
    },
  },

  {
    id: "FIN-003",
    name: "Minimum Equity Contribution",
    category: "financial",
    description: `Minimum ${MIN_EQUITY_PERCENT}% equity contribution required`,
    required: true,
    weight: 9,
    evaluate: (context: RuleContext) => {
      const { equity, totalCost } = context.scheme.financials;
      const equityPercent = totalCost > 0 ? (equity / totalCost) * 100 : 0;

      if (equityPercent >= MIN_EQUITY_PERCENT) {
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
          description: `Equity contribution below minimum required (${MIN_EQUITY_PERCENT}%)`,
          field: "financials.equity",
          expected: `Equity ≥ ${MIN_EQUITY_PERCENT}%`,
          actual: `${equityPercent.toFixed(2)}%`,
        },
      };
    },
  },

  {
    id: "FIN-004",
    name: "Minimum GDV-to-Cost Ratio",
    category: "financial",
    description: `GDV must be at least ${MIN_GDV_TO_COST_PERCENT}% of total cost (profit margin)`,
    required: true,
    weight: 8,
    evaluate: (context: RuleContext) => {
      const { gdv, totalCost } = context.scheme.financials;
      const gdvRatio = totalCost > 0 ? (gdv / totalCost) * 100 : 0;

      if (gdvRatio >= MIN_GDV_TO_COST_PERCENT) {
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
          description: `GDV-to-Cost ratio below minimum (${MIN_GDV_TO_COST_PERCENT}%)`,
          field: "financials.gdv",
          expected: `GDV/Cost ≥ ${MIN_GDV_TO_COST_PERCENT}%`,
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
    description: `Developer must have at least ${MIN_DEVELOPER_EXPERIENCE_YEARS} years of experience`,
    required: true,
    weight: 8,
    evaluate: (context: RuleContext) => {
      const { experienceYears } = context.scheme.developer;

      if (experienceYears >= MIN_DEVELOPER_EXPERIENCE_YEARS) {
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
          description: `Developer experience below minimum (${MIN_DEVELOPER_EXPERIENCE_YEARS} years)`,
          field: "developer.experienceYears",
          expected: `Experience ≥ ${MIN_DEVELOPER_EXPERIENCE_YEARS} years`,
          actual: `${experienceYears} years`,
        },
      };
    },
  },

  {
    id: "EXP-002",
    name: "Completed Projects Track Record",
    category: "experience",
    description: `Developer must have completed at least ${MIN_COMPLETED_PROJECTS} similar projects`,
    required: true,
    weight: 7,
    evaluate: (context: RuleContext) => {
      const { completedProjects } = context.scheme.developer;

      if (completedProjects >= MIN_COMPLETED_PROJECTS) {
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
          description: `Completed projects below minimum (${MIN_COMPLETED_PROJECTS})`,
          field: "developer.completedProjects",
          expected: `Completed projects ≥ ${MIN_COMPLETED_PROJECTS}`,
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
    description: `Construction period must not exceed ${MAX_CONSTRUCTION_PERIOD_MONTHS} months`,
    required: true,
    weight: 6,
    evaluate: (context: RuleContext) => {
      const { constructionPeriod } = context.scheme.development;

      if (constructionPeriod <= MAX_CONSTRUCTION_PERIOD_MONTHS) {
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
          description: `Construction period exceeds maximum (${MAX_CONSTRUCTION_PERIOD_MONTHS} months)`,
          field: "development.constructionPeriod",
          expected: `Period ≤ ${MAX_CONSTRUCTION_PERIOD_MONTHS} months`,
          actual: `${constructionPeriod} months`,
        },
      };
    },
  },

  {
    id: "DEV-002",
    name: "Minimum Project Size",
    category: "development",
    description: `Project must have at least ${MIN_UNITS} units or ${MIN_SQUARE_FEET} sq ft`,
    required: true,
    weight: 5,
    evaluate: (context: RuleContext) => {
      const { units, squareFeet } = context.scheme.development;

      if (units >= MIN_UNITS || squareFeet >= MIN_SQUARE_FEET) {
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
          description: `Project size below minimum (${MIN_UNITS} units or ${MIN_SQUARE_FEET} sq ft)`,
          field: "development",
          expected: `Units ≥ ${MIN_UNITS} OR Square Feet ≥ ${MIN_SQUARE_FEET}`,
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
    description: `AI-assessed document quality must be at least ${MIN_DOCUMENT_QUALITY_SCORE}/100`,
    required: false,
    weight: 3,
    evaluate: (context: RuleContext) => {
      const documentQuality = context.scheme.aiScores?.documentQuality;

      // If AI score not available, pass by default (AI is optional)
      if (documentQuality === undefined) {
        return {
          ruleId: "DOC-001",
          passed: true,
        };
      }

      if (documentQuality >= MIN_DOCUMENT_QUALITY_SCORE) {
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
          description: `Document quality score below threshold (${MIN_DOCUMENT_QUALITY_SCORE}/100)`,
          field: "aiScores.documentQuality",
          expected: `Score ≥ ${MIN_DOCUMENT_QUALITY_SCORE}`,
          actual: `${documentQuality}`,
        },
      };
    },
  },
];
