# Astra Review Resolution Report (Batch 1–2 Revision)

## 1. Executive Summary & Review Audit

This document records the itemized corrections and audit resolutions implemented in response to the **Astra Analyst Review** of Batch 1–2 deliverables. All blocking findings (**B1 through B10**) and high/medium priority improvements have been addressed across project documentation.

> **Verification Notice**: The acceptance fixtures documented herein are **formal specification fixtures** designed to serve as test benchmarks. In accordance with truth-in-reporting rules, they are not claimed as passed automated software tests until executable test suites are built in Batch 7.

---

## 2. Itemized Correction Backlog & Resolution Register

| Finding ID | Affected Files | Astra Finding Summary | Correction Implemented | Supporting Example, Source, or Check | Status |
| :-: | :--- | :--- | :--- | :--- | :-: |
| **B1** | `requirements-spec.md` (FR-11, 12, 15), `session-lifecycle.md` §3.1, `project-decisions.md` (DEC-004), `project-scope.md` | Requirement classifications conflated. 180m daily cap, default-private partners, and mutual confirmation were labeled Proposed or mixed. | Split classifications explicitly: **Confirmed:** 180 total study min/day (FR-11), default-private previous partner list (FR-15), mutual topic confirmation (FR-12). **Proposed:** UTC reset boundary, 60s grace period, 5m review threshold, matching weights ($0.40, 0.35, 0.25$). | Rechecked against proposal context and university checklist. | **Fixed—awaiting review** |
| **B2** | `compatibility-rules.md` §3.1, §4; `requirements-spec.md` FR-02, FR-07 | Invented score $T = 0.50$ assigned for missing topic preferences, contradicting the edge-case rule against speculative scores. | Removed $T = 0.50$ baseline. Defined exact required inputs. If topic preferences are missing, compatibility scoring is suppressed with an inline preference prompt, falling back to chronological browsing. | Specification in `docs/compatibility-rules.md` §3.1; Fixture TF-05. | **Fixed—awaiting review** |
| **B3** | `compatibility-rules.md` §5 | Arithmetic examples contradicted formula ($L = 0.8$ used; mixed 62%, 33%, 67%). Displayed as percentages suggesting success probability. | Replaced with exact fixtures: $T=1, G=1, L=1 \implies 100.0/100$; $T=0.5, G=1, L=0.5 \implies 67.5/100$; $T=0.5, G=0, L=0.5 \implies 32.5/100$. Formatted as score out of 100 with 1-decimal rounding (avoiding "%"). | Verified double-precision floating point calculations in `docs/compatibility-rules.md` §4. | **Fixed—awaiting review** |
| **B4** | `session-lifecycle.md` §§1–3, 5; `requirements-spec.md` FR-17 | Scheduled end was not fixed; late starts could extend end time; undefined pause time was subtracted; midnight replenishment conflicted with daily bounds. | Immutably anchored $\text{scheduled\_end} = \text{scheduled\_start} + \text{duration}$. Prohibited early starts ($\text{now} \ge \text{scheduled\_start}$). Late starts do NOT extend end (capped at scheduled_end). Removed pause subtraction. Apportioned cross-midnight usage with midnight exhaustion precedence. | Fixture TF-01: 14:00–15:00 session started at 14:08 terminates at 15:00 and accounts max 52 min. Fixture TF-02: midnight split. | **Fixed—awaiting review** |
| **B5** | `session-lifecycle.md` §5.2; `requirements-spec.md` FR-12, FR-17 | Finalization checked only `status != ended`, potentially charging cancelled/no-show sessions. State diagram showed `OutcomeDrafting` as a session state, undermining idempotency. | Maintained terminal session state strictly at `ended`. Outcome drafting/confirmation tracked separately on `session_outcomes`. Finalization logic checks `status == 'active'` only; returns existing record if `ended`; rejects others. Labeled SQL as specification pseudocode. | Transactional pseudocode in `docs/session-lifecycle.md` §5.2; Fixture TF-03. | **Fixed—awaiting review** |
| **B6** | `access-matrix.md` §§2.3–2.4; `requirements-spec.md` FR-08, 12, 13 | Only Accepted Respondent could withdraw; pending respondents had no column; outcomes/reviews assigned to "Active Participant"; ended participants had no chat history access. | Added explicit resource states & predicates: Pending Respondent has withdrawal & re-response rights. Outcomes and reviews belong to Ended Session Participant. Ended participants retain read-only access to session chat archives. | Matrix updated in `docs/access-matrix.md` §§2.3–2.4. | **Fixed—awaiting review** |
| **B7** | `access-matrix.md` §2.1, §3; `requirements-spec.md` FR-01, FR-16 | Password hash row appeared readable by administrators. Blocking lacked active-session termination rules. | Separated email from password hash. Stated invariant: password hashes are never returned through user, profile, or admin interfaces. Defined active blocking: cancels scheduled sessions, immediately terminates active sessions with `manual_exit`, finalizes accrued time once, and halts messaging. | `docs/access-matrix.md` §2.1, §3.1; Fixture TF-04. | **Fixed—awaiting review** |
| **B8** | `requirements-spec.md` FR-06, FR-09; `compatibility-rules.md` §§2–3; `docs/architecture.md` §4.1 | Listing creation omitted knowledge-level input. Acceptance locked listing but did not recheck eligibility or prevent cross-listing overlapping bookings. | Added required `author_knowledge_level` to listing creation. Acceptance routine atomically rechecks channel membership, absence of blocks, pending state, future time, and schedule availability for both participants across all listings (`SELECT FOR UPDATE`). | `docs/requirements-spec.md` FR-06, FR-09; `docs/architecture.md` §4.1. | **Fixed—awaiting review** |
| **B9** | `user-research.md` §4; `README.md`; `youtrack-tasks.md` PLP-04 | Bibliographic citations contained fabricated entries (Computers in Human Behavior 107, Computers & Education 158), unverified entries, and incorrect dates/claims. Claim of 8 scientific publications was indefensible. | Removed fabricated entries. Quarantined unverified entries (Zheng, Borchers, Rientes). Corrected Kulkarni et al. to 2013 TOCHI (Vol 20(6), Art 33). Verified Topping (2005) as review article. Added Chi (2009), Roscoe & Chi (2007), Dillenbourg (1999), Boud et al. (2001/2014), and Vygotsky (1978). Total verified scientific works: 7. Added adult-only ethics safeguard. | Audited table with DOIs in `docs/user-research.md` §4. | **Fixed—awaiting review** |
| **B10** | `README.md` §7; `submission-checklist.md`; `youtrack-tasks.md` | 27 machine-local Windows file paths (`file:///c:/...`); broken README badge anchors; task completion claims exceeded evidence; provisional IDs conflated with YouTrack. | Replaced all links with repository-relative Markdown paths. Fixed README badge anchors. Explicitly labeled `PLP-xx` as provisional local identifiers. Marked revised specs as `Drafted (Revised)` and Git remote/YouTrack as `In Progress` / `Pending`. | Replaced in `README.md`, `docs/submission-checklist.md`, `docs/youtrack-tasks.md`. | **Fixed—awaiting review** |

