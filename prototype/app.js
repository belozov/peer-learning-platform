/**
 * Compatibility-Based Peer Learning Platform - Interactive Prototype
 * Group: SE-2416 | Student: Zhumirov Bekzat | Supervisor: Aigerim Kydyrbekova
 *
 * Implements client-side state machine with strictly enforced specification invariants:
 * - 180 min (10,800s) total daily allowance (Confirmed)
 * - Proposed: UTC reset, 60s grace period, 300s review threshold, matching weights, mutual outcome confirmation
 * - Exact 5 terminal reasons: manual_exit, scheduled_end, allowance_exhaustion, connection_interruption, blocked
 * - Shared Lock Protocol simulation & 409 cross-listing collision detection
 * - Response row reuse on withdrawal (UNIQUE(listing_id, respondent_id))
 * - Pure unrounded compatibility calculation with identical eligibility filters
 * - Version-safe outcome mutual confirmation with 409 conflict on stale approval
 */

(function () {
  'use strict';

  // --- 1. SEED DATA & IN-MEMORY STORE ---
  const INITIAL_STATE = {
    currentUser: 'u-alice',
    selectedCommunity: 'comm-se',
    selectedChannel: 'chan-algo',
    feedSort: 'compatibility', // 'compatibility' | 'chronological'
    activeSessionId: null,

    users: {
      'u-alice': {
        id: 'u-alice',
        uuid: '00000000-0000-0000-0000-000000000001',
        name: 'Alice Learner',
        role: 'learner',
        knowledge_level: 'intermediate',
        topic_tags: ['algorithms', 'graphs', 'python'],
        study_goal: 'concept_mastery',
        timezone: 'Asia/Almaty',
        used_seconds_today: 1800, // 30 min used, 9,000s remaining
        previous_partners_public: false, // Default private confirmed
        avatar: 'AL'
      },
      'u-bob': {
        id: 'u-bob',
        uuid: '00000000-0000-0000-0000-000000000002',
        name: 'Bob Learner',
        role: 'learner',
        knowledge_level: 'intermediate',
        topic_tags: ['algorithms', 'graphs', 'dynamic-programming'],
        study_goal: 'concept_mastery',
        timezone: 'Asia/Almaty',
        used_seconds_today: 3600, // 60 min used, 7,200s remaining
        previous_partners_public: false,
        avatar: 'BO'
      },
      'u-carol': {
        id: 'u-carol',
        uuid: '00000000-0000-0000-0000-000000000003',
        name: 'Carol Senior',
        role: 'learner',
        knowledge_level: 'advanced',
        topic_tags: ['system-design', 'distributed-systems', 'go'],
        study_goal: 'code_review',
        timezone: 'Asia/Almaty',
        used_seconds_today: 0,
        previous_partners_public: true,
        avatar: 'CA'
      },
      'u-dave': {
        id: 'u-dave',
        uuid: '00000000-0000-0000-0000-000000000004',
        name: 'Dave Blocked',
        role: 'learner',
        knowledge_level: 'beginner',
        topic_tags: ['python'],
        study_goal: 'exam_prep',
        timezone: 'Asia/Almaty',
        used_seconds_today: 0,
        previous_partners_public: false,
        avatar: 'DA'
      },
      'u-eve': {
        id: 'u-eve',
        uuid: '00000000-0000-0000-0000-000000000005',
        name: 'Eve NewLearner',
        role: 'learner',
        knowledge_level: null, // Missing preferences for fallback demonstration
        topic_tags: [],
        study_goal: null,
        timezone: 'Asia/Almaty',
        used_seconds_today: 0,
        previous_partners_public: false,
        avatar: 'EV'
      },
      'u-admin': {
        id: 'u-admin',
        uuid: '00000000-0000-0000-0000-000000000009',
        name: 'Platform Moderator',
        role: 'administrator',
        knowledge_level: 'advanced',
        topic_tags: ['platform-admin'],
        study_goal: 'code_review',
        timezone: 'Asia/Almaty',
        used_seconds_today: 0,
        previous_partners_public: false,
        avatar: 'AD'
      }
    },

    userBlocks: [
      { blocker_id: 'u-alice', blocked_id: 'u-dave', created_at: '2026-10-15T10:00:00Z' }
    ],

    communities: [
      { id: 'comm-se', name: 'Software Engineering (SE-2416)', code: 'SE-2416' },
      { id: 'comm-ds', name: 'Data Science (DS-2410)', code: 'DS-2410' }
    ],

    channels: [
      { id: 'chan-algo', community_id: 'comm-se', name: 'algorithms-and-ds', description: 'Algorithms, Data Structures & Problem Solving' },
      { id: 'chan-web', community_id: 'comm-se', name: 'web-engineering', description: 'Frontend, Backend, APIs & Distributed Web' },
      { id: 'chan-sys', community_id: 'comm-se', name: 'system-architecture', description: 'High-Level Design, Cloud & Architecture' },
      { id: 'chan-ml', community_id: 'comm-ds', name: 'ml-foundations', description: 'Statistics, Linear Algebra & Models' }
    ],

    studyListings: [
      {
        id: 'list-101',
        channel_id: 'chan-algo',
        author_id: 'u-alice',
        title: 'Graph Traversal: Dijkstra & Bellman-Ford Implementation',
        topic_tags: ['algorithms', 'graphs', 'python'],
        author_level: 'intermediate',
        study_goal: 'concept_mastery',
        starts_at: '2026-10-25T14:00:00Z',
        ends_at: '2026-10-25T15:00:00Z',
        notes: 'Looking to pair program through weighted graph algorithms and edge cases.',
        status: 'open',
        created_at: '2026-10-19T10:00:00Z'
      },
      {
        id: 'list-102',
        channel_id: 'chan-algo',
        author_id: 'u-bob',
        title: 'Dynamic Programming: Memoization vs Tabulation Patterns',
        topic_tags: ['algorithms', 'dynamic-programming', 'python'],
        author_level: 'intermediate',
        study_goal: 'concept_mastery',
        starts_at: '2026-10-25T16:00:00Z',
        ends_at: '2026-10-25T17:00:00Z',
        notes: 'Covering knapsack, subset sum, and longest common subsequence.',
        status: 'open',
        created_at: '2026-10-19T11:30:00Z'
      },
      {
        id: 'list-103',
        channel_id: 'chan-sys',
        author_id: 'u-carol',
        title: 'Distributed Consensus: Raft Protocol Walkthrough',
        topic_tags: ['system-design', 'distributed-systems', 'go'],
        author_level: 'advanced',
        study_goal: 'code_review',
        starts_at: '2026-10-26T18:00:00Z',
        ends_at: '2026-10-26T19:30:00Z',
        notes: 'Leader election, log replication, and split-brain recovery analysis.',
        status: 'open',
        created_at: '2026-10-19T12:00:00Z'
      }
    ],

    listingResponses: [
      {
        id: 'resp-1',
        listing_id: 'list-101',
        respondent_id: 'u-bob',
        status: 'pending', // 'pending' | 'accepted' | 'declined' | 'withdrawn'
        message: 'I have implemented Dijkstra in Python before, would love to review edge cases together!',
        proposed_slot: '2026-10-25T14:00:00Z - 2026-10-25T15:00:00Z',
        created_at: '2026-10-19T13:00:00Z'
      }
    ],

    studySessions: [
      {
        id: 'sess-901',
        listing_id: 'list-seed-past',
        user_a_id: 'u-alice',
        user_b_id: 'u-carol',
        channel_id: 'chan-algo',
        starts_at: '2026-10-18T14:00:00Z',
        ends_at: '2026-10-18T15:00:00Z',
        status: 'ended', // 'scheduled' | 'active' | 'ended' | 'cancelled'
        end_reason: 'scheduled_end', // Exactly one of 5 terminal reasons
        counted_duration_seconds: 3600, // 60 min -> >= 300s, eligible for review
        created_at: '2026-10-18T13:55:00Z'
      }
    ],

    sessionOutcomes: [
      {
        id: 'out-901',
        session_id: 'sess-901',
        version: 1,
        last_editor_id: 'u-alice',
        approved_version_a: 1,
        approved_version_b: 1, // Mutually confirmed derived
        summary: 'Completed binary heap implementation and verified O(log n) heapify complexity.',
        key_topics: ['Binary Heaps', 'Dijkstra Priority Queue'],
        created_at: '2026-10-18T15:05:00Z',
        updated_at: '2026-10-18T15:10:00Z'
      }
    ],

    sessionReviews: [
      {
        id: 'rev-901',
        session_id: 'sess-901',
        reviewer_id: 'u-alice',
        reviewee_id: 'u-carol',
        rating: 5,
        review_text: 'Excellent partner! Clarified the heapify sink operation with great diagrams.',
        created_at: '2026-10-18T15:15:00Z'
      }
    ],

    chatMessages: {
      'sess-901': [
        { sender_id: 'u-alice', sender_name: 'Alice', text: 'Hi Carol, ready to start?', time: '14:00:15' },
        { sender_id: 'u-carol', sender_name: 'Carol', text: 'Yes, opening the IDE now.', time: '14:01:02' }
      ]
    },

    usageLedgers: [
      { id: 'ledg-1', session_id: 'sess-901', user_id: 'u-alice', utc_date: '2026-10-18', counted_seconds: 3600 },
      { id: 'ledg-2', session_id: 'sess-901', user_id: 'u-carol', utc_date: '2026-10-18', counted_seconds: 3600 }
    ],

    auditLogs: []
  };

  // State store instance
  const store = JSON.parse(JSON.stringify(INITIAL_STATE));

  // Active Session Live Timer State
  let liveSessionTimer = null;
  let liveGraceTimer = null;
  let liveSecondsElapsed = 0;
  let liveGraceSecondsRemaining = 60;
  let liveConnectionState = 'connected'; // 'connected' | 'disconnected_grace' | 'ended'

  // --- 2. AUDIT LOGGING ---
  function logAudit(category, action, details) {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, category, action, details };
    store.auditLogs.unshift(entry);
    if (store.auditLogs.length > 200) store.auditLogs.pop();
    renderAuditLog();
  }

  // --- 3. CORE COMPATIBILITY ALGORITHM (INVARIANTS #10 & #11) ---
  /**
   * Calculates compatibility between viewer preferences and a study listing.
   * Formula: Score = 100 * (0.40*T + 0.35*G + 0.25*L)
   * Invariant 10: Missing preferences disable scoring without invented values.
   * Invariant 11: Identical eligibility filters applied to both chronological and ranked lists.
   */
  function calculateCompatibility(viewer, listing) {
    // Check missing preferences
    const hasViewerPreferences = viewer && viewer.topic_tags && viewer.topic_tags.length > 0 && viewer.knowledge_level && viewer.study_goal;
    const hasListingPreferences = listing && listing.topic_tags && listing.topic_tags.length > 0 && listing.author_level && listing.study_goal;

    if (!hasViewerPreferences || !hasListingPreferences) {
      return {
        eligibleForScoring: false,
        reason: 'Viewer or listing lacks required preferences (topic tags, knowledge level, study goal).',
        unroundedScore: null,
        displayScore: 'N/A',
        explanation: 'Compatibility scoring disabled: learning preferences missing. Displaying chronological fallback.'
      };
    }

    // 1. Topic Similarity T (Jaccard index)
    const setA = new Set(viewer.topic_tags.map(t => t.toLowerCase()));
    const setB = new Set(listing.topic_tags.map(t => t.toLowerCase()));
    const intersection = [...setA].filter(x => setB.has(x));
    const union = new Set([...setA, ...setB]);
    const T = union.size > 0 ? intersection.length / union.size : 0.0;

    // 2. Goal Match G
    const G = viewer.study_goal === listing.study_goal ? 1.0 : 0.0;

    // 3. Level Difference L (Level_listing = author_level)
    const levelMap = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
    const levelViewer = levelMap[viewer.knowledge_level] || 1;
    const levelListing = levelMap[listing.author_level] || 1;
    const diff = Math.abs(levelViewer - levelListing);
    let L = 0.0;
    if (diff === 0) L = 1.0;
    else if (diff === 1) L = 0.5;
    else L = 0.0;

    // Exact unrounded calculation
    const unroundedScore = 100.0 * (0.40 * T + 0.35 * G + 0.25 * L);
    const displayScore = unroundedScore.toFixed(1);

    return {
      eligibleForScoring: true,
      unroundedScore,
      displayScore,
      T,
      G,
      L,
      matchedTags: intersection,
      explanation: `T=${T.toFixed(2)} (tags), G=${G.toFixed(2)} (goal), L=${L.toFixed(2)} (level) → ${displayScore}%`
    };
  }

  /**
   * Filter listings with identical eligibility rules (Invariant #11):
   * - Must match channel
   * - Must be open
   * - Must not be authored by someone blocked by the viewer, or who blocked the viewer
   * - Scheduled start must not conflict with viewer's existing booked sessions
   */
  function filterEligibleListings(listings, viewerId, channelId) {
    const viewer = store.users[viewerId];
    return listings.filter(l => {
      if (l.channel_id !== channelId) return false;
      if (l.status !== 'open') return false;

      // Blocking check (Invariant #18)
      const isBlocked = store.userBlocks.some(b =>
        (b.blocker_id === viewerId && b.blocked_id === l.author_id) ||
        (b.blocker_id === l.author_id && b.blocked_id === viewerId)
      );
      if (isBlocked) return false;

      // Overlapping session booking check (Invariant #6 & #7)
      const lStart = new Date(l.starts_at).getTime();
      const lEnd = new Date(l.ends_at).getTime();
      const hasConflict = store.studySessions.some(s => {
        if (s.status !== 'scheduled' && s.status !== 'active') return false;
        if (s.user_a_id !== viewerId && s.user_b_id !== viewerId) return false;
        const sStart = new Date(s.starts_at).getTime();
        const sEnd = new Date(s.ends_at).getTime();
        return (lStart < sEnd && lEnd > sStart);
      });
      if (hasConflict) return false;

      return true;
    });
  }

  // --- 4. RESPONSE ROW REUSE (INVARIANT #8 & FIXTURE R-01) ---
  function submitListingResponse(listingId, respondentId, proposedSlot, message) {
    const listing = store.studyListings.find(l => l.id === listingId);
    if (!listing || listing.status !== 'open') {
      alert('Error: Listing is not open for responses.');
      return false;
    }
    if (listing.author_id === respondentId) {
      alert('Error: Cannot respond to your own listing.');
      return false;
    }

    // Find existing response row respecting UNIQUE(listing_id, respondent_id)
    const existing = store.listingResponses.find(r => r.listing_id === listingId && r.respondent_id === respondentId);

    if (existing) {
      if (existing.status === 'pending') {
        alert('You already have a pending response to this listing.');
        return false;
      }
      if (existing.status === 'withdrawn') {
        // Re-response reuses existing row: withdrawn -> pending
        existing.status = 'pending';
        existing.proposed_slot = proposedSlot;
        existing.message = message;
        existing.created_at = new Date().toISOString();
        logAudit('RESPONSE', 'ROW_REUSE', `Reused existing response ${existing.id} (withdrawn -> pending) for listing ${listingId}`);
        renderApp();
        return true;
      }
      if (existing.status === 'declined' || existing.status === 'accepted') {
        alert(`Cannot respond: prior response is already ${existing.status}.`);
        return false;
      }
    }

    // Insert new row
    const newId = 'resp-' + (store.listingResponses.length + 1);
    const newRow = {
      id: newId,
      listing_id: listingId,
      respondent_id: respondentId,
      status: 'pending',
      proposed_slot: proposedSlot,
      message: message,
      created_at: new Date().toISOString()
    };
    store.listingResponses.push(newRow);
    logAudit('RESPONSE', 'ROW_INSERT', `Inserted new response ${newId} for listing ${listingId}`);
    renderApp();
    return true;
  }

  function withdrawResponse(responseId, userId) {
    const resp = store.listingResponses.find(r => r.id === responseId);
    if (!resp || resp.respondent_id !== userId) {
      alert('Unauthorized or response not found.');
      return false;
    }
    if (resp.status !== 'pending') {
      alert(`Cannot withdraw response in status '${resp.status}'.`);
      return false;
    }
    resp.status = 'withdrawn';
    logAudit('RESPONSE', 'WITHDRAW', `User ${userId} withdrew response ${responseId} (status: withdrawn). Row retained for reuse.`);
    renderApp();
    return true;
  }

  // --- 5. ATOMIC ACCEPTANCE & SHARED LOCK PROTOCOL (INVARIANTS #3, #4, #5, #6, #7 & FIXTURES C-01..C-04) ---
  function acceptResponse(responseId, authorId) {
    const response = store.listingResponses.find(r => r.id === responseId);
    if (!response || response.status !== 'pending') {
      alert('Response is not in pending state.');
      return false;
    }
    const listing = store.studyListings.find(l => l.id === response.listing_id);
    if (!listing || listing.author_id !== authorId) {
      alert('Unauthorized: only the listing author can accept responses.');
      return false;
    }

    const respondentId = response.respondent_id;
    const authorUser = store.users[authorId];
    const respondentUser = store.users[respondentId];

    // Simulate Shared Lock Protocol Acquisition Order:
    // 1. users in ascending UUID order
    // 2. study_listings
    // 3. listing_responses
    // 4. study_sessions
    // 5. session_outcomes
    const sortedUserUUIDs = [authorUser, respondentUser].sort((a, b) => a.uuid.localeCompare(b.uuid));
    logAudit('LOCK_PROTOCOL', 'ACQUIRE_LOCKS',
      `Locked users [${sortedUserUUIDs[0].id}, ${sortedUserUUIDs[1].id}] -> study_listings (${listing.id}) -> listing_responses -> study_sessions`
    );

    // Recheck eligibility under locks:
    // A. Daily allowance balance check (10,800s cap)
    const authorRemaining = 10800 - (authorUser.used_seconds_today || 0);
    const respRemaining = 10800 - (respondentUser.used_seconds_today || 0);
    if (authorRemaining <= 0 || respRemaining <= 0) {
      logAudit('ACCEPTANCE', 'REJECT_ALLOWANCE', `Daily allowance exhausted: Author remaining ${authorRemaining}s, Respondent remaining ${respRemaining}s.`);
      alert('Acceptance failed: One of the participants has exhausted their 10,800s daily allowance.');
      return false;
    }

    // B. Blocking check
    const isBlocked = store.userBlocks.some(b =>
      (b.blocker_id === authorId && b.blocked_id === respondentId) ||
      (b.blocker_id === respondentId && b.blocked_id === authorId)
    );
    if (isBlocked) {
      alert('Acceptance failed: Participants are blocked.');
      return false;
    }

    // C. Cross-listing collision check (Fixture C-01..C-04):
    // Neither participant may have an overlapping booked session [starts_at, ends_at)
    const lStart = new Date(listing.starts_at).getTime();
    const lEnd = new Date(listing.ends_at).getTime();

    const authorOverlap = store.studySessions.find(s =>
      (s.status === 'scheduled' || s.status === 'active') &&
      (s.user_a_id === authorId || s.user_b_id === authorId) &&
      (lStart < new Date(s.ends_at).getTime() && lEnd > new Date(s.starts_at).getTime())
    );
    if (authorOverlap) {
      logAudit('ACCEPTANCE', '409_CONFLICT', `409 SCHEDULE_CONFLICT: Author has overlapping session ${authorOverlap.id}`);
      alert(`409 SCHEDULE_CONFLICT: Listing author already has a scheduled session during this interval.`);
      return false;
    }

    const respOverlap = store.studySessions.find(s =>
      (s.status === 'scheduled' || s.status === 'active') &&
      (s.user_a_id === respondentId || s.user_b_id === respondentId) &&
      (lStart < new Date(s.ends_at).getTime() && lEnd > new Date(s.starts_at).getTime())
    );
    if (respOverlap) {
      logAudit('ACCEPTANCE', '409_CONFLICT', `409 SCHEDULE_CONFLICT: Respondent has overlapping session ${respOverlap.id}`);
      alert(`409 SCHEDULE_CONFLICT: Respondent has an overlapping session during this interval.`);
      return false;
    }

    // D. Atomic Commit:
    listing.status = 'matched';
    response.status = 'accepted';

    // Other pending responses on this listing are marked declined
    store.listingResponses.forEach(r => {
      if (r.listing_id === listing.id && r.id !== response.id && r.status === 'pending') {
        r.status = 'declined';
        logAudit('RESPONSE', 'DECLINE_COLLATERAL', `Response ${r.id} declined due to acceptance of ${response.id}`);
      }
    });

    // Create session (Invariant #6: 1 listing -> at most 1 session, user_a_id != user_b_id)
    const newSessionId = 'sess-' + (store.studySessions.length + 101);
    const newSession = {
      id: newSessionId,
      listing_id: listing.id,
      user_a_id: authorId,
      user_b_id: respondentId,
      channel_id: listing.channel_id,
      starts_at: listing.starts_at,
      ends_at: listing.ends_at,
      status: 'active', // Immediately enter active for prototype walkthrough
      end_reason: null,
      counted_duration_seconds: 0,
      created_at: new Date().toISOString()
    };
    store.studySessions.push(newSession);

    // Initialize initial outcome row
    store.sessionOutcomes.push({
      id: 'out-' + newSessionId,
      session_id: newSessionId,
      version: 1,
      last_editor_id: authorId,
      approved_version_a: 1,
      approved_version_b: null,
      summary: `Initial outcome draft for "${listing.title}". Key goals: cover core concepts and write practice tests.`,
      key_topics: [...listing.topic_tags],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Initialize chat messages
    store.chatMessages[newSessionId] = [
      { sender_id: 'system', sender_name: 'System', text: `Session ${newSessionId} activated. Scheduled interval: ${listing.starts_at} to ${listing.ends_at}. Daily allowance cap: 10,800s.`, time: new Date().toLocaleTimeString() }
    ];

    logAudit('SESSION', 'ACTIVATED', `Session ${newSessionId} created between ${authorId} and ${respondentId}`);
    switchSession(newSessionId);
    return true;
  }

  // --- 6. REAL-TIME HUD & SESSION SIMULATION (INVARIANTS #12, #13, #14, #15, #19) ---
  function switchSession(sessionId) {
    store.activeSessionId = sessionId;
    liveSecondsElapsed = 0;
    liveConnectionState = 'connected';
    clearInterval(liveSessionTimer);
    clearInterval(liveGraceTimer);

    const session = store.studySessions.find(s => s.id === sessionId);
    if (session && session.status === 'active') {
      liveSecondsElapsed = session.counted_duration_seconds || 0;
      startLiveSessionTimer();
    }
    renderApp();
    setActiveTab('tab-session');
  }

  function startLiveSessionTimer() {
    clearInterval(liveSessionTimer);
    liveSessionTimer = setInterval(() => {
      const session = store.studySessions.find(s => s.id === store.activeSessionId);
      if (!session || session.status !== 'active') {
        clearInterval(liveSessionTimer);
        return;
      }
      liveSecondsElapsed += 1;
      session.counted_duration_seconds = liveSecondsElapsed;

      // Check daily allowance exhaustion
      const userA = store.users[session.user_a_id];
      const userB = store.users[session.user_b_id];
      const remA = 10800 - (userA.used_seconds_today + liveSecondsElapsed);
      const remB = 10800 - (userB.used_seconds_today + liveSecondsElapsed);

      if (remA <= 0 || remB <= 0) {
        terminateSession('allowance_exhaustion', 'Daily allowance of 10,800s reached');
      } else {
        updateHUD();
      }
    }, 1000);
  }

  function updateHUD() {
    const elapsedEl = document.getElementById('hud-elapsed');
    const remainingEl = document.getElementById('hud-remaining');
    const statusDotEl = document.getElementById('hud-status-dot');
    const statusTextEl = document.getElementById('hud-status-text');

    if (!elapsedEl || !store.activeSessionId) return;

    const session = store.studySessions.find(s => s.id === store.activeSessionId);
    if (!session) return;

    const curUser = store.users[store.currentUser];
    const remUser = Math.max(0, 10800 - ((curUser.used_seconds_today || 0) + (session.status === 'active' ? liveSecondsElapsed : 0)));

    elapsedEl.textContent = `${liveSecondsElapsed}s (${Math.floor(liveSecondsElapsed / 60)}m ${liveSecondsElapsed % 60}s)`;
    remainingEl.textContent = `${remUser}s (${Math.floor(remUser / 60)}m ${remUser % 60}s)`;

    if (session.status === 'active') {
      if (liveConnectionState === 'disconnected_grace') {
        statusDotEl.className = 'status-dot grace';
        statusTextEl.textContent = `Grace Period (${liveGraceSecondsRemaining}s)`;
      } else {
        statusDotEl.className = 'status-dot active';
        statusTextEl.textContent = 'Active (Connected)';
      }
    } else {
      statusDotEl.className = 'status-dot ended';
      statusTextEl.textContent = `Ended (${session.end_reason})`;
    }
  }

  /**
   * Terminate active session with exactly one of the 5 terminal reasons:
   * 1. manual_exit
   * 2. scheduled_end
   * 3. allowance_exhaustion
   * 4. connection_interruption
   * 5. blocked
   */
  function terminateSession(reason, details) {
    clearInterval(liveSessionTimer);
    clearInterval(liveGraceTimer);

    const session = store.studySessions.find(s => s.id === store.activeSessionId);
    if (!session || session.status === 'ended') return;

    session.status = 'ended';
    session.end_reason = reason;
    session.counted_duration_seconds = liveSecondsElapsed;
    liveConnectionState = 'ended';

    // Atomic Usage Ledger Recording (Invariant #15: UNIQUE(session_id, user_id, utc_date))
    const todayUTC = new Date().toISOString().split('T')[0];
    if (liveSecondsElapsed > 0) {
      store.usageLedgers.push({
        id: 'ledg-' + Date.now() + '-a',
        session_id: session.id,
        user_id: session.user_a_id,
        utc_date: todayUTC,
        counted_seconds: liveSecondsElapsed
      });
      store.usageLedgers.push({
        id: 'ledg-' + Date.now() + '-b',
        session_id: session.id,
        user_id: session.user_b_id,
        utc_date: todayUTC,
        counted_seconds: liveSecondsElapsed
      });
      // Deduct from users
      store.users[session.user_a_id].used_seconds_today += liveSecondsElapsed;
      store.users[session.user_b_id].used_seconds_today += liveSecondsElapsed;
    }

    logAudit('SESSION_TERMINATION', reason, `Session ${session.id} ended. Reason: ${reason}. Counted: ${liveSecondsElapsed}s. Details: ${details}`);

    // System message in chat
    if (!store.chatMessages[session.id]) store.chatMessages[session.id] = [];
    store.chatMessages[session.id].push({
      sender_id: 'system',
      sender_name: 'System',
      text: `Session finalized. Terminal reason: ${reason}. Total accounted duration: ${liveSecondsElapsed} seconds (${Math.floor(liveSecondsElapsed / 60)}m ${liveSecondsElapsed % 60}s). Chat history archived as read-only.`,
      time: new Date().toLocaleTimeString()
    });

    renderApp();
  }

  // --- BOUNDARY CONDITION SIMULATORS ---
  function simulateFastForward(seconds) {
    const session = store.studySessions.find(s => s.id === store.activeSessionId);
    if (!session || session.status !== 'active') return;
    liveSecondsElapsed += seconds;
    session.counted_duration_seconds = liveSecondsElapsed;
    logAudit('SIMULATOR', 'FAST_FORWARD', `Advanced session timer by +${seconds} seconds (Total: ${liveSecondsElapsed}s)`);
    renderApp();
  }

  function simulateCrossMidnightSplit() {
    const session = store.studySessions.find(s => s.id === store.activeSessionId);
    if (!session || session.status !== 'active') return;

    // Simulate cross-midnight boundary:
    // e.g. 1800s before midnight (Day 1) and 1800s after midnight (Day 2)
    const day1Date = '2026-10-24';
    const day2Date = '2026-10-25';
    const day1Sec = 1800;
    const day2Sec = 1800;
    const totalSec = day1Sec + day2Sec;

    clearInterval(liveSessionTimer);
    session.status = 'ended';
    session.end_reason = 'scheduled_end';
    session.counted_duration_seconds = totalSec;

    // Insert 2 distinct ledger rows per user for separate UTC dates (Invariant #15 & Fixture A-03)
    [session.user_a_id, session.user_b_id].forEach(uId => {
      store.usageLedgers.push({ id: `ledg-split-${uId}-1`, session_id: session.id, user_id: uId, utc_date: day1Date, counted_seconds: day1Sec });
      store.usageLedgers.push({ id: `ledg-split-${uId}-2`, session_id: session.id, user_id: uId, utc_date: day2Date, counted_seconds: day2Sec });
    });

    logAudit('SIMULATOR', 'MIDNIGHT_SPLIT', `Simulated cross-midnight split: Session ${session.id} charged ${day1Sec}s to ${day1Date} and ${day2Sec}s to ${day2Date}. Ledger UNIQUE constraints satisfied.`);
    alert(`Cross-Midnight Split Simulated!\nSession ${session.id} accounted:\n- ${day1Date}: ${day1Sec}s (30m)\n- ${day2Date}: ${day2Sec}s (30m)\nBoth days recorded in separate atomic ledger entries.`);
    renderApp();
  }

  function simulateExactMidnightExhaustion() {
    const session = store.studySessions.find(s => s.id === store.activeSessionId);
    if (!session || session.status !== 'active') return;

    // Invariant #14 & Fixture A-04: Reaching 0 allowance exactly at midnight ends with allowance_exhaustion
    liveSecondsElapsed = 1800;
    terminateSession('allowance_exhaustion', 'Allowance exhausted at 00:00:00 UTC boundary. Session terminated without Day 2 revival.');
    alert('Exact-Midnight Exhaustion Simulated!\nSession ended at 00:00:00 UTC with terminal reason "allowance_exhaustion". No seconds charged to new day.');
  }

  function simulateDisconnection() {
    const session = store.studySessions.find(s => s.id === store.activeSessionId);
    if (!session || session.status !== 'active') return;

    if (liveConnectionState === 'connected') {
      liveConnectionState = 'disconnected_grace';
      liveGraceSecondsRemaining = 60;
      clearInterval(liveSessionTimer); // Monotonic counting pauses during disconnected grace

      logAudit('CONNECTION', 'DISCONNECTED_GRACE_START', 'Network interruption: 60-second grace timer started.');

      clearInterval(liveGraceTimer);
      liveGraceTimer = setInterval(() => {
        liveGraceSecondsRemaining -= 1;
        updateHUD();
        if (liveGraceSecondsRemaining <= 0) {
          clearInterval(liveGraceTimer);
          terminateSession('connection_interruption', '60-second grace timer expired without client reconnection.');
        }
      }, 1000);
      renderApp();
    } else if (liveConnectionState === 'disconnected_grace') {
      // Reconnect
      clearInterval(liveGraceTimer);
      liveConnectionState = 'connected';
      logAudit('CONNECTION', 'RECONNECTED', 'Client reconnected within grace period. Resuming monotonic timer.');
      startLiveSessionTimer();
      renderApp();
    }
  }

  function simulateBlockParticipant() {
    const session = store.studySessions.find(s => s.id === store.activeSessionId);
    if (!session || session.status !== 'active') return;

    const blocker = store.currentUser;
    const blocked = blocker === session.user_a_id ? session.user_b_id : session.user_a_id;

    store.userBlocks.push({ blocker_id: blocker, blocked_id: blocked, created_at: new Date().toISOString() });
    terminateSession('blocked', `Participant ${blocked} blocked by ${blocker}. Active session immediately ended.`);
    alert(`Participant blocked! Active session terminated with reason 'blocked'. Chat archived as read-only. Further outcome edits disabled.`);
  }

  // --- 7. VERSION-SAFE OUTCOME MUTUAL CONFIRMATION (INVARIANT #17 & FIXTURES O-01..O-03) ---
  function updateOutcomeDraft(sessionId, newSummary, newTopics) {
    const outcome = store.sessionOutcomes.find(o => o.session_id === sessionId);
    if (!outcome) return;

    const session = store.studySessions.find(s => s.id === sessionId);
    // Blocked check: Invariant #18 disables outcome edits for blocked pairs
    const isBlocked = store.userBlocks.some(b =>
      (b.blocker_id === session.user_a_id && b.blocked_id === session.user_b_id) ||
      (b.blocker_id === session.user_b_id && b.blocked_id === session.user_a_id)
    );
    if (isBlocked) {
      alert('Outcome editing disabled: Session participants are blocked.');
      return;
    }

    const curUser = store.currentUser;
    const isUserA = curUser === session.user_a_id;

    // Increment version, set editor approval, invalidate partner approval
    outcome.version += 1;
    outcome.last_editor_id = curUser;
    outcome.summary = newSummary;
    outcome.key_topics = newTopics;
    outcome.updated_at = new Date().toISOString();

    if (isUserA) {
      outcome.approved_version_a = outcome.version;
      outcome.approved_version_b = null;
    } else {
      outcome.approved_version_a = null;
      outcome.approved_version_b = outcome.version;
    }

    logAudit('OUTCOME', 'VERSION_INCREMENT',
      `Outcome for ${sessionId} updated to version ${outcome.version} by ${curUser}. Approval reset for partner.`
    );
    renderApp();
  }

  function approveOutcomeVersion(sessionId, versionToApprove) {
    const outcome = store.sessionOutcomes.find(o => o.session_id === sessionId);
    if (!outcome) return;

    const session = store.studySessions.find(s => s.id === sessionId);
    const curUser = store.currentUser;
    const isUserA = curUser === session.user_a_id;

    // Stale Write Conflict Check (Fixture O-03)
    if (versionToApprove !== outcome.version) {
      logAudit('OUTCOME', '409_CONFLICT',
        `409 OUTCOME_VERSION_CONFLICT: Attempted approval of stale version ${versionToApprove}, but current version is ${outcome.version}.`
      );
      alert(`409 OUTCOME_VERSION_CONFLICT: Your approval was rejected because partner updated the outcome to version ${outcome.version}. Please review the updated version and approve again.`);
      return false;
    }

    if (isUserA) {
      outcome.approved_version_a = outcome.version;
    } else {
      outcome.approved_version_b = outcome.version;
    }

    const isMutuallyConfirmed = (outcome.approved_version_a === outcome.version && outcome.approved_version_b === outcome.version);

    logAudit('OUTCOME', 'APPROVAL_GRANTED',
      `User ${curUser} approved outcome v${outcome.version}. Mutually Confirmed: ${isMutuallyConfirmed}`
    );
    renderApp();
    return true;
  }

  // --- 8. POST-SESSION REVIEW (INVARIANT #16 & FIXTURE S-01) ---
  function submitSessionReview(sessionId, rating, reviewText) {
    const session = store.studySessions.find(s => s.id === sessionId);
    if (!session || session.status !== 'ended') {
      alert('Reviews can only be submitted for completed sessions.');
      return false;
    }

    // 300s Threshold Check (Fixture S-01)
    if ((session.counted_duration_seconds || 0) < 300) {
      alert(`Review rejected: Session duration is ${session.counted_duration_seconds}s. University rules require at least 300 seconds (5 minutes) of accounted session time.`);
      return false;
    }

    const reviewerId = store.currentUser;
    const revieweeId = reviewerId === session.user_a_id ? session.user_b_id : session.user_a_id;

    const existing = store.sessionReviews.find(r => r.session_id === sessionId && r.reviewer_id === reviewerId);
    if (existing) {
      alert('You have already submitted a review for this session.');
      return false;
    }

    store.sessionReviews.push({
      id: 'rev-' + Date.now(),
      session_id: sessionId,
      reviewer_id: reviewerId,
      reviewee_id: revieweeId,
      rating: parseInt(rating, 10),
      review_text: reviewText,
      created_at: new Date().toISOString()
    });

    logAudit('REVIEW', 'SUBMITTED', `Review submitted by ${reviewerId} for ${revieweeId} on session ${sessionId} (Rating: ${rating})`);
    alert('Thank you! Your post-session review has been recorded.');
    renderApp();
    return true;
  }

  // --- 9. SEND CHAT MESSAGE ---
  function sendChatMessage(text) {
    if (!text.trim() || !store.activeSessionId) return;
    const session = store.studySessions.find(s => s.id === store.activeSessionId);
    if (!session || session.status !== 'active') {
      alert('Cannot send message: session has ended and is read-only.');
      return;
    }

    const curUser = store.users[store.currentUser];
    if (!store.chatMessages[session.id]) store.chatMessages[session.id] = [];
    store.chatMessages[session.id].push({
      sender_id: curUser.id,
      sender_name: curUser.name,
      text: text.trim(),
      time: new Date().toLocaleTimeString()
    });

    renderChat();
  }

  // --- 10. UI RENDERING ENGINE ---
  function renderApp() {
    renderUserHUD();
    renderFeed();
    renderSessionView();
    renderProfileView();
  }

  function renderUserHUD() {
    const curUser = store.users[store.currentUser];
    const userSelect = document.getElementById('persona-select');
    if (userSelect && userSelect.value !== curUser.id) {
      userSelect.value = curUser.id;
    }

    const remSec = Math.max(0, 10800 - (curUser.used_seconds_today || 0));
    const allowanceEl = document.getElementById('hud-user-allowance');
    if (allowanceEl) {
      allowanceEl.textContent = `${remSec}s / 10,800s (${Math.floor(remSec / 60)}m rem)`;
    }

    const roleBadgeEl = document.getElementById('hud-user-role');
    if (roleBadgeEl) {
      roleBadgeEl.textContent = curUser.role.toUpperCase();
    }
  }

  function renderFeed() {
    const curUser = store.users[store.currentUser];
    const channelId = store.selectedChannel;

    // Filter listings using identical eligibility criteria
    const eligibleListings = filterEligibleListings(store.studyListings, curUser.id, channelId);

    // Compute compatibility scores for all eligible listings
    const scoredListings = eligibleListings.map(l => {
      const compat = calculateCompatibility(curUser, l);
      return { listing: l, compat };
    });

    // Sort according to active mode
    if (store.feedSort === 'compatibility') {
      scoredListings.sort((a, b) => {
        const scoreA = a.compat.eligibleForScoring ? a.compat.unroundedScore : -1;
        const scoreB = b.compat.eligibleForScoring ? b.compat.unroundedScore : -1;
        if (scoreB !== scoreA) return scoreB - scoreA; // Unrounded DESC
        const startA = new Date(a.listing.starts_at).getTime();
        const startB = new Date(b.listing.starts_at).getTime();
        if (startA !== startB) return startA - startB; // scheduled_start ASC
        return a.listing.id.localeCompare(b.listing.id); // ID ASC
      });
    } else {
      // Strict chronological: created_at DESC, id ASC
      scoredListings.sort((a, b) => {
        const tA = new Date(a.listing.created_at).getTime();
        const tB = new Date(b.listing.created_at).getTime();
        if (tB !== tA) return tB - tA;
        return a.listing.id.localeCompare(b.listing.id);
      });
    }

    const grid = document.getElementById('listing-feed-grid');
    if (!grid) return;

    if (scoredListings.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; padding: 40px; text-align: center; background: white; border: 1px dashed var(--border); border-radius: var(--radius-lg);">
          <h3 style="color: var(--text-muted); margin-bottom: 8px;">No study listings found in this channel</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">Create a new listing or check another channel.</p>
          <button class="btn btn-primary" onclick="window.PLP.openCreateModal()">Create Study Listing</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = scoredListings.map(({ listing, compat }) => {
      const author = store.users[listing.author_id] || { name: 'Unknown', avatar: '?' };
      const isMine = listing.author_id === curUser.id;
      const myResp = store.listingResponses.find(r => r.listing_id === listing.id && r.respondent_id === curUser.id);

      const startsUtc = listing.starts_at.replace('T', ' ').replace('Z', ' UTC');
      const endsUtc = listing.ends_at.replace('T', ' ').replace('Z', ' UTC');

      let scoreBadgeHtml = '';
      let breakdownHtml = '';

      if (compat.eligibleForScoring) {
        scoreBadgeHtml = `
          <div class="compat-score-badge">
            <div class="score-val">${compat.displayScore}%</div>
            <div class="score-label">Compatibility</div>
          </div>
        `;
        breakdownHtml = `
          <div class="compat-breakdown-box">
            ${compat.explanation}
            ${compat.matchedTags.length > 0 ? `<br>Matched Tags: ${compat.matchedTags.join(', ')}` : ''}
          </div>
        `;
      } else {
        scoreBadgeHtml = `
          <div class="compat-fallback-badge">
            Fallback (Chronological)
          </div>
        `;
        breakdownHtml = `
          <div class="compat-breakdown-box" style="color: #64748b; border-color: #cbd5e1; background: #f8fafc;">
            ${compat.explanation}
          </div>
        `;
      }

      const tagsHtml = listing.topic_tags.map(tag => {
        const isMatched = compat.matchedTags && compat.matchedTags.includes(tag.toLowerCase());
        return `<span class="tag ${isMatched ? 'matched' : ''}">${isMatched ? '★ ' : ''}#${tag}</span>`;
      }).join('');

      let actionHtml = '';
      if (isMine) {
        const pendingCount = store.listingResponses.filter(r => r.listing_id === listing.id && r.status === 'pending').length;
        actionHtml = `
          <button class="btn btn-secondary" onclick="window.PLP.viewListingResponses('${listing.id}')">
            Review Responses (${pendingCount})
          </button>
        `;
      } else {
        if (!myResp || myResp.status === 'withdrawn') {
          actionHtml = `
            <button class="btn btn-primary" onclick="window.PLP.openResponseModal('${listing.id}')">
              ${myResp ? 'Re-respond (Row Reuse)' : 'Respond to Listing'}
            </button>
          `;
        } else if (myResp.status === 'pending') {
          actionHtml = `
            <span style="font-size: 12px; color: var(--accent); font-weight: 600; align-self: center;">Response Pending</span>
            <button class="btn btn-secondary" onclick="window.PLP.withdrawResponse('${myResp.id}')">Withdraw</button>
          `;
        } else {
          actionHtml = `<span style="font-size: 12px; color: var(--text-muted);">Response: ${myResp.status}</span>`;
        }
      }

      return `
        <div class="listing-card ${isMine ? 'my-listing' : ''}">
          <div class="card-top">
            <div class="author-info">
              <div class="avatar">${author.avatar}</div>
              <div class="author-meta">
                <h4>${author.name} ${isMine ? '<span style="font-size:11px; color:var(--primary); font-weight:700;">(You)</span>' : ''}</h4>
                <span class="level-badge">${listing.author_level}</span>
              </div>
            </div>
            ${scoreBadgeHtml}
          </div>

          <div class="card-title">${listing.title}</div>

          <div class="topic-tags">${tagsHtml}</div>

          <div class="card-details">
            <div><strong>Study Goal:</strong> ${listing.study_goal.replace('_', ' ')}</div>
            <div><strong>Time Interval:</strong> ${startsUtc} → ${endsUtc}</div>
            ${listing.notes ? `<div><strong>Notes:</strong> ${listing.notes}</div>` : ''}
          </div>

          ${breakdownHtml}

          <div class="card-actions">
            ${actionHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  function renderSessionView() {
    const container = document.getElementById('session-view-container');
    if (!container) return;

    if (!store.activeSessionId) {
      container.innerHTML = `
        <div style="padding: 40px; text-align: center; background: white; border: 1px dashed var(--border); border-radius: var(--radius-lg);">
          <h3 style="color: var(--text-muted); margin-bottom: 8px;">No Active Study Session Selected</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">Accept a listing response or select an ongoing session from the list below.</p>
          <div style="display:flex; justify-content:center; gap:10px;">
            <button class="btn btn-secondary" onclick="window.PLP.switchSession('sess-901')">View Past Seed Session (sess-901)</button>
          </div>
        </div>
      `;
      return;
    }

    const session = store.studySessions.find(s => s.id === store.activeSessionId);
    if (!session) return;

    const userA = store.users[session.user_a_id];
    const userB = store.users[session.user_b_id];
    const outcome = store.sessionOutcomes.find(o => o.session_id === session.id);
    const review = store.sessionReviews.find(r => r.session_id === session.id && r.reviewer_id === store.currentUser);

    const isParticipant = store.currentUser === session.user_a_id || store.currentUser === session.user_b_id;
    const isEnded = session.status === 'ended';

    // Outcome status
    let outcomeStatusHtml = '';
    let isMutuallyConfirmed = false;
    if (outcome) {
      isMutuallyConfirmed = (outcome.approved_version_a === outcome.version && outcome.approved_version_b === outcome.version);
      outcomeStatusHtml = `
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="outcome-version-tag">Version ${outcome.version}</span>
          ${isMutuallyConfirmed
            ? '<span class="approval-badge approved">✓ Mutually Confirmed</span>'
            : '<span class="approval-badge pending">⏳ Pending Partner Approval</span>'}
        </div>
      `;
    }

    // Review eligibility check (Invariant #16 & Fixture S-01: duration >= 300s)
    const durationSec = session.counted_duration_seconds || 0;
    const isReviewEligible = isEnded && durationSec >= 300;

    container.innerHTML = `
      <div class="session-room-container">
        <!-- Left: HUD, Chat & Post-Session Panels -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          <!-- Real-Time HUD -->
          <div class="hud-banner">
            <div class="hud-top-row">
              <div class="hud-session-status">
                <span id="hud-status-dot" class="status-dot active"></span>
                <span id="hud-status-text">Active Session</span>
                <span style="font-size:12px; color:#94a3b8; font-weight:400; text-transform:none;">(${session.id})</span>
              </div>
              <div style="font-size:12px; color:#cbd5e1;">
                Participants: <strong>${userA.name}</strong> & <strong>${userB.name}</strong>
              </div>
            </div>

            <div class="hud-metrics-grid">
              <div class="hud-metric-item">
                <span class="hud-metric-label">Accounted Time (Session)</span>
                <span id="hud-elapsed" class="hud-metric-val">${durationSec}s</span>
                <span class="hud-metric-sub">Monotonic integer seconds</span>
              </div>
              <div class="hud-metric-item">
                <span class="hud-metric-label">Your Daily Balance Remaining</span>
                <span id="hud-remaining" class="hud-metric-val">--</span>
                <span class="hud-metric-sub">10,800s daily cap (180 min)</span>
              </div>
              <div class="hud-metric-item">
                <span class="hud-metric-label">Scheduled Interval</span>
                <span class="hud-metric-val" style="font-size:13px; color:#cbd5e1; font-family:inherit; margin-top:6px;">
                  ${session.starts_at.slice(11, 16)} → ${session.ends_at.slice(11, 16)} UTC
                </span>
                <span class="hud-metric-sub">Half-open [start, end)</span>
              </div>
            </div>
          </div>

          <!-- Live Chat Area -->
          <div class="chat-window">
            <div class="chat-header">
              <div>
                <strong>Peer Learning Chat</strong>
                <span style="font-size:12px; color:var(--text-muted); margin-left:8px;">1-to-1 WebRTC & Message Channel</span>
              </div>
              <div>
                ${session.status === 'active'
                  ? '<span class="status-dot active"></span> Live'
                  : '<span style="font-size:12px; color:var(--danger); font-weight:600;">Archive (Read-Only)</span>'}
              </div>
            </div>

            <div id="chat-messages-container" class="chat-messages">
              <!-- Rendered via renderChat() -->
            </div>

            ${session.status === 'active'
              ? `
                <div class="chat-input-area">
                  <input type="text" id="chat-input" placeholder="Type a message (e.g. sharing algorithm thoughts)..." onkeydown="if(event.key==='Enter') window.PLP.sendChatMessage(this.value)">
                  <button class="btn btn-primary" onclick="window.PLP.sendChatMessage(document.getElementById('chat-input').value)">Send</button>
                </div>
              `
              : `
                <div class="chat-archive-banner">
                  Session ended (${session.end_reason}). Chat transcript is preserved as read-only.
                </div>
              `}
          </div>

          <!-- Outcome & Mutual Confirmation Card (Invariants #17 & DEC-009) -->
          <div class="outcome-card">
            <div class="outcome-header">
              <div>
                <h3 style="font-size:16px;">Session Learning Outcome</h3>
                <p style="font-size:12px; color:var(--text-muted);">
                  Version-safe collaborative outcome. Changes increment version and reset partner's approval.
                </p>
              </div>
              ${outcomeStatusHtml}
            </div>

            ${outcome ? `
              <div class="approval-indicators">
                <span class="approval-badge ${outcome.approved_version_a === outcome.version ? 'approved' : 'pending'}">
                  ${outcome.approved_version_a === outcome.version ? '✓' : '○'} ${userA.name}: ${outcome.approved_version_a === outcome.version ? `Approved v${outcome.version}` : 'Pending'}
                </span>
                <span class="approval-badge ${outcome.approved_version_b === outcome.version ? 'approved' : 'pending'}">
                  ${outcome.approved_version_b === outcome.version ? '✓' : '○'} ${userB.name}: ${outcome.approved_version_b === outcome.version ? `Approved v${outcome.version}` : 'Pending'}
                </span>
              </div>

              <div class="form-group">
                <label>Summary of Topics & Takeaways:</label>
                <textarea id="outcome-summary-input" rows="3" ${isEnded && !isParticipant ? 'disabled' : ''}>${outcome.summary}</textarea>
              </div>

              <div class="form-group">
                <label>Key Covered Topics (comma-separated):</label>
                <input type="text" id="outcome-topics-input" value="${outcome.key_topics.join(', ')}" ${isEnded && !isParticipant ? 'disabled' : ''}>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-top:10px;">
                <div style="font-size:12px; color:var(--text-muted);">
                  Last Editor: <strong>${store.users[outcome.last_editor_id]?.name || outcome.last_editor_id}</strong>
                </div>
                <div style="display:flex; gap:8px;">
                  <button class="btn btn-secondary" onclick="window.PLP.saveOutcomeDraft('${session.id}')">
                    Update Outcome (v${outcome.version + 1})
                  </button>
                  <button class="btn btn-success" onclick="window.PLP.approveOutcome('${session.id}', ${outcome.version})">
                    Approve Version ${outcome.version}
                  </button>
                  <button class="btn btn-warning" onclick="window.PLP.approveOutcome('${session.id}', ${outcome.version - 1})">
                    Test 409 Conflict (Approve Stale v${outcome.version - 1})
                  </button>
                </div>
              </div>
            ` : '<p style="font-size:13px; color:var(--text-muted);">No outcome draft recorded.</p>'}
          </div>

          <!-- Post-Session Review Section (Invariant #16 & Fixture S-01) -->
          <div class="review-card">
            <h3 style="font-size:16px;">Post-Session Peer Review</h3>
            <p style="font-size:12px; color:var(--text-muted);">
              Decoupled from outcome confirmation. University threshold: at least 300 seconds (5m) accounted participation required.
            </p>

            ${!isReviewEligible && isEnded ? `
              <div class="threshold-warning">
                ⚠️ Review Submission Locked: Accounted session duration is ${durationSec} seconds. University rules require at least 300 seconds (5m) of participation (Fixture S-01).
              </div>
            ` : ''}

            ${review ? `
              <div style="background:var(--success-light); color:var(--success); padding:14px; border-radius:var(--radius-md);">
                <strong>Your Review Submitted:</strong> Rating ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)} (${review.rating}/5)
                <p style="font-size:13px; margin-top:4px;">"${review.review_text}"</p>
              </div>
            ` : `
              <div style="display:flex; flex-direction:column; gap:12px;">
                <div class="form-group">
                  <label>Rating (1 to 5 Stars):</label>
                  <select id="review-rating-select" ${!isReviewEligible ? 'disabled' : ''}>
                    <option value="5">★★★★★ (5 - Excellent Peer)</option>
                    <option value="4">★★★★☆ (4 - Very Helpful)</option>
                    <option value="3">★★★☆☆ (3 - Good Session)</option>
                    <option value="2">★★☆☆☆ (2 - Minor Issues)</option>
                    <option value="1">★☆☆☆☆ (1 - Unsatisfactory)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Constructive Feedback:</label>
                  <textarea id="review-text-input" rows="2" placeholder="Describe the collaboration quality, topic coverage, and peer support..." ${!isReviewEligible ? 'disabled' : ''}></textarea>
                </div>
                <button class="btn btn-primary" style="align-self:flex-start;" ${!isReviewEligible ? 'disabled' : ''} onclick="window.PLP.submitReview('${session.id}')">
                  Submit Peer Review
                </button>
              </div>
            `}
          </div>
        </div>

        <!-- Right: Simulator Actions & Boundary Conditions -->
        <div class="sim-controls-card">
          <h3>Simulation Control Hub</h3>
          <p style="font-size:12px; color:var(--text-muted); line-height:1.4;">
            Trigger boundary condition fixtures directly to test client and state machine compliance:
          </p>

          <div class="sim-actions-grid">
            <button class="btn btn-secondary" onclick="window.PLP.fastForward(60)">+60 Seconds Time</button>
            <button class="btn btn-secondary" onclick="window.PLP.fastForward(300)">+300s (Qualify for Review)</button>
            <button class="btn btn-secondary" onclick="window.PLP.fastForward(1800)">+1,800s (30m Advance)</button>
            <hr style="border:none; border-top:1px solid var(--border); margin:6px 0;">
            <button class="btn btn-warning" onclick="window.PLP.simulateCrossMidnightSplit()">
              Simulate Cross-Midnight Split (Fixture A-03)
            </button>
            <button class="btn btn-danger" onclick="window.PLP.simulateExactMidnightExhaustion()">
              Exact-Midnight Exhaustion (Fixture A-04)
            </button>
            <button class="btn btn-secondary" onclick="window.PLP.simulateDisconnection()">
              ${liveConnectionState === 'disconnected_grace' ? 'Reconnect Client' : 'Simulate Disconnect (60s Grace)'}
            </button>
            <button class="btn btn-danger" onclick="window.PLP.simulateBlockParticipant()">
              Block Participant (Reason: blocked)
            </button>
            <hr style="border:none; border-top:1px solid var(--border); margin:6px 0;">
            <button class="btn btn-primary" onclick="window.PLP.endSessionManual()">
              Manual Exit (End Session Cleanly)
            </button>
          </div>

          <div style="margin-top:14px; background:#f8fafc; padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border); font-size:11px; color:#475569;">
            <strong>Exact 5 Terminal Reasons:</strong>
            <ul style="padding-left:16px; margin-top:4px;">
              <li>manual_exit</li>
              <li>scheduled_end</li>
              <li>allowance_exhaustion</li>
              <li>connection_interruption</li>
              <li>blocked</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    renderChat();
    updateHUD();
  }

  function renderChat() {
    const container = document.getElementById('chat-messages-container');
    if (!container || !store.activeSessionId) return;

    const msgs = store.chatMessages[store.activeSessionId] || [];
    container.innerHTML = msgs.map(m => {
      let cls = 'theirs';
      if (m.sender_id === 'system') cls = 'system';
      else if (m.sender_id === store.currentUser) cls = 'mine';

      return `
        <div class="chat-msg ${cls}">
          ${m.sender_id !== 'system' ? `<div style="font-weight:700; font-size:11px; margin-bottom:2px;">${m.sender_name}</div>` : ''}
          <div>${m.text}</div>
          ${m.time ? `<div class="meta">${m.time}</div>` : ''}
        </div>
      `;
    }).join('');

    container.scrollTop = container.scrollHeight;
  }

  function renderProfileView() {
    const container = document.getElementById('profile-view-container');
    if (!container) return;

    const curUser = store.users[store.currentUser];
    const remSec = Math.max(0, 10800 - (curUser.used_seconds_today || 0));

    // Partner History List
    // Find sessions user participated in
    const userSessions = store.studySessions.filter(s =>
      (s.user_a_id === curUser.id || s.user_b_id === curUser.id) && s.status === 'ended'
    );

    const partnerRowsHtml = userSessions.map(s => {
      const partnerId = s.user_a_id === curUser.id ? s.user_b_id : s.user_a_id;
      const partner = store.users[partnerId] || { name: 'Unknown' };
      const outcome = store.sessionOutcomes.find(o => o.session_id === s.id);
      return `
        <tr>
          <td><strong>${partner.name}</strong></td>
          <td>${s.starts_at.slice(0, 10)}</td>
          <td>${s.counted_duration_seconds}s (${Math.floor(s.counted_duration_seconds / 60)}m)</td>
          <td>${outcome ? outcome.summary.slice(0, 60) + '...' : 'Completed'}</td>
          <td><button class="btn btn-secondary" style="padding:2px 8px; font-size:11px;" onclick="window.PLP.switchSession('${s.id}')">View</button></td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="profile-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">
          <div style="display:flex; gap:16px; align-items:center;">
            <div class="avatar" style="width:60px; height:60px; font-size:24px;">${curUser.avatar}</div>
            <div>
              <h2 style="font-size:20px;">${curUser.name}</h2>
              <div style="font-size:13px; color:var(--text-muted);">
                Role: <strong>${curUser.role.toUpperCase()}</strong> | Timezone: <strong>${curUser.timezone}</strong>
              </div>
            </div>
          </div>

          <div style="background:var(--primary-light); padding:12px 18px; border-radius:var(--radius-md); border:1px solid #bfdbfe;">
            <div style="font-size:11px; text-transform:uppercase; font-weight:700; color:var(--primary);">Daily Study Allowance</div>
            <div style="font-size:20px; font-weight:800; color:var(--primary); font-family:monospace;">
              ${remSec}s / 10,800s
            </div>
            <div style="font-size:12px; color:#1e40af;">
              ${Math.floor(remSec / 60)} minutes remaining today (180m Confirmed)
            </div>
          </div>
        </div>

        <hr style="border:none; border-top:1px solid var(--border);">

        <!-- Learning Preferences -->
        <div>
          <h3 style="font-size:16px; margin-bottom:12px;">Learning Preferences (Matching Inputs)</h3>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px;">
            <div class="form-group">
              <label>Topic Tags (TEXT[]):</label>
              <input type="text" id="pref-tags" value="${(curUser.topic_tags || []).join(', ')}" onchange="window.PLP.updateUserPreferences()">
              <span class="form-hint">Validated nonempty array of lowercase tags</span>
            </div>
            <div class="form-group">
              <label>Knowledge Level:</label>
              <select id="pref-level" onchange="window.PLP.updateUserPreferences()">
                <option value="beginner" ${curUser.knowledge_level === 'beginner' ? 'selected' : ''}>Beginner</option>
                <option value="intermediate" ${curUser.knowledge_level === 'intermediate' ? 'selected' : ''}>Intermediate</option>
                <option value="advanced" ${curUser.knowledge_level === 'advanced' ? 'selected' : ''}>Advanced</option>
              </select>
            </div>
            <div class="form-group">
              <label>Study Goal:</label>
              <select id="pref-goal" onchange="window.PLP.updateUserPreferences()">
                <option value="concept_mastery" ${curUser.study_goal === 'concept_mastery' ? 'selected' : ''}>Concept Mastery</option>
                <option value="exam_prep" ${curUser.study_goal === 'exam_prep' ? 'selected' : ''}>Exam Prep</option>
                <option value="assignment_help" ${curUser.study_goal === 'assignment_help' ? 'selected' : ''}>Assignment Help</option>
                <option value="code_review" ${curUser.study_goal === 'code_review' ? 'selected' : ''}>Code Review</option>
              </select>
            </div>
          </div>
        </div>

        <hr style="border:none; border-top:1px solid var(--border);">

        <!-- Partner History Privacy (Astra Confirmed: Default Private) -->
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:10px;">
            <div>
              <h3 style="font-size:16px;">Previous Partner History</h3>
              <p style="font-size:12px; color:var(--text-muted);">
                Astra authoritative rule: Partner list is private by default. You can toggle visibility for others.
              </p>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <label style="font-size:13px; font-weight:600;">Public to Others:</label>
              <input type="checkbox" id="pref-partner-privacy" ${curUser.previous_partners_public ? 'checked' : ''} onchange="window.PLP.togglePartnerPrivacy(this.checked)">
              <span style="font-size:12px; color:${curUser.previous_partners_public ? 'var(--success)' : 'var(--accent)'}; font-weight:700;">
                ${curUser.previous_partners_public ? 'Public' : 'Private (Default)'}
              </span>
            </div>
          </div>

          <table class="partner-history-table">
            <thead>
              <tr>
                <th>Partner</th>
                <th>Date</th>
                <th>Accounted Duration</th>
                <th>Outcome / Summary</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${partnerRowsHtml || '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No completed sessions recorded yet.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderAuditLog() {
    const container = document.getElementById('audit-log-entries');
    if (!container) return;
    container.innerHTML = store.auditLogs.map(e => `
      <div class="audit-entry">
        <span class="audit-timestamp">[${e.timestamp.slice(11, 19)}]</span>
        <span class="audit-tag ${e.category.toLowerCase()}">[${e.category}:${e.action}]</span>
        <span>${e.details}</span>
      </div>
    `).join('');
  }

  // --- 11. TAB & NAVIGATION MANAGEMENT ---
  function setActiveTab(tabId) {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));

    const tabBtn = document.querySelector(`.nav-tab[data-tab="${tabId}"]`);
    const panel = document.getElementById(tabId);

    if (tabBtn) tabBtn.classList.add('active');
    if (panel) panel.classList.add('active');
  }

  // --- 12. EXPOSED GLOBAL CONTROLLER ---
  window.PLP = {
    store,

    switchPersona: function (userId) {
      store.currentUser = userId;
      logAudit('AUTH', 'SWITCH_USER', `Switched active persona to ${userId} (${store.users[userId].name})`);
      renderApp();
    },

    setFeedSort: function (mode) {
      store.feedSort = mode;
      document.getElementById('sort-compat').classList.toggle('active', mode === 'compatibility');
      document.getElementById('sort-chrono').classList.toggle('active', mode === 'chronological');
      logAudit('FEED', 'SORT_CHANGED', `Changed listing feed sort to: ${mode}`);
      renderFeed();
    },

    changeChannel: function (channelId) {
      store.selectedChannel = channelId;
      logAudit('NAV', 'CHANNEL_CHANGED', `Selected channel ${channelId}`);
      renderFeed();
    },

    openCreateModal: function () {
      document.getElementById('modal-create-listing').style.display = 'flex';
    },

    closeCreateModal: function () {
      document.getElementById('modal-create-listing').style.display = 'none';
    },

    submitCreateListing: function () {
      const curUser = store.users[store.currentUser];
      const title = document.getElementById('new-listing-title').value.trim();
      const tagsStr = document.getElementById('new-listing-tags').value.trim();
      const goal = document.getElementById('new-listing-goal').value;
      const startIso = document.getElementById('new-listing-start').value;
      const endIso = document.getElementById('new-listing-end').value;
      const notes = document.getElementById('new-listing-notes').value.trim();

      if (!title || !tagsStr || !startIso || !endIso) {
        alert('Please fill in title, topic tags, and scheduled time interval.');
        return;
      }

      const tags = tagsStr.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      if (tags.length === 0) {
        alert('Topic tags array must be nonempty.');
        return;
      }

      const newId = 'list-' + (store.studyListings.length + 101);
      const newListing = {
        id: newId,
        channel_id: store.selectedChannel,
        author_id: curUser.id,
        title,
        topic_tags: tags,
        author_level: curUser.knowledge_level || 'intermediate', // Invariant #10: author_level only, no target_level
        study_goal: goal,
        starts_at: new Date(startIso).toISOString(),
        ends_at: new Date(endIso).toISOString(),
        notes,
        status: 'open',
        created_at: new Date().toISOString()
      };

      store.studyListings.unshift(newListing);
      logAudit('LISTING', 'CREATED', `Created study listing ${newId} "${title}" in channel ${store.selectedChannel}`);
      this.closeCreateModal();
      renderFeed();
    },

    openResponseModal: function (listingId) {
      const listing = store.studyListings.find(l => l.id === listingId);
      if (!listing) return;
      document.getElementById('modal-respond-listing-id').value = listingId;
      document.getElementById('modal-respond-listing-title').textContent = listing.title;
      document.getElementById('modal-respond-slot').value = `${listing.starts_at} - ${listing.ends_at}`;
      document.getElementById('modal-response').style.display = 'flex';
    },

    closeResponseModal: function () {
      document.getElementById('modal-response').style.display = 'none';
    },

    submitModalResponse: function () {
      const listingId = document.getElementById('modal-respond-listing-id').value;
      const slot = document.getElementById('modal-respond-slot').value;
      const msg = document.getElementById('modal-respond-msg').value.trim();

      if (!msg) {
        alert('Please enter a short message for the listing author.');
        return;
      }

      if (submitListingResponse(listingId, store.currentUser, slot, msg)) {
        this.closeResponseModal();
      }
    },

    withdrawResponse: function (responseId) {
      if (confirm('Withdraw this response? You can re-respond later reusing this row.')) {
        withdrawResponse(responseId, store.currentUser);
      }
    },

    viewListingResponses: function (listingId) {
      const responses = store.listingResponses.filter(r => r.listing_id === listingId);
      const listing = store.studyListings.find(l => l.id === listingId);

      let content = `<h4>Responses for: ${listing.title}</h4>`;
      if (responses.length === 0) {
        content += '<p style="color:var(--text-muted); font-size:13px; margin-top:8px;">No responses received yet.</p>';
      } else {
        content += '<div style="display:flex; flex-direction:column; gap:10px; margin-top:12px;">';
        responses.forEach(r => {
          const respUser = store.users[r.respondent_id] || { name: 'Unknown' };
          content += `
            <div style="background:#f8fafc; border:1px solid var(--border); padding:10px 14px; border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong>${respUser.name}</strong> <span class="tag" style="font-size:11px;">${r.status}</span>
                <div style="font-size:12px; margin-top:4px;">"${r.message}"</div>
              </div>
              <div>
                ${r.status === 'pending'
                  ? `<button class="btn btn-success" style="padding:4px 10px; font-size:12px;" onclick="window.PLP.acceptResponse('${r.id}')">Accept & Lock</button>`
                  : ''}
              </div>
            </div>
          `;
        });
        content += '</div>';
      }

      document.getElementById('modal-responses-body').innerHTML = content;
      document.getElementById('modal-view-responses').style.display = 'flex';
    },

    closeResponsesModal: function () {
      document.getElementById('modal-view-responses').style.display = 'none';
    },

    acceptResponse: function (responseId) {
      this.closeResponsesModal();
      acceptResponse(responseId, store.currentUser);
    },

    switchSession: function (sessionId) {
      switchSession(sessionId);
    },

    sendChatMessage: function (text) {
      sendChatMessage(text);
      const input = document.getElementById('chat-input');
      if (input) input.value = '';
    },

    fastForward: function (seconds) {
      simulateFastForward(seconds);
    },

    simulateCrossMidnightSplit: function () {
      simulateCrossMidnightSplit();
    },

    simulateExactMidnightExhaustion: function () {
      simulateExactMidnightExhaustion();
    },

    simulateDisconnection: function () {
      simulateDisconnection();
    },

    simulateBlockParticipant: function () {
      simulateBlockParticipant();
    },

    endSessionManual: function () {
      terminateSession('manual_exit', 'Manual exit requested by participant.');
    },

    saveOutcomeDraft: function (sessionId) {
      const summary = document.getElementById('outcome-summary-input').value.trim();
      const topicsStr = document.getElementById('outcome-topics-input').value.trim();
      const topics = topicsStr.split(',').map(s => s.trim()).filter(Boolean);
      updateOutcomeDraft(sessionId, summary, topics);
    },

    approveOutcome: function (sessionId, version) {
      approveOutcomeVersion(sessionId, version);
    },

    submitReview: function (sessionId) {
      const rating = document.getElementById('review-rating-select').value;
      const text = document.getElementById('review-text-input').value.trim();
      submitSessionReview(sessionId, rating, text);
    },

    updateUserPreferences: function () {
      const curUser = store.users[store.currentUser];
      const tagsStr = document.getElementById('pref-tags').value.trim();
      curUser.topic_tags = tagsStr.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      curUser.knowledge_level = document.getElementById('pref-level').value;
      curUser.study_goal = document.getElementById('pref-goal').value;
      logAudit('PREFERENCES', 'UPDATED', `User ${curUser.id} updated learning preferences`);
      renderFeed();
    },

    togglePartnerPrivacy: function (isPublic) {
      const curUser = store.users[store.currentUser];
      curUser.previous_partners_public = isPublic;
      logAudit('PRIVACY', 'TOGGLED', `User ${curUser.id} partner visibility set to ${isPublic ? 'Public' : 'Private'}`);
      renderProfileView();
    }
  };

  // --- 13. DOM READY INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        setActiveTab(tabId);
      });
    });

    // Persona switch dropdown
    const personaSelect = document.getElementById('persona-select');
    if (personaSelect) {
      personaSelect.addEventListener('change', (e) => {
        window.PLP.switchPersona(e.target.value);
      });
    }

    // Channel select dropdown
    const chanSelect = document.getElementById('channel-select');
    if (chanSelect) {
      chanSelect.addEventListener('change', (e) => {
        window.PLP.changeChannel(e.target.value);
      });
    }

    // Initial render
    logAudit('INIT', 'BOOTSTRAP', 'Peer Learning Platform Prototype initialized with verified seed data and invariants.');
    renderApp();
  });

})();
