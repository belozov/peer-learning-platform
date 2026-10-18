# Requirements Specification: Functional & Non-Functional Catalog

## 1. Document Overview and Conventions

### 1.1 Purpose
This specification defines the formal functional requirements (FR) and non-functional requirements (NFR) for the **Compatibility-Based Peer Learning Platform**. It establishes unambiguous verification criteria, prioritizing features into core milestone capabilities, supporting functions, and deferred items.

### 1.2 Priority and Scope Taxonomy
- **P0 (Core V1 Requirement)**: Essential for the core learner journey (discovery → scheduling → accounted session → mutual outcome).
- **P1 (Supporting V1 Requirement)**: Secondary social and reputation features implemented following core flow stabilization.
- **Deferred**: Explicitly excluded from V1 commitments (e.g., payment processing, native video streaming, recurring series).

### 1.3 Two-Tier Acceptance Criteria Framework
To align with the milestone delivery boundaries, every requirement defines two distinct evaluation criteria:
1. **Immediate Prototype Acceptance Criteria**: Observable behaviors demonstrated in the milestone demonstration prototype using structured seed data and explicit simulation banners where backend operations are mocked.
2. **Later Working-V1 Acceptance Criteria**: Production criteria requiring database transactions, persistent state, API responses, and automated integration test validation.

---

## 2. Functional Requirements Catalog

### FR-01: Accounts and Identity Management
- **Classification**: Confirmed / P0
- **Summary**: Learners and administrators can register, authenticate, manage sessions, and modify their own identity records.
- **Immediate Prototype Acceptance Criteria**:
  - Demonstration UI allows switching between at least two fictional learner personas (e.g., Alice, Bob) and one Administrator.
  - The profile editor allows editing bio, timezone, and display name, immediately updating the UI state.
  - An active persona cannot access the edit controls of another learner's profile.
- **Later Working-V1 Acceptance Criteria**:
  - Secure registration and authentication via bcrypt/argon2 password hashing and JWT/session cookies.
  - API endpoint `PUT /api/v1/users/me` enforces authorization; attempting `PUT /api/v1/users/:id` with another user's ID returns HTTP 403 Forbidden.
  - Passwords and sensitive credentials are never returned in user DTOs.

### FR-02: Structured Learning Preferences
- **Classification**: Confirmed / P0
- **Summary**: Profiles record explicit, topic-specific knowledge levels, learning goals, spoken languages, and weekly availability intervals.
- **Immediate Prototype Acceptance Criteria**:
  - Profile UI displays structured inputs: Topic dropdown (Python, English, Math), Level (1–3), Goal Category, Languages spoken, and Availability time blocks.
  - Missing preferences are visibly flagged with an inline warning rather than silently filled with default assumptions.
- **Later Working-V1 Acceptance Criteria**:
  - Preferences persist in `learning_preferences` and `availability_slots` tables.
  - API validates that availability slots specify valid weekday integers (0–6), start/end times in UTC, and non-empty language arrays.
  - Database schema enforces unique `(user_id, topic_id)` pairs.

### FR-03: Topic Communities and Channels
- **Classification**: Confirmed / P0
- **Summary**: Hierarchical organization into Communities managed by administrators and Channels accessible to learners.
- **Immediate Prototype Acceptance Criteria**:
  - UI displays communities (e.g., "Computer Science", "Languages") containing specific topic channels (e.g., "Python Basics", "IELTS Prep").
  - Learner personas can click "Join Channel" and "Leave Channel", toggling membership state visually.
  - Community creation interface is visible only when viewing as the Administrator persona.
- **Later Working-V1 Acceptance Criteria**:
  - `POST /api/v1/communities` requires `admin` role (returns 403 for standard learners).
  - Authenticated learners can create topic channels within communities: `POST /api/v1/communities/:id/channels`.
  - Channel memberships are persisted in `channel_memberships` table with unique constraint on `(user_id, channel_id)`.

### FR-04: Channel Membership Access Gate
- **Classification**: Confirmed / P0
- **Summary**: Partner discovery, listing creation, and responses are strictly restricted to verified channel members.
- **Immediate Prototype Acceptance Criteria**:
  - Viewing a channel as a non-member disables or hides the "Create Study Listing" and "Find Study Partner" actions, prompting the user to join.
  - Clicking "Join Channel" immediately unlocks the discovery interface and listing forms.
