# Development of a Compatibility-Based Peer Learning Platform

[![Status: Analysis & Design in Progress](https://img.shields.io/badge/Status-Analysis%20%26%20Design%20in%20Progress-blue.svg)](#4-current-development-status)
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
   - Deliverables: Comprehensive domain analysis, functional/non-functional requirements, architectural diagrams (source and exports), research and interview protocols, technology comparisons, and an interactive prototype featuring explicit simulation banners.
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
  - Post-session mutual outcome confirmation and single-review submission ($\ge 5\text{ min}$ threshold).
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
| **Review Resolution Report** | **Drafted** | Comprehensive audit addressing Astra review findings B1–B10 in `docs/review-resolution.md`. |
| **Architectural Diagrams** | **In Progress (Batch 3)** | System Context, Use Case, and Component designs in `diagrams/src/` and `diagrams/exports/`. |
| **Interactive Prototype** | **Scheduled (Batch 4)** | Demonstration scenario with explicit simulation banners. |
| **User Relevance Evidence** | **Pending Fieldwork** | Protocol and anonymized template ready in `docs/user-research.md`; 3–5 adult interviews pending. |
| **Literature Review** | **Early Collection Active** | 7 verified scholarly sources recorded in `docs/user-research.md`; full 12+ matrix scheduled for Batch 5. |
| **Supervisor Review** | **Scheduled** | Working target submission for review on 20 October 2026. |

---

## 5. Technology Stack Selection (Proposed)

- **Frontend**: React 18/19 + TypeScript (Vite) — provides strong type-safety, component modularity, and predictable UI state handling for complex discovery filters.
- **Backend**: Node.js + Express 5 (TypeScript) — lightweight modular monolithic architecture sharing TypeScript types with the client.
- **Database**: PostgreSQL 16 — relational consistency, foreign key constraints, GIN index support, and row-level locking for concurrent acceptance.
- **Real-Time Communication**: WebSocket (`ws` / RFC 6455) — low-latency bidirectional session state and chat message synchronization with 60s disconnection grace timer.

---

## 6. Project Management and Tracking

- **Version Control**: Git repository tracking incremental progress through task-based branches (`PLP-xx-feature-name`).
- **Remote Repository**: [https://github.com/belozov/peer-learning-platform](https://github.com/belozov/peer-learning-platform)
- **Task Management (YouTrack)**: `[PENDING: YouTrack Project URL]` *(Provisional local task backlog maintained in `docs/youtrack-tasks.md`)*.

---

## 7. Project Documentation Index

All primary project artifacts are maintained in the [`docs/`](docs/) directory using repository-relative paths:

- [Project Proposal](docs/project-proposal.md): Complete academic proposal, aim, objectives, and problem background.
- [Project Scope & Boundaries](docs/project-scope.md): Detailed functional boundaries, limits, and milestone definitions.
- [Requirements Specification](docs/requirements-spec.md): Complete functional (FR-01..19) and non-functional (NFR-01..07) catalog with two-tier acceptance criteria.
- [Access Control Matrix](docs/access-matrix.md): RBAC and ReBAC permissions matrix, friend relationship definitions, and password hash privacy.
- [Session Lifecycle & Accounting](docs/session-lifecycle.md): State machine, wall-clock timekeeping, 60s grace period, 180m daily allowance, and UTC day boundaries.
- [Compatibility Rules & Scoring](docs/compatibility-rules.md): Deterministic compatibility formula ($T, G, L$), hard eligibility filters, edge cases, and human-readable explanations.
- [Review Resolution Report](docs/review-resolution.md): Itemized resolution of Astra review findings (B1–B10 and improvements).
- [Architecture & System Design](docs/architecture.md): Modular monolith subsystem breakdown and concurrency boundaries.
- [Relational Data Model](docs/data-model.md): Comprehensive schema specification derived from requirements.
- [Technology Comparison](docs/technology-comparison.md): Comparative analysis of 4 technical decisions with official documentation citations.
- [Submission Checklist & Compliance Register](docs/submission-checklist.md): University evaluation criteria and artifact audit status.
- [Architectural Decision Records (ADR)](docs/project-decisions.md): Rationales for technology and algorithmic selections.
- [YouTrack Task Backlog](docs/youtrack-tasks.md): Traceable task definitions with dependencies, risks, and supervisor checkpoints.
- [User Research & Literature Collection](docs/user-research.md): Semi-structured interview protocol, recording template, and audited academic bibliography.

---

## 8. Setup and Verification Instructions

*(Runnable code instructions will expand as implementation progresses. Initial workspace verification commands below)*:

```bash
# Verify Git status
git status

# Inspect documentation structure
ls -la docs/
ls -la diagrams/
ls -la prototype/
```
