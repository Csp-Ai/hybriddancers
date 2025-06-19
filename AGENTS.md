# 🤖 AGENTS.md — Hybrid Dancers AI & Automation Directory

This document catalogs all autonomous agents, bots, and AI-powered workflows in the Hybrid Dancers repository. It ensures transparency, traceability, and operational clarity for admins, developers, and auditors.

---

## 1. Overview

**Agents** are automated AI or script-driven processes that analyze code, track KPIs, assist with operations, or suggest actions (including via Copilot/Codex). All agents integrate with the admin-only AI Ops Dashboard and log book for traceability.

---

## 2. Agent Directory

| Agent Name               | Purpose/Role                                           | Trigger                       | Inputs/Outputs             | Owner         |
|--------------------------|-------------------------------------------------------|-------------------------------|----------------------------|---------------|
| ai-code-analyzer         | Analyzes codebase for metrics, complexity, and issues | On dashboard load/schedule    | Repo files, logs           | Admin/DevOps  |
| kpi-dashboard-bot        | Aggregates business KPIs for BI charts                | On dashboard load/schedule    | DB/API, logs, events       | Admin/Owner   |
| military-log-writer      | Secure, append-only log of admin and agent actions    | On every admin/agent action   | Action details, timestamps | Admin/DevOps  |
| copilot-action-suggester | Generates actionable Copilot/Codex prompts            | On AI insight or log entry    | Insights, agent logs       | Admin/Owner   |
| event-notification-bot   | Sends alerts/emails for important events/issues       | On issue, booking, error      | Events, contact info       | Admin/Owner   |

---

## 3. Agent Details

### ai-code-analyzer
- **Location:** `ai-ops-dashboard.js`, `site_analyzer.py`
- **Description:** Scans all repo files for code stats, coverage, complexity, and potential issues.
- **Log Example:**  
  `2025-06-19 05:55Z | ai-code-analyzer | "Detected low test coverage in booking.js"`
- **Copilot Prompt Example:**  
  `"Generate tests for uncovered functions in booking.js"`

### kpi-dashboard-bot
- **Location:** `ai-ops-dashboard.js`
- **Description:** Pulls booking, user, revenue, and issue stats for BI visualizations.
- **Log Example:**  
  `2025-06-19 05:57Z | kpi-dashboard-bot | "Updated KPI charts: 23 new signups this week"`

### military-log-writer
- **Location:** `ai-ops-dashboard.js` (log book module)
- **Description:** Records all admin and agent actions in an append-only log, timestamped and auditable.
- **Log Example:**  
  `2025-06-19 06:00Z | military-log-writer | "Admin Csp-Ai changed event capacity for 'Summer Workshop'"`

### copilot-action-suggester
- **Location:** `ai-ops-dashboard.js`
- **Description:** Reads log book and dashboard insights, generates actionable Codex/Copilot prompt templates for admin follow-up.
- **Log Example:**  
  `2025-06-19 06:03Z | copilot-action-suggester | "Suggested prompt: Refactor instructor.html for accessibility"`

### event-notification-bot
- **Location:** `ai-ops-dashboard.js`
- **Description:** Sends browser notifications (and eventually email/SMS) for critical events or errors. Actions are logged via `logAction`.
- **Log Example:**  
  `2025-06-19 06:08Z | event-notification-bot | "Sent alert: Payment API error"`
- **Copilot Prompt Example:**  
  `"Notify support team about Payment API error"`

---

## 4. Security & Access

- **All agents require admin authentication** via Firebase Auth.
- **Actions, triggers, and outputs are logged** in the military log book for traceability and audit.
- **Only approved admins** may trigger agents or see sensitive data.

---

## 5. Change Management

- **To add a new agent:**  
  1. Implement agent logic in codebase (preferably in a dedicated module).  
  2. Update this AGENTS.md entry with name, purpose, trigger, and location.  
  3. Ensure all actions are logged via the military-log-writer.  
  4. Review security and access policy for new agent.

- **To update or remove an agent:**  
  1. Edit code and update this documentation.  
  2. Note any changes in the military log book.

---

## 6. Future Plans

- Expand agents for automated student support, advanced marketing analytics, and finance reconciliation.
- Integrate external AI or Copilot APIs for deeper analysis and recommendation.
- Enable agent-driven workflows (e.g., auto-resolving issues, onboarding new classes).
- Integrate `event-notification-bot` with email/SMS providers for real alerts.
- Periodically review agent performance and logs for continuous improvement.

---

## 7. References

- See [`ai-ops-dashboard.html`](ai-ops-dashboard.html) and [`ai-ops-dashboard.js`](ai-ops-dashboard.js) for implementation details.
- For Codex/Copilot prompt usage and follow-ups, reference the "Copilot Spaces" section of the AI Ops Dashboard.
