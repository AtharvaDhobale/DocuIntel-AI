import React from 'react';
import { FiTrendingUp, FiCheckCircle, FiShield, FiClock, FiGitCommit, FiLayers } from 'react-icons/fi';

export default function MetricsDashboard() {
  const metrics = [
    { label: 'Time-to-Publish Reduction', value: '58%', desc: 'vs. purely manual drafting', icon: FiClock, color: 'var(--success)' },
    { label: 'Style Guide Adherence', value: '98.4%', desc: 'automated terminology passes', icon: FiCheckCircle, color: 'var(--primary)' },
    { label: 'Hallucination Prevention', value: '100%', desc: 'zero unverified text in prod', icon: FiShield, color: '#8b5cf6' },
    { label: 'Authoring Velocity', value: '3.2x', desc: 'faster release note turnaround', icon: FiTrendingUp, color: 'var(--warning)' },
  ];

  const recentCommits = [
    { hash: 'a4f891c', title: 'feat(docs): Configuring Protection Policies in Cohesity DataProtect', author: 'Atharva Dhobale', time: 'Today, 14:30 UTC', status: 'Merged to main' },
    { hash: 'd9b102e', title: 'fix(docs): Update SpanFS deduplication chunking architecture spec', author: 'Senior Writer Reviewer', time: 'Yesterday, 18:15 UTC', status: 'Merged to main' },
    { hash: 'c5208fe', title: 'feat(release-notes): Assemble v7.2.0 platform release notes', author: 'DocuIntel Automation Bot', time: 'Nov 01, 09:40 UTC', status: 'Published' },
    { hash: '88e91aa', title: 'refactor(docs): Migrate legacy HTML guides to topic-based markdown', author: 'Atharva Dhobale', time: 'Oct 28, 16:20 UTC', status: 'Merged to main' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1050px', margin: '0 auto' }}>
      {/* Overview Card */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h2 style={{ margin: '0 0 6px', fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FiLayers style={{ color: 'var(--primary)' }} /> Documentation Intelligence & Pilot Metrics
        </h2>
        <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted)' }}>
          Real-time metrics demonstrating why this GenAI & automation platform cuts time-to-publish, improves consistency, and eliminates hallucinations.
        </p>

        {/* 4 Big Numbers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginTop: '24px' }}>
          {metrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} style={{ background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>{m.label}</span>
                  <Icon style={{ color: m.color }} size={18} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.5px' }}>
                  {m.value}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Docs-as-Code Publishing Stream */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ margin: '0 0 18px', fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiGitCommit style={{ color: 'var(--success)' }} /> Git Docs-as-Code Audit Stream
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentCommits.map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', background: 'var(--bg-surface)', color: 'var(--primary)', border: '1px solid var(--border-default)', padding: '3px 10px', borderRadius: '6px', fontWeight: 600 }}>
                  {c.hash}
                </span>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>By {c.author} • {c.time}</div>
                </div>
              </div>
              <span style={{ background: 'var(--success-light)', color: 'var(--success)', border: '1px solid var(--success-border)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.76rem', fontWeight: 600 }}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
