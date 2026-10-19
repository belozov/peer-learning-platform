# University Compliance & Submission Checklist

**Project Title:** Development of a Compatibility-Based Peer Learning Platform  
**Student:** Жумиров Бекзат Ерболатулы (Zhumirov Bekzat) | Group: SE-2416  
**Supervisor:** Aigerim Kydyrbekova (Айгерим Кыдырбекова)  
**Verification Date:** 20 October 2026  

---

## 1. Compliance Checklist for 20 / 24 October 2026 Milestone

> **Status Conventions**:
> - **Confirmed**: Supplied in project context or validated by university requirements.
> - **Proposed**: Design recommendation formulated for approval.
> - **Unresolved**: Requires external institutional verification or real-world fieldwork.
> - **Operational Statuses**: `Drafted` | `In Progress` | `Pending` | `Implemented` | `Tested` | `Delivered` | `Approved`.

| № | Component | University Requirement | Current Evidence | Deliverable / Verification Check | Status |
| :-: | :--- | :--- | :--- | :--- | :-: |
| **1** | **Project Proposal** | Title, team members, supervisor, problem, target users, aim, objectives, expected outcomes, scope. | Complete draft in [docs/project-proposal.md](project-proposal.md). | Student name confirmed: Zhumirov Bekzat. Supervisor confirmed: Aigerim Kydyrbekova. Individual responsibilities documented. | **Drafted** |
| **2** | **Evidence of Relevance** | 3–5 genuine user interviews or substantive client agreement separating observations, interpretations, assumptions. | Semi-structured interview protocol & blank recording template in [docs/user-research.md](user-research.md). | Conduct 3–5 adult learner interviews ($\ge 18$). Populate findings without fabrication. | **Pending** |
| **3** | **Literature Review** | $\ge 12$ meaningfully used sources ($\ge 8$ scientific; core within last 5 years + foundational works); structured analysis table. | Full standalone review in [docs/literature-review.md](literature-review.md) containing 14 verified academic sources (11 peer-reviewed journal articles, 7 published 2021–2024), analysis matrix, and critical synthesis. | Audited against CrossRef/publisher DOIs; all fabricated or unverified entries quarantined. | **Drafted (Verified Academic Sources)** |
| **4** | **Existing System Comparison** | Comparison of 3–5 relevant systems across 6–10 uniform criteria with access dates and evidence. | Full comparative analysis in [docs/existing-systems.md](existing-systems.md) evaluating Focusmate, Tandem, Brainly, Discord Study servers, and Studypool across 10 uniform criteria (C1–C10). | Capability claims supported by official documentation or October 2026 interface observations. Distinguishes "not available" from "not verified". | **Drafted** |
| **5** | **Technology Comparison** | Comparison of at least 3 architectural decisions, each with 2–3 alternatives and trade-offs. | Comprehensive comparative analysis of 4 technical decisions in [docs/technology-comparison.md](technology-comparison.md) with official documentation citations and explicit separation between prototype and V1. | Unsupported superlatives removed; trade-offs grounded in official docs and system invariants. | **Drafted (Revised)** |
| **6** | **Requirements Specification** | Functional & non-functional requirements, priorities, and testable acceptance criteria. | Complete specification in [docs/requirements-spec.md](requirements-spec.md), access matrix in [docs/access-matrix.md](access-matrix.md), lifecycle in [docs/session-lifecycle.md](session-lifecycle.md), and rules in [docs/compatibility-rules.md](compatibility-rules.md). | Verified all P0 criteria have testable verification steps, milestone applicability, and specification fixtures (TF-01..05). | **Drafted (Revised)** |
| **7** | **Architecture & Diagrams** | System Context, Use Case, and Draft Component diagrams; editable sources and readable exports. | Architecture narrative in [docs/architecture.md](architecture.md), data model in [docs/data-model.md](data-model.md), Mermaid sources in `diagrams/src/`, and SVG exports in `diagrams/exports/`. | Use Case diagram updated with UML semantics (membership precondition, decoupled scheduling); Component diagram labelled Proposed Working-V1 Architecture. SVG exports regenerated. | **Implemented (Draft exports)** |
| **8** | **UX / Prototype** | Interactive demonstration of core scenario: `Community → Channel → Membership → Listing → Response → Scheduled Session → Active Chat → Outcome → Review → Profile`. | Fully runnable client-side prototype in `prototype/` (`index.html`, `styles.css`, `app.js`, `test-prototype.js`, `README.md`). | Verified via 13/13 automated test suites in Node.js executing `app.js` directly. In-memory channel gating, score format `Score: 80.0 / 100`, outsider privacy guards, deterministic reconciler, and canonical fixtures (A-01..A-04, A-06, S-01, M-01). | **Delivered (Client-Side Simulation Prototype)** |
| **9** | **Verification & Evaluation Plan** | Testing plan, baseline solution, outcome metrics (RQ1–RQ3), recruitment criteria, and limitations. | Standalone protocol in [docs/evaluation-plan.md](evaluation-plan.md) with within-subjects counterbalanced design, identical candidate filtering, objective metrics ($V_{\text{select}}, T_{\text{select}}, C_{\text{score}}$), and SUS. | Adult-only safeguard ($\ge 18$); sample of 10–20 volunteers designated as a Proposed plan. | **Drafted (Evaluation Protocol)** |
| **10** | **Project Management & Risks** | Git repository, YouTrack project, responsibilities, milestones, risks, and dependencies. | Local Git repository initialized and connected to remote GitHub repository ([peer-learning-platform](https://github.com/belozov/peer-learning-platform)); task backlog, dependencies, and risk register tracked in [docs/youtrack-tasks.md](youtrack-tasks.md). YouTrack instance active at [bekzat-diploma-2027.youtrack.cloud](https://bekzat-diploma-2027.youtrack.cloud). | Remote reachability verified via `git fetch`. Provisional `PLP-xx` local task IDs used until cloud issue synchronization. | **In Progress** |
| **11** | **Supervisor Feedback** | Supervisor review notes from Aigerim Kydyrbekova and resulting action items. | Review package preparation scheduled for 20 October 2026. | Submit review package, log genuine supervisor comments, and formulate revision actions (Batch 6). | **Pending** |

---

## 2. Evidence Register

| Requirement / Deliverable | Primary Artifact Link | Status | Evidence Date | Remaining Actions |
| :--- | :--- | :-: | :-: | :--- |
| **Project Proposal** | [docs/project-proposal.md](project-proposal.md) | Drafted | 2026-10-18 | Await supervisor review comments. |
| **Scope & Boundaries** | [docs/project-scope.md](project-scope.md) | Drafted | 2026-10-18 | Incorporate feedback on daily boundaries and review thresholds. |
| **Relevance Protocol** | [docs/user-research.md](user-research.md) | Drafted | 2026-10-18 | Conduct interviews with 3–5 adult learners ($\ge 18$). |
| **Literature Review** | [docs/literature-review.md](literature-review.md) | Drafted | 2026-10-20 | Review synthesis and direct engineering connections with supervisor. |
| **Existing Systems Comparison** | [docs/existing-systems.md](existing-systems.md) | Drafted | 2026-10-20 | Review 10 uniform criteria matrix with supervisor. |
| **Technology Comparison** | [docs/technology-comparison.md](technology-comparison.md) | Drafted (Revised) | 2026-10-20 | Confirm Working-V1 technology selections with supervisor. |
| **Requirements Specification** | [docs/requirements-spec.md](requirements-spec.md) | Drafted (Revised) | 2026-10-18 | Review P0/P1 criteria with supervisor. |
| **Access Control Matrix** | [docs/access-matrix.md](access-matrix.md) | Drafted (Revised) | 2026-10-18 | Validate relationship-based boundaries and password hash privacy. |
| **Session Lifecycle & Accounting** | [docs/session-lifecycle.md](session-lifecycle.md) | Drafted (Revised) | 2026-10-18 | Validate 60s grace, late starts, and UTC boundary rules. |
| **Compatibility Rules & Scoring** | [docs/compatibility-rules.md](compatibility-rules.md) | Drafted (Revised) | 2026-10-18 | Empirical validation during user testing. |
| **Review Resolution Report** | [docs/review-resolution.md](review-resolution.md) | Drafted (Revised) | 2026-10-20 | Incorporate into 20 Oct supervisor review package. |
| **Architecture & Data Model** | [docs/architecture.md](architecture.md), [docs/data-model.md](data-model.md) | Implemented (Draft) | 2026-10-19 | Complete diagram validation (Batch 3). |
| **Interactive Prototype** | `prototype/*` | Delivered (Simulated) | 2026-10-20 | Executed Batch 4 corrections; 13/13 automated tests pass on `app.js`. |
| **Empirical Evaluation Protocol** | [docs/evaluation-plan.md](evaluation-plan.md) | Drafted | 2026-10-20 | Execute protocol with adult volunteer cohort. |
| **Task Management & Backlog** | [docs/youtrack-tasks.md](youtrack-tasks.md) | In Progress | 2026-10-20 | Map provisional `PLP-xx` IDs to cloud YouTrack project. |
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
   - Verified via working-tree and history scans prior to tagging.
