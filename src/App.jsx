import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Search, Send, MessageSquare, Settings as SettingsIcon, ShieldAlert } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import Settings from './components/Settings';
import Database from './components/Database';
import { Database as DatabaseIcon } from 'lucide-react';
import { API_URL } from './config';

export default function App() {
  const [page, setPage] = useState(() => localStorage.getItem('clientflow_page') || 'dashboard');
  const [leads, setLeads] = useState([]);
  const [settings, setSettings] = useState(null);
  const [selectedLeadId, setSelectedLeadId] = useState(null);

  // Persist page to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('clientflow_page', page);
  }, [page]);

  // Fetch initial data
  useEffect(() => {
    fetchSettings();
    fetchLeads();
  }, []);



  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings`);
      if (!res.ok) throw new Error('Settings unreachable');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API_URL}/api/leads`);
      if (!res.ok) throw new Error('Leads unreachable');
      const data = await res.json();
      setLeads(data);
    } catch (err) {
      console.error(err);
    }
  };



  const handleImportLeads = (newLeads) => {
    setLeads(prev => {
      const existingIds = new Set(prev.map(l => l.id));
      const added = newLeads.filter(l => !existingIds.has(l.id));
      return [...prev, ...added];
    });
  };



  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return (
          <Dashboard 
            leads={leads} 
            setPage={setPage} 
            setSelectedLeadId={setSelectedLeadId} 
          />
        );
      case 'scanner':
        return (
          <Scanner 
            leads={leads} 
            onImportLeads={handleImportLeads} 
          />
        );

      case 'database':
        return <Database />;
      case 'settings':
        return (
          <Settings 
            settings={settings} 
            setSettings={setSettings} 
            fetchSettings={fetchSettings} 
          />
        );
      default:
        return null;
    }
  };

  const getPageTitle = () => {
    switch (page) {
      case 'dashboard': return 'Dashboard Hub';
      case 'scanner': return 'Google Places Lead Scanner';
      case 'database': return 'Scraped Leads Database';
      case 'settings': return 'App Configurations';
      default: return 'ClientFlow AI';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Panel */}
      <aside className="sidebar">
        <div>
          <div className="logo-container">
            <span style={{ fontSize: '24px' }}>⚡</span>
            <span className="logo-text">ClientFlow AI</span>
          </div>
          
          <nav className="nav-links">
            <button 
              className={`nav-link ${page === 'dashboard' ? 'active' : ''}`}
              onClick={() => setPage('dashboard')}
            >
              <LayoutDashboard className="nav-link-icon" />
              Dashboard
            </button>
            <button 
              className={`nav-link ${page === 'scanner' ? 'active' : ''}`}
              onClick={() => setPage('scanner')}
            >
              <Search className="nav-link-icon" />
              Lead Scanner
            </button>

            <button 
              className={`nav-link ${page === 'database' ? 'active' : ''}`}
              onClick={() => setPage('database')}
            >
              <DatabaseIcon className="nav-link-icon" />
              Database
            </button>
            <button 
              className={`nav-link ${page === 'settings' ? 'active' : ''}`}
              onClick={() => setPage('settings')}
            >
              <SettingsIcon className="nav-link-icon" />
              Settings
            </button>
          </nav>
        </div>


      </aside>

      {/* Main Screen Panel */}
      <main className="main-content">
        <header className="page-header">
          <h1 className="page-title">{getPageTitle()}</h1>
        </header>
        {renderPage()}
      </main>
    </div>
  );
}
