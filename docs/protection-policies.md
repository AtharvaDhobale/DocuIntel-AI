---
id: protection-policies
title: Configuring Protection Policies in Cohesity DataProtect
sidebar_label: Protection Policies
description: Step-by-step procedure for configuring backup schedules and retention in Cohesity DataProtect.
tags: [DataProtect, backup, policy, rpo]
last_reviewed: 2026-11-03
---

# Configuring Protection Policies in Cohesity DataProtect

A Protection Policy defines backup frequencies, retention windows, replication schedules, and SLA compliance rules for registered workloads across VMware, physical servers, and Kubernetes clusters.

## Prerequisites
- Confirm administrative privileges on the Cohesity Cluster.
- Verify that at least one Storage Domain is active and reports healthy capacity.
- Ensure that target virtual machines appear under **Protection Sources**.

## Procedure
1. Log in to the management dashboard.
2. From the navigation sidebar, choose **Data Protection** > **Protection Policies**.
3. Click **Add Policy**.
4. In the **Policy Name** field, enter a unique identifier (for example, `Gold-Tier-Daily-VM`).
5. Under **Backup Schedule**, specify:
   - **Frequency**: Every 4 Hours or Daily at 02:00 UTC.
   - **Local Retention**: 30 Days.
6. Under **Replication / Archival**, select the remote target or cloud archive storage domain.
7. Click **Save Policy**.

## Verification
Confirm that the newly created policy displays in the **Protection Policies** table with an **Active** status indicator.
