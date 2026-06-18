import React from 'react';
import { Users } from 'lucide-react';

export default function Dashboard({ leads, setPage }) {
  const totalLeads = leads.length;

  return (
    <div className="dashboard-page" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Metric Cards Grid */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(1, 1fr)' }}>
        <div className="glass-card stat-card" style={{ maxWidth: '400px' }}>
          <div className="stat-info">
            <span className="stat-label">Total Scraped Leads</span>
            <span className="stat-value">{totalLeads}</span>
          </div>
          <div className="stat-icon-wrapper primary">
            <Users size={24} />
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '28px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
          Welcome to ClientFinder
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          You can use the <strong>Lead Scanner</strong> to scrape Google Maps for business leads, and view all saved leads in the <strong>Database</strong>.
        </p>
      </div>
    </div>
  );
}
