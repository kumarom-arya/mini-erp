import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { Plus, Check, X, Printer, ExternalLink } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { PrintableChallan } from '../components/PrintableChallan';
import { useAuth } from '../context/AuthContext';

const Challans = () => {
  const [challans, setChallans] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [viewChallan, setViewChallan] = useState<any>(null);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const { user } = useAuth();
  
  // New Challan State
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedQty, setSelectedQty] = useState('1');
  const [editModeId, setEditModeId] = useState<number | null>(null);
  const [originalItems, setOriginalItems] = useState<any[]>([]);

  // Edit Requests State
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [editRequests, setEditRequests] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [chRes, cuRes, prRes, setRes] = await Promise.all([
        api.get('/challans'),
        api.get('/customers'),
        api.get('/products'),
        api.get('/settings')
      ]);
      setChallans(chRes.data);
      setCustomers(cuRes.data);
      setProducts(prRes.data);
      setSettings(setRes.data);

      if (user?.role === 'ADMIN') {
        const reqRes = await api.get('/edit-requests');
        setEditRequests(reqRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getAvailableStock = (product: any) => {
    let stock = product.currentStock;
    if (editModeId) {
      const originalQty = originalItems.filter(i => i.productId === product.id).reduce((sum, i) => sum + i.quantity, 0);
      stock += originalQty;
    }
    const currentQty = items.filter(i => i.productId === product.id).reduce((sum, i) => sum + i.quantity, 0);
    stock -= currentQty;
    return stock;
  };

  const handleAddItem = () => {
    if (!selectedProduct || !selectedQty) return;
    const product = products.find(p => p.id === parseInt(selectedProduct));
    if (!product) return;
    
    const qtyToAdd = parseInt(selectedQty);
    const available = getAvailableStock(product);

    if (qtyToAdd > available) {
      alert(`Cannot add ${qtyToAdd}. Only ${available} available in stock.`);
      return;
    }

    setItems([...items, {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      unitPrice: product.unitPrice,
      quantity: qtyToAdd
    }]);
    
    setSelectedProduct('');
    setSelectedQty('1');
  };

  const handleCreateChallan = async (status: string) => {
    if (!selectedCustomer || items.length === 0) {
      alert('Please select a customer and add at least one item');
      return;
    }

    try {
      if (editModeId) {
        await api.post(`/challans/${editModeId}/edit-request`, {
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
        });
        alert('Edit request submitted successfully.');
      } else {
        await api.post('/challans', {
          customerId: parseInt(selectedCustomer),
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
          status
        });
      }
      closeCreateModal();
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to process request');
    }
  };

  const closeCreateModal = () => {
    setShowModal(false);
    setItems([]);
    setOriginalItems([]);
    setSelectedCustomer('');
    setEditModeId(null);
  };

  const handleEditRequestClick = async (id: number) => {
    // Fetch challan details to prefill items
    try {
      const res = await api.get(`/challans/${id}`);
      const challan = res.data;
      setSelectedCustomer(challan.customerId.toString());
      setOriginalItems(challan.items);
      setItems(challan.items.map((i: any) => ({
        productId: i.productId,
        productName: i.productName,
        sku: i.productSku,
        unitPrice: i.unitPrice,
        quantity: i.quantity
      })));
      setEditModeId(id);
      setShowModal(true);
    } catch (err) {
      console.error('Failed to load challan for editing', err);
    }
  };

  const handleResolveEditRequest = async (id: number, action: 'APPROVE' | 'REJECT') => {
    if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;
    try {
      await api.post(`/edit-requests/${id}/resolve`, { action });
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to resolve request');
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/challans/${id}/status`, { status });
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleGenerateInvoice = async (challan: any) => {
    const taxAmount = parseFloat(window.prompt('Enter Tax Amount (0 if none):', '0') || '0');
    const discount = parseFloat(window.prompt('Enter Discount Amount (0 if none):', '0') || '0');
    
    if (isNaN(taxAmount) || isNaN(discount)) {
      alert('Invalid amounts entered.');
      return;
    }

    try {
      await api.post('/invoices', {
        challanId: challan.id,
        customerId: challan.customerId,
        taxAmount,
        discount
      });
      alert('Invoice generated successfully!');
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to generate invoice');
    }
  };

  const handleViewChallan = async (id: number) => {
    try {
      const res = await api.get(`/challans/${id}`);
      setViewChallan(res.data);
    } catch (err) {
      console.error('Failed to fetch challan details', err);
    }
  };

  return (
    <div>
      <div className="flex justify-between align-center mb-4">
        <h1>Sales Challans</h1>
        <div className="flex gap-4">
          {user?.role === 'ADMIN' && (
            <button className="btn btn-secondary" onClick={() => setShowRequestsModal(true)}>
              Review Edit Requests {editRequests.filter(r => r.status === 'PENDING').length > 0 && `(${editRequests.filter(r => r.status === 'PENDING').length})`}
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Create Challan
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Challan No</th>
              <th>Customer</th>
              <th>Total Qty</th>
              <th>Status</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : challans.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>No challans found</td></tr>
            ) : (
              challans.map(challan => (
                <tr key={challan.id}>
                  <td style={{ fontWeight: 600 }}>{challan.challanNo}</td>
                  <td>{challan.customer?.name}</td>
                  <td>{challan.totalQty}</td>
                  <td>
                    <span className={`badge ${challan.status === 'CONFIRMED' ? 'badge-success' : challan.status === 'DRAFT' ? 'badge-warning' : 'badge-danger'}`}>
                      {challan.status}
                    </span>
                  </td>
                  <td>{challan.createdBy?.username}</td>
                  <td>
                    <div className="flex gap-2 align-center">
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleViewChallan(challan.id)} title="View/Print">
                        <Printer size={14} /> Print
                      </button>
                      {challan.status === 'DRAFT' && (
                        <>
                          <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleUpdateStatus(challan.id, 'CONFIRMED')} title="Confirm (Reduces Stock)">
                            <Check size={14} /> Confirm
                          </button>
                          <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleUpdateStatus(challan.id, 'CANCELLED')}>
                            <X size={14} /> Cancel
                          </button>
                        </>
                      )}
                      {challan.status === 'CONFIRMED' && !challan.invoice && (
                        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none' }} onClick={() => handleGenerateInvoice(challan)}>
                          Generate Invoice
                        </button>
                      )}
                      {challan.status === 'CONFIRMED' && (user?.role === 'SALES' || user?.role === 'ADMIN') && (
                        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleEditRequestClick(challan.id)}>
                          Request Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {viewChallan && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'hidden' }}>
            <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <h2 style={{ margin: 0, color: 'var(--color-text-main)' }}>Challan {viewChallan.challanNo}</h2>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-primary" onClick={handlePrint}>
                  <Printer size={18} /> Print PDF
                </button>
                <button className="btn btn-secondary" onClick={() => setViewChallan(null)}>
                  <X size={18} /> Close
                </button>
              </div>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#e5e7eb', padding: '2rem', minHeight: 0 }}>
              <div style={{ maxWidth: '800px', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <PrintableChallan ref={printRef} challan={viewChallan} settings={settings} />
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', padding: '1.5rem' }}>
            <h2>{editModeId ? 'Propose Edits to Challan' : 'New Sales Challan'}</h2>
            
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Customer</label>
                <select className="form-input" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} disabled={!!editModeId}>
                  <option value="">Select a customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                  ))}
                </select>
              </div>

              <div className="card" style={{ padding: '1rem', marginTop: '1.5rem', border: '1px solid var(--color-border)', boxShadow: 'none' }}>
                <h3 style={{ fontSize: '1rem' }}>Add Products</h3>
                <div className="flex gap-4 align-center mt-4">
                  <div style={{ flex: 2 }}>
                    <select className="form-input" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                      <option value="">Select product...</option>
                      {products.map(p => {
                        const available = getAvailableStock(p);
                        return (
                          <option key={p.id} value={p.id} disabled={available <= 0}>
                            {p.sku} - {p.name} (Stock: {available})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <input type="number" min="1" className="form-input" value={selectedQty} onChange={(e) => setSelectedQty(e.target.value)} placeholder="Qty" />
                  </div>
                  <button type="button" className="btn btn-secondary" onClick={handleAddItem}>Add Item</button>
                </div>

                {items.length > 0 && (
                  <div className="table-container mt-4" style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>SKU</th>
                          <th>Product</th>
                          <th>Qty</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.sku}</td>
                            <td>{item.productName}</td>
                            <td>{item.quantity}</td>
                            <td>${item.unitPrice.toFixed(2)}</td>
                            <td>
                              <button className="btn btn-danger" style={{ padding: '2px 5px', fontSize: '10px' }} onClick={() => {
                                const newItems = [...items];
                                newItems.splice(idx, 1);
                                setItems(newItems);
                              }}><X size={12} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
              <button type="button" className="btn btn-secondary" onClick={closeCreateModal}>Cancel</button>
              <div className="flex gap-4">
                {editModeId ? (
                   <button type="button" className="btn btn-primary" onClick={() => handleCreateChallan('DRAFT')}>Submit Edit Request</button>
                ) : (
                  <>
                    <button type="button" className="btn btn-secondary" onClick={() => handleCreateChallan('DRAFT')}>Save as Draft</button>
                    <button type="button" className="btn btn-primary" onClick={() => handleCreateChallan('CONFIRMED')}>Confirm Challan</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showRequestsModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '900px', maxHeight: '90vh', padding: '1.5rem' }}>
            <h2>Review Edit Requests</h2>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {editRequests.length === 0 ? (
                <p>No edit requests found.</p>
              ) : (
                editRequests.map(req => (
                  <div key={req.id} className="card" style={{ marginBottom: '1rem', border: '1px solid var(--color-border)' }}>
                    <div className="flex justify-between align-center mb-2">
                      <h4 style={{ margin: 0 }}>Request for {req.challan?.challanNo} (by {req.requestedBy?.username})</h4>
                      <span className={`badge ${req.status === 'PENDING' ? 'badge-warning' : req.status === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>
                        {req.status}
                      </span>
                    </div>
                    <p style={{ margin: '5px 0', fontSize: '0.85rem' }}>Current Qty: {req.challan?.totalQty} | Customer: {req.challan?.customer?.name}</p>
                    
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '4px', fontSize: '0.85rem', border: '1px solid var(--color-border)' }}>
                      <strong>Proposed Items:</strong>
                      <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        {JSON.parse(req.proposedData).map((item: any, idx: number) => (
                          <li key={idx}>{item.productName} ({item.sku}) - Qty: {item.quantity}</li>
                        ))}
                      </ul>
                    </div>

                    {req.status === 'PENDING' && (
                      <div className="flex gap-4 mt-4">
                        <button className="btn btn-primary" onClick={() => handleResolveEditRequest(req.id, 'APPROVE')}><Check size={14}/> Approve & Apply</button>
                        <button className="btn btn-danger" onClick={() => handleResolveEditRequest(req.id, 'REJECT')}><X size={14}/> Reject</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
              <button className="btn btn-secondary" onClick={() => setShowRequestsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challans;
