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
- **Classification**: Confirmed / P0
- **Summary**: Profiles record explicit, topic-specific knowledge levels, learning goals, spoken languages, and weekly availability intervals.
- **Immediate Prototype Acceptance Criteria**:
  - Profile UI displays structured inputs: Topic dropdown (Python, English, Math), Knowledge Level (1: Beginner, 2: Intermediate, 3: Advanced), Goal Category, Spoken Languages, and Availability time blocks.
  - Missing preferences are visibly flagged with an inline prompt; no default preferences are silently assumed.
- **Later Working-V1 Acceptance Criteria**:
  - Preferences persist in `learning_preferences` with a unique constraint on `(user_id, topic)`.
  - Availability intervals are modeled as half-open intervals $[t_{\text{start}}, t_{\text{end}})$ with local timezone storage, preventing back-to-back booking false conflicts.

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
  - Listing persists with status `open`. Creating a listing with times overlapping the author's own active/scheduled sessions is rejected with HTTP 409 Conflict.

### FR-07: Search, Discovery, and Compatibility Ranking
- **Classification**: Confirmed / P0
- **Summary**: Channel members can browse open listings, toggle between chronological and compatibility-ranked ordering, and view transparent score justifications.
- **Immediate Prototype Acceptance Criteria**:
  - Discovery view provides a toggle: "Sort by Compatibility" vs. "Sort by Newest".
  - Both sort modes apply the exact same hard eligibility filters (language, availability, no blocks).
  - Compatibility mode displays scores out of 100 with 1 decimal place (e.g., `67.5 / 100`) and a decomposed explanation badge (e.g., *"Overlapping topic tags, shared study goal, adjacent knowledge level"*).
  - Missing learner preferences display an inline prompt to complete preferences, falling back gracefully to chronological ordering with no invented score.
- **Later Working-V1 Acceptance Criteria**:
  - `GET /api/v1/channels/:id/listings?sort=compatibility` executes deterministic ranking using pure scoring functions ($0.40T + 0.35G + 0.25L$).
  - Complies with performance target NFR-05 (p95 $< 1000\text{ ms}$ for 1,000 listings).

### FR-08: Responses to Study Listings
- **Classification**: Confirmed / P0 *(Self-response rejection and withdrawal/re-response: Proposed)*
- **Summary**: Eligible channel members can submit a response to an open listing, withdraw a pending response, and re-respond if the listing remains open.
- **Immediate Prototype Acceptance Criteria**:
  - Learner persona can click "Respond" on another member's listing; status updates to "Response Pending".
  - The listing author sees incoming responses with the respondent's compatibility score and profile preview.
  - Listing author cannot respond to their own listing (action disabled).
  - Respondent can click "Withdraw Response", restoring the listing to unresponded state. If still open, respondent can re-respond.
- **Later Working-V1 Acceptance Criteria**:
  - `POST /api/v1/listings/:id/responses` enforces unique active constraint `(listing_id, respondent_id)` where `status = 'pending'`.
  - Self-responses return HTTP 400 Bad Request (`CANNOT_RESPOND_TO_OWN_LISTING`).

### FR-09: Single Partner Acceptance Workflow
- **Classification**: Confirmed / P0
- **Summary**: The listing author can accept exactly one respondent. Acceptance atomically locks the session, rechecks eligibility, and auto-declines other candidates.
- **Immediate Prototype Acceptance Criteria**:
  - Author clicks "Accept" next to a respondent.
  - Listing updates to "Matched", a scheduled session card appears for both participants, and other candidate responses show "Closed / Not Selected".
  - Attempting to accept a second respondent is prevented.
- **Later Working-V1 Acceptance Criteria**:
  - Database transaction executes acceptance with row-level locking (`SELECT FOR UPDATE` on listing).
  - Transaction atomically re-verifies: channel membership, absence of active blocks, pending state of response, future start time, and **schedule availability for BOTH participants across all listings**.
  - Two simultaneous acceptance attempts cannot create two partnerships; exactly one succeeds and the other receives HTTP 409 Conflict.

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
- **Classification**: Confirmed / P0 *(180 min allowance: Confirmed; UTC reset: Proposed)*
- **Summary**: Each free learner has a confirmed daily study allowance of 180 minutes. Active session time decrements the remaining allowance in real time.
- **Immediate Prototype Acceptance Criteria**:
  - Header displays "Remaining Daily Allowance: 180 min".
  - Active session increments elapsed timer and decrements allowance indicator.
  - When remaining allowance reaches 0, session ends automatically with an "Allowance Exhausted" modal, disabling further chat.
