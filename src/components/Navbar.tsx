import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useCart } from '../context/CartContext';
import type { User } from '@supabase/supabase-js';

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { state } = useCart();

  const cartCount = state.items.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    const fetchRole = async (userId: string) => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
        setRole(data?.role ?? 'customer');
      } catch (err) {
        console.error('Error fetching role:', err);
        setRole('customer');
      }
    };

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) fetchRole(data.user.id);
      else setRole(null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchRole(session.user.id);
      else setRole(null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={() => setOpen(false)}>
        <span style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#030712',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
          </svg>
        </span>
        <span>Sky Phone Services</span>
      </Link>

      <button
        className="navbar-toggle"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle navigation"
      >
        {open ? '✕' : '☰'}
      </button>

      <ul className={`navbar-links${open ? ' open' : ''}`}>
        <li>
          <Link to="/products" className="btn btn-outline" onClick={() => setOpen(false)}>
            Shop
          </Link>
        </li>
        <li>
          <Link to="/cart" className="btn btn-outline" onClick={() => setOpen(false)}>
            Cart {cartCount > 0 && (
              <span style={{
                background: '#00f2fe',
                color: '#030712',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}>
                {cartCount}
              </span>
            )}
          </Link>
        </li>
        {user ? (
          <>
            {role === 'admin' ? (
              <li>
                <Link to="/admin" className="btn btn-outline" onClick={() => setOpen(false)}>
                  Admin
                </Link>
              </li>
            ) : (
              <li>
                <Link to="/dashboard" className="btn btn-outline" onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
              </li>
            )}
            <li>
              <button className="btn btn-primary" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="btn btn-outline" onClick={() => setOpen(false)}>
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className="btn btn-primary" onClick={() => setOpen(false)}>
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
