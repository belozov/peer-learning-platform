# Project Management: Task Backlog & YouTrack Mapping

## 1. Project Management Overview
- **Project Tracking Tool**: YouTrack *(Instance link pending provisioning)*
- **YouTrack URL**: `[PENDING: YouTrack Project URL]`
- **Remote Git Repository**: [https://github.com/belozov/peer-learning-platform](https://github.com/belozov/peer-learning-platform)
- **Task Identifier Convention**: Provisional local task IDs (`PLP-xx`) are used until official YouTrack project keys are generated. All Git branches and commit messages follow the format: `PLP-xx-brief-description`.
- **Assignee / Owner**: Жумиров Бекзат Ерболатулы (Individual Diploma Project)

---

## 2. Work Breakdown Structure & Task Register

### Batch 1: Scope, Governance & Compliance
| Task ID | Task Title | Priority | Deadline | Status | Expected Outcome & Acceptance Criteria | Artifact / Ref |
| :--- | :--- | :-: | :-: | :-: | :--- | :--- |
| **PLP-01** | Repository Initialization & Baseline Documentation | P0 | 2026-10-18 | **Completed** | Clean Git repo initialized; comprehensive `.gitignore` excluding secrets; `README.md` created with student and supervisor details. | `README.md`, `.gitignore` |
| **PLP-02** | Project Proposal & Scope Delimitation | P0 | 2026-10-18 | **Completed** | Full proposal covering problem, users, aim, objectives; distinct boundary between immediate prototype milestone and working V1. | `docs/project-proposal.md`, `docs/project-scope.md` |
| **PLP-03** | University Compliance & Decision Register | P0 | 2026-10-18 | **Completed** | Compliance checklist mapped against 11 evaluation components; architectural decision records (DEC-001..08) documented. | `docs/submission-checklist.md`, `docs/project-decisions.md` |
| **PLP-04** | User Research Protocol & Seed Bibliography | P0 | 2026-10-18 | **Completed** | Semi-structured interview guide with 8 questions; blank recording template; early collection of peer-reviewed sources. | `docs/user-research.md` |

### Batch 2: Detailed Requirements Specification
| Task ID | Task Title | Priority | Deadline | Status | Expected Outcome & Acceptance Criteria | Artifact / Ref |
| :--- | :--- | :-: | :-: | :-: | :--- | :--- |
| **PLP-05** | Functional Requirements Catalog (FR-01..19) | P0 | 2026-10-19 | **Completed** | Full specification of FR-01 through FR-19 with unambiguous, testable acceptance criteria; prototype vs V1 boundaries. | `docs/requirements-spec.md` |
| **PLP-06** | Non-Functional Requirements & Security Matrix | P0 | 2026-10-19 | **Completed** | NFR-01 to NFR-07 documented with observable pass/fail checks (auth, concurrency, responsive UI, accessibility, performance). | `docs/requirements-spec.md` |
| **PLP-07** | Field-Level Access Control Matrix | P0 | 2026-10-19 | **Completed** | RBAC/ReBAC matrix; friend relationship vs roles; field-by-field permissions on profiles, chat, history, moderation. | `docs/access-matrix.md` |
| **PLP-08** | Session Lifecycle State Machine & Accounting Rules | P0 | 2026-10-19 | **Completed** | State transitions (`scheduled → active → ended/cancelled/no_show`), UTC reset, 60s grace, 180m cap, idempotent finalization. | `docs/session-lifecycle.md`, `docs/compatibility-rules.md` |

### Batch 3: Architectural Design & Technology Evaluation
| Task ID | Task Title | Priority | Deadline | Status | Expected Outcome & Acceptance Criteria | Artifact / Ref |
| :--- | :--- | :-: | :-: | :-: | :--- | :--- |
| **PLP-09** | System Context Diagram & Narrative | P0 | 2026-10-19 | Pending | Context diagram defining boundaries, users, and external integrations (Mermaid source + SVG export). | `diagrams/src/system-context.*` |
| **PLP-10** | Use Case Diagram & Actor Matrix | P0 | 2026-10-19 | Pending | UML Use Case diagram mapping visitor, learner, author, respondent, and moderator actions. | `diagrams/src/use-case.*` |
| **PLP-11** | Component Architecture Diagram | P0 | 2026-10-20 | Pending | Modular monolithic diagram detailing API modules, WebSocket gateway, persistence layer, and UI components. | `diagrams/src/component.*` |
| **PLP-12** | Relational Data Model Specification | P0 | 2026-10-20 | Pending | 11 core relational entities, foreign keys, cardinality, and index definitions documented. | `docs/data-model.md` |
| **PLP-13** | Technology Alternatives & Trade-Off Comparison | P0 | 2026-10-20 | Pending | Comparative analysis of 3 key technology decisions (Frontend, Backend, Database/Chat) with 2–3 alternatives each. | `docs/technology-comparison.md` |

### Batch 4: Milestone Demonstration Prototype
| Task ID | Task Title | Priority | Deadline | Status | Expected Outcome & Acceptance Criteria | Artifact / Ref |
| :--- | :--- | :-: | :-: | :-: | :--- | :--- |
| **PLP-14** | Interactive Prototype Core Journey | P0 | 2026-10-21 | Pending | Runnable web prototype demonstrating 12-step flow: Community → Channel → Listing → Match Calculation → Chat → Accounting. | `prototype/*` |
| **PLP-15** | Prototype Exception & Simulation Banners | P0 | 2026-10-22 | Pending | Explicit UI warning banner identifying simulated authentication, time, and mock data; handles empty/exhausted states. | `prototype/*` |

### Batch 5: Research Evidence, Literature & Verification Plan
| Task ID | Task Title | Priority | Deadline | Status | Expected Outcome & Acceptance Criteria | Artifact / Ref |
| :--- | :--- | :-: | :-: | :-: | :--- | :--- |
| **PLP-16** | User Relevance Field Interviews | P0 | 2026-10-22 | Pending | Conduct 3–5 interviews with target learners; populate anonymized notes and requirement implications. | `docs/user-research.md` |
| **PLP-17** | Literature Review Matrix ($\ge 12$ sources) | P0 | 2026-10-22 | Pending | Complete synthesis table with $\ge 8$ peer-reviewed scientific publications covering collaborative learning & matching. | `docs/literature-review.md` |
| **PLP-18** | Existing Systems Comparative Analysis | P0 | 2026-10-22 | Pending | Matrix comparing 3–5 platforms (Focusmate, Tandem, Brainly, etc.) across 6–10 criteria with access dates. | `docs/existing-systems.md` |
| **PLP-19** | Empirical Evaluation Protocol (RQ1–RQ3) | P0 | 2026-10-23 | Pending | Detailed experimental methodology: counterbalanced tasks, baseline comparison, metrics, and recruitment guidelines. | `docs/evaluation-plan.md` |

### Batch 6: Supervisor Review Package & Milestone Tagging
| Task ID | Task Title | Priority | Deadline | Status | Expected Outcome & Acceptance Criteria | Artifact / Ref |
| :--- | :--- | :-: | :-: | :-: | :--- | :--- |
| **PLP-20** | Supervisor Review Package Compilation | P0 | 2026-10-20 | Pending | Coherent review package submitted to Aigerim Kydyrbekova; transparently flags pending field data. | `docs/supervisor-review-package.md` |
| **PLP-21** | Supervisor Feedback Logging & Revisions | P0 | 2026-10-23 | Pending | Record genuine comments received from supervisor and implement agreed-upon modifications. | `docs/supervisor-log.md` |
| **PLP-22** | Repository Milestone Verification | P0 | 2026-10-24 | Pending | Audit all documentation links, verify zero credentials committed, and tag milestone submission if required. | Git baseline audit |

### Batch 7: Working V1 Implementation (Post-Milestone)
| Task ID | Task Title | Priority | Deadline | Status | Expected Outcome & Acceptance Criteria | Artifact / Ref |
| :--- | :--- | :-: | :-: | :-: | :--- | :--- |
| **PLP-23** | Database Migrations & Seed Scripts | P0 | TBD | Pending | PostgreSQL schema creation scripts and idempotent seed data. | `db/*` |
| **PLP-24** | Express Modular Monolith API | P0 | TBD | Pending | JWT auth, listing endpoints, matching engine, and accounting routes. | `apps/api/*` |
| **PLP-25** | WebSocket Real-Time Chat Engine | P0 | TBD | Pending | Bidirectional chat server tracking session presence and time exhaustion. | `apps/api/src/chat/*` |
| **PLP-26** | Production React Client Application | P0 | TBD | Pending | Fully styled responsive UI consuming production API and WebSockets. | `apps/web/*` |
| **PLP-27** | Automated Test Suites | P0 | TBD | Pending | Integration and unit tests covering auth, matching algorithm, and time boundaries. | `tests/*` |
