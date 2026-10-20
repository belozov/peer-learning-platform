# Supervisor Review Package: Pre-Defense 1 Milestone

**Project Title:** Development of a Compatibility-Based Peer Learning Platform  
**Student:** Жумиров Бекзат Ерболатулы (Zhumirov Bekzat)  
**Student ID / Email:** `241390@astanait.edu.kz`  
**Group / Programme:** SE-2416, Software Engineering  
**Academic Supervisor:** Aigerim Kydyrbekova (Айгерим Кыдырбекова)  
**Submission Target Date:** 20 October 2026 (Working Operational Checkpoint)  
**Repository Milestone:** 24 October 2026  
**Git Remote:** [https://github.com/belozov/peer-learning-platform](https://github.com/belozov/peer-learning-platform)  
**GitHub Pull Request:** [https://github.com/belozov/peer-learning-platform/pull/2](https://github.com/belozov/peer-learning-platform/pull/2) (PR #2)  
**Official Submission Tag:** [`prob-period-1`](https://github.com/belozov/peer-learning-platform/tree/prob-period-1)  
**Required Submission URL:** [https://github.com/belozov/peer-learning-platform/tree/prob-period-1](https://github.com/belozov/peer-learning-platform/tree/prob-period-1)  
**YouTrack Project:** [https://bekzat-diploma-2027.youtrack.cloud/projects/PLP](https://bekzat-diploma-2027.youtrack.cloud/projects/PLP) (Project Key: `PLP`)  

---

## 1. Executive Summary & Review Purpose

This review package compiles the complete research, requirements specification, architectural design, literature synthesis, and runnable demonstration prototype developed for **Pre-Defense 1**.

The platform is designed to eliminate coordination friction for self-directed learners by providing:
1. **Channel-Gated Topic Communities**: Scoped subject discovery preventing spam.
2. **Explainable Multi-Attribute Compatibility**: Deterministic scoring ($S = 0.40T + 0.35G + 0.25L$) displaying human-readable justifications (`Score: 80.0 / 100`) without black-box embeddings.
3. **Accounted Synchronous Study Sessions**: Bounded sessions with server-authoritative timekeeping, a confirmed 180-minute daily allowance, and presence tracking.
4. **Version-Safe Collaborative Outcomes**: Joint post-session topic documentation with mutual confirmation.

### Honest Status Overview
To uphold academic integrity and truth-in-reporting standards:
- **Completed & Verified**: All specification documents, architectural models, SVG diagrams, 14-source literature review, 5-system comparative matrix, evaluation plan, and the interactive web prototype (with 13/13 passing automated test suites in Node.js executing `app.js`).
- **Pending Fieldwork**: Semi-structured discovery interviews with 3–5 adult learners ($\ge 18$) remain pending participant scheduling. Protocol, ethics safeguards, and recording templates are fully prepared in `docs/user-research.md`.
- **Pending Supervisor Input**: Official supervisor comments, revisions, and approval remain pending review by Aigerim Kydyrbekova.

---

## 2. Institutional Deliverables Checklist (11 Components)

| № | University Component | Primary Deliverable File | Current Verification State | Status |
| :-: | :--- | :--- | :--- | :-: |
| **1** | **Project Proposal** | [`docs/project-proposal.md`](project-proposal.md) | Problem background, aim, 4 objectives, scope boundaries, and delivery roadmap. | **Drafted** |
| **2** | **Evidence of Relevance** | [`docs/user-research.md`](user-research.md) | Protocol with 8 core questions, adult-only safeguard ($\ge 18$), and blank template. | **Pending Adult Fieldwork** |
| **3** | **Literature Review** | [`docs/literature-review.md`](literature-review.md) | 14 verified academic publications (11 peer-reviewed journal articles, 7 published 2021–2024); analysis matrix and critical synthesis. | **Completed (14 Verified Sources)** |
| **4** | **Existing Systems Comparison** | [`docs/existing-systems.md`](existing-systems.md) | Comparative matrix evaluating Focusmate, Tandem, Brainly, Discord, and Studypool across 10 uniform criteria (C1–C10) with access dates. | **Completed** |
| **5** | **Technology Comparison** | [`docs/technology-comparison.md`](technology-comparison.md) | 4 technical decisions compared across 2–3 alternatives each with official doc citations; explicit separation between prototype and V1 stack. | **Completed (Revised)** |
| **6** | **Requirements Specification** | [`docs/requirements-spec.md`](requirements-spec.md) | 19 functional (FR-01..19) and 7 non-functional (NFR-01..07) requirements; two-tier acceptance criteria; specification fixtures (TF-01..05). | **Drafted (Revised)** |
| **7** | **Architecture & Diagrams** | [`docs/architecture.md`](architecture.md), [`diagrams/`](../diagrams/) | System Context, Use Case (UML semantics), and Component (Proposed V1 label) diagrams with editable `.mmd` sources and regenerated `.svg` exports. | **Completed (Draft Exports)** |
| **8** | **Interactive Prototype** | [`prototype/`](../prototype/) | Runnable web prototype; in-memory channel gating, score format `Score: 80.0 / 100`, deterministic reconciler, outsider access controls; 13/13 tests pass. | **Delivered (Simulation Prototype)** |
| **9** | **Evaluation Plan** | [`docs/evaluation-plan.md`](evaluation-plan.md) | Formal within-subjects counterbalanced protocol comparing Chronological vs. Compatibility ordering across identical candidates (RQ1–RQ3). | **Completed (Protocol)** |
| **10**| **Project Management & Risks** | [`docs/youtrack-tasks.md`](youtrack-tasks.md), [`README.md`](../README.md) | WBS with 22 traceable tasks, dependencies, 4-item risk register, synchronized remote Git repo, YouTrack cloud project (`PLP-1`..`PLP-22`), and official submission tag `prob-period-1`. | **Completed (Synchronized & Tagged)** |
| **11**| **Supervisor Feedback** | [`docs/supervisor-log.md`](supervisor-log.md) | Action item tracking log prepared to record genuine feedback from Aigerim Kydyrbekova. | **Pending Supervisor Review** |

---

## 3. Key Architectural Decisions Awaiting Supervisor Alignment

The student requests specific review and guidance on the following architectural decision records (`docs/project-decisions.md`):

1. **Rule Classification Clarification**:
   - **Confirmed Requirements**: 180 total study minutes per day for free learners (FR-11); previous-partner list private by default (FR-15); recording session outcomes is confirmed.
   - **Proposed Design Rules**: Multi-attribute matching weights ($0.40T + 0.35G + 0.25L$); UTC daily reset at 00:00 UTC (DEC-004); 60-second reconnection grace period (FR-17); 300-second review eligibility threshold (FR-13, S-01); mutual topic confirmation requirement (FR-12).
   - *Review Question*: Does the supervisor approve these Proposed design rules as the working baseline for V1 implementation?
2. **Accounted Time Framing (Invariant #12)**:
   - System time accounting tracks **accounted active participation duration** under mutual presence; it does not claim to prove internal cognitive attention or verified learning mastery.
   - *Review Question*: Is this phrasing acceptable to the department evaluation committee?
3. **Underage Ethics Safeguard (Safeguard in Scope §1.2 & Research §1.2)**:
   - While the platform's vision includes secondary students, all preliminary discovery interviews and prototype testing are strictly restricted to adult participants ($\ge 18$). Minor recruitment is deferred pending formal institutional ethics clearance.
   - *Review Question*: Does this safeguard satisfy departmental research ethics guidelines for diploma projects?

---

## 4. Prototype Verification Summary

The milestone demonstration prototype is located in [`prototype/`](../prototype/) and can be launched immediately:

```bash
# Launch from repository root
python -m http.server 3000 --directory prototype

# Run automated verification suite (13/13 tests pass)
node prototype/test-prototype.js
```

### Verified Behaviors
- **Channel Membership Gating**: Users must join a channel before accessing the *Find a Partner* listing feed.
- **Explainable Compatibility**: Scores are formatted strictly as `Score: X.Y / 100` (e.g., `Score: 80.0 / 100`, never a percentage).
- **Missing Preference Fallback**: When viewing as Eve (who lacks saved preferences), the feed automatically switches to chronological sorting (`created_at DESC, id ASC`) and the UI indicator updates accordingly without inventing arbitrary baseline scores.
- **Scheduled Session Lifecycle**: Accepting a listing creates a `scheduled` session at 0s duration; active session begins only after advancing the demo clock to scheduled start and confirming participant check-in.
- **Outsider Access Restriction**: Switching to an outsider persona (e.g., Eve or Carol viewing an Alice–Bob session) renders a prominent access restricted notice, hiding private chat messages, outcome editing, and review submission.
- **Deterministic Time Reconciler**: Reconciles daily cap (10,800s), scheduled end, and canonical fixtures (A-01, A-02, A-03, A-04, A-06, S-01, M-01) with consistent HUD, duration counters, and ledger entries.

---

## 5. Review Package Verification Checkpoints

The supervisor is invited to review the primary materials in the following order:
1. **Scope & Compliance**: [`docs/project-scope.md`](project-scope.md) and [`docs/submission-checklist.md`](submission-checklist.md).
2. **Requirements & Lifecycle**: [`docs/requirements-spec.md`](requirements-spec.md) and [`docs/session-lifecycle.md`](session-lifecycle.md).
3. **Architectural Blueprints**: [`docs/architecture.md`](architecture.md) and [`diagrams/exports/`](../diagrams/exports/).
4. **Literature & Comparison**: [`docs/literature-review.md`](literature-review.md) and [`docs/existing-systems.md`](existing-systems.md).
5. **Interactive Prototype**: Run `node prototype/test-prototype.js` and open `http://localhost:3000`.
6. **Action Items**: Record comments and revision instructions in [`docs/supervisor-log.md`](supervisor-log.md).
