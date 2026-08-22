/**
 * Decidable Access Control List for Carnage Layer
 * Based on: Decidability in Multi-Agent Coordination (Horn clause semantics)
 * 
 * Implements a formal ACL using Horn clauses with bounded complexity evaluation.
 * Ensures that security policies are decidable and verifiable within finite time.
 */

import crypto from 'crypto';

/**
 * Horn clause based ACL system
 * Rules have the form: Head :- Body1, Body2, ..., BodyN
 * Example: allow(User, Resource, Action) :- role(User, admin), action_allowed(admin, Action)
 */
export class DecidableACL {
  constructor(maxEvaluationDepth = 10) {
    this.rules = [];              // Array of { head, body, timestamp }
    this.facts = new Set();       // Ground facts (predicates known to be true)
    this.cache = new Map();       // Query cache for memoization
    this.auditLog = [];           // Audit trail of all decisions
    this.maxEvaluationDepth = maxEvaluationDepth;  // Prevent infinite recursion
    this.evaluationCount = 0;     // Count evaluations for monitoring
  }

  /**
   * Add a Horn clause rule to the system
   * @param {string|Array} head - Head of the rule (e.g., "allow(User, Resource, Action)")
   * @param {Array<string>} body - Body predicates (e.g., ["role(User, admin)", "isAllowed(admin, Action)"])
   */
  addRule(head, body = []) {
    // Normalize head to array
    const headArray = Array.isArray(head) ? head : [head];
    
    this.rules.push({
      id: `rule_${this.rules.length}`,
      head: headArray,
      body: body,
      timestamp: new Date().toISOString(),
      complexity: this.calculateRuleComplexity(headArray, body)
    });
    
    // Invalidate cache when rules change
    this.cache.clear();
  }

  /**
   * Add a ground fact to the knowledge base
   * @param {string} fact - Fact predicate (e.g., "role(alice, admin)")
   */
  addFact(fact) {
    this.facts.add(fact);
    this.cache.clear();
  }

  /**
   * Calculate worst-case complexity of a rule
   * @private
   */
  calculateRuleComplexity(head, body) {
    return 1 + (body.length * 2);  // Simple heuristic
  }

  /**
   * Main query interface: Check if a query is allowed
   * @param {string} user - User identifier
   * @param {string} resource - Resource identifier
   * @param {string} action - Action to perform
   * @returns {Object} { allowed, proof, complexity, timestamp, evaluation_trace }
   */
  query(user, resource, action) {
    const queryKey = `${user}:${resource}:${action}`;
    
    // Check cache first
    if (this.cache.has(queryKey)) {
      const cachedResult = this.cache.get(queryKey);
      cachedResult.from_cache = true;
      return cachedResult;
    }

    // Reset evaluation counter for this query
    this.evaluationCount = 0;
    const startTime = Date.now();

    // Build the query predicate
    const queryPredicate = `allow(${user}, ${resource}, ${action})`;
    
    // Perform SLD resolution (backward chaining)
    const result = this.prove(queryPredicate, 0, []);
    
    const endTime = Date.now();

    const decision = {
      allowed: result.success,
      user,
      resource,
      action,
      proof: result.proof,
      complexity: result.depth,
      evaluation_count: this.evaluationCount,
      evaluation_time_ms: endTime - startTime,
      timestamp: new Date().toISOString(),
      evaluation_trace: result.trace,
      decision_id: Math.random().toString(36).substring(7)
    };

    // Cache the result
    this.cache.set(queryKey, decision);

    return decision;
  }

  /**
   * SLD resolution: Prove a goal using backward chaining
   * @private
   */
  prove(goal, depth, trace) {
    this.evaluationCount++;

    // Check depth bound (decidability guarantee)
    if (depth > this.maxEvaluationDepth) {
      return {
        success: false,
        proof: [],
        depth,
        trace: [
          ...trace,
          { depth, goal, action: 'DEPTH_BOUND_EXCEEDED' }
        ]
      };
    }

    // Check if it's a ground fact
    if (this.facts.has(goal)) {
      return {
        success: true,
        proof: [goal],
        depth,
        trace: [
          ...trace,
          { depth, goal, action: 'FOUND_FACT', fact: goal }
        ]
      };
    }

    // Try to match with rules
    for (const rule of this.rules) {
      const substitution = this.unify(goal, rule.head[0]);
      
      if (substitution !== null) {
        // Prove the body of the rule
        const bodyProof = this.proveConjunction(
          rule.body,
          depth + 1,
          substitution,
          [
            ...trace,
            { depth, goal, action: 'RULE_MATCH', rule_id: rule.id }
          ]
        );

        if (bodyProof.success) {
          return {
            success: true,
            proof: [goal, ...bodyProof.proof],
            depth: bodyProof.depth,
            trace: bodyProof.trace
          };
        }
      }
    }

    // No proof found
    return {
      success: false,
      proof: [],
      depth,
      trace: [
        ...trace,
        { depth, goal, action: 'FAILED' }
      ]
    };
  }

  /**
   * Prove a conjunction of goals (AND logic)
   * @private
   */
  proveConjunction(goals, depth, substitution, trace) {
    if (goals.length === 0) {
      return {
        success: true,
        proof: [],
        depth,
        trace
      };
    }

    const [firstGoal, ...restGoals] = goals;
    const appliedGoal = this.applySubstitution(firstGoal, substitution);

    const firstProof = this.prove(appliedGoal, depth, trace);

    if (!firstProof.success) {
      return {
        success: false,
        proof: [],
        depth,
        trace: firstProof.trace
      };
    }

    const restProof = this.proveConjunction(restGoals, depth, substitution, firstProof.trace);

    return {
      success: restProof.success,
      proof: [...firstProof.proof, ...restProof.proof],
      depth: Math.max(firstProof.depth, restProof.depth),
      trace: restProof.trace
    };
  }

