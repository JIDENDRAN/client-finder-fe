import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Save, RefreshCw, LogOut, CheckCircle, AlertTriangle, Play } from 'lucide-react';
import { API_URL } from '../config';

export default function Settings({ settings, setSettings, fetchSettings }) {
  const [googleKey, setGoogleKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessDesc, setBusinessDesc] = useState('');
  const [promptTemplate, setPromptTemplate] = useState('');
  const [defaultMsgTemplate, setDefaultMsgTemplate] = useState('');
  const [cooldownMin, setCooldownMin] = useState(10);
  const [cooldownMax, setCooldownMax] = useState(20);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    if (settings) {
      setGoogleKey(settings.googleApiKey || '');
      setGeminiKey(settings.geminiApiKey || '');
      setBusinessName(settings.businessName || '');
      setBusinessDesc(settings.businessDesc || '');
      setPromptTemplate(settings.promptTemplate || '');
      setDefaultMsgTemplate(settings.defaultMsgTemplate || '');
      setCooldownMin(settings.cooldownMin || 10);
      setCooldownMax(settings.cooldownMax || 20);
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus('');
    try {
      const res = await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleApiKey: googleKey,
          geminiApiKey: geminiKey,
          businessName,
          businessDesc,
          promptTemplate,
          defaultMsgTemplate,
          cooldownMin: parseInt(cooldownMin, 10),
          cooldownMax: parseInt(cooldownMax, 10)
        })
      });
      if (!res.ok) throw new Error('Failed to save settings');
      const updated = await res.json();
      setSettings(updated);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };



  return (
    <div className="settings-page" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="glass-card" style={{ padding: '32px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: '#fff' }}>
          Configuration Settings
        </h2>

        <div className="form-group">
          <label className="form-label">Google Places API Key</label>
          <input
            type="password"
            className="form-input"
            value={googleKey}
            onChange={(e) => setGoogleKey(e.target.value)}
            placeholder={googleKey ? '••••••••••••••••••••••••••••' : 'Enter Google Maps API Key'}
          />
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Required for searching business lists. Leave blank to run in Demo Mock Mode.
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">Gemini API Key</label>
          <input
            type="password"
            className="form-input"
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            placeholder={geminiKey ? '••••••••••••••••••••••••••••' : 'Enter Google Gemini API Key'}
          />
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Required for AI auto-reply and categorization. Leave blank to run in Demo Mock Mode.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Business Name</label>
            <input
              type="text"
              className="form-input"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Campaign Cooldown (sec)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                className="form-input"
                style={{ textAlign: 'center' }}
                value={cooldownMin}
                onChange={(e) => setCooldownMin(e.target.value)}
                min="2"
                required
              />
              <span style={{ color: 'var(--text-muted)' }}>to</span>
              <input
                type="number"
                className="form-input"
                style={{ textAlign: 'center' }}
                value={cooldownMax}
                onChange={(e) => setCooldownMax(e.target.value)}
                min="2"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Business Description</label>
          <textarea
            className="form-input form-textarea"
            value={businessDesc}
            onChange={(e) => setBusinessDesc(e.target.value)}
            placeholder="Briefly describe what services or products your business sells..."
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">AI Sales Prompt Template</label>
          <textarea
            className="form-input form-textarea"
            style={{ minHeight: '130px', fontFamily: 'monospace', fontSize: '12px' }}
            value={promptTemplate}
            onChange={(e) => setPromptTemplate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Default Message Template</label>
          <textarea
            className="form-input form-textarea"
            value={defaultMsgTemplate}
            onChange={(e) => setDefaultMsgTemplate(e.target.value)}
            required
          />
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Dynamic placeholders supported: <code style={{ color: '#a78bfa' }}>{"{{name}}"}</code>, <code style={{ color: '#a78bfa' }}>{"{{address}}"}</code>, <code style={{ color: '#a78bfa' }}>{"{{website}}"}</code>.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px' }}>
          <div>
            {saveStatus === 'success' && (
              <span style={{ color: 'var(--success)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={16} /> Saved successfully!
              </span>
            )}
            {saveStatus === 'error' && (
              <span style={{ color: 'var(--danger)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={16} /> Error saving settings.
              </span>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>


    </div>
  );
}
