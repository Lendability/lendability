/**
 * Tests for Assessment Engine
 * 
 * Basic test suite demonstrating the deterministic nature of the engine.
 */

import { strict as assert } from "node:assert";
import { test } from "node:test";
import { AssessmentEngine } from "../engine/AssessmentEngine.js";
import { smeRules } from "../rules/smeRules.js";
import { SchemeData, Verdict } from "../types/index.js";

// Helper to create a valid scheme
function createValidScheme(): SchemeData {
  return {
    schemeId: "TEST-001",
    info: {
      name: "Test Development",
      type: "residential",
      location: "Test Location",
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
      name: "Test Developer",
      experienceYears: 5,
      completedProjects: 3,
      defaultHistory: false,
    },
  };
}

test("AssessmentEngine: Valid scheme should be approved", () => {
  const engine = new AssessmentEngine(smeRules);
  const scheme = createValidScheme();
  const result = engine.assess(scheme);

  assert.equal(result.verdict, Verdict.APPROVED);
  assert.equal(result.fixes.length, 0);
  assert.equal(result.summary.failedRules, 0);
});

test("AssessmentEngine: Deterministic results", () => {
  const engine = new AssessmentEngine(smeRules);
  const scheme = createValidScheme();

  const result1 = engine.assess(scheme);
  const result2 = engine.assess(scheme);

  assert.equal(result1.verdict, result2.verdict);
  assert.equal(result1.fixes.length, result2.fixes.length);
  assert.equal(result1.summary.passedRules, result2.summary.passedRules);
});

test("AssessmentEngine: High LTV should be rejected", () => {
  const engine = new AssessmentEngine(smeRules);
  const scheme = createValidScheme();
  
  // Set LTV to 80% (above 70% limit)
  scheme.financials.loanAmount = 1120000; // 80% of GDV
  
  const result = engine.assess(scheme);

  assert.equal(result.verdict, Verdict.REJECTED);
  assert.ok(result.fixes.length > 0);
  assert.ok(result.fixes.some(fix => fix.ruleId === "FIN-001"));
});

test("AssessmentEngine: Low equity should be rejected", () => {
  const engine = new AssessmentEngine(smeRules);
  const scheme = createValidScheme();
  
  // Set equity to 20% (below 25% minimum)
  scheme.financials.equity = 200000;
  scheme.financials.loanAmount = 800000;
  
  const result = engine.assess(scheme);

  assert.equal(result.verdict, Verdict.REJECTED);
  assert.ok(result.fixes.some(fix => fix.ruleId === "FIN-003"));
});

test("AssessmentEngine: Inexperienced developer should be rejected", () => {
  const engine = new AssessmentEngine(smeRules);
  const scheme = createValidScheme();
  
  scheme.developer.experienceYears = 1; // Below 3 years minimum
  
  const result = engine.assess(scheme);

  assert.equal(result.verdict, Verdict.REJECTED);
  assert.ok(result.fixes.some(fix => fix.ruleId === "EXP-001"));
});

test("AssessmentEngine: Default history should be rejected", () => {
  const engine = new AssessmentEngine(smeRules);
  const scheme = createValidScheme();
  
  scheme.developer.defaultHistory = true;
  
  const result = engine.assess(scheme);

  assert.equal(result.verdict, Verdict.REJECTED);
  assert.ok(result.fixes.some(fix => fix.ruleId === "EXP-003"));
});

test("AssessmentEngine: Multiple violations should all be reported", () => {
  const engine = new AssessmentEngine(smeRules);
  const scheme = createValidScheme();
  
  // Create multiple violations
  scheme.financials.equity = 100000; // Too low
  scheme.developer.experienceYears = 0; // Too low
  scheme.developer.defaultHistory = true; // Red flag
  
  const result = engine.assess(scheme);

  assert.equal(result.verdict, Verdict.REJECTED);
  assert.ok(result.fixes.length >= 3);
});

test("AssessmentEngine: Fixes should be sorted by severity", () => {
  const engine = new AssessmentEngine(smeRules);
  const scheme = createValidScheme();
  
  // Create violations of different severities
  scheme.financials.equity = 100000; // CRITICAL
  scheme.development.constructionPeriod = 30; // MAJOR
  scheme.aiScores = { documentQuality: 50 }; // MINOR
  
  const result = engine.assess(scheme);

  // First fix should be CRITICAL
  assert.equal(result.fixes[0].severity, "CRITICAL");
  
  // Last fixes should be lower severity
  const lastFix = result.fixes[result.fixes.length - 1];
  assert.ok(lastFix.severity === "MINOR" || lastFix.severity === "MAJOR");
});

test("AssessmentEngine: AI scores are optional", () => {
  const engine = new AssessmentEngine(smeRules);
  const scheme = createValidScheme();
  
  // No AI scores provided
  delete scheme.aiScores;
  
  const result = engine.assess(scheme);

  // Should still work without AI scores
  assert.equal(result.verdict, Verdict.APPROVED);
});

test("AssessmentEngine: Borderline scheme at exact limits should pass", () => {
  const engine = new AssessmentEngine(smeRules);
  const scheme = createValidScheme();
  
  // Set everything to exact minimums/maximums
  scheme.financials.equity = 250000; // Exactly 25%
  scheme.developer.experienceYears = 3; // Exactly 3 years
  scheme.developer.completedProjects = 2; // Exactly 2 projects
  scheme.development.constructionPeriod = 24; // Exactly 24 months
  
  const result = engine.assess(scheme);

  assert.equal(result.verdict, Verdict.APPROVED);
  assert.equal(result.fixes.length, 0);
});

console.log("\nRunning tests...\n");
