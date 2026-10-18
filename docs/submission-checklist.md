# University Compliance & Submission Checklist

## 1. Compliance Checklist for 20 / 24 October 2026 Milestone

> **Status Conventions**:
> - **Confirmed**: Supplied in project context or validated by university requirements.
> - **Proposed**: Design recommendation formulated for approval.
> - **Unresolved**: Requires external institutional verification or real-world fieldwork.
> - **Operational Statuses**: `Drafted` | `In Progress` | `Pending` | `Implemented` | `Tested` | `Approved`.

| № | Component | University Requirement | Current Evidence | Deliverable / Verification Check | Status |
| :-: | :--- | :--- | :--- | :--- | :-: |
| **1** | **Project Proposal** | Title, team members, supervisor, problem, target users, aim, objectives, expected outcomes, scope. | Complete draft in [docs/project-proposal.md](project-proposal.md). | Student name confirmed: Zhumirov Bekzat. Supervisor confirmed: Aigerim Kydyrbekova. Individual responsibilities documented. | **Drafted** |
| **2** | **Evidence of Relevance** | 3–5 genuine user interviews or substantive client agreement separating observations, interpretations, assumptions. | Semi-structured interview protocol & blank recording template in [docs/user-research.md](user-research.md). | Conduct 3–5 adult learner interviews ($\ge 18$). Populate findings without fabrication. | **Pending** |
| **3** | **Literature Review** | $\ge 12$ meaningfully used sources ($\ge 8$ scientific; core within last 5 years + foundational works); structured analysis table. | Audited bibliography in [docs/user-research.md](user-research.md) with 7 verified scholarly works (4 journal articles, 2 book/chapter, 1 monograph). | Expand to $\ge 12$ sources ($\ge 8$ peer-reviewed papers) including recent 2021–2026 studies; construct full comparative matrix (Batch 5). | **In Progress** |
| **4** | **Existing System Comparison** | Comparison of 3–5 relevant systems across 6–10 uniform criteria with access dates and evidence. | 10 uniform comparative criteria defined in [docs/project-scope.md](project-scope.md) §5. | Execute detailed matrix comparing Focusmate, Tandem, Brainly, Discord Study servers, and Studypool (Batch 5). | **Pending** |
| **5** | **Technology Comparison** | Comparison of at least 3 architectural decisions, each with 2–3 alternatives and trade-offs. | Comprehensive comparative analysis of 4 technical decisions with official doc citations in [docs/technology-comparison.md](technology-comparison.md). | Review trade-offs with supervisor; finalize technology choices (Batch 3). | **Proposed** |
| **6** | **Requirements Specification** | Functional & non-functional requirements, priorities, and testable acceptance criteria. | Complete specification in [docs/requirements-spec.md](requirements-spec.md), access matrix in [docs/access-matrix.md](access-matrix.md), lifecycle in [docs/session-lifecycle.md](session-lifecycle.md), and rules in [docs/compatibility-rules.md](compatibility-rules.md). | Verified all P0 criteria have testable verification steps, milestone applicability, and specification fixtures (TF-01..05). | **Drafted (Revised)** |
| **7** | **Architecture & Diagrams** | System Context, Use Case, and Draft Component diagrams; editable sources and readable exports. | Architecture narrative in [docs/architecture.md](architecture.md), data model in [docs/data-model.md](data-model.md), Mermaid sources in `diagrams/src/`, and SVG exports in `diagrams/exports/`. | Inspect exported diagrams for readability and architectural alignment (Batch 3). | **In Progress** |
| **8** | **UX / Prototype** | Interactive demonstration of core scenario: `Channel → Listing → Response → Acceptance → Session`. | Prototype directory initialized (`prototype/`). | Complete runnable demonstration featuring explicit simulation banners for mocked services (Batch 4). | **Pending** |
| **9** | **Verification & Evaluation Plan** | Testing plan, baseline solution, outcome metrics (RQ1–RQ3), recruitment criteria, and limitations. | Evaluation structure formulated in [docs/project-scope.md](project-scope.md) and [docs/compatibility-rules.md](compatibility-rules.md) §2.2. | Define counterbalanced task sets with identical filtering and adult recruitment guidelines (Batch 5). | **Proposed** |
| **10** | **Project Management & Risks** | Git repository, YouTrack project, responsibilities, milestones, risks, and dependencies. | Local Git repository initialized and connected to remote GitHub repository ([peer-learning-platform](https://github.com/belozov/peer-learning-platform)); task backlog, dependencies, and risk register tracked in [docs/youtrack-tasks.md](youtrack-tasks.md). | Connect official YouTrack instance once provisioned; provisional `PLP-xx` IDs used locally (Batch 6). | **In Progress** |
| **11** | **Supervisor Feedback** | Supervisor review notes from Aigerim Kydyrbekova and resulting action items. | Review package preparation scheduled for 20 October 2026. | Submit review package, log genuine supervisor comments, and formulate revision actions (Batch 6). | **Pending** |

---

## 2. Evidence Register

| Requirement / Deliverable | Primary Artifact Link | Status | Evidence Date | Remaining Actions |
| :--- | :--- | :-: | :-: | :--- |
| **Project Proposal** | [docs/project-proposal.md](project-proposal.md) | Drafted | 2026-10-18 | Await supervisor review comments. |
| **Scope & Boundaries** | [docs/project-scope.md](project-scope.md) | Drafted | 2026-10-18 | Incorporate feedback on daily boundaries and review thresholds. |
| **Relevance Protocol** | [docs/user-research.md](user-research.md) | Drafted | 2026-10-18 | Conduct interviews with 3–5 adult learners ($\ge 18$). |
| **Decision Records** | [docs/project-decisions.md](project-decisions.md) | Drafted | 2026-10-18 | Review starting weights and UTC boundary design rules. |
| **Task Management & Risks** | [docs/youtrack-tasks.md](youtrack-tasks.md) | Drafted | 2026-10-18 | Import provisional tasks into official YouTrack once created. |
| **Requirements Specification** | [docs/requirements-spec.md](requirements-spec.md) | Drafted (Revised) | 2026-10-18 | Review P0/P1 criteria with supervisor. |
| **Access Control Matrix** | [docs/access-matrix.md](access-matrix.md) | Drafted (Revised) | 2026-10-18 | Validate relationship-based boundaries and password hash privacy. |
| **Session Lifecycle & Accounting** | [docs/session-lifecycle.md](session-lifecycle.md) | Drafted (Revised) | 2026-10-18 | Validate 60s grace, late starts, and UTC boundary rules. |
| **Compatibility Rules & Scoring** | [docs/compatibility-rules.md](compatibility-rules.md) | Drafted (Revised) | 2026-10-18 | Empirical validation during user testing. |
| **Review Resolution Report** | [docs/review-resolution.md](review-resolution.md) | Drafted | 2026-10-18 | Incorporate into 20 Oct supervisor review package. |
| **Architecture & Data Model** | [docs/architecture.md](architecture.md), [docs/data-model.md](data-model.md) | In Progress | 2026-10-18 | Complete diagram validation (Batch 3). |
| **Interactive Prototype** | `prototype/*` | Pending | — | Execute Batch 4. |
| **Supervisor Review Log** | `docs/supervisor-log.md` | Pending | — | Execute Batch 6 following 20 October review. |

---

## 3. Git Repository Governance Rules

1. **Progressive Record of Work**:
   - Commits represent coherent, atomic units of work with descriptive messages and task identifiers (`PLP-xx-feature-name`).
   - Bulk uploading the completed project immediately prior to milestones is strictly prohibited.
2. **Branching and Pull Request Strategy**:
   - `main` branch serves as the reviewed, verified baseline.
   - Work occurs on dedicated task branches and is merged via Pull Requests on GitHub or local fast-forwards with task references.
3. **Submission Tag Integrity**:
   - Tags (`pre-defense-1`, `pre-defense-2`, `final-pre-defense`) must be created **only** at the time of actual milestone submissions.
   - Once pushed, submission tags must never be deleted, replaced, or moved to later commits.
4. **Security and Secret Exclusion**:
   - Zero-credentials policy: No passwords, secret keys, or `.env` files may be committed.
   - Verified via planned working-tree and history scans (`git-secrets` / `trufflehog`) prior to tagging.
