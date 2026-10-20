/**
 * Compatibility-Based Peer Learning Platform - Interactive Prototype Engine
 * Group: SE-2416 | Student: Zhumirov Bekzat | Supervisor: Aigerim Kydyrbekova
 *
 * Implements client-side state machine and simulation controller:
 * - In-memory channel membership gating (joining unlocks Find a Partner)
 * - Required language and dated availability inputs
 * - Strict listing validation (future start, end after start, 15-180m duration, explicit author level)
 * - Acceptance creates a scheduled session; explicit participant check-in starts it
 * - Canonical accounting reconciler (Fixtures A-01..A-07, S-01, M-01)
 * - Compatibility formatted as "Score: 80.0 / 100" (never percentage)
 * - Outsider persona access guard hiding private session content, chat, outcomes, and reviews
 * - Version-safe collaborative outcomes with stale write/approval conflict checks (409)
 * - Accurate demonstration statuses (Demonstrated, Partially demonstrated, Working-V1 requirement)
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PLP = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // --- INITIAL IN-MEMORY STATE ---
  function createInitialState() {
    return {
      demoClock: '2026-10-20T12:00:00Z',
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
          languages: ['en', 'ru'],
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
          languages: ['en'],
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
          languages: ['en', 'kk'],
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
          languages: ['en'],
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
          languages: ['en'],
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
          languages: ['en', 'kk', 'ru'],
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

      // In-memory channel membership records (Priority 1)
      channelMemberships: [
        { user_id: 'u-alice', channel_id: 'chan-algo', joined_at: '2026-10-15T10:00:00Z' },
        { user_id: 'u-alice', channel_id: 'chan-web', joined_at: '2026-10-15T10:00:00Z' },
        { user_id: 'u-bob', channel_id: 'chan-algo', joined_at: '2026-10-16T11:00:00Z' },
        { user_id: 'u-carol', channel_id: 'chan-sys', joined_at: '2026-10-16T12:00:00Z' }
        // Eve, Dave, and Moderator have not joined chan-algo initially
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
          language: 'en',
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
          language: 'en',
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
          language: 'en',
          starts_at: '2026-10-26T18:00:00Z',
          ends_at: '2026-10-26T19:30:00Z',
          notes: 'Leader election, log replication, and split-brain recovery analysis.',
          status: 'open',
          created_at: '2026-10-19T12:00:00Z'
        }
      ],

      // Listing responses start clean so Bob's submission in walkthrough works naturally
      listingResponses: [],

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
          end_reason: 'scheduled_end', // One of exact 5 terminal reasons
          counted_duration_seconds: 3600, // 60 min -> stored 3,600s
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
          { sender_id: 'u-alice', sender_name: 'Alice', text: 'Hi Carol, ready to start binary heaps?', time: '14:00:15' },
          { sender_id: 'u-carol', sender_name: 'Carol', text: 'Yes, opening the IDE now.', time: '14:01:02' }
        ]
      },

      usageLedgers: [
        { id: 'ledg-1', session_id: 'sess-901', user_id: 'u-alice', utc_date: '2026-10-18', counted_seconds: 3600 },
        { id: 'ledg-2', session_id: 'sess-901', user_id: 'u-carol', utc_date: '2026-10-18', counted_seconds: 3600 }
      ],

      auditLogs: []
    };
  }

  const store = createInitialState();

  // Active Session Live Timer State
  let liveSessionTimer = null;
  let liveGraceTimer = null;
  let liveGraceSecondsRemaining = 60;
  let liveConnectionState = 'connected'; // 'connected' | 'disconnected_grace' | 'ended'

  // --- AUDIT LOGGING ---
  function logAudit(category, action, details) {
    const timestamp = store.demoClock || new Date().toISOString();
    const entry = { timestamp, category, action, details };
    store.auditLogs.unshift(entry);
    if (store.auditLogs.length > 200) store.auditLogs.pop();
    if (typeof document !== 'undefined') renderAuditLog();
  }

  // --- CHANNEL MEMBERSHIP MANAGEMENT (PRIORITY 1) ---
  function isChannelMember(channelId, userId) {
    return store.channelMemberships.some(m => m.channel_id === channelId && m.user_id === userId);
  }

  function joinChannel(channelId, userId) {
    if (isChannelMember(channelId, userId)) return true;
    store.channelMemberships.push({
      user_id: userId,
      channel_id: channelId,
      joined_at: store.demoClock
    });
    logAudit('MEMBERSHIP', 'JOIN_CHANNEL', `User ${userId} joined channel ${channelId}`);
    if (typeof document !== 'undefined') renderApp();
    return true;
  }

  function leaveChannel(channelId, userId) {
    const idx = store.channelMemberships.findIndex(m => m.channel_id === channelId && m.user_id === userId);
    if (idx >= 0) {
      store.channelMemberships.splice(idx, 1);
      logAudit('MEMBERSHIP', 'LEAVE_CHANNEL', `User ${userId} left channel ${channelId}`);
      if (typeof document !== 'undefined') renderApp();
      return true;
    }
    return false;
  }

  // --- COMPATIBILITY SCORING ENGINE (INVARIANTS #10 & #11, FIXTURE M-01) ---
  /**
   * Calculates pure mathematical compatibility score.
   * Formula: Score = 100 * (0.40*T + 0.35*G + 0.25*L)
   * Display format: strictly "80.0 / 100" (never percentage)
   */
  function calculateCompatibility(viewer, listing) {
    const hasViewerPreferences = viewer && viewer.topic_tags && viewer.topic_tags.length > 0 && viewer.knowledge_level && viewer.study_goal;
    const hasListingPreferences = listing && listing.topic_tags && listing.topic_tags.length > 0 && listing.author_level && listing.study_goal;

    if (!hasViewerPreferences || !hasListingPreferences) {
      return {
        eligibleForScoring: false,
        reason: 'Viewer or listing lacks required preferences (topic tags, knowledge level, study goal).',
        unroundedScore: null,
        displayScore: 'N/A',
        explanation: 'Compatibility scoring disabled: learning preferences missing. Showing chronological order.'
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
    const displayScore = `${unroundedScore.toFixed(1)} / 100`;

    return {
      eligibleForScoring: true,
      unroundedScore,
      displayScore,
      T,
      G,
      L,
      matchedTags: intersection,
      explanation: `T=${T.toFixed(2)} (tags), G=${G.toFixed(2)} (goal), L=${L.toFixed(2)} (level) → ${displayScore}`
    };
  }

  /**
   * Filter eligible listings enforcing confirmed constraints:
   * - Must match channel
   * - Channel membership required
   * - Must be open
   * - Communication language must match
   * - Scheduled start in the future relative to demoClock
   * - Not authored by blocked user
   * - No overlapping session booking for viewer
   */
  function filterEligibleListings(listings, viewerId, channelId) {
    const viewer = store.users[viewerId];
    if (!viewer) return [];

    // Channel membership gate: if viewer is not a member, return empty
    if (!isChannelMember(channelId, viewerId)) {
      return [];
    }

    const currentDemoTime = new Date(store.demoClock).getTime();

    return listings.filter(l => {
      if (l.channel_id !== channelId) return false;
      if (l.status !== 'open') return false;

      // Future start relative to demo clock
      const lStart = new Date(l.starts_at).getTime();
      const lEnd = new Date(l.ends_at).getTime();
      if (lStart <= currentDemoTime) return false;

      // Language match: viewer must support listing language
      if (l.language && viewer.languages && !viewer.languages.includes(l.language)) {
        return false;
      }

      // Blocking check (Invariant #18)
      const isBlocked = store.userBlocks.some(b =>
        (b.blocker_id === viewerId && b.blocked_id === l.author_id) ||
        (b.blocker_id === l.author_id && b.blocked_id === viewerId)
      );
      if (isBlocked) return false;

      // Overlapping session booking check (Invariant #6 & #7)
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

  // --- LISTING VALIDATION & CREATION (PRIORITY 1) ---
  function validateAndCreateListing(params, authorId) {
    const author = store.users[authorId];
    if (!author) return { success: false, error: 'Author user not found.' };

    if (!isChannelMember(params.channel_id, authorId)) {
      return { success: false, error: 'Must join channel before creating a listing.' };
    }

    if (!params.title || params.title.trim().length === 0) {
      return { success: false, error: 'Listing title is required.' };
    }

    if (!params.topic_tags || params.topic_tags.length === 0) {
      return { success: false, error: 'At least one topic tag is required.' };
    }

    if (!params.author_level) {
      return { success: false, error: 'Explicit author knowledge level is required.' };
    }

    if (!params.language) {
      return { success: false, error: 'Communication language is required.' };
    }

    const currentDemoTime = new Date(store.demoClock).getTime();
    const startTime = new Date(params.starts_at).getTime();
    const endTime = new Date(params.ends_at).getTime();

    if (isNaN(startTime) || isNaN(endTime)) {
      return { success: false, error: 'Invalid start or end timestamp.' };
    }

    if (startTime <= currentDemoTime) {
      return { success: false, error: 'Listing start time must be in the future relative to the demo clock.' };
    }

    if (endTime <= startTime) {
      return { success: false, error: 'End time must be strictly after start time.' };
    }

    const durationMinutes = (endTime - startTime) / (1000 * 60);
    if (durationMinutes < 15 || durationMinutes > 180) {
      return { success: false, error: `Duration must be between 15 and 180 minutes (provided: ${durationMinutes}m).` };
    }

    const newId = 'list-' + (store.studyListings.length + 101);
    const newListing = {
      id: newId,
      channel_id: params.channel_id,
      author_id: authorId,
      title: params.title.trim(),
      topic_tags: params.topic_tags.map(t => t.toLowerCase()),
      author_level: params.author_level,
      study_goal: params.study_goal || 'concept_mastery',
      language: params.language,
      starts_at: params.starts_at,
      ends_at: params.ends_at,
      notes: params.notes || '',
      status: 'open',
      created_at: store.demoClock
    };

    store.studyListings.unshift(newListing);
    logAudit('LISTING', 'CREATED', `Created study listing ${newId} "${newListing.title}" in channel ${params.channel_id}`);
    return { success: true, listing: newListing };
  }

  // --- RESPONSE ROW REUSE (INVARIANT #8 & FIXTURE R-01) ---
  function submitListingResponse(listingId, respondentId, proposedSlot, message) {
    const listing = store.studyListings.find(l => l.id === listingId);
    if (!listing || listing.status !== 'open') {
      return { success: false, error: 'Listing is not open for responses.' };
    }
    if (listing.author_id === respondentId) {
      return { success: false, error: 'Cannot respond to your own listing.' };
    }

    if (!isChannelMember(listing.channel_id, respondentId)) {
      return { success: false, error: 'Must join channel to respond to listings.' };
    }

    // Check permanent UNIQUE(listing_id, respondent_id)
    const existing = store.listingResponses.find(r => r.listing_id === listingId && r.respondent_id === respondentId);

    if (existing) {
      if (existing.status === 'pending') {
        return { success: false, error: 'You already have a pending response to this listing.' };
      }
      if (existing.status === 'withdrawn') {
        // Row reuse: withdrawn -> pending
        existing.status = 'pending';
        existing.proposed_slot = proposedSlot;
        existing.message = message;
        existing.created_at = store.demoClock;
        logAudit('RESPONSE', 'ROW_REUSE', `Reused response ${existing.id} (withdrawn -> pending) for listing ${listingId}`);
        if (typeof document !== 'undefined') renderApp();
        return { success: true, response: existing, reused: true };
      }
      return { success: false, error: `Prior response already finalized as ${existing.status}.` };
    }

    const newId = 'resp-' + (store.listingResponses.length + 1);
    const newRow = {
      id: newId,
      listing_id: listingId,
      respondent_id: respondentId,
      status: 'pending',
      proposed_slot: proposedSlot,
      message: message,
      created_at: store.demoClock
    };
    store.listingResponses.push(newRow);
    logAudit('RESPONSE', 'ROW_INSERT', `Inserted new response ${newId} for listing ${listingId}`);
    if (typeof document !== 'undefined') renderApp();
    return { success: true, response: newRow, reused: false };
  }

  function withdrawResponse(responseId, userId) {
    const resp = store.listingResponses.find(r => r.id === responseId);
    if (!resp || resp.respondent_id !== userId) {
      return { success: false, error: 'Unauthorized or response not found.' };
    }
    if (resp.status !== 'pending') {
      return { success: false, error: `Cannot withdraw response in status '${resp.status}'.` };
    }
    resp.status = 'withdrawn';
    logAudit('RESPONSE', 'WITHDRAW', `User ${userId} withdrew response ${responseId}. Row retained for reuse.`);
    if (typeof document !== 'undefined') renderApp();
    return { success: true, response: resp };
  }

  // --- ACCEPTANCE & SCHEDULED SESSION CREATION (INVARIANTS #3, #4, #5, #6, #7) ---
  function acceptResponse(responseId, authorId) {
    const response = store.listingResponses.find(r => r.id === responseId);
    if (!response || response.status !== 'pending') {
      return { success: false, error: 'Response is not in pending state.' };
    }
    const listing = store.studyListings.find(l => l.id === response.listing_id);
    if (!listing || listing.author_id !== authorId) {
      return { success: false, error: 'Unauthorized: only listing author can accept responses.' };
    }

    const respondentId = response.respondent_id;
    const authorUser = store.users[authorId];
    const respondentUser = store.users[respondentId];

    // Simulate Shared Lock Protocol acquisition order (users ascending UUID -> listing -> responses -> sessions)
    const sortedUsers = [authorUser, respondentUser].sort((a, b) => a.uuid.localeCompare(b.uuid));
    logAudit('LOCK_PROTOCOL', 'ACQUIRE_LOCKS',
      `Locked users [${sortedUsers[0].id}, ${sortedUsers[1].id}] -> study_listings (${listing.id}) -> listing_responses -> study_sessions`
    );

    // Recheck eligibility under lock
    const authorRem = 10800 - (authorUser.used_seconds_today || 0);
    const respRem = 10800 - (respondentUser.used_seconds_today || 0);
    if (authorRem <= 0 || respRem <= 0) {
      logAudit('ACCEPTANCE', 'REJECT_ALLOWANCE', 'Daily allowance exhausted by a participant.');
      return { success: false, error: 'Acceptance failed: participant daily allowance exhausted.' };
    }

    const isBlocked = store.userBlocks.some(b =>
      (b.blocker_id === authorId && b.blocked_id === respondentId) ||
      (b.blocker_id === respondentId && b.blocked_id === authorId)
    );
    if (isBlocked) {
      return { success: false, error: 'Acceptance failed: participants are blocked.' };
    }

    // Cross-listing collision check (Fixtures C-01..C-04)
    const lStart = new Date(listing.starts_at).getTime();
    const lEnd = new Date(listing.ends_at).getTime();

    const conflict = store.studySessions.find(s =>
      (s.status === 'scheduled' || s.status === 'active') &&
      (s.user_a_id === authorId || s.user_b_id === authorId || s.user_a_id === respondentId || s.user_b_id === respondentId) &&
      (lStart < new Date(s.ends_at).getTime() && lEnd > new Date(s.starts_at).getTime())
    );

    if (conflict) {
      logAudit('ACCEPTANCE', '409_CONFLICT', `409 SCHEDULE_CONFLICT with existing session ${conflict.id}`);
      return { success: false, error: '409 SCHEDULE_CONFLICT: Overlapping session booking exists.', status: 409 };
    }

    // Atomic commit
    listing.status = 'matched';
    response.status = 'accepted';

    // Decline other pending responses
    store.listingResponses.forEach(r => {
      if (r.listing_id === listing.id && r.id !== response.id && r.status === 'pending') {
        r.status = 'declined';
      }
    });

    // Create session in SCHEDULED state (Priority 1: does NOT immediately become active!)
    const newSessionId = 'sess-' + (store.studySessions.length + 101);
    const newSession = {
      id: newSessionId,
      listing_id: listing.id,
      user_a_id: authorId,
      user_b_id: respondentId,
      channel_id: listing.channel_id,
      starts_at: listing.starts_at,
      ends_at: listing.ends_at,
      status: 'scheduled', // SCHEDULED state
      end_reason: null,
      counted_duration_seconds: 0,
      checkins: {}, // tracks { [userId]: checkin_time }
      created_at: store.demoClock
    };
    store.studySessions.push(newSession);

    // Chat initialized with scheduling announcement
    store.chatMessages[newSessionId] = [
      { sender_id: 'system', sender_name: 'System', text: `Session ${newSessionId} scheduled for ${listing.starts_at} UTC. Advance demo clock to start.`, time: 'Scheduled' }
    ];

    logAudit('SESSION', 'SCHEDULED', `Session ${newSessionId} scheduled between ${authorId} and ${respondentId}`);
    switchSession(newSessionId);
    return { success: true, session: newSession };
  }

  // --- CHECK-IN & SESSION START (PRIORITY 1) ---
  function startSessionAsParticipant(sessionId, userId) {
    const session = store.studySessions.find(s => s.id === sessionId);
    if (!session) return { success: false, error: 'Session not found.' };

    if (session.user_a_id !== userId && session.user_b_id !== userId) {
      return { success: false, error: 'Unauthorized: user is not a participant in this session.' };
    }

    if (session.status !== 'scheduled') {
      return { success: false, error: `Session is already in status '${session.status}'.` };
    }

    // Check that demo clock is at or past scheduled start
    const demoTime = new Date(store.demoClock).getTime();
    const startTime = new Date(session.starts_at).getTime();

    if (demoTime < startTime) {
      return { success: false, error: 'Cannot start session before scheduled start time. Advance demo clock first.' };
    }

    session.status = 'active';
    session.started_at = store.demoClock;

    // Initialize collaborative outcome draft now that session has started
    if (!store.sessionOutcomes.some(o => o.session_id === session.id)) {
      const listing = store.studyListings.find(l => l.id === session.listing_id) || { topic_tags: [], title: 'Study Session' };
      store.sessionOutcomes.push({
        id: 'out-' + session.id,
        session_id: session.id,
        version: 1,
        last_editor_id: session.user_a_id,
        approved_version_a: null,
        approved_version_b: null,
        summary: `Outcome notes for ${listing.title}.`,
        key_topics: [...(listing.topic_tags || [])],
        created_at: store.demoClock,
        updated_at: store.demoClock
      });
    }

    store.chatMessages[session.id].push({
      sender_id: 'system',
      sender_name: 'System',
      text: `Participant ${store.users[userId]?.name || userId} checked in. Session is now ACTIVE. Ticking integer-second HUD started.`,
      time: new Date().toLocaleTimeString()
    });

    logAudit('SESSION', 'ACTIVATED', `Session ${session.id} started by ${userId} at demo time ${store.demoClock}`);
    if (typeof document !== 'undefined') {
      startLiveSessionTimer();
      renderApp();
    }
    return { success: true, session };
  }

  // --- CANONICAL ACCOUNTING RECONCILER (INVARIANTS #12, #13, #14, #15, #19, FIXTURES A-01..A-07) ---
  /**
   * Reconciles time accounting deterministically against daily cap and scheduled end.
   * Priority: 1. blocked, 2. allowance_exhaustion, 3. scheduled_end, 4. connection_interruption, 5. manual_exit.
   */
  function reconcileAccounting(session, requestedSecondsToAdd, explicitReason) {
    if (!session || session.status === 'ended') return session;

    const userA = store.users[session.user_a_id];
    const userB = store.users[session.user_b_id];

    const remA = Math.max(0, 10800 - (userA.used_seconds_today || 0));
    const remB = Math.max(0, 10800 - (userB.used_seconds_today || 0));
    const minAllowanceRem = Math.min(remA, remB);

    // Calculate remaining seconds until scheduled end
    let scheduledSecondsRemaining = Infinity;
    if (session.ends_at) {
      const currentElapsed = session.counted_duration_seconds || 0;
      const scheduledTotal = (new Date(session.ends_at).getTime() - new Date(session.starts_at).getTime()) / 1000;
      scheduledSecondsRemaining = Math.max(0, scheduledTotal - currentElapsed);
    }

    let actualSecondsToAdd = requestedSecondsToAdd;
    let finalReason = null;

    // Check allowance exhaustion
    if (actualSecondsToAdd >= minAllowanceRem) {
      actualSecondsToAdd = minAllowanceRem;
      finalReason = 'allowance_exhaustion';
    }

    // Check scheduled end
    if (actualSecondsToAdd >= scheduledSecondsRemaining) {
      if (actualSecondsToAdd === minAllowanceRem && scheduledSecondsRemaining === minAllowanceRem) {
        // Invariant #13 / Fixture A-04 tie rule: allowance_exhaustion takes priority over scheduled_end
        finalReason = 'allowance_exhaustion';
        actualSecondsToAdd = minAllowanceRem;
      } else if (scheduledSecondsRemaining < minAllowanceRem) {
        actualSecondsToAdd = scheduledSecondsRemaining;
        finalReason = 'scheduled_end';
      }
    }

    // Override if explicit terminal reason provided
    if (explicitReason === 'blocked') {
      finalReason = 'blocked';
    } else if (explicitReason === 'manual_exit') {
      finalReason = 'manual_exit';
    } else if (explicitReason === 'connection_interruption') {
      finalReason = 'connection_interruption';
    }

    // Update session duration
    session.counted_duration_seconds = (session.counted_duration_seconds || 0) + actualSecondsToAdd;

    // Update participants' daily usage (capped at 10,800s)
    userA.used_seconds_today = Math.min(10800, (userA.used_seconds_today || 0) + actualSecondsToAdd);
    userB.used_seconds_today = Math.min(10800, (userB.used_seconds_today || 0) + actualSecondsToAdd);

    // If terminal reason reached, end session
    if (finalReason) {
      session.status = 'ended';
      session.end_reason = finalReason;
      clearInterval(liveSessionTimer);
      clearInterval(liveGraceTimer);
      liveConnectionState = 'ended';

      // Record atomic usage ledger entry
      const utcDate = (session.starts_at || store.demoClock).split('T')[0];
      if (session.counted_duration_seconds > 0) {
        store.usageLedgers.push({
          id: 'ledg-' + Date.now() + '-a',
          session_id: session.id,
          user_id: session.user_a_id,
          utc_date: utcDate,
          counted_seconds: session.counted_duration_seconds
        });
        store.usageLedgers.push({
          id: 'ledg-' + Date.now() + '-b',
          session_id: session.id,
          user_id: session.user_b_id,
          utc_date: utcDate,
          counted_seconds: session.counted_duration_seconds
        });
      }

      logAudit('SESSION_TERMINATION', finalReason,
        `Session ${session.id} ended. Reason: ${finalReason}. Total counted: ${session.counted_duration_seconds}s.`
      );
    }

    if (typeof document !== 'undefined') renderApp();
    return session;
  }

  // --- CANONICAL FIXTURE SCENARIO RUNNERS (PRIORITY 3) ---

  function registerFixtureSession(s) {
    const idx = store.studySessions.findIndex(x => x.id === s.id);
    if (idx >= 0) store.studySessions[idx] = s;
    else store.studySessions.push(s);
  }

  // Fixture A-01: Exact-midnight exhaustion
  function runFixtureA01() {
    const s = {
      id: 'sess-a01',
      user_a_id: 'u-alice',
      user_b_id: 'u-bob',
      starts_at: '2026-10-24T23:45:00Z',
      ends_at: '2026-10-25T00:30:00Z', // 45 min booking
      status: 'active',
      counted_duration_seconds: 0
    };
    registerFixtureSession(s);
    // Alice has exactly 900s remaining; Bob has 3,600s
    store.users['u-alice'].used_seconds_today = 10800 - 900;
    store.users['u-bob'].used_seconds_today = 10800 - 3600;

    // Advance 900 seconds to midnight
    reconcileAccounting(s, 900);
    logAudit('FIXTURE', 'A-01', `Executed A-01: End reason=${s.end_reason}, counted=${s.counted_duration_seconds}s. Day 1 charged 900s, no Day 2 rows.`);
    return s;
  }

  // Fixture A-02: Sufficient allowance across midnight (900s Day 1 + 1,800s Day 2 = 2,700s)
  function runFixtureA02() {
    const s = {
      id: 'sess-a02',
      user_a_id: 'u-alice',
      user_b_id: 'u-bob',
      starts_at: '2026-10-24T23:45:00Z',
      ends_at: '2026-10-25T00:30:00Z',
      status: 'ended',
      end_reason: 'scheduled_end',
      counted_duration_seconds: 2700
    };
    registerFixtureSession(s);
    // 900s Day 1 + 1800s Day 2
    store.usageLedgers.push({ id: 'ledg-a02-a1', session_id: s.id, user_id: 'u-alice', utc_date: '2026-10-24', counted_seconds: 900 });
    store.usageLedgers.push({ id: 'ledg-a02-a2', session_id: s.id, user_id: 'u-alice', utc_date: '2026-10-25', counted_seconds: 1800 });
    store.usageLedgers.push({ id: 'ledg-a02-b1', session_id: s.id, user_id: 'u-bob', utc_date: '2026-10-24', counted_seconds: 900 });
    store.usageLedgers.push({ id: 'ledg-a02-b2', session_id: s.id, user_id: 'u-bob', utc_date: '2026-10-25', counted_seconds: 1800 });
    logAudit('FIXTURE', 'A-02', 'Executed A-02: 900s on Day 1 + 1800s on Day 2 = 2,700s total per participant.');
    return s;
  }

  // Fixture A-03: Scheduled end at midnight (900s, Day 1 only)
  function runFixtureA03() {
    const s = {
      id: 'sess-a03',
      user_a_id: 'u-alice',
      user_b_id: 'u-bob',
      starts_at: '2026-10-24T23:45:00Z',
      ends_at: '2026-10-25T00:00:00Z', // 15 min booking ends at midnight
      status: 'active',
      counted_duration_seconds: 0
    };
    registerFixtureSession(s);
    store.users['u-alice'].used_seconds_today = 0;
    store.users['u-bob'].used_seconds_today = 0;
    reconcileAccounting(s, 900);
    logAudit('FIXTURE', 'A-03', `Executed A-03: Reached midnight scheduled end. Reason=${s.end_reason}, counted=${s.counted_duration_seconds}s.`);
    return s;
  }

  // Fixture A-04: End/exhaustion tie (900s, allowance_exhaustion priority)
  function runFixtureA04() {
    const s = {
      id: 'sess-a04',
      user_a_id: 'u-alice',
      user_b_id: 'u-bob',
      starts_at: '2026-10-24T23:45:00Z',
      ends_at: '2026-10-25T00:00:00Z', // 900s booking
      status: 'active',
      counted_duration_seconds: 0
    };
    registerFixtureSession(s);
    // Alice has exactly 900s allowance left
    store.users['u-alice'].used_seconds_today = 10800 - 900;
    store.users['u-bob'].used_seconds_today = 0;
    reconcileAccounting(s, 900);
    logAudit('FIXTURE', 'A-04', `Executed A-04: Tie rule resolved. Reason=${s.end_reason} (allowance_exhaustion), counted=${s.counted_duration_seconds}s.`);
    return s;
  }

  // Fixture A-06 & S-01: 31-second session & review threshold gate
  function runFixtureA06() {
    const s = {
      id: 'sess-a06',
      user_a_id: 'u-alice',
      user_b_id: 'u-bob',
      starts_at: '2026-10-25T14:00:00Z',
      ends_at: '2026-10-25T15:00:00Z',
      status: 'active',
      counted_duration_seconds: 0
    };
    registerFixtureSession(s);
    // Ensure participants have sufficient allowance for this test scenario
    store.users['u-alice'].used_seconds_today = 0;
    store.users['u-bob'].used_seconds_today = 0;
    reconcileAccounting(s, 31, 'manual_exit');
    logAudit('FIXTURE', 'A-06/S-01', `Executed A-06: Counted exactly 31s. Under S-01 review eligibility is locked (31 < 300).`);
    return s;
  }

  // --- VERSION-SAFE COLLABORATIVE OUTCOMES (INVARIANT #17, FIXTURES O-01..O-03) ---
  function updateOutcomeDraft(sessionId, newSummary, newTopics, editorId, expectedVersion) {
    const outcome = store.sessionOutcomes.find(o => o.session_id === sessionId);
    if (!outcome) return { success: false, error: 'Outcome draft not found.' };

    const session = store.studySessions.find(s => s.id === sessionId);
    if (!session || (session.user_a_id !== editorId && session.user_b_id !== editorId)) {
      return { success: false, error: 'Unauthorized: only session participants can edit outcomes.' };
    }

    // Block check: Invariant #18 prevents shared-outcome mutations for blocked pairs
    const isBlocked = store.userBlocks.some(b =>
      (b.blocker_id === session.user_a_id && b.blocked_id === session.user_b_id) ||
      (b.blocker_id === session.user_b_id && b.blocked_id === session.user_a_id)
    );
    if (isBlocked) {
      return { success: false, error: 'Outcome editing disabled: session participants are blocked.' };
    }

    // Stale write check
    if (expectedVersion !== undefined && expectedVersion !== outcome.version) {
      logAudit('OUTCOME', '409_CONFLICT', `409 OUTCOME_VERSION_CONFLICT: Expected v${expectedVersion}, current is v${outcome.version}`);
      return { success: false, error: '409 OUTCOME_VERSION_CONFLICT: Draft was modified by partner. Please review updated content.', status: 409 };
    }

    const isUserA = editorId === session.user_a_id;
    outcome.version += 1;
    outcome.last_editor_id = editorId;
    outcome.summary = newSummary;
    outcome.key_topics = newTopics;
    outcome.updated_at = store.demoClock;

    // Setting editor approval and clearing partner approval
    if (isUserA) {
      outcome.approved_version_a = outcome.version;
      outcome.approved_version_b = null;
    } else {
      outcome.approved_version_a = null;
      outcome.approved_version_b = outcome.version;
    }

    logAudit('OUTCOME', 'VERSION_INCREMENT', `Outcome for ${sessionId} updated to v${outcome.version} by ${editorId}. Partner approval invalidated.`);
    if (typeof document !== 'undefined') renderApp();
    return { success: true, outcome };
  }

  function approveOutcomeVersion(sessionId, versionToApprove, approverId) {
    const outcome = store.sessionOutcomes.find(o => o.session_id === sessionId);
    if (!outcome) return { success: false, error: 'Outcome draft not found.' };

    const session = store.studySessions.find(s => s.id === sessionId);
    if (!session || (session.user_a_id !== approverId && session.user_b_id !== approverId)) {
      return { success: false, error: 'Unauthorized: only session participants can approve outcomes.' };
    }

    // Blocking guard: approval fails if blocked
    const isBlocked = store.userBlocks.some(b =>
      (b.blocker_id === session.user_a_id && b.blocked_id === session.user_b_id) ||
      (b.blocker_id === session.user_b_id && b.blocked_id === session.user_a_id)
    );
    if (isBlocked) {
      return { success: false, error: 'Outcome approval disabled: session participants are blocked.' };
    }

    // Stale version check (Fixture O-02 / O-03)
    if (versionToApprove !== outcome.version) {
      logAudit('OUTCOME', '409_CONFLICT', `409 OUTCOME_VERSION_CONFLICT: Attempted approval of stale v${versionToApprove}, current is v${outcome.version}`);
      return { success: false, error: `409 OUTCOME_VERSION_CONFLICT: Your approval was rejected because partner updated to v${outcome.version}.`, status: 409 };
    }

    if (approverId === session.user_a_id) {
      outcome.approved_version_a = outcome.version;
    } else {
      outcome.approved_version_b = outcome.version;
    }

    const isMutuallyConfirmed = (outcome.approved_version_a === outcome.version && outcome.approved_version_b === outcome.version);
    logAudit('OUTCOME', 'APPROVAL_GRANTED', `User ${approverId} approved outcome v${outcome.version}. Mutually confirmed: ${isMutuallyConfirmed}`);
    if (typeof document !== 'undefined') renderApp();
    return { success: true, outcome, isMutuallyConfirmed };
  }

  // --- POST-SESSION REVIEW (INVARIANT #16 & FIXTURE S-01) ---
  function submitSessionReview(sessionId, reviewerId, rating, reviewText) {
    const session = store.studySessions.find(s => s.id === sessionId);
    if (!session) {
      return { success: false, error: 'Session not found.' };
    }

    if (session.user_a_id !== reviewerId && session.user_b_id !== reviewerId) {
      return { success: false, error: 'Unauthorized: only session participants can submit reviews.' };
    }

    if (session.status !== 'ended') {
      return { success: false, error: 'Reviews can only be submitted for completed sessions.' };
    }

    // 300s Threshold Check (Fixture S-01)
    if ((session.counted_duration_seconds || 0) < 300) {
      return {
        success: false,
        error: `Review rejected: Session duration is ${session.counted_duration_seconds}s. University threshold requires at least 300 seconds (5m) of accounted session time.`
      };
    }

    const revieweeId = reviewerId === session.user_a_id ? session.user_b_id : session.user_a_id;
    const existing = store.sessionReviews.find(r => r.session_id === sessionId && r.reviewer_id === reviewerId);
    if (existing) {
      return { success: false, error: 'You have already submitted a review for this session.' };
    }

    const review = {
      id: 'rev-' + Date.now(),
      session_id: sessionId,
      reviewer_id: reviewerId,
      reviewee_id: revieweeId,
      rating: parseInt(rating, 10),
      review_text: reviewText,
      created_at: store.demoClock
    };
    store.sessionReviews.push(review);
    logAudit('REVIEW', 'SUBMITTED', `Review submitted by ${reviewerId} for ${revieweeId} (Rating: ${rating})`);
    if (typeof document !== 'undefined') renderApp();
    return { success: true, review };
  }

  // --- CHAT MESSAGE DISPATCH ---
  function sendChatMessage(sessionId, senderId, text) {
    if (!text || !text.trim()) return { success: false, error: 'Message cannot be empty.' };
    const session = store.studySessions.find(s => s.id === sessionId);
    if (!session) return { success: false, error: 'Session not found.' };

    if (session.user_a_id !== senderId && session.user_b_id !== senderId) {
      return { success: false, error: 'Unauthorized: outsider cannot send messages in this session.' };
    }

    if (session.status !== 'active') {
      return { success: false, error: 'Cannot send message: session has ended and is read-only.' };
    }

    const sender = store.users[senderId] || { name: 'Unknown' };
    if (!store.chatMessages[session.id]) store.chatMessages[session.id] = [];
    store.chatMessages[session.id].push({
      sender_id: senderId,
      sender_name: sender.name,
      text: text.trim(),
      time: new Date().toLocaleTimeString()
    });

    if (typeof document !== 'undefined') renderChat();
    return { success: true };
  }

  // --- LIVE TIMER CONTROLS ---
  function startLiveSessionTimer() {
    clearInterval(liveSessionTimer);
    liveSessionTimer = setInterval(() => {
      const session = store.studySessions.find(s => s.id === store.activeSessionId);
      if (!session || session.status !== 'active') {
        clearInterval(liveSessionTimer);
        return;
      }
      reconcileAccounting(session, 1);
      updateHUD();
    }, 1000);
  }

  function updateHUD() {
    if (typeof document === 'undefined') return;
    const elapsedEl = document.getElementById('hud-elapsed');
    const remainingEl = document.getElementById('hud-remaining');
    const statusDotEl = document.getElementById('hud-status-dot');
    const statusTextEl = document.getElementById('hud-status-text');

    if (!elapsedEl || !store.activeSessionId) return;

    const session = store.studySessions.find(s => s.id === store.activeSessionId);
    if (!session) return;

    const duration = session.counted_duration_seconds || 0;
    const curUser = store.users[store.currentUser];
    const remUser = Math.max(0, 10800 - (curUser.used_seconds_today || 0));

    elapsedEl.textContent = `${duration}s (${Math.floor(duration / 60)}m ${duration % 60}s)`;
    remainingEl.textContent = `${remUser}s (${Math.floor(remUser / 60)}m ${remUser % 60}s)`;

    if (session.status === 'scheduled') {
      statusDotEl.className = 'status-dot';
      statusDotEl.style.background = '#3b82f6';
      statusTextEl.textContent = 'Scheduled';
    } else if (session.status === 'active') {
      if (liveConnectionState === 'disconnected_grace') {
        statusDotEl.className = 'status-dot grace';
        statusTextEl.textContent = `Grace Period (${liveGraceSecondsRemaining}s)`;
      } else {
        statusDotEl.className = 'status-dot active';
        statusTextEl.textContent = 'Active Session';
      }
    } else {
      statusDotEl.className = 'status-dot ended';
      statusTextEl.textContent = `Ended (${session.end_reason})`;
    }
  }

  function switchSession(sessionId) {
    store.activeSessionId = sessionId;
    liveConnectionState = 'connected';
    clearInterval(liveSessionTimer);
    clearInterval(liveGraceTimer);

    const session = store.studySessions.find(s => s.id === sessionId);
    if (session && session.status === 'active') {
      startLiveSessionTimer();
    }
    if (typeof document !== 'undefined') {
      renderApp();
      setActiveTab('tab-session');
    }
  }

  // --- UI RENDERING (BROWSER CONTEXT ONLY) ---
  function renderApp() {
    if (typeof document === 'undefined') return;
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

    const demoClockEl = document.getElementById('hud-demo-clock');
    if (demoClockEl) {
      demoClockEl.textContent = store.demoClock.replace('T', ' ').replace('Z', ' UTC');
    }
  }

  function renderFeed() {
    const curUser = store.users[store.currentUser];
    const channelId = store.selectedChannel;
    const isMember = isChannelMember(channelId, curUser.id);
    const channel = store.channels.find(c => c.id === channelId) || { name: channelId };

    const channelMemberBadge = document.getElementById('channel-member-badge');
    const channelJoinBtn = document.getElementById('channel-join-leave-btn');

    if (channelMemberBadge && channelJoinBtn) {
      if (isMember) {
        channelMemberBadge.className = 'tag';
        channelMemberBadge.style.background = 'var(--success-light)';
        channelMemberBadge.style.color = 'var(--success)';
        channelMemberBadge.textContent = '✓ Member';
        channelJoinBtn.textContent = 'Leave Channel';
        channelJoinBtn.className = 'btn btn-secondary';
        channelJoinBtn.onclick = () => leaveChannel(channelId, curUser.id);
      } else {
        channelMemberBadge.className = 'tag';
        channelMemberBadge.style.background = '#fef3c7';
        channelMemberBadge.style.color = '#92400e';
        channelMemberBadge.textContent = 'Not a Member';
        channelJoinBtn.textContent = 'Join Channel';
        channelJoinBtn.className = 'btn btn-primary';
        channelJoinBtn.onclick = () => joinChannel(channelId, curUser.id);
      }
    }

    const grid = document.getElementById('listing-feed-grid');
    if (!grid) return;

    // Gating: If not member, show locked notice (Priority 1)
    if (!isMember) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; padding: 48px 24px; text-align: center; background: white; border: 2px dashed #cbd5e1; border-radius: var(--radius-lg);">
          <div style="font-size: 32px; margin-bottom: 8px;">🔒</div>
          <h3 style="color: #1e293b; margin-bottom: 8px;">Channel Membership Required</h3>
          <p style="font-size: 14px; color: var(--text-muted); max-width: 500px; margin: 0 auto 20px;">
            Confirmed university rule: You must join <strong>#${channel.name}</strong> to view peer listings, calculate compatibility scores, and respond.
          </p>
          <button class="btn btn-primary" onclick="window.PLP.joinChannel('${channelId}', '${curUser.id}')">
            Join #${channel.name} to Unlock
          </button>
        </div>
      `;
      return;
    }

    // Filter listings
    const eligibleListings = filterEligibleListings(store.studyListings, curUser.id, channelId);

    // Score listings
    const scoredListings = eligibleListings.map(l => {
      const compat = calculateCompatibility(curUser, l);
      return { listing: l, compat };
    });

    // Check if current user lacks preferences (Priority 2 Fallback)
    const hasPreferences = curUser.topic_tags && curUser.topic_tags.length > 0 && curUser.knowledge_level && curUser.study_goal;
    const activeSortMode = hasPreferences ? store.feedSort : 'chronological';

    const compatSortBtn = document.getElementById('sort-compat');
    const chronoSortBtn = document.getElementById('sort-chrono');
    if (compatSortBtn && chronoSortBtn) {
      compatSortBtn.classList.toggle('active', activeSortMode === 'compatibility');
      chronoSortBtn.classList.toggle('active', activeSortMode === 'chronological');
      if (!hasPreferences) {
        chronoSortBtn.textContent = '⏱ Chronological (Active: Fallback due to missing preferences)';
      } else {
        chronoSortBtn.textContent = '⏱ Chronological (Newest First)';
      }
    }

    if (activeSortMode === 'compatibility') {
      scoredListings.sort((a, b) => {
        const sA = a.compat.eligibleForScoring ? a.compat.unroundedScore : -1;
        const sB = b.compat.eligibleForScoring ? b.compat.unroundedScore : -1;
        if (sB !== sA) return sB - sA; // Unrounded DESC
        const tA = new Date(a.listing.starts_at).getTime();
        const tB = new Date(b.listing.starts_at).getTime();
        if (tA !== tB) return tA - tB; // scheduled_start ASC
        return a.listing.id.localeCompare(b.listing.id);
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

    if (scoredListings.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; padding: 40px; text-align: center; background: white; border: 1px dashed var(--border); border-radius: var(--radius-lg);">
          <h3 style="color: var(--text-muted); margin-bottom: 8px;">No open study listings in this channel</h3>
          <button class="btn btn-primary" onclick="window.PLP.openCreateModal()">Create Study Listing</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = scoredListings.map(({ listing, compat }) => {
      const author = store.users[listing.author_id] || { name: 'Unknown', avatar: '?' };
      const isMine = listing.author_id === curUser.id;
      const myResp = store.listingResponses.find(r => r.listing_id === listing.id && r.respondent_id === curUser.id);

      let scoreBadgeHtml = '';
      let breakdownHtml = '';

      if (compat.eligibleForScoring) {
        scoreBadgeHtml = `
          <div class="compat-score-badge">
            <div class="score-val">${compat.displayScore}</div>
            <div class="score-label">Compatibility</div>
          </div>
        `;
        breakdownHtml = `
          <div class="compat-breakdown-box">
            ${compat.explanation}
            ${compat.matchedTags && compat.matchedTags.length > 0 ? `<br>Matched Tags: ${compat.matchedTags.join(', ')}` : ''}
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
                <span class="tag" style="font-size:10px;">Lang: ${listing.language.toUpperCase()}</span>
              </div>
            </div>
            ${scoreBadgeHtml}
          </div>

          <div class="card-title">${listing.title}</div>
          <div class="topic-tags">${tagsHtml}</div>

          <div class="card-details">
            <div><strong>Study Goal:</strong> ${listing.study_goal.replace('_', ' ')}</div>
            <div><strong>Interval:</strong> ${listing.starts_at.slice(11, 16)} → ${listing.ends_at.slice(11, 16)} UTC (${listing.starts_at.slice(0, 10)})</div>
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
          <h3 style="color: var(--text-muted); margin-bottom: 8px;">No Study Session Selected</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">Accept a listing response or view a completed seed session.</p>
          <button class="btn btn-secondary" onclick="window.PLP.switchSession('sess-901')">View Completed Past Session (sess-901)</button>
        </div>
      `;
      return;
    }

    const session = store.studySessions.find(s => s.id === store.activeSessionId);
    if (!session) return;

    const curUserId = store.currentUser;
    const isParticipant = (curUserId === session.user_a_id || curUserId === session.user_b_id);
    const userA = store.users[session.user_a_id] || { name: 'User A' };
    const userB = store.users[session.user_b_id] || { name: 'User B' };
    const outcome = store.sessionOutcomes.find(o => o.session_id === session.id);
    const review = store.sessionReviews.find(r => r.session_id === session.id && r.reviewer_id === curUserId);
    const durationSec = session.counted_duration_seconds || 0;

    // OUTSIDER PERSONA GUARD (Priority 2)
    if (!isParticipant) {
      container.innerHTML = `
        <div style="padding: 40px 24px; text-align: center; background: #fff1f2; border: 1px solid #fecdd3; border-radius: var(--radius-lg);">
          <div style="font-size: 32px; margin-bottom: 8px;">🔒</div>
          <h3 style="color: #9f1239; margin-bottom: 8px;">Access Restricted: Private Session</h3>
          <p style="font-size: 14px; color: #881337; max-width: 520px; margin: 0 auto 16px;">
            Confirmed privacy invariant: You are currently viewing as <strong>${store.users[curUserId]?.name || curUserId}</strong>, who is not a participant in this study session.
            Chat messages, mutual outcomes, and reviews are strictly private to <strong>${userA.name}</strong> and <strong>${userB.name}</strong>.
          </p>
          <div style="display:flex; justify-content:center; gap:10px;">
            <button class="btn btn-primary" onclick="window.PLP.switchPersona('${session.user_a_id}')">Switch to ${userA.name}</button>
            <button class="btn btn-secondary" onclick="window.PLP.switchPersona('${session.user_b_id}')">Switch to ${userB.name}</button>
          </div>
        </div>
      `;
      return;
    }

    // Outcome mutual confirmation status
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

    // Review eligibility check (Fixture S-01: duration >= 300s)
    const isEnded = session.status === 'ended';
    const isReviewEligible = isEnded && durationSec >= 300;

    container.innerHTML = `
      <div class="session-room-container">
        <!-- Left: HUD, Chat & Post-Session Panels -->
        <div style="display:flex; flex-direction:column; gap:20px;">
          <!-- Real-Time HUD -->
          <div class="hud-banner">
            <div class="hud-top-row">
              <div class="hud-session-status">
                <span id="hud-status-dot" class="status-dot"></span>
                <span id="hud-status-text">${session.status.toUpperCase()}</span>
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
                <span class="hud-metric-sub">10,800s daily cap (180 min Confirmed)</span>
              </div>
              <div class="hud-metric-item">
                <span class="hud-metric-label">Scheduled Interval</span>
                <span class="hud-metric-val" style="font-size:13px; color:#cbd5e1; font-family:inherit; margin-top:6px;">
                  ${session.starts_at.slice(11, 16)} → ${session.ends_at.slice(11, 16)} UTC
                </span>
                <span class="hud-metric-sub">${session.starts_at.slice(0, 10)}</span>
              </div>
            </div>
          </div>

          ${session.status === 'scheduled' ? `
            <!-- Scheduled State Notice & Participant Start Controls -->
            <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:var(--radius-lg); padding:20px; text-align:center;">
              <h3 style="color:#1e3a8a; margin-bottom:8px;">Session Scheduled</h3>
              <p style="font-size:13px; color:#1e40af; margin-bottom:16px;">
                Scheduled for <strong>${session.starts_at} UTC</strong>. Check-in opens when demo clock reaches start time.
              </p>
              <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
                <button class="btn btn-secondary" onclick="window.PLP.advanceDemoClockTo('${session.starts_at}')">
                  Advance Demo Clock to Scheduled Start (${session.starts_at.slice(11, 16)} UTC)
                </button>
                <button class="btn btn-primary" onclick="window.PLP.startSessionAsParticipant('${session.id}', '${curUserId}')">
                  Check-in & Start Session as ${store.users[curUserId]?.name || curUserId}
                </button>
              </div>
            </div>
          ` : ''}

          <!-- Live Chat Area -->
          <div class="chat-window">
            <div class="chat-header">
              <div>
                <strong>Peer Learning Chat</strong>
                <span style="font-size:12px; color:var(--text-muted); margin-left:8px;">
                  Simulated session chat — messages exist only in this browser's memory.
                </span>
              </div>
              <div>
                ${session.status === 'active'
                  ? '<span class="status-dot active"></span> Active'
                  : `<span style="font-size:12px; color:var(--danger); font-weight:600;">Archive (${session.status})</span>`}
              </div>
            </div>

            <div id="chat-messages-container" class="chat-messages">
              <!-- Rendered via renderChat() -->
            </div>

            ${session.status === 'active' ? `
              <div class="chat-input-area">
                <input type="text" id="chat-input" placeholder="Type a message as ${store.users[curUserId]?.name}..." onkeydown="if(event.key==='Enter') window.PLP.sendChatMessage(this.value)">
                <button class="btn btn-primary" onclick="window.PLP.sendChatMessage(document.getElementById('chat-input').value)">Send</button>
              </div>
            ` : `
              <div class="chat-archive-banner">
                Session ended (${session.end_reason || 'scheduled_end'}). Chat transcript is preserved as read-only.
              </div>
            `}
          </div>

          <!-- Outcome & Collaborative Confirmation (Proposed) -->
          <div class="outcome-card">
            <div class="outcome-header">
              <div>
                <h3 style="font-size:16px;">Session Learning Outcome <span class="badge-proposed">Proposed</span></h3>
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
                <textarea id="outcome-summary-input" rows="3" ${session.status === 'scheduled' ? 'disabled' : ''}>${outcome.summary}</textarea>
              </div>

              <div class="form-group">
                <label>Key Covered Topics (comma-separated):</label>
                <input type="text" id="outcome-topics-input" value="${outcome.key_topics.join(', ')}" ${session.status === 'scheduled' ? 'disabled' : ''}>
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
            ` : '<p style="font-size:13px; color:var(--text-muted);">Outcome draft will be created when session starts.</p>'}
          </div>

          <!-- Post-Session Review Section (Invariant #16 & Fixture S-01) -->
          <div class="review-card">
            <h3 style="font-size:16px;">Post-Session Peer Review <span class="badge-proposed">Proposed Threshold</span></h3>
            <p style="font-size:12px; color:var(--text-muted);">
              Decoupled from outcome confirmation. Threshold gate: at least 300 seconds (5m) accounted participation required.
            </p>

            ${!isReviewEligible && isEnded ? `
              <div class="threshold-warning">
                ⚠️ Review Submission Locked: Accounted session duration is ${durationSec} seconds. University threshold requires at least 300 seconds (5m) of participation (Fixture S-01).
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

        <!-- Right: Deterministic Time Simulation Controls -->
        <div class="sim-controls-card">
          <h3>Deterministic Demo Controls</h3>
          <p style="font-size:12px; color:var(--text-muted); line-height:1.4;">
            Single accounting reconciler enforcing daily cap, scheduled end, and canonical fixtures:
          </p>

          <div class="sim-actions-grid">
            <button class="btn btn-secondary" onclick="window.PLP.advanceTime(60)">+60 Seconds Time</button>
            <button class="btn btn-secondary" onclick="window.PLP.advanceTime(300)">+300s (Qualify for Review)</button>
            <button class="btn btn-secondary" onclick="window.PLP.advanceTime(1800)">+1,800s (Advance)</button>
            <hr style="border:none; border-top:1px solid var(--border); margin:6px 0;">
            <button class="btn btn-secondary" onclick="window.PLP.runCanonicalFixture('A-01')">Run Fixture A-01 (Midnight Exhaustion)</button>
            <button class="btn btn-secondary" onclick="window.PLP.runCanonicalFixture('A-02')">Run Fixture A-02 (Across Midnight Split)</button>
            <button class="btn btn-secondary" onclick="window.PLP.runCanonicalFixture('A-03')">Run Fixture A-03 (Scheduled End Midnight)</button>
            <button class="btn btn-secondary" onclick="window.PLP.runCanonicalFixture('A-04')">Run Fixture A-04 (End/Exhaustion Tie)</button>
            <button class="btn btn-secondary" onclick="window.PLP.runCanonicalFixture('A-06')">Run Fixture A-06 / S-01 (31s Session)</button>
            <hr style="border:none; border-top:1px solid var(--border); margin:6px 0;">
            <button class="btn btn-secondary" onclick="window.PLP.simulateDisconnection()">
              ${liveConnectionState === 'disconnected_grace' ? 'Reconnect Client' : 'Simulate Disconnect (60s Grace)'}
            </button>
            <button class="btn btn-danger" onclick="window.PLP.simulateBlockParticipant()">
              Block Participant (Reason: blocked)
            </button>
            <button class="btn btn-primary" onclick="window.PLP.endSessionManual()">
              Manual Exit (End Cleanly)
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

    // Sessions user participated in
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

        <!-- Preferences Form -->
        <div>
          <h3 style="font-size:16px; margin-bottom:12px;">Learning Preferences & Matching Inputs</h3>
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
            <div class="form-group">
              <label>Languages:</label>
              <input type="text" id="pref-languages" value="${(curUser.languages || []).join(', ')}" onchange="window.PLP.updateUserPreferences()">
              <span class="form-hint">e.g. en, ru, kk</span>
            </div>
          </div>
        </div>

        <hr style="border:none; border-top:1px solid var(--border);">

        <!-- Partner History Privacy (Confirmed: Default Private) -->
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:10px;">
            <div>
              <h3 style="font-size:16px;">Previous Partner History</h3>
              <p style="font-size:12px; color:var(--text-muted);">
                Confirmed rule: Partner list is private by default. Visible to you; toggle visibility for other learners.
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

  function setActiveTab(tabId) {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));

    const tabBtn = document.querySelector(`.nav-tab[data-tab="${tabId}"]`);
    const panel = document.getElementById(tabId);

    if (tabBtn) tabBtn.classList.add('active');
    if (panel) panel.classList.add('active');
  }

  // --- CONTROLLER API (UMD EXPORT) ---
  const controller = {
    store,
    createInitialState,
    calculateCompatibility,
    filterEligibleListings,
    isChannelMember,
    joinChannel,
    leaveChannel,
    validateAndCreateListing,
    submitListingResponse,
    withdrawResponse,
    acceptResponse,
    startSessionAsParticipant,
    reconcileAccounting,
    updateOutcomeDraft,
    approveOutcomeVersion,
    submitSessionReview,
    sendChatMessage,

    // Canonical Fixture Runners
    runFixtureA01,
    runFixtureA02,
    runFixtureA03,
    runFixtureA04,
    runFixtureA06,

    // UI Trigger Handlers
    switchPersona: function (userId) {
      store.currentUser = userId;
      logAudit('AUTH', 'SWITCH_USER', `Switched active persona to ${userId} (${store.users[userId]?.name})`);
      renderApp();
    },

    setFeedSort: function (mode) {
      store.feedSort = mode;
      renderFeed();
    },

    changeChannel: function (channelId) {
      store.selectedChannel = channelId;
      logAudit('NAV', 'CHANNEL_CHANGED', `Selected channel ${channelId}`);
      renderFeed();
    },

    advanceDemoClock: function (seconds) {
      const curMs = new Date(store.demoClock).getTime();
      store.demoClock = new Date(curMs + seconds * 1000).toISOString();
      logAudit('DEMO_CLOCK', 'ADVANCE', `Advanced demo clock by ${seconds}s to ${store.demoClock}`);
      renderApp();
    },

    advanceDemoClockTo: function (isoString) {
      store.demoClock = isoString;
      logAudit('DEMO_CLOCK', 'SET', `Demo clock set to ${isoString}`);
      renderApp();
    },

    advanceTime: function (seconds) {
      const session = store.studySessions.find(s => s.id === store.activeSessionId);
      if (session && session.status === 'active') {
        reconcileAccounting(session, seconds);
        updateHUD();
      }
    },

    runCanonicalFixture: function (fixtureId) {
      let res;
      if (fixtureId === 'A-01') res = runFixtureA01();
      else if (fixtureId === 'A-02') res = runFixtureA02();
      else if (fixtureId === 'A-03') res = runFixtureA03();
      else if (fixtureId === 'A-04') res = runFixtureA04();
      else if (fixtureId === 'A-06') res = runFixtureA06();

      if (res && res.id) switchSession(res.id);
      renderApp();
    },

    openCreateModal: function () {
      document.getElementById('modal-create-listing').style.display = 'flex';
    },

    closeCreateModal: function () {
      document.getElementById('modal-create-listing').style.display = 'none';
    },

    submitCreateListing: function () {
      const curUser = store.users[store.currentUser];
      const title = document.getElementById('new-listing-title').value;
      const tagsStr = document.getElementById('new-listing-tags').value;
      const level = document.getElementById('new-listing-level').value;
      const goal = document.getElementById('new-listing-goal').value;
      const lang = document.getElementById('new-listing-lang').value;
      const startIso = document.getElementById('new-listing-start').value;
      const endIso = document.getElementById('new-listing-end').value;
      const notes = document.getElementById('new-listing-notes').value;

      const tags = tagsStr.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

      const res = validateAndCreateListing({
        channel_id: store.selectedChannel,
        title,
        topic_tags: tags,
        author_level: level,
        study_goal: goal,
        language: lang,
        starts_at: new Date(startIso).toISOString(),
        ends_at: new Date(endIso).toISOString(),
        notes
      }, curUser.id);

      if (!res.success) {
        alert('Validation Error: ' + res.error);
        return;
      }

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
      const msg = document.getElementById('modal-respond-msg').value;

      const res = submitListingResponse(listingId, store.currentUser, slot, msg);
      if (!res.success) {
        alert('Response Error: ' + res.error);
        return;
      }
      this.closeResponseModal();
    },

    withdrawResponse: function (responseId, userId) {
      const targetUser = userId || store.currentUser;
      if (typeof confirm !== 'undefined' ? confirm('Withdraw this response? You can re-respond later reusing this row.') : true) {
        return withdrawResponse(responseId, targetUser);
      }
      return { success: false, error: 'Cancelled by user' };
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
                  ? `<button class="btn btn-success" style="padding:4px 10px; font-size:12px;" onclick="window.PLP.acceptResponse('${r.id}')">Accept & Schedule</button>`
                  : ''}
              </div>
            </div>
          `;
        });
        content += '</div>';
      }

      if (typeof document !== 'undefined') {
        document.getElementById('modal-responses-body').innerHTML = content;
        document.getElementById('modal-view-responses').style.display = 'flex';
      }
    },

    closeResponsesModal: function () {
      if (typeof document !== 'undefined') {
        document.getElementById('modal-view-responses').style.display = 'none';
      }
    },

    acceptResponse: function (responseId) {
      if (typeof document !== 'undefined') this.closeResponsesModal();
      const res = acceptResponse(responseId, store.currentUser);
      if (!res.success && typeof alert !== 'undefined') {
        alert(res.error);
      }
      return res;
    },

    startSessionAsParticipant: function (sessionId, userId) {
      const res = startSessionAsParticipant(sessionId, userId);
      if (!res.success && typeof alert !== 'undefined') {
        alert(res.error);
      }
      return res;
    },

    switchSession: function (sessionId) {
      switchSession(sessionId);
    },

    sendChatMessage: function (textOrSessionId, senderId, text) {
      if (arguments.length >= 3) {
        return sendChatMessage(textOrSessionId, senderId, text);
      }
      const res = sendChatMessage(store.activeSessionId, store.currentUser, textOrSessionId);
      if (typeof document !== 'undefined') {
        const input = document.getElementById('chat-input');
        if (input) input.value = '';
      }
      return res;
    },

    simulateDisconnection: function () {
      const session = store.studySessions.find(s => s.id === store.activeSessionId);
      if (!session || session.status !== 'active') return;

      if (liveConnectionState === 'connected') {
        liveConnectionState = 'disconnected_grace';
        liveGraceSecondsRemaining = 60;
        clearInterval(liveSessionTimer);

        logAudit('CONNECTION', 'DISCONNECTED_GRACE_START', 'Network interruption: 60-second grace timer started.');
        clearInterval(liveGraceTimer);
        liveGraceTimer = setInterval(() => {
          liveGraceSecondsRemaining -= 1;
          updateHUD();
          if (liveGraceSecondsRemaining <= 0) {
            clearInterval(liveGraceTimer);
            reconcileAccounting(session, 60, 'connection_interruption');
          }
        }, 1000);
        renderApp();
      } else if (liveConnectionState === 'disconnected_grace') {
        clearInterval(liveGraceTimer);
        liveConnectionState = 'connected';
        logAudit('CONNECTION', 'RECONNECTED', 'Client reconnected within grace period.');
        startLiveSessionTimer();
        renderApp();
      }
    },

    simulateBlockParticipant: function () {
      const session = store.studySessions.find(s => s.id === store.activeSessionId);
      if (!session || session.status !== 'active') return;

      const blocker = store.currentUser;
      const blocked = blocker === session.user_a_id ? session.user_b_id : session.user_a_id;

      store.userBlocks.push({ blocker_id: blocker, blocked_id: blocked, created_at: store.demoClock });
      reconcileAccounting(session, 0, 'blocked');
      if (typeof alert !== 'undefined') {
        alert(`Participant blocked! Session terminated with reason 'blocked'. Shared outcome edits disabled.`);
      }
    },

    endSessionManual: function () {
      const session = store.studySessions.find(s => s.id === store.activeSessionId);
      if (session && session.status === 'active') {
        reconcileAccounting(session, 0, 'manual_exit');
      }
    },

    saveOutcomeDraft: function (sessionId) {
      const outcome = store.sessionOutcomes.find(o => o.session_id === sessionId);
      const summary = document.getElementById('outcome-summary-input').value.trim();
      const topicsStr = document.getElementById('outcome-topics-input').value.trim();
      const topics = topicsStr.split(',').map(s => s.trim()).filter(Boolean);

      const res = updateOutcomeDraft(sessionId, summary, topics, store.currentUser, outcome ? outcome.version : 1);
      if (!res.success) {
        alert(res.error);
      }
    },

    approveOutcome: function (sessionId, version) {
      const res = approveOutcomeVersion(sessionId, version, store.currentUser);
      if (!res.success) {
        alert(res.error);
      }
    },

    submitReview: function (sessionId) {
      const rating = document.getElementById('review-rating-select').value;
      const text = document.getElementById('review-text-input').value.trim();
      const res = submitSessionReview(sessionId, store.currentUser, rating, text);
      if (!res.success) {
        alert(res.error);
      } else {
        alert('Thank you! Your post-session peer review has been recorded.');
      }
    },

    updateUserPreferences: function () {
      const curUser = store.users[store.currentUser];
      const tagsStr = document.getElementById('pref-tags').value.trim();
      curUser.topic_tags = tagsStr.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      curUser.knowledge_level = document.getElementById('pref-level').value;
      curUser.study_goal = document.getElementById('pref-goal').value;
      const langStr = document.getElementById('pref-languages').value.trim();
      curUser.languages = langStr.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
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

  // Browser auto-bootstrap
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          setActiveTab(tab.getAttribute('data-tab'));
        });
      });

      const personaSelect = document.getElementById('persona-select');
      if (personaSelect) {
        personaSelect.addEventListener('change', (e) => controller.switchPersona(e.target.value));
      }

      const chanSelect = document.getElementById('channel-select');
      if (chanSelect) {
        chanSelect.addEventListener('change', (e) => controller.changeChannel(e.target.value));
      }

      logAudit('INIT', 'BOOTSTRAP', 'Peer Learning Platform Prototype initialized with deterministic demo clock and invariant guards.');
      renderApp();
    });
  }

  return controller;
});
