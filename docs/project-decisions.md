# Architectural & Project Decision Records (ADRs)

This document records the architectural, methodological, and scoping decisions for the **Compatibility-Based Peer Learning Platform**.

---

## DEC-001: Delivery Boundary Separation (Prototype Milestone vs. Working V1)
- **Status**: Confirmed
- **Context**: The university submission schedule requires a demonstrated system design and interactive scenario by late October 2026 (20 Oct supervisor review, 24 Oct repository milestone), leaving insufficient time to securely implement a full production backend without risking code quality or research rigor.
- **Decision**: Delineate two distinct deliverables:
  1. *Immediate Milestone*: Analysis, formal requirements, verified literature baseline, architecture diagrams, research protocols, and an interactive prototype featuring explicit simulation banners for mocked state/chat/time.
  2. *Later Working V1*: Persistent PostgreSQL storage, production Express API, real-time WebSocket infrastructure, and automated integration test coverage.
- **Consequences**: Enables rigorous verification of user experience and compatibility algorithms before committing to database migrations and server deployment.

---

## DEC-002: Architectural Pattern — Modular Monolith over Microservices
- **Status**: Proposed
- **Context**: Modern distributed architectures introduce operational complexity (network partitions, distributed transactions, multi-repo overhead) that does not benefit a single-developer diploma project.
- **Decision**: Adopt a **Modular Monolith** architecture:
  - Single deployable Express API written in TypeScript.
  - Distinct internal domain modules: `auth`, `communities`, `listings`, `sessions`, `accounting`, `moderation`.
  - Single PostgreSQL database enforcing referential integrity.
- **Consequences**: Simplifies local setup, transactional consistency for listing acceptance, and repository management while maintaining clear internal boundaries.

---

## DEC-003: Deterministic Multi-Attribute Compatibility Ranking
- **Status**: Proposed (Matching weights are a proposed starting hypothesis)
- **Context**: Machine learning or deep embeddings require large pre-existing datasets and produce unexplainable ("black-box") match recommendations that reduce user trust.
- **Decision**:
  - Implement a deterministic, explainable scoring function:
    $$\text{Score} = 100 \times (0.40T + 0.35G + 0.25L)$$
    Where:
    - $T$ (Topic fit) = Jaccard similarity between listing tags and viewer preference tags: $\frac{|A \cap B|}{|A \cup B|}$.
    - $G$ (Goal fit) = Categorical alignment ($1$ for identical normalized category; $0$ otherwise).
    - $L$ (Level fit) = Knowledge level proximity ($1.0$ for exact level, $0.5$ for adjacent level, $0$ for two levels apart).
  - Language match and complete time interval overlap are enforced as **hard eligibility gates**, not score modifiers.
- **Consequences**: Every recommendation can display a human-readable justification (e.g., *"Same topic, shared language, full time overlap, adjacent level"*). Weights will be validated during empirical testing.

---

## DEC-004: Server-Authoritative Time Accounting and Daily Boundary
- **Status**: Proposed design rules
- **Context**: Client-side timers are vulnerable to clock tampering, browser tab suspension, and refresh duplication.
- **Decision**:
  - Time is tracked exclusively on the server using monotonic wall-clock intervals during mutual active presence.
  - Daily allowance is capped at $180\text{ minutes/day}$ for free learners across all sessions.
  - The daily reset boundary is fixed at $00:00\text{--}24:00\text{ UTC}$ to prevent timezone switching exploits.
  - A threshold of at least $5\text{ accounted minutes}$ is required for a session to be eligible for public review submission or public completion indicators; shorter sessions remain visible only in private history.
- **Consequences**: Prevents duplicate time accrual across multiple tabs. Clarifies that tracked time reflects **accounted active participation**, not verified cognitive comprehension or attention.

---

## DEC-005: Scope Exclusions (Commercial Features, Video Streaming, Cloud Files)
- **Status**: Confirmed
- **Context**: Features such as paid tutoring, video conferencing infrastructure, and file hosting divert engineering effort from the core research problem: compatibility-based peer discovery.
- **Decision**: Exclude payments, tutor certification, creator tips, native video streaming, and binary document uploads. Channel posts support text and external links; sessions support text chat and external video meeting links (e.g., Google Meet).
- **Consequences**: Dramatically reduces security surface, operational costs, and third-party API dependencies.

---

## DEC-006: Internal Specification Choices vs. Institutional Requirements
- **Status**: Confirmed
- **Context**: Academic committees assess whether requirements and architecture are sound, but specific taxonomic naming conventions or internal relational table counts are engineering implementation details.
- **Decision**:
  - Requirement IDs (FR-01 to FR-19, NFR-01 to NFR-07) and the 11-entity relational database structure are defined as internal specification choices chosen for traceability, not rigid university requirements.
  - Any future refinement or grouping of entities remains fully compliant with academic guidelines.
- **Consequences**: Prevents conflating internal engineering taxonomy with mandatory institutional directives.

---

## DEC-007: Working Schedule and Milestone Synchronization
- **Status**: Confirmed
- **Context**: The institutional guidelines set 24 October 2026 as the repository milestone, while 20 October 2026 is designated as the supervisor review package deadline. Formal designation of the 24 October milestone as "Pre-defense 1" requires institutional confirmation.
- **Decision**: Align project milestones such that a coherent review package (analysis, requirements, architecture, and prototype draft) is ready for supervisor evaluation on 20 October, allowing four days for feedback incorporation before the 24 October repository milestone.
- **Consequences**: Mitigates deadline risk and ensures supervisor comments are recorded with adequate turnaround time.

---

## DEC-008: Evaluation Sample Size Methodology
- **Status**: Proposed research plan
- **Context**: Conducting a formal empirical study with adult volunteers requires realistic participant recruitment bounds within an academic semester.
- **Decision**: Propose a target recruitment of 10–20 adult learner volunteers for counterbalanced task evaluations (compatibility vs. chronological ordering), while explicitly acknowledging that this target is a proposed study design rather than a university-mandated minimum.
- **Consequences**: Enables statistical distribution analysis without overclaiming broad population-level generalizability from a convenience sample.
