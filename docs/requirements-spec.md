# Requirements Specification: Functional & Non-Functional Catalog

## 1. Document Overview and Conventions

### 1.1 Purpose
This specification defines the formal functional requirements (FR) and non-functional requirements (NFR) for the **Compatibility-Based Peer Learning Platform**. It establishes unambiguous verification criteria, prioritizing features into core milestone capabilities, supporting functions, and deferred items.

### 1.2 Priority and Scope Taxonomy
- **P0 (Core V1 Requirement)**: Essential for the core learner journey (discovery → scheduling → accounted session → mutual outcome).
- **P1 (Supporting V1 Requirement)**: Secondary social and reputation features implemented following core flow stabilization.
- **Deferred**: Explicitly excluded from V1 commitments (e.g., payment processing, native video streaming, recurring calendar series).

### 1.3 Two-Tier Acceptance Criteria & Milestone Applicability
Every requirement defines two distinct evaluation criteria and states its milestone applicability:
1. **Immediate Prototype Acceptance Criteria (Applicable to 20/24 Oct Milestone)**: Observable behaviors demonstrated in the client demonstration prototype using structured seed data and visible simulation banners where backend services are mocked.
2. **Later Working-V1 Acceptance Criteria (Applicable to Post-Milestone Implementation)**: Production criteria requiring database transactions, persistent PostgreSQL state, REST/WebSocket API responses, and automated integration test validation.
   > *Note: Persona-switching UI prototypes demonstrate user journeys only; they do not constitute proof of backend security, transactional concurrency, or cryptographic hygiene.*

---

## 2. Functional Requirements Catalog

### FR-01: Accounts and Identity Management
- **Classification**: Confirmed / P0
- **Summary**: Learners can register, authenticate, manage sessions, and modify their own identity records. Public registration creates exclusively `Learner` accounts.
- **Immediate Prototype Acceptance Criteria**:
  - Demonstration UI allows switching between at least two fictional learner personas (Alice, Bob) and one Administrator.
  - Profile editor allows updating display name, bio, and timezone, immediately updating UI state.
  - An active persona cannot view edit controls on another learner's profile.
- **Later Working-V1 Acceptance Criteria**:
  - Secure registration and authentication via bcrypt (cost $\ge 12$) or argon2id password hashing and JWT/session cookies.
  - Password hashes are strictly server-internal and **never returned in user DTOs** across user or administrator interfaces.
  - `PUT /api/v1/users/me` enforces authorization; attempting `PUT /api/v1/users/:id` for another user returns HTTP 403 Forbidden.

### FR-02: Structured Learning Preferences
- **Classification**: Confirmed / P0 *(Dated availability intervals: Proposed V1 simplification)*
- **Summary**: Profiles record explicit, topic-specific knowledge levels, learning goals, spoken languages, and dated availability intervals.
- **Immediate Prototype Acceptance Criteria**:
  - Profile UI displays structured inputs: Topic dropdown (Python, English, Math), Knowledge Level (1: Beginner, 2: Intermediate, 3: Advanced), Goal Category, Spoken Languages, and Dated Availability intervals with timezone display.
  - Missing preferences are visibly flagged with an inline prompt; no default preferences are silently assumed.
  - Learner topic preference tags persist as `topic_tags TEXT[]`.
- **Later Working-V1 Acceptance Criteria**:
  - Availability consists of explicit dated intervals, not recurring weekly schedules.
  - A learner selects a local start and end date/time using their IANA timezone. The application resolves these into UTC instants. Nonexistent local times are rejected; ambiguous local times require an explicit offset choice. Stored intervals do not move when the learner changes their profile timezone.
  - Availability uses half-open intervals `[starts_at, ends_at)`. Adjacent or overlapping slots are merged logically when checking coverage. Full availability means that their union covers the listing interval without a gap.
  - A listing is the author’s explicit declaration of availability for that booked interval. Respondents must supply matching availability. A later availability edit affects future discovery and acceptance, but does not silently cancel an already accepted booking.
  - Fixture V-01 defines coverage rules.

### FR-03: Topic Communities and Channels
- **Classification**: Confirmed / P0
- **Summary**: Hierarchical organization into Communities managed by administrators and topic Channels accessible to learners.
- **Immediate Prototype Acceptance Criteria**:
  - UI displays communities (e.g., "Computer Science") containing topic channels (e.g., "Python Basics").
  - Any authenticated learner persona can create a topic channel within an existing community.
  - Learners can click "Join Channel" and "Leave Channel", toggling membership state.
  - Community creation is accessible only to the Administrator persona.
