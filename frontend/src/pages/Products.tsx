import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Search, Plus, Edit } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({ name: '', sku: '', category: '', unitPrice: '', currentStock: '', minStockAlert: '' });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products?search=${search}`);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, formData);
      } else {
        await api.post('/products', formData);
      }
      closeModal();
      fetchProducts();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to save product');
    }
  };

  const openEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      unitPrice: product.unitPrice.toString(),
      currentStock: product.currentStock.toString(),
      minStockAlert: product.minStockAlert.toString()
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', sku: '', category: '', unitPrice: '', currentStock: '', minStockAlert: '' });
  };

  return (
    <div>
      <div className="flex justify-between align-center mb-4">
        <h1>Products & Inventory</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="card mb-4" style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input 
            type="text" 
            className="form-input" 
            style={{ paddingLeft: '2.5rem' }} 
            placeholder="Search products by SKU or Name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Unit Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>No products found</td></tr>
            ) : (
              products.map(product => (
                <tr key={product.id}>
                  <td style={{ fontFamily: 'monospace' }}>{product.sku}</td>
                  <td style={{ fontWeight: 500 }}>{product.name}</td>
                  <td>{product.category}</td>
                  <td>₹{product.unitPrice.toFixed(2)}</td>
                  <td>{product.currentStock}</td>
                  <td>
                    {product.currentStock <= product.minStockAlert ? (
                      <span className="badge badge-danger">Low Stock</span>
                    ) : (
                      <span className="badge badge-success">In Stock</span>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => openEdit(product)}>
                      <Edit size={14} /> Edit
                    </button>
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
            <h2 style={{ marginBottom: '1rem', flexShrink: 0 }}>{editingId ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSave} style={{ overflowY: 'auto', paddingRight: '0.5rem', flex: 1, minHeight: 0 }}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">SKU</label>
                  <input className="form-input" required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Category</label>
                  <input className="form-input" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Unit Price</label>
                  <input className="form-input" type="number" step="0.01" required value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Current Stock</label>
                  <input className="form-input" type="number" required value={formData.currentStock} onChange={e => setFormData({...formData, currentStock: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Minimum Stock Alert</label>
                <input className="form-input" type="number" required value={formData.minStockAlert} onChange={e => setFormData({...formData, minStockAlert: e.target.value})} />
              </div>
              <div className="flex justify-between mt-4">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update Product' : 'Save Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
