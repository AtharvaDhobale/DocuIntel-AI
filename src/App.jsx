import React, { useState } from 'react';
import { 
  FiEdit3, FiCheckCircle, FiSearch, FiShield, FiTrendingUp, 
  FiSun, FiMoon, FiGithub, FiBookOpen, FiTerminal, FiLayers
} from 'react-icons/fi';

import AuthoringStudio from './components/AuthoringStudio';
import DocsLinterView from './components/DocsLinterView';
import SemanticSearchRAG from './components/SemanticSearchRAG';
import AccuracyGate from './components/AccuracyGate';
import MetricsDashboard from './components/MetricsDashboard';

export default function App() {
  const [currentTab, setCurrentTab] = useState('authoring');
  const [theme, setTheme] = useState('dark');
  
  // Pipeline handover state
  const [sharedMarkdown, setSharedMarkdown] = useState('');
  const [sharedTitle, setSharedTitle] = useState('');

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
      background: theme === 'dark' ? '#0d1117' : '#f6f8fa',
      color: theme === 'dark' ? '#c9d1d9' : '#24292f',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Navigation Bar */}
      <header style={{
        background: theme === 'dark' ? '#161b22' : '#ffffff',
        borderBottom: theme === 'dark' ? '1px solid #30363d' : '1px solid #d0d7de',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1f6feb 0%, #238636 100%)',
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1rem'
          }}>
            DI
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: theme === 'dark' ? '#f0f6fc' : '#1f2328', display: 'flex', alignItems: 'center', gap: '8px' }}>
              DocuIntel-AI
              <span style={{ fontSize: '0.7rem', background: '#23863622', color: '#3fb950', border: '1px solid #23863655', padding: '1px 6px', borderRadius: '10px' }}>
                Enterprise Docs Pilot
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>
              GenAI Authoring, Style Linting & Semantic Search for Docs-as-Code
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav style={{ display: 'flex', gap: '4px' }}>
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
                  background: isActive ? (theme === 'dark' ? '#21262d' : '#ebf0f4') : 'transparent',
                  color: isActive ? (theme === 'dark' ? '#f0f6fc' : '#0969da') : '#8b949e',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #fd8c73' : '2px solid transparent',
                  padding: '8px 14px',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '6px 6px 0 0',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon style={{ color: isActive ? '#58a6ff' : '#8b949e' }} />
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
              background: 'transparent',
              border: theme === 'dark' ? '1px solid #30363d' : '1px solid #d0d7de',
              color: '#8b949e',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {theme === 'dark' ? <FiSun /> : <FiMoon />}
          </button>
          <a
            href="https://github.com/AtharvaDhobale"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: theme === 'dark' ? '#21262d' : '#f3f4f6',
              color: theme === 'dark' ? '#c9d1d9' : '#24292f',
              border: theme === 'dark' ? '1px solid #30363d' : '1px solid #d0d7de',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 500
            }}
          >
            <FiGithub /> AtharvaDhobale
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
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
        background: theme === 'dark' ? '#161b22' : '#ffffff',
        borderTop: theme === 'dark' ? '1px solid #30363d' : '1px solid #d0d7de',
        padding: '12px 24px',
        fontSize: '0.75rem',
        color: '#8b949e',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>
          DocuIntel-AI — Engineered by <strong>Atharva Dhobale</strong> for Cohesity Technical Writing & GenAI Docs Pilot.
        </span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Docs-as-Code Pipeline</span>
          <span>DITA / Diátaxis Standard</span>
          <span>FastAPI + React 19</span>
        </div>
      </footer>
    </div>
  );
}
