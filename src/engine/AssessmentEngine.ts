/**
 * Assessment Engine
 * 
 * Core engine that executes rules and generates assessment results.
 * Deterministic and auditable by design.
 */

import {
  Rule,
  SchemeData,
  AssessmentResult,
  Verdict,
  Fix,
  RuleContext,
  RuleResult,
} from "../types/index.js";

/**
 * Lendability Assessment Engine
 * 
 * Executes rules against scheme data and produces binary verdicts
 * with actionable fix lists.
 */
export class AssessmentEngine {
  private rules: Rule[];

  constructor(rules: Rule[]) {
    this.rules = rules;
  }

  /**
   * Assess a scheme against all rules
   * 
   * @param scheme - Scheme data to assess
   * @returns Assessment result with verdict and fixes
   */
  assess(scheme: SchemeData): AssessmentResult {
    const context: RuleContext = { scheme };
    const results: RuleResult[] = [];
    const fixes: Fix[] = [];

    // Execute all rules deterministically
    for (const rule of this.rules) {
      const result = rule.evaluate(context);
      results.push(result);

      // If rule failed and it's required, add to fixes
      if (!result.passed && result.fix) {
        fixes.push({
          ...result.fix,
          ruleId: rule.id,
        });
      }
    }

    // Calculate statistics
    const totalRules = results.length;
    const passedRules = results.filter((r) => r.passed).length;
    const failedRules = totalRules - passedRules;

    // Determine verdict: APPROVED only if all required rules pass
    const criticalFailures = fixes.filter((f) => f.severity === "CRITICAL");
    const verdict =
      criticalFailures.length === 0 ? Verdict.APPROVED : Verdict.REJECTED;

    return {
      verdict,
      fixes: fixes.sort((a, b) => {
        // Sort by severity (CRITICAL > MAJOR > MINOR)
        const severityOrder = { CRITICAL: 0, MAJOR: 1, MINOR: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }),
      timestamp: new Date(),
      summary: {
        totalRules,
        passedRules,
        failedRules,
      },
    };
  }

  /**
   * Get all registered rules
   */
  getRules(): Rule[] {
    return [...this.rules];
  }

  /**
   * Get rules by category
   */
  getRulesByCategory(
    category: Rule["category"]
  ): Rule[] {
    return this.rules.filter((r) => r.category === category);
  }
}
