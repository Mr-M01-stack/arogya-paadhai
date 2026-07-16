import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API } from '../api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const TABLES = [
  { key: 'stall', label: 'Stall Log' },
  { key: 'sales', label: 'Sales' },
  { key: 'stock', label: 'Stock' },
  { key: 'production', label: 'Production' },
  { key: 'investment', label: 'Investment' },
  { key: 'customers', label: 'Customers' },
  { key: 'enquiries', label: 'Enquiries' },
  { key: 'requests', label: 'Product Requests' },
  { key: 'orders', label: 'Orders' },
  { key: 'climate', label: 'Climate' },
  { key: 'daily_updates', label: 'Daily Updates' },
  { key: 'products', label: 'Products' },
];

export default function ExportPage() {
  const { token } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(weekAgo);
  const [toDate, setToDate] = useState(today);
  const [selected, setSelected] = useState(TABLES.map(t => t.key));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  });

  const toggleAll = (checked) => {
    setSelected(checked ? TABLES.map(t => t.key) : []);
  };

  const toggle = (key) => {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ from: fromDate, to: toDate, tables: selected.join(',') });
      const res = await fetch(`${API}/export?${params}`, { headers: headers() });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Export failed'); }
      return await res.json();
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = async () => {
    const json = await fetchData();
    if (!json) return;
    const wb = XLSX.utils.book_new();
    for (const key of selected) {
      const rows = json.data[key] || [];
      const ws = rows.length > 0 ? XLSX.utils.json_to_sheet(rows) : XLSX.utils.aoa_to_sheet([['No data']]);
      const label = TABLES.find(t => t.key === key)?.label || key;
      XLSX.utils.book_append_sheet(wb, ws, label.slice(0, 31));
    }
    XLSX.writeFile(wb, `export_${fromDate}_to_${toDate}.xlsx`);
  };

  const exportPDF = async () => {
    const json = await fetchData();
    if (!json) return;
    const doc = new jsPDF('landscape');
    doc.setFontSize(16);
    doc.text(`Data Export: ${fromDate} to ${toDate}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

    let y = 34;
    for (const key of selected) {
      const rows = json.data[key] || [];
      if (rows.length === 0) continue;
      const label = TABLES.find(t => t.key === key)?.label || key;
      if (y > 180) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(13);
      doc.text(label, 14, y);
      y += 6;
      const cols = Object.keys(rows[0]);
      const body = rows.map(r => cols.map(c => String(r[c] ?? '')));
      doc.autoTable({
        startY: y,
        head: [cols],
        body,
        styles: { fontSize: 7 },
        margin: { left: 14 },
        tableWidth: 'auto',
      });
      y = doc.lastAutoTable.finalY + 10;
    }
    doc.save(`export_${fromDate}_to_${toDate}.pdf`);
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4"><span className="text-success">📤</span> Export Data</h2>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Date Range</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">From Date</label>
                <input type="date" className="form-control" value={fromDate} onChange={e => setFromDate(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">To Date</label>
                <input type="date" className="form-control" value={toDate} onChange={e => setToDate(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card shadow-sm mt-3">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">Select Tables</h5>
            </div>
            <div className="card-body">
              <div className="form-check mb-2">
                <input className="form-check-input" type="checkbox" id="selectAll" checked={selected.length === TABLES.length} onChange={e => toggleAll(e.target.checked)} />
                <label className="form-check-label fw-bold" htmlFor="selectAll">All Tables</label>
              </div>
              <hr />
              {TABLES.map(t => (
                <div className="form-check" key={t.key}>
                  <input className="form-check-input" type="checkbox" id={`tbl_${t.key}`} checked={selected.includes(t.key)} onChange={() => toggle(t.key)} />
                  <label className="form-check-label" htmlFor={`tbl_${t.key}`}>{t.label}</label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Actions</h5>
              <span className="badge bg-light text-dark">{selected.length} table(s) selected</span>
            </div>
            <div className="card-body text-center py-5">
              {error && <div className="alert alert-danger">{error}</div>}
              <p className="text-muted mb-4">Export all {selected.join(', ')} data from <strong>{fromDate}</strong> to <strong>{toDate}</strong></p>
              <div className="d-flex justify-content-center gap-3">
                <button className="btn btn-success btn-lg px-5" onClick={exportExcel} disabled={loading || selected.length === 0}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                  📊 Export Excel
                </button>
                <button className="btn btn-danger btn-lg px-5" onClick={exportPDF} disabled={loading || selected.length === 0}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                  📄 Export PDF
                </button>
              </div>
              {loading && <div className="mt-3"><div className="spinner-border text-success" /></div>}
            </div>
          </div>

          <div className="card shadow-sm mt-3">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Export Summary</h5>
            </div>
            <div className="card-body">
              <table className="table table-sm mb-0">
                <thead>
                  <tr><th>Table</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {TABLES.map(t => (
                    <tr key={t.key}>
                      <td>{t.label}</td>
                      <td>{selected.includes(t.key) ? <span className="badge bg-success">Selected</span> : <span className="badge bg-secondary">Skipped</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
