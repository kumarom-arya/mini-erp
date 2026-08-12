import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Settings as SettingsIcon, Save, Loader2, AlertTriangle } from 'lucide-react';

const Settings = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    phone: '',
    email: '',
    gstNumber: '',
    logoUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await api.get('/settings');
        if (res.data && Object.keys(res.data).length > 0) {
          setFormData({
            companyName: res.data.companyName || '',
            address: res.data.address || '',
            phone: res.data.phone || '',
            email: res.data.email || '',
            gstNumber: res.data.gstNumber || '',
            logoUrl: res.data.logoUrl || ''
          });
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/settings', formData);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="skeleton skeleton-text" style={{ width: '250px', height: '2rem', marginBottom: '2rem' }} />
      <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-xl)' }} />
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="flex align-center gap-3 mb-6">
        <div style={{
          padding: '0.6rem',
          background: 'var(--primary-light)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <SettingsIcon size={22} />
        </div>
        <h1>Company Settings</h1>
      </div>

      <div className="card" style={{ padding: '1.75rem' }}>
        {message && (
          <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-4">
            <label className="form-label">Company Name *</label>
            <input type="text" className="form-input" name="companyName" required value={formData.companyName} onChange={handleChange} />
          </div>

          <div className="form-group mb-4">
            <label className="form-label">Address *</label>
            <textarea className="form-input" name="address" required rows={3} value={formData.address} onChange={handleChange} />
          </div>

          <div className="flex gap-4 mb-4">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Phone</label>
              <input type="text" className="form-input" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Email</label>
              <input type="email" className="form-input" name="email" value={formData.email} onChange={handleChange} />
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">GST Number</label>
              <input type="text" className="form-input" name="gstNumber" value={formData.gstNumber} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Logo URL</label>
              <input type="text" className="form-input" name="logoUrl" value={formData.logoUrl} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={16} style={{ animation: 'spinSlow 1s linear infinite' }} />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} /> Save Settings
              </>
            )}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="danger-zone">
        <div className="flex align-center gap-2" style={{ marginBottom: '0.5rem' }}>
          <AlertTriangle size={18} />
          <h3 style={{ margin: 0 }}>Danger Zone: Reset All Data</h3>
        </div>
        <p>
          This will permanently delete all Customers, Products, Challans, Invoices, Payments, and Company Settings so you can start completely fresh.
        </p>
        <button
          className="btn btn-danger"
          style={{ fontSize: '0.8rem' }}
          onClick={async () => {
            if (window.confirm('ARE YOU SURE? This will PERMANENTLY DELETE all company data, customers, invoices, and products!')) {
              try {
                const res = await api.post('/settings/reset');
                alert(res.data.message || 'All company data deleted!');
                window.location.reload();
              } catch (err: any) {
                alert(err.response?.data?.error || 'Failed to reset data');
              }
            }
          }}
        >
          Reset System & Start Fresh
        </button>
      </div>
    </div>
  );
};

export default Settings;