  /**
   * Unification: Match a goal with a rule head
   * @private
   */
  unify(goal, head) {
    // Simple unification: extract variables from head and match with goal
    // For now, return { user: "value", resource: "value", action: "value" }
    const goalMatch = goal.match(/allow\(([^,]+),\s*([^,]+),\s*([^)]+)\)/);
    const headMatch = head.match(/allow\(([^,]+),\s*([^,]+),\s*([^)]+)\)/);

    if (!goalMatch || !headMatch) {
      return null;
    }

    return {
      user: goalMatch[1],
      resource: goalMatch[2],
      action: goalMatch[3]
    };
  }

  /**
   * Apply substitution to a predicate
   * @private
   */
  applySubstitution(predicate, substitution) {
    let result = predicate;
    for (const [key, value] of Object.entries(substitution)) {
      // Simple string replacement (would need more sophisticated handling in production)
      result = result.replace(new RegExp(`\\b${key}\\b`, 'g'), value);
    }
    return result;
  }

  /**
   * Audit a query: Log decision with proof to audit trail
   */
  auditQuery(user, resource, action) {
    const decision = this.query(user, resource, action);

    const auditEntry = {
      timestamp: new Date().toISOString(),
      query: { user, resource, action },
      decision: decision.allowed ? 'ALLOWED' : 'DENIED',
      decision_id: decision.decision_id,
      proof_length: decision.proof.length,
      complexity: decision.complexity,
      evaluation_time_ms: decision.evaluation_time_ms,
      evaluation_count: decision.evaluation_count,
      trace_length: decision.evaluation_trace.length,
      checksum: this.checksumDecision(decision)
    };

    // Add to audit log
    this.auditLog.push(auditEntry);

    return {
      query: { user, resource, action },
      decision,
      audit_entry: auditEntry
    };
  }

  /**
   * Create cryptographic checksum of decision
   * @private
   */
  checksumDecision(decision) {
    const data = JSON.stringify({
      allowed: decision.allowed,
      user: decision.user,
      resource: decision.resource,
      action: decision.action,
      proof: decision.proof
    });
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Get audit log entries
   */
  getAuditLog(filter = {}) {
    let filtered = this.auditLog;

    if (filter.user) {
      filtered = filtered.filter(e => e.query.user === filter.user);
    }
    if (filter.decision) {
      filtered = filtered.filter(e => e.decision === filter.decision);
    }
    if (filter.since) {
      const sinceTime = new Date(filter.since).getTime();
      filtered = filtered.filter(e => new Date(e.timestamp).getTime() >= sinceTime);
    }

    return filtered;
  }

  /**
   * Get statistics about the ACL system
   */
  getStats() {
    return {
      total_rules: this.rules.length,
      total_facts: this.facts.size,
      total_queries_in_log: this.auditLog.length,
      cache_size: this.cache.size,
      allowed_decisions: this.auditLog.filter(e => e.decision === 'ALLOWED').length,
      denied_decisions: this.auditLog.filter(e => e.decision === 'DENIED').length,
      average_evaluation_time_ms: this.getAverageEvaluationTime()
    };
  }

  /**
   * Calculate average evaluation time
   * @private
   */
  getAverageEvaluationTime() {
    if (this.auditLog.length === 0) return 0;
    const total = this.auditLog.reduce((sum, e) => sum + (e.evaluation_time_ms || 0), 0);
    return Math.round(total / this.auditLog.length);
  }

  /**
   * Verify the ACL has no infinite loops (decidability proof)
   */
  verifyDecidability() {
    const issues = [];

    // Check 1: No rule should reference itself without progress
    for (const rule of this.rules) {
      const ruleHeadStr = rule.head[0];
      const hasSelfReference = rule.body.some(b => 
        this.predicateHeadMatches(b, ruleHeadStr)
      );
      if (hasSelfReference) {
        issues.push({
          severity: 'WARNING',
          rule_id: rule.id,
          message: 'Rule has self-reference (potential infinite loop)'
        });
      }
    }

    // Check 2: Max evaluation depth should prevent runaway queries
    if (this.maxEvaluationDepth < 5) {
      issues.push({
        severity: 'WARNING',
        message: `Max evaluation depth ${this.maxEvaluationDepth} may be too low`
      });
    }

    return {
      decidable: issues.length === 0,
      issues
    };
  }

  /**
   * Check if a predicate matches a rule head
   * @private
   */
  predicateHeadMatches(predicate, head) {
    const predName = predicate.split('(')[0];
    const headName = head.split('(')[0];
    return predName === headName;
  }
}

/**
 * Initialize default ACL with common rules
 */
export function initializeDefaultACL() {
  const acl = new DecidableACL(10);  // Max depth = 10

  // Rule 1: Admin has all permissions
  acl.addRule('allow(User, Resource, Action)', [
    'role(User, admin)'
  ]);

  // Rule 2: User can read their own data
  acl.addRule('allow(User, Resource, Action)', [
    'owns(User, Resource)',
    'action_type(Action, read)'
  ]);

  // Rule 3: Collaborators can read shared resources
  acl.addRule('allow(User, Resource, Action)', [
    'shared_with(Resource, User)',
    'action_type(Action, read)'
  ]);

  // Add some default facts
  acl.addFact('role(admin, admin)');
  acl.addFact('action_type(read, read)');
  acl.addFact('action_type(write, write)');

  return acl;
}

export default {
  DecidableACL,
  initializeDefaultACL
};
