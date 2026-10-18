# Development of a Compatibility-Based Peer Learning Platform

[![Status: Analysis & Design in Progress](https://img.shields.io/badge/Status-Analysis%20%26%20Design%20in%20Progress-blue.svg)](#current-development-status)
[![Diploma Project](https://img.shields.io/badge/Diploma%20Project-SE--2416-green.svg)](#team-and-supervision)

> A web platform that helps self-directed learners discover, evaluate, and connect with compatible one-to-one study partners within focused topic communities using explainable, multi-attribute matching.

---

## 1. Project Overview

### 1.1 Problem Statement
Self-directed and supplementary learning in technical and academic domains (such as Python programming, English language acquisition, and Mathematics) often fails due to isolation, lack of accountability, and schedule misalignment. Existing channels (generic messaging groups, forums, and bulletin boards) suffer from high friction: learners cannot easily assess peer compatibility, negotiate schedules across time zones, or verify commitment before initiating study sessions.

### 1.2 Target Users
- **University Students**: Seeking collaborative problem-solving, exam preparation, and peer code reviews.
- **Secondary School Students**: Looking for peer revision and structured practice.
- **Adult Independent Learners**: Balancing professional obligations with structured evening/weekend study routines.

### 1.3 Aim and Objectives
- **Aim**: Design, build, and evaluate a web application that facilitates structured, explainable discovery and scheduling of one-to-one study sessions based on multi-attribute learner compatibility.
- **Key Objectives**:
  1. Define a deterministic, multi-factor compatibility ranking model based on structured learner attributes (topics, goals, knowledge levels, language proficiency, and time overlap).
  2. Implement an explainable partner discovery interface where recommendations are accompanied by human-readable justifications.
  3. Design an accounted session workflow with server-authoritative time tracking and mutual outcome verification.
  4. Formulate and conduct an evaluation plan comparing compatibility-ranked discovery against baseline chronological browsing.

---

## 2. Team and Supervision

| Role | Details |
| :--- | :--- |
| **Student / Author** | **Жумиров Бекзат Ерболатулы** |
| **Group / Programme** | **SE-2416**, Software Engineering |
| **Project Type** | Individual Diploma Project |
| **Responsibilities** | End-to-end delivery: domain analysis, requirements specification, architectural design, prototype development, user research, evaluation protocol, and documentation |
| **Academic Supervisor** | **Aigerim Kydyrbekova / Айгерим Кыдырбекова** |

---

## 3. Project Scope and Delivery Boundaries

### 3.1 Delivery Boundaries
The project explicitly delineates two distinct delivery phases:

1. **Immediate University Milestone (Target: 20–24 October 2026)**:
   - Working supervisor-review target: **20 October 2026**.
   - Stated repository milestone: **24 October 2026** *(Formal designation as "Pre-defense 1" pending institutional confirmation)*.
   - Deliverables: Comprehensive domain analysis, functional/non-functional requirements, architectural diagrams (source and exports), research and interview protocols, technology comparisons, and an interactive prototype featuring explicit simulation banners.
2. **Later Working V1 (Implementation Phase)**:
   - Persistent relational data storage, production authentication, real-time WebSocket messaging, server-side usage ledger tracking, and privacy control enforcement.

### 3.2 Confirmed Inclusions vs. Exclusions
- **In Scope (V1)**:
  - 1-to-1 study listings with single-session fulfillment.
  - Channel-gated discovery (learners must join a topic channel to post/respond).
  - Explicit multi-attribute ranking: topic tag overlap ($T$), goal alignment ($G$), and self-reported level proximity ($L$).
  - Eligibility gating: language match and complete scheduled interval overlap.
  - Server-authoritative session timer with a daily study allowance ($180\text{ min/day}$).
  - Accounted participation tracking (*measures accounted active presence, not verified attention or learning mastery*).
  - Post-session mutual outcome confirmation and single-review submission.
- **Confirmed Exclusions**:
  - Commercial/monetized features: Paid teacher verification, paid tutoring services, creator rewards, and payment gateways.
  - Heavy media infrastructure: Built-in voice/video calling (external meeting links are utilized).
  - File/cloud storage: Channel posts support text and external links; no binary document hosting.
  - Black-box psychometrics: No opaque machine learning or personality-based matchmaking.
  - Architecture: Modular monolith deployment; no microservices infrastructure.

---

## 4. Current Development Status

| Deliverable Area | Current Status | Notes / Evidence |
| :--- | :--- | :--- |
| **Project Proposal & Scope** | **Drafted** | Complete baseline in `docs/project-proposal.md` & `docs/project-scope.md`. |
| **Requirements Specification** | **In Progress (Batch 2)** | Functional and non-functional specifications structured. |
| **Architectural Diagrams** | **In Progress (Batch 3)** | System Context, Use Case, and Component designs in preparation. |
| **Interactive Prototype** | **Scheduled (Batch 4)** | Demonstration scenario with explicit mocked banners. |
| **User Relevance Evidence** | **Pending Fieldwork** | Protocol and anonymized template ready in `docs/user-research.md`; 3–5 interviews pending. |
| **Literature Review** | **Early Collection Active** | Seed sources recorded; 12+ critical synthesis matrix in progress. |
| **Supervisor Review** | **Pending** | Scheduled submission for review on or before 20 October 2026. |

---

## 5. Technology Stack Selection (Proposed)

- **Frontend**: React + TypeScript (Vite) — provides strong type-safety, component modularity, and predictable UI state handling for complex discovery filters.
- **Backend**: Node.js + Express (TypeScript) — lightweight modular monolithic architecture sharing TypeScript types with the client.
- **Database**: PostgreSQL — relational consistency, foreign key constraints, and transactional guarantees essential for concurrency in listing acceptance and session ledger accounting.
- **Real-Time Communication**: WebSocket (`ws` / Socket.io) — low-latency bidirectional session state and chat message synchronization.

---

## 6. Project Management and Tracking

- **Version Control**: Git repository tracking incremental progress through task-based branches (`PLP-xx-feature-name`).
- **Remote Repository**: `[PENDING: Git Remote Repository URL]` *(Local repository active)*.
- **Task Management (YouTrack)**: `[PENDING: YouTrack Project URL]` *(Provisional task backlog maintained in `docs/youtrack-tasks.md`)*.

---

## 7. Project Documentation Index

All primary project artifacts are maintained in the [`docs/`](file:///c:/Users/QWERTY/Documents/Development%20of%20a%20compatibility-based%20peer%20learning%20platform/docs/) directory:

- [Project Proposal](file:///c:/Users/QWERTY/Documents/Development%20of%20a%20compatibility-based%20peer%20learning%20platform/docs/project-proposal.md): Complete academic proposal, aim, objectives, and problem background.
- [Project Scope & Boundaries](file:///c:/Users/QWERTY/Documents/Development%20of%20a%20compatibility-based%20peer%20learning%20platform/docs/project-scope.md): Detailed functional boundaries, limits, and milestone definitions.
- [Submission Checklist & Compliance Register](file:///c:/Users/QWERTY/Documents/Development%20of%20a%20compatibility-based%20peer%20learning%20platform/docs/submission-checklist.md): University evaluation criteria and artifact audit status.
- [Architectural Decision Records (ADR)](file:///c:/Users/QWERTY/Documents/Development%20of%20a%20compatibility-based%20peer%20learning%20platform/docs/project-decisions.md): Rationales for technology and algorithmic selections.
- [YouTrack Task Backlog](file:///c:/Users/QWERTY/Documents/Development%20of%20a%20compatibility-based%20peer%20learning%20platform/docs/youtrack-tasks.md): Traceable task definitions with acceptance criteria.
- [User Research & Early Literature](file:///c:/Users/QWERTY/Documents/Development%20of%20a%20compatibility-based%20peer%20learning%20platform/docs/user-research.md): Semi-structured interview protocol, recording template, and seed academic bibliography.

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
