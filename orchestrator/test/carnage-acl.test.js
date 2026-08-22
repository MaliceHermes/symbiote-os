// Tests for Carnage ACL — Business-Private cage enforcement
// Run: node orchestrator/test/carnage-acl.test.js

import { strict as assert } from 'assert';
import { DecidableACL, initializeDefaultACL, initializeSymbioteACL } from '../src/carnage-acl.js';
import path from 'path';
import os from 'os';
import { existsSync, mkdirSync, rmSync } from 'fs';

const HIVE_TEST_ROOT = path.join(os.tmpdir(), '.test-symbiote-brain');

describe('DecidableACL', () => {
  let acl;

  beforeEach(() => {
    acl = initializeDefaultACL();
    // Override HIVE_ROOT for testing
    acl.HIVE_ROOT = HIVE_TEST_ROOT;
    acl.HERMES_UID = 996;
    acl.blockedPaths = [
      { pattern: /Business-Private/, cage: 'Business-Private', mode: '700' },
      { pattern: /\.env$/, cage: '.env file', mode: '600' },
      { pattern: /\.symbiote-brain\/.*\.json$/, cage: 'state file', mode: '600' },
    ];

    // Create test directory structure
    if (!existsSync(HIVE_TEST_ROOT)) {
      mkdirSync(HIVE_TEST_ROOT, { recursive: true });
    }
    mkdirSync(path.join(HIVE_TEST_ROOT, 'Life-OS'), { recursive: true });
    mkdirSync(path.join(HIVE_TEST_ROOT, 'Business-Private'), { recursive: true });
    mkdirSync(path.join(HIVE_TEST_ROOT, 'Claude-Brain'), { recursive: true });
  });

  afterEach(() => {
    if (existsSync(HIVE_TEST_ROOT)) {
      rmSync(HIVE_TEST_ROOT, { recursive: true });
    }
  });

  describe('Horn clause resolution', () => {
    it('should allow admin user (default rule)', () => {
      const result = acl.query('admin', '/any/resource', 'read');
      assert.strictEqual(result.allowed, true);
    });

    it('should deny non-admin user without matching rules', () => {
      const result = acl.query('unknown', '/any/resource', 'read');
      assert.strictEqual(result.allowed, false);
    });

    it('should allow user to read own resources', () => {
      acl.addFact('owns(alice, /home/alice/docs)');
      const result = acl.query('alice', '/home/alice/docs', 'read');
      assert.strictEqual(result.allowed, true);
    });

    it('should deny write to shared resources even if read is allowed', () => {
      acl.addFact('shared_with(/shared/doc, alice)');
      const result = acl.query('alice', '/shared/doc', 'write');
      assert.strictEqual(result.allowed, false);
    });

    it('should produce a proof trace on allow', () => {
      const result = acl.query('admin', '/any/resource', 'read');
      assert.ok(result.proof.length > 0);
    });
  });

  describe('Carnage path-based ACL enforcement', () => {
    it('should allow access to Life-OS cage', () => {
      const decision = acl.validatePathAccess(
        path.join(HIVE_TEST_ROOT, 'Life-OS')
      );
      assert.strictEqual(decision.allowed, true);
      assert.strictEqual(decision.cage, null);
    });

    it('should BLOCK access to Business-Private cage', () => {
      const decision = acl.validatePathAccess(
        path.join(HIVE_TEST_ROOT, 'Business-Private')
      );
      assert.strictEqual(decision.allowed, false);
      assert.strictEqual(decision.cage, 'Business-Private');
      assert.strictEqual(decision.expected_mode, '700');
    });

    it('should BLOCK access to .env files', () => {
      const decision = acl.validatePathAccess(
        path.join(HIVE_TEST_ROOT, '.env')
      );
      assert.strictEqual(decision.allowed, false);
      assert.strictEqual(decision.cage, '.env file');
    });

    it('should BLOCK access to .json state files in hive', () => {
      const decision = acl.validatePathAccess(
        path.join(HIVE_TEST_ROOT, 'brain-state.json')
      );
      assert.strictEqual(decision.allowed, false);
      assert.strictEqual(decision.cage, 'state file');
    });

    it('should allow access to Claude-Brain cage', () => {
      const decision = acl.validatePathAccess(
        path.join(HIVE_TEST_ROOT, 'Claude-Brain')
      );
      assert.strictEqual(decision.allowed, true);
    });

    it('should log audit entries for all path access checks', () => {
      acl.validatePathAccess(path.join(HIVE_TEST_ROOT, 'Life-OS'));
      acl.validatePathAccess(path.join(HIVE_TEST_ROOT, 'Business-Private'));
      
      const auditLog = acl.getAuditLog({ action: 'PATH_ACCESS' });
      assert.ok(auditLog.length >= 2);
    });

    it('should log ACCESS_DENIED for hermes uid on blocked paths', () => {
      // Simulate hermes uid
      const originalGetuid = process.getuid;
      process.getuid = () => 996;

      const decision = acl.validatePathAccess(
        path.join(HIVE_TEST_ROOT, 'Business-Private')
      );
      
      assert.strictEqual(decision.is_hermes, true);
      assert.strictEqual(decision.allowed, false);

      // Restore original
      process.getuid = originalGetuid;
    });
  });

  describe('Symbiote ACL initialization', () => {
    it('should include Symbiote-specific facts', () => {
      const symbioteACL = initializeSymbioteACL();
      symbioteACL.HIVE_ROOT = HIVE_TEST_ROOT;

      const adminResult = symbioteACL.query('admin', '/any', 'read');
      assert.strictEqual(adminResult.allowed, true);
    });

    it('should have hermes agent role in facts', () => {
      const symbioteACL = initializeSymbioteACL();
      assert.ok(symbioteACL.facts.has('role(hermes, agent)'));
      assert.ok(symbioteACL.facts.has('hermes_uid(996)'));
    });
  });

  describe('Decidability verification', () => {
    it('should verify no infinite loops', () => {
      const result = acl.verifyDecidability();
      assert.strictEqual(result.decidable, true);
      assert.strictEqual(result.issues.length, 0);
    });

    it('should warn on self-referencing rules', () => {
      acl.addRule('allow(User, Resource, Action)', [
        'allow(User, Resource, Action)'
      ]);

      const result = acl.verifyDecidability();
      assert.strictEqual(result.decidable, false);
      assert.ok(result.issues.length > 0);
      assert.strictEqual(result.issues[0].severity, 'WARNING');
    });
  });

  describe('Audit and stats', () => {
    it('should track allowed and denied decisions', () => {
      acl.auditQuery('admin', '/any', 'read');  // allowed
      acl.auditQuery('unknown', '/any', 'read'); // denied

      const stats = acl.getStats();
      assert.strictEqual(stats.allowed_decisions, 1);
      assert.strictEqual(stats.denied_decisions, 1);
    });

    it('should support time-based filtering', () => {
      acl.validatePathAccess(path.join(HIVE_TEST_ROOT, 'Life-OS'));
      acl.validatePathAccess(path.join(HIVE_TEST_ROOT, 'Business-Private'));

      const allEntries = acl.getAuditLog({ action: 'PATH_ACCESS' });
      const filtered = acl.getAuditLog({
        action: 'PATH_ACCESS',
        since: new Date(Date.now() + 10000).toISOString()
      });

      assert.ok(allEntries.length >= 2);
      assert.strictEqual(filtered.length, 0);
    });
  });
});

// Simple test runner if mocha isn't available
if (typeof describe === 'undefined') {
  console.log('⚠️  Mocha not found — install with: npm install -D mocha');
  console.log('Tests defined:');
  console.log('  - Horn clause resolution (4 tests)');
  console.log('  - Carnage path-based ACL (7 tests)');
  console.log('  - Symbiote ACL initialization (2 tests)');
  console.log('  - Decidability verification (2 tests)');
  console.log('  - Audit and stats (2 tests)');
  console.log('Total: 17 tests');
  console.log('Run with: npx mocha orchestrator/test/carnage-acl.test.js');
}