- **Later Working-V1 Acceptance Criteria**:
  - Server maintains `usage_ledgers` recording counted minutes apportioned by UTC date (`00:00–24:00 UTC`).
  - Active sessions are terminated server-side when either participant reaches 0 remaining allowance.
  - Sessions spanning across 00:00 UTC split counted minutes into respective UTC days atomically.

### FR-12: Session Outcome Confirmation
- **Classification**: Confirmed / P0 *(Dual-approval versioned locking: Proposed)*
- **Summary**: Participants record covered topics and learning notes. Topics become mutually confirmed outcomes only when both partners approve the identical version.
- **Immediate Prototype Acceptance Criteria**:
  - Post-session view displays "Session Outcomes".
  - Partner A enters topics covered and clicks "Submit for Confirmation".
  - Partner B sees "Confirm Partner Notes" button; clicking it marks outcome as "Mutually Confirmed".
  - Editing notes resets confirmation status until re-approved.
- **Later Working-V1 Acceptance Criteria**:
  - Schema stores `session_outcomes` with `version`, `topics_covered`, and `partner_confirmed_at`.
  - Modifying outcome text increments version and nullifies partner confirmation timestamp.
  - Session status remains terminal at `ended`; outcome status is tracked independently.

### FR-13: Partner Evaluation and Reviews
- **Classification**: Confirmed / P0 *(1 review per participant, 5-min minimum threshold: Proposed)*
- **Summary**: Following a completed session meeting the minimum active duration, participants can submit an evaluation and review.
- **Immediate Prototype Acceptance Criteria**:
  - Sessions lasting $\ge 5\text{ minutes}$ display "Review Partner" form (rating 1–5 stars and text feedback).
  - Sessions under 5 minutes show an advisory: *"Session under 5 minutes: recorded in private history without public review eligibility."*
  - Submitting a review disables duplicate submissions.
- **Later Working-V1 Acceptance Criteria**:
  - Schema enforces `UNIQUE (session_id, reviewer_id)`.
  - Server rejects review creation if `session.counted_duration_seconds < 300` or if reviewer is not a session participant.
  - For public profile aggregation, at most 1 review per reviewer-recipient pair per UTC day is counted to prevent review stuffing.

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
- **Summary**: Learners can block abusive peers and submit reports to platform moderators.
- **Immediate Prototype Acceptance Criteria**:
  - Partner profile and chat menu include "Block User" and "Report User" actions.
  - Blocking a user immediately cancels any scheduled session between the pair, halts active session chat, and suppresses their listings from search.
  - Administrator persona view displays an incoming report queue.
- **Later Working-V1 Acceptance Criteria**:
  - `POST /api/v1/blocks` inserts a record into `user_blocks`.
  - Search queries join `user_blocks` to eliminate listings authored by or visible to blocked pairs.
  - Active session blocking terminates the session with reason `manual_exit`, finalizes accrued time once, and locks chat.

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
| **NFR-02** | **Data Integrity & Concurrency** | Integrity | Concurrency controls prevent double-booking, race conditions in partner acceptance, and duplicate session finalization. | **Pass**: Simulating 10 concurrent acceptances on 1 listing creates exactly 1 session; repeated finalize requests commit exactly 1 ledger record. | Later Working-V1 (Requires PostgreSQL row locks) |
| **NFR-03** | **Responsive Viewport Support** | Usability | Responsive layout supporting mobile ($360\text{ px}$) and desktop ($1280\text{ px}$) viewports without horizontal scrolling. | **Pass**: Playwright/Cypress viewport tests verify 0 horizontal scroll overflow on core journey pages at 360px and 1280px widths. | Immediate Prototype & Working-V1 |
| **NFR-04** | **Usability & Accessibility** | Accessibility | Keyboard navigability, visible focus rings, explicit form labels, and distinguishable error messages. | **Pass**: Complete core journey operable via keyboard navigation alone (Tab, Shift+Tab, Enter, Space); automated Axe/Lighthouse accessibility score $\ge 90$. | Immediate Prototype & Working-V1 |
| **NFR-05** | **Discovery Performance** | Performance | Listing discovery API response latency p95 under $1,000\text{ ms}$ with $1,000$ open listings and $10$ concurrent clients. | **Pass**: K6 / Autocannon benchmark against `/api/v1/channels/:id/listings?sort=compatibility` achieves p95 $< 1000\text{ ms}$ on reference test environment. | Later Working-V1 |
| **NFR-06** | **Deployment Reproducibility** | DevOps | Deterministic local setup from a clean checkout using documented scripts and fictional seed data. | **Pass**: An independent reviewer executes documented setup commands (`npm install`, `npm run seed`, `npm test`) without manual code edits or external secrets. | Immediate Prototype (Demo setup) & Working-V1 |
| **NFR-07** | **Security Hygiene & Cryptography** | Security | Zero committed secrets; robust cryptographic password hashing; strict server payload validation. | **Pass**: Repository secret scanning (`git-secrets` / `trufflehog`) passes with 0 findings; passwords hashed using bcrypt (cost $\ge 12$) or argon2id; input payloads validated server-side. | Immediate Prototype (Zero secrets) & Working-V1 |

