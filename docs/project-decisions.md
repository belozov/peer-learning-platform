# Architectural & Project Decision Records (ADRs)

This document records the architectural, methodological, and scoping decisions for the **Compatibility-Based Peer Learning Platform**.

---

## DEC-001: Delivery Boundary Separation (Prototype Milestone vs. Working V1)
- **Status**: Confirmed
- **Context**: The university submission schedule requires a demonstrated system design and interactive scenario by late October 2026 (20 Oct supervisor review working target, 24 Oct repository milestone), leaving insufficient time to securely implement a full production backend without risking code quality or research rigor.
- **Decision**: Delineate two distinct deliverables:
  1. *Immediate University Milestone (20/24 Oct)*: Domain analysis, formal requirements, verified literature baseline, architecture diagrams, research protocols, and an interactive prototype featuring explicit simulation banners for mocked state/chat/time.
  2. *Later Working V1*: Persistent PostgreSQL storage, working Express API, real-time WebSocket infrastructure, and automated integration test coverage.
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
- **Status**: Proposed (Matching weights and level descriptors are proposed engineering hypotheses)
- **Context**: Machine learning or deep embeddings require large pre-existing datasets and produce unexplainable ("black-box") recommendations that reduce user trust.
- **Decision**:
  - Implement a deterministic, explainable scoring function:
    $$\text{Score} = 100 \times (0.40T + 0.35G + 0.25L)$$
    Where:
    - $T$ (Topic fit) = Jaccard similarity between listing tags and viewer preference tags: $\frac{|A \cap B|}{|A \cup B|}$.
    - $G$ (Goal fit) = Categorical alignment ($1.0$ for identical normalized category; $0.0$ otherwise).
    - $L$ (Level fit) = Knowledge level proximity ($1.0$ for exact level, $0.5$ for adjacent level, $0.0$ for two levels apart).
  - Language match and complete time interval overlap are enforced as **hard eligibility gates**, not score modifiers.
  - Display scores as points out of 100 (e.g., `Score: 67.5 / 100`) with 1-decimal rounding rather than percentages.
  - If topic preferences are missing, no score is invented; fallback to chronological order.
- **Consequences**: Every recommendation can display a human-readable justification. Numerical weights ($0.40, 0.35, 0.25$) are explicit engineering hypotheses to be validated through user testing.

---

## DEC-004: Server-Authoritative Time Accounting, Allowance & Day Boundary
- **Status**: Split Classification
  - **Confirmed**: 180 total study minutes per day for free users across sessions.
  - **Proposed**: UTC reset boundary, 60s disconnection grace period, 5-minute review threshold.
- **Context**: Client-side timers are vulnerable to clock tampering, browser tab suspension, and refresh duplication.
- **Decision**:
  - Time is tracked exclusively on the server using monotonic elapsed wall-clock intervals during mutual active presence.
  - Sessions cannot start before `scheduled_start`. Scheduled end is fixed at `scheduled_start + duration`.
  - Late starts do not extend the session end; duration is bounded by actual elapsed time up to `scheduled_end`.
  - Daily allowance is capped at **180 minutes/day (10,800 integer seconds)** (Confirmed).
  - Daily reset boundary is set to **00:00–24:00 UTC** (Proposed). Cross-midnight sessions split credited integer seconds into respective UTC days. Exact-midnight allowance exhaustion terminates session at midnight before new day reset takes effect.
  - A threshold of at least **300 accounted seconds (5 accounted minutes)** is required for public review eligibility or public completion indicators; shorter sessions remain visible only in private history (Proposed).
- **Consequences**: Prevents duplicate time accrual across multiple tabs. Clarifies that tracked time reflects **accounted active participation**, not verified learning mastery.

---

## DEC-005: Scope Exclusions (Commercial Features, Video Streaming, Cloud Files)
- **Status**: Confirmed
- **Context**: Features such as paid tutoring, video conferencing infrastructure, and file hosting divert engineering effort from the core research problem: compatibility-based peer discovery.
- **Decision**: Exclude payments, tutor certification, creator tips, native video streaming, and binary document uploads. Channel posts support text and external links; session communication is strictly in-platform text chat without external meeting or video service dependencies.
- **Consequences**: Dramatically reduces security surface, operational costs, and third-party API dependencies.

---

## DEC-006: Internal Specification Choices vs. Institutional Requirements
- **Status**: Confirmed
- **Context**: Academic committees assess whether requirements and architecture are sound, but specific taxonomic naming conventions or internal relational table counts are engineering implementation details.
- **Decision**:
  - Requirement IDs (FR-01 to FR-19, NFR-01 to NFR-07) and relational database entities are defined as internal specification choices chosen for traceability, not rigid university requirements.
  - Database schema is derived directly from requirements without forcing an arbitrary entity count.
- **Consequences**: Prevents conflating internal engineering taxonomy with mandatory institutional directives.

---

## DEC-007: Working Schedule and Milestone Alignment
- **Status**: Confirmed (Deadline discrepancy remains unresolved)
- **Context**: Institutional documents set 24 October 2026 as the repository milestone, while 20 October 2026 is designated as the supervisor review target. Formal designation of the 24 October milestone as "Pre-defense 1" requires institutional confirmation.
- **Decision**: Prepare a coherent review package (analysis, requirements, access matrix, lifecycle rules, architecture draft, and prototype demonstrator) for supervisor evaluation on 20 October, allowing time for feedback incorporation prior to the 24 October repository milestone.
- **Consequences**: Mitigates deadline risk and ensures supervisor comments are recorded with adequate turnaround time.

---

## DEC-008: Evaluation Sample Size Methodology
- **Status**: Proposed research plan
- **Context**: Conducting a formal empirical study with adult volunteers requires realistic participant recruitment bounds within an academic semester.
- **Decision**: Propose a target recruitment of 10–20 adult learner volunteers for counterbalanced task evaluations (compatibility vs. chronological ordering), while explicitly acknowledging that this target is a proposed study design rather than a university-mandated minimum.
- **Consequences**: Enables statistical distribution analysis without overclaiming broad population-level generalizability from a convenience sample.

---

## DEC-009: Version-Safe Outcome Confirmation
- **Status**: Recording Confirmed; Mutual Confirmation Protocol Proposed
- **Context**: Learners need to document covered topics and study notes after ended sessions. However, naive single-boolean confirmation flags or non-versioned writes allow silent overwrite races when both participants edit simultaneously.
- **Decision**:
  - Recording post-session outcomes is Confirmed.
  - Require both participants to approve the exact same version (`approved_version_a = version AND approved_version_b = version`) under a version-safe optimistic locking protocol (`expected_version`).
  - Edits increment the version and invalidate previous approvals; stale write/confirmation attempts return HTTP 409 Conflict.
- **Consequences**: Guarantees mutual agreement on reported topics without races, while explicitly clarifying that outcome confirmation reflects consensus on reported topics rather than objective proof of mastery.