---

## 3. High & Medium Priority Improvements Addressed

| Issue Area | Prior State | Correction Implemented | Verified In |
| :--- | :--- | :--- | :--- |
| **Sorting vs. Filtering Conflation** | Conflated compatibility filtering with chronological browsing. | In controlled empirical evaluation (RQ1), both Chronological and Compatibility conditions apply **identical hard eligibility filters**; only ordering changes. Broader browsing is a separate explicit mode. | `docs/compatibility-rules.md` §2.2 |
| **Schedule Overlap & Half-Open Intervals** | Overlap check was unspecified, causing back-to-back booking false conflicts. | Formally modeled scheduling intervals as half-open $[t_{\text{start}}, t_{\text{end}})$. Allows adjacent sessions (e.g., 14:00–15:00 and 15:00–16:00) without collision. | `docs/compatibility-rules.md` §2.1 |
| **Public Registration Role** | Not restricted. | Clarified that public registration creates exclusively `Learner` accounts; `Administrator` accounts cannot be registered publicly. | `docs/access-matrix.md` §1.1 |
| **Channel Creation Permissions** | Ambiguous prior membership. | Clarified that any authenticated `Learner` can create a topic channel within an existing community (FR-03). Prior membership not required to create. | `docs/access-matrix.md` §2.2 |
| **Audit-Only Chat History Exception** | Ambiguous administrative browsing. | Administrators cannot browse private session chat archives generally; access is strictly restricted to an audit-only view during active moderation reports. | `docs/access-matrix.md` §2.4 |
| **Re-Response After Withdrawal** | Undefined re-response behavior. | Defined rule: a learner who has withdrawn a response may re-respond if the listing remains open and they have 0 other active responses to it. | `docs/access-matrix.md` §2.3 |
| **Outcome Versioning & Dual Approval** | Outcome edits lacked version-bound re-approval. | Any edit increments outcome `version` and clears partner confirmation timestamp; both parties must approve identical text. | `docs/requirements-spec.md` FR-12 |
| **Tone & Assertion Qualification** | Stated broad causal assertions ("high attrition", "universal platform failures", "ZPD proves L=0.5"). | Replaced with qualified engineering hypotheses and theoretical framing; stated weights and level scores are explicit engineering hypotheses. | `docs/project-proposal.md`, `docs/compatibility-rules.md` |
| **Ethics Safeguard on Underage Users** | Included secondary students without ethics protocol. | Formalized safeguard: initial interviews and prototype evaluations are bounded strictly to adult learners ($\ge 18$); secondary student recruitment deferred pending institutional ethics review. | `docs/user-research.md` §1.2 |
| **Existing System Comparison Criteria** | Checklist claimed criteria were in scope, but scope omitted the list. | Defined 10 uniform comparative criteria (C1 through C10) in `docs/project-scope.md` §5. | `docs/project-scope.md` §5 |
| **Task Dependencies & Risk Register** | Tasks lacked dependencies, all marked P0, no risk register. | Added `Dependencies` column to WBS, separated core P0 from supporting P1, added 4-item Risk Register, and defined 3 supervisor review checkpoints. | `docs/youtrack-tasks.md` §§2–4 |

