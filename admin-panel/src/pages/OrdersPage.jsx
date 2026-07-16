import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API } from '../api';
import { FiPackage, FiCheckCircle, FiClock, FiXCircle, FiChevronDown, FiChevronUp, FiMessageSquare } from 'react-icons/fi';

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
                    <a href={`https://wa.me/${o.phone.replace(/[^0-9]/g, '')}?text=Hi ${o.customer_name}, your order ${o.order_id} is ${o.order_status}.`}
                      target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-success"
                      title="Message customer on WhatsApp">
                      <FiMessageSquare />
                    </a>
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
