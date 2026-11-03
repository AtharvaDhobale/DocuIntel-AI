# Enterprise Documentation Style Guide & Terminology Specification

This document defines the writing craft, terminology rules, and structural guidelines enforced across all documentation topics.

## 1. Voice and Tone
- **Audience**: Cloud architects, storage administrators, DevOps, and Site Reliability Engineers.
- **Tone**: Professional, clear, objective, and task-focused.
- **Voice**: **Active voice** and **imperative mood** for all procedures:
  - ✅ *Correct*: "Configure the cluster protection policy..."
  - ❌ *Incorrect*: "The cluster protection policy can be configured by the user..."
- **Reader Dignity**: Never use condescending adverbs like *obviously*, *simply*, or *easily*.

## 2. Topic-Based Structuring (Diátaxis Framework)
Every document must fit one of four distinct archetypes:
1. **Task**: Step-by-step procedures to achieve a specific operational outcome.
2. **Concept**: Explanations of architecture, algorithms, and design principles.
3. **Reference**: Parameter tables, CLI syntaxes, API endpoints, error codes.
4. **Troubleshooting**: Symptom, cause, diagnosis, and remediation workflows.

## 3. Approved Terminology Whitelist

| Unapproved Term | Approved Term | Rationale |
| :--- | :--- | :--- |
| `whitelist` | `allowlist` | Inclusive language standard |
| `blacklist` | `denylist` | Inclusive language standard |
| `master / slave` | `primary / secondary` | Architecture node clarity |
| `click here` | Descriptive link text | Accessibility & SEO standards |
| `cohesity cluster` | `Cohesity Cluster` | Proper brand capitalization |
| `dataprotect` | `DataProtect` | CamelCase product branding |
| `smartfiles` | `SmartFiles` | CamelCase product branding |

## 4. Frontmatter Specification
Every markdown file in the `docs/` tree must begin with valid YAML frontmatter:
```yaml
---
id: string
title: string
sidebar_label: string
description: string
tags: [tag1, tag2]
last_reviewed: YYYY-MM-DD
---
```
