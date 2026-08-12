import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Package, FileText, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics');
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (!data) return <div>Failed to load data</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '0.5rem' }}>Welcome back, {user?.username}</h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>Here's what's happening with your operations today.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-full)', color: '#10B981', flexShrink: 0 }}>
            <TrendingUp size={28} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h3 style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Total Revenue</h3>
            <p style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
              ₹{data.financial.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-full)', color: '#EF4444', flexShrink: 0 }}>
            <DollarSign size={28} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h3 style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Outstanding Amount</h3>
            <p style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
              ₹{data.financial.outstandingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-primary-light)', borderRadius: 'var(--radius-full)', color: 'var(--color-primary)', flexShrink: 0 }}>
            <Users size={28} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h3 style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Total Customers</h3>
            <p style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{data.totalCustomers}</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden' }}>
          <div style={{ padding: '1rem', backgroundColor: '#D1FAE5', borderRadius: 'var(--radius-full)', color: '#059669', flexShrink: 0 }}>
            <FileText size={28} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h3 style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Challans Generated</h3>
            <p style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{data.totalChallans}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <div>
          <div className="flex align-center gap-2 mb-4" style={{ color: 'var(--color-danger)', paddingLeft: '0.5rem' }}>
            <AlertTriangle size={20} />
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text-main)' }}>Low Stock Alerts</h2>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Location</th>
                  <th>Current Stock</th>
                  <th>Min Alert Level</th>
                </tr>
              </thead>
              <tbody>
                {data.lowStockProducts.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center' }}>No low stock alerts</td></tr>
                ) : (
                  data.lowStockProducts.map((product: any) => (
                    <tr key={product.id}>
                      <td style={{ fontWeight: 600 }}>{product.sku}</td>
                      <td>{product.name}</td>
                      <td>{product.location || 'N/A'}</td>
                      <td style={{ fontWeight: 'bold', color: '#EF4444' }}>{product.currentStock}</td>
                      <td>{product.minStockAlert}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
