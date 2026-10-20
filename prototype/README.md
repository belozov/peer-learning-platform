# Peer Learning Platform - Interactive Website Prototype (Batch 4)

**Individual Diploma Project**  
**Student:** Zhumirov Bekzat (Жумиров Бекзат Ерболатулы)  
**Group:** SE-2416 (Software Engineering)  
**Supervisor:** Aigerim Kydyrbekova (Айгерим Кыдырбекова)  
**Task Branch:** `PLP-14-interactive-prototype-and-corrections`  

---

## 1. Overview & Architectural Scope

This prototype implements an interactive client-side simulation of the **Compatibility-Based Peer Learning Platform** according to the requirements of **Batch 4** and the corrections from **Astra Correction Package 2 and 3**.

It features fictional seed data, an in-memory transactional store, and strict state-machine enforcement of the **20 Astra Consolidated Invariants**, including:
1. **Confirmed vs. Proposed Status**: 180 min (10,800s) total daily study allowance is marked **Confirmed** (instruction requirement); UTC reset, 60s disconnection grace period, 300s review threshold, matching weights ($0.40T + 0.35G + 0.25L$), and mutual outcome confirmation are marked **Proposed**.
2. **Channel Membership Gating (Priority 1)**: In-memory channel membership records with Join/Leave interactions. Find a Partner is locked with an explicit call-to-action until the learner joins the channel.
3. **Pure Compatibility Matching**: Authoritative unrounded calculation ($0.40T + 0.35G + 0.25L$) formatted strictly as **`Score: 80.0 / 100`** (never percentage), sorting by unrounded score descending, then scheduled start ascending, then ID ascending.
4. **Missing Preferences Fallback**: When viewer or listing lacks required preferences (empty topic tags, null level/goal), compatibility scoring is disabled, the feed switches to chronological order (`created_at DESC, id ASC`), and the UI indicator updates to show chronological fallback without invented values ($T \neq 0.50$).
5. **Strict Listing Validation**: Required title, nonempty `topic_tags TEXT[]`, communication language, explicit author level (not defaulted), future start relative to demo clock, positive duration (15–180 minutes), and end after start.
6. **Response Row Reuse (Fixture R-01)**: Demonstrates withdrawal (`pending` $\to$ `withdrawn`) and re-response (`withdrawn` $\to$ `pending`), respecting `UNIQUE(listing_id, respondent_id)` without creating duplicate rows.
7. **Acceptance to Scheduled Session**: Accepting a response creates a **`scheduled`** session (not immediately active). Check-in and start actions require the demo clock to reach scheduled start. Outcome drafts are created in the post-session flow.
8. **Outsider Persona Permissions & Privacy Guard**: Switching to an outsider persona (e.g., Eve or Carol on an Alice–Bob session) hides private session content, chat messages, outcome editing, approvals, and reviews.
9. **Deterministic Demo Clock & Reconciler**: Single accounting calculation reconciling daily cap, scheduled end, and canonical specification fixtures:
   - **Fixture A-01**: Exact-midnight exhaustion (900s Day 1, none on Day 2).
   - **Fixture A-02**: Sufficient allowance across midnight ($900\text{s} + 1,800\text{s} = 2,700\text{s}$).
   - **Fixture A-03**: Scheduled end at midnight (900s, `scheduled_end`, Day 1 only).
   - **Fixture A-04**: Scheduled-end / exhaustion tie (900s, `allowance_exhaustion` takes priority).
   - **Fixture A-06 & S-01**: 31-second session with manual exit. Accounted duration is strictly 31 seconds. Review eligibility is locked ($31 < 300$).
   - **Fixture M-01**: Canonical matching calculation yielding **60.8 / 100**.
10. **Version-Safe Collaborative Outcomes (Fixtures O-01..O-03)**: Minimal approval model (`version`, `last_editor_id`, `approved_version_a`, `approved_version_b`). Edits increment version and invalidate partner approval. Stale approvals and edits return `409 OUTCOME_VERSION_CONFLICT`.
11. **Truthful Labels**: Simulated session chat (in-memory only; no fake WebRTC claims). Accurate coverage badges (`[Demonstrated in prototype]`, `[Simulation only]`, `[Working-V1 requirement]`).

---

## 2. Setup & Launch Instructions

### Option A: From Repository Root
```bash
# Start local static HTTP server
python -m http.server 3000 --directory prototype

# Run automated verification tests
node prototype/test-prototype.js
```
Open `http://localhost:3000` in your web browser.

