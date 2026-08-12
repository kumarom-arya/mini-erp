import React, { forwardRef } from 'react';

interface PrintableInvoiceProps {
  invoice: any;
  settings: any;
}

export const PrintableInvoice = forwardRef<HTMLDivElement, PrintableInvoiceProps>(
  ({ invoice, settings }, ref) => {
    if (!invoice) return null;

    return (
      <div className="printable-doc" ref={ref} style={{ padding: '40px', backgroundColor: 'white', color: 'black', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, color: '#333' }}>{settings?.companyName || 'Company Name'}</h1>
            <p style={{ margin: '5px 0', color: '#666' }}>{settings?.address}</p>
            <p style={{ margin: '5px 0', color: '#666' }}>Email: {settings?.email} | Phone: {settings?.phone}</p>
            {settings?.gstNumber && <p style={{ margin: '5px 0', color: '#666' }}>GSTIN: {settings?.gstNumber}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, color: '#333', fontSize: '24px' }}>TAX INVOICE</h2>
            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Invoice #: {invoice.invoiceNo}</p>
            <p style={{ margin: '5px 0' }}>Date: {new Date(invoice.createdAt).toLocaleDateString()}</p>
            <p style={{ margin: '5px 0' }}>Status: {invoice.status}</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Bill To:</h3>
            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{invoice.customer?.name}</p>
            {invoice.customer?.businessName && <p style={{ margin: '5px 0' }}>{invoice.customer.businessName}</p>}
            <p style={{ margin: '5px 0' }}>{invoice.customer?.address}</p>
            <p style={{ margin: '5px 0' }}>Phone: {invoice.customer?.mobile}</p>
            {invoice.customer?.gstNumber && <p style={{ margin: '5px 0' }}>GSTIN: {invoice.customer.gstNumber}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Reference:</h3>
            <p style={{ margin: '5px 0' }}>Challan No: {invoice.challan?.challanNo || 'N/A'}</p>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Item</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>SKU</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Qty</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Price</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.challan?.items?.map((item: any, idx: number) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{item.productName}</td>
                <td style={{ padding: '10px' }}>{item.productSku}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>${item.unitPrice.toFixed(2)}</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>${(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '350px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
              <span>Subtotal:</span>
              <span>${invoice.totalAmount.toFixed(2)}</span>
            </div>
            {invoice.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#e53e3e' }}>
                <span>Discount:</span>
                <span>-${invoice.discount.toFixed(2)}</span>
              </div>
            )}
            {invoice.taxAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                <span>Tax:</span>
                <span>${invoice.taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #eee', fontWeight: 'bold', fontSize: '18px' }}>
              <span>Grand Total:</span>
              <span>${invoice.grandTotal.toFixed(2)}</span>
            </div>
            {(() => {
              const totalPaid = invoice.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
              const balanceDue = invoice.grandTotal - totalPaid;
              if (totalPaid > 0) {
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#059669' }}>
                      <span>Amount Paid:</span>
                      <span>-${totalPaid.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #eee', fontWeight: 'bold', fontSize: '18px', color: balanceDue > 0 ? '#e53e3e' : '#059669' }}>
                      <span>Balance Due:</span>
                      <span>${Math.max(0, balanceDue).toFixed(2)}</span>
                    </div>
                  </>
                );
              }
              return null;
            })()}
          </div>
        </div>

        <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'center', color: '#666', fontSize: '12px' }}>
          <p>Thank you for your business!</p>
          <p>This is a computer-generated invoice and requires no signature.</p>
        </div>
      </div>
    );
  }
);