---

## 4. Formal Acceptance Test Fixtures (Specification Benchmarks)

These test fixtures define the verifiable behavior of the revised specification:

### Fixture TF-01: Late Start Duration Cap (FR-17)
- **Input**: Listing booked for 14:00 to 15:00 UTC (duration: 60 minutes).
- **Execution**: Both participants confirm start at 14:08 UTC.
- **Expected Outcome**:
  - Session auto-terminates at 15:00 UTC (`scheduled_end`).
  - `counted_duration_seconds` $= 3,120\text{ s}$ ($52\text{ minutes}$).
  - Missed interval (14:00–14:08) is not credited.

### Fixture TF-02: Cross-Midnight Usage & Precedence (FR-11)
- **Input**: Session booked for 23:45 UTC (Day 1) to 00:30 UTC (Day 2) (duration: 45 minutes).
- **Case A (Sufficient Allowance)**: Users have $\ge 60$ min remaining on Day 1.
  - *Expected Outcome*: Day 1 ledger charged 15 minutes; Day 2 ledger charged 30 minutes from replenished 180 min allowance.
- **Case B (Exhaustion Precedence)**: User A has only 10 min remaining on Day 1.
  - *Expected Outcome*: Session terminates at 23:55 UTC (`end_reason = 'allowance_exhaustion'`). Day 1 charged 10 minutes. Day 2 charged 0 minutes (session terminates before reaching midnight).

