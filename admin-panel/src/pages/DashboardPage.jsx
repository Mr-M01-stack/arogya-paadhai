import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiDollarSign, FiTrendingUp, FiUsers, FiBox, FiMapPin, FiMessageSquare, FiFileText, FiShoppingCart, FiCreditCard, FiAlertTriangle, FiBarChart2, FiDownload } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { formatIndian, formatIndianInt } from '../utils/format';
import { API } from '../api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#14b8a6'];
const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
  { key: 'custom', label: 'Custom' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [revenueChart, setRevenueChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const dashRef = useRef(null);

  const fetchDashboard = () => {
    setLoading(true);
    let dashUrl = `${API}/dashboard`;
    if (period === 'custom' && customFrom && customTo) {
      dashUrl += `?from=${customFrom}&to=${customTo}`;
    }
    let chartUrl = `${API}/dashboard/revenue-chart?period=${period}`;
    if (period === 'custom' && customFrom && customTo) {
      chartUrl = `${API}/dashboard/revenue-chart?period=month`;
    }
    Promise.all([
      fetch(dashUrl).then(r => r.json()),
      fetch(chartUrl).then(r => r.json()),
    ]).then(([dash, chart]) => {
      setDashboard(dash);
      setRevenueChart(chart);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (period !== 'custom') fetchDashboard();
  }, [period]);

  useEffect(() => {
    if (period === 'custom' && customFrom && customTo) fetchDashboard();
  }, [customFrom, customTo]);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-success" style={{width: '3rem', height: '3rem'}} /></div>;

  const d = dashboard || {};
  const p = period === 'custom' && d.periods && d.periods.custom ? d.periods.custom : (d.periods && d.periods[period]) || {};
  const periodLabel = period === 'custom' ? `${customFrom} to ${customTo}` : period.charAt(0).toUpperCase() + period.slice(1);

  const chartData = revenueChart?.labels?.map((label, i) => ({
    date: period === 'year' ? label.slice(0, 7) : label.slice(5),
    revenue: revenueChart.values[i],
  })) || [];

  const paymentData = Object.entries(p.payment_breakdown || {}).map(([name, value]) => ({ name, value }));
  const investmentData = Object.entries(p.investment_breakdown || {}).map(([name, value]) => ({ name, value: Math.round(value) }));
  const prodVsSalesData = (p.prod_vs_sales || []).slice(0, 10);
  const topProductsData = (p.top_products || []).slice(0, 10);
  const customerTrendData = (p.customer_trend || []);
  const stockLevelsData = (p.stock_levels || []).slice(0, 15);

  const kpiCards = [
    { icon: FiDollarSign, label: 'Revenue', value: formatIndian(p.revenue || 0), color: '#10b981', bg: '#d1fae5', sub: periodLabel },
    { icon: FiShoppingCart, label: 'Transactions', value: formatIndianInt(p.transactions || 0), color: '#3b82f6', bg: '#dbeafe', sub: periodLabel },
    { icon: FiPackage, label: 'Items Sold', value: formatIndianInt(p.items_sold || 0), color: '#8b5cf6', bg: '#ede9fe', sub: periodLabel },
    { icon: FiTrendingUp, label: 'Profit', value: formatIndian(p.profit || 0), color: '#f59e0b', bg: '#fef3c7', sub: periodLabel },
    { icon: FiCreditCard, label: 'Investment', value: formatIndian(p.investment || 0), color: '#ef4444', bg: '#fee2e2', sub: periodLabel },
    { icon: FiUsers, label: 'Customers', value: formatIndianInt(p.customers || 0), color: '#84cc16', bg: '#f7fee7', sub: periodLabel },
    { icon: FiMapPin, label: 'Stall Status', value: d.stall?.status || 'Not logged', color: '#06b6d4', bg: '#ecfeff', sub: d.stall?.date || '' },
    { icon: FiBox, label: 'Low Stock Items', value: formatIndianInt(d.low_stock_count || 0), color: '#ef4444', bg: '#fef2f2', sub: 'Needs attention' },
    { icon: FiPackage, label: 'Total Products', value: formatIndianInt(d.total_products || 0), color: '#10b981', bg: '#d1fae5', sub: 'In catalog' },
    { icon: FiMessageSquare, label: 'Pending Enquiries', value: formatIndianInt(d.pending_enquiries || 0), color: '#f59e0b', bg: '#fef3c7', sub: 'Follow up needed' },
    { icon: FiFileText, label: 'Product Requests', value: formatIndianInt(d.pending_requests || 0), color: '#8b5cf6', bg: '#f3e8ff', sub: 'Pending review' },
  ];

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const rows = [
      ['Metric', periodLabel],
      ['Revenue', p.revenue || 0],
      ['Transactions', p.transactions || 0],
      ['Items Sold', p.items_sold || 0],
      ['Profit', p.profit || 0],
      ['Investment', p.investment || 0],
      ['Customers', p.customers || 0],
    ];
    (p.top_products || []).forEach((tp, i) => {
      rows.push([`Top ${i + 1}`, `${tp.name} | Qty: ${tp.quantity} | Rev: ${tp.revenue}`]);
    });
    const ws1 = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

    const payData = Object.entries(p.payment_breakdown || {}).map(([k, v]) => ({ Method: k, Revenue: v }));
    if (payData.length) {
      const ws2 = XLSX.utils.json_to_sheet(payData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Payment Breakdown');
    }

    const invData = Object.entries(p.investment_breakdown || {}).map(([k, v]) => ({ Category: k, Amount: v }));
    if (invData.length) {
      const ws3 = XLSX.utils.json_to_sheet(invData);
      XLSX.utils.book_append_sheet(wb, ws3, 'Investment');
    }

    XLSX.writeFile(wb, `dashboard_${period}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Dashboard Report - ${periodLabel}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

    const body = [
      ['Revenue', String(p.revenue || 0)],
      ['Transactions', String(p.transactions || 0)],
      ['Items Sold', String(p.items_sold || 0)],
      ['Profit', String(p.profit || 0)],
      ['Investment', String(p.investment || 0)],
      ['Customers', String(p.customers || 0)],
    ];
    doc.autoTable({ startY: 34, head: [['Metric', 'Value']], body, styles: { fontSize: 9 } });
    doc.save(`dashboard_${period}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div ref={dashRef}>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="mb-0"><span className="text-success">📊</span> Dashboard</h2>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <div className="btn-group" role="group">
            {PERIODS.map(pr => (
              <button key={pr.key} className={`btn btn-sm ${period === pr.key ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setPeriod(pr.key)}>{pr.label}</button>
            ))}
          </div>
          {period === 'custom' && (
            <div className="d-flex gap-1 align-items-center">
              <input type="date" className="form-control form-control-sm" style={{width:140}} value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
              <span className="mx-1">to</span>
              <input type="date" className="form-control form-control-sm" style={{width:140}} value={customTo} onChange={e => setCustomTo(e.target.value)} />
            </div>
          )}
          <button className="btn btn-sm btn-outline-primary" onClick={exportExcel}><FiDownload className="me-1" />Excel</button>
          <button className="btn btn-sm btn-outline-danger" onClick={exportPDF}><FiDownload className="me-1" />PDF</button>
        </div>
      </div>

      {d.low_stock_count > 0 && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
          <FiAlertTriangle size={20} />
          <strong>{d.low_stock_count} product(s)</strong> are running low on stock.
          <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => navigate('/stock')}>View Stock</button>
        </div>
      )}

      <div className="row g-3 mb-4">
        {kpiCards.map((card, i) => (
          <div className="col-xl-3 col-lg-4 col-md-6" key={i}>
            <div className="stat-card" style={{ backgroundColor: card.bg }}>
              <div className="stat-icon" style={{ color: card.color }}>
                <card.icon size={28} />
              </div>
              <div className="stat-info">
                <h3 className="stat-value">{card.value}</h3>
                <p className="stat-label mb-0">{card.label}</p>
                <small className="stat-trend">{card.sub}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <div className="admin-card">
            <h6 className="card-title mb-3">Revenue Trend ({periodLabel})</h6>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" fontSize={11} tick={{ fill: '#6b7280' }} />
                <YAxis fontSize={11} tick={{ fill: '#6b7280' }} />
                <Tooltip formatter={(value) => [formatIndian(value), 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="admin-card mb-3">
            <h6 className="card-title mb-3">Payment Breakdown</h6>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={paymentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {paymentData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => [formatIndian(value), '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="admin-card">
            <h6 className="card-title mb-3">Quick Actions</h6>
            <div className="d-grid gap-2">
              <button className="btn btn-success" onClick={() => navigate('/sales')}><FiDollarSign className="me-2" />Add Sale</button>
              <button className="btn btn-warning text-dark" onClick={() => navigate('/stall')}><FiMapPin className="me-2" />Log Stall</button>
              <button className="btn btn-outline-success" onClick={() => navigate('/products')}><FiPackage className="me-2" />Manage Products</button>
              <button className="btn btn-outline-primary" onClick={() => navigate('/stock')}><FiBox className="me-2" />Check Stock</button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="admin-card">
            <h6 className="card-title mb-3">Top Products ({periodLabel})</h6>
            <div className="table-responsive">
              <table className="table admin-table mb-0">
                <thead><tr><th>#</th><th>Product</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
                <tbody>
                  {topProductsData.map((tp, i) => (
                    <tr key={i}><td>{i + 1}</td><td className="fw-medium">{tp.name}</td><td>{tp.quantity}</td><td>{formatIndian(tp.revenue)}</td></tr>
                  ))}
                  {topProductsData.length === 0 && <tr><td colSpan="4" className="text-center text-muted">No data</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="admin-card">
            <h6 className="card-title mb-3">Top Products Chart ({periodLabel})</h6>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topProductsData} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" fontSize={11} tick={{ fill: '#6b7280' }} />
                <YAxis type="category" dataKey="name" fontSize={10} tick={{ fill: '#6b7280' }} />
                <Tooltip formatter={(value) => [formatIndian(value), '']} />
                <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="admin-card">
            <h6 className="card-title mb-3">Investment Breakdown ({periodLabel})</h6>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={investmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {investmentData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => [formatIndian(value), '']} />
              </PieChart>
            </ResponsiveContainer>
            {investmentData.length === 0 && <p className="text-center text-muted">No investment data</p>}
          </div>
        </div>
        <div className="col-lg-6">
          <div className="admin-card">
            <h6 className="card-title mb-3">Production vs Sales ({periodLabel})</h6>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={prodVsSalesData} margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" fontSize={10} tick={{ fill: '#6b7280' }} />
                <YAxis fontSize={11} tick={{ fill: '#6b7280' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="produced" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Produced" />
                <Bar dataKey="sold" fill="#10b981" radius={[4, 4, 0, 0]} name="Sold" />
              </BarChart>
            </ResponsiveContainer>
            {prodVsSalesData.length === 0 && <p className="text-center text-muted">No production data</p>}
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="admin-card">
            <h6 className="card-title mb-3">Customer Trend ({periodLabel})</h6>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={customerTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" fontSize={10} tick={{ fill: '#6b7280' }} />
                <YAxis fontSize={11} tick={{ fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} name="Customers" />
              </LineChart>
            </ResponsiveContainer>
            {customerTrendData.length === 0 && <p className="text-center text-muted">No customer data</p>}
          </div>
        </div>
        <div className="col-lg-6">
          <div className="admin-card">
            <h6 className="card-title mb-3">Stock Levels ({periodLabel})</h6>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stockLevelsData} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" fontSize={11} tick={{ fill: '#6b7280' }} />
                <YAxis type="category" dataKey="product" fontSize={10} tick={{ fill: '#6b7280' }} />
                <Tooltip />
                <Bar dataKey="available" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Available" />
              </BarChart>
            </ResponsiveContainer>
            {stockLevelsData.length === 0 && <p className="text-center text-muted">No stock data</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
