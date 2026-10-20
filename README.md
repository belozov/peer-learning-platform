# Development of a Compatibility-Based Peer Learning Platform

[![Status: Research & Prototype Delivered](https://img.shields.io/badge/Status-Research%20%26%20Prototype%20Delivered-blue.svg)](#4-current-development-status)
[![Diploma Project](https://img.shields.io/badge/Diploma%20Project-SE--2416-green.svg)](#2-team-and-supervision)

> A web platform that helps self-directed learners discover, evaluate, and connect with compatible one-to-one study partners within focused topic communities using explainable, multi-attribute matching.

---

## 1. Project Overview

### 1.1 Problem Statement
Self-directed and supplementary learning in technical and academic disciplines (such as Python programming, English language acquisition, and Mathematics) often faces persistence challenges due to isolation, lack of mutual accountability, and schedule misalignment. Existing channels (generic messaging groups, forums, and bulletin boards) suffer from high coordination friction: learners cannot easily assess peer compatibility, negotiate schedules across time zones, or verify commitment before initiating study sessions.

### 1.2 Target Users
- **University Students**: Seeking collaborative problem-solving, exam preparation, and peer code practice.
- **Secondary School Students**: Looking for peer revision and structured practice *(Initial user research and prototype evaluations are bounded strictly to adult learners $\ge 18$; school student recruitment is deferred pending formal ethical procedures)*.
- **Adult Independent Learners**: Balancing professional obligations with structured evening/weekend study routines.

### 1.3 Aim and Objectives
- **Aim**: Design, build, and evaluate a web application that facilitates structured, explainable discovery and scheduling of one-to-one study sessions based on multi-attribute learner compatibility.
- **Key Objectives**:
  1. Define a deterministic, multi-factor compatibility ranking model based on structured learner inputs (topics, goals, knowledge levels, language proficiency, and time overlap).
  2. Implement an explainable partner discovery interface where recommendations are accompanied by human-readable justifications.
  3. Design an accounted session workflow with server-authoritative time tracking and mutual outcome verification.
  4. Formulate and conduct an evaluation plan comparing compatibility-ranked discovery against baseline chronological browsing using identical eligibility filters.

---

## 2. Team and Supervision

| Role | Details |
| :--- | :--- |
| **Student / Author** | **Zhumirov Bekzat** / Жумиров Бекзат Ерболатулы |
| **Group / Programme** | **SE-2416**, Software Engineering |
| **Project Type** | Individual Diploma Project |
| **Responsibilities** | End-to-end delivery: domain analysis, requirements specification, architectural design, prototype development, user research, evaluation protocol, and documentation |
| **Academic Supervisor** | **Aigerim Kydyrbekova** / Айгерим Кыдырбекова |

---

## 3. Project Scope and Delivery Boundaries

### 3.1 Delivery Boundaries
The project explicitly delineates two distinct delivery phases:

1. **Immediate University Milestone (Target: 20–24 October 2026)**:
   - Working supervisor-review target: **20 October 2026**.
   - Stated repository milestone: **24 October 2026** *(Formal designation as "Pre-defense 1" pending institutional confirmation; deadline discrepancy unresolved)*.
   - Deliverables: Comprehensive domain analysis, functional/non-functional requirements, architectural diagrams (source and exports), research and interview protocols, technology comparisons, 14-source literature review, 5-system comparative matrix, evaluation plan, and an interactive demonstration prototype featuring honest coverage labels.
2. **Later Working V1 (Implementation Phase)**:
   - Persistent relational data storage in PostgreSQL, working authentication, real-time WebSocket messaging, server-side usage ledger tracking, and privacy control enforcement.

### 3.2 Confirmed Inclusions vs. Exclusions
- **In Scope (V1)**:
  - 1-to-1 study listings with single-session fulfillment.
  - Channel-gated discovery (learners must join a topic channel to post/respond).
  - Explicit multi-attribute ranking: topic tag overlap ($T$), goal alignment ($G$), and self-reported level proximity ($L$).
  - Eligibility gating: language match and complete scheduled interval overlap $[t_{\text{start}}, t_{\text{end}})$.
  - Server-authoritative session timer with a confirmed daily study allowance ($180\text{ min/day}$).
  - Accounted participation tracking (*measures accounted active participation duration, not verified attention or learning mastery*).
  - Post-session outcome recording (Confirmed) with proposed version-safe mutual confirmation and single-review submission ($\ge 300\text{ s}$ threshold).
- **Confirmed Exclusions**:
  - Commercial/monetized features: Paid teacher verification, paid tutoring services, creator rewards, and payment gateways.
  - Heavy media infrastructure: Excludes voice and video calling; sessions focus strictly on synchronous in-platform text chat.
  - File/cloud storage: Channel posts support text and external web links; no binary document hosting.
  - Black-box psychometrics: No opaque machine learning or personality-based matchmaking.
  - Architecture: Modular monolith deployment; no microservices infrastructure.

---

## 4. Current Development Status

| Deliverable Area | Current Status | Notes / Evidence |
| :--- | :--- | :--- |
| **Project Proposal & Scope** | **Drafted** | Complete baseline in `docs/project-proposal.md` & `docs/project-scope.md`. |
| **Requirements Specification** | **Drafted (Revised)** | FR-01..19, NFR-01..07, access matrix, session lifecycle, and compatibility rules specified. |
| **Review Resolution Report** | **Drafted (Revised)** | Itemized resolution of Astra reviews 1, 2, and 3 in `docs/review-resolution.md`. |
| **Architectural Diagrams** | **Completed (Draft exports)** | System Context, Use Case, and Component designs in `diagrams/src/` and `diagrams/exports/`. |
| **Interactive Prototype** | **Delivered (Simulation)** | Complete client-side prototype in `prototype/`; 13/13 automated test suites pass on `app.js`. |
| **Literature Review** | **Completed (14 sources)** | 14 verified scholarly works (11 peer-reviewed journal articles, 7 recent 2021–2024) in `docs/literature-review.md`. |
| **Existing Systems Comparison** | **Completed** | 5 systems compared across 10 uniform criteria (C1–C10) with access dates in `docs/existing-systems.md`. |
| **Technology Comparison** | **Completed (Revised)** | 4 decisions compared with official citations and prototype/V1 separation in `docs/technology-comparison.md`. |
| **Evaluation Plan** | **Completed (Protocol)** | RQ1–RQ3 protocol, counterbalanced design, identical filters, adult safeguards in `docs/evaluation-plan.md`. |
| **User Relevance Fieldwork** | **Pending Adult Fieldwork** | Protocol and anonymized template ready in `docs/user-research.md`; 3–5 adult interviews pending. |
| **Supervisor Review** | **Scheduled (20 Oct Target)**| Comprehensive review package prepared for submission to Aigerim Kydyrbekova. |

---

## 5. Technology Stack Selection

### 5.1 Milestone Demonstration Prototype (Batch 4 — Delivered)
- **Runtime**: Plain HTML5, CSS3, and standard client-side JavaScript (ECMAScript 2020+ universal UMD module).
- **Execution**: Zero build-step static web execution; runs directly in modern browsers and headless Node.js test environments.
- **State & Clock**: In-memory state store with deterministic demo clock and reconciler for canonical fixtures (A-01..A-04, A-06, S-01, M-01).

### 5.2 Proposed Working-V1 Production Architecture (Planned)
- **Frontend**: React 18/19 + TypeScript (Vite) — component-driven state handling, TSX type validation with backend DTOs.
- **Backend**: Node.js + Express 5 (TypeScript) — modular monolithic architecture supporting the Shared Lock Protocol (`SELECT FOR UPDATE`).
- **Database**: PostgreSQL 16 — relational consistency, check constraints, GIN array indexing, and row-level locking for concurrent acceptance.
- **Real-Time Communication**: WebSocket (`ws` / RFC 6455) — full-duplex session chat with immediate connection-state lifecycle detection and 60s grace buffer.

---

## 6. Project Management and Tracking

- **Version Control**: Git repository tracking incremental progress through task-based branches (`PLP-X-feature-name`).
- **Remote Repository**: [https://github.com/belozov/peer-learning-platform](https://github.com/belozov/peer-learning-platform) (verified reachable and synchronized).
- **GitHub Pull Request**: [https://github.com/belozov/peer-learning-platform/pull/2](https://github.com/belozov/peer-learning-platform/pull/2) (PR #2: Pre-Defense 1 Milestone).
- **Task Management (YouTrack)**: [https://bekzat-diploma-2027.youtrack.cloud/projects/PLP](https://bekzat-diploma-2027.youtrack.cloud/projects/PLP)  
  *(Project Key: `PLP`, Project ID: `0-1`. All 22 milestone tasks `PLP-1` through `PLP-22` are synchronized and tracked on YouTrack Cloud; see [`docs/youtrack-tasks.md`](docs/youtrack-tasks.md))*.

---

## 7. Project Documentation Index

All primary project artifacts are maintained in the [`docs/`](docs/) directory using repository-relative paths:

- [Project Proposal](docs/project-proposal.md): Complete academic proposal, aim, objectives, and problem background.
- [Project Scope & Boundaries](docs/project-scope.md): Detailed functional boundaries, limits, and milestone definitions.
- [Requirements Specification](docs/requirements-spec.md): Complete functional (FR-01..19) and non-functional (NFR-01..07) catalog with two-tier acceptance criteria.
- [Access Control Matrix](docs/access-matrix.md): RBAC and ReBAC permissions matrix, friend relationship definitions, and password hash privacy.
- [Session Lifecycle & Accounting](docs/session-lifecycle.md): State machine, wall-clock timekeeping, 60s grace period, 180m daily allowance, and UTC day boundaries.
- [Compatibility Rules & Scoring](docs/compatibility-rules.md): Deterministic compatibility formula ($T, G, L$), hard eligibility filters, edge cases, and human-readable explanations.
- [Review Resolution Report](docs/review-resolution.md): Itemized resolution of Astra reviews 1, 2, and 3.
- [Architecture & System Design](docs/architecture.md): Modular monolith subsystem breakdown and concurrency boundaries.
- [Relational Data Model](docs/data-model.md): Comprehensive schema specification derived from requirements.
- [Literature Review & Critical Synthesis](docs/literature-review.md): 14 verified scholarly works, analysis matrix, and engineering synthesis.
- [Existing Systems Comparison](docs/existing-systems.md): Matrix comparing 5 platforms across 10 uniform criteria with access dates.
- [Technology Comparison](docs/technology-comparison.md): Comparative analysis of 4 technical decisions with prototype/V1 separation.
- [Empirical Evaluation Protocol](docs/evaluation-plan.md): RQ1–RQ3 protocol, counterbalanced design, and adult ethical safeguards.
- [Submission Checklist & Compliance Register](docs/submission-checklist.md): University evaluation criteria and artifact audit status.
- [Architectural Decision Records (ADR)](docs/project-decisions.md): Rationales for technology and algorithmic selections.
- [YouTrack Task Backlog](docs/youtrack-tasks.md): Traceable task definitions with dependencies, risks, and supervisor checkpoints.
- [User Research Protocol](docs/user-research.md): Semi-structured interview protocol and adult consent template.

---

## 8. Setup and Verification Instructions

### 8.1 Repository Root Execution
```bash
# Start local static web server from root
python -m http.server 3000 --directory prototype

# Run automated verification suite against app.js controller
node prototype/test-prototype.js
```
Open `http://localhost:3000` in any modern web browser.

### 8.2 Prototype Directory Execution
```bash
cd prototype

# Start local server from inside prototype/
python -m http.server 3000 --directory .

# Run automated tests via npm
npm test
```
