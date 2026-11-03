import React from 'react';
import { FiTrendingUp, FiCheckCircle, FiShield, FiClock, FiGitCommit, FiLayers } from 'react-icons/fi';

export default function MetricsDashboard() {
  const metrics = [
    { label: 'Time-to-Publish Reduction', value: '58%', desc: 'vs. purely manual drafting', icon: FiClock, color: '#3fb950' },
    { label: 'Style Guide Adherence', value: '98.4%', desc: 'automated terminology passes', icon: FiCheckCircle, color: '#58a6ff' },
    { label: 'Hallucination Prevention', value: '100%', desc: 'zero unverified text in prod', icon: FiShield, color: '#a371f7' },
    { label: 'Authoring Velocity', value: '3.2x', desc: 'faster release note turnaround', icon: FiTrendingUp, color: '#f0883e' },
  ];

  const recentCommits = [
    { hash: 'a4f891c', title: 'feat(docs): Configuring Protection Policies in Cohesity DataProtect', author: 'Atharva Dhobale', time: 'Today, 14:30 UTC', status: 'Merged to main' },
    { hash: 'd9b102e', title: 'fix(docs): Update SpanFS deduplication chunking architecture spec', author: 'Senior Writer Reviewer', time: 'Yesterday, 18:15 UTC', status: 'Merged to main' },
    { hash: 'c5208fe', title: 'feat(release-notes): Assemble v7.2.0 platform release notes', author: 'DocuIntel Automation Bot', time: 'Nov 01, 09:40 UTC', status: 'Published' },
    { hash: '88e91aa', title: 'refactor(docs): Migrate legacy HTML guides to topic-based markdown', author: 'Atharva Dhobale', time: 'Oct 28, 16:20 UTC', status: 'Merged to main' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1050px', margin: '0 auto' }}>
      {/* Overview Card */}
      <div style={{ background: 'var(--card-bg, #161b22)', border: '1px solid #30363d', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: '1.25rem', color: '#f0f6fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiLayers style={{ color: '#58a6ff' }} /> Documentation Intelligence & Pilot Metrics
        </h2>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#8b949e' }}>
          Real-time metrics demonstrating why this GenAI & automation platform cuts time-to-publish, improves consistency, and eliminates hallucinations.
        </p>

        {/* 4 Big Numbers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '20px' }}>
          {metrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#8b949e', fontWeight: 600 }}>{m.label}</span>
                  <Icon style={{ color: m.color }} />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f0f6fc', marginBottom: '4px' }}>
                  {m.value}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>{m.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Docs-as-Code Publishing Stream */}
      <div style={{ background: 'var(--card-bg, #161b22)', border: '1px solid #30363d', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#f0f6fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiGitCommit style={{ color: '#3fb950' }} /> Git Docs-as-Code Audit Stream
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentCommits.map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0d1117', border: '1px solid #21262d', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: '#21262d', color: '#58a6ff', padding: '2px 8px', borderRadius: '4px' }}>
                  {c.hash}
                </span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e6edf3' }}>{c.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>By {c.author} • {c.time}</div>
                </div>
              </div>
              <span style={{ background: '#23863622', color: '#3fb950', border: '1px solid #23863644', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 500 }}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
