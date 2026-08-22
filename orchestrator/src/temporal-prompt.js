/**
 * Temporal Logic Integration for Phage LLM Layer
 * Based on: Temporal Logic for AI Agent Goals (academic insights)
 * 
 * Wraps LLM prompts with temporal constraints and deadline specifications
 * to ensure bounded, decidable AI reasoning within established time limits.
 */

/**
 * Build a temporal-logic-aware prompt for LLM agents
 * @param {string} userPrompt - The original user request
 * @param {Object} constraints - Temporal and goal constraints
 * @returns {Object} { prompt, metadata } with deadline and structure
 */
export function buildTemporalPrompt(userPrompt, constraints = {}) {
  const {
    maxDurationSeconds = 30,
    deadline = null,
    goalType = 'design',  // 'design' | 'implement' | 'verify' | 'debug'
    timeoutAction = 'abort',  // 'abort' | 'summarize' | 'escalate'
    priority = 'normal'  // 'low' | 'normal' | 'high'
  } = constraints;

  const deadline_iso = deadline ? new Date(deadline).toISOString() : 
    new Date(Date.now() + maxDurationSeconds * 1000).toISOString();

  const temporalConstraint = `
╔════════════════════════════════════════════════════════════════╗
║              TEMPORAL LOGIC CONSTRAINTS (Phage Layer)          ║
╚════════════════════════════════════════════════════════════════╝

[CURRENT TIME]
${new Date().toISOString()}

[DEADLINE]
${deadline_iso}
Max Duration: ${maxDurationSeconds} seconds
Priority: ${priority}

[GOAL TYPE]
${goalType} — determine approach based on this classification

[TIMEOUT ACTION]
If you cannot complete by deadline:
  - "${timeoutAction}" mode activated
  - MUST output partial progress with JSON structure
  - MUST suggest continuation path
  - MUST NOT exceed token limits

╔════════════════════════════════════════════════════════════════╗
║                        USER REQUEST                            ║
╚════════════════════════════════════════════════════════════════╝

${userPrompt}

╔════════════════════════════════════════════════════════════════╗
║               TEMPORAL REASONING INSTRUCTIONS                  ║
╚════════════════════════════════════════════════════════════════╝

You are operating under TEMPORAL LOGIC constraints:
1. **Bounded Duration**: Complete within ${maxDurationSeconds}s
2. **Goal Type Dispatch**:
   - design: Output architecture/plan (prefer breadth)
   - implement: Output working code (prefer depth)
   - verify: Output test/validation (prefer correctness)
   - debug: Output diagnosis (prefer speed)
3. **Timeout Behavior**: ${timeoutAction}
   - abort: Stop immediately, return partial state
   - summarize: Wrap up current thought, provide summary
   - escalate: Flag for human review, indicate blocker
4. **Output Format**: MUST be valid JSON
   {
     "goal_type": "${goalType}",
     "status": "in_progress|completed|timeout|error",
     "progress_percent": 0-100,
     "result": { ... main content ... },
     "continuation": { "next_steps": [...], "context_for_continuation": {...} }
   }

5. **Preference Order**:
   - Incremental progress > Perfect solution
   - Working partial > Blocked complete
   - Clear errors > Silent failures

CRITICAL: If approaching deadline, immediately output what you have.
Time bounds are HARD constraints in this system.
`;

  return {
    prompt: temporalConstraint,
    metadata: {
      deadline: deadline_iso,
      maxDurationSeconds,
      goalType,
      timeoutAction,
      priority,
      timestamp: new Date().toISOString(),
      requestId: Math.random().toString(36).substring(7)
    }
  };
}

/**
 * Parse temporal-aware LLM response
 * @param {string} response - Raw LLM output
 * @param {Object} metadata - Original prompt metadata
 * @returns {Object} Parsed response with metadata
 */
export function parseTemporalResponse(response, metadata = {}) {
  try {
    const parsed = JSON.parse(response);
    return {
      ...parsed,
      metadata: {
        ...metadata,
        response_received: new Date().toISOString(),
        elapsed_seconds: metadata.timestamp ? 
          Math.round((Date.now() - new Date(metadata.timestamp).getTime()) / 1000) : 
          null
      }
    };
  } catch (e) {
    // Fallback if response is not JSON
    return {
      goal_type: metadata.goalType || 'unknown',
      status: 'parse_error',
      result: response,
      error: e.message,
      metadata: {
        ...metadata,
        response_received: new Date().toISOString()
      }
    };
  }
}

/**
 * Check if response satisfies temporal constraints
 * @param {Object} response - Parsed response
 * @param {Object} metadata - Original metadata
 * @returns {Object} Validation result
 */
export function validateTemporalResponse(response, metadata = {}) {
  const now = new Date();
  const deadline = metadata.deadline ? new Date(metadata.deadline) : null;
  const isOverdue = deadline && now > deadline;

  const validationResult = {
    valid: true,
    issues: [],
    deadline_met: !isOverdue,
    response_time_seconds: metadata.elapsed_seconds || 0
  };

  if (isOverdue) {
    validationResult.issues.push('DEADLINE_EXCEEDED');
  }

  if (!response.status) {
    validationResult.issues.push('MISSING_STATUS_FIELD');
  }

  if (!response.goal_type) {
    validationResult.issues.push('MISSING_GOAL_TYPE');
  }

  if (response.status === 'error' || response.status === 'parse_error') {
    validationResult.issues.push('RESPONSE_ERROR');
  }

  validationResult.valid = validationResult.issues.length === 0;
  
  return validationResult;
}

/**
 * Decide whether to escalate, continue, or accept response
 * @param {Object} response - Parsed response
 * @param {Object} metadata - Original metadata
 * @returns {string} Action: 'accept' | 'continue' | 'escalate' | 'timeout'
 */
export function decideTemporalAction(response, metadata = {}) {
  const validation = validateTemporalResponse(response, metadata);
  
  if (!validation.deadline_met) {
    return 'timeout';  // Hard deadline exceeded
  }

  if (response.status === 'completed') {
    return 'accept';
  }

  if (response.status === 'in_progress') {
    if (response.continuation) {
      return 'continue';
    }
    return 'escalate';  // In progress but can't continue
  }

  if (response.status === 'error') {
    return 'escalate';
  }

  return 'accept';  // Default: accept response as-is
}

export default {
  buildTemporalPrompt,
  parseTemporalResponse,
  validateTemporalResponse,
  decideTemporalAction
};
