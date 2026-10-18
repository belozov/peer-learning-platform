# Technology Alternatives & Comparative Trade-Off Analysis

## 1. Overview and Evaluation Methodology

To ensure architectural decisions are defensible and directly justified by system requirements, this document conducts a rigorous comparative evaluation of **four critical technical decisions**:
1. **Frontend Client Architecture**
2. **Backend Framework & Server Platform**
3. **Database & Data Storage Engine**
4. **Real-Time Synchronous Chat Transport**

Each decision compares 2–3 viable engineering alternatives against a standardized set of criteria derived from system requirements: **Type Safety & Maintainability**, **Transactional & Concurrency Guarantees (NFR-02)**, **Real-Time State Synchronization (FR-10)**, **Performance Under Load (NFR-05)**, and **Implementation Feasibility within Diploma Deadlines**.

---

## 2. Decision 1: Frontend Client Architecture

### 2.1 Candidate Alternatives
- **Alternative 1A: React 18/19 with TypeScript (Vite)**
- **Alternative 1B: Vue 3 with TypeScript (Composition API, Vite)**
- **Alternative 1C: Server-Side Rendered (SSR) Templates (Express + EJS / Pug)**

### 2.2 Comparative Evaluation Matrix

| Evaluation Criterion | React 18/19 + TypeScript (Vite) | Vue 3 + TypeScript (Composition API) | Server-Side Templates (EJS/Pug) |
| :--- | :--- | :--- | :--- |
| **Component Modularity & State Handling** | **Excellent**: Component-driven model fits complex discovery filtering, dynamic badges, and interactive chat. | **Good**: Single File Components (SFC) provide clean separation; reactive state system is intuitive. | **Poor**: Monolithic page reloads or fragmented DOM patches; lacks declarative client state machine. |
| **TypeScript Integration** | **Native / First-Class**: TSX offers compile-time type validation across JSX props, states, and API DTOs. | **Very Good**: Vue 3 is written in TS, but template syntax requires Volar language server tooling. | **Poor**: Weak type-checking inside template strings; runtime syntax errors common. |
| **Real-Time Chat & DOM Updates** | **Optimal**: Virtual DOM and state hooks (`useReducer`, `useEffect`) manage rapid WebSocket message appending cleanly. | **Optimal**: Fine-grained reactivity triggers targeted DOM updates on new messages. | **Unsuitable**: Requires manual vanilla JavaScript DOM scripting alongside server templates. |
| **Ecosystem & UI Component Libraries** | **Vast**: Unmatched library ecosystem (Lucide icons, Radix UI, Tailwind CSS, TanStack Query). | **Moderate**: Mature ecosystem (PrimeVue, Vuetify), though smaller than React. | **Limited**: Restricted to static CSS frameworks (Bootstrap) without component abstraction. |
| **Official Documentation & Citations** | React Official Docs (2024, [react.dev](https://react.dev/learn/typescript)); Vite Guide ([vite.dev](https://vite.dev)). | Vue 3 Official Documentation (2024, [vuejs.org/guide](https://vuejs.org/guide/typescript/overview.html)). | Express Template Engines (2024, [expressjs.com/guide/using-template-engines.html](https://expressjs.com/en/guide/using-template-engines.html)). |

### 2.3 Selection Rationale & Trade-Offs
- **Selected**: **React 18/19 with TypeScript (Alternative 1A)**.
- **Rationale**: The core user experience depends heavily on dynamic state transitions: instant compatibility recalculation, persona switching, interactive timer countdowns, and real-time chat message appending. React's TSX provides seamless type-sharing with our TypeScript backend, eliminating serialization mismatch bugs.
- **Trade-Offs**: Introduces bundle compilation overhead (mitigated by Vite's sub-second esbuild/Rollup pipeline) compared to plain HTML templates.

---

## 3. Decision 2: Backend Framework & Server Platform

### 3.1 Candidate Alternatives
- **Alternative 2A: Node.js (v20+) with Express (TypeScript)**
- **Alternative 2B: Python 3.12 with Django 5 & Django REST Framework (DRF)**
- **Alternative 2C: Node.js with NestJS 10 (TypeScript)**

### 3.2 Comparative Evaluation Matrix

| Evaluation Criterion | Node.js + Express (TypeScript) | Python 3 + Django 5 / DRF | Node.js + NestJS 10 (TypeScript) |
| :--- | :--- | :--- | :--- |
| **Language Unification** | **Full Unification**: TypeScript across frontend and backend; shared interfaces and DTOs. | **Dual Language**: Python on server, TypeScript on client; DTO types must be maintained in duplicate. | **Full Unification**: TypeScript across stack with shared interfaces. |
| **Architectural Weight & Boilerplate** | **Minimal / Lightweight**: Minimalist middleware pipeline; rapid iterative setup; zero unneeded abstractions. | **Heavy / Monolithic**: "Batteries-included" ORM, admin, and auth add substantial unneeded structure for custom ReBAC. | **High Boilerplate**: Angular-inspired decorators, modules, and DI containers introduce significant scaffolding overhead. |
| **Async WebSocket Integration** | **Native & Seamless**: Single event-loop handles both HTTP endpoints and WebSocket server (`ws`) on same HTTP port. | **Complex**: Requires ASGI configuration (Daphne/Uvicorn), Django Channels, and Redis channel layer. | **Modular**: Built-in WebSocket gateways, but adds layer of abstraction over native `ws`. |
| **Transactional Control & Custom Logic** | **Direct & Explicit**: Native SQL / lightweight query builder gives full control over `SELECT FOR UPDATE`. | **ORM Abstraction**: Django ORM handles basic transactions, but custom locking rules require raw SQL overrides. | **Layered**: Relies on TypeORM/Prisma with high decorator coupling. |
| **Official Documentation & Citations** | Express.js 5 / 4 API Reference ([expressjs.com](https://expressjs.com/en/5x/api.html)); Node.js v20 LTS Docs ([nodejs.org/docs](https://nodejs.org/docs/latest-v20.x/api/)). | Django 5.0 Documentation ([docs.djangoproject.com](https://docs.djangoproject.com/en/5.0/)); DRF Guide ([django-rest-framework.org](https://www.django-rest-framework.org/)). | NestJS 10 Documentation ([docs.nestjs.com](https://docs.nestjs.com/)). |

### 3.3 Selection Rationale & Trade-Offs
- **Selected**: **Node.js with Express and TypeScript (Alternative 2A)**.
- **Rationale**: Express provides a transparent, un-opinionated middleware foundation. It enables end-to-end TypeScript sharing, co-hosting of the WebSocket gateway on the existing HTTP server instance without Redis dependencies, and explicit control over database transactions.
- **Trade-Offs**: Requires deliberate architectural discipline to organize domain modules (addressed by our modular monolith structure in `docs/architecture.md`).

---

## 4. Decision 3: Relational Persistence & State Storage

### 4.1 Candidate Alternatives
- **Alternative 3A: PostgreSQL 16**
- **Alternative 3B: SQLite 3 (WAL Mode)**
- **Alternative 3C: MongoDB 7.0 (Document Store)**

### 4.2 Comparative Evaluation Matrix

| Evaluation Criterion | PostgreSQL 16 | SQLite 3 (WAL Mode) | MongoDB 7.0 |
| :--- | :--- | :--- | :--- |
| **Relational Integrity & Foreign Keys** | **Strict & Comprehensive**: Native ACID compliance, CASCADE rules, and domain check constraints. | **Good**: Supports foreign keys when enabled (`PRAGMA foreign_keys = ON`). | **Non-Relational**: Manual application-level integrity; schema drift risks in relational domains. |
| **Concurrent Acceptance & Row Locking** | **Enterprise-Grade**: True row-level locking (`SELECT ... FOR UPDATE`) prevents partner race conditions (NFR-02). | **Limited**: Single-writer database lock causes thread contention under concurrent writes. | **Document-Level**: Document locking available, but multi-document ACID transactions add latency overhead. |
| **Structured Array Indexing (GIN)** | **First-Class**: Native `TEXT[]` with Generalized Inverted Index (GIN) enables sub-millisecond Jaccard queries. | **Unsupported**: Requires normalized join tables or string serialization with table scans. | **Native Array Indexing**: Multikey indexes support array matching, but lacks Jaccard SQL primitives. |
| **Audit Ledgers & Date Splitting** | **Optimal**: Strict DATE types, interval math, and composite uniqueness (`user_id, utc_date`). | **Adequate**: Date strings handled via SQLite datetime functions; lacks native DATE types. | **Flexible**: Document nesting can obscure historical ledger immutability. |
| **Official Documentation & Citations** | PostgreSQL 16 Documentation ([postgresql.org/docs/16/](https://www.postgresql.org/docs/16/explicit-locking.html#LOCKING-ROWS)). | SQLite3 Documentation ([sqlite.org/wal.html](https://www.sqlite.org/wal.html)). | MongoDB 7.0 Manual ([mongodb.com/docs/v7.0/](https://www.mongodb.com/docs/v7.0/core/transactions/)). |

### 4.3 Selection Rationale & Trade-Offs
- **Selected**: **PostgreSQL 16 (Alternative 3A)**.
- **Rationale**: Crucial for requirements NFR-02 (Data Integrity) and FR-09 (Single Partner Acceptance). Row-level locking guarantees that when multiple learners attempt to respond or be accepted simultaneously, exactly one transaction commits. PostgreSQL's GIN indexes optimize tag-overlap matching ($T$).
- **Trade-Offs**: Requires running a PostgreSQL service locally during development (mitigated by standard Docker or local installation scripts).

---

## 5. Decision 4: Real-Time Session Chat Transport

### 5.1 Candidate Alternatives
- **Alternative 4A: Native WebSockets (`ws` library / RFC 6455)**
- **Alternative 4B: Periodic HTTP Polling (Short Polling every 2–5 seconds)**
- **Alternative 4C: Server-Sent Events (SSE) with HTTP POST for Upstream**

### 5.2 Comparative Evaluation Matrix

| Evaluation Criterion | Native WebSockets (`ws`) | Periodic HTTP Polling | Server-Sent Events (SSE) + POST |
| :--- | :--- | :--- | :--- |
| **Bidirectional Latency** | **Sub-10ms**: Persistent full-duplex TCP socket; zero header renegotiation per message. | **High (2–5s)**: Inherent polling delay; poor responsiveness for live conversation. | **Asymmetric**: Downstream is real-time; upstream requires full HTTP request/response handshake. |
| **Presence Detection & Grace Period** | **Instantaneous**: TCP disconnect or socket `close` event immediately triggers the 60s grace timer (FR-17). | **Lagged & Inexact**: Inability to distinguish between an active idle user and a dropped connection. | **One-Way**: Server detects disconnect, but client cannot signal presence without separate POSTs. |
| **Server Bandwidth & Overhead** | **Very Low**: Small 2–6 byte framing overhead; eliminates repetitive HTTP header serialization. | **Wasteful**: Constant HTTP requests and header parsing even when no messages are sent. | **Moderate**: Single downstream connection, but upstream POSTs generate repetitive HTTP overhead. |
| **Official Documentation & Citations** | RFC 6455 - The WebSocket Protocol ([datatracker.ietf.org/doc/html/rfc6455](https://datatracker.ietf.org/doc/html/rfc6455)); Node `ws` ([github.com/websockets/ws](https://github.com/websockets/ws)). | MDN HTTP Polling Overview ([developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)). | WHATWG HTML Server-Sent Events ([html.spec.whatwg.org](https://html.spec.whatwg.org/multipage/server-sent-events.html)). |

### 5.3 Selection Rationale & Trade-Offs
- **Selected**: **Native WebSockets via `ws` (Alternative 4A)**.
- **Rationale**: Satisfies FR-10 (Synchronous Chat) and FR-17 (Presence & 60s Reconnection Grace Period). The socket lifecycle provides immediate notifications when a partner drops offline, triggering the grace countdown without guesswork.
- **Trade-Offs**: Requires connection state management on the server, which is encapsulated cleanly inside our Modular Monolith's Session Gateway.
