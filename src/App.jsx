import React, { useState, useEffect } from 'react';
import { 
  FiEdit3, FiCheckCircle, FiSearch, FiShield, FiTrendingUp, 
  FiSun, FiMoon, FiGithub, FiBookOpen, FiExternalLink, FiZap
} from 'react-icons/fi';

import AuthoringStudio from './components/AuthoringStudio';
import DocsLinterView from './components/DocsLinterView';
import SemanticSearchRAG from './components/SemanticSearchRAG';
import AccuracyGate from './components/AccuracyGate';
import MetricsDashboard from './components/MetricsDashboard';

export default function App() {
  const [currentTab, setCurrentTab] = useState('authoring');
  const [theme, setTheme] = useState('light'); // Default to crisp light theme
  
  // Pipeline handover state
  const [sharedMarkdown, setSharedMarkdown] = useState('');
  const [sharedTitle, setSharedTitle] = useState('');

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSendToLinter = (md) => {
    setSharedMarkdown(md);
    setCurrentTab('linter');
  };

  const handleSendToGate = (md, title) => {
    setSharedMarkdown(md);
    setSharedTitle(title);
    setCurrentTab('accuracy-gate');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-app)',
      color: 'var(--text-secondary)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Navigation Bar */}
      <header style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        padding: '0 32px',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-xs)'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.05rem',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
          }}>
            DI
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              DocuIntel-AI
              <span style={{
                fontSize: '0.72rem',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                border: '1px solid var(--primary-border)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <FiZap size={11} /> Enterprise Docs Pilot
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400 }}>
              GenAI Authoring, Automated Style Linting & Semantic Docs Search
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav style={{ display: 'flex', gap: '6px', background: 'var(--bg-surface-subtle)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-default)' }}>
          {[
            { id: 'authoring', label: 'Authoring Studio', icon: FiEdit3 },
            { id: 'linter', label: 'Style & Terminology Linter', icon: FiCheckCircle },
            { id: 'semantic-search', label: 'Semantic Search & Chat', icon: FiSearch },
            { id: 'accuracy-gate', label: 'Human Accuracy Gate', icon: FiShield },
            { id: 'metrics', label: 'Pilot Metrics', icon: FiTrendingUp },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                style={{
                  background: isActive ? 'var(--bg-surface)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  border: 'none',
                  padding: '7px 14px',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '7px',
                  boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }} size={15} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={toggleTheme}
            title="Toggle theme"
            style={{
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-muted)',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>
          <a
            href="https://github.com/AtharvaDhobale/DocuIntel-AI"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'var(--bg-surface-subtle)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-default)',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 500,
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <FiGithub size={15} /> DocuIntel-AI
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
        {currentTab === 'authoring' && (
          <AuthoringStudio 
            onSendToLinter={handleSendToLinter} 
            onSendToGate={handleSendToGate} 
          />
        )}
        {currentTab === 'linter' && (
          <DocsLinterView 
            initialMarkdown={sharedMarkdown} 
          />
        )}
        {currentTab === 'semantic-search' && (
          <SemanticSearchRAG />
        )}
        {currentTab === 'accuracy-gate' && (
          <AccuracyGate 
            initialContent={sharedMarkdown} 
            initialTitle={sharedTitle} 
          />
        )}
        {currentTab === 'metrics' && (
          <MetricsDashboard />
        )}
      </main>

      {/* Footer Info */}
      <footer style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-default)',
        padding: '14px 32px',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>
          DocuIntel-AI — Engineered by <strong>Atharva Dhobale</strong> for Cohesity Technical Writing & GenAI Docs Pilot.
        </span>
        <div style={{ display: 'flex', gap: '20px', fontWeight: 500 }}>
          <span>Docs-as-Code Pipeline</span>
          <span>DITA / Diátaxis Standard</span>
          <span>FastAPI + React 19</span>
        </div>
      </footer>
    </div>
  );
}
