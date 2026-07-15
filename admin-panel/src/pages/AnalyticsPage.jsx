import { useState, useEffect, useMemo } from 'react';
import { FiDownload, FiTrendingUp, FiDollarSign, FiShoppingCart, FiStar } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { formatIndian } from '../utils/format';

import { API } from '../api';
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];
const periods = ['This Week', 'This Month', 'This Year'];

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [period, setPeriod] = useState('This Year');
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [catSales, setCatSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  });

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      fetch(`${API}/analytics/summary`, { headers: headers() }).then(r => r.json()),
      fetch(`${API}/analytics/monthly-sales`, { headers: headers() }).then(r => r.json()),
      fetch(`${API}/analytics/sales-by-category`, { headers: headers() }).then(r => r.json()),
      fetch(`${API}/analytics/top-products?limit=5`, { headers: headers() }).then(r => r.json()),
      fetch(`${API}/enquiries?limit=5`, { headers: headers() }).then(r => r.json()),
    ])
      .then(([s, m, c, t, e]) => {
        setSummary(s);
        setMonthlyData(m.monthly_sales || []);
        setCatSales(c.categories || []);
        setTopProducts(t.products || []);
        setEnquiries(Array.isArray(e) ? e : (e.enquiries || []));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const metrics = useMemo(() => {
    if (!summary) return [];
    const avgOrder = summary.total_orders > 0 ? summary.total_revenue / summary.total_orders : 0;
    return [
      { icon: FiDollarSign, label: 'Total Revenue', value: formatIndian(summary.total_revenue || 0), color: '#10b981', bg: '#d1fae5', change: `${summary.total_products} products` },
      { icon: FiShoppingCart, label: 'Total Sales', value: (summary.total_sales || 0).toLocaleString(), color: '#3b82f6', bg: '#dbeafe', change: `${summary.total_orders || 0} orders` },
      { icon: FiTrendingUp, label: 'Avg Rating', value: (summary.average_rating || 0).toFixed(1), color: '#f59e0b', bg: '#fef3c7', change: `${summary.total_categories} categories` },
      { icon: FiStar, label: 'Available Today', value: `${summary.available_today || 0}/${summary.total_products || 0}`, color: '#8b5cf6', bg: '#ede9fe', change: `${summary.featured_count} featured` },
    ];
  }, [summary]);

  const catChartData = useMemo(() => {
    return catSales.map((c, i) => ({ name: c.category, value: c.total_revenue, color: COLORS[i % COLORS.length] }));
  }, [catSales]);

  const filteredMonthly = useMemo(() => {
    if (period === 'This Year') return monthlyData;
    if (period === 'This Month') {
      const now = new Date();
      const ym = now.toLocaleString('en', { month: 'short', year: 'numeric' });
      return monthlyData.filter(m => m.month === ym);
    }
    if (period === 'This Week') {
      return monthlyData.slice(-1);
    }
    return monthlyData;
  }, [period, monthlyData]);

  const handleExport = () => {
    let csv = 'Metric,Value\n';
    if (summary) {
      Object.entries(summary).forEach(([k, v]) => { csv += `${k},${v}\n`; });
    }
    csv += '\nCategory,Revenue\n';
    catSales.forEach(c => { csv += `${c.category},${c.total_revenue}\n`; });
    csv += '\nProduct,Sales,Revenue\n';
    topProducts.forEach(p => { csv += `${p.name},${p.sales || 0},${((p.sales || 0) * (p.price || 0)).toFixed(2)}\n`; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-success" /></div>;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div className="d-flex gap-2 flex-wrap">
          {periods.map((p) => (
            <button key={p} className={`btn btn-sm ${period === p ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setPeriod(p)}>{p}</button>
          ))}
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={handleExport}><FiDownload className="me-1" /> Export</button>
      </div>

      <div className="row g-3 mb-4">
        {metrics.map((m, i) => (
          <div className="col-xl-3 col-md-6" key={i}>
            <div className="stat-card" style={{ backgroundColor: m.bg }}>
              <div className="stat-icon" style={{ color: m.color }}><m.icon size={28} /></div>
              <div className="stat-info">
                <h3 className="stat-value">{m.value}</h3>
                <p className="stat-label mb-0">{m.label}</p>
                <small className="stat-trend"><FiTrendingUp size={12} /> {m.change}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <div className="admin-card">
            <h6 className="card-title mb-3">Sales Trend ({period})</h6>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredMonthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" fontSize={12} tick={{ fill: '#6b7280' }} />
                <YAxis fontSize={12} tick={{ fill: '#6b7280' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="admin-card">
            <h6 className="card-title mb-3">Sales by Category</h6>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={catChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                  {catChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="admin-card">
            <h6 className="card-title mb-3">Top Selling Products</h6>
            <div className="table-responsive">
              <table className="table admin-table">
                <thead>
                  <tr><th>#</th><th>Product</th><th>Sales</th><th>Revenue</th></tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <tr key={p.id}>
                      <td>{i + 1}</td>
                      <td className="fw-medium">{p.name}</td>
                      <td>{p.sales || 0}</td>
                      <td>{formatIndian((p.sales || 0) * (p.price || 0))}</td>
                    </tr>
                  ))}
                  {topProducts.length === 0 && (
                    <tr><td colSpan="4" className="text-center text-muted py-3">No data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="admin-card">
            <h6 className="card-title mb-3">Stock Overview</h6>
            {summary && (
              <>
                <div className="mb-2 d-flex justify-content-between"><span>Total Stock</span><strong>{summary.total_stock}</strong></div>
                <div className="mb-2 d-flex justify-content-between"><span>Out of Stock</span><strong className="text-danger">{summary.out_of_stock}</strong></div>
                <div className="mb-2 d-flex justify-content-between"><span>Available Today</span><strong className="text-success">{summary.available_today}</strong></div>
                <div className="mb-2 d-flex justify-content-between"><span>Featured</span><strong>{summary.featured_count}</strong></div>
                <div className="d-flex justify-content-between"><span>Avg Rating</span><strong>{summary.average_rating?.toFixed(1) || '0'}</strong></div>
              </>
            )}
          </div>
        </div>
        <div className="col-lg-3">
          <div className="admin-card">
            <h6 className="card-title mb-3">Recent Enquiries</h6>
            {enquiries.length === 0 ? (
              <p className="text-muted small mb-0">No enquiries</p>
            ) : (
              enquiries.slice(0, 5).map((e, i) => (
                <div key={i} className={`pb-2 mb-2 ${i < Math.min(enquiries.length, 5) - 1 ? 'border-bottom' : ''}`}>
                  <div className="d-flex justify-content-between">
                    <strong className="small">{e.name || 'Anonymous'}</strong>
                    <span className={`badge ${e.is_read ? 'bg-success' : 'bg-warning text-dark'} py-0`}>{e.is_read ? 'Read' : 'New'}</span>
                  </div>
                  <small className="text-muted d-block">{e.message?.substring(0, 50)}</small>
                  <small className="text-muted">{e.created_at?.substring(0, 10)}</small>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
