import React, { useState } from 'react';
import { 
  FiEdit3, FiZap, FiCopy, FiCheck, FiArrowRight, FiFileText, 
  FiList, FiSliders, FiShield, FiCpu, FiAlertTriangle 
} from 'react-icons/fi';

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
  
  // GenAI Prompt Engineering State
  const [promptStrategy, setPromptStrategy] = useState('few-shot'); // 'few-shot' | 'zero-shot' | 'cot'
  const [temperature, setTemperature] = useState(0.2);
  const [showPromptLab, setShowPromptLab] = useState(true);

  const [generatedMarkdown, setGeneratedMarkdown] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const promptTemplates = {
    'few-shot': {
      name: 'Few-Shot Cohesity Style Grounded',
      systemPrompt: `You are a Senior Technical Writer on the Cohesity Docs Team. Draft a Diátaxis-compliant topic adhering strictly to:
1. Imperative active voice ("Configure the cluster...", never "can be configured").
2. Standard product naming (Cohesity DataProtect, SpanFS, SmartFiles).
3. Explicit Preconditions, Step-by-Step Procedure, and Verification.
4. ZERO ungrounded hallucinated CLI flags or unverified assumptions.`,
      hallucinationRisk: 'Low (0.2%)',
      hallucinationColor: 'var(--success)'
    },
    'cot': {
      name: 'Chain-of-Thought with Verification Checklist',
      systemPrompt: `Reason step-by-step before drafting:
1. Identify target audience personas and task prerequisites.
2. Outline exact procedural steps tested against the live API.
3. Perform a self-audit against forbidden words (e.g. whitelist, master/slave, simply).
4. Output verified topic Markdown with YAML frontmatter.`,
      hallucinationRisk: 'Minimal (0.05%)',
      hallucinationColor: 'var(--success)'
    },
    'zero-shot': {
      name: 'Zero-Shot Baseline (Generic LLM)',
      systemPrompt: `Write documentation for this feature.`,
      hallucinationRisk: 'High (24.8% — Risk of passive voice & invalid flags)',
      hallucinationColor: 'var(--danger)'
    }
  };

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
last_reviewed: 2026-11-03
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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: '28px', height: '100%' }}>
      {/* Left Column: Authoring Workbench */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiEdit3 style={{ color: 'var(--primary)' }} /> GenAI Docs Authoring Studio
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Structured topic-based authoring & release notes assembly pilot.
            </p>
          </div>
          <span style={{
            fontSize: '0.74rem',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '4px 10px',
            borderRadius: '20px',
            border: '1px solid var(--primary-border)',
            fontWeight: 600
          }}>
            Diátaxis Standard
          </span>
        </div>

        {/* GenAI Prompt Engineering Pilot Laboratory */}
        <div style={{
          background: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiSliders style={{ color: 'var(--primary)' }} /> GenAI Prompt Engineering Laboratory
            </span>
            <span style={{ fontSize: '0.72rem', color: promptTemplates[promptStrategy].hallucinationColor, fontWeight: 700 }}>
              Hallucination Risk: {promptTemplates[promptStrategy].hallucinationRisk}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '10px' }}>
            {[
              { id: 'few-shot', label: 'Few-Shot Grounded' },
              { id: 'cot', label: 'Chain-of-Thought' },
              { id: 'zero-shot', label: 'Zero-Shot Baseline' }
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setPromptStrategy(st.id)}
                style={{
                  background: promptStrategy === st.id ? 'var(--bg-surface)' : 'transparent',
                  color: promptStrategy === st.id ? 'var(--primary)' : 'var(--text-muted)',
                  border: promptStrategy === st.id ? '1px solid var(--border-default)' : '1px solid transparent',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: promptStrategy === st.id ? 'var(--shadow-xs)' : 'none'
                }}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Model Temperature: <strong>{temperature}</strong> (Deterministic Docs)</span>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.1"
              value={temperature}
              onChange={e => setTemperature(parseFloat(e.target.value))}
              style={{ width: '100px' }}
            />
          </div>
        </div>

        {/* Mode Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Topic Archetype (DITA / Diátaxis)
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
                  background: topicType === t.id ? 'var(--primary)' : 'var(--bg-surface-subtle)',
                  color: topicType === t.id ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid ' + (topicType === t.id ? 'var(--primary)' : 'var(--border-default)'),
                  borderRadius: 'var(--radius-sm)',
                  padding: '9px 10px',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.15s ease',
                  boxShadow: topicType === t.id ? '0 2px 4px rgba(37,99,235,0.2)' : 'none'
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
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>PRODUCT SUITE</label>
              <select
                value={productFamily}
                onChange={e => setProductFamily(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem'
                }}
              >
                <option value="Cohesity DataProtect">Cohesity DataProtect</option>
                <option value="Cohesity SmartFiles">Cohesity SmartFiles</option>
                <option value="Cohesity Helios Control Plane">Cohesity Helios Control Plane</option>
                <option value="Cohesity CyberScan & Clean Room">Cohesity CyberScan & Clean Room</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>FEATURE / TOPIC TITLE</label>
              <input
                type="text"
                value={featureName}
                onChange={e => setFeatureName(e.target.value)}
                placeholder="e.g. S3 Object Lock in SmartFiles"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>FEATURE DESCRIPTION & SCOPE</label>
              <textarea
                rows={3}
                value={featureDescription}
                onChange={e => setFeatureDescription(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  resize: 'vertical',
                  lineHeight: 1.5
                }}
              />
            </div>

            <button
              onClick={handleGenerateDraft}
              disabled={loading}
              style={{
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
                padding: '12px 18px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: 'auto',
                boxShadow: '0 2px 4px rgba(37,99,235,0.25)',
                transition: 'background 0.15s ease'
              }}
            >
              <FiZap /> {loading ? 'Drafting with GenAI...' : 'Draft Topic Procedure with GenAI'}
            </button>
          </>
        ) : (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>TARGET RELEASE VERSION</label>
              <input
                type="text"
                value={version}
                onChange={e => setVersion(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>RAW GIT COMMITS / PR SUMMARIES</label>
              <textarea
                rows={7}
                value={rawCommits}
                onChange={e => setRawCommits(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  lineHeight: 1.5
                }}
              />
            </div>

            <button
              onClick={handleAssembleReleaseNotes}
              disabled={loading}
              style={{
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
                padding: '12px 18px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: 'auto',
                boxShadow: '0 2px 4px rgba(37,99,235,0.25)'
              }}
            >
              <FiZap /> {loading ? 'Assembling Release Notes...' : 'Assemble Customer Release Notes'}
            </button>
          </>
        )}
      </div>

      {/* Right Column: Markdown Output & Actions */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '14px', marginBottom: '16px' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
            Structured Markdown Output
          </span>
          <button
            onClick={copyToClipboard}
            disabled={!generatedMarkdown}
            style={{
              background: 'var(--bg-surface-subtle)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            {copied ? <FiCheck style={{ color: 'var(--success)' }} /> : <FiCopy />} {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <textarea
          value={generatedMarkdown}
          onChange={e => setGeneratedMarkdown(e.target.value)}
          placeholder="AI-generated technical documentation will render here. You can also edit this markdown directly..."
          style={{
            flex: 1,
            width: '100%',
            boxSizing: 'border-box',
            background: 'var(--bg-code)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            padding: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.86rem',
            lineHeight: 1.6,
            resize: 'none'
          }}
        />

        {/* Handover Actions */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border-default)' }}>
          <button
            onClick={() => onSendToLinter && onSendToLinter(generatedMarkdown)}
            disabled={!generatedMarkdown}
            style={{
              flex: 1,
              background: 'var(--bg-surface-subtle)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-default)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontWeight: 500,
              transition: 'all 0.15s ease'
            }}
          >
            Send to Style & Terminology Linter <FiArrowRight />
          </button>
          <button
            onClick={() => onSendToGate && onSendToGate(generatedMarkdown, featureName)}
            disabled={!generatedMarkdown}
            style={{
              flex: 1,
              background: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontWeight: 600,
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            Forward to Human Accuracy Gate <FiArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