### Fixture TF-03: Concurrency & Duplicate Finalization (FR-09, FR-11, NFR-02)
- **Input**: An active session reaches scheduled end. Both client tabs issue `POST /api/v1/sessions/:id/end` within 10 milliseconds.
- **Expected Outcome**: Exactly one database transaction commits `status = 'ended'`. Exactly one set of `usage_ledgers` records is created. The second request returns HTTP 200 with the already finalized session payload. Zero duplicate minutes are charged.

### Fixture TF-04: Unauthorized Private Data & Hash Access (FR-01, FR-14, NFR-01)
- **Input**: Learner B issues `GET /api/v1/users/{LearnerA_id}/sessions`.
- **Expected Outcome**: Server returns HTTP 403 Forbidden. Learner A's private history, partner names, and notes are excluded. In all user/admin DTO responses, `password_hash` is completely omitted.

### Fixture TF-05: Compatibility Arithmetic & Display Rounding (FR-07)
- **Case 1 (Perfect Match)**: $T = 1.0, G = 1.0, L = 1.0 \implies 100 \times (0.40(1) + 0.35(1) + 0.25(1)) = 100.0$.
  - *Expected Display*: `Compatibility Score: 100.0 / 100`.
- **Case 2 (Partial Match)**: $T = 0.50, G = 1.0, L = 0.50 \implies 100 \times (0.40(0.5) + 0.35(1) + 0.25(0.5)) = 67.5$.
  - *Expected Display*: `Compatibility Score: 67.5 / 100`.
- **Case 3 (Missing Preferences)**: Viewer has not configured topic preference tags.
  - *Expected Display*: Compatibility score suppressed; chronological fallback with inline preference prompt.

---

## 5. Explicitly Stated Remaining Blockers & Open Items

| Item | Nature | Current Working Treatment | Next Action Required |
| :--- | :--- | :--- | :--- |
| **YouTrack Instance Provisioning** | External Dependency | Provisional `PLP-xx` task identifiers maintained in `docs/youtrack-tasks.md`. | Map provisional IDs to official YouTrack IDs upon project key provisioning. |
| **Adult Field Interviews** | Empirical Fieldwork | Protocol, interview guide, and blank templates prepared in `docs/user-research.md`. | Conduct 3–5 discovery interviews with adult learners ($\ge 18$). |
| **Supervisor Review Package** | Working Schedule Target | Comprehensive review package scheduled for submission on 20 October 2026. | Submit review package and record genuine comments from Aigerim Kydyrbekova. |
| **Institutional Deadline Discrepancy** | Governance | 20 Oct review target vs. 24 Oct repository milestone maintained as distinct milestones. | Seek formal clarification on Pre-Defense 1 scheduling. |

---

## 6. Astra Correction Package 2 Audit & Implementation Register

This section records the exact resolution of the Astra Correction Package 2 requirements applied across the project:

### 6.1 Section-by-Section Resolution Summary