- **Later Working-V1 Acceptance Criteria**:
  - API middleware rejects listing queries or creation attempts with HTTP 403 if `user_id` does not exist in `channel_memberships` for that channel.
  - Listing feeds automatically filter based on authenticated user channel memberships.

### FR-05: Channel Discussion Posts
- **Classification**: Confirmed / P0 *(Author edit/delete and admin moderation: Proposed)*
- **Summary**: Channel members can publish plain text and external link posts categorized by post type.
- **Immediate Prototype Acceptance Criteria**:
  - Members can create posts with mandatory category selection: `question`, `explanation`, `material`, or `progress`.
  - Personas can edit or delete their own posts; other personas see only report actions.
  - Administrator persona displays a "Hide Post" moderation action.
- **Later Working-V1 Acceptance Criteria**:
  - Server validates post payload: body length between 10 and 5,000 characters; post type must match enum.
  - Database stores posts with `hidden_at` and `deleted_at` timestamps for soft-deletion.
  - Unauthorized update attempts return HTTP 403 Forbidden.

### FR-06: Study Listings Creation
- **Classification**: Confirmed / P0 *(Learning goal field and structured topic tags: Proposed)*
- **Summary**: Channel members can publish a structured study listing specifying learning goals, topic tags, date, start time, duration, and language.
- **Immediate Prototype Acceptance Criteria**:
  - Creation form validates required fields: Topic tag selection, Goal category, Date/time picker, Duration dropdown (e.g., 30, 45, 60 minutes), and Language.
  - Selecting a past date/time displays an immediate client validation error preventing submission.
- **Later Working-V1 Acceptance Criteria**:
  - API validates that `scheduled_start_time` is in the future (UTC) and `duration_minutes` is between 15 and 180.
  - The database records the listing with status `open` and sets a foreign key reference to `author_id` and `channel_id`.
  - Creating a listing with overlapping times against the author's own active/accepted sessions is rejected with HTTP 409 Conflict.

### FR-07: Search, Discovery, and Compatibility Ranking
- **Classification**: Confirmed / P0
- **Summary**: Learners can browse open listings, toggle between chronological and compatibility-ranked ordering, and view transparent score justifications.
- **Immediate Prototype Acceptance Criteria**:
  - Discovery view provides a toggle: "Sort by Compatibility" vs. "Sort by Newest".
  - Compatibility mode displays scores (0–100%) computed via the formula, alongside an explicit human-readable badge (e.g., *"Same topic, shared language, full time overlap, adjacent level"*).
  - Missing learner preferences display a prompt banner to complete preferences, falling back gracefully to chronological ordering.
- **Later Working-V1 Acceptance Criteria**:
  - API endpoint `GET /api/v1/channels/:id/listings?sort=compatibility` executes deterministic ranking using pure scoring functions.
  - Hard filters exclude listings where language does not match, times conflict, or either party has blocked the other.
  - Execution time complies with performance target NFR-05 (p95 < 1000ms for 1,000 listings).

### FR-08: Responses to Study Listings
- **Classification**: Confirmed / P0 *(Self-response and duplicate response rejection: Proposed)*
- **Summary**: Eligible channel members can submit a response to an open listing and withdraw it prior to acceptance.
- **Immediate Prototype Acceptance Criteria**:
  - Learner persona can click "Respond" on another member's listing, changing status to "Response Pending".
  - The listing author sees incoming responses with the respondent's compatibility score and profile preview.
  - Author cannot respond to their own listing (button disabled or hidden).
  - Respondent can click "Withdraw Response", restoring the listing to unresponded state.
- **Later Working-V1 Acceptance Criteria**:
  - `POST /api/v1/listings/:id/responses` checks unique constraint `(listing_id, respondent_id)`.
  - Submissions from the listing author return HTTP 400 Bad Request (`CANNOT_RESPOND_TO_OWN_LISTING`).
  - Active responses persist with status `pending`.

### FR-09: Single Partner Acceptance Workflow
- **Classification**: Confirmed / P0
- **Summary**: The listing author can accept exactly one respondent; acceptance locks the partnership and automatically declines other active responses.
- **Immediate Prototype Acceptance Criteria**:
  - Author can click "Accept" next to a respondent.
  - Upon acceptance, the listing status updates to "Matched", a scheduled session card appears for both participants, and other candidate responses display "Closed / Not Selected".
  - Attempting to accept a second respondent is prevented.