- **Later Working-V1 Acceptance Criteria**:
  - `POST /api/v1/communities` requires `admin` role (returns HTTP 403 for standard learners).
  - Authenticated learners can create channels: `POST /api/v1/communities/:id/channels`.
  - Channel memberships persist in `channel_memberships` with unique `(user_id, channel_id)`.

### FR-04: Channel Membership Access Gate
- **Classification**: Confirmed / P0
- **Summary**: Partner discovery, listing creation, and responses are strictly restricted to verified channel members.
- **Immediate Prototype Acceptance Criteria**:
  - Viewing a channel as a non-member disables or hides "Create Study Listing" and "Find Study Partner", displaying a prompt to join the channel.
  - Joining the channel immediately unlocks the discovery interface and listing forms.
- **Later Working-V1 Acceptance Criteria**:
  - API middleware rejects listing queries or creation attempts with HTTP 403 Forbidden if `user_id` is not present in `channel_memberships` for that channel.

### FR-05: Channel Discussion Posts
- **Classification**: Confirmed / P0 *(Author edit/delete and admin moderation: Proposed)*
- **Summary**: Channel members can publish plain text and external link posts categorized by pedagogical type.
- **Immediate Prototype Acceptance Criteria**:
  - Members can create posts with mandatory category: `question`, `explanation`, `material`, or `progress`.
  - Authors can edit or delete their own posts; other members can acknowledge or report.
  - Administrator persona displays a "Hide Post" moderation action.
- **Later Working-V1 Acceptance Criteria**:
  - Server validates post payload: body length between 10 and 5,000 characters; post type matches enum.
  - Soft-deletion via `deleted_at` timestamp. Unauthorized update attempts return HTTP 403.
  - `post_acknowledgements` enforces maximum 1 helpful acknowledgement per user per post, excluding post author.

### FR-06: Study Listings Creation
- **Classification**: Confirmed / P0 *(Goal field and structured topic tags: Proposed)*
- **Summary**: Channel members can publish a structured study listing specifying learning goal, topic tags, author's knowledge level, date, start time, duration, and language.
- **Immediate Prototype Acceptance Criteria**:
  - Form validates required fields: at least 1 Topic tag, Goal category, Author Knowledge Level (1–3), Date/time picker, Duration dropdown (15–180 min), and Spoken Language.
  - Selecting a past time or duration $>180\text{ min}$ displays an immediate validation error.
- **Later Working-V1 Acceptance Criteria**:
  - API validates that `scheduled_start_time` is in the future (UTC) and `duration_minutes` is between 15 and 180.
  - Listing tags must be nonempty.
  - `study_listings.author_level` records the author's self-reported knowledge level for that listing; `target_level` is removed from V1. Changing author profile level later does not alter stored listing level.
  - Listing persists with status `open`. Creating a listing with times overlapping the author's own active/scheduled sessions is rejected with HTTP 409 Conflict.

### FR-07: Search, Discovery, and Compatibility Ranking
- **Classification**: Confirmed / P0
- **Summary**: Channel members can browse open listings, toggle between chronological and compatibility-ranked ordering, and view transparent score justifications.
- **Immediate Prototype Acceptance Criteria**:
  - Discovery view provides a toggle: "Sort by Compatibility" vs. "Sort by Newest".
  - Both sort modes apply the exact same candidate eligibility filters (language, availability, no blocks). If language or availability is missing, strict eligibility cannot be established; prompt for those inputs and offer explicitly labeled broader browsing. Never silently relax eligibility.
  - Strict chronological order is `created_at DESC, id ASC`.
  - Compatibility order is unrounded score descending, then scheduled start ascending, then ID ascending. Rounding affects display only.
  - Compatibility mode displays scores out of 100 with 1 decimal place (e.g., `60.8 / 100`) and a decomposed explanation badge.
  - Missing learner preferences display an inline prompt to complete preferences, falling back gracefully to chronological ordering with no invented score.
- **Later Working-V1 Acceptance Criteria**:
  - Ranking reads the viewer’s saved topic-specific tags, level, and goal, together with the listing’s tags, author level, and goal. Missing scoring inputs disable scoring; no substitute values are invented.
  - Complies with performance target NFR-05 (p95 $< 1000\text{ ms}$ for 1,000 listings).
  - Fixture M-01 defines ranking calculation and chronological fallback.

