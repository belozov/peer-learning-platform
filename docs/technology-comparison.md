# Technology Alternatives & Comparative Trade-Off Analysis

**Project Title:** Development of a Compatibility-Based Peer Learning Platform  
**Student:** Жумиров Бекзат Ерболатулы (Zhumirov Bekzat) | Group: SE-2416  
**Supervisor:** Aigerim Kydyrbekova (Айгерим Кыдырбекова)  
**Academic Milestone:** Batch 5 Deliverable (Pre-Defense 1 Component 5)  
**Verification Date:** 20 October 2026  

---

## 1. Architectural Scope & Implementation Separation

To maintain strict truth-in-reporting and prevent architectural misrepresentation, this analysis explicitly delineates between two distinct technological artifacts within the project:

> ### ⚠️ Separation of Milestone Prototype vs. Working-V1 Production Architecture
> 1. **Milestone Demonstration Prototype (Batch 4 — Delivered & Verified)**:
>    - **Technology Stack**: Plain HTML5, CSS3, and standard client-side JavaScript (ECMAScript 2020+ wrapped as a universal UMD module).
>    - **Execution Environment**: Runs entirely client-side inside any modern web browser or headless Node.js test harness without external runtime dependencies, database services, or network servers.
>    - **State Management**: Ephemeral in-memory JavaScript state store (`store`) with deterministic demo clock and reconciler for acceptance fixtures (A-01..A-04, A-06, S-01, M-01, R-01, O-01..O-03).
>    - **Purpose**: Validates user experience flow, client validation, mathematical compatibility formulas, and UI state invariants before backend construction.
>
> 2. **Proposed Working-V1 Production Architecture (Planned & Specified)**:
>    - **Technology Stack**: Modular Monolithic backend in Node.js / Express (TypeScript), PostgreSQL 16 relational database, Native WebSockets (`ws`), and React 18/19 Single Page Application.
>    - **Purpose**: Production target specified in `docs/architecture.md` and `docs/data-model.md` to support durable ACID transactions, server-authoritative time accounting, and concurrent multi-user synchronization.

The comparative evaluations below justify the technical selections for the **Proposed Working-V1 Production Architecture**, establishing why alternative technologies were evaluated and discarded based on system requirements.

---

## 2. Decision 1: Frontend Client Framework (Working-V1)

### 2.1 Candidate Alternatives
- **Alternative 1A: React 18/19 with TypeScript (Vite)**
- **Alternative 1B: Vue 3 with TypeScript (Composition API, Vite)**
- **Alternative 1C: Server-Side Rendered (SSR) Multi-Page Templates (Express + EJS / Pug)**

### 2.2 Comparative Evaluation Matrix

