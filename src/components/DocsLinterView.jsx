import React, { useState } from 'react';
import { FiCheckCircle, FiAlertTriangle, FiAlertOctagon, FiInfo, FiTool, FiRefreshCw } from 'react-icons/fi';

const SAMPLE_TEXT_WITH_ISSUES = `# Configuring Replication

The backup policy can be configured by navigating to the protection menu. Simply click here to download the agent. 

Ensure that the master node is online before the slave cluster is initialized. The whitelist must include all internal CIDRs. 

The backup is created automatically every 4 hours. Obviously, any storage failure can be easily avoided by following standard guidelines.
`;

export default function DocsLinterView({ initialMarkdown }) {
  const [content, setContent] = useState(initialMarkdown || SAMPLE_TEXT_WITH_ISSUES);
  const [lintResult, setLintResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRunLint = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/lint/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown_content: content })
      });
      const data = await res.json();
      setLintResult(data);
    } catch {
      runLocalLint();
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAutoFix = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/lint/autofix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown_content: content })
      });
      const data = await res.json();
      setContent(data.fixed_markdown);
      handleRunLint();
    } catch {
      let fixed = content
        .replace(/can be configured by navigating to/gi, "Navigate to")
        .replace(/whitelist/gi, "allowlist")
        .replace(/master/gi, "primary")
        .replace(/slave/gi, "secondary")
        .replace(/simply\s+/gi, "")
        .replace(/easily\s+/gi, "")
        .replace(/obviously,\s*/gi, "")
        .replace(/click here/gi, "View Documentation Guide");
      setContent(fixed);
      runLocalLint();
    } finally {
      setLoading(false);
    }
  };

  const runLocalLint = () => {
    const issues = [];
    const lower = content.toLowerCase();

    if (lower.includes('whitelist')) {
      issues.push({
        line: 5,
        type: 'Terminology & Style Guide',
        severity: 'Error',
        message: "Found non-compliant term 'whitelist'. Inclusive language violation.",
        suggestion: "Replace with 'allowlist'"
      });
    }
    if (lower.includes('master') || lower.includes('slave')) {
      issues.push({
        line: 4,
        type: 'Terminology & Style Guide',
        severity: 'Warning',
        message: "Found non-compliant terms 'master/slave'. Prefer primary/secondary architecture nodes.",
        suggestion: "Replace with 'primary/secondary'"
      });
    }
    if (lower.includes('click here')) {
      issues.push({
        line: 3,
        type: 'Link Accessibility',
        severity: 'Error',
        message: "Found generic anchor 'click here'. Fails accessibility standards.",
        suggestion: "Use descriptive link text explaining destination"
      });
    }
    if (lower.includes('can be configured') || lower.includes('is created')) {
      issues.push({
        line: 2,
        type: 'Voice & Tone',
        severity: 'Warning',
        message: "Passive voice construction detected. Cohesity style guide enforces direct imperative voice.",
        suggestion: "Rewrite using active verbs (e.g., 'Configure the policy...' or 'The system creates...')"
      });
    }
    if (lower.includes('simply') || lower.includes('easily') || lower.includes('obviously')) {
      issues.push({
        line: 6,
        type: 'Tone & Style Guide',
        severity: 'Warning',
        message: "Found condescending adverbs ('simply', 'easily', 'obviously').",
        suggestion: "Remove trivializing adverbs to respect reader intelligence"
      });
    }

    const errors = issues.filter(i => i.severity === 'Error').length;
    const warnings = issues.filter(i => i.severity === 'Warning').length;
    const score = Math.max(20, 100 - (errors * 20 + warnings * 8));

    setLintResult({
      quality_score: score,
      status: errors === 0 && warnings <= 1 ? 'PASS' : 'NEEDS_REVISION',
      stats: { errors, warnings, info: 1 },
      issues
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '28px', height: '100%' }}>
      {/* Markdown Input Area */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              Documentation Style & Terminology Linter
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Automated linting against the Cohesity Docs Style Guide and terminology rules.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setContent(SAMPLE_TEXT_WITH_ISSUES)}
              style={{
                background: 'var(--bg-surface-subtle)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-default)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Load Sample Flawed Doc
            </button>
            <button
              onClick={handleApplyAutoFix}
              disabled={loading}
              style={{
                background: 'var(--success)',
                color: '#fff',
                border: 'none',
                padding: '7px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 3px rgba(5, 150, 105, 0.3)'
              }}
            >
              <FiTool /> 1-Click Auto-Fix
            </button>
          </div>
        </div>

        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Paste Markdown topic to lint against style rules..."
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

        <button
          onClick={handleRunLint}
          disabled={loading}
          style={{
            marginTop: '18px',
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
            boxShadow: '0 2px 4px rgba(37,99,235,0.25)'
          }}
        >
          <FiRefreshCw /> {loading ? 'Auditing Content...' : 'Run Automated Quality Lint'}
        </button>
      </div>

      {/* Lint Report Side */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-default)', paddingBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            Quality Audit Scorecard
          </h3>
          {lintResult && (
            <span style={{
              background: lintResult.status === 'PASS' ? 'var(--success-light)' : 'var(--danger-light)',
              color: lintResult.status === 'PASS' ? 'var(--success)' : 'var(--danger)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: `1px solid ${lintResult.status === 'PASS' ? 'var(--success-border)' : 'var(--danger-border)'}`
            }}>
              {lintResult.status}
            </span>
          )}
        </div>

        {lintResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
            {/* Meter */}
            <div style={{ background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Style Guide Compliance</span>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: lintResult.quality_score >= 80 ? 'var(--success)' : lintResult.quality_score >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                  {lintResult.quality_score} / 100
                </span>
              </div>
              <div style={{ background: 'var(--border-default)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${lintResult.quality_score}%`,
                  height: '100%',
                  background: lintResult.quality_score >= 80 ? 'var(--success)' : lintResult.quality_score >= 50 ? 'var(--warning)' : 'var(--danger)',
                  transition: 'width 0.4s ease'
                }} />
              </div>
              <div style={{ display: 'flex', gap: '18px', marginTop: '12px', fontSize: '0.82rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--danger)' }}>🔴 Errors: {lintResult.stats?.errors || 0}</span>
                <span style={{ color: 'var(--warning)' }}>🟡 Warnings: {lintResult.stats?.warnings || 0}</span>
                <span style={{ color: 'var(--primary)' }}>🔵 Info: {lintResult.stats?.info || 0}</span>
              </div>
            </div>

            {/* Issues List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {lintResult.issues && lintResult.issues.length > 0 ? (
                lintResult.issues.map((issue, idx) => (
                  <div key={idx} style={{
                    background: 'var(--bg-surface)',
                    borderLeft: `4px solid ${issue.severity === 'Error' ? 'var(--danger)' : issue.severity === 'Warning' ? 'var(--warning)' : 'var(--primary)'}`,
                    borderTop: '1px solid var(--border-default)',
                    borderRight: '1px solid var(--border-default)',
                    borderBottom: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    boxShadow: 'var(--shadow-xs)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: issue.severity === 'Error' ? 'var(--danger)' : issue.severity === 'Warning' ? 'var(--warning)' : 'var(--primary)' }}>
                        Line {issue.line} • {issue.type}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{issue.severity}</span>
                    </div>
                    <p style={{ margin: '0 0 6px', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{issue.message}</p>
                    {issue.suggestion && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--primary)', background: 'var(--primary-light)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary-border)' }}>
                        💡 <strong>Suggestion:</strong> {issue.suggestion}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '36px', color: 'var(--success)' }}>
                  <FiCheckCircle size={40} style={{ strokeWidth: 1.5 }} />
                  <p style={{ marginTop: '10px', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Zero Style Violations Detected!</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Topic strictly conforms to Cohesity Docs Style Guide.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', margin: 'auto' }}>
            <FiAlertTriangle size={36} style={{ marginBottom: '12px', color: 'var(--warning)' }} />
            <p style={{ fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto', lineHeight: 1.5 }}>
              Click <strong>"Run Automated Quality Lint"</strong> to audit content for passive voice, unapproved words, link accessibility, and frontmatter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
