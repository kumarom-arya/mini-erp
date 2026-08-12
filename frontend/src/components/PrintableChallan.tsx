import React, { forwardRef } from 'react';

interface PrintableChallanProps {
  challan: any;
  settings: any;
}

export const PrintableChallan = forwardRef<HTMLDivElement, PrintableChallanProps>(
  ({ challan, settings }, ref) => {
    if (!challan) return null;

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
            <h2 style={{ margin: 0, color: '#333', fontSize: '24px' }}>DELIVERY CHALLAN</h2>
            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Challan #: {challan.challanNo}</p>
            <p style={{ margin: '5px 0' }}>Date: {new Date(challan.createdAt).toLocaleDateString()}</p>
            <p style={{ margin: '5px 0' }}>Status: {challan.status}</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Deliver To:</h3>
            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{challan.customer?.name}</p>
            {challan.customer?.businessName && <p style={{ margin: '5px 0' }}>{challan.customer.businessName}</p>}
            <p style={{ margin: '5px 0' }}>{challan.customer?.address}</p>
            <p style={{ margin: '5px 0' }}>Phone: {challan.customer?.mobile}</p>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Item</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>SKU</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Qty</th>
            </tr>
          </thead>
          <tbody>
            {challan.items?.map((item: any, idx: number) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{item.productName}</td>
                <td style={{ padding: '10px' }}>{item.productSku}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'center', color: '#666', fontSize: '12px' }}>
          <p>Please receive the above goods in good order and condition.</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', padding: '0 40px' }}>
            <div style={{ borderTop: '1px solid #333', paddingTop: '10px' }}>Authorized Signatory</div>
            <div style={{ borderTop: '1px solid #333', paddingTop: '10px' }}>Receiver's Signature</div>
          </div>
        </div>
      </div>
    );
  }
);