---

## 4. Formal Acceptance Test Fixtures (Specification Fixtures)

> *Notice: These fixtures define the precise mathematical, temporal, and access boundaries required by this specification. They serve as formal specification benchmarks until executable automated test suites are implemented in Batch 7.*

### Fixture TF-01: Late Start Duration Cap (FR-17)
- **Input**: Listing booked for 14:00 to 15:00 UTC (duration: 60 minutes).
- **Execution**: Both participants connect and confirm start at 14:08 UTC.
- **Expected Outcome**: Session auto-terminates at 15:00 UTC. `counted_duration_seconds` is exactly $3,120\text{ s}$ ($52\text{ minutes}$). Neither user receives credit for the 8 minutes elapsed prior to actual start.

### Fixture TF-02: Cross-Midnight Usage & Precedence (FR-11)
- **Input**: Session booked for 23:45 UTC (Day 1) to 00:30 UTC (Day 2) (duration: 45 minutes).
- **Case A (Sufficient Allowance)**: Both users have 60 min remaining on Day 1.
  - *Expected Outcome*: Day 1 ledger charged 15 minutes; Day 2 ledger charged 30 minutes from replenished 180 min allowance.
- **Case B (Exhaustion Precedence)**: User A has only 10 min remaining on Day 1.
  - *Expected Outcome*: Session terminates at 23:55 UTC (`end_reason = 'allowance_exhaustion'`). Day 1 charged 10 minutes. Day 2 charged 0 minutes (session never reaches 00:00 UTC).

### Fixture TF-03: Concurrency & Duplicate Finalization (FR-09, FR-11, NFR-02)
- **Input**: An active session reaches scheduled end. Both client tabs issue `POST /api/v1/sessions/:id/end` within 10 milliseconds.
- **Expected Outcome**: Exactly one database transaction commits `status = 'ended'`. Exactly one set of `usage_ledgers` records is created. The second request returns HTTP 200 with the already finalized session payload. Zero duplicate minutes are charged.

### Fixture TF-04: Unauthorized Private Data Access (FR-01, FR-14, NFR-01)
- **Input**: Learner B issues `GET /api/v1/users/{LearnerA_id}/sessions`.
- **Expected Outcome**: Server returns HTTP 403 Forbidden. Learner A's private history, session partner names, and personal notes are completely excluded from the response.

### Fixture TF-05: Compatibility Arithmetic & Display Rounding (FR-07)
- **Case 1 (Perfect Match)**: $T = 1.0, G = 1.0, L = 1.0 \implies 100 \times (0.40(1) + 0.35(1) + 0.25(1)) = 100.0$.
  - *Expected Display*: `Compatibility Score: 100.0 / 100`.
- **Case 2 (Partial Match)**: $T = 0.50, G = 1.0, L = 0.50 \implies 100 \times (0.40(0.5) + 0.35(1) + 0.25(0.5)) = 67.5$.
  - *Expected Display*: `Compatibility Score: 67.5 / 100`.
- **Case 3 (Missing Preferences)**: Viewer has not configured topic preference tags.
  - *Expected Display*: Compatibility score suppressed; chronological fallback with inline preference prompt.
