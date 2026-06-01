import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    
    // Redirect immediately to login with success state
    navigate(`/login?registered=true${redirect ? `&redirect=${redirect}` : ''}`);
  };

  return (
    <div className="page page-enter" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f1f1f2', minHeight: '100vh', paddingTop: '80px' }}>
      <div className="card" style={{ width: '100%', maxWidth: 400, background: '#ffffff', border: '1px solid #eaeaea', boxShadow: 'none', borderRadius: '8px', padding: '1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#f68b1e', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            <span>SKY PHONES</span>
            <span style={{ fontSize: '1.2rem', color: '#f68b1e' }}>★</span>
          </Link>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#313137', marginTop: '0.25rem' }}>Create Account</h1>
          <p style={{ color: '#75757a', fontSize: '0.85rem' }}>Join Sky Phones to purchase high quality phone parts</p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="reg-email" style={{ fontSize: '0.75rem' }}>Email address</label>
            <input
              id="reg-email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-pass" style={{ fontSize: '0.75rem' }}>Password</label>
            <input
              id="reg-pass"
              type="password"
              required
              placeholder="At least 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-confirm" style={{ fontSize: '0.75rem' }}>Confirm Password</label>
            <input
              id="reg-confirm"
              type="password"
              required
              placeholder="Repeat password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--danger)', borderRadius: '4px', padding: '0.65rem', color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ justifyContent: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '6px' }}>
            {loading ? <><div className="spinner" style={{ borderTopColor: '#fff' }} /> Creating account…</> : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#75757a', fontSize: '0.85rem' }}>
          Already have an account?{' '}
          <Link to={`/login${redirect ? `?redirect=${redirect}` : ''}`} style={{ fontWeight: 600 }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
