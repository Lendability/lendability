/**
 * Example: Basic Assessment
 * 
 * Demonstrates how to use the lendability engine for a typical SME assessment.
 */

import { AssessmentEngine } from "../engine/AssessmentEngine.js";
import { smeRules } from "../rules/smeRules.js";
import { SchemeData, Verdict } from "../types/index.js";

// Create the assessment engine with standard SME rules
const engine = new AssessmentEngine(smeRules);

// Example 1: Approved scheme
const approvedScheme: SchemeData = {
  schemeId: "SCH-001",
  info: {
    name: "Riverside Residential Development",
    type: "residential",
    location: "Manchester, UK",
  },
  financials: {
    totalCost: 1000000, // £1M total cost
    landCost: 300000, // £300K land
    buildCost: 700000, // £700K build
    gdv: 1400000, // £1.4M GDV (140% of cost - good margin)
    equity: 300000, // £300K equity (30%)
    loanAmount: 700000, // £700K loan (70% LTC, 50% LTV)
  },
  development: {
    units: 4,
    squareFeet: 8000,
    constructionPeriod: 18, // 18 months
  },
  developer: {
    name: "Riverside Developments Ltd",
    experienceYears: 5,
    completedProjects: 3,
    defaultHistory: false,
  },
};

console.log("=== Example 1: Approved Scheme ===\n");
const result1 = engine.assess(approvedScheme);
console.log("Verdict:", result1.verdict);
console.log("Summary:", result1.summary);
console.log("Fixes required:", result1.fixes.length);
console.log("\n");

// Example 2: Rejected scheme with multiple issues
const rejectedScheme: SchemeData = {
  schemeId: "SCH-002",
  info: {
    name: "Sunset Commercial Development",
    type: "commercial",
    location: "London, UK",
  },
  financials: {
    totalCost: 2000000, // £2M total cost
    landCost: 600000,
    buildCost: 1400000,
    gdv: 2200000, // £2.2M GDV (110% of cost - low margin)
    equity: 200000, // £200K equity (10% - too low!)
    loanAmount: 1800000, // £1.8M loan (90% LTC - too high!, 82% LTV - too high!)
  },
  development: {
    units: 1, // Only 1 unit
    squareFeet: 4000, // Below minimum
    constructionPeriod: 30, // 30 months - too long!
  },
  developer: {
    name: "Inexperienced Builder Ltd",
    experienceYears: 1, // Not enough experience
    completedProjects: 0, // No track record
    defaultHistory: true, // Red flag!
  },
  aiScores: {
    documentQuality: 45, // Poor document quality
  },
};

console.log("=== Example 2: Rejected Scheme ===\n");
const result2 = engine.assess(rejectedScheme);
console.log("Verdict:", result2.verdict);
console.log("Summary:", result2.summary);
console.log("Fixes required:", result2.fixes.length);
console.log("\nRequired fixes:");
result2.fixes.forEach((fix, index) => {
  console.log(`\n${index + 1}. [${fix.severity}] ${fix.description}`);
  console.log(`   Rule: ${fix.ruleId}`);
  console.log(`   Expected: ${fix.expected}`);
  console.log(`   Actual: ${fix.actual}`);
});
console.log("\n");

// Example 3: Borderline scheme
const borderlineScheme: SchemeData = {
  schemeId: "SCH-003",
  info: {
    name: "Urban Mixed-Use Development",
    type: "mixed",
    location: "Birmingham, UK",
  },
  financials: {
    totalCost: 1500000,
    landCost: 450000,
    buildCost: 1050000,
    gdv: 1900000, // 127% - acceptable margin
    equity: 375000, // 25% - exactly at minimum
    loanAmount: 1125000, // 75% LTC, 59% LTV - at limits
  },
  development: {
    units: 2, // Minimum
    squareFeet: 6000,
    constructionPeriod: 24, // Maximum allowed
  },
  developer: {
    name: "Established Builders Co",
    experienceYears: 3, // Minimum required
    completedProjects: 2, // Minimum required
    defaultHistory: false,
  },
};

console.log("=== Example 3: Borderline Scheme (at limits) ===\n");
const result3 = engine.assess(borderlineScheme);
console.log("Verdict:", result3.verdict);
console.log("Summary:", result3.summary);
console.log("Fixes required:", result3.fixes.length);

if (result3.verdict === Verdict.APPROVED) {
  console.log("\n✓ Scheme approved (all critical criteria met)");
} else {
  console.log("\n✗ Scheme rejected - fixes required:");
  result3.fixes.forEach((fix) => {
    console.log(`  - ${fix.description}`);
  });
}
