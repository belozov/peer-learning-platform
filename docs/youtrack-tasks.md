# Project Management: Task Backlog, Dependencies & Risk Register

## 1. Project Management & Tracking Framework
- **Project Tracking Tool**: JetBrains YouTrack Cloud
- **YouTrack Instance Base URL**: [https://bekzat-diploma-2027.youtrack.cloud](https://bekzat-diploma-2027.youtrack.cloud)
- **YouTrack Project URL**: [https://bekzat-diploma-2027.youtrack.cloud/projects/PLP](https://bekzat-diploma-2027.youtrack.cloud/projects/PLP)
- **YouTrack Project Key**: `PLP` (Project ID: `0-1`, "Peer Learning Platform")
- **Cloud Issue Synchronization**: **Verified & Synchronized** (20 October 2026). All 22 milestone tasks (`PLP-1` through `PLP-22`) are created and mapped on YouTrack Cloud.
- **Remote Git Repository**: [https://github.com/belozov/peer-learning-platform](https://github.com/belozov/peer-learning-platform) (verified reachable and synchronized)
- **GitHub Pull Request**: [https://github.com/belozov/peer-learning-platform/pull/2](https://github.com/belozov/peer-learning-platform/pull/2) (open for supervisor review)
- **Official Submission Tag**: [`prob-period-1`](https://github.com/belozov/peer-learning-platform/tree/prob-period-1) (required university submission URL)
- **Assignee / Owner**: Zhumirov Bekzat / Жумиров Бекзат Ерболатулы (Individual Diploma Project)
- **Academic Supervisor**: Aigerim Kydyrbekova / Айгерим Кыдырбекова
- **Academic Group**: SE-2416 (Software Engineering)

---

## 2. Work Breakdown Structure & Task Register

### Batch 1: Scope, Governance & Compliance
| Task ID | Task Title | Priority | Deadline | Dependencies | Status | Expected Outcome & Acceptance Criteria | Artifact / Ref |
| :--- | :--- | :-: | :-: | :-: | :-: | :--- | :--- |
| [**PLP-1**](https://bekzat-diploma-2027.youtrack.cloud/issue/PLP-1) | Repository Initialization & Baseline Documentation | P0 | 2026-10-18 | None | **Completed** | Clean Git repo initialized; comprehensive `.gitignore` excluding secrets; `README.md` with student/supervisor metadata and relative links. | `README.md`, `.gitignore` |
| [**PLP-2**](https://bekzat-diploma-2027.youtrack.cloud/issue/PLP-2) | Project Proposal & Scope Delimitation | P0 | 2026-10-18 | PLP-1 | **Completed** | Full proposal covering problem, users, aim, objectives; distinct boundary between immediate prototype milestone and working V1. | `docs/project-proposal.md`, `docs/project-scope.md` |
| [**PLP-3**](https://bekzat-diploma-2027.youtrack.cloud/issue/PLP-3) | University Compliance & Decision Register | P0 | 2026-10-18 | PLP-2 | **Completed** | Compliance checklist mapped against 11 evaluation components; architectural decision records (DEC-001..08) documented. | `docs/submission-checklist.md`, `docs/project-decisions.md` |
| [**PLP-4**](https://bekzat-diploma-2027.youtrack.cloud/issue/PLP-4) | User Research Protocol & Seed Bibliography | P0 | 2026-10-18 | PLP-2 | **Completed** | Semi-structured interview guide with 8 questions; adult safeguard; audited bibliography with verified DOIs. | `docs/user-research.md` |

### Batch 2: Detailed Requirements Specification (Revised)
| Task ID | Task Title | Priority | Deadline | Dependencies | Status | Expected Outcome & Acceptance Criteria | Artifact / Ref |
| :--- | :--- | :-: | :-: | :-: | :-: | :--- | :--- |
| [**PLP-5**](https://bekzat-diploma-2027.youtrack.cloud/issue/PLP-5) | Functional Requirements Catalog (FR-01..19) | P0 | 2026-10-19 | PLP-2, PLP-3 | **Completed (Revised)** | Full specification of FR-01 through FR-19 with milestone applicability, two-tier criteria, and formal acceptance fixtures. | `docs/requirements-spec.md` |
| [**PLP-6**](https://bekzat-diploma-2027.youtrack.cloud/issue/PLP-6) | Non-Functional Requirements & Test Fixtures | P0 | 2026-10-19 | PLP-5 | **Completed (Revised)** | NFR-01 to NFR-07 documented with observable pass/fail checks; concrete specification fixtures (TF-01..05) defined. | `docs/requirements-spec.md` |
| [**PLP-7**](https://bekzat-diploma-2027.youtrack.cloud/issue/PLP-7) | Field-Level Access Control Matrix | P0 | 2026-10-19 | PLP-5 | **Completed (Revised)** | RBAC/ReBAC matrix; friend relationship vs roles; field privacy; password hash privacy invariant; active session blocking. | `docs/access-matrix.md` |
| [**PLP-8**](https://bekzat-diploma-2027.youtrack.cloud/issue/PLP-8) | Session Lifecycle State Machine & Accounting Rules | P0 | 2026-10-19 | PLP-5, PLP-7 | **Completed (Revised)** | State transitions (`scheduled → active → ended`), fixed scheduled end, late-start cap, UTC split, idempotent finalization. | `docs/session-lifecycle.md`, `docs/compatibility-rules.md` |

### Batch 3: Architectural Design & Technology Evaluation
| Task ID | Task Title | Priority | Deadline | Dependencies | Status | Expected Outcome & Acceptance Criteria | Artifact / Ref |
| :--- | :--- | :-: | :-: | :-: | :-: | :--- | :--- |
| [**PLP-9**](https://bekzat-diploma-2027.youtrack.cloud/issue/PLP-9) | System Context Diagram & Architecture Narrative | P0 | 2026-10-19 | PLP-5, PLP-8 | **Completed (Revised)** | System boundaries, actors, contextual roles, exclusions (no external video/payment dependencies). Mermaid source + SVG export. | `docs/architecture.md`, `diagrams/src/system-context.mmd`, `diagrams/exports/system-context.svg` |
| [**PLP-10**](https://bekzat-diploma-2027.youtrack.cloud/issue/PLP-10) | Use Case Diagram & Actor Matrix | P0 | 2026-10-19 | PLP-5, PLP-7 | **Completed (Revised)** | UML Use Case diagram mapping visitor, learner, contextual roles, and admin actions. Mermaid source + SVG export. | `diagrams/src/use-case.mmd`, `diagrams/exports/use-case.svg` |
| [**PLP-11**](https://bekzat-diploma-2027.youtrack.cloud/issue/PLP-11) | Component Architecture Diagram | P0 | 2026-10-20 | PLP-9, PLP-10 | **Completed (Revised)** | Modular monolithic diagram detailing API modules, WebSocket gateway, persistence layer, and UI components. Labelled Proposed Working-V1 Architecture. | `diagrams/src/component.mmd`, `diagrams/exports/component.svg` |
| [**PLP-12**](https://bekzat-diploma-2027.youtrack.cloud/issue/PLP-12) | Relational Data Model Specification | P0 | 2026-10-20 | PLP-5, PLP-8 | **Completed (Revised)** | Requirements-derived schema, foreign keys with CASCADE policies, indexing strategy, and composite constraints. | `docs/data-model.md` |
| [**PLP-13**](https://bekzat-diploma-2027.youtrack.cloud/issue/PLP-13) | Technology Alternatives & Trade-Off Comparison | P0 | 2026-10-20 | PLP-9, PLP-11 | **Completed (Revised)** | Comparative analysis of 4 key technical decisions with official doc citations; separated prototype from Working-V1 stack; removed superlatives. | `docs/technology-comparison.md` |

### Batch 4: Milestone Demonstration Prototype
| Task ID | Task Title | Priority | Deadline | Dependencies | Status | Expected Outcome & Acceptance Criteria | Artifact / Ref |
| :--- | :--- | :-: | :-: | :-: | :-: | :--- | :--- |
| [**PLP-14**](https://bekzat-diploma-2027.youtrack.cloud/issue/PLP-14) | Interactive Prototype Core Journey | P0 | 2026-10-21 | PLP-5, PLP-9 | **Completed (Client-Side Prototype)** | Runnable web prototype demonstrating full journey: Community → Channel Membership → Listing → Match Calculation (`Score: 80.0 / 100`) → Scheduled Session → Active Chat → Outcome → Review → Profile. Tested via `npm test` (13/13 passed). | `prototype/*` |
| [**PLP-15**](https://bekzat-diploma-2027.youtrack.cloud/issue/PLP-15) | Prototype Exception & Simulation Banners | P0 | 2026-10-22 | PLP-14 | **Completed** | Explicit UI warning banner identifying simulated in-memory state; deterministic demo clock reconciler (Fixtures A-01..A-04, A-06, S-01); outsider privacy guards. | `prototype/*` |

### Batch 5: Research Evidence, Literature & Verification Plan
| Task ID | Task Title | Priority | Deadline | Dependencies | Status | Expected Outcome & Acceptance Criteria | Artifact / Ref |
| :--- | :--- | :-: | :-: | :-: | :-: | :--- | :--- |
| [**PLP-16**](https://bekzat-diploma-2027.youtrack.cloud/issue/PLP-16) | Adult Learner Relevance Field Interviews | P0 | 2026-10-22 | PLP-4 | **Pending** | Conduct 3–5 interviews with adult learners ($\ge 18$); populate anonymized notes and requirement implications without fabrication. | `docs/user-research.md` |
| [**PLP-17**](https://bekzat-diploma-2027.youtrack.cloud/issue/PLP-17) | Literature Review Matrix Expansion ($\ge 12$ sources) | P0 | 2026-10-20 | PLP-4 | **Completed** | 14 verified scholarly publications (11 peer-reviewed journal articles, 7 published 2021–2024); analysis matrix and critical synthesis connecting literature to engineering decisions. | `docs/literature-review.md` |
| [**PLP-18**](https://bekzat-diploma-2027.youtrack.cloud/issue/PLP-18) | Existing Systems Comparative Analysis | P1 | 2026-10-20 | PLP-2 | **Completed** | Matrix comparing 5 platforms (Focusmate, Tandem, Brainly, Discord, Studypool) across 10 uniform criteria (C1–C10) with access dates and official citations. | `docs/existing-systems.md` |
| [**PLP-19**](https://bekzat-diploma-2027.youtrack.cloud/issue/PLP-19) | Empirical Evaluation Protocol (RQ1–RQ3) | P1 | 2026-10-20 | PLP-5, PLP-8 | **Completed (Protocol)** | Formal within-subjects counterbalanced design comparing Chronological and Compatibility feeds across identical eligible candidates; objective metrics ($V_{\text{select}}, T_{\text{select}}, C_{\text{score}}$), adult safeguards, and limitations. | `docs/evaluation-plan.md` |

### Batch 6: Supervisor Review Package & Milestone Tagging
| Task ID | Task Title | Priority | Deadline | Dependencies | Status | Expected Outcome & Acceptance Criteria | Artifact / Ref |
| :--- | :--- | :-: | :-: | :-: | :-: | :--- | :--- |
| [**PLP-20**](https://bekzat-diploma-2027.youtrack.cloud/issue/PLP-20) | Supervisor Review Package Compilation | P0 | 2026-10-20 | PLP-1..PLP-19 | **In Progress** | Coherent review package submitted to Aigerim Kydyrbekova; transparently flags pending field data. | `docs/supervisor-review-package.md` |
| [**PLP-21**](https://bekzat-diploma-2027.youtrack.cloud/issue/PLP-21) | Supervisor Feedback Logging & Revisions | P0 | 2026-10-23 | PLP-20 | **Pending** | Record genuine comments received from supervisor and implement agreed-upon modifications. | `docs/supervisor-log.md` |
| [**PLP-22**](https://bekzat-diploma-2027.youtrack.cloud/issue/PLP-22) | Repository Milestone Verification & Submission Tagging | P0 | 2026-10-20 | PLP-20 | **Completed (Tag: prob-period-1)** | Audit all documentation links, verify zero credentials committed, and publish official university submission tag `prob-period-1` on remote. | Git baseline audit & tag `prob-period-1` |

---

## 3. Project Risk Register

| Risk ID | Risk Description | Category | Impact | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :-: | :-: | :--- |
| **RSK-01** | **Supervisor Feedback Delay**: Feedback on the 20 Oct review package is delayed beyond 22 Oct. | Schedule | High | Medium | Submit a self-contained, reviewable package on 20 Oct; continue non-dependent prototype tasks while awaiting formal comments. |
| **RSK-02** | **Adult Participant Recruitment Friction**: Difficulty scheduling 3–5 adult discovery interviews prior to milestone. | Research | Medium | Medium | Leverage university peer networks and student study groups; prepare standardized async questionnaire as contingency if live interviews stall. |
| **RSK-03** | **Institutional Deadline Discrepancy**: Committee requires Pre-Defense 1 deliverables earlier than 24 Oct milestone. | Governance | High | Low | Track 20 Oct as the operational freeze target; ensure all 11 compliance artifacts are drafted and review-ready by 20 Oct. |
| **RSK-04** | **Underage Ethics Non-Compliance**: Accidental recruitment of secondary school students without ethics clearance. | Ethics | High | Low | Enforce strict adult-only safeguard ($\ge 18$ years of age) for all preliminary interviews and prototype evaluations. |

---

## 4. Supervisor Review Checkpoints

1. **Checkpoint 1 (20 October 2026 — Working Operational Target)**:
   - **Deliverables**: Scope, formal requirements, access matrix, session lifecycle, architecture draft, 14-source literature review, 5-system comparative matrix, evaluation protocol, prototype walkthrough, and review resolution report (`docs/review-resolution.md`).
   - **Reviewer**: Aigerim Kydyrbekova.
   - **Goal**: Align on requirement priorities, mathematical compatibility model, and delivery boundaries.
2. **Checkpoint 2 (22–23 October 2026)**:
   - **Deliverables**: Demonstration prototype walkthrough and existing systems comparative matrix.
   - **Goal**: Review user experience flow, exception handling, and simulation banners.
3. **Checkpoint 3 (24 October 2026 — Stated Repository Milestone)**:
   - **Deliverables**: Repository audit baseline, verified literature review, and evaluation experiment plan.
   - **Goal**: Pre-defense submission baseline verification.