| Package Section | Affected Documents | Exact Changes Applied | Verifiable Check / Fixture | Status |
| :--- | :--- | :--- | :--- | :-: |
| **§1. Acceptance Concurrency** | `docs/architecture.md` §4.1; `docs/requirements-spec.md` FR-09, NFR-02 | Replaced §4.1 with Shared Lock Protocol (users ascending UUID → study_listings → listing_responses → study_sessions → session_outcomes). Respondent derived from response record. Recheck eligibility under locks. Withdrawal/re-response serialization. Blocking serialization. | Fixtures C-01, C-02, C-03, C-04 | **Fixed—awaiting review** |
| **§2. Session Accounting** | `docs/session-lifecycle.md` §§3, 5, 7; `docs/architecture.md` §4.2; `docs/requirements-spec.md` FR-11, NFR-02 | Units in 10,800 integer seconds (180 min Confirmed). UTC days, exact-midnight exhaustion-first policy (session ends at 00:00 without revival). Day splitting `[start, end) ∩ [day_start, next_day_start)` in integer seconds. Effective termination priority (1. blocked, 2. allowance_exhaustion, 3. scheduled_end, 4. connection_interruption, 5. manual_exit). Idempotent finalization with `UNIQUE(session_id, user_id, utc_date)` and no ON CONFLICT DO NOTHING hiding errors. | Fixtures A-01..A-07, S-01 | **Fixed—awaiting review** |
| **§3. Version-Safe Outcomes** | `docs/requirements-spec.md` FR-12; `docs/data-model.md` `session_outcomes`; `docs/project-scope.md` §3, §6; `docs/architecture.md` §3.1 | Recording outcomes is Confirmed; requiring mutual confirmation is Proposed. Minimal approval model: `version`, `last_editor_id`, `approved_version_a`, `approved_version_b`. Derived confirmation `approved_version_a = version AND approved_version_b = version`. Removed `is_mutually_confirmed` and `partner_confirmed_at`. `expected_version` check; stale requests return 409 OUTCOME_VERSION_CONFLICT. Reviews do not require outcome confirmation. | Fixtures O-01, O-02, O-03 | **Fixed—awaiting review** |
| **§4.1 Dated Availability** | `docs/data-model.md` `availability_slots`; `docs/requirements-spec.md` FR-02; `docs/compatibility-rules.md` §2.1 | Replaced recurring weekly availability (`day_of_week`, `start_time_utc`, `end_time_utc`) with explicit dated intervals `starts_at TIMESTAMPTZ`, `ends_at TIMESTAMPTZ`. Union of half-open intervals `[starts_at, ends_at)` must cover listing interval without gaps. Local IANA timezone input/display. Stored instants unchanged on timezone edit. | Fixture V-01 | **Fixed—awaiting review** |
| **§4.2 Response Row Reuse** | `docs/data-model.md` `listing_responses`; `docs/requirements-spec.md` FR-08 | Permanent `UNIQUE(listing_id, respondent_id)`. Re-response reuses row: `withdrawn → pending`. No pending-only unique constraint or second attempt row. | Fixture R-01 | **Fixed—awaiting review** |
| **§4.3 Persisted Inputs & Author Level** | `docs/data-model.md` `learning_preferences`, `study_listings`; `docs/compatibility-rules.md` §3.1; `docs/requirements-spec.md` FR-06, FR-07 | Added `learning_preferences.topic_tags TEXT[] NOT NULL DEFAULT '{}'`. Empty preference tags disable scoring without invented values. Listing tags nonempty. Listing level defined as `study_listings.author_level`. Removed `target_level` from V1 schema. Chronological sort: `created_at DESC, id ASC`. Compatibility sort: unrounded score DESC, scheduled start ASC, ID ASC. Identical eligibility filters between conditions. | Fixture M-01 | **Fixed—awaiting review** |
| **§4.4 Blocked Archive Access & Reasons** | `docs/access-matrix.md` §§2.4, 3.1; `docs/session-lifecycle.md` §4.2; `docs/requirements-spec.md` FR-16; `docs/data-model.md` `study_sessions` | Blocking terminates active session with reason `blocked` (accrued time finalized once). Cancels scheduled sessions with 0 charge. Both participants retain read-only archive access. Other learners and friends have no access. Admin access only via active report. Disables new outcome edits. Fixed end_reason to exact 5: `manual_exit`, `scheduled_end`, `allowance_exhaustion`, `connection_interruption`, `blocked`. | Fixture P-01 | **Fixed—awaiting review** |
| **§4.5 Accounting Schema Alignment** | `docs/data-model.md` `usage_ledgers`, `study_sessions`, index commentary | `usage_ledgers.counted_seconds INTEGER NOT NULL CHECK (counted_seconds > 0)`. `study_sessions.user_a_id != user_b_id`. `study_sessions.counted_duration_seconds INTEGER >= 0`. Active participant index labeled lookup optimization only. Daily cap enforced at service layer. 5-minute review test compares seconds against 300. | Fixture S-01 | **Fixed—awaiting review** |