- **Later Working-V1 Acceptance Criteria**:
  - Database transaction executes acceptance atomically with row-level locking (`SELECT FOR UPDATE` on listing).
  - If two acceptances occur concurrently, exactly one succeeds; the second receives HTTP 409 Conflict.
  - Transaction creates a row in `sessions` with status `scheduled`, updates listing to `matched`, and transitions other responses to `declined`.

### FR-10: Synchronous Session Text Chat
- **Classification**: Confirmed / P0
- **Summary**: Accepted study partners communicate via an exclusive, time-bounded text chat channel.
- **Immediate Prototype Acceptance Criteria**:
  - Chat room is accessible only to the accepted pair.
  - UI shows message composer, message log, and a visible simulation banner indicating simulated WebSocket delivery.
  - Sending messages is disabled prior to session start and after session conclusion.
- **Later Working-V1 Acceptance Criteria**:
  - WebSocket gateway authenticates connections and verifies user is in `session.participant_ids`.
  - Message exchange is rejected by the server if `session.status != 'active'`.
  - Messages persist in `session_messages` with server timestamps; external observers cannot connect to the socket room.

### FR-11: Daily Study Allowance Accounting
- **Classification**: Confirmed / P0 *(180 min allowance, UTC boundary: Proposed)*
- **Summary**: Each free learner has a daily study allowance of 180 minutes. Active session time decrements the remaining allowance in real time.
- **Immediate Prototype Acceptance Criteria**:
  - Header displays "Remaining Daily Allowance: 180 min".
  - Simulated active session increments timer and decrements allowance indicator.
  - When remaining allowance reaches 0, the session ends automatically with an "Allowance Exhausted" modal, disabling further chat.
- **Later Working-V1 Acceptance Criteria**:
  - Server maintains `usage_ledgers` recording counted minutes apportioned by UTC date (`00:00–24:00 UTC`).
  - Active sessions are terminated server-side when `MIN(participantA_remaining, participantB_remaining) <= 0`.
  - Attempting to start a session with 0 remaining allowance returns HTTP 403 Forbidden.

### FR-12: Session Outcome Confirmation
- **Classification**: Confirmed / P0 *(Mutual dual-approval requirement: Proposed)*
- **Summary**: Participants record covered topics and learning notes, which become mutually confirmed outcomes only when both partners approve the identical text.
- **Immediate Prototype Acceptance Criteria**:
  - Post-session view displays "Session Outcomes".
  - Partner A enters topics covered and clicks "Submit for Confirmation".
  - Partner B sees "Confirm Partner Notes" button; clicking it marks the outcome as "Mutually Confirmed".
  - Editing notes resets confirmation status until re-approved.
- **Later Working-V1 Acceptance Criteria**:
  - Schema stores `session_outcomes` with `version`, `author_id`, `topics_covered`, and `confirmed_by_partner_at`.
  - Any edit increments version and nullifies partner confirmation timestamp.
  - Mutually confirmed outcomes become eligible for public reputation aggregation.

### FR-13: Partner Evaluation and Reviews
- **Classification**: Confirmed / P0 *(1 review per participant, 5-min minimum threshold: Proposed)*
- **Summary**: Following a completed session that meets the minimum active duration, participants can submit an evaluation and review.
- **Immediate Prototype Acceptance Criteria**:
  - Sessions lasting $\ge 5\text{ minutes}$ display a "Review Partner" form (rating 1–5 stars and text feedback).
  - Sessions terminated under 5 minutes show an informational note: *"Session under 5 minutes: recorded in private history without review eligibility."*
  - Submitting a review prevents duplicate submissions.
- **Later Working-V1 Acceptance Criteria**:
  - Database enforces unique constraint on `(session_id, reviewer_id)`.
  - Server rejects review creation if `session.counted_duration_seconds < 300` or if reviewer is not a session participant.
  - Reviews persist with recipient foreign key for aggregated profile display.

### FR-14: Private Study History
- **Classification**: Confirmed / P0
- **Summary**: Detailed session history, counted durations, partner names, and private notes are accessible only to the account owner.
- **Immediate Prototype Acceptance Criteria**:
  - "Study History" tab displays a chronological log of all completed/cancelled sessions for the current persona.
  - Switching to another persona hides the previous persona's history.
- **Later Working-V1 Acceptance Criteria**:
  - Endpoint `GET /api/v1/users/me/sessions` retrieves private history for the authenticated user only.
  - Queries for `GET /api/v1/users/:id/sessions` return HTTP 403 Forbidden for non-admin callers.

