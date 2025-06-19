# Agents

This repo defines a set of lightweight AI/automation agents. Each agent logs its actions to `data/logs.json` for traceability.

## Registered Agents

| Name | File | Description |
|------|------|-------------|
| attendance-agent | agents/attendance-agent.js | Scans stored bookings and logs dates with unusually low attendance. |
| insights-agent | agents/insights-agent.js | Summarizes recent bookings and logs top day and class trends. |

## Operating Standards

- Agents must log to `data/logs.json` using the structure `{time, action, details}`.
- New agents should be documented in this file with a short description.
- Keep agent scripts simple and dependency-free so they can run in restricted environments.

