# Standalone Empirical Evaluation Protocol & Verification Plan

**Project Title:** Development of a Compatibility-Based Peer Learning Platform  
**Student:** Жумиров Бекзат Ерболатулы (Zhumirov Bekzat) | Group: SE-2416  
**Supervisor:** Aigerim Kydyrbekova (Айгерим Кыдырбекова)  
**Academic Milestone:** Batch 5 Deliverable (Pre-Defense 1 Component 9)  
**Verification Date:** 20 October 2026  

---

## 1. Executive Summary & Epistemological Boundaries

This document defines the formal **Empirical Evaluation Protocol** designed to assess the usability, algorithmic transparency, and partner discovery efficiency of the peer learning platform.

> ### ⚠️ Academic Integrity & Epistemological Boundaries
> 1. **Protocol Only — No Pre-Claimed Results**: In accordance with academic honesty standards, this document represents a **Planned Evaluation Protocol**. No empirical findings, participant performance data, or statistical significance results are claimed prior to conducting the live evaluation.
> 2. **Accounted Time vs. Learning Gains**: As established in Invariant #12 and project scope, tracked session duration measures **accounted active participation duration** under mutual presence. This evaluation does **not** claim or measure improved exam grades, verified subject mastery, or long-term learning retention, which require longitudinal pedagogical studies beyond the scope of this software engineering diploma project.
> 3. **Proposed Sample Plan**: Recruiting 10–20 adult volunteers is an engineering-defensible **Proposed Research Plan**, not a university institutional minimum or a completed recruitment cohort.

---

## 2. Research Questions & Hypotheses

The evaluation addresses three specific research questions grounded in the literature and technical requirements:

### Research Question 1 (RQ1: Discovery Efficiency & Selection Validity)
*Does multi-attribute compatibility ranking improve partner selection validity and reduce time-to-selection compared to strict chronological ordering across an identical candidate pool?*
- **Hypothesis $H_{1A}$ (Selection Validity)**: Participants using the Compatibility Ranked feed will select a listing with significantly higher objective attribute alignment (topic overlap, goal agreement, and skill appropriateness) than participants using the Chronological feed ($p < 0.05$).
- **Hypothesis $H_{1B}$ (Time to Selection)**: Participants using the Compatibility Ranked feed will exhibit a lower mean time-to-selection ($T_{\text{select}}$, in seconds) compared to the Chronological feed.

### Research Question 2 (RQ2: Algorithmic Transparency & Explanation Comprehension)
*Can learners accurately interpret the composite compatibility score and understand its individual attribute contributions ($0.40T + 0.35G + 0.25L$)?*
- **Hypothesis $H_2$ (Comprehension Benchmark)**: At least 80% of participants will correctly identify the primary contributing factor to a match score and understand the chronological fallback mechanism on an objective 3-item comprehension test.

### Research Question 3 (RQ3: End-to-End System Usability & Interaction Friction)
*How do adult learners evaluate the overall usability and cognitive workload of the complete peer learning journey (Channel Membership $\to$ Listing $\to$ Discovery $\to$ Scheduled Session $\to$ Outcome Co-Confirmation)?*
- **Hypothesis $H_3$ (System Usability)**: The platform will achieve a mean System Usability Scale (SUS) score exceeding the established industry benchmark of $68.0$ (Brooke, 1996).

---

## 3. Participant Recruitment & Ethical Safeguards

### 3.1 Target Population & Sample Size (Proposed Plan)
- **Target Cohort**: Adult learners ($\ge 18$ years of age) currently enrolled in higher education or engaged in self-directed technical study (e.g., computer science, mathematics, software engineering).
- **Proposed Sample Size**: $N = 10\text{--}20$ participants. This sample size is statistically defensible for within-subjects counterbalanced usability testing and qualitative discovery (Nielsen & Landauer, 1993; Saksono et al., 2023).

### 3.2 Ethical Protocols & Adult Safeguards
1. **Strict Adult-Only Boundary**: Participation is restricted exclusively to individuals aged 18 and older. Secondary school students are excluded from this preliminary milestone study to eliminate child protection and parental consent ethical risks.
2. **Voluntary Informed Consent**: Each participant receives a Participant Information Sheet detailing the study purpose, risks, and data handling procedures. Written informed consent is obtained prior to beginning.
3. **Right to Withdraw**: Participants may terminate the session or withdraw their data at any point without academic or personal penalty.
4. **Anonymization & Data Protection**: No personally identifiable information (PII) is stored in research ledgers. Participants are assigned arbitrary identifiers (`P-01`, `P-02`, etc.).

---

## 4. Evaluation Dataset & Candidate Pool

