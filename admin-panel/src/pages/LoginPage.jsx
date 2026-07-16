import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock } from 'react-icons/fi';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">🌿</div>
          <h2 className="login-brand">Arogya Paadhai</h2>
          <p className="login-subtitle">Admin Login</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          <div className="input-group mb-3">
            <span className="input-group-text"><FiMail /></span>
            <input
              type="email"
              className="form-control"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text"><FiLock /></span>
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 login-btn">Sign In</button>
          <div className="text-center mt-3">
            <a href="#" className="forgot-link" onClick={(e) => { e.preventDefault(); setForgotOpen(true); }}>Forgot password?</a>
          </div>
        </form>
      </div>

      {forgotOpen && <div className="modal-backdrop fade show" onClick={() => setForgotOpen(false)} />}
      <div className={`modal fade ${forgotOpen ? 'show d-block' : ''}`} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Reset Password</h5>
              <button type="button" className="btn-close" onClick={() => setForgotOpen(false)} />
            </div>
            <div className="modal-body">
              <p className="mb-2">Contact the system administrator to reset your password.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setForgotOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
