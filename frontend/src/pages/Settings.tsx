import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Settings as SettingsIcon, Save } from 'lucide-react';

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

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="flex align-center gap-2 mb-6">
        <SettingsIcon size={28} style={{ color: 'var(--color-primary)' }} />
        <h1>Company Settings</h1>
      </div>

      <div className="card">
        {message && (
          <div style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '4px', backgroundColor: message.includes('success') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.includes('success') ? 'var(--color-success)' : 'var(--color-danger)' }}>
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
            <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>

      <div className="card mt-6" style={{ border: '1px solid var(--color-danger)', padding: '1.5rem' }}>
        <h3 style={{ color: 'var(--color-danger)', marginTop: 0, marginBottom: '0.5rem' }}>Danger Zone: Reset All Data</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
          This will permanently delete all Customers, Products, Challans, Invoices, Payments, and Company Settings so you can start completely fresh.
        </p>
        <button 
          className="btn btn-secondary" 
          style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
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
