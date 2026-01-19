/**
 * Core types for the Lendability Engine
 * 
 * This module defines the fundamental types used throughout the system
 * to ensure deterministic and auditable decision-making.
 */

/**
 * Verdict represents the binary outcome of a lendability assessment
 */
export enum Verdict {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

/**
 * Severity of a fix requirement
 */
export enum FixSeverity {
  CRITICAL = "CRITICAL",
  MAJOR = "MAJOR",
  MINOR = "MINOR"
}

/**
 * A specific fix required to make a scheme compliant
 */
export interface Fix {
  /** Unique identifier for the fix */
  id: string;
  /** Rule that triggered this fix */
  ruleId: string;
  /** Severity of this requirement */
  severity: FixSeverity;
  /** Human-readable description */
  description: string;
  /** Specific field or aspect that needs fixing */
  field?: string;
  /** Expected value or criteria */
  expected?: string;
  /** Actual value found */
  actual?: string;
}

/**
 * Assessment result with verdict and required fixes
 */
export interface AssessmentResult {
  /** Binary verdict */
  verdict: Verdict;
  /** List of fixes required (empty if approved) */
  fixes: Fix[];
  /** Timestamp of assessment */
  timestamp: Date;
  /** Summary statistics */
  summary: {
    totalRules: number;
    passedRules: number;
    failedRules: number;
  };
}

/**
 * Input scheme data for assessment
 */
export interface SchemeData {
  /** Unique scheme identifier */
  schemeId: string;
  /** Basic scheme information */
  info: {
    name: string;
    type: "residential" | "commercial" | "mixed";
    location: string;
  };
  /** Financial metrics */
  financials: {
    totalCost: number;
    landCost: number;
    buildCost: number;
    gdv: number; // Gross Development Value
    equity: number;
    loanAmount: number;
  };
  /** Development details */
  development: {
    units: number;
    squareFeet: number;
    constructionPeriod: number; // months
  };
  /** Experience and track record */
  developer: {
    name: string;
    experienceYears: number;
    completedProjects: number;
    defaultHistory: boolean;
  };
  /** Optional AI-generated scores (bounded use) */
  aiScores?: {
    documentQuality?: number; // 0-100
    marketViability?: number; // 0-100
  };
}

/**
 * Rule evaluation context
 */
export interface RuleContext {
  scheme: SchemeData;
  metadata?: Record<string, unknown>;
}

/**
 * Result of a single rule evaluation
 */
export interface RuleResult {
  ruleId: string;
  passed: boolean;
  fix?: Omit<Fix, "ruleId">;
}

/**
 * Rule definition - separated from execution
 */
export interface Rule {
  /** Unique rule identifier */
  id: string;
  /** Rule name */
  name: string;
  /** Category for organization */
  category: "financial" | "experience" | "development" | "document";
  /** Rule description */
  description: string;
  /** Evaluation function - deterministic */
  evaluate: (context: RuleContext) => RuleResult;
  /** Whether this rule is required for approval */
  required: boolean;
  /** Weight for scoring (if needed) */
  weight?: number;
}
