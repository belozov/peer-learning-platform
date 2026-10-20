# Comprehensive Supervisor Review Report: Pre-Defense 1 Milestone

**Project Title:** Development of a Compatibility-Based Peer Learning Platform  
**Student:** Жумиров Бекзат Ерболатулы (Zhumirov Bekzat) | Student ID: `241390`  
**Academic Email:** `241390@astanait.edu.kz`  
**Group / Programme:** SE-2416, Software Engineering  
**Academic Supervisor:** Aigerim Kydyrbekova (Айгерим Кыдырбекова)  
**Academic Milestone:** Pre-Defense 1 (Working Review Checkpoint: 20 October 2026; Repository Milestone: 24 October 2026)  
**Remote Git Repository:** [https://github.com/belozov/peer-learning-platform](https://github.com/belozov/peer-learning-platform)  
**Active Task Branch:** `PLP-16-research-literature-and-evaluation`  
**YouTrack Cloud Instance:** [https://bekzat-diploma-2027.youtrack.cloud](https://bekzat-diploma-2027.youtrack.cloud)  

---

## 1. Executive Summary & Delivery Scope

This comprehensive report compiles the complete body of engineering analysis, requirements specification, academic research, architectural design, and prototype implementation developed for the **Pre-Defense 1** milestone of the individual diploma project.

The central problem addressed by this research is **coordination and compatibility friction in self-directed peer learning**. While modern students frequently seek collaborative study partners for technical disciplines (such as programming, calculus, and language practice), existing tools (generic messaging apps, Discord servers, and Q&A boards) force learners to endure high coordination overhead, lack structured schedule alignment, provide no compatibility filtering, and fail to track study commitments.

The proposed platform provides an integrated, non-commercial solution built around:
1. **Community Channel Gating**: Scoped subject communities and topic channels (FR-03).
2. **Explainable Multi-Attribute Compatibility**: Deterministic scoring ($S = 0.40T + 0.35G + 0.25L$) presenting human-readable justifications (`Score: 80.0 / 100`) without black-box machine learning.
3. **Accounted Synchronous Study Sessions**: Time-bounded study sessions backed by a confirmed 180-minute daily allowance and presence tracking (FR-10, FR-11).
4. **Version-Safe Collaborative Outcomes**: Post-session co-documentation of covered topics requiring mutual confirmation (FR-12).

### Delivery Boundaries: Prototype vs. Working-V1
To maintain strict truth-in-reporting, the project separates its delivery roadmap:
- **Milestone Demonstration Prototype (Batch 4 — Delivered & Verified)**: A complete, runnable client-side application built in standard HTML5, CSS3, and JavaScript (universal UMD module). It features an in-memory transactional store, deterministic demo clock, reconciler for canonical accounting fixtures (A-01..A-04, A-06, S-01, M-01), channel gating, and outsider privacy restrictions. It is verified by **13/13 passing automated test suites in Node.js executing `app.js` directly**.
- **Proposed Working-V1 Production Architecture (Specified)**: A modular monolithic backend in Node.js/Express (TypeScript), PostgreSQL 16 relational database with row-level locking (`SELECT FOR UPDATE`), Native WebSockets (`ws`), and React 18/19 SPA.

### Epistemological Integrity & Pending Evidence
- **Pending Adult Fieldwork (Component 2)**: Semi-structured interviews with 3–5 adult learners ($\ge 18$) remain pending participant scheduling. Protocols, ethics safeguards, and recording templates are fully prepared in `docs/user-research.md`. No interview data has been fabricated.
- **YouTrack Cloud Synchronization**: **Verified & Synchronized**. Project `PLP` ([https://bekzat-diploma-2027.youtrack.cloud/projects/PLP](https://bekzat-diploma-2027.youtrack.cloud/projects/PLP)) hosts all 22 milestone tasks (`PLP-1` through `PLP-22`) with full requirements-traceable acceptance criteria.

---

## 2. Research Evidence & Literature Review

### 2.1 Bibliographic Synthesis
The literature review surveyed **14 verified scholarly publications**, satisfying and exceeding university criteria ($\ge 12$ sources, $\ge 8$ scientific):
- **11 Peer-Reviewed Scientific Journal Articles** (IEEE TLT, IEEE TE, ACM TOCHI, ACM TACCESS, PACM HCI/CSCW, Computers & Education, ijCSCL, Review of Educational Research, Educational Psychology, Topics in Cognitive Science, and PLOS ONE).
- **2 Scholarly Books / Book Chapters** (Elsevier Science, Routledge).
- **1 Foundational Academic Monograph** (Harvard University Press).
- **Recent Research (2021–2024)**: 7 publications (50.0% of citations).

All entries were audited against CrossRef/publisher DOIs. Previously identified fabricated citations (Computers in Human Behavior 107, Computers & Education 158) were permanently expunged, and 3 unverified entries (Zheng, Borchers, Rientes) were quarantined.

### 2.2 Thematic Matrix & Engineering Connections

| Thematic Area | Key Citations | Core Findings | Engineering Implementation |
| :--- | :--- | :--- | :--- |
| **Symmetrical Collaboration** | Topping (2005), Dillenbourg (1999), Boud et al. (2001/2014) | Symmetrical problem-solving and absence of evaluative anxiety drive cognitive gains. Commercial hierarchies erode mutual accountability. | **DEC-001 & Scope §4**: All users hold uniform `Learner` role. Author and Respondent have equal agency; no paid tutoring. |
| **Interactive Discourse & Body Doubling** | Chi (2009), Roscoe & Chi (2007), Eagle et al. (2024) | Interactive dialogue triggers constructive cognitive updates. Virtual co-presence ("body doubling") acts as an external commitment device. | **FR-10, FR-11, FR-17**: Real-time synchronous text chat; deterministic 180-min daily allowance; 60s reconnection buffer. |
| **Algorithmic Compatibility** | Vygotsky (1978), Revelo-Sánchez et al. (2021), Vallès-Català & Palau (2023), Saksono et al. (2023) | Multi-criteria pairing outperforms random search. Black-box ML harms learner trust and agency. | **FR-07**: Multi-attribute formula $S = 0.40T + 0.35G + 0.25L$ with transparent breakdown and chronological fallback (C-04). |
| **Reciprocal Feedback & Outcomes** | Kulkarni et al. (2013), Misiejuk & Wasson (2021), Tan et al. (2023), Avila et al. (2022) | Closing the feedback loop via structured rubrics and backward evaluation mitigates rating bias. | **FR-12, FR-13**: Version-safe outcome co-confirmation; 300s review eligibility gate (S-01) preventing zero-second review spam. |

---

## 3. Existing Systems Comparative Analysis

Five platforms were evaluated across ten uniform criteria (C1–C10, established in `docs/project-scope.md` §5) using official documentation and October 2026 recorded observations:

```
                            COMMUNICATION DYNAMICS
                      Asynchronous           Synchronous
                 +-----------------------+-----------------------+
   General       |        Discord        |       Focusmate       |
   Productivity  |    (Unstructured      |  (Time-bounded body   |
                 |     channel chat)     |   doubling, no topics)|
COORDINATION     +-----------------------+-----------------------+
   Academic &    |        Brainly        |  **PROPOSED PLATFORM**|
   Pedagogical   |  (Asynchronous Q&A,   | (Structured listings, |
                 |    no live study)     |  compatibility score, |
                 |                       |  bounded study time)  |
                 +-----------------------+-----------------------+
```

### Comparative Summary Matrix

| Criterion | Focusmate | Tandem | Brainly | Discord (Study Servers) | Studypool | Proposed Platform (Working-V1) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **C1: Community Structure** | No | Partial | Yes | Yes | Yes | **Yes (FR-03)** |
| **C2: Structured Listings** | Partial | No | No | Partial | Yes | **Yes (FR-06)** |
| **C3: Multi-Attribute Matching** | No | Partial | No | No | No | **Yes ($0.40T+0.35G+0.25L$)** |
| **C4: Explainability of Matches**| No | No | No | No | No | **Yes (Score: X/100, FR-07)** |
| **C5: Knowledge Level Handling** | No | Partial | No | No | Partial | **Yes (FR-02/06)** |
| **C6: Availability Gating** | Yes | No | No | No | No | **Yes (Half-Open Intervals)** |
| **C7: Accounted Synchronous Time**| Yes | No | No | Partial | No | **Yes (10,800s Daily Cap)** |
| **C8: Mutual Outcome Co-Approval**| Partial | No | No | No | No | **Yes (Version-Safe, FR-12)** |
| **C9: Default Privacy & Safety** | Partial | Partial | No | Partial | No | **Yes (Default-Private, FR-15)**|
| **C10: Non-Commercial Reciprocity**| Partial | Partial | Partial | Yes | No | **Yes (DEC-001)** |

### Identified Practical Opportunity
Existing tools force learners into an unsatisfactory compromise: generic chat tools (Discord) provide rich communities but force learners to endure tedious, manual coordination friction; specialized tools (Focusmate) enforce time accounting but are subject-blind. The proposed platform bridges this gap by coupling **structured subject listings** and **explainable compatibility ranking** with **bounded synchronous study sessions**.

---

## 4. Requirements & Lifecycle Specification

### 4.1 Requirements Catalog Summary
The specification catalog (`docs/requirements-spec.md`) details 19 functional and 7 non-functional requirements with two-tier acceptance criteria:
- **FR-01..FR-04**: Account profiles, learning preferences, community/channel hierarchy, and membership gating.
- **FR-05..FR-09**: Structured study listings, multi-attribute matching, response submission/withdrawal reuse, and atomic single-partner acceptance.
- **FR-10..FR-13**: Real-time synchronous chat, 180-minute daily allowance accounting, version-safe outcome confirmation, and discrete peer reviews.
- **FR-14..FR-17**: Profile history, default-private partner visibility, active session blocking, and presence tracking with 60s grace buffer.
- **NFR-01..NFR-07**: Password hash privacy invariant, transactional integrity (Shared Lock Protocol), response latency ($\le 200\text{ms}$), mobile responsive layout (360px–1440px), and adult ethical safeguards ($\ge 18$).

### 4.2 State Machine & Time Accounting (Invariant #13 & #14)
Sessions transition strictly through three states: `scheduled → active → ended`.
- **Fixed End Boundary**: `scheduled_end = scheduled_start + duration`. Late starts do not extend the end boundary.
- **Exact-Midnight Policy (Fixture A-01)**: Sessions running across midnight are split into daily ledgers. If Day 1 allowance exhausts at 00:00:00 UTC, the session terminates immediately with `allowance_exhaustion`; Day 2 reset never revives an ended session.
- **Terminal Reason Priority**: When multiple boundaries coincide, deterministic precedence resolves the reason: (1) `blocked`, (2) `allowance_exhaustion`, (3) `scheduled_end`, (4) `connection_interruption`, (5) `manual_exit`.

---

## 5. Architectural Blueprints & Data Model

### 5.1 Architecture Overview
The system is architectured as a **Modular Monolith** backing a Single Page Application:
- **Client Layer**: React 18/19 SPA with TypeScript and Vite.
- **API & Gateway Layer**: Node.js and Express 5 co-hosting REST endpoints and native WebSocket server (`ws`).
- **Domain Modules**: Account & Auth, Community & Channels, Discovery & Matching, Session Lifecycle & Accounting, and Outcomes & Reviews.
- **Persistence Layer**: PostgreSQL 16 relational database with GIN array indexing (`TEXT[]`) and row-level locking.

### 5.2 Architectural Diagrams (Mermaid Source & SVG Exports)
1. **System Context Diagram** (`diagrams/exports/system-context.svg`): Delineates system boundaries, external browser clients, and explicit exclusions (zero external payment or third-party video dependencies).
2. **Use Case Diagram** (`diagrams/exports/use-case.svg`): Structured with UML use-case semantics: channel membership modeled as a strict precondition (`«precondition»`) before listing/discovery; session start decoupled from acceptance; review decoupled from start; added administrator channel creation (`UC-20`).
3. **Component Diagram** (`diagrams/exports/component.svg`): Labelled *Proposed Working-V1 Architecture*, detailing internal module interfaces, event bus, and database repositories.

### 5.3 Shared Lock Protocol (Invariant #3 & #4)
To prevent concurrent booking race conditions (NFR-02), all booking paths acquire locks in strict global ascending order:
$$\text{users (UUID ASC)} \to \text{study\_listings (ID ASC)} \to \text{listing\_responses (ID ASC)} \to \text{study\_sessions (ID ASC)} \to \text{session\_outcomes (ID ASC)}$$
Acquiring both participant user locks upfront prevents concurrent overlapping sessions across competing listings.

---

## 6. Demonstration Prototype Evidence (Batch 4)

The interactive prototype (`prototype/`) demonstrates the complete end-to-end user journey in a self-contained, client-side web application.

### 6.1 Automated Test Suite Verification (`prototype/test-prototype.js`)
The test harness evaluates the actual `prototype/app.js` application controller directly via its universal UMD export:

```
> peer-learning-platform-prototype@1.0.0 test
> node test-prototype.js

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
Prototype Test Suite Completed: Verified client-side interactions, canonical fixtures,
and state machine guards (Production PostgreSQL concurrency & WebSockets remain Working-V1 scope).
================================================================
```

### 6.2 The 9-Step Demonstrated Walkthrough
1. **Channel Membership Gating**: Visiting *Algorithms* channel locks *Find a Partner* until clicking **Join Channel**.
2. **Score Formatting**: Bob's listing displays `Compatibility score: 80.0 / 100` (points out of 100; percentage symbol `%` is completely absent).
3. **Missing Preference Fallback**: Switching to Eve (lacks topic tags) automatically switches feed sorting to chronological order (`created_at DESC, id ASC`) and updates the indicator to *Chronological (Fallback due to missing preferences)*.
4. **Strict Listing Validation**: Creating a listing enforces future start relative to demo clock, end after start, positive duration (15–180m), language, and explicit author level.
5. **Response & Scheduled Acceptance**: Alice accepts Bob's response. The session is created in **`scheduled`** state with accounted duration 0s (does not immediately become active).
6. **Demo Clock Advance & Check-In**: Alice advances the demo clock to `2026-10-25 14:00 UTC` and clicks **Check-in & Start**. Session transitions to `active`.
7. **Outsider Access Restriction**: Switching to Eve while Alice–Bob session is active renders a prominent access restricted notice, hiding chat messages, outcome editing, and reviews.
8. **Deterministic Reconciler**: Dedicated control buttons execute canonical fixtures A-01, A-02, A-03, A-04, A-06, and S-01, reconciling daily HUD, session duration, and ledger entries simultaneously.
9. **Version-Safe Outcomes**: Alice edits draft to v2 (invalidating Bob's confirmation). Bob clicking stale v1 confirmation receives `409 OUTCOME_VERSION_CONFLICT`. Bob approving v2 confirms outcome.

---

## 7. Standalone Empirical Evaluation Protocol

The evaluation plan (`docs/evaluation-plan.md`) establishes a formal research protocol addressing three research questions:

- **RQ1 (Discovery Efficiency & Selection Validity)**: Evaluates whether compatibility ranking increases valid partner selections and reduces time-to-selection ($T_{\text{select}}$) compared to chronological browsing.
- **RQ2 (Algorithmic Transparency & Comprehension)**: Measures whether participants accurately interpret score breakdowns and chronological fallback on an objective 3-item test ($H_2 \ge 80\%$).
- **RQ3 (System Usability & Workload)**: Assesses overall usability across the 9-step journey using the standardized System Usability Scale ($H_3 > 68.0$).

### Methodological Controls (Invariant #11)
- **Within-Subjects Design**: Counterbalanced ($A \to B$ vs. $B \to A$) across standardized 20-listing pools.
- **Strictly Identical Filtering**: Both conditions apply **identical hard eligibility filters** (channel membership, date interval overlap, language, absence of blocks); only the ranking permutation differs.
- **Proposed Sample Size**: $N = 10\text{--}20$ adult volunteers ($\ge 18$). Protocol is planned; zero pre-study findings are claimed.

---

## 8. Project Governance, Backlog & Outstanding Work

### 8.1 11-Component Compliance Status

| № | Component | Primary Deliverable | Current Status |
| :-: | :--- | :--- | :-: |
| 1 | Project Proposal | `docs/project-proposal.md` | **Drafted** |
| 2 | Evidence of Relevance | `docs/user-research.md` | **Pending Adult Fieldwork** |
| 3 | Literature Review | `docs/literature-review.md` | **Completed (14 Sources)** |
| 4 | Existing Systems Comparison | `docs/existing-systems.md` | **Completed (5 Systems / C1–C10)** |
| 5 | Technology Comparison | `docs/technology-comparison.md` | **Completed (Revised)** |
| 6 | Requirements Specification | `docs/requirements-spec.md` | **Drafted (Revised)** |
| 7 | Architecture & Diagrams | `docs/architecture.md`, `diagrams/` | **Completed (Draft Exports)** |
| 8 | UX / Prototype | `prototype/` | **Delivered (Simulation Prototype)** |
| 9 | Verification & Evaluation Plan | `docs/evaluation-plan.md` | **Completed (Protocol)** |
| 10 | Project Management & Risks | `docs/youtrack-tasks.md`, `README.md` | **Completed (Synchronized & Tagged)** |
| 11 | Supervisor Feedback | `docs/supervisor-log.md` | **Pending Supervisor Review** |

### 8.2 Open Architectural Decisions Awaiting Supervisor Guidance
1. **Approval of Proposed Design Rules**: Multi-attribute weights ($0.40T + 0.35G + 0.25L$), UTC daily reset (00:00 UTC), 60s disconnection grace timer, 300s review threshold, and mutual outcome confirmation requirement.
2. **Accounted Time Framing**: Explicit framing that session time measures accounted participation duration, not verified cognitive attention or grade improvement.
3. **Adult Safeguard Protocol**: Strict restriction of preliminary fieldwork to adult participants ($\ge 18$) pending institutional ethics clearance for minor recruitment.

---

## 9. Review Package Verification & Launch Instructions

### 9.1 Launching Prototype Locally
```bash
# Option A: From repository root
python -m http.server 3000 --directory prototype
node prototype/test-prototype.js

# Option B: From prototype/ directory
cd prototype
python -m http.server 3000 --directory .
npm test
```
Access in browser: `http://localhost:3000`

### 9.2 Project Tracking, Remote Git & Review Archive
- **YouTrack Cloud Project**: [https://bekzat-diploma-2027.youtrack.cloud/projects/PLP](https://bekzat-diploma-2027.youtrack.cloud/projects/PLP) (Project Key: `PLP`, 22 milestone tasks `PLP-1`..`PLP-22` synchronized).
- **Remote Git Branch**: `PLP-16-research-literature-and-evaluation` on `https://github.com/belozov/peer-learning-platform`.
- **GitHub Pull Request**: [https://github.com/belozov/peer-learning-platform/pull/2](https://github.com/belozov/peer-learning-platform/pull/2) (PR #2, open for supervisor review).
- **Official Submission Tag**: [`prob-period-1`](https://github.com/belozov/peer-learning-platform/tree/prob-period-1).
- **Required University Submission URL**: [https://github.com/belozov/peer-learning-platform/tree/prob-period-1](https://github.com/belozov/peer-learning-platform/tree/prob-period-1).
- **Review ZIP Archive**: `C:\Users\QWERTY\Documents\peer-learning-platform-batch-6-review.zip` (self-contained review package without `.git/` or `node_modules/`).
