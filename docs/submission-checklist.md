# University Compliance & Submission Checklist

## 1. Compliance Checklist for 20 / 24 October 2026 Milestone

> **Status Conventions**:
> - **Confirmed**: Supplied in project context or validated by university requirements.
> - **Proposed**: Design recommendation formulated for approval.
> - **Unresolved**: Requires external institutional verification or real-world completion.
> - **Lifecycle Statuses**: `Drafted` | `Implemented` | `Tested` | `Approved` | `Pending`.

| № | Component | University Requirement | Current Evidence | Deliverable / Verification Check | Status |
| :-: | :--- | :--- | :--- | :--- | :-: |
| **1** | **Project Proposal** | Title, team members, supervisor, problem, target users, aim, objectives, expected outcomes, scope. | Complete draft in [`docs/project-proposal.md`](file:///c:/Users/QWERTY/Documents/Development%20of%20a%20compatibility-based%20peer%20learning%20platform/docs/project-proposal.md). | Student name confirmed: Жумиров Бекзат Ерболатулы. Supervisor confirmed: Aigerim Kydyrbekova. Individual responsibilities documented. | **Drafted** |
| **2** | **Evidence of Relevance** | 3–5 genuine user interviews or substantive client agreement separating observations, interpretations, assumptions. | Semi-structured interview protocol & blank recording template in [`docs/user-research.md`](file:///c:/Users/QWERTY/Documents/Development%20of%20a%20compatibility-based%20peer%20learning%20platform/docs/user-research.md). | Conduct 3–5 learner interviews. Populate findings without fabrication. | **Pending** |
| **3** | **Literature Review** | $\ge 12$ meaningfully used sources ($\ge 8$ scientific; core within last 5 years + foundational works); structured analysis table. | Initial 6 seed publications recorded in [`docs/user-research.md`](file:///c:/Users/QWERTY/Documents/Development%20of%20a%20compatibility-based%20peer%20learning%20platform/docs/user-research.md). | Expand to $\ge 12$ sources ($\ge 8$ peer-reviewed papers); construct full comparative synthesis matrix (Batch 5). | **In Progress** |
| **4** | **Existing System Comparison** | Comparison of 3–5 relevant systems across 6–10 uniform criteria with access dates and evidence. | Comparative criteria framework defined in scope. | Execute detailed matrix comparing Focusmate, Tandem, Brainly, Discord Study servers, and Studypool (Batch 5). | **Pending** |
| **5** | **Technology Comparison** | Comparison of at least 3 architectural decisions, each with 2–3 alternatives and trade-offs. | Proposed stack identified (React/Express/PostgreSQL). | Produce formal comparative trade-off matrix with cited documentation (Batch 3). | **Proposed** |
| **6** | **Requirements Specification** | Functional & non-functional requirements, priorities, and testable acceptance criteria. | Complete specification in [`docs/requirements-spec.md`](file:///c:/Users/QWERTY/Documents/Development%20of%20a%20compatibility-based%20peer%20learning%20platform/docs/requirements-spec.md), access matrix in [`docs/access-matrix.md`](file:///c:/Users/QWERTY/Documents/Development%20of%20a%20compatibility-based%20peer%20learning%20platform/docs/access-matrix.md), lifecycle in [`docs/session-lifecycle.md`](file:///c:/Users/QWERTY/Documents/Development%20of%20a%20compatibility-based%20peer%20learning%20platform/docs/session-lifecycle.md), and rules in [`docs/compatibility-rules.md`](file:///c:/Users/QWERTY/Documents/Development%20of%20a%20compatibility-based%20peer%20learning%20platform/docs/compatibility-rules.md). | Verify all P0 criteria have testable verification steps (FR-01..19, NFR-01..07) and boundary separation. | **Drafted** |
| **7** | **Architecture & Diagrams** | System Context, Use Case, and Draft Component diagrams; editable sources and readable exports. | Diagram directory structure prepared (`diagrams/src/`, `diagrams/exports/`). | Produce valid Mermaid/PlantUML source files and SVG exports matching the specification (Batch 3). | **Pending** |
| **8** | **UX / Prototype** | Interactive demonstration of core scenario: `Channel → Listing → Response → Acceptance → Session`. | Prototype directory initialized (`prototype/`). | Complete runnable demonstration featuring explicit simulation banners for mocked services (Batch 4). | **Pending** |
| **9** | **Verification & Evaluation Plan** | Testing plan, baseline solution, outcome metrics (RQ1–RQ3), recruitment criteria, and limitations. | Evaluation structure formulated in proposal; protocol detailed in Batch 5. | Define counterbalanced task sets and participant recruitment guidelines (Batch 5). | **Proposed** |
| **10** | **Project Management & Risks** | Git repository, YouTrack project, responsibilities, milestones, risks, and dependencies. | Local Git repository initialized and connected to remote GitHub repository ([peer-learning-platform](https://github.com/belozov/peer-learning-platform)); task backlog tracked in [`docs/youtrack-tasks.md`](file:///c:/Users/QWERTY/Documents/Development%20of%20a%20compatibility-based%20peer%20learning%20platform/docs/youtrack-tasks.md). | Connect official YouTrack instance once provisioned (Batch 6). | **In Progress** |
| **11** | **Supervisor Feedback** | Supervisor review notes from Aigerim Kydyrbekova and resulting action items. | Review package preparation scheduled for 20 October 2026. | Submit review package, log genuine supervisor comments, and formulate revision actions (Batch 6). | **Pending** |

---

## 2. Evidence Register

| Requirement / Deliverable | Primary Artifact Link | Status | Evidence Date | Remaining Actions |
| :--- | :--- | :-: | :-: | :--- |
| **Proposal Document** | [`docs/project-proposal.md`](file:///c:/Users/QWERTY/Documents/Development%20of%20a%20compatibility-based%20peer%20learning%20platform/docs/project-proposal.md) | Drafted | 2026-10-18 | Await supervisor review comments. |
| **Scope & Boundaries** | [`docs/project-scope.md`](file:///c:/Users/QWERTY/Documents/Development%20of%20a%20compatibility-based%20peer%20learning%20platform/docs/project-scope.md) | Drafted | 2026-10-18 | Incorporate feedback on daily boundaries and review thresholds. |
| **Relevance Protocol** | [`docs/user-research.md`](file:///c:/Users/QWERTY/Documents/Development%20of%20a%20compatibility-based%20peer%20learning%20platform/docs/user-research.md) | Drafted | 2026-10-18 | Conduct interviews with 3–5 representative learners. |
| **Decision Records** | [`docs/project-decisions.md`](file:///c:/Users/QWERTY/Documents/Development%20of%20a%20compatibility-based%20peer%20learning%20platform/docs/project-decisions.md) | Drafted | 2026-10-18 | Expand with formal database and WebSocket ADRs. |
| **Requirements Specification** | [`docs/requirements-spec.md`](file:///c:/Users/QWERTY/Documents/Development%20of%20a%20compatibility-based%20peer%20learning%20platform/docs/requirements-spec.md) | Drafted | 2026-10-18 | Review P0/P1 criteria with supervisor. |
| **Access Control Matrix** | [`docs/access-matrix.md`](file:///c:/Users/QWERTY/Documents/Development%20of%20a%20compatibility-based%20peer%20learning%20platform/docs/access-matrix.md) | Drafted | 2026-10-18 | Validate relationship-based boundaries. |
| **Session Lifecycle & Accounting** | [`docs/session-lifecycle.md`](file:///c:/Users/QWERTY/Documents/Development%20of%20a%20compatibility-based%20peer%20learning%20platform/docs/session-lifecycle.md) | Drafted | 2026-10-18 | Validate 60s grace and UTC boundary rules. |
| **Compatibility Rules & Scoring** | [`docs/compatibility-rules.md`](file:///c:/Users/QWERTY/Documents/Development%20of%20a%20compatibility-based%20peer%20learning%20platform/docs/compatibility-rules.md) | Drafted | 2026-10-18 | Empirical validation during user testing. |
| **Architecture Diagrams** | `diagrams/src/*`, `diagrams/exports/*` | Pending | — | Execute Batch 3. |
| **Interactive Prototype** | `prototype/*` | Pending | — | Execute Batch 4. |
| **Supervisor Review Log** | `docs/supervisor-log.md` | Pending | — | Execute Batch 6 following 20 October review. |

---

## 3. Git Repository Governance Rules

1. **Progressive Record of Work**:
   - Commits must represent coherent, atomic units of work with descriptive messages.
   - Bulk uploading the completed project immediately prior to milestones is strictly prohibited.
2. **Branching and Pull Request Strategy**:
   - `main` branch serves as the reviewed, verified baseline.
   - Feature development occurs on dedicated task branches: `PLP-xx-brief-description` (mapping to YouTrack IDs).
   - In this individual diploma project, significant changes are checkpointed and verified against acceptance criteria before merging into `main`.
3. **Submission Tag Integrity**:
   - Tags (`pre-defense-1`, `pre-defense-2`, `final-pre-defense`) must be created **only** at the time of actual milestone submissions.
   - Once pushed, submission tags must never be deleted, replaced, or moved to later commits.
4. **Security and Secret Exclusion**:
   - Zero-credentials policy: No passwords, secret keys, or `.env` files may be committed.
   - Verified via comprehensive `.gitignore`.
