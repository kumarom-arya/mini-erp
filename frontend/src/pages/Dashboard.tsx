import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Package, FileText, TrendingUp, AlertTriangle, IndianRupee } from 'lucide-react';
import api from '../services/api';

const StatCard = ({ icon, iconBg, iconColor, label, value, delay }: {
  icon: React.ReactNode; iconBg: string; iconColor: string; label: string; value: string; delay: number;
}) => (
  <div
    className="stat-card"
    style={{ animation: `fadeInUp 0.5s var(--ease-out) ${delay}s both` }}
  >
    <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>
      {icon}
    </div>
    <div style={{ overflow: 'hidden', flex: 1 }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.15rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value}
      </div>
    </div>
  </div>
);

const SkeletonCards = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
    {[1,2,3,4].map(i => (
      <div key={i} className="skeleton skeleton-card" style={{ height: '90px' }} />
    ))}
  </div>
);

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

  if (loading) return (
    <div>
      <div className="skeleton skeleton-text" style={{ width: '300px', height: '2rem', marginBottom: '0.5rem' }} />
      <div className="skeleton skeleton-text" style={{ width: '400px', height: '1rem', marginBottom: '2rem' }} />
      <SkeletonCards />
      <div className="skeleton" style={{ height: '200px', marginTop: '2rem', borderRadius: 'var(--radius-xl)' }} />
    </div>
  );

  if (!data) return (
    <div className="empty-state">
      <AlertTriangle size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
      <p>Failed to load dashboard data. Please refresh.</p>
    </div>
  );

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Welcome back, {user?.username}</h1>
        <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
          Here's what's happening with your operations today.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard
          icon={<TrendingUp size={22} />}
          iconBg="rgba(16, 185, 129, 0.12)"
          iconColor="#10B981"
          label="Total Revenue"
          value={`₹${data.financial.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          delay={0.05}
        />
        <StatCard
          icon={<IndianRupee size={22} />}
          iconBg="rgba(239, 68, 68, 0.12)"
          iconColor="#EF4444"
          label="Outstanding Amount"
          value={`₹${data.financial.outstandingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          delay={0.1}
        />
        <StatCard
          icon={<Users size={22} />}
          iconBg="var(--primary-light)"
          iconColor="var(--primary)"
          label="Total Customers"
          value={data.totalCustomers.toString()}
          delay={0.15}
        />
        <StatCard
          icon={<FileText size={22} />}
          iconBg="rgba(6, 182, 212, 0.12)"
          iconColor="#06B6D4"
          label="Challans Generated"
          value={data.totalChallans.toString()}
          delay={0.2}
        />
      </div>

      {/* Low Stock Alerts */}
      <div style={{ animation: 'fadeInUp 0.5s var(--ease-out) 0.25s both' }}>
        <div className="flex align-center gap-3 mb-4">
          <div style={{
            padding: '0.5rem',
            background: 'var(--danger-light)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={18} />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Low Stock Alerts</h2>
          {data.lowStockProducts.length > 0 && (
            <span className="badge badge-danger" style={{ marginLeft: '0.25rem' }}>
              {data.lowStockProducts.length}
            </span>
          )}
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
                <tr><td colSpan={5} className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                  No low stock alerts — inventory is healthy! ✅
                </td></tr>
              ) : (
                data.lowStockProducts.map((product: any) => (
                  <tr key={product.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.85rem' }}>{product.sku}</td>
                    <td>{product.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{product.location || 'N/A'}</td>
                    <td>
                      <span className="badge badge-danger" style={{ fontWeight: 800 }}>
                        {product.currentStock}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{product.minStockAlert}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
