import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Search, Plus, Edit2, X } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const defaultFormData = { 
    name: '', mobile: '', email: '', type: 'RETAIL', status: 'ACTIVE',
    businessName: '', gstNumber: '', address: ''
  };
  const [formData, setFormData] = useState(defaultFormData);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers?search=${search}`);
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      closeModal();
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert(`Failed to ${editingId ? 'update' : 'create'} customer`);
    }
  };

  const handleEdit = (customer: any) => {
    setFormData({
      name: customer.name || '',
      mobile: customer.mobile || '',
      email: customer.email || '',
      type: customer.type || 'RETAIL',
      status: customer.status || 'ACTIVE',
      businessName: customer.businessName || '',
      gstNumber: customer.gstNumber || '',
      address: customer.address || ''
    });
    setEditingId(customer.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(defaultFormData);
  };

  return (
    <div>
      <div className="flex justify-between align-center mb-4">
        <h1>Customers</h1>
        <button className="btn btn-primary" onClick={() => { setEditingId(null); setFormData(defaultFormData); setShowModal(true); }}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1rem' }}>
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name / Business</th>
              <th>Contact</th>
              <th>GSTIN</th>
              <th>Type</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={7} className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>No customers found</td></tr>
            ) : (
              customers.map(customer => (
                <tr key={customer.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{customer.name}</div>
                    {customer.businessName && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{customer.businessName}</div>}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.875rem' }}>{customer.mobile}</div>
                    {customer.email && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{customer.email}</div>}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{customer.gstNumber || '—'}</td>
                  <td><span className="badge badge-neutral">{customer.type}</span></td>
                  <td>
                    <span className={`badge ${customer.status === 'ACTIVE' ? 'badge-success' : customer.status === 'LEAD' ? 'badge-warning' : 'badge-danger'}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(customer.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => handleEdit(customer)}
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Customer' : 'Add Customer'}</h2>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div className="modal-body">
                <div className="flex gap-4">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Contact Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Business / Company Name</label>
                    <input className="form-input" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Mobile No. <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input className="form-input" required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Email Address</label>
                    <input className="form-input" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">GSTIN / Tax Number</label>
                  <input className="form-input" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} placeholder="e.g. 29ABCDE1234F1Z5" />
                </div>

                <div className="form-group">
                  <label className="form-label">Billing/Shipping Address</label>
                  <textarea className="form-input" rows={3} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Full address..." />
                </div>

                <div className="flex gap-4">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Customer Type</label>
                    <select className="form-input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option value="RETAIL">Retail</option>
                      <option value="WHOLESALE">Wholesale</option>
                      <option value="DISTRIBUTOR">Distributor</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Status</label>
                    <select className="form-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="LEAD">Lead</option>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Save Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
