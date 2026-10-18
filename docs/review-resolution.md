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
