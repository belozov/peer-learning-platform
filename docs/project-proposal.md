# Diploma Project Proposal

## 1. Project Metadata
- **Project Title**: Development of a Compatibility-Based Peer Learning Platform
- **Student Name**: Zhumirov Bekzat / Жумиров Бекзат Ерболатулы
- **Group**: SE-2416
- **Degree Programme**: Software Engineering
- **Supervisor**: Aigerim Kydyrbekova / Айгерим Кыдырбекова
- **Project Type**: Individual Diploma Project
- **Working Supervisor-Review Target**: 20 October 2026
- **Stated Repository Milestone**: 24 October 2026 *(Formal designation as "Pre-defense 1" still requires institutional confirmation)*

---

## 2. Individual Responsibilities
As an individual diploma project, all engineering, research, and documentation responsibilities are carried out by the student:
- **Domain Analysis & Requirements Engineering**: Formulating functional and non-functional specifications, edge-case definitions, and data privacy access matrices.
- **Architectural & Data Design**: Modeling system context, use case scenarios, component architecture, and the relational schema.
- **Algorithm Design**: Formulating the explainable multi-attribute compatibility scoring algorithm ($Score = 100(0.40T + 0.35G + 0.25L)$) and eligibility constraints.
- **Prototype & Frontend/Backend Development**: Building the interactive milestone prototype and subsequent full-stack implementation.
- **User Research & Empirical Evaluation**: Conducting 3–5 preliminary discovery interviews with adult learners ($\ge 18$) and designing the controlled evaluation experiment comparing compatibility ranking against chronological browsing.
- **Project Management**: Maintaining Git revision hygiene, task traceability, and documentation integrity.

---

## 3. Problem Statement & Research Motivation
Self-directed and supplementary study in demanding technical disciplines—such as software engineering (e.g., Python), languages (e.g., English), and quantitative disciplines (e.g., Mathematics)—presents well-documented coordination and persistence challenges. Independent learners often struggle to sustain consistent study routines without mutual accountability. Peer learning offers an established collaborative framework to support deeper comprehension through active explanation and discussion.

However, existing collaborative channels present distinct logistical hurdles:
1. **Generic Social and Discussion Channels Lack Structured Compatibility Filtering**: Open forums (Discord, Reddit, Telegram) rely on unorganized message streams where study requests quickly drown in general chatter.
2. **High Coordination Overhead**: Potential study partners must manually negotiate overlapping schedules, study goals, and mutual skill expectations across disparate time zones without standardized profile inputs.
3. **Information Asymmetry and Mismatched Expectations**: Learners frequently commit to sessions only to discover significant disparities in knowledge level, study pace, or primary spoken language.
4. **Lack of Accountable Session Structure**: Unstructured calls suffer from no-shows, indefinite sessions, and lack of agreed-upon tangible study goals.

---

## 4. Target Users
1. **University Students**: Engineering and computer science students seeking collaborative problem-solving, code practice, and exam preparation.
2. **Secondary School Students**: Learners working on foundational mathematics and language proficiency *(Note: Initial user research and prototype evaluations are bounded strictly to adult learners $\ge 18$; school student recruitment is deferred pending formal ethical procedures)*.
3. **Adult Independent Learners**: Career-transitioners and working professionals needing structured, time-bounded study blocks.

Initial topic communities focus on **Python**, **English**, and **Mathematics**.

---

## 5. Project Aim and Objectives

### 5.1 Project Aim
Design, build, and evaluate a web-based peer learning platform that enables learners to find, evaluate, and engage with compatible one-to-one study partners within topic-specific communities using an explainable, multi-attribute matching mechanism.

### 5.2 Key Objectives
1. **Formalize Compatibility Criteria**: Model compatibility as an explainable composite of shared topic tags ($T$), normalized goal categories ($G$), and adjacent knowledge levels ($L$), gated strictly by spoken language match and complete availability interval overlap.
2. **Develop a Modular Monolith Architecture**: Design a clean, maintainable modular monolithic architecture utilizing React, Express (TypeScript), and PostgreSQL with real-time text chat capabilities.
3. **Build an Interactive Demonstration Prototype**: Develop a client demonstration prototype demonstrating the complete 12-step learner journey with explicit simulation banners.
4. **Design a Session Time and Accountability System**: Specify server-authoritative time accounting with a confirmed $180\text{-minute}$ daily allowance boundary and mutual outcome approval.
5. **Formulate an Empirical Evaluation Protocol**: Establish a controlled evaluation methodology comparing user task completion, valid-selection rate, and time-to-partner under compatibility-ranked versus chronological listing conditions using identical eligibility filters.

---

## 6. Expected Outcomes
1. **Requirements & Architectural Specification**: Fully documented functional (FR-01 to FR-19) and non-functional (NFR-01 to NFR-07) specifications, entity relationship definitions, and UML/Mermaid diagrams.
2. **Interactive Demonstration Artifact**: A functional client prototype demonstrating the core partner-matching journey and critical exception screens (e.g., no matches, allowance exhausted, cancellation).
3. **Empirical User Research Dataset**: Documented anonymized notes from 3–5 discovery interviews with adult learners highlighting actual friction points and verifying requirement assumptions.
4. **Validated Evaluation Framework**: A repeatable evaluation protocol designed to test RQ1 (selection suitability), RQ2 (explanation comprehensibility), and RQ3 (interaction error rate).
5. **Traceable Git & Task History**: An organized repository mapped directly to prioritized project tasks.

---

## 7. Bounded Scope and Critical Delimitations

### 7.1 Scope Delimitations
- **One-to-One Focus**: One study listing leads to at most one scheduled 1-to-1 session. Group study and recurring calendar series are deferred.
- **Accounted Participation vs. Mastery**: The system records **accounted active participation time**; it explicitly does **not** claim to measure or guarantee verified mental attention, comprehension, or subject mastery.
- **Text-Centric Collaboration**: In-platform communication during sessions is restricted to structured text chat; voice and video streaming are formally excluded from system scope and architecture.
- **Deterministic vs. Black-Box Matching**: Compatibility is computed via transparent heuristics ($T$, $G$, $L$) with full human explanation; opaque machine learning, deep embeddings, or inferred personality profiles are strictly excluded.

### 7.2 Explicit Exclusions
The following features are formally excluded from the project:
- Commercial monetization (paid tutoring, teacher certification, creator tips, payment gateways).
- Cloud file storage and arbitrary binary attachment hosting.
- Microservices infrastructure (a single deployable modular monolith is enforced).