### FR-08: Responses to Study Listings
- **Classification**: Confirmed / P0 *(Self-response rejection and withdrawal/re-response: Proposed)*
- **Summary**: Eligible channel members can submit a response to an open listing, withdraw a pending response, and re-respond if the listing remains open.
- **Immediate Prototype Acceptance Criteria**:
  - Learner persona can click "Respond" on another member's listing; status updates to "Response Pending".
  - The listing author sees incoming responses with the respondent's compatibility score and profile preview.
  - Listing author cannot respond to their own listing (action disabled).
  - Respondent can click "Withdraw Response", restoring the listing to unresponded state. If still open, respondent can re-respond.
- **Later Working-V1 Acceptance Criteria**:
  - Retain permanent `UNIQUE(listing_id, respondent_id)`. Re-response reuses the existing row: `withdrawn → pending`. Do not introduce a pending-only unique constraint or insert another attempt row.
  - `pending → withdrawn`, `pending → accepted`, and `pending → declined` are the supported transitions. Accepted and declined responses cannot be reactivated. All transitions follow architecture §4.1’s locking and eligibility rules.
  - Self-responses return HTTP 400 Bad Request (`CANNOT_RESPOND_TO_OWN_LISTING`).
  - Fixture R-01 defines re-response reuse behavior.

### FR-09: Single Partner Acceptance Workflow
- **Classification**: Confirmed / P0
- **Summary**: The listing author can accept exactly one respondent. Acceptance atomically locks the session, rechecks eligibility, and auto-declines other candidates.
- **Immediate Prototype Acceptance Criteria**:
  - Author clicks "Accept" next to a respondent.
  - Listing updates to "Matched", a scheduled session card appears for both participants, and other candidate responses show "Closed / Not Selected".
  - Attempting to accept a second respondent is prevented.
- **Later Working-V1 Acceptance Criteria**:
  - Acceptance follows the participant-locking protocol in architecture §4.1. Same-listing races create at most one session; different-listing races cannot create overlapping bookings for a shared learner. Eligibility is rechecked after acquiring locks. Fixtures C-01–C-04 define the required observable outcomes. Prototype prevention of a second click does not demonstrate database concurrency safety.

### FR-10: Synchronous Session Text Chat
- **Classification**: Confirmed / P0
- **Summary**: Accepted study partners communicate via an exclusive, time-bounded text chat channel.
- **Immediate Prototype Acceptance Criteria**:
  - Chat room is accessible exclusively to the accepted pair.
  - Prototype features a simulation banner indicating mocked WebSocket delivery.
  - Sending messages is disabled prior to session start and after session conclusion.
  - Ended participants can read the archived chat history in read-only mode.
- **Later Working-V1 Acceptance Criteria**:
  - WebSocket gateway authenticates connections and verifies user is in `session.participant_ids`.
  - Message exchange is rejected by server if `session.status != 'active'`.
  - Messages persist in `session_messages` with authoritative server timestamps.

### FR-11: Daily Study Allowance Accounting
- **Classification**: Confirmed / P0 *(180 min allowance: Confirmed; UTC reset, integer seconds, exact-midnight policy: Proposed)*
- **Summary**: Each free learner has a confirmed daily study allowance of 180 minutes (10,800 integer seconds). Active session time decrements the remaining allowance in integer seconds.
- **Immediate Prototype Acceptance Criteria**:
  - Header displays "Remaining Daily Allowance: 180 min" (10,800 s).
  - Active session increments elapsed timer and decrements allowance indicator in integer seconds.
  - When remaining allowance reaches 0, session ends automatically with an "Allowance Exhausted" modal, setting terminal reason `allowance_exhaustion` and disabling further chat.