---

### 6.2 Compliance Verification Against the 20 Consolidated Invariants

1. **Status**: 180 total daily minutes is Confirmed. Recording session outcomes is Confirmed. UTC reset, exhaustion-first midnight policy, 60s grace period, 300s review threshold, matching weights ($0.40T, 0.35G, 0.25L$), and mutual topic confirmation are **Proposed**. *Verified across all files.*
2. **Evidence**: Acceptance fixtures (C-01..04, A-01..07, O-01..03, V-01, R-01, M-01, P-01, S-01, TF-01, TF-04) define formal specification expectations; they are not passed implementation tests or supervisor approvals. *Explicitly noted in headers.*
3. **Lock Order**: Transaction lock ordering: `users` ascending UUID $\to$ `study_listings` ascending ID $\to$ `listing_responses` ascending ID $\to$ `study_sessions` ascending ID $\to$ `session_outcomes` ascending ID. *Documented in `docs/architecture.md` §4.1.*
4. **Cross-Listing Protection**: Every booking creation path acquires both participant user locks before checking and inserting bookings. *Specified in `docs/architecture.md` §4.1.*
5. **Acceptance**: Eligibility is rechecked under locks; respondent is derived from the response record, not external input. *Specified in `docs/architecture.md` §4.1.*
6. **Booking Uniqueness**: 1 listing produces at most 1 session (`UNIQUE(listing_id)`); 1 learner cannot hold overlapping scheduled or active intervals. *Specified in `docs/architecture.md` §4.1 and `docs/data-model.md`.*
7. **Intervals**: Half-open intervals $[start, end)$; back-to-back bookings allowed without false collision. *Specified in `docs/requirements-spec.md` FR-02 and `docs/compatibility-rules.md` §2.1.*
8. **Responses**: One row per listing–respondent pair (`UNIQUE(listing_id, respondent_id)`); re-response reactivates withdrawn row (`withdrawn → pending`). *Specified in `docs/data-model.md` and `docs/requirements-spec.md` FR-08.*
9. **Availability**: Explicit dated UTC intervals `[starts_at, ends_at)` entered and displayed via IANA timezone; no weekly recurrence engine. *Specified in `docs/data-model.md` and `docs/requirements-spec.md` FR-02.*
10. **Matching**: Saved viewer tags, goal, and level required for scoring; listing level means author level; no invented missing-input score; empty tags suppress scoring. *Specified in `docs/compatibility-rules.md` §3.1 and `docs/requirements-spec.md` FR-07.*
11. **Evaluation**: Strict chronological and compatibility ranked conditions use identical candidate eligibility filters; only ordering differs. *Specified in `docs/compatibility-rules.md` §2.2.*
12. **Time**: Authoritative charges are integer seconds (10,800s daily allowance); display rounding never alters ledger usage. *Specified in `docs/session-lifecycle.md` §3.1 and `docs/requirements-spec.md` FR-11.*
13. **Termination**: Effective end is the earliest applicable server-owned boundary, not worker execution time. Deterministic priority: 1. `blocked`, 2. `allowance_exhaustion`, 3. `scheduled_end`, 4. `connection_interruption`, 5. `manual_exit`. *Specified in `docs/session-lifecycle.md` §3.4.*
14. **Midnight**: Exact old-day exhaustion terminates the session at midnight; new day reset never revives an ended session. *Specified in `docs/session-lifecycle.md` §3.2.*
15. **Ledger**: Written at finalization only: one positive row per participant per charged UTC date (`UNIQUE(session_id, user_id, utc_date)`). Conflicting ledger rows cause rollback. *Specified in `docs/session-lifecycle.md` §5.2.*
16. **Terminal State**: Outcomes and reviews never move a session out of `ended`. *Specified in `docs/session-lifecycle.md` §1 and `docs/requirements-spec.md` FR-12.*
17. **Outcome Approval**: Both approvals must reference current version (`approved_version_a = version AND approved_version_b = version`); edits increment version and invalidate prior approvals; stale writes/confirmations fail with 409. Reviews do not require outcome confirmation. *Specified in `docs/requirements-spec.md` FR-12 and `docs/data-model.md`.*
18. **Blocking**: Ends active contact with reason `blocked`, cancels future shared sessions, preserves participant read-only archives, and prevents shared-outcome mutations. *Specified in `docs/access-matrix.md` §3.1 and `docs/requirements-spec.md` FR-16.*
19. **Reasons**: The exact five termination-reason values appear everywhere: `manual_exit`, `scheduled_end`, `allowance_exhaustion`, `connection_interruption`, `blocked`. `blocked` is not interchangeable with `manual_exit`. *Specified across all documents and schema.*
20. **Representation**: Diagrams and exports (`system-context.svg`, `use-case.svg`, `component.svg`) match the IDs, states, classifications, and dependencies of the corrected documents. *Regenerated and verified via Mermaid CLI.*

