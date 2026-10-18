# Access Control & Permissions Matrix

## 1. Architectural Access Model

The platform enforces a hybrid **Role-Based Access Control (RBAC)** and **Relationship-Based Access Control (ReBAC)** model. Access permissions are evaluated against the actor's system role, their contextual relationship to the resource, and the current state of the resource.

### 1.1 Account Roles (System-Level)
- **`Visitor`**: Unauthenticated guest browsing public introductory information and community overviews. Public registration creates exclusively `Learner` accounts; `Administrator` accounts cannot be registered publicly and are provisioned via secure CLI or migrations.
- **`Learner`**: Authenticated standard account engaging in study activities.
- **`Administrator`**: Privileged platform moderator managing communities, reviewing flagged reports, and enforcing account restrictions.

### 1.2 Contextual Resource Relationships
- **`Owner / Self`**: The authenticated learner who created the resource (own profile, own post, own listing, own response).
- **`Pending Respondent`**: A learner who has an active `pending` application on an open study listing.
- **`Active Session Participant`**: A learner bound to an ongoing `active` one-to-one session.
- **`Ended Session Participant`**: A learner bound to a completed `ended` one-to-one session.
- **`Friend`**: A learner with a mutually accepted friendship connection with another learner. *Friendship is a relationship, not a role; it modulates social presence but never bypasses private study history or session chat isolation.*
- **`Blocked Learner`**: A peer where an active directional or mutual block exists.

---

## 2. Field-Level Access Control Matrix

### Legend
- **`R`**: Read / View access permitted.
- **`W`**: Write / Create / Edit access permitted.
- **`D`**: Delete / Remove access permitted.
- **`–`**: Access denied (HTTP 401 / 403 / 404).
- **`*`**: Conditional access (governed by opt-in privacy toggles or state predicates).

---

### 2.1 User Profile & Identity Fields

| Profile Attribute | Visitor | Non-Friend Learner | Friend Relationship | Active/Ended Partner | Self (Owner) | Administrator |
| :--- | :-: | :-: | :-: | :-: | :-: | :-: |
| **Username & Display Name** | R | R | R | R | R, W | R |
| **Avatar URL & Bio** | R | R | R | R | R, W | R |
| **Timezone & Primary Languages** | R | R | R | R | R, W | R |
| **Topic Preferences & Levels** | – | R | R | R | R, W | R |
| **Weekly Availability Slots** | – | – | – | R *(during match)* | R, W | R |
| **Online / Presence Status** | – | – | R | R *(during session)*| R | R |
| **Public Reputation Badges** | R | R | R | R | R | R |
| **Previous Partners List** | – | –* *(opt-in)* | –* *(opt-in)* | –* *(opt-in)* | R, W | R |
| **Remaining Daily Allowance** | – | – | – | – | R | R |
| **Verified Email Address** | – | – | – | – | R, W | R *(Audit only)*|
| **Password Hash** | **–** | **–** | **–** | **–** | **–** | **– (NEVER EXPOSED)** |
| **Role & Account Status** | – | – | – | – | R | R, W |

> **Security & Privacy Invariants**:
> 1. **Password Hash Privacy**: Password hashes are strictly server-internal secrets and are **never serialized or exposed** in any API response or administrative interface.
> 2. **Previous Partners List**: Confirmed **private by default**. Only exposed if the owner explicitly enables `privacy_show_partners = true`.

---

### 2.2 Communities, Channels & Posts

| Resource / Action | Visitor | Non-Member Learner | Channel Member | Post Author | Administrator |
| :--- | :-: | :-: | :-: | :-: | :-: |
| **Browse Community Catalog** | R | R | R | R | R |
| **Create Community** | – | – | – | – | W |
| **Create Topic Channel** | – | W *(In community)* | W | W | W |
| **Join / Leave Channel** | – | W | W | W | W |
| **Read Channel Discussion Posts**| – | – *(Gated)* | R | R | R |
| **Publish Discussion Post** | – | – | W | W | W |
| **Edit / Delete Own Post** | – | – | – | W, D | W, D |
| **Moderate / Hide Post** | – | – | – | – | W *(Soft delete)* |
| **Acknowledge Post (Helpful)** | – | – | W *(1 per post)*| – *(Self excluded)*| W |

