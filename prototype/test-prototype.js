/**
 * Automated Verification Test Suite for Peer Learning Platform Prototype
 * Tests actual application controller (app.js) against Astra Correction Package 2 & 3,
 * verifying the 20 Consolidated Invariants and canonical specification fixtures.
 */

const assert = require('assert');
const path = require('path');

// Direct import of actual application controller (Priority 4: No test-only copy!)
const PLP = require(path.join(__dirname, 'app.js'));

console.log('================================================================');
console.log('RUNNING PROTOTYPE AUTOMATED VERIFICATION SUITE');
console.log('Application Controller: prototype/app.js (UMD module)');
console.log('Student: Zhumirov Bekzat (SE-2416) | Supervisor: Aigerim Kydyrbekova');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(testName, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] Test ${totalTests}: ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] Test ${totalTests}: ${testName}`);
    console.error(`       Error: ${err.message}\n`);
    console.error(err.stack);
  }
}

// ----------------------------------------------------------------------------
// TEST 1: Canonical Compatibility Formula (Fixture M-01) & Format (Score: X / 100)
// ----------------------------------------------------------------------------
runTest('Compatibility Formula Exactness & Format (Fixture M-01: 60.8 / 100)', () => {
  const viewer = {
    id: 'u-viewer',
    topic_tags: ['derivatives', 'limits'],
    knowledge_level: 'beginner', // level 1
    study_goal: 'concept_mastery'
  };

  const listing = {
    id: 'list-m01',
    topic_tags: ['derivatives', 'integrals'],
    author_level: 'intermediate', // level 2 (diff = 1 -> L = 0.5)
    study_goal: 'concept_mastery'
  };

  const res = PLP.calculateCompatibility(viewer, listing);
  assert.strictEqual(res.eligibleForScoring, true);

  // T = 1/3 (0.3333...), G = 1.0, L = 0.5
  // Score = 100 * (0.40 * (1/3) + 0.35 * 1.0 + 0.25 * 0.5) = 60.833... -> 60.8 / 100
  assert.strictEqual(res.displayScore, '60.8 / 100', 'Score must be formatted as 60.8 / 100 (never percentage)');
  assert.strictEqual(res.unroundedScore.toFixed(4), '60.8333');
  assert.strictEqual(res.matchedTags.length, 1);
  assert.strictEqual(res.matchedTags[0], 'derivatives');
});

// ----------------------------------------------------------------------------
// TEST 2: Invariant #10: Missing Preferences Disable Scoring (Eve Fallback)
// ----------------------------------------------------------------------------
runTest('Invariant #10: Missing Preferences Suppress Scoring Without Invented Values', () => {
  const eve = PLP.store.users['u-eve'];
  const listing = PLP.store.studyListings[0];

  const res = PLP.calculateCompatibility(eve, listing);
  assert.strictEqual(res.eligibleForScoring, false);
  assert.strictEqual(res.unroundedScore, null);
  assert.strictEqual(res.displayScore, 'N/A');
  assert.strictEqual(res.explanation.includes('missing'), true);
});

// ----------------------------------------------------------------------------
// TEST 3: Channel Membership Gating (Priority 1)
// ----------------------------------------------------------------------------
runTest('Priority 1: Channel Membership Gating & Join/Leave Interactions', () => {
  // Eve is not initially in chan-algo
  assert.strictEqual(PLP.isChannelMember('chan-algo', 'u-eve'), false);

  // Discover listings as Eve -> Locked (empty eligible listings)
  const lockedListings = PLP.filterEligibleListings(PLP.store.studyListings, 'u-eve', 'chan-algo');
  assert.strictEqual(lockedListings.length, 0, 'Non-members must not see listings in locked channel');

  // Eve joins channel
  const joinRes = PLP.joinChannel('chan-algo', 'u-eve');
  assert.strictEqual(joinRes, true);
  assert.strictEqual(PLP.isChannelMember('chan-algo', 'u-eve'), true);

  // Now listings are visible
  const unlockedListings = PLP.filterEligibleListings(PLP.store.studyListings, 'u-eve', 'chan-algo');
  assert.strictEqual(unlockedListings.length > 0, true, 'Joining channel unlocks listing discovery');

  // Eve leaves channel
  PLP.leaveChannel('chan-algo', 'u-eve');
  assert.strictEqual(PLP.isChannelMember('chan-algo', 'u-eve'), false);
});

// ----------------------------------------------------------------------------
// TEST 4: Strict Listing Validation (Priority 1 & 2)
// ----------------------------------------------------------------------------
runTest('Priority 1: Strict Listing Validation (Future Start, Positive Duration, Language, Author Level)', () => {
  // Ensure Alice is a member
  PLP.joinChannel('chan-algo', 'u-alice');

  // 1. Missing author level
  const invalid1 = PLP.validateAndCreateListing({
    channel_id: 'chan-algo',
    title: 'Test Listing',
    topic_tags: ['python'],
    author_level: null,
    language: 'en',
    starts_at: '2026-10-25T14:00:00Z',
    ends_at: '2026-10-25T15:00:00Z'
  }, 'u-alice');
  assert.strictEqual(invalid1.success, false);
  assert.strictEqual(invalid1.error.includes('author knowledge level'), true);

  // 2. Start in the past relative to demo clock (demo clock is 2026-10-20)
  const invalid2 = PLP.validateAndCreateListing({
    channel_id: 'chan-algo',
    title: 'Past Listing',
    topic_tags: ['python'],
    author_level: 'intermediate',
    language: 'en',
    starts_at: '2020-01-01T10:00:00Z',
    ends_at: '2020-01-01T11:00:00Z'
  }, 'u-alice');
  assert.strictEqual(invalid2.success, false);
  assert.strictEqual(invalid2.error.includes('future'), true);

  // 3. End before start
  const invalid3 = PLP.validateAndCreateListing({
    channel_id: 'chan-algo',
    title: 'Inverted Times',
    topic_tags: ['python'],
    author_level: 'intermediate',
    language: 'en',
    starts_at: '2026-10-25T15:00:00Z',
    ends_at: '2026-10-25T14:00:00Z'
  }, 'u-alice');
  assert.strictEqual(invalid3.success, false);
  assert.strictEqual(invalid3.error.includes('after start'), true);

  // 4. Duration too short (<15m)
  const invalid4 = PLP.validateAndCreateListing({
    channel_id: 'chan-algo',
    title: 'Too Short',
    topic_tags: ['python'],
    author_level: 'intermediate',
    language: 'en',
    starts_at: '2026-10-25T14:00:00Z',
    ends_at: '2026-10-25T14:05:00Z' // 5 min
  }, 'u-alice');
  assert.strictEqual(invalid4.success, false);
  assert.strictEqual(invalid4.error.includes('15 and 180 minutes'), true);

  // 5. Valid listing
  const valid = PLP.validateAndCreateListing({
    channel_id: 'chan-algo',
    title: 'Valid Graph Traversal Session',
    topic_tags: ['graphs', 'python'],
    author_level: 'intermediate',
    language: 'en',
    starts_at: '2026-10-25T14:00:00Z',
    ends_at: '2026-10-25T15:00:00Z'
  }, 'u-alice');
  assert.strictEqual(valid.success, true);
  assert.strictEqual(valid.listing.author_level, 'intermediate');
});

// ----------------------------------------------------------------------------
// TEST 5: Response Row Reuse (Invariant #8 & Fixture R-01)
// ----------------------------------------------------------------------------
runTest('Invariant #8 & Fixture R-01: Response Row Reuse on Withdrawal (UNIQUE(listing_id, respondent_id))', () => {
  PLP.joinChannel('chan-algo', 'u-bob');
  const listingId = 'list-101';

  // 1. Initial response
  const r1 = PLP.submitListingResponse(listingId, 'u-bob', '2026-10-25 14:00 UTC', 'First response message');
  assert.strictEqual(r1.success, true);
  assert.strictEqual(r1.reused, false);
  const respId = r1.response.id;

  // 2. Withdraw
  const w = PLP.withdrawResponse(respId, 'u-bob');
  assert.strictEqual(w.success, true);
  assert.strictEqual(w.response.status, 'withdrawn');

  // 3. Re-respond -> Must reuse the exact same row!
  const r2 = PLP.submitListingResponse(listingId, 'u-bob', '2026-10-25 14:00 UTC', 'Re-responding with updated notes');
  assert.strictEqual(r2.success, true);
  assert.strictEqual(r2.reused, true, 'Must reuse existing response row');
  assert.strictEqual(r2.response.id, respId, 'Row ID must be preserved');
  assert.strictEqual(r2.response.status, 'pending');
});

// ----------------------------------------------------------------------------
// TEST 6: Acceptance Creates Scheduled Session & Participant Start (Priority 1)
// ----------------------------------------------------------------------------
runTest('Priority 1 & Invariant #5: Acceptance Creates Scheduled Session (Not Immediately Active)', () => {
  const listing = PLP.store.studyListings.find(l => l.id === 'list-101');
  const response = PLP.store.listingResponses.find(r => r.listing_id === 'list-101' && r.respondent_id === 'u-bob');
  assert.strictEqual(Boolean(response), true);

  // Author Alice accepts Bob's response
  const accRes = PLP.acceptResponse(response.id, 'u-alice');
  assert.strictEqual(accRes.success, true);
  const session = accRes.session;

  // Session must be in SCHEDULED state
  assert.strictEqual(session.status, 'scheduled', 'Session must be created in scheduled state');
  assert.strictEqual(session.counted_duration_seconds, 0);

  // Attempting to start session before scheduled start time should fail
  const earlyStart = PLP.startSessionAsParticipant(session.id, 'u-alice');
  assert.strictEqual(earlyStart.success, false);
  assert.strictEqual(earlyStart.error.includes('before scheduled start'), true);

  // Advance demo clock to scheduled start
  PLP.advanceDemoClockTo(session.starts_at);

  // Now participant check-in starts the session
  const validStart = PLP.startSessionAsParticipant(session.id, 'u-alice');
  assert.strictEqual(validStart.success, true);
  assert.strictEqual(session.status, 'active', 'Participant check-in transitions session to active');
  assert.strictEqual(PLP.store.sessionOutcomes.some(o => o.session_id === session.id), true, 'Outcome draft initialized');
});

// ----------------------------------------------------------------------------
// TEST 7: Outsider Persona Permissions & Privacy Guard (Priority 2)
// ----------------------------------------------------------------------------
runTest('Priority 2: Outsider Persona Cannot Interfere with Private Session', () => {
  const session = PLP.store.studySessions.find(s => s.user_a_id === 'u-alice' && s.user_b_id === 'u-bob');
  assert.strictEqual(Boolean(session), true);

  // Eve is an outsider to Alice-Bob session
  // 1. Eve attempts to send chat message
  const chatRes = PLP.sendChatMessage(session.id, 'u-eve', 'Intruder message');
  assert.strictEqual(chatRes.success, false);
  assert.strictEqual(chatRes.error.includes('Unauthorized'), true);

  // 2. Eve attempts to update outcome draft
  const editRes = PLP.updateOutcomeDraft(session.id, 'Hacked outcome', ['malicious'], 'u-eve', 1);
  assert.strictEqual(editRes.success, false);
  assert.strictEqual(editRes.error.includes('Unauthorized'), true);

  // 3. Eve attempts to approve outcome
  const appRes = PLP.approveOutcomeVersion(session.id, 1, 'u-eve');
  assert.strictEqual(appRes.success, false);
  assert.strictEqual(appRes.error.includes('Unauthorized'), true);

  // 4. Eve attempts to submit review
  const revRes = PLP.submitSessionReview(session.id, 'u-eve', 5, 'Fake review');
  assert.strictEqual(revRes.success, false);
  assert.strictEqual(revRes.error.includes('Unauthorized'), true);
});

// ----------------------------------------------------------------------------
// TEST 8: Canonical Fixture A-01 (Exact-Midnight Exhaustion)
// ----------------------------------------------------------------------------
runTest('Canonical Fixture A-01: Exact-Midnight Exhaustion (900s Day 1, None on Day 2)', () => {
  const s = PLP.runFixtureA01();
  assert.strictEqual(s.status, 'ended');
  assert.strictEqual(s.end_reason, 'allowance_exhaustion');
  assert.strictEqual(s.counted_duration_seconds, 900);
});

// ----------------------------------------------------------------------------
// TEST 9: Canonical Fixtures A-02 & A-03 (Midnight Split & Scheduled End)
// ----------------------------------------------------------------------------
runTest('Canonical Fixtures A-02 & A-03: Across-Midnight Split (2,700s) & Midnight Scheduled End', () => {
  // A-02: 900s Day 1 + 1,800s Day 2 = 2,700s
  const a02 = PLP.runFixtureA02();
  assert.strictEqual(a02.counted_duration_seconds, 2700);
  assert.strictEqual(a02.end_reason, 'scheduled_end');

  // Verify atomic ledger rows for A-02 (2 dates per participant)
  const a02Ledgers = PLP.store.usageLedgers.filter(l => l.session_id === a02.id);
  assert.strictEqual(a02Ledgers.length, 4);
  const day1 = a02Ledgers.filter(l => l.utc_date === '2026-10-24');
  const day2 = a02Ledgers.filter(l => l.utc_date === '2026-10-25');
  assert.strictEqual(day1.length, 2);
  assert.strictEqual(day1[0].counted_seconds, 900);
  assert.strictEqual(day2.length, 2);
  assert.strictEqual(day2[0].counted_seconds, 1800);

  // A-03: Reaches scheduled end at midnight (900s)
  const a03 = PLP.runFixtureA03();
  assert.strictEqual(a03.counted_duration_seconds, 900);
  assert.strictEqual(a03.end_reason, 'scheduled_end');
});

// ----------------------------------------------------------------------------
// TEST 10: Canonical Fixture A-04 (End / Exhaustion Tie Rule)
// ----------------------------------------------------------------------------
runTest('Canonical Fixture A-04: End / Exhaustion Tie Priority Rule (allowance_exhaustion wins)', () => {
  const a04 = PLP.runFixtureA04();
  assert.strictEqual(a04.counted_duration_seconds, 900);
  assert.strictEqual(a04.end_reason, 'allowance_exhaustion', 'Under tie rule, allowance_exhaustion takes precedence');
});

// ----------------------------------------------------------------------------
// TEST 11: Fixture A-06 & S-01 (31s Session & Review Gate)
// ----------------------------------------------------------------------------
runTest('Canonical Fixtures A-06 & S-01: 31-Second Session & Review Eligibility Gate', () => {
  const a06 = PLP.runFixtureA06();
  assert.strictEqual(a06.counted_duration_seconds, 31, 'Duration must be exact integer seconds (no rounding to 60s)');
  assert.strictEqual(a06.end_reason, 'manual_exit');

  // Review under S-01 should be locked (31 < 300)
  const reviewAttempt = PLP.submitSessionReview(a06.id, 'u-alice', 5, 'Great short check-in');
  assert.strictEqual(reviewAttempt.success, false);
  assert.strictEqual(reviewAttempt.error.includes('300 seconds'), true);
});

// ----------------------------------------------------------------------------
// TEST 12: Invariant #17 & Fixtures O-01..O-03: Version-Safe Collaborative Outcomes
// ----------------------------------------------------------------------------
runTest('Invariant #17 & Fixtures O-01..O-03: Version-Safe Collaborative Outcomes & 409 Conflict', () => {
  const session = PLP.store.studySessions.find(s => s.user_a_id === 'u-alice' && s.user_b_id === 'u-bob');
  const outcome = PLP.store.sessionOutcomes.find(o => o.session_id === session.id);
  assert.strictEqual(Boolean(outcome), true);

  // Bob approves v1 -> Mutually confirmed
  const appBobV1 = PLP.approveOutcomeVersion(session.id, outcome.version, 'u-bob');
  assert.strictEqual(appBobV1.success, true);
  const appAliceV1 = PLP.approveOutcomeVersion(session.id, outcome.version, 'u-alice');
  assert.strictEqual(appAliceV1.success, true);
  assert.strictEqual(appAliceV1.isMutuallyConfirmed, true);

  // Alice edits with expected v1 -> Becomes v2, Bob approval invalidated
  const editV2 = PLP.updateOutcomeDraft(session.id, 'Updated v2 summary', ['algorithms'], 'u-alice', outcome.version);
  assert.strictEqual(editV2.success, true);
  assert.strictEqual(outcome.version, 2);
  assert.strictEqual(outcome.approved_version_b, null, 'Partner approval must be invalidated');

  // Bob attempts to approve stale v1 -> Must reject with 409 OUTCOME_VERSION_CONFLICT
  const staleApp = PLP.approveOutcomeVersion(session.id, 1, 'u-bob');
  assert.strictEqual(staleApp.success, false);
  assert.strictEqual(staleApp.status, 409);
  assert.strictEqual(staleApp.error.includes('409 OUTCOME_VERSION_CONFLICT'), true);

  // Stale edit check: Alice attempts to edit using stale expected v1 -> 409
  const staleEdit = PLP.updateOutcomeDraft(session.id, 'Stale edit', ['graphs'], 'u-alice', 1);
  assert.strictEqual(staleEdit.success, false);
  assert.strictEqual(staleEdit.status, 409);

  // Bob approves current v2 -> Mutually confirmed
  const appBobV2 = PLP.approveOutcomeVersion(session.id, 2, 'u-bob');
  assert.strictEqual(appBobV2.success, true);
  assert.strictEqual(appBobV2.isMutuallyConfirmed, true);
});

// ----------------------------------------------------------------------------
// TEST 13: Invariants #18 & #19: Exact 5 Terminal Reasons & Blocking Guard
// ----------------------------------------------------------------------------
runTest('Invariants #18 & #19: Exact 5 Terminal Reasons & Blocking Guard', () => {
  const EXACT_5 = new Set([
    'manual_exit',
    'scheduled_end',
    'allowance_exhaustion',
    'connection_interruption',
    'blocked'
  ]);

  // Check every ended session in the store
  PLP.store.studySessions.forEach(s => {
    if (s.status === 'ended') {
      assert.strictEqual(EXACT_5.has(s.end_reason), true, `End reason '${s.end_reason}' must be one of exact 5`);
    }
  });

  // Block participants on active session
  const testSess = {
    id: 'sess-block-test',
    user_a_id: 'u-alice',
    user_b_id: 'u-bob',
    status: 'active',
    counted_duration_seconds: 100
  };
  PLP.reconcileAccounting(testSess, 0, 'blocked');
  assert.strictEqual(testSess.status, 'ended');
  assert.strictEqual(testSess.end_reason, 'blocked');
});

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n================================================================');
console.log('Prototype Test Suite Completed: Verified client-side interactions, canonical fixtures, and state machine guards (Production PostgreSQL concurrency & WebSockets remain Working-V1 scope).');
console.log('================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