---

### 6.3 Batch 4 Prototype Implementation & Automated Verification

| Prototype Component | Source Files | Features & Invariants Verified | Verification Method | Status |
| :--- | :--- | :--- | :--- | :-: |
| **Core Web Prototype** | `prototype/index.html`, `prototype/styles.css`, `prototype/app.js` | Complete end-to-end journey (`community → channel → Find a Partner → listing → response → acceptance → session chat → outcome → profile`). Persona switcher (Alice, Bob, Carol, Dave, Eve, Moderator). Live HUD with 10,800s integer seconds cap. Boundary condition simulators for cross-midnight split (A-03), exact-midnight exhaustion (A-04), 60s grace disconnection, blocking (P-01), and 5 exact terminal reasons. Version-safe outcome editor with 409 conflict test (O-01..O-03). 300s review gate (S-01). Default-private partner history. | Browser inspection, UI interactions | **Delivered (Simulated Prototype)** |
| **Automated Invariant Test Suite** | `prototype/test-prototype.js`, `prototype/package.json` | 10 test groups asserting compatibility formula ($0.40T + 0.35G + 0.25L$), unrounded sort order (M-01), missing preferences fallback without invented values, response row reuse (R-01), Shared Lock Protocol and 409 collision detection (C-01..C-04), cross-midnight split (A-03), exact-midnight exhaustion (A-04), exact 5 terminal reasons, version-safe outcome mutual confirmation with 409 conflict (O-01..O-03), 300s review threshold (S-01), and default-private partner visibility. | Headless execution (`npm test` / `node prototype/test-prototype.js`): **10/10 passed (100%)** | **Verified (Automated Test)** |
| **Setup & Walkthrough Documentation** | `prototype/README.md` | Full architecture documentation, launch commands (`npx serve`, Python HTTP, or direct `file://`), step-by-step 8-phase interactive walkthrough, invariant mapping table, and file structure. | Markdown review & syntax verification | **Delivered** |

---

## 7. Astra Review 3 (Milestone Prototype & Honest Verification) Resolution Log