| Evaluation Criterion | React 18/19 + TypeScript (Vite) | Vue 3 + TypeScript (Composition API) | Server-Side Templates (EJS/Pug) |
| :--- | :--- | :--- | :--- |
| **Component Modularity & Complex State Handling** | Component-driven architecture cleanly separates channel membership bars, filtered feeds, scheduled session counters, and live chat message streams. | Single File Components (SFC) provide structured separation; reactive proxy system handles local state updates intuitively. | Monolithic page reloads or fragmented DOM patches; lacks declarative client-side state machine for real-time views. |
| **End-to-End TypeScript Integration** | First-class TSX support allows sharing exact DTO interfaces and validation schemas (`ListingDTO`, `SessionDTO`, `OutcomeDTO`) between backend and frontend. | Strong TypeScript support in script setup, though template expressions rely on Volar compiler extensions for full type coverage. | Minimal compile-time type validation inside server template strings; runtime rendering errors possible. |
| **Real-Time Synchronous Chat & DOM Updates** | Virtual DOM diffing efficiently handles high-frequency WebSocket message appending without full container re-renders. | Fine-grained reactivity triggers targeted DOM node updates on incoming chat payloads. | Requires bespoke vanilla JavaScript client scripts embedded in templates to manipulate chat DOM nodes. |
| **UI Ecosystem & Accessible Primitives** | Broad availability of unstyled, accessible UI primitives (e.g., Radix UI, Headless UI, Tailwind CSS) accelerating UI construction. | Strong component libraries (PrimeVue, Vuetify), though fewer unstyled headless primitive options available. | Restricted to traditional CSS frameworks (Bootstrap) without component abstraction. |
| **Official Documentation & Standards** | React Official Docs (2024, [react.dev/learn/typescript](https://react.dev/learn/typescript)); Vite Guide (2024, [vite.dev/guide](https://vite.dev/guide/)). | Vue 3 Official Documentation (2024, [vuejs.org/guide/typescript](https://vuejs.org/guide/typescript/overview.html)). | Express Template Engines (2024, [expressjs.com/en/guide/using-template-engines.html](https://expressjs.com/en/guide/using-template-engines.html)). |

### 2.3 Selection Rationale & Trade-Offs
- **Selected**: **React 18/19 with TypeScript (Alternative 1A)**.
- **Project-Specific Justification**: The platform's user journey requires continuous client-side state coordination: switching channel membership immediately updates discovery filters, active session timers tick continuously without blocking message entry, and collaborative outcome text editing requires optimistic locking feedback (409 conflict handling). React's component lifecycle and TypeScript prop validation directly align with these requirements.
- **Engineering Trade-Offs**: Requires a compilation build step (handled via Vite) and larger initial JavaScript bundle size compared to server-rendered HTML. This trade-off is justified because the application operates as an interactive collaborative workstation rather than a static content document.

---

## 3. Decision 2: Backend Framework & Execution Runtime (Working-V1)

### 3.1 Candidate Alternatives
- **Alternative 2A: Node.js (v20 LTS) with Express (TypeScript)**
- **Alternative 2B: Python 3.12 with Django 5 & Django REST Framework (DRF)**
- **Alternative 2C: Node.js with NestJS 10 (TypeScript)**

### 3.2 Comparative Evaluation Matrix

| Evaluation Criterion | Node.js + Express (TypeScript) | Python 3 + Django 5 / DRF | Node.js + NestJS 10 (TypeScript) |
| :--- | :--- | :--- | :--- |
| **Language Unification & Schema Sharing** | Full language unification: TypeScript across entire stack. Data transfer objects (DTOs) and invariant validators are shared between client and server. | Dual language stack: Python on server, TypeScript on client. API contracts and validation rules must be maintained in duplicate. | Full language unification: TypeScript across stack with shared interfaces. |
| **Architectural Weight & Overhead** | Un-opinionated, lightweight middleware pipeline. Zero unneeded scaffolding; allows direct organization into our domain-driven Modular Monolith. | "Batteries-included" framework. Built-in ORM, admin, and user model assume traditional session auth, requiring overrides for our custom ReBAC rules. | Heavyweight, opinionated architecture. Angular-style dependency injection, modules, and decorators introduce substantial boilerplate for a focused diploma scope. |
| **Async WebSocket Gateway Integration** | Native and lightweight: Single event loop handles both REST endpoints and WebSocket server (`ws`) on the identical HTTP server port without extra services. | Complex asynchronous setup: Requires ASGI configuration (Daphne/Uvicorn), Django Channels, and an external Redis message broker. | Built-in WebSocket gateways, but wraps native sockets in additional layers of abstraction and lifecycle hooks. |
| **Transactional Concurrency & Explicit Row Locking** | Direct SQL control: Queries and transactions (`BEGIN`, `SELECT FOR UPDATE`, `COMMIT`) are written explicitly via query builders (e.g., Kysely/Knex) without ORM interference. | Django ORM provides `select_for_update()`, but complex multi-table lock ordering (Invariant #3) frequently requires raw SQL overrides. | Typically coupled with TypeORM or Prisma, where granular lock acquisition ordering can be obscured by ORM abstraction layers. |
| **Official Documentation & Standards** | Express.js API Reference ([expressjs.com](https://expressjs.com/en/5x/api.html)); Node.js v20 LTS Docs ([nodejs.org/docs/latest-v20.x](https://nodejs.org/docs/latest-v20.x/api/)). | Django 5.0 Documentation ([docs.djangoproject.com](https://docs.djangoproject.com/en/5.0/)); DRF Guide ([django-rest-framework.org](https://www.django-rest-framework.org/)). | NestJS 10 Documentation ([docs.nestjs.com](https://docs.nestjs.com/)). |

### 3.3 Selection Rationale & Trade-Offs
- **Selected**: **Node.js with Express and TypeScript (Alternative 2A)**.
- **Project-Specific Justification**: Node.js and Express provide an un-opinionated foundation that enables strict execution of our **Shared Lock Protocol** (`docs/architecture.md` §4.1). Invariant #3 mandates that concurrent booking acceptances acquire locks in strict ascending UUID/ID order (`users` $\to$ `study_listings` $\to$ `listing_responses` $\to$ `study_sessions` $\to$ `session_outcomes`). Express allows transparent transactional boundaries without ORM magic hiding lock acquisition timing. Furthermore, co-hosting the WebSocket server on the same Node process avoids deploying a dedicated Redis cluster during initial deployment.
- **Engineering Trade-Offs**: Express provides no default structure for database migrations, authentication, or routing; domain modularity must be strictly enforced through project architecture.

---

## 4. Decision 3: Relational Persistence Engine (Working-V1)

### 4.1 Candidate Alternatives
- **Alternative 3A: PostgreSQL 16 (Relational Database)**
- **Alternative 3B: SQLite 3 (WAL Mode)**
- **Alternative 3C: MongoDB 7.0 (Document Store)**

### 4.2 Comparative Evaluation Matrix

| Evaluation Criterion | PostgreSQL 16 | SQLite 3 (WAL Mode) | MongoDB 7.0 |
| :--- | :--- | :--- | :--- |
| **ACID Guarantees & Row-Level Locking** | Strict transactional isolation with fine-grained row-level locks (`SELECT ... FOR UPDATE`). Prevents race conditions during simultaneous response acceptance (NFR-02). | ACID compliant, but utilizes database-level write locks. Under concurrent acceptance requests, write transactions serialize or fail with busy timeouts. | Document-level locking available. Multi-document ACID transactions exist but introduce distributed locking overhead and latency penalties. |
| **Relational Integrity & Composite Constraints** | Enforces multi-column uniqueness (`UNIQUE(session_id, user_id, utc_date)`), foreign key cascades, and check constraints (`counted_seconds > 0`) at engine level. | Supports foreign keys (`PRAGMA foreign_keys = ON`) and constraints, but lacks native DATE math functions and strict domain types. | Schema-free by default; relational integrity, foreign key references, and cascade deletions must be implemented manually in application code. |
| **Array Data Types & Tag Overlap Indexing** | First-class `TEXT[]` array columns supported by Generalized Inverted Indexes (GIN), enabling efficient set intersection operations (`&&`) for topic overlap matching ($T$). | Lacks native array type; requires either normalized many-to-many join tables or serialized JSON strings requiring table scans for tag intersections. | Native array indexing (Multikey Indexes) supports array contains queries, but lacks built-in Jaccard set operations at query engine level. |
| **Date Boundaries & Midnight Accounting Math** | Native `TIMESTAMPTZ` and `DATE` types with robust interval arithmetic support exact UTC day splitting (`[start, end) ∩ [day_start, next_day_start)`). | Date/time stored as ISO-8601 strings; date math relies on SQLite `strftime()` helper functions with potential formatting edge cases. | BSON Date stores 64-bit UTC integers; aggregation pipelines for date-boundary splitting are verbose and complex. |
| **Official Documentation & Standards** | PostgreSQL 16 Explicit Locking ([postgresql.org/docs/16/explicit-locking.html](https://www.postgresql.org/docs/16/explicit-locking.html)); GIN Indexes ([postgresql.org/docs/16/gin.html](https://www.postgresql.org/docs/16/gin.html)). | SQLite Write-Ahead Logging ([sqlite.org/wal.html](https://www.sqlite.org/wal.html)); Isolation in SQLite ([sqlite.org/isolation.html](https://www.sqlite.org/isolation.html)). | MongoDB 7.0 Transactions Manual ([mongodb.com/docs/v7.0/core/transactions](https://www.mongodb.com/docs/v7.0/core/transactions/)). |

### 4.3 Selection Rationale & Trade-Offs
- **Selected**: **PostgreSQL 16 (Alternative 3A)**.
- **Project-Specific Justification**: Mandatory for requirements NFR-02 (Data Integrity) and FR-09 (Single Partner Acceptance). When multiple learners attempt to accept responses on competing listings simultaneously, PostgreSQL's row-level locking guarantees that exactly one transaction succeeds while conflicting overlapping bookings are rejected. Additionally, Invariant #15 requires atomic insertion of ledger rows (`UNIQUE(session_id, user_id, utc_date)`), which PostgreSQL handles with native transactional integrity.
- **Engineering Trade-Offs**: Requires running an external PostgreSQL database daemon locally or via Docker during development, unlike zero-configuration SQLite. This operational requirement is justified by SQLite's single-writer concurrency bottleneck.

---

## 5. Decision 4: Real-Time Session Chat Transport (Working-V1)

### 5.1 Candidate Alternatives
- **Alternative 4A: Native WebSockets (`ws` library / RFC 6455)**
- **Alternative 4B: Periodic HTTP Polling (Short Polling every 2–5 seconds)**
- **Alternative 4C: Server-Sent Events (SSE) with HTTP POST for Upstream Messages**

### 5.2 Comparative Evaluation Matrix

| Evaluation Criterion | Native WebSockets (`ws` / RFC 6455) | Periodic HTTP Polling | Server-Sent Events (SSE) + HTTP POST |
| :--- | :--- | :--- | :--- |
| **Communication Symmetry & Latency** | Full-duplex bidirectional TCP channel. Messages travel with minimal 2–6 byte framing overhead, avoiding repeated HTTP header serialization. | Half-duplex pull model. Inherent latency delay bounded by polling interval (e.g., 2000–5000ms), introducing noticeable lag in conversational dialogue. | Asymmetric: Server-to-client downstream is real-time; client-to-server upstream requires full HTTP POST round-trips with TLS/header overhead. |
| **Presence Detection & Grace Period Handling** | Direct connection state lifecycle: TCP socket drops or heartbeat ping/pong timeouts immediately detect disconnections, triggering the 60s grace timer (FR-17). | Inexact presence: The server cannot distinguish between an idle connected user and a client that closed their browser tab until multiple poll cycles time out. | Downstream disconnect is detectable, but client must issue separate HTTP requests to report presence updates. |
| **Server Resource Consumption Under Active Study** | Single persistent TCP connection per active session participant; low CPU overhead during periods of quiet study. | High server load: Generates constant HTTP request parsing, routing, and database queries every few seconds even when participants are silently reading. | Moderate resource usage: Holds persistent downstream HTTP connection, but upstream messaging generates continuous HTTP request allocation. |
| **Network & Firewall Traversal** | Standard WebSocket upgrade over port 80/443; supported by all modern browsers and reverse proxies (Nginx, Caddy). | Standard HTTP GET requests; universally compatible across all restrictive firewalls. | Standard HTTP streaming; universally compatible, but some corporate proxies buffer chunked HTTP responses. |
| **Official Documentation & Standards** | IETF RFC 6455 The WebSocket Protocol ([datatracker.ietf.org/doc/html/rfc6455](https://datatracker.ietf.org/doc/html/rfc6455)); Node `ws` Documentation ([github.com/websockets/ws](https://github.com/websockets/ws)). | MDN XMLHttpRequest / Fetch Polling ([developer.mozilla.org/en-US/docs/Web/API/Fetch_API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)). | WHATWG HTML Server-Sent Events Standard ([html.spec.whatwg.org/multipage/server-sent-events.html](https://html.spec.whatwg.org/multipage/server-sent-events.html)). |

### 5.3 Selection Rationale & Trade-Offs
- **Selected**: **Native WebSockets via `ws` (Alternative 4A)**.
- **Project-Specific Justification**: Directly satisfies FR-10 (Synchronous Chat) and FR-17 (Presence & Reconnection Grace Period). The WebSocket connection lifecycle provides immediate visibility into participant presence: if Bob's client loses connection, the server registers the socket closure event instantly and starts the 60-second grace timer. If Bob reconnects before expiration, the session resumes seamlessly; if not, the session finalizes with reason `connection_interruption`. HTTP polling is incapable of providing this deterministic timing without overwhelming the server.
- **Engineering Trade-Offs**: Requires managing in-memory socket connection state on the server, ensuring that disconnect events trigger graceful resource cleanup. In our Modular Monolith, this is cleanly encapsulated within the Session Gateway module.