- **Later Working-V1 Acceptance Criteria**:
  - The daily allowance is represented as **10,800 integer seconds**.
  - Authoritative accounting timestamps use whole-second resolution.
  - A session’s charged interval is `[actual_start_time, effective_end_time)`.
  - No rounding upward is applied to sessions or daily segments. Minutes are a display conversion only; the authoritative ledger stores seconds.
  - Both participants receive identical session-duration charges.
  - Exact-midnight policy (exhaustion first): if either learner exhausts their old-day allowance exactly at midnight, the session ends at midnight (`allowance_exhaustion`). The new day’s allowance does not revive or restart the session. If both learners have positive allowance remaining, the session continues into Day 2.
  - Day-boundary splitting calculates `[actual_start_time, effective_end_time) ∩ [day_start, next_day_start)` in integer seconds. Positive ledger rows are inserted at finalization only (`UNIQUE(session_id, user_id, utc_date)`).
  - Fixtures A-01–A-07 define observable accounting outcomes.

### FR-12: Session outcomes and proposed mutual confirmation
- **Classification**: Recording covered topics and session notes: **Confirmed**. Mutual confirmation and its version-safe mechanism: **Proposed**. Priority: P0 for the currently proposed V1 flow.
- **Summary**: Participants can record shared topics and notes after an ended session. Under the proposed confirmation mechanism, an outcome is mutually confirmed only when both session participants approve its current version.
- **Immediate Prototype Acceptance Criteria**:
  - A fictional two-person flow demonstrates:
    1. Submission of version 1 by Partner A.
    2. Confirmation of version 1 by Partner B (derived mutual confirmation active).
    3. Editing to version 2 by Partner A, invalidating prior approvals and resetting mutual confirmation.
    4. Rejection of an attempted confirmation of version 1 with a visible 409 conflict.
  - The interface identifies mutual confirmation as a proposed design and simulated persistence as applicable.
- **Later Working-V1 Acceptance Criteria**:
  - There is at most one shared outcome row per session in `session_outcomes`.
  - Either participant may create or edit it. Creating or saving an edited version constitutes the submitting participant’s approval of that exact content.
  - Every edit increments `version` and invalidates both previous approvals, then records the editor’s approval of the new version.
  - The other participant confirms the current version explicitly.
  - Derived mutual confirmation is true only when: `approved_version_a = version AND approved_version_b = version`. It is not maintained as an independent Boolean.
  - Session status remains `ended` throughout; reviews do not require outcome confirmation.
  - Every edit or confirmation request includes `expected_version`. Stale requests return HTTP `409 OUTCOME_VERSION_CONFLICT`.
  - Fixtures O-01–O-03 define required race behavior.

### FR-13: Partner Evaluation and Reviews
- **Classification**: Confirmed / P0 *(1 review per participant, 300s/5-min minimum threshold: Proposed)*
- **Summary**: Following a completed session meeting the minimum active duration, participants can submit an evaluation and review.
- **Immediate Prototype Acceptance Criteria**:
  - Sessions lasting $\ge 300\text{ seconds}$ ($\ge 5\text{ minutes}$) display "Review Partner" form (rating 1–5 stars and text feedback).
  - Sessions under 300 seconds show an advisory: *"Session under 5 minutes (300 seconds): recorded in private history without public review eligibility."*
  - Submitting a review disables duplicate submissions.
- **Later Working-V1 Acceptance Criteria**:
  - Schema enforces `UNIQUE (session_id, reviewer_id)`.
  - Server rejects review creation if `session.counted_duration_seconds < 300` or if reviewer is not a session participant.
  - For public profile aggregation, at most 1 review per reviewer-recipient pair per UTC day is counted to prevent review stuffing.
  - Fixture S-01 defines short-session non-qualification.

### FR-14: Private Study History
- **Classification**: Confirmed / P0
- **Summary**: Detailed session history, counted durations, partner names, and private notes are accessible only to the account owner.
- **Immediate Prototype Acceptance Criteria**:
  - "Study History" tab displays a chronological log of all completed/cancelled sessions for current persona.
  - Switching to another persona hides the previous persona's history.
- **Later Working-V1 Acceptance Criteria**:
  - `GET /api/v1/users/me/sessions` retrieves private history for the authenticated user only.
  - `GET /api/v1/users/:id/sessions` returns HTTP 403 Forbidden for other learners. Administrators have no general browsing access; chat records are accessible only within the context of an active moderation report.

### FR-15: Profile Privacy and Partner Visibility
- **Classification**: Confirmed / P0 *(Default-private partner list: Confirmed; opt-in toggle: Confirmed)*
- **Summary**: Previous study partners and detailed study logs are private by default; public profiles show only aggregated statistics unless explicitly opted-in.
- **Immediate Prototype Acceptance Criteria**:
  - Privacy settings panel features a toggle: "Show Previous Partners on Public Profile" (default: Off).
  - When toggled off, visiting the user's public profile shows reputation stats but hides specific partner handles.