### Option B: From `prototype/` Directory
```bash
cd prototype

# Start local static HTTP server
python -m http.server 3000 --directory .

# Run automated verification tests
npm test
```
Open `http://localhost:3000` in your web browser.

---

## 3. Automated Test Suite Results

The automated test runner (`prototype/test-prototype.js`) directly imports and evaluates the actual UMD application controller (`prototype/app.js`):
```bash
node prototype/test-prototype.js
```
**Actual Output:**
```
================================================================
RUNNING PROTOTYPE AUTOMATED VERIFICATION SUITE
Application Controller: prototype/app.js (UMD module)
Student: Zhumirov Bekzat (SE-2416) | Supervisor: Aigerim Kydyrbekova
================================================================

[PASS] Test 1: Compatibility Formula Exactness & Format (Fixture M-01: 60.8 / 100)
[PASS] Test 2: Invariant #10: Missing Preferences Suppress Scoring Without Invented Values
[PASS] Test 3: Priority 1: Channel Membership Gating & Join/Leave Interactions
[PASS] Test 4: Priority 1: Strict Listing Validation (Future Start, Positive Duration, Language, Author Level)
[PASS] Test 5: Invariant #8 & Fixture R-01: Response Row Reuse on Withdrawal (UNIQUE(listing_id, respondent_id))
[PASS] Test 6: Priority 1 & Invariant #5: Acceptance Creates Scheduled Session (Not Immediately Active)
[PASS] Test 7: Priority 2: Outsider Persona Cannot Interfere with Private Session
[PASS] Test 8: Canonical Fixture A-01: Exact-Midnight Exhaustion (900s Day 1, None on Day 2)
[PASS] Test 9: Canonical Fixtures A-02 & A-03: Across-Midnight Split (2,700s) & Midnight Scheduled End
[PASS] Test 10: Canonical Fixture A-04: End / Exhaustion Tie Priority Rule (allowance_exhaustion wins)
[PASS] Test 11: Canonical Fixtures A-06 & S-01: 31-Second Session & Review Eligibility Gate
[PASS] Test 12: Invariant #17 & Fixtures O-01..O-03: Version-Safe Collaborative Outcomes & 409 Conflict
[PASS] Test 13: Invariants #18 & #19: Exact 5 Terminal Reasons & Blocking Guard

================================================================
TEST SUITE RESULTS: 13/13 TESTS PASSED (100%)
Automated Invariants Verification Completed using actual prototype/app.js
================================================================
```

---

## 4. Step-by-Step Interactive Walkthrough Guide

### Step 1: Channel Membership & Gating (Priority 1)
1. Switch active persona to **Eve** using the top-right persona selector.
2. Select channel `#algorithms-and-ds`.
3. Notice the **🔒 Channel Membership Required** gate banner. Listings and scoring are locked because Eve has not joined this channel.
4. Click **Join #algorithms-and-ds**. The channel membership badge turns green (`✓ Member`), and listings unlock.
5. Notice that because Eve has no saved preferences, the feed automatically selects **Chronological (Fallback due to missing preferences)** and displays the chronological explanation box without invented scores.

### Step 2: Compatibility Calculation & Pure Score Display (Priority 2)
1. Switch persona to **Bob**.
2. Notice the top header HUD showing Bob's remaining daily allowance (`7,200s / 10,800s`).
3. In channel `#algorithms-and-ds`, view Alice's listing: "Graph Traversal: Dijkstra & Bellman-Ford".
4. Observe the score badge: **`Score: 80.0 / 100`** (displayed as points out of 100, never `%`).
5. Observe the breakdown box: `T=0.50 (tags), G=1.00 (goal), L=1.00 (level) → 80.0 / 100`.

### Step 3: Response Submission & Row Reuse (Fixture R-01)
1. As **Bob**, click **Respond to Listing** on Alice's listing.
2. Enter a message and click **Send Response**. The card updates to **Response Pending** with a **Withdraw** button.
3. Click **Withdraw**. Response status transitions to `withdrawn`.
4. Click **Re-respond (Row Reuse)**. Enter an updated message and submit.
5. Inspect the **Audit Log** tab: verify that the existing database row was reused (`withdrawn → pending`) under `UNIQUE(listing_id, respondent_id)` without duplicate row creation.