To ensure reproducible, controlled comparisons, all experimental tasks are executed against a standardized **pre-seeded dataset of 20 study listings**:

- **Subject Communities**: Software Engineering (`Algorithms`, `Web Development`) and Mathematics (`Calculus`).
- **Controlled Listing Attributes**:
  - Structured duration: 30, 45, or 60 minutes.
  - Spoken languages: English, Kazakh, Russian.
  - Knowledge levels: Beginner, Intermediate, Advanced.
  - Explicit start windows: Dated UTC intervals within the experimental test period.
- **Controlled Compatibility Gradient**: Candidate listings are specifically authored to span the full spectrum of compatibility scores:
  - High compatibility ($S \ge 80.0 / 100$): Exact topic overlap ($T=1.0$), identical goal ($G=1.0$), identical or adjacent level ($L \ge 0.5$).
  - Moderate compatibility ($50.0 \le S < 80.0 / 100$): Partial topic overlap ($T \approx 0.33\text{--}0.50$), different goal ($G=0.0$), adjacent level ($L=0.5$).
  - Low compatibility ($S < 50.0 / 100$): Minimal topic overlap ($T \le 0.20$), conflicting goal ($G=0.0$), distant level ($L=0.0$).

---

## 5. Experimental Design & Counterbalanced Conditions

The study employs a **within-subjects ($2 \times 1$) counterbalanced factorial design**. Every participant experiences both conditions across two distinct, difficulty-balanced learning scenarios:

```
                            COUNTERBALANCING SCHEMA
                    Group 1 (50%)              Group 2 (50%)
               +----------------------+   +----------------------+
  Block 1      |     Condition A      |   |     Condition B      |
               | (Chronological Feed) |   | (Compatibility Feed) |
               +----------------------+   +----------------------+
                          │                          │
                          ▼                          ▼
  Block 2      |     Condition B      |   |     Condition A      |
               | (Compatibility Feed) |   | (Chronological Feed) |
               +----------------------+   +----------------------+
```

### Condition A: Baseline (Strict Chronological Ordering)
- **Candidate Pool**: The full pre-seeded dataset filtered by hard eligibility constraints.
- **Ordering**: Strict chronological order: `created_at DESC, id ASC`.
- **Score Presentation**: No compatibility badges or match explanations are shown.