- **Later Working-V1 Acceptance Criteria**:
  - Profile response serializer conditionally omits `past_partners` array based on `users.privacy_show_partners` boolean.

### FR-16: Blocking and Misuse Reporting
- **Classification**: Confirmed in proposal / P0
- **Summary**: Learners can block abusive peers and submit reports to platform moderators. Blocking stops future contact, not access to existing session records.
- **Immediate Prototype Acceptance Criteria**:
  - Partner profile and chat menu include "Block User" and "Report User" actions.
  - Blocking a user immediately cancels any scheduled session between the pair, halts active session chat, and suppresses their listings from search.
  - Both participants retain read-only access to their shared session archive after blocking.
  - Administrator persona view displays an incoming report queue.
- **Later Working-V1 Acceptance Criteria**:
  - Blocking stops future contact, not access to a participant’s existing records.
  - Both participants retain read-only access to their shared session archive after blocking. Other learners and friends have no access. Administrators may access relevant chat evidence only through an active moderation report filed by a participant.
  - Blocking disables new shared-outcome edits and confirmations between the pair. Existing outcomes remain readable. Reporting remains available. Eligible post-session reviews remain governed by FR-13 and do not reopen chat.
  - A scheduled shared session becomes `cancelled`, with no charge. An active shared session ends using reason `blocked`, subject to any earlier effective termination boundary. Its accrued usage is finalized once.
  - Fixture P-01 defines blocking permissions and terminal state.

### FR-17: Session Timing, Early-Start Guard & Cancellation
- **Classification**: Confirmed start/end / Proposed 60s grace & late-start rules / P0
- **Summary**: Sessions cannot start before `scheduled_start`. Scheduled end is fixed (`scheduled_start + duration`). Late starts cap duration at `scheduled_end`. Scheduled sessions can be cancelled without penalty.
- **Immediate Prototype Acceptance Criteria**:
  - Start button disabled before `scheduled_start`.
  - Cancelling a scheduled session marks it "Cancelled" and awards 0 counted minutes.
  - Late start demo: booked 14:00–15:00, started at 14:08, automatically ends at 15:00, crediting at most 52 minutes.
- **Later Working-V1 Acceptance Criteria**:
  - Server-enforced start guard rejects start calls where `NOW() < scheduled_start_time`.
  - Server terminates active session at `scheduled_end` regardless of late start.
  - 60-second grace timer for lost presence; terminates with `connection_interruption` if reconnect fails.

### FR-18: Peer Friendship Management
- **Classification**: Confirmed / P1
- **Summary**: Learners can send, accept, decline, and remove friend connections. Friendship modulates social presence without bypassing private study history.
- **Immediate Prototype Acceptance Criteria**:
  - Profile features "Add Friend" action. Target persona receives notification with "Accept" / "Decline".
  - Accepted friends appear in a dedicated "Study Friends" list. Friendship does not expose private history.
- **Later Working-V1 Acceptance Criteria**:
  - `friendships` table maintains `(user_id, friend_id, status)` with status in `pending`, `accepted`, `declined`.
  - Friendship status does not bypass private study history access restrictions (NFR-01).

### FR-19: Transparent Reputation Indicators
- **Classification**: Confirmed concept / Model Proposed / P1
- **Summary**: Public profiles display transparent, decomposed indicators rather than an opaque unified mastery score.
- **Immediate Prototype Acceptance Criteria**:
  - Profile displays discrete metric tiles:
    1. *Eligible Completed Sessions* (count of sessions $\ge 5\text{ min}$)
    2. *Total Accounted Study Time* (hours/minutes)
    3. *Average Partner Rating* (stars + count of unique reviews)
    4. *Confirmed Study Topics* (count of mutually approved outcomes)
- **Later Working-V1 Acceptance Criteria**:
  - Aggregation queries compute statistics from verified records. Unconfirmed notes or sessions $<5\text{ min}$ are strictly excluded.
  - Aggregation applies a cap of at most 1 review rating per reviewer-recipient pair per UTC day.

---

## 3. Non-Functional Requirements (NFR)

