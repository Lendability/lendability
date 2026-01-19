/**
 * Example: Custom Rules
 * 
 * Demonstrates how to create and use custom rules beyond the standard SME rules.
 */

import { AssessmentEngine } from "../engine/AssessmentEngine.js";
import { smeRules } from "../rules/smeRules.js";
import { Rule, SchemeData, FixSeverity } from "../types/index.js";

// Define custom rules for specific lender requirements
const customRules: Rule[] = [
  {
    id: "CUSTOM-001",
    name: "London Location Premium",
    category: "financial",
    description: "Schemes in London require 30% equity instead of 25%",
    required: true,
    weight: 9,
    evaluate: (context) => {
      const { location } = context.scheme.info;
      const { equity, totalCost } = context.scheme.financials;
      const equityPercent = totalCost > 0 ? (equity / totalCost) * 100 : 0;

      // Only applies to London
      if (!location.toLowerCase().includes("london")) {
        return { ruleId: "CUSTOM-001", passed: true };
      }

      const minEquity = 30;
      if (equityPercent >= minEquity) {
        return { ruleId: "CUSTOM-001", passed: true };
      }

      return {
        ruleId: "CUSTOM-001",
        passed: false,
        fix: {
          id: `${context.scheme.schemeId}-CUSTOM-001`,
          severity: FixSeverity.CRITICAL,
          description: `London schemes require ${minEquity}% equity minimum`,
          field: "financials.equity",
          expected: `Equity ≥ ${minEquity}% for London`,
          actual: `${equityPercent.toFixed(2)}%`,
        },
      };
    },
  },
  {
    id: "CUSTOM-002",
    name: "Maximum Single Unit Cost",
    category: "development",
    description: "Cost per unit must not exceed £500,000",
    required: true,
    weight: 6,
    evaluate: (context) => {
      const { units } = context.scheme.development;
      const { totalCost } = context.scheme.financials;
      const costPerUnit = units > 0 ? totalCost / units : totalCost;
      const maxCostPerUnit = 500000;

      if (costPerUnit <= maxCostPerUnit) {
        return { ruleId: "CUSTOM-002", passed: true };
      }

      return {
        ruleId: "CUSTOM-002",
        passed: false,
        fix: {
          id: `${context.scheme.schemeId}-CUSTOM-002`,
          severity: FixSeverity.MAJOR,
          description: `Cost per unit exceeds maximum (£${maxCostPerUnit.toLocaleString()})`,
          field: "development.units",
          expected: `Cost per unit ≤ £${maxCostPerUnit.toLocaleString()}`,
          actual: `£${costPerUnit.toLocaleString()}`,
        },
      };
    },
  },
];

// Combine standard and custom rules
const allRules = [...smeRules, ...customRules];
const engine = new AssessmentEngine(allRules);

// Test scheme in London
const londonScheme: SchemeData = {
  schemeId: "SCH-LONDON-001",
  info: {
    name: "Chelsea Luxury Apartments",
    type: "residential",
    location: "Chelsea, London, UK",
  },
  financials: {
    totalCost: 1500000, // £1.5M - 3 units = £500k per unit (at limit)
    landCost: 600000,
    buildCost: 900000,
    gdv: 2100000, // 140% margin
    equity: 450000, // 30% equity (London requirement)
    loanAmount: 1050000, // 70% LTC, 50% LTV
  },
  development: {
    units: 3,
    squareFeet: 6000,
    constructionPeriod: 20,
  },
  developer: {
    name: "Premium Developments PLC",
    experienceYears: 10,
    completedProjects: 15,
    defaultHistory: false,
  },
};

console.log("=== Custom Rules Example: London Scheme ===\n");
const result1 = engine.assess(londonScheme);
console.log("Verdict:", result1.verdict);
console.log("Total rules evaluated:", result1.summary.totalRules);
console.log("Passed rules:", result1.summary.passedRules);

if (result1.verdict === "APPROVED") {
  console.log("\n✓ London scheme approved (meets 30% equity requirement)");
} else {
  console.log("\nFixes required:");
  result1.fixes.forEach((fix) => {
    console.log(`- [${fix.severity}] ${fix.description}`);
  });
}

// Test scheme in London with insufficient equity
const londonSchemeFailure: SchemeData = {
  ...londonScheme,
  schemeId: "SCH-LONDON-002",
  financials: {
    totalCost: 1500000,
    landCost: 600000,
    buildCost: 900000,
    gdv: 2100000,
    equity: 375000, // 25% equity - passes standard but fails London requirement
    loanAmount: 1125000, // Still within LTV/LTC limits
  },
};

console.log("\n=== London Scheme with Standard 25% Equity ===\n");
const result2 = engine.assess(londonSchemeFailure);
console.log("Verdict:", result2.verdict);
console.log("Fixes required:", result2.fixes.length);

if (result2.verdict === "REJECTED") {
  console.log("\nFixes:");
  result2.fixes.forEach((fix) => {
    console.log(`- [${fix.severity}] ${fix.description}`);
  });
}

// Test scheme with expensive units
const expensiveUnitsScheme: SchemeData = {
  schemeId: "SCH-EXPENSIVE-001",
  info: {
    name: "Luxury Single Villa",
    type: "residential",
    location: "Surrey, UK",
  },
  financials: {
    totalCost: 1500000, // £1.5M for 1 unit - too expensive per unit
    landCost: 500000,
    buildCost: 1000000,
    gdv: 2000000,
    equity: 450000, // 30%
    loanAmount: 1050000,
  },
  development: {
    units: 2,
    squareFeet: 8000,
    constructionPeriod: 18,
  },
  developer: {
    name: "Luxury Builders Ltd",
    experienceYears: 5,
    completedProjects: 4,
    defaultHistory: false,
  },
};

console.log("\n=== Scheme with High Cost Per Unit ===\n");
const result3 = engine.assess(expensiveUnitsScheme);
console.log("Verdict:", result3.verdict);
console.log("Cost per unit: £" + (expensiveUnitsScheme.financials.totalCost / expensiveUnitsScheme.development.units).toLocaleString());

if (result3.verdict === "REJECTED") {
  console.log("\nFixes:");
  result3.fixes.forEach((fix) => {
    console.log(`- [${fix.severity}] ${fix.description}`);
  });
}
