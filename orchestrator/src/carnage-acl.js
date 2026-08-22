/**
 * Decidable Access Control List for Carnage Layer
 * Based on: Decidability in Multi-Agent Coordination (Horn clause semantics)
 *
 * Implements a formal ACL using Horn clauses with bounded complexity evaluation.
 * Ensures that security policies are decidable and verifiable within finite time.
 */

import crypto from 'crypto';
import os from 'os';
import path from 'path';
import { readFile, appendFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

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

    // ─── Carnage ACL: Path-based access enforcement ─────────────────
    // Enforce Business-Private cage isolation per AGENTS.md
    this.HIVE_ROOT = process.env.SYMBIOTE_HIVE_ROOT ||
      path.join(process.env.HOME || os.homedir(), '.symbiote-brain');

    this.HERMES_UID = 996;  // Sandboxed agent user

    // Paths that are BLOCKED for hermes user
    this.blockedPaths = [
      { pattern: /Business-Private/, cage: 'Business-Private', mode: '700' },
      { pattern: /\.env$/, cage: '.env file', mode: '600' },
      { pattern: /\.symbiote-brain\/.*\.json$/, cage: 'state file', mode: '600' },
    ];
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
   * Validate path-based access for the hermes system user
   * Enforces Business-Private cage and .env file protection.
   *
   * @param {string} requestedPath - The filesystem path being accessed
   * @param {string} user - The user making the request (default: from process)
   * @returns {Object} { allowed, reason, cage, path, audit_entry }
   */
  validatePathAccess(requestedPath, user = 'hermes') {
    const resolvedPath = path.resolve(requestedPath);
    const hivePath = path.resolve(this.HIVE_ROOT);

    // Check if path is within Hive
    const isInHive = resolvedPath.startsWith(hivePath);

    let blocked = false;
    let cage = null;
    let mode = null;

    // Check against blocked path patterns
    for (const rule of this.blockedPaths) {
      if (rule.pattern.test(resolvedPath)) {
        blocked = true;
        cage = rule.cage;
        mode = rule.mode;
        break;
      }
    }

    // Get current process UID
    const currentUid = process.getuid();

    const decision = {
      allowed: !blocked,
      path: resolvedPath,
      cage,
      expected_mode: mode,
      user,
      uid: currentUid,
      hermes_uid: this.HERMES_UID,
      is_hermes: currentUid === this.HERMES_UID,
      in_hive: isInHive,
      timestamp: new Date().toISOString(),
      decision_id: `acl_${Math.random().toString(36).substring(7)}`
    };

    // Log to audit trail
    const auditEntry = {
      timestamp: decision.timestamp,
      action: 'PATH_ACCESS',
      user: decision.user,
      uid: decision.uid,
      path: decision.path,
      blocked: !decision.allowed,
      cage: decision.cage,
      ...(decision.blocked ? {} : { allowed: true })
    };

    this.auditLog.push(auditEntry);

    // If hermes user is trying to access blocked path, log explicit violation
    if (blocked && currentUid === this.HERMES_UID) {
      this.auditLog.push({
        timestamp: new Date().toISOString(),
        action: 'ACCESS_DENIED',
        user: 'hermes',
        uid: currentUid,
        path: resolvedPath,
        cage: cage,
        blocked: true,
        reason: `hermes (uid ${this.HERMES_UID}) attempted access to ${cage} (mode ${mode})`
      });

      console.error(
        `[Carnage] ⚠️  ACCESS DENIED: hermes (uid ${this.HERMES_UID}) blocked from ${cage}: ${resolvedPath}`
      );
    }

    // Write to .carnage_audit.log
    this._writeAuditLog(auditEntry).catch(err => {
      console.error('[Carnage] Failed to write audit log:', err.message);
    });

    decision.audit_entry = auditEntry;

    return decision;
  }

  /**
   * Express.js middleware for Carnage ACL path validation
   * Use this to protect routes that access filesystem paths
   *
   * @param {string} pathParam - The query param or route param name containing the path to validate
   * @returns {Function} Express middleware
   */
  pathAccessMiddleware(pathParam = 'path') {
    return (req, res, next) => {
      const requestedPath = req.params[pathParam] ||
                           req.query[pathParam] ||
                           req.body[pathParam];

      if (!requestedPath) {
        return next();
      }

      const decision = this.validatePathAccess(requestedPath);

      if (!decision.allowed) {
        return res.status(403).json({
          error: 'ACCESS_DENIED',
          reason: `Access to ${decision.cage} is forbidden`,
          path: decision.path,
          audit_id: decision.decision_id
        });
      }

      req.carnageDecision = decision;
      next();
    };
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
      filtered = filtered.filter(e => e.query?.user === filter.user || e.user === filter.user);
    }
    if (filter.decision) {
      filtered = filtered.filter(e => e.decision === filter.decision);
    }
    if (filter.action) {
      filtered = filtered.filter(e => e.action === filter.action);
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

  /**
   * Write audit entry to .carnage_audit.log file
   * @private
   */
  async _writeAuditLog(entry) {
    const auditPath = path.join(this.HIVE_ROOT, '.carnage_audit.log');
    const dir = path.dirname(auditPath);

    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    await appendFile(auditPath, JSON.stringify(entry) + '\n');
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

/**
 * Initialize Carnage ACL with Symbiote OS-specific policies
 * Enforces Business-Private cage isolation and .env redaction
 */
export function initializeSymbioteACL() {
  const acl = initializeDefaultACL();

  // Carnage-specific rule: hermes system user (uid 996) is blocked from Business-Private
  acl.addRule('allow(User, Resource, Action)', [
    'not_business_private(Resource)',
    'action_type(Action, read)'
  ]);

  acl.addFact('role(hermes, agent)');
  acl.addFact('hermes_uid(996)');
  acl.addFact('not_business_private(Life-OS)');
  acl.addFact('not_business_private(Claude-Brain)');

  return acl;
}

export default {
  DecidableACL,
  initializeDefaultACL,
  initializeSymbioteACL
};
