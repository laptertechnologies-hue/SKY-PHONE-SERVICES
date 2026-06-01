import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';
  const registered = searchParams.get('registered') === 'true';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    
    if (redirect === 'cart') {
      navigate('/cart');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="page page-enter" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f1f1f2', minHeight: '100vh', paddingTop: '80px' }}>
      <div className="card" style={{ width: '100%', maxWidth: 400, background: '#ffffff', border: '1px solid #eaeaea', boxShadow: 'none', borderRadius: '8px', padding: '1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#f68b1e', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            <span>SKY PHONES</span>
            <span style={{ fontSize: '1.2rem', color: '#f68b1e' }}>★</span>
          </Link>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#313137', marginTop: '0.25rem' }}>Welcome Back</h1>
          <p style={{ color: '#75757a', fontSize: '0.85rem' }}>Log in to access your Sky Phones account</p>
        </div>

        {registered && (
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid var(--success)', borderRadius: '4px', padding: '0.65rem', color: 'var(--success)', marginBottom: '1.25rem', fontSize: '0.85rem', textAlign: 'center', fontWeight: 500 }}>
            Account created successfully! Please log in below.
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="login-email" style={{ fontSize: '0.75rem' }}>Email address</label>
            <input
              id="login-email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-pass" style={{ fontSize: '0.75rem' }}>Password</label>
            <input
              id="login-pass"
              type="password"
              required
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--danger)', borderRadius: '4px', padding: '0.65rem', color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ justifyContent: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '6px' }}>
            {loading ? <><div className="spinner" style={{ borderTopColor: '#fff' }} /> Signing in…</> : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#75757a', fontSize: '0.85rem' }}>
          Don&apos;t have an account?{' '}
          <Link to={`/register${redirect ? `?redirect=${redirect}` : ''}`} style={{ fontWeight: 600 }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