| ID | Requirement | Category | Target / Specification | Observable Verification Check (Pass/Fail) | Milestone Applicability |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **NFR-01** | **Authorization & Data Privacy** | Security | RBAC and ReBAC enforcing owner privacy on history, private notes, and messages. | **Pass**: Automated integration tests assert HTTP 403 when User A queries User B's `/sessions`, `/responses`, or session chat room. | Later Working-V1 (Not proven by prototype persona mocks) |
| **NFR-02** | **Data Integrity & Concurrency** | Integrity | Concurrency controls prevent double-booking, cross-listing schedule collisions, and duplicate session finalization. | **Pass**: Same-listing and cross-listing acceptance races satisfy C-01–C-04. Repeated finalization creates exactly one ledger row per participant per positively charged UTC date, with unchanged values on retry. Fixtures A-01–A-07 are specification expectations until executable tests exist. | Later Working-V1 (Requires PostgreSQL row locks) |
| **NFR-03** | **Responsive Viewport Support** | Usability | Responsive layout supporting mobile ($360\text{ px}$) and desktop ($1280\text{ px}$) viewports without horizontal scrolling. | **Pass**: Playwright/Cypress viewport tests verify 0 horizontal scroll overflow on core journey pages at 360px and 1280px widths. | Immediate Prototype & Working-V1 |
| **NFR-04** | **Usability & Accessibility** | Accessibility | Keyboard navigability, visible focus rings, explicit form labels, and distinguishable error messages. | **Pass**: Complete core journey operable via keyboard navigation alone (Tab, Shift+Tab, Enter, Space); automated Axe/Lighthouse accessibility score $\ge 90$. | Immediate Prototype & Working-V1 |
| **NFR-05** | **Discovery Performance** | Performance | Listing discovery API response latency p95 under $1,000\text{ ms}$ with $1,000$ open listings and $10$ concurrent clients. | **Pass**: K6 / Autocannon benchmark against `/api/v1/channels/:id/listings?sort=compatibility` achieves p95 $< 1000\text{ ms}$ on reference test environment. | Later Working-V1 |
| **NFR-06** | **Deployment Reproducibility** | DevOps | Deterministic local setup from a clean checkout using documented scripts and fictional seed data. | **Pass**: An independent reviewer executes documented setup commands (`npm install`, `npm run seed`, `npm test`) without manual code edits or external secrets. | Immediate Prototype (Demo setup) & Working-V1 |
| **NFR-07** | **Security Hygiene & Cryptography** | Security | Zero committed secrets; robust cryptographic password hashing; strict server payload validation. | **Pass**: Repository secret scanning (`git-secrets` / `trufflehog`) passes with 0 findings; passwords hashed using bcrypt (cost $\ge 12$) or argon2id; input payloads validated server-side. | Immediate Prototype (Zero secrets) & Working-V1 |

---

## 4. Formal Acceptance Test Fixtures (Specification Fixtures)

> *Notice: These fixtures define the precise mathematical, temporal, and access boundaries required by this specification. They serve as formal specification benchmarks until executable automated test suites are implemented in Batch 7.*

### 4.1 Acceptance Concurrency Fixtures (FR-09, NFR-02)

| ID | Scenario | Expected result |
| --- | --- | --- |
| **C-01: Cross-listing race** | A accepts P on listing X, 14:00–15:00. Simultaneously B accepts P on listing Y, 14:30–15:30. | Both transactions require P’s user-row lock. One commits; the other subsequently detects the committed overlap and returns `409 SCHEDULE_CONFLICT`. Exactly one booking exists. |
| **C-02: Back-to-back bookings** | Same participants are booked 14:00–15:00 and 15:00–16:00. | No overlap solely from the shared endpoint. |
| **C-03: Withdrawal race** | Author accepts while respondent withdraws. | One serial ordering applies. A response cannot finish as withdrawn while its acceptance simultaneously creates a valid session. |
| **C-04: Block race** | Author accepts while either party blocks the other. | Acceptance either fails, or its resulting scheduled session is cancelled by the block transaction. No usable shared booking survives. |

### 4.2 Accounting Fixtures (FR-11, NFR-02)

*(All remaining-allowance values refer to both learners unless stated otherwise).*

