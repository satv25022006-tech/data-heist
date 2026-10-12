import assert from 'assert';
import path from 'path';
import fs from 'fs';
import { DatabaseManager } from '../server/db.ts';
import { ensureUploadsAndPosters } from '../server/generatePosters.ts';

async function runTestSuite() {
  console.log('--- STARTING DETECTIVE GAME AUTOMATED TEST SUITE ---');
  const rootDir = process.cwd();

  // 1. Initialize Poster Assets & Database
  ensureUploadsAndPosters(rootDir);
  const db = new DatabaseManager(rootDir);
  console.log('✓ Database manager and poster directories initialized.');

  // 2. Admin Authentication & Role Authorization
  console.log('\n[TEST 1] Admin Authentication & Role Permissions');
  const superAdmin = db.findAdminByCredentials('director_vance', 'admin123');
  assert(superAdmin, 'Super Admin credentials must succeed');
  assert.strictEqual(superAdmin.role, 'super_admin');
  assert.strictEqual((superAdmin as any).passwordHash, undefined, 'Password hash must never leak in profile');

  const contentAdmin = db.findAdminByCredentials('inspector_chen', 'content123');
  assert(contentAdmin, 'Content Admin credentials must succeed');
  assert.strictEqual(contentAdmin.role, 'content_admin');

  const invalidAdmin = db.findAdminByCredentials('director_vance', 'wrongpassword');
  assert.strictEqual(invalidAdmin, null, 'Invalid password must return null');

  // Test Session Token Lifecycle
  const token = db.createSession(superAdmin.id, superAdmin.role);
  const session = db.validateSession(token);
  assert(session, 'Session token must be valid');
  assert.strictEqual(session.userId, superAdmin.id);

  db.destroySession(token);
  const expiredSession = db.validateSession(token);
  assert.strictEqual(expiredSession, null, 'Destroyed token must be invalid');
  console.log('✓ Admin authentication and sessions verified.');

  // 3. Level Creation, Editing, Duplicate & Unlock Rules
  console.log('\n[TEST 2] Level Creation, Editing, Duplication & Unlock Rules');
  const newLevel = db.createLevel({
    name: 'The Quantum Harbor Smuggling Ring',
    slug: 'quantum-harbor-smuggling',
    difficulty: 'medium',
    timeLimitSeconds: 75,
    passingScore: 200,
    minStarsRequiredToPass: 2,
    status: 'draft',
    unlockRequirements: {
      minStarsFromEasy: 2,
      minTotalStars: 2,
      customConditionDescription: 'Requires at least 2 Stars from Easy stage'
    }
  }, { id: superAdmin.id, name: superAdmin.displayName, role: superAdmin.role });

  assert(newLevel.id, 'New level must have unique ID');
  assert.strictEqual(newLevel.status, 'draft');

  // Edit level
  const updatedLevel = db.updateLevel(newLevel.id, {
    timeLimitSeconds: 80,
    passingScore: 210
  }, { id: superAdmin.id, name: superAdmin.displayName, role: superAdmin.role });
  assert.strictEqual(updatedLevel?.timeLimitSeconds, 80);
  assert.strictEqual(updatedLevel?.passingScore, 210);

  // Duplicate level
  const duplicatedLevel = db.duplicateLevel(newLevel.id, { id: superAdmin.id, name: superAdmin.displayName, role: superAdmin.role });
  assert(duplicatedLevel, 'Duplicated level must exist');
  assert(duplicatedLevel.name.includes('(Copy)'));

  // Test Unlock Calculation
  // A fresh player with 0 stars should see this level locked
  const testPlayer = db.registerPlayer(`agent_rookie_${Date.now()}`, `rookie_${Date.now()}@detective.org`, 'Agent Rookie');
  let unlocks = db.calculateUnlockedLevels(testPlayer.id);
  assert.strictEqual(unlocks['level-01-heist']?.isUnlocked, true, 'Easy Level 1 must be unlocked by default');
  assert.strictEqual(unlocks['level-02-manor']?.isUnlocked, false, 'Medium Level 2 must be locked when stars < 2');
  console.log('✓ Level management and unlock rules verified.');

  // 4. Question Validation, Answers Privacy & Poster Association
  console.log('\n[TEST 3] Question Validation, Secret Protection & Evidence Posters');
  const newQuestion = db.createQuestion({
    levelId: newLevel.id,
    title: 'Exhibit Z: Harbor Ingress Container Seal',
    text: 'Inspect the shipping container serial hash. Which seal was tampered with?',
    imagePosterUrl: '/uploads/question-posters/poster-thermal-dock.svg',
    imageCaption: 'Container Yard Thermal Sweep',
    imageStoragePath: 'question-posters/poster-thermal-dock.svg',
    answerType: 'multiple_choice',
    options: [
      { id: 'opt_1', optionKey: 'A', text: 'Seal #441 (Intact)', isCorrect: false },
      { id: 'opt_2', optionKey: 'B', text: 'Seal #882 (Electrically Cut)', isCorrect: true },
      { id: 'opt_3', optionKey: 'C', text: 'Seal #903 (Intact)', isCorrect: false }
    ],
    correctAnswerSecret: 'B',
    explanation: 'Seal #882 has melted micro-soldering wire.',
    hint: 'Look for thermal radiation around seal 882.',
    difficulty: 'medium',
    category: 'Physical Forensics',
    points: 120,
    incorrectPenalty: 30,
    status: 'draft'
  }, { id: superAdmin.id, name: superAdmin.displayName, role: superAdmin.role });

  assert(newQuestion.id, 'Question must have unique ID');

  // Verify answer secret is NOT leaked to untrusted players!
  const playerQuestions = db.getQuestions({ levelId: newLevel.id }, false);
  const retrievedPlayerQ = playerQuestions.find(q => q.id === newQuestion.id);
  assert(retrievedPlayerQ, 'Player question must be returned');
  assert.strictEqual(retrievedPlayerQ.correctAnswerSecret, '', 'CRITICAL: Answer secret MUST be empty for players');
  assert.strictEqual((retrievedPlayerQ.options[0] as any).isCorrect, undefined, 'CRITICAL: isCorrect MUST be hidden from players');

  // Verify answer secret IS returned for administrators
  const adminQuestions = db.getQuestions({ levelId: newLevel.id }, true);
  const retrievedAdminQ = adminQuestions.find(q => q.id === newQuestion.id);
  assert.strictEqual(retrievedAdminQ?.correctAnswerSecret, 'B', 'Admin must be able to view answer key');
  console.log('✓ Question validation and secret privacy verified.');

  // 5. Complete Investigation Workflow & Authoritative Scoring
  console.log('\n[TEST 4] End-to-End Investigation Attempt & Authoritative Scoring');
  // Start attempt on Level 1
  const attemptResult = db.startAttempt(testPlayer.id, 'level-01-heist');
  assert(attemptResult, 'Attempt must start successfully');
  const attemptId = attemptResult.attempt.id;

  // Q1: Exhibit A (Correct answer is 'C')
  const q1Result = db.submitAnswer(attemptId, 'q-heist-01', 'C', 15, false);
  assert.strictEqual(q1Result.isCorrect, true, 'Submitting C for q-heist-01 must be correct');
  assert(q1Result.pointsAwarded >= 100, 'Must award base points and speed bonus');
  assert(q1Result.timeSaved > 0, 'Time saved must be positive');

  // Test Duplicate Submission Prevention
  assert.throws(() => {
    db.submitAnswer(attemptId, 'q-heist-01', 'C', 10, false);
  }, /Question answer already submitted/, 'Duplicate submission must be blocked');

  // Q2: Exhibit B (Incorrect answer 'A')
  const q2Result = db.submitAnswer(attemptId, 'q-heist-02', 'A', 20, false);
  assert.strictEqual(q2Result.isCorrect, false, 'Submitting A for q-heist-02 must be incorrect');
  assert(q2Result.penaltyDeducted > 0, 'Penalty must be deducted for wrong deduction');

  // Q3: Exhibit C (Text input, correct is 'DATA_HEIST', with hint used)
  const q3Result = db.submitAnswer(attemptId, 'q-heist-03', 'DATA_HEIST', 25, true);
  assert.strictEqual(q3Result.isCorrect, true, 'Submitting DATA_HEIST must be correct');
  assert(q3Result.penaltyDeducted > 0, 'Hint penalty must be deducted');

  // Finalize attempt
  const finishedAttempt = db.finishAttempt(attemptId);
  assert.strictEqual(finishedAttempt.status, 'completed');
  assert(finishedAttempt.totalScore > 0, 'Total score must be calculated');
  assert(finishedAttempt.accuracyPercentage > 50, 'Accuracy must reflect 2/3 correct');
  assert.strictEqual(finishedAttempt.hintsUsedCount, 1, 'Hints count must be 1');
  console.log(`✓ Attempt finalized: Score = ${finishedAttempt.totalScore}, Stars = ${finishedAttempt.starsEarned}, Accuracy = ${finishedAttempt.accuracyPercentage}%`);

  // 6. Player Progression & Unlock Propagation
  console.log('\n[TEST 5] Player Progression & Unlock Propagation');
  const updatedProgress = db.getPlayerProgress(testPlayer.id);
  assert(updatedProgress.length > 0, 'Player progress must be persisted');
  const level1Progress = updatedProgress.find(p => p.levelId === 'level-01-heist');
  assert(level1Progress, 'Level 1 progress record must exist');
  assert.strictEqual(level1Progress.isCompleted, finishedAttempt.isPassed);

  // 7. Leaderboard Ranking & Tie-breaking
  console.log('\n[TEST 6] Leaderboard Generation & Ranking');
  const leaderboard = db.getLeaderboard();
  assert(leaderboard.length >= 3, 'Leaderboard must include players');
  assert.strictEqual(leaderboard[0].rank, 1, 'Top rank must be 1');
  assert(leaderboard[0].totalStars >= leaderboard[1].totalStars, 'Ranked by stars descending');
  console.log('✓ Leaderboard ranking verified.');

  // 8. Immutable Audit Logging Verification
  console.log('\n[TEST 7] Administrative Audit Log Verification');
  const auditLogs = db.getAuditLogs(10);
  assert(auditLogs.length > 0, 'Audit logs must be recorded');
  const recentAction = auditLogs[0];
  assert(recentAction.actorName, 'Audit log must have actor name');
  assert(recentAction.action, 'Audit log must have action identifier');
  assert(recentAction.createdAt, 'Audit log must have timestamp');
  console.log(`✓ Most recent audit entry: [${recentAction.action}] by ${recentAction.actorName}`);

  console.log('\n======================================================');
  console.log('ALL 7 AUTOMATED INTEGRATION TESTS PASSED SUCCESSFULLY!');
  console.log('======================================================\n');
}

runTestSuite().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
