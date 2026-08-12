import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { FileText, Printer, ExternalLink, X } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { PrintableInvoice } from '../components/PrintableInvoice';

const Invoices = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, setRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/settings')
      ]);
      setInvoices(invRes.data);
      setSettings(setRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewInvoice = async (id: number) => {
    try {
      const res = await api.get(`/invoices/${id}`);
      setSelectedInvoice(res.data);
    } catch (err) {
      console.error('Failed to fetch invoice details', err);
    }
  };

  return (
    <div>
      <div className="flex justify-between align-center mb-4">
        <h1>Invoices</h1>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Customer</th>
              <th>Challan Ref</th>
              <th>Date</th>
              <th>Grand Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>No invoices found</td></tr>
            ) : (
              invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td style={{ fontWeight: 600 }}>{invoice.invoiceNo}</td>
                  <td>{invoice.customer?.name}</td>
                  <td>{invoice.challan?.challanNo || 'N/A'}</td>
                  <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                  <td>₹{invoice.grandTotal.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${invoice.status === 'PAID' ? 'badge-success' : invoice.status === 'UNPAID' ? 'badge-danger' : 'badge-warning'}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleViewInvoice(invoice.id)} title="View Invoice">
                      <ExternalLink size={14} /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedInvoice && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'hidden' }}>
            <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <h2 style={{ margin: 0, color: 'var(--color-text-main)' }}>Invoice {selectedInvoice.invoiceNo}</h2>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-primary" onClick={handlePrint}>
                  <Printer size={18} /> Print PDF
                </button>
                <button className="btn btn-secondary" onClick={() => setSelectedInvoice(null)}>
                  <X size={18} /> Close
                </button>
              </div>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#e5e7eb', padding: '2rem', minHeight: 0 }}>
              <div style={{ maxWidth: '800px', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <PrintableInvoice ref={printRef} invoice={selectedInvoice} settings={settings} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