| ID | Input | Expected outcome |
| --- | --- | --- |
| **A-01: Exact-midnight exhaustion** | Booked 23:45–00:30. A has exactly 900 seconds remaining on Day 1; B has 3,600. Start 23:45. | End at 00:00 with `allowance_exhaustion`. Charge 900 seconds to each participant on Day 1. No Day 2 rows. Session does not restart after reset. |
| **A-02: Sufficient allowance across midnight** | Same booking; both have 3,600 seconds remaining on Day 1. | End 00:30. Each participant receives Day 1 charge 900 and Day 2 charge 1,800. Total 2,700 seconds. |
| **A-03: Scheduled end at midnight** | Booked 23:45–00:00; both have 3,600 seconds remaining. | End 00:00 with `scheduled_end`; charge 900 seconds on Day 1 only. |
| **A-04: End/exhaustion tie** | Same booking as A-03; A has exactly 900 seconds remaining. | End 00:00 with `allowance_exhaustion` under the tie rule. Same 900-second charges; no Day 2 rows. |
| **A-05: Delayed finalization** | Start 14:00; booked end 15:00. A has 600 seconds remaining. Worker runs at 14:12:07. | Effective end 14:10, reason `allowance_exhaustion`; charge 600 seconds each, not 727. Messages at or after 14:10 are rejected. |
| **A-06: Seconds without rounding** | Start 14:00:00; authorized manual end 14:00:31. | Charge exactly 31 seconds each. No rounding to 60 seconds. |
| **A-07: Retry** | Finalize A-02 twice, including concurrent requests. | Four ledger rows total: two participants × two positive-day segments. Repeated calls return the same final state and charges. |
| **S-01: Non-rounded short session** | The 31-second session in A-06. | Produces two 31-second ledger rows, a session duration of 31, and no review eligibility ($31 < 300$). Its daily charge is not rounded to one minute. |

### 4.3 Version-Safe Outcome Fixtures (FR-12)

| ID | Scenario | Expected result |
| --- | --- | --- |
| **O-01: Initial confirmation** | A submits v1. B confirms expected v1. | After submission: A=v1, B=null. After confirmation: both=v1; mutually confirmed. |
| **O-02: Edit wins race** | B has read v1. A edits with expected v1 and creates v2. B then confirms expected v1. | B receives 409. Current content remains v2; A=v2, B=null; not mutually confirmed. |
| **O-03: Confirmation wins race** | B confirms v1 before A’s edit transaction. A then edits using expected v1. | v1 is briefly confirmed; edit creates v2 and invalidates old approvals. Final state: A=v2, B=null. No v2 confirmation is inherited. |

### 4.4 Availability, Response, Matching & Permissions Fixtures

- **Fixture V-01 (Dated Availability Coverage, FR-02)**: Slots 14:00–14:30 and 14:30–15:00 cover a 14:00–15:00 listing. Slots ending 14:29 and starting 14:30 do not. A subsequent profile-timezone change leaves stored instants unchanged.
- **Fixture R-01 (Response Row Reuse, FR-08)**: Respond, withdraw, and re-respond to an open listing. Exactly one row exists throughout; its state becomes `pending → withdrawn → pending`.
- **Fixture M-01 (Compatibility Scoring & Missing Inputs, FR-07)**: Viewer tags `{derivatives, limits}`, listing tags `{derivatives, integrals}`, shared goal, viewer level 1, author level 2 produce $100 \times (0.40 \times (1/3) + 0.35 \times 1.0 + 0.25 \times 0.5) = 60.8 / 100$. Empty viewer tags suppress scoring. Changing the author’s profile level later does not alter the stored listing level.
- **Fixture P-01 (Blocking and Archive Access, FR-16)**: A blocks B during an active session. Sending further messages and confirming shared outcomes fails. Both retain read-only archive access. Learner C cannot read the archive. An administrator without an applicable report cannot read it. The final reason is `blocked` unless an earlier boundary already ended the session.
- **Fixture TF-01: Late Start Duration Cap (FR-17)**: Listing booked for 14:00 to 15:00 UTC (duration: 60 minutes). Both participants connect and confirm start at 14:08 UTC. Session auto-terminates at 15:00 UTC. `counted_duration_seconds` is exactly $3,120\text{ s}$ ($52\text{ minutes}$). Neither user receives credit for the 8 minutes elapsed prior to actual start.
- **Fixture TF-04: Unauthorized Private Data Access (FR-01, FR-14, NFR-01)**: Learner B issues `GET /api/v1/users/{LearnerA_id}/sessions`. Server returns HTTP 403 Forbidden. Learner A's private history, session partner names, and personal notes are completely excluded from the response.