| Finding ID | Affected Files | Description of Correction Made | Supporting Example / Verification Check | Status |
| :--- | :--- | :--- | :--- | :-: |
| **F-01: Channel Membership Gating** | `prototype/app.js`, `prototype/index.html` | Added in-memory channel membership records (`channelMemberships`) with Join/Leave actions. Find a Partner feed is locked with a prominent gate notice until user joins the channel. | `test-prototype.js` Test 3 verifies non-members receive empty listing results and joining unlocks discovery. | **Fixed—awaiting review** |
| **F-02: Score Display Format** | `prototype/app.js`, `prototype/index.html`, `prototype/README.md` | Compatibility score is strictly formatted as `Score: 80.0 / 100` (points out of 100). Removed percentage `%` symbol everywhere. | `test-prototype.js` Test 1 asserts `displayScore === '60.8 / 100'` for Fixture M-01. | **Fixed—awaiting review** |
| **F-03: Missing Preferences Fallback** | `prototype/app.js`, `prototype/index.html` | When viewing as Eve (lacks preferences), feed automatically sorts by chronological order (`created_at DESC, id ASC`), and UI toggle updates to show `Chronological (Fallback due to missing preferences)`. | Verified in `app.js` renderFeed and `test-prototype.js` Test 2. | **Fixed—awaiting review** |
| **F-04: Chat Truthfulness** | `prototype/app.js`, `prototype/index.html`, `prototype/README.md` | Removed all references to WebRTC, real networking, and WebSockets. Labelled as: "Simulated session chat — messages exist only in this browser's memory." | Labelled across UI and documentation. | **Fixed—awaiting review** |
| **F-05: Outsider Persona Permissions** | `prototype/app.js`, `prototype/index.html` | Switching to an outsider persona (e.g., Eve or Carol on an Alice–Bob session) renders an access restricted banner, hiding private chat, outcomes, and review forms. Backend guards reject outsider message/outcome/review actions. | `test-prototype.js` Test 7 verifies outsider chat, edit, approval, and review attempts return unauthorized errors. | **Fixed—awaiting review** |
| **F-06: Acceptance to Scheduled Session** | `prototype/app.js`, `prototype/index.html` | Acceptance creates a session in `scheduled` state with accounted duration 0s. Start requires advancing the demo clock to scheduled start and explicit participant check-in. Outcomes initialized upon start. | `test-prototype.js` Test 6 asserts session starts as `scheduled` and transitions to `active` upon check-in. | **Fixed—awaiting review** |
| **F-07: Deterministic Demo Clock & Reconciler** | `prototype/app.js` | Single accounting reconciler reconciling daily cap (10,800s), scheduled end, and canonical fixtures. Fixtures A-01..A-04, A-06, S-01, M-01 implemented with canonical inputs and expected values. | `test-prototype.js` Tests 8–11 pass 100%. | **Fixed—awaiting review** |
| **F-08: Strict Listing Validation** | `prototype/app.js`, `prototype/index.html` | Required fields: title, topic tags, language (`en`, `ru`, `kk`), explicit author level (not defaulted), future start relative to demo clock, positive duration (15–180m), and end after start. | `test-prototype.js` Test 4 asserts all invalid input combinations are rejected with specific error messages. | **Fixed—awaiting review** |
| **F-09: Truthful Labels & Honest Statuses** | `prototype/index.html`, `docs/submission-checklist.md`, `docs/youtrack-tasks.md` | Replaced static checkmarks with honest coverage badges (`[Demonstrated in prototype]`, `[Simulation only]`, `[Working-V1 requirement]`). Removed supervisor/university policy attribution. | UI badges and checklist updated. | **Fixed—awaiting review** |
| **F-10: Test Execution of Application Code** | `prototype/app.js`, `prototype/test-prototype.js` | Refactored `app.js` into a UMD module. `test-prototype.js` directly requires `app.js` and tests the actual application logic (13/13 tests pass, 100%). | Executed via `node prototype/test-prototype.js` and `npm test`. | **Fixed—awaiting review** |
| **F-11: Launch Instructions Directory Fix** | `prototype/README.md` | Documented distinct commands for repository root (`python -m http.server 3000 --directory prototype`, `node prototype/test-prototype.js`) and prototype directory (`python -m http.server 3000 --directory .`, `npm test`). Removed machine-specific Windows paths. | Verified in both directories. | **Fixed—awaiting review** |
| **F-12: Diagrams UML & Architecture Parity** | `diagrams/src/use-case.mmd`, `diagrams/src/component.mmd` | `use-case.mmd` updated with UML use-case semantics (channel membership precondition, decoupled scheduling, admin channel creation). `component.mmd` labelled Proposed Working-V1 Architecture. SVG exports regenerated. | Mermaid CLI regenerated `diagrams/exports/use-case.svg` and `component.svg`. | **Fixed—awaiting review** |


