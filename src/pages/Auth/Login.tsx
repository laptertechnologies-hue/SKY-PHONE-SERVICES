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
    <div className="page page-enter" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '4rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#ffffff', marginBottom: '0.75rem',
            boxShadow: '0 3px 10px var(--primary-glow)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--text)' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Log in to Sky Phones</p>
        </div>

        {registered && (
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid var(--success)', borderRadius: 8, padding: '0.65rem', color: 'var(--success)', marginBottom: '1.25rem', fontSize: '0.875rem', textAlign: 'center', fontWeight: 500 }}>
            Account created successfully! Please log in below.
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="login-email">Email address</label>
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
            <label htmlFor="login-pass">Password</label>
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
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--danger)', borderRadius: 8, padding: '0.65rem', color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ justifyContent: 'center', gap: '0.75rem' }}>
            {loading ? <><div className="spinner" style={{ borderTopColor: '#fff' }} /> Signing in…</> : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Don&apos;t have an account?{' '}
          <Link to={`/register${redirect ? `?redirect=${redirect}` : ''}`} style={{ fontWeight: 600 }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
