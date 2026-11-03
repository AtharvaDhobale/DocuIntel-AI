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
      // Fallback local linter
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
      // Local fallback auto-fix
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
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px', height: '100%' }}>
      {/* Markdown Input Area */}
      <div style={{ background: 'var(--card-bg, #161b22)', border: '1px solid #30363d', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#f0f6fc' }}>Documentation Style & Terminology Linter</h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#8b949e' }}>
              Automated linting against the Cohesity Docs Style Guide and terminology whitelist.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setContent(SAMPLE_TEXT_WITH_ISSUES)}
              style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
            >
              Load Sample Flawed Doc
            </button>
            <button
              onClick={handleApplyAutoFix}
              disabled={loading}
              style={{ background: '#238636', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
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

        <button
          onClick={handleRunLint}
          disabled={loading}
          style={{
            marginTop: '16px',
            background: '#1f6feb',
            color: '#fff',
            border: 'none',
            padding: '12px',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <FiRefreshCw /> {loading ? 'Auditing Content...' : 'Run Automated Quality Lint'}
        </button>
      </div>

      {/* Lint Report Side */}
      <div style={{ background: 'var(--card-bg, #161b22)', border: '1px solid #30363d', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#f0f6fc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Quality Audit Scorecard</span>
          {lintResult && (
            <span style={{
              background: lintResult.status === 'PASS' ? '#23863622' : '#da363322',
              color: lintResult.status === 'PASS' ? '#3fb950' : '#f85149',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: `1px solid ${lintResult.status === 'PASS' ? '#23863655' : '#da363355'}`
            }}>
              {lintResult.status}
            </span>
          )}
        </h3>

        {lintResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
            {/* Meter */}
            <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: '#8b949e' }}>Style Guide Compliance</span>
                <span style={{ fontWeight: 700, color: lintResult.quality_score >= 80 ? '#3fb950' : lintResult.quality_score >= 50 ? '#d29922' : '#f85149' }}>
                  {lintResult.quality_score} / 100
                </span>
              </div>
              <div style={{ background: '#21262d', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${lintResult.quality_score}%`,
                  height: '100%',
                  background: lintResult.quality_score >= 80 ? '#238636' : lintResult.quality_score >= 50 ? '#d29922' : '#da3633',
                  transition: 'width 0.4s ease'
                }} />
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.8rem', color: '#8b949e' }}>
                <span>🔴 Errors: <strong style={{ color: '#f85149' }}>{lintResult.stats?.errors || 0}</strong></span>
                <span>🟡 Warnings: <strong style={{ color: '#d29922' }}>{lintResult.stats?.warnings || 0}</strong></span>
                <span>🔵 Info: <strong style={{ color: '#58a6ff' }}>{lintResult.stats?.info || 0}</strong></span>
              </div>
            </div>

            {/* Issues List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {lintResult.issues && lintResult.issues.length > 0 ? (
                lintResult.issues.map((issue, idx) => (
                  <div key={idx} style={{
                    background: '#0d1117',
                    borderLeft: `4px solid ${issue.severity === 'Error' ? '#f85149' : issue.severity === 'Warning' ? '#d29922' : '#58a6ff'}`,
                    borderTop: '1px solid #21262d',
                    borderRight: '1px solid #21262d',
                    borderBottom: '1px solid #21262d',
                    borderRadius: '6px',
                    padding: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: issue.severity === 'Error' ? '#f85149' : issue.severity === 'Warning' ? '#d29922' : '#58a6ff' }}>
                        Line {issue.line} • {issue.type}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#8b949e', textTransform: 'uppercase' }}>{issue.severity}</span>
                    </div>
                    <p style={{ margin: '0 0 6px', fontSize: '0.85rem', color: '#c9d1d9' }}>{issue.message}</p>
                    {issue.suggestion && (
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#58a6ff', background: '#1f6feb11', padding: '4px 8px', borderRadius: '4px' }}>
                        💡 <strong>Suggestion:</strong> {issue.suggestion}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#3fb950' }}>
                  <FiCheckCircle size={36} />
                  <p style={{ marginTop: '8px', fontWeight: 600 }}>Zero Style Violations Detected!</p>
                  <p style={{ fontSize: '0.8rem', color: '#8b949e' }}>Topic strictly conforms to Cohesity Docs Style Guide.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8b949e', margin: 'auto' }}>
            <FiAlertTriangle size={32} style={{ marginBottom: '10px' }} />
            <p>Click <strong>"Run Automated Quality Lint"</strong> to audit content for passive voice, unapproved words, link accessibility, and frontmatter completeness.</p>
          </div>
        )}
      </div>
    </div>
  );
}