### Step 4: Acceptance & Scheduled Session (Priority 1)
1. Switch persona to **Alice** (Listing Author).
2. Click **Review Responses (1)** on your listing.
3. Click **Accept & Schedule** next to Bob's response.
4. The system:
   - Simulates Shared Lock Protocol ordering (`users` ascending UUID $\to$ `study_listings` $\to$ `listing_responses` $\to$ `study_sessions`).
   - Rechecks daily allowance, blocking, and cross-listing collisions.
   - Transitions listing to `matched` and response to `accepted`.
   - Creates a **`scheduled`** session (starts 2026-10-25 14:00 UTC; accounted duration: 0s).
   - Navigates to the **Study Session & HUD** room.

### Step 5: Demo Clock Advance & Participant Check-In
1. Notice the scheduled session notice: "Session Scheduled: Scheduled for 2026-10-25 14:00:00 UTC."
2. Click **Advance Demo Clock to Scheduled Start (14:00 UTC)**. The top demo clock updates to `2026-10-25 14:00:00 UTC`.
3. Click **Check-in & Start Session as Alice**.
4. The session transitions from `scheduled` to `active`. The real-time integer-second HUD timer starts ticking. The collaborative outcome draft is initialized.

### Step 6: Outsider Privacy Guard (Priority 2)
1. With the active Alice–Bob session open, switch persona to **Eve** (or **Carol**).
2. Notice the red access restriction banner:
   > **Access Restricted: Private Session**  
   > Confirmed privacy invariant: You are currently viewing as Eve, who is not a participant in this study session. Chat messages, mutual outcomes, and reviews are strictly private to Alice and Bob.
3. Verify that chat inputs, outcome editor, approval buttons, and review forms are completely hidden from outsiders.
4. Switch back to **Alice** or **Bob** to resume session controls.

### Step 7: Deterministic Canonical Accounting Fixtures (Priority 3)
In the right-hand **Deterministic Demo Controls** panel:
- **Run Fixture A-01 (Midnight Exhaustion)**: Simulates 900s remaining at 23:45 UTC. Terminates at 00:00:00 UTC with `allowance_exhaustion`. Day 1 charged 900s, Day 2 charged 0s.
- **Run Fixture A-02 (Across Midnight Split)**: 23:45 to 00:30 session with sufficient allowance. Accounts 900s to Day 1 and 1,800s to Day 2 ($2,700\text{s}$ total per participant).
- **Run Fixture A-03 (Scheduled End Midnight)**: Reaches scheduled end at 00:00:00 UTC. Ends with `scheduled_end`, charging 900s on Day 1 only.
- **Run Fixture A-04 (End/Exhaustion Tie)**: Both scheduled end and allowance exhaustion occur at 00:00:00 UTC. Reason is deterministically resolved as `allowance_exhaustion`.
- **Run Fixture A-06 / S-01 (31s Session)**: Manual exit after 31 seconds. Duration is strictly 31s (not rounded to 60s). Review submission is locked ($31 < 300$).

### Step 8: Version-Safe Collaborative Outcome Confirmation (Fixtures O-01..O-03)
1. Open active session as **Alice**. Scroll to the **Session Learning Outcome** card.
2. Edit summary and click **Update Outcome (v2)**:
   - Version increments to 2. Alice's approval is set to `v2`; Bob's approval is invalidated (`null`).
3. Switch persona to **Bob**.
4. Click **Test 409 Conflict (Approve Stale v1)**:
   - Intercepted by stale-write guard: displays `409 OUTCOME_VERSION_CONFLICT`.
5. Click **Approve Version 2**:
   - Status updates to **✓ Mutually Confirmed** (`approved_version_a = 2 AND approved_version_b = 2`).

### Step 9: Post-Session Peer Review ($\ge 300$s Gate)
1. Advance time by clicking **+300s (Qualify for Review)**, then click **Manual Exit**.
2. Notice the review form unlocks because duration is $\ge 300\text{ s}$.
3. Select rating (1–5 stars), write constructive feedback, and submit.
4. Switch to **Profile & Partner History** to inspect the recorded session and default-private partner visibility toggle.

---

## 5. File Structure of Prototype

```
prototype/
├── index.html           # Semantic HTML5 SPA with Channel Gating & Demo Clock
├── styles.css           # Accessible, responsive design (360px-1440px), status badges, HUD
├── app.js               # In-memory transactional engine, math engine, reconciler (UMD module)
├── test-prototype.js    # Automated test suite directly executing app.js (13 test groups)
├── package.json         # Scripts and project metadata
└── README.md            # This documentation and walkthrough guide
```
