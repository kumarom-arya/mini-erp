import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { CreditCard, Plus } from 'lucide-react';

const Payments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // New Payment State
  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [referenceNo, setReferenceNo] = useState('');
  const [maxAmount, setMaxAmount] = useState<number>(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payRes, invRes] = await Promise.all([
        api.get('/payments'),
        api.get('/invoices')
      ]);
      setPayments(payRes.data);
      setInvoices(invRes.data.filter((i: any) => i.status !== 'PAID'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(amount) > maxAmount) {
      alert(`Payment amount cannot exceed the remaining balance of ₹${maxAmount.toFixed(2)}`);
      return;
    }

    try {
      await api.post('/payments', {
        invoiceId: parseInt(invoiceId),
        amount: parseFloat(amount),
        paymentMode,
        referenceNo
      });
      setShowModal(false);
      setInvoiceId('');
      setAmount('');
      setPaymentMode('CASH');
      setReferenceNo('');
      setMaxAmount(0);
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to create payment');
    }
  };

  return (
    <div>
      <div className="flex justify-between align-center mb-4">
        <h1>Payments Received</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Record Payment
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Invoice Ref</th>
              <th>Amount</th>
              <th>Mode</th>
              <th>Reference No</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>No payments found</td></tr>
            ) : (
              payments.map(payment => (
                <tr key={payment.id}>
                  <td>PAY-{payment.id.toString().padStart(4, '0')}</td>
                  <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                  <td>{payment.invoice?.customer?.name}</td>
                  <td>{payment.invoice?.invoiceNo}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                    +₹{payment.amount.toFixed(2)}
                  </td>
                  <td>{payment.paymentMode}</td>
                  <td>{payment.referenceNo || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px', padding: '1.5rem' }}>
            <h2>Record Payment</h2>
            <form onSubmit={handleCreatePayment}>
              <div className="form-group mt-4">
                <label className="form-label">Invoice</label>
                <select className="form-input" required value={invoiceId} onChange={(e) => {
                  setInvoiceId(e.target.value);
                  const inv = invoices.find(i => i.id === parseInt(e.target.value));
                  if (inv) {
                    const paid = inv.payments?.reduce((s: number, p: any) => s + p.amount, 0) || 0;
                    const remaining = inv.grandTotal - paid;
                    setMaxAmount(remaining);
                    setAmount(remaining.toFixed(2));
                  } else {
                    setMaxAmount(0);
                    setAmount('');
                  }
                }}>
                  <option value="">Select Invoice...</option>
                  {invoices.map(inv => {
                    const paid = inv.payments?.reduce((s: number, p: any) => s + p.amount, 0) || 0;
                    const remaining = inv.grandTotal - paid;
                    return (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNo} - {inv.customer?.name} (Due: ₹{remaining.toFixed(2)})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group mt-4">
                <label className="form-label">Amount</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0.01"
                  max={maxAmount || undefined}
                  className="form-input" 
                  required 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                />
                {maxAmount > 0 && <small style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>Maximum allowed: ₹{maxAmount.toFixed(2)}</small>}
              </div>

              <div className="form-group mt-4">
                <label className="form-label">Payment Mode</label>
                <select className="form-input" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div className="form-group mt-4">
                <label className="form-label">Reference No (Optional)</label>
                <input type="text" className="form-input" value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} placeholder="Transaction ID, Cheque No..." />
              </div>

              <div className="flex justify-between mt-6 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
