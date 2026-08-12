import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2 } from 'lucide-react';
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
        // If editing and password is empty, don't send it so it doesn't get updated to blank
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
      password: '', // Don't pre-fill password for security. Leave blank to keep unchanged.
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
        <h2 style={{ color: 'var(--color-danger)' }}>Access Denied: Admins Only</h2>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between align-center mb-4">
        <h1>Employee Management</h1>
        <button className="btn btn-primary" onClick={() => { setEditingId(null); setFormData(defaultFormData); setShowModal(true); }}>
          <Plus size={18} /> Add Employee
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
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>No employees found</td></tr>
            ) : (
              employees.map(employee => (
                <tr key={employee.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{employee.username}</div>
                  </td>
                  <td>
                    <span className={`badge ${employee.role === 'ADMIN' ? 'badge-primary' : employee.role === 'SALES' ? 'badge-success' : employee.role === 'WAREHOUSE' ? 'badge-warning' : 'badge-neutral'}`}>
                      {employee.role}
                    </span>
                  </td>
                  <td>{new Date(employee.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                        onClick={() => handleEdit(employee)}
                      >
                        <Edit2 size={14} style={{ marginRight: '0.25rem' }} /> Edit
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                        onClick={() => handleDelete(employee.id)}
                        disabled={employee.id === user.id} // Prevent deleting yourself
                        title={employee.id === user.id ? "You cannot delete yourself" : "Delete Employee"}
                      >
                        <Trash2 size={14} style={{ marginRight: '0.25rem' }} /> Delete
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
          <div className="modal-content" style={{ maxWidth: '500px', maxHeight: '85vh', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ marginBottom: '1rem', flexShrink: 0 }}>{editingId ? 'Edit Employee' : 'Add Employee'}</h2>
            <form onSubmit={handleSubmit} style={{ overflowY: 'auto', paddingRight: '0.5rem', flex: 1, minHeight: 0 }}>
              <div className="form-group">
                <label className="form-label">Username (Login ID) <span style={{ color: 'red' }}>*</span></label>
                <input 
                  className="form-input" 
                  required 
                  value={formData.username} 
                  onChange={e => setFormData({...formData, username: e.target.value})} 
                  placeholder="e.g. jdoe_sales"
                />
              </div>
              
              <div className="form-group mt-2">
                <label className="form-label">Password {editingId && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>(Leave blank to keep unchanged)</span>}</label>
                <input 
                  type="password"
                  className="form-input" 
                  required={!editingId} // Only required when creating a new user
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  placeholder={editingId ? 'Enter new password...' : 'Enter strong password...'}
                />
              </div>

              <div className="form-group mt-2">
                <label className="form-label">System Role <span style={{ color: 'red' }}>*</span></label>
                <select className="form-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="SALES">Sales</option>
                  <option value="ACCOUNTS">Accounts</option>
                  <option value="WAREHOUSE">Warehouse</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  This role determines what sections of the Mini ERP they can access.
                </p>
              </div>
              
              <div className="flex justify-between mt-6 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
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