### Condition B: Proposed System (Multi-Attribute Compatibility Ranking)
- **Candidate Pool**: The **identical candidate pool** filtered by the **exact same hard eligibility constraints** (Invariant #11).
- **Ordering**: Unrounded compatibility score descending, followed by earliest scheduled start, then ID: `compatibility_score DESC, starts_at ASC, id ASC`.
- **Score Presentation**: Clear badge displayed as `Score: X.Y / 100` with an interactive breakdown dialog detailing $T$, $G$, and $L$ components (FR-07).

> **Critical Methodological Invariant (#11)**: Candidate eligibility filters (channel membership, date interval overlap, language match, and absence of user blocks) are **strictly identical** in both conditions. The experimental manipulation isolates the ordering algorithm and score transparency, preventing filtering bias.

---

## 6. Experimental Tasks & Workflow

Participants execute four standardized tasks reflecting the complete peer learning journey:

1. **Task 1: Partner Discovery & Selection (Primary Evaluated Task)**
   - *Prompt*: *"You are preparing for an upcoming Algorithms exam focusing specifically on Dynamic Programming and Graph Search. Find and select the study listing that best matches your topic focus, knowledge level (Intermediate), and 45-minute study window."*
   - *Execution*: Participant opens the channel feed, evaluates available listings, and submits a response to their chosen candidate.
   - *Logged Metrics*: Time-to-selection ($T_{\text{select}}$), selected listing ID, number of listing cards inspected.

2. **Task 2: Listing Creation & Constraint Specification**
   - *Prompt*: *"Create a new study listing for a 60-minute review session on Calculus derivatives starting tomorrow at 15:00 UTC."*
   - *Execution*: Participant completes the listing creation form with required title, tags, explicit author level, language, and duration.
   - *Logged Metrics*: Input validation errors encountered, form completion time.

3. **Task 3: Scheduled Session Check-in & Simulation**
   - *Prompt*: *"Your listing has been accepted. Advance the demo clock to the scheduled start time and check in to initiate the active study session."*
   - *Execution*: Participant uses demo controls to advance the clock and verifies the state transition from `scheduled` to `active`.
   - *Logged Metrics*: Successful state transition, elapsed seconds to check in.

4. **Task 4: Collaborative Outcome Editing & Mutual Confirmation**
   - *Prompt*: *"Your study session has ended. Review the outcome summary, make a brief note regarding the problem solved, and approve the final version alongside your partner."*
   - *Execution*: Participant edits the draft outcome text, observes the version increment ($v \to v+1$), and completes mutual approval.
   - *Logged Metrics*: Successful outcome confirmation without unhandled 409 conflict errors.

---

## 7. Quantitative & Qualitative Dependent Measures

| Measure | Metric Type | Operational Definition / Calculation | Addressed RQ |
| :--- | :--- | :--- | :-: |
| **Selection Validity Rate ($V_{\text{select}}$)** | Quantitative Objective | Percentage of selected listings that satisfy all scenario constraints: topic overlap $T \ge 0.50$, skill differential $|L_A - L_B| \le 1$, and duration match. | **RQ1** |
| **Time to Selection ($T_{\text{select}}$)** | Quantitative Objective | Duration in seconds from initial feed rendering to clicking "Respond to Listing". | **RQ1** |
| **Inspected Cards Count ($C_{\text{inspect}}$)** | Quantitative Objective | Total number of listing cards clicked or expanded prior to making a final selection. | **RQ1** |
| **Explanation Comprehension Score ($C_{\text{score}}$)** | Quantitative Objective | Score out of 3 on an objective multiple-choice test: (1) calculating a 3-part score, (2) interpreting why a score is partial, and (3) identifying missing-preference fallback. | **RQ2** |
| **Perceived Transparency Rating** | Quantitative Subjective | 7-point Likert item: *"I understood why each study candidate was recommended to me"* (1 = Strongly Disagree, 7 = Strongly Agree). | **RQ2** |
| **System Usability Scale (SUS)** | Quantitative Standardized | Standard 10-item Likert questionnaire (Brooke, 1996) converted to standard 0–100 scale. | **RQ3** |
| **Task Completion Rate ($R_{\text{complete}}$)** | Quantitative Objective | Percentage of participants successfully executing Tasks 1–4 without critical fatal errors. | **RQ3** |
| **Qualitative Feedback / Friction Log** | Qualitative Semistructured | Thematic analysis of post-task verbal responses regarding confusing UI states, trust, and perceived fairness. | **RQ1–RQ3** |

---

## 8. Step-by-Step Experimental Procedure

The full experimental session is structured into six sequential phases totaling approximately 55 minutes per participant:

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Onboarding & Informed Consent (5 min)                         │
│ - Explain voluntary study, privacy safeguards, and adult consent       │
│ - Collect basic demographics (academic discipline, study habits)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 2: Interface Familiarization (5 min)                             │
│ - Walk through interface layout, channel switcher, and persona selector │
│ - Conduct one non-evaluated trial task                                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 3: Block 1 Execution (Condition A or B) (15 min)                 │
│ - Execute Tasks 1 through 4 under first assigned ordering condition    │
│ - System logs timing, clicks, and selections automatically             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 4: Intermediate Assessment (5 min)                               │
│ - Administer condition-specific subjective satisfaction items          │
│ - 2-minute cognitive rest break                                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 5: Block 2 Execution (Alternate Condition) (15 min)              │
│ - Execute Tasks 1 through 4 under second assigned ordering condition   │
│ - Scenario topic is varied to prevent recall bias                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 6: Post-Study Evaluation & Debrief (10 min)                      │
│ - Standardized 10-item System Usability Scale (SUS) questionnaire       │
│ - 3-item Objective Explanation Comprehension Test                      │
│ - Short semi-structured qualitative exit interview & debriefing        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Threats to Validity & Methodological Limitations

1. **Construct Validity (Accounted Participation vs. Subject Mastery)**:
   - *Limitation*: The system measures accounted presence duration and self-reported mutual outcomes; it does not administer standardized subject pre- and post-tests.
   - *Mitigation*: The project explicitly frames its scope around **interaction coordination, discovery efficiency, and usability**, rather than claiming direct cognitive pedagogy.
2. **Internal Validity (Order & Carryover Effects)**:
   - *Limitation*: Participants may perform faster in the second block due to interface familiarity.
   - *Mitigation*: Systematic $A \to B$ vs. $B \to A$ counterbalancing across cohorts, paired with distinct subject scenarios for each block.
3. **External Validity (Sample Generalizability)**:
   - *Limitation*: A convenience sample of 10–20 university students cannot represent all global self-directed learners across disparate ages and domains.
   - *Mitigation*: Findings are explicitly reported as an exploratory preliminary evaluation of a software engineering prototype, avoiding sweeping sociological generalizations.
4. **Ecological Validity (Simulated In-Memory Prototype)**:
   - *Limitation*: The prototype operates client-side with simulated demo clock advancement and fictional personas rather than unconstrained weeks-long peer interactions.
   - *Mitigation*: Tasks are strictly scripted to test verifiable workflow transitions under controlled benchmark conditions.