> **Channel Creation Clarification**: Any authenticated `Learner` can create a new topic channel within an existing community (FR-03). Channel membership is not a prerequisite to create a channel.

---

### 2.3 Study Listings & Responses

| Listing & Response Action | Visitor | Non-Member Learner | Channel Member | Listing Author | Pending Respondent | Accepted Partner |
| :--- | :-: | :-: | :-: | :-: | :-: | :-: |
| **Browse Open Listings** | – | – *(Gated)* | R | R | R | R |
| **Create Study Listing** | – | – | W | W | – | – |
| **Cancel / Delete Own Listing** | – | – | – | W, D | – | – |
| **Submit Response to Listing** | – | – | W *(If eligible)*| – *(Self excluded)*| – | – |
| **Withdraw Pending Response** | – | – | – | – | D *(Before acceptance)*| – |
| **Re-Respond after Withdrawal** | – | – | W *(If still open)*| – | – | – |
| **View Candidate Responses List**| – | – | – | R *(With scores)*| – | – |
| **Accept Candidate Respondent** | – | – | – | W *(Locks session)*| – | – |

> **Response Lifecycle Invariant**: A learner who has withdrawn their response from an open listing may submit a new response, provided the listing remains open and the learner has no other active response to that listing.

---

### 2.4 One-to-One Sessions, Chat & Post-Session Actions

| Session Action / Resource | Visitor | Non-Participant | Friend | Scheduled Partner | Active Partner | Ended Partner | Administrator |
| :--- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| **View Scheduled Session Card** | – | – | – | R | R | R | – |
| **Cancel Scheduled Session** | – | – | – | W *(Either party)*| – | – | W *(Moderation)* |
| **Enter Session Chat Room** | – | – | – | – | R, W | – | – |
| **Send Session Message** | – | – | – | – | W *(During active)*| – | – |
| **Read Session Chat History** | – | – | – | – | R | R *(Read-only archive)*| R* *(Report audit)* |
| **End Session Early** | – | – | – | – | W *(Either party)*| – | W *(Moderation)* |
| **Draft Session Outcomes** | – | – | – | – | – | W *(Either partner)* | – |
| **Confirm Outcome Notes** | – | – | – | – | – | W *(Both must approve)*| – |
| **Submit Partner Review** | – | – | – | – | – | W *(If $\ge 5$ min)* | – |

> **Audit Exception**: Administrators cannot browse session chat archives generally. Chat history is accessible to administrators **only within the context of an active moderation report** filed by one of the participants.

---

### 2.5 Private History & Moderation Actions

| Resource / Function | Visitor | Non-Friend Learner | Friend Relationship | Account Owner | Administrator |
| :--- | :-: | :-: | :-: | :-: | :-: |
| **Private Study History Log** | – | – | – | R | – |
| **Usage Ledger (Counted Minutes)**| – | – | – | R | R *(Aggregated stats)* |
| **Place Account Block** | – | W | W | – | – |
| **Submit Misuse Report** | – | W | W | – | R *(Moderation queue)* |
| **Suspend / Restrict Account** | – | – | – | – | W |

---

## 3. Relationship Lifecycle & Safety Transitions

### 3.1 Active Session Blocking Invariants
When Learner A blocks Learner B:
1. **Scheduled Session**: If a session between A and B is `scheduled`, it is immediately transitioned to `cancelled`. Both participants' schedules are unlocked; 0 minutes are charged.
2. **Active Session**: If a session between A and B is currently `active`, it is immediately transitioned to `ended` with reason `manual_exit` (or `blocked`). Chat is halted immediately; accrued active time up to the block event is finalized once.
3. **Future Contact**: Listings authored by either party are suppressed from the other's search feeds. Response submissions and friend requests between the pair are strictly rejected.
4. **Evidence Preservation**: Session chat history remains archived on the server, accessible exclusively to platform moderators if an abuse report is filed.
