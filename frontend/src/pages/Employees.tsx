import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Employees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const defaultFormData = { 
    username: '', password: '', role: 'SALES'
  };
  const [formData, setFormData] = useState(defaultFormData);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchEmployees();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete (updateData as any).password;
        }
        await api.put(`/users/${editingId}`, updateData);
      } else {
        await api.post('/users', formData);
      }
      closeModal();
      fetchEmployees();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || `Failed to ${editingId ? 'update' : 'create'} employee`);
    }
  };

  const handleEdit = (employee: any) => {
    setFormData({
      username: employee.username || '',
      password: '',
      role: employee.role || 'SALES',
    });
    setEditingId(employee.id);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      try {
        await api.delete(`/users/${id}`);
        fetchEmployees();
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.error || 'Failed to delete employee');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(defaultFormData);
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <h2 style={{ color: 'var(--danger)' }}>Access Denied: Admins Only</h2>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between align-center mb-4">
        <h1>Employee Management</h1>
        <button className="btn btn-primary" onClick={() => { setEditingId(null); setFormData(defaultFormData); setShowModal(true); }}>
          <Plus size={16} /> Add Employee
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID (Username)</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading...</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan={4} className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>No employees found</td></tr>
            ) : (
              employees.map(employee => (
                <tr key={employee.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{employee.username}</div>
                  </td>
                  <td>
                    <span className={`badge ${employee.role === 'ADMIN' ? 'badge-primary' : employee.role === 'SALES' ? 'badge-success' : employee.role === 'WAREHOUSE' ? 'badge-warning' : 'badge-neutral'}`}>
                      {employee.role}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(employee.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => handleEdit(employee)}
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => handleDelete(employee.id)}
                        disabled={employee.id === user.id}
                        title={employee.id === user.id ? "You cannot delete yourself" : "Delete Employee"}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Employee' : 'Add Employee'}</h2>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Username (Login ID) <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input
                    className="form-input"
                    required
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    placeholder="e.g. jdoe_sales"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Password {editingId && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(Leave blank to keep unchanged)</span>}
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    required={!editingId}
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder={editingId ? 'Enter new password...' : 'Enter strong password...'}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">System Role <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select className="form-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="SALES">Sales</option>
                    <option value="ACCOUNTS">Accounts</option>
                    <option value="WAREHOUSE">Warehouse</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <p style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    This role determines what sections of the Mini ERP they can access.
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Create Employee'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