### FR-15: Profile Privacy and Partner Visibility
- **Classification**: Confirmed / P0 *(Default-private partner list: Proposed)*
- **Summary**: Previous study partners and detailed study logs are private by default; public profiles show only high-level aggregated statistics unless explicitly opted-in.
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
  - Blocking a user immediately prevents their listings from appearing in the blocker's discovery feed.
  - Administrator persona view displays an incoming report queue.
- **Later Working-V1 Acceptance Criteria**:
  - `POST /api/v1/blocks` inserts a record into `user_blocks`.
  - Search queries join `user_blocks` to eliminate any listings authored by or visible to blocked pairs.
  - Reports persist in `moderation_reports` with foreign keys to reporter, reported user, and session context.

### FR-17: Session Cancellation and Failure States
- **Classification**: Proposed / P0
- **Summary**: Participants can cancel scheduled sessions or handle no-shows without penalty to allowances.
- **Immediate Prototype Acceptance Criteria**:
  - Scheduled session card provides a "Cancel Session" button with reason selection (`schedule_conflict`, `illness`, `partner_unresponsive`).
  - Cancelling transitions session to "Cancelled" state, removes scheduled calendar block, and awards 0 counted minutes.
- **Later Working-V1 Acceptance Criteria**:
  - Server transitions session status to `cancelled` and frees both participants' availability locks.
  - No records are inserted into `usage_ledgers` for cancelled or no-show sessions.
  - If a participant does not join within 10 minutes of scheduled start, session can be finalized as `no_show`.

### FR-18: Peer Friendship Management
- **Classification**: Confirmed / P1
- **Summary**: Learners can send, accept, decline, and remove friend connections. Friendship modulates social access without exposing private history.
- **Immediate Prototype Acceptance Criteria**:
  - Profile features "Add Friend" action.
  - Target persona receives a notification with "Accept" / "Decline" choices.
  - Accepted friends appear in a dedicated "Study Friends" list.
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
  - Aggregation queries compute statistics dynamically or via materialized views from verified records.
  - Unconfirmed session notes or sessions $<5\text{ min}$ are strictly excluded from reputation counts.

---

## 3. Non-Functional Requirements (NFR)

| ID | Requirement | Category | Target / Specification | Observable Verification Check (Pass/Fail) |
| :-: | :--- | :--- | :--- | :--- |
| **NFR-01** | **Authorization & Data Privacy** | Security | Role-Based & Relationship-Based Access Control enforcing owner privacy on history, private notes, and messages. | **Pass**: Automated tests assert HTTP 403 when User A requests User B's `/sessions`, `/responses`, or session chat room. |
| **NFR-02** | **Data Integrity & Concurrency** | Integrity | Concurrency controls prevent double-booking, race conditions in partner acceptance, and duplicate session finalization. | **Pass**: Simulating 10 concurrent acceptances on one listing creates exactly 1 session; repeated finalize requests yield identical ledger records. |
| **NFR-03** | **Responsive Viewport Support** | Usability | Responsive design supporting standard mobile ($360\text{ px}$) and desktop ($1280\text{ px}$) viewports without horizontal scrolling. | **Pass**: Playwright/Cypress viewport tests verify 0 horizontal scroll overflow on core journey pages at 360px and 1280px widths. |
| **NFR-04** | **Usability & Accessibility** | Accessibility | Keyboard navigability, clear focus rings, explicit form labels, and distinguishable error messages. | **Pass**: Core journey operable via keyboard navigation (Tab, Enter, Space); automated Axe/Lighthouse accessibility score $\ge 90$. |
| **NFR-05** | **Discovery Performance** | Performance | Listing discovery API response latency p95 under $1,000\text{ ms}$ with $1,000$ open listings and $10$ concurrent clients. | **Pass**: K6/Autocannon benchmark script against `/api/v1/channels/:id/listings?sort=compatibility` achieves p95 $< 1000\text{ ms}$. |
| **NFR-06** | **Deployment Reproducibility** | DevOps | Deterministic local setup from a clean Git checkout using documented environment scripts and fictional seed data. | **Pass**: An independent evaluator executes `npm install`, `npm run seed`, and `npm test` without manual code edits or external secrets. |
| **NFR-07** | **Security Hygiene & Cryptography** | Security | Zero committed secrets; robust cryptographic password hashing and strict input validation. | **Pass**: Git history scanner (`git-secrets` / `trufflehog`) passes with 0 findings; passwords hashed using bcrypt (cost $\ge 12$) or argon2. |
