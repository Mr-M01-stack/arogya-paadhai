import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API } from '../api';
import { FiPackage, FiCheckCircle, FiClock, FiXCircle, FiChevronDown, FiChevronUp, FiMessageSquare, FiPrinter } from 'react-icons/fi';

const STATUS_OPTIONS = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
const PAYMENT_OPTIONS = ['pending', 'confirmed'];

const statusBadge = (s) => {
  const m = { pending: 'warning', confirmed: 'info', preparing: 'primary', ready: 'success', delivered: 'success', cancelled: 'secondary' };
  return `badge bg-${m[s] || 'secondary'}`;
};

export default function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  });

  const fetchOrders = () => {
    setLoading(true);
    const url = statusFilter ? `${API}/orders?status=${statusFilter}` : `${API}/orders`;
    fetch(url, { headers: headers() })
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const updateStatus = async (id, field, value) => {
    await fetch(`${API}/orders/${id}/status`, {
      method: 'PUT', headers: headers(), body: JSON.stringify({ [field]: value }),
    });
    fetchOrders();
  };

  const toggleExpand = (id) => setExpanded(expanded === id ? null : id);

  const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN') : '-';

  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const printBill = (o) => {
    const win = window.open('', '_blank');
    const itemsRows = (o.items || []).map((item, i) => `
      <tr>
        <td style="padding:6px 10px;border:1px solid #ddd;text-align:center">${i + 1}</td>
        <td style="padding:6px 10px;border:1px solid #ddd">${esc(item.name)}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;text-align:center">${item.quantity}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;text-align:right">Rs. ${item.price}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;text-align:right">Rs. ${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    win.document.write(`
      <html>
      <head>
        <title>Bill - ${esc(o.order_id)}</title>
        <style>
          @page { margin: 15mm; }
          body { font-family: 'Courier New', monospace; font-size: 13px; color: #222; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px dashed #333; }
          .header h1 { margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 2px; }
          .header p { margin: 3px 0; font-size: 12px; color: #555; }
          .info-table { width: 100%; margin-bottom: 15px; }
          .info-table td { padding: 2px 5px; font-size: 12px; }
          .info-table td:first-child { font-weight: bold; width: 120px; }
          h3 { font-size: 14px; margin: 15px 0 8px; text-transform: uppercase; border-bottom: 1px solid #333; padding-bottom: 4px; }
          table.items { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          table.items th { background: #f0f0f0; padding: 8px 10px; border: 1px solid #ddd; font-size: 12px; text-transform: uppercase; }
          table.items td { font-size: 12px; }
          .total-row td { font-weight: bold; font-size: 14px; }
          .footer { text-align: center; margin-top: 25px; padding-top: 15px; border-top: 2px dashed #333; font-size: 11px; color: #777; }
          .status-box { text-align: center; margin: 15px 0; padding: 8px; border: 1px solid #333; display: inline-block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Arogya Paadhai</h1>
          <p>Krishnagiri, Tamil Nadu, India</p>
          <p>Phone: +91 82201 28785</p>
        </div>

        <table class="info-table">
          <tr><td>Order ID</td><td>: ${esc(o.order_id)}</td></tr>
          <tr><td>Date</td><td>: ${formatDate(o.created_at)}</td></tr>
          <tr><td>Customer</td><td>: ${esc(o.customer_name)}</td></tr>
          <tr><td>Phone</td><td>: ${esc(o.phone)}</td></tr>
          ${o.address ? `<tr><td>Address</td><td>: ${esc(o.address)}</td></tr>` : ''}
        </table>

        <h3>Order Items</h3>
        <table class="items">
          <thead>
            <tr>
              <th style="width:40px">#</th>
              <th>Item</th>
              <th style="width:60px">Qty</th>
              <th style="width:90px">Rate</th>
              <th style="width:100px">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
            <tr class="total-row">
              <td colspan="4" style="padding:8px 10px;border:1px solid #ddd;text-align:right">Total Amount</td>
              <td style="padding:8px 10px;border:1px solid #ddd;text-align:right">Rs. ${o.total_amount}</td>
            </tr>
          </tbody>
        </table>

        <div style="text-align:center">
          <div class="status-box">Payment: ${esc(o.payment_status.toUpperCase())} | Status: ${esc(o.order_status.toUpperCase())}</div>
        </div>

        ${o.notes ? `<p style="margin-top:10px;font-size:11px"><strong>Notes:</strong> ${esc(o.notes)}</p>` : ''}

        <div class="footer">
          <p>Thank you for choosing Arogya Paadhai!</p>
          <p>This is a computer-generated bill.</p>
        </div>

        <div class="no-print" style="text-align:center;margin-top:20px">
          <button onclick="window.print()" style="padding:10px 30px;font-size:14px;cursor:pointer;background:#2d7a35;color:#fff;border:none;border-radius:6px">Print Bill</button>
          <button onclick="window.close()" style="padding:10px 30px;font-size:14px;cursor:pointer;background:#666;color:#fff;border:none;border-radius:6px;margin-left:10px">Close</button>
        </div>

        <script>window.onafterprint = window.close;</script>
      </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4"><span className="text-success"><FiPackage /></span> Orders</h2>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <button className={`btn btn-sm ${!statusFilter ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setStatusFilter('')}>All</button>
        {STATUS_OPTIONS.map(s => (
          <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setStatusFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-success" /></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td>
                    <button className="btn btn-sm btn-link p-0" onClick={() => toggleExpand(o.id)}>
                      {expanded === o.id ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                  </td>
                  <td><code>{o.order_id}</code></td>
                  <td>{o.customer_name}</td>
                  <td>{o.phone}</td>
                  <td>{(o.items || []).length}</td>
                  <td><strong>Rs.{o.total_amount}</strong></td>
                  <td>
                    <select className="form-select form-select-sm" value={o.payment_status}
                      onChange={e => updateStatus(o.id, 'payment_status', e.target.value)}>
                      {PAYMENT_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td>
                    <select className={`form-select form-select-sm ${statusBadge(o.order_status).replace('badge bg-', 'border-')}`}
                      value={o.order_status}
                      onChange={e => updateStatus(o.id, 'order_status', e.target.value)}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                  <td className="small text-muted">{formatDate(o.created_at)}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-primary" title="Print Bill" onClick={() => printBill(o)}>
                        <FiPrinter />
                      </button>
                      <a href={`https://wa.me/${o.phone.replace(/[^0-9]/g, '')}?text=Hi ${o.customer_name}, your order ${o.order_id} is ${o.order_status}.`}
                        target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-success"
                        title="Message customer on WhatsApp">
                        <FiMessageSquare />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {expanded !== null && (() => {
                const o = orders.find(x => x.id === expanded);
                if (!o) return null;
                return (
                  <tr key={`exp-${o.id}`}>
                    <td colSpan={10} className="bg-light p-3">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <h6 className="fw-bold">Customer Details</h6>
                          <p className="mb-1"><strong>Name:</strong> {o.customer_name}</p>
                          <p className="mb-1"><strong>Phone:</strong> {o.phone}</p>
                          <p className="mb-1"><strong>Address:</strong> {o.address || '-'}</p>
                          <p className="mb-1"><strong>Notes:</strong> {o.notes || '-'}</p>
                        </div>
                        <div className="col-md-6">
                          <h6 className="fw-bold">Items</h6>
                          <table className="table table-sm table-borderless mb-0">
                            <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
                            <tbody>
                              {(o.items || []).map((item, i) => (
                                <tr key={i}>
                                  <td>{item.name}</td>
                                  <td>{item.quantity}</td>
                                  <td>Rs.{item.price}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })()}
              {orders.length === 0 && (
                <tr><td colSpan={10} className="text-center text-muted py-4">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
