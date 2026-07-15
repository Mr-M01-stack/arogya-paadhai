import { useState, useEffect } from 'react';
import { formatIndian, formatIndianInt, formatIndianPlain } from '../utils/format';

import { API } from '../api';

export default function ReportsPage() {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(weekAgo);
  const [endDate, setEndDate] = useState(today);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/sales?start_date=${startDate}&end_date=${endDate}&limit=500`)
      .then(r => r.json())
      .then(data => {
        setSales(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setSales([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [startDate, endDate]);

  const totalRevenue = sales.reduce((sum, s) => sum + (s.total_price || 0) - (s.discount || 0), 0);
  const totalItems = sales.reduce((sum, s) => sum + (s.quantity || 0), 0);
  const totalTransactions = sales.length;
  const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  const categoryData = {};
  sales.forEach(s => {
    const cat = s.category || 'other';
    if (!categoryData[cat]) categoryData[cat] = { revenue: 0, items: 0, count: 0 };
    categoryData[cat].revenue += (s.total_price || 0) - (s.discount || 0);
    categoryData[cat].items += (s.quantity || 0);
    categoryData[cat].count += 1;
  });

  const paymentMethods = {};
  sales.forEach(s => {
    const pm = s.payment_method || 'cash';
    paymentMethods[pm] = (paymentMethods[pm] || 0) + (s.total_price || 0) - (s.discount || 0);
  });

  const productSales = {};
  sales.forEach(s => {
    const name = s.product_name || 'unknown';
    if (!productSales[name]) productSales[name] = { qty: 0, rev: 0 };
    productSales[name].qty += s.quantity || 0;
    productSales[name].rev += (s.total_price || 0) - (s.discount || 0);
  });
  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1].rev - a[1].rev)
    .slice(0, 10);

  const dailyRevenue = {};
  sales.forEach(s => {
    const d = s.date;
    dailyRevenue[d] = (dailyRevenue[d] || 0) + (s.total_price || 0) - (s.discount || 0);
  });

  const handlePrint = () => window.print();

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0"><span className="text-success">📄</span> Reports</h2>
        <div className="d-flex gap-2 align-items-center">
          <input type="date" className="form-control form-control-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <span>to</span>
          <input type="date" className="form-control form-control-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <button className="btn btn-sm btn-outline-success btn-print" onClick={handlePrint}>🖨 Print</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-success" /></div>
      ) : (
        <>
          <div className="row mb-4">
            <div className="col-md-3 mb-2">
              <div className="card bg-success text-white text-center shadow-sm">
                <div className="card-body py-3">
                  <h3 className="mb-0">{formatIndian(totalRevenue)}</h3>
                  <small>Total Revenue</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-2">
              <div className="card bg-primary text-white text-center shadow-sm">
                <div className="card-body py-3">
                  <h3 className="mb-0">{formatIndianInt(totalItems)}</h3>
                  <small>Items Sold</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-2">
              <div className="card bg-warning text-white text-center shadow-sm">
                <div className="card-body py-3">
                  <h3 className="mb-0">{formatIndianInt(totalTransactions)}</h3>
                  <small>Transactions</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-2">
              <div className="card bg-info text-white text-center shadow-sm">
                <div className="card-body py-3">
                  <h3 className="mb-0">{formatIndian(avgOrderValue)}</h3>
                  <small>Avg Order Value</small>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-6 mb-3">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-dark text-white">
                  <h5 className="mb-0">Category Breakdown</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr><th>Category</th><th>Items</th><th>Revenue</th><th>Transactions</th></tr>
                      </thead>
                      <tbody>
                        {Object.entries(categoryData).map(([cat, d]) => (
                          <tr key={cat}>
                            <td><strong>{cat}</strong></td>
                            <td>{formatIndianInt(d.items)}</td>
                            <td>{formatIndian(d.revenue)}</td>
                            <td>{formatIndianInt(d.count)}</td>
                          </tr>
                        ))}
                        {Object.keys(categoryData).length === 0 && (
                          <tr><td colSpan="4" className="text-center text-muted">No data</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-dark text-white">
                  <h5 className="mb-0">Payment Methods</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr><th>Method</th><th>Revenue</th><th>%</th></tr>
                      </thead>
                      <tbody>
                        {Object.entries(paymentMethods).map(([pm, rev]) => (
                          <tr key={pm}>
                            <td><span className="badge bg-info">{pm.toUpperCase()}</span></td>
                            <td>{formatIndian(rev)}</td>
                            <td>{totalRevenue > 0 ? ((rev / totalRevenue) * 100).toFixed(1) + '%' : '-'}</td>
                          </tr>
                        ))}
                        {Object.keys(paymentMethods).length === 0 && (
                          <tr><td colSpan="3" className="text-center text-muted">No data</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-6 mb-3">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-dark text-white">
                  <h5 className="mb-0">Top Selling Products</h5>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr><th>#</th><th>Product</th><th>Qty Sold</th><th>Revenue</th></tr>
                      </thead>
                      <tbody>
                        {topProducts.map(([name, d], i) => (
                          <tr key={name}>
                            <td>{i + 1}</td>
                            <td>{name}</td>
                            <td>{formatIndianInt(d.qty)}</td>
                            <td>{formatIndian(d.rev)}</td>
                          </tr>
                        ))}
                        {topProducts.length === 0 && (
                          <tr><td colSpan="4" className="text-center text-muted">No data</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-dark text-white">
                  <h5 className="mb-0">Daily Revenue</h5>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive" style={{ maxHeight: '300px' }}>
                    <table className="table table-sm table-hover mb-0">
                      <thead className="table-light sticky-top">
                        <tr><th>Date</th><th>Revenue</th></tr>
                      </thead>
                      <tbody>
                        {Object.entries(dailyRevenue).sort().reverse().map(([d, rev]) => (
                          <tr key={d}>
                            <td>{d}</td>
                            <td><strong>{formatIndian(rev)}</strong></td>
                          </tr>
                        ))}
                        {Object.keys(dailyRevenue).length === 0 && (
                          <tr><td colSpan="2" className="text-center text-muted">No data</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
