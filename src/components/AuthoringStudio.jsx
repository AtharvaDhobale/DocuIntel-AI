import React, { useState } from 'react';
import { FiEdit3, FiZap, FiCopy, FiCheck, FiArrowRight, FiFileText, FiList } from 'react-icons/fi';

const SAMPLE_COMMITS = `feat(dataprotect): add support for Kubernetes 1.30 stateful volume protection
feat(smartfiles): introduce multi-region S3 bucket replication policy
fix(helios): resolve memory leak during bulk snapshot audit log export
perf(cluster): reduce snapshot tree traversal latency by 35%
fix(security): sanitize session cookies against cross-site script injection
deprecate(api): mark v1 access token endpoints as deprecated in favor of v2/mcm/token`;

export default function AuthoringStudio({ onSendToLinter, onSendToGate }) {
  const [topicType, setTopicType] = useState('task');
  const [featureName, setFeatureName] = useState('Instant Mass Restore for Ransomware Recovery');
  const [featureDescription, setFeatureDescription] = useState('Rapidly restore infected or corrupted virtual machine workloads directly from immutable snapshots without waiting for background data transfers.');
  const [productFamily, setProductFamily] = useState('Cohesity DataProtect');
  const [targetAudience, setTargetAudience] = useState('Storage Administrators & Incident Response Teams');
  const [rawCommits, setRawCommits] = useState(SAMPLE_COMMITS);
  const [version, setVersion] = useState('v7.2.0');
  
  const [generatedMarkdown, setGeneratedMarkdown] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateDraft = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/author/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_type: topicType,
          feature_name: featureName,
          feature_description: featureDescription,
          target_audience: targetAudience,
          product_family: productFamily
        })
      });
      const data = await res.json();
      setGeneratedMarkdown(data.markdown);
    } catch {
      // Fallback local generator if backend not active
      generateLocalDraft();
    } finally {
      setLoading(false);
    }
  };

  const handleAssembleReleaseNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/author/release-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version, raw_git_commits: rawCommits })
      });
      const data = await res.json();
      setGeneratedMarkdown(data.markdown);
    } catch {
      generateLocalReleaseNotes();
    } finally {
      setLoading(false);
    }
  };

  const generateLocalDraft = () => {
    const slug = featureName.toLowerCase().replace(/[^\w]/g, '-');
    const md = `---
id: ${slug}
title: How to Configure ${featureName}
sidebar_label: ${featureName}
description: Step-by-step procedure for configuring ${featureName} in ${productFamily}.
tags: [${productFamily.toLowerCase().replace(/\s+/g, '-')}, task, procedure]
---

# Configuring ${featureName}

${featureName} enables ${targetAudience.toLowerCase()} to ${featureDescription}.

## Prerequisites
- Administrative privileges on the ${productFamily} cluster.
- Verification that all cluster nodes are in Healthy status.
- Network connectivity between the backup proxy and destination hypervisor.

## Procedure
1. Log in to the management console.
2. In the navigation sidebar, choose **Data Protection** > **${featureName}**.
3. Click **Configure ${featureName}**.
4. In the dialog, select the target workload snapshot.
5. Specify the recovery location (Original Host or Alternate Sandbox).
6. Click **Launch Restore**.

## Verification
Confirm that the restored workload is powered on and reporting valid telemetry in the **Activity Alerts** monitor.
`;
    setGeneratedMarkdown(md);
  };

  const generateLocalReleaseNotes = () => {
    const md = `# Release Notes — ${version}

*Release Date: November 03, 2026*

## New Features
- **Kubernetes 1.30 Support**: Full stateful volume backup protection.
- **Multi-Region S3 Replication**: Cross-region object tiering in SmartFiles.

## Enhancements
- Reduced snapshot tree traversal latency by 35%.

## Resolved Issues
- Fixed memory leak during bulk snapshot audit log export.
- Sanitized session cookies against potential injection attacks.

## Deprecation Notices
- ⚠️ Deprecated legacy v1 authentication endpoints in favor of \`/v2/mcm/token\`.
`;
    setGeneratedMarkdown(md);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', height: '100%' }}>
      {/* Left Column: Authoring Workbench */}
      <div style={{ background: 'var(--card-bg, #161b22)', border: '1px solid var(--border-color, #30363d)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color, #30363d)', paddingBottom: '14px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#f0f6fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiEdit3 style={{ color: '#58a6ff' }} /> GenAI Docs Authoring Studio
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#8b949e' }}>
              Structured topic-based authoring & release notes assembly pilot.
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', background: '#1f6feb22', color: '#58a6ff', padding: '4px 10px', borderRadius: '20px', border: '1px solid #1f6feb44' }}>
            Docs-as-Code Engine
          </span>
        </div>

        {/* Mode Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#8b949e', marginBottom: '8px', fontWeight: 600 }}>
            TOPIC ARCHETYPE (DITA / DIÁTAXIS FRAMEWORK)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {[
              { id: 'task', label: 'Task (How-To)', icon: FiFileText },
              { id: 'concept', label: 'Concept (Arch)', icon: FiZap },
              { id: 'reference', label: 'Reference', icon: FiList },
              { id: 'release-notes', label: 'Release Notes', icon: FiEdit3 },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTopicType(t.id)}
                style={{
                  background: topicType === t.id ? '#1f6feb' : '#21262d',
                  color: topicType === t.id ? '#ffffff' : '#c9d1d9',
                  border: '1px solid ' + (topicType === t.id ? '#388bfd' : '#30363d'),
                  borderRadius: '6px',
                  padding: '8px 10px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {topicType !== 'release-notes' ? (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#8b949e', marginBottom: '6px', fontWeight: 600 }}>PRODUCT SUITE</label>
              <select
                value={productFamily}
                onChange={e => setProductFamily(e.target.value)}
                style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', color: '#c9d1d9', padding: '8px 12px', borderRadius: '6px' }}
              >
                <option value="Cohesity DataProtect">Cohesity DataProtect</option>
                <option value="Cohesity SmartFiles">Cohesity SmartFiles</option>
                <option value="Cohesity Helios Control Plane">Cohesity Helios Control Plane</option>
                <option value="Cohesity CyberScan & Clean Room">Cohesity CyberScan & Clean Room</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#8b949e', marginBottom: '6px', fontWeight: 600 }}>FEATURE / TOPIC TITLE</label>
              <input
                type="text"
                value={featureName}
                onChange={e => setFeatureName(e.target.value)}
                placeholder="e.g. S3 Object Lock in SmartFiles"
                style={{ width: '100%', boxSizing: 'border-box', background: '#0d1117', border: '1px solid #30363d', color: '#c9d1d9', padding: '8px 12px', borderRadius: '6px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#8b949e', marginBottom: '6px', fontWeight: 600 }}>FEATURE DESCRIPTION & SCOPE</label>
              <textarea
                rows={3}
                value={featureDescription}
                onChange={e => setFeatureDescription(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', background: '#0d1117', border: '1px solid #30363d', color: '#c9d1d9', padding: '8px 12px', borderRadius: '6px', resize: 'vertical' }}
              />
            </div>

            <button
              onClick={handleGenerateDraft}
              disabled={loading}
              style={{
                background: '#238636',
                color: '#fff',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: 'auto'
              }}
            >
              <FiZap /> {loading ? 'Drafting with GenAI...' : 'Draft Topic Procedure'}
            </button>
          </>
        ) : (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#8b949e', marginBottom: '6px', fontWeight: 600 }}>TARGET RELEASE VERSION</label>
              <input
                type="text"
                value={version}
                onChange={e => setVersion(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', background: '#0d1117', border: '1px solid #30363d', color: '#c9d1d9', padding: '8px 12px', borderRadius: '6px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#8b949e', marginBottom: '6px', fontWeight: 600 }}>RAW GIT COMMITS / PR SUMMARIES</label>
              <textarea
                rows={7}
                value={rawCommits}
                onChange={e => setRawCommits(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', background: '#0d1117', border: '1px solid #30363d', color: '#c9d1d9', padding: '8px 12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.8rem' }}
              />
            </div>

            <button
              onClick={handleAssembleReleaseNotes}
              disabled={loading}
              style={{
                background: '#238636',
                color: '#fff',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: 'auto'
              }}
            >
              <FiZap /> {loading ? 'Assembling Release Notes...' : 'Assemble Customer Release Notes'}
            </button>
          </>
        )}
      </div>

      {/* Right Column: Markdown Output & Actions */}
      <div style={{ background: 'var(--card-bg, #161b22)', border: '1px solid var(--border-color, #30363d)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #30363d', paddingBottom: '12px', marginBottom: '14px' }}>
          <span style={{ fontWeight: 600, color: '#f0f6fc', fontSize: '0.9rem' }}>Structured Markdown Preview</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={copyToClipboard}
              disabled={!generatedMarkdown}
              style={{ background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {copied ? <FiCheck style={{ color: '#3fb950' }} /> : <FiCopy />} {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <textarea
          value={generatedMarkdown}
          onChange={e => setGeneratedMarkdown(e.target.value)}
          placeholder="AI-generated technical documentation will render here. You can also edit this markdown directly..."
          style={{
            flex: 1,
            width: '100%',
            boxSizing: 'border-box',
            background: '#0d1117',
            border: '1px solid #30363d',
            borderRadius: '8px',
            color: '#e6edf3',
            padding: '14px',
            fontFamily: 'Consolas, monospace',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            resize: 'none'
          }}
        />

        {/* Handover Actions */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #30363d' }}>
          <button
            onClick={() => onSendToLinter && onSendToLinter(generatedMarkdown)}
            disabled={!generatedMarkdown}
            style={{
              flex: 1,
              background: '#30363d',
              color: '#f0f6fc',
              border: '1px solid #8b949e44',
              padding: '10px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontWeight: 500
            }}
          >
            Send to Style & Terminology Linter <FiArrowRight />
          </button>
          <button
            onClick={() => onSendToGate && onSendToGate(generatedMarkdown, featureName)}
            disabled={!generatedMarkdown}
            style={{
              flex: 1,
              background: '#1f6feb',
              color: '#ffffff',
              border: 'none',
              padding: '10px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontWeight: 600
            }}
          >
            Forward to Human Accuracy Gate <FiArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
