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
    setOpen(false);
    navigate('/');
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    if (!user) {
      navigate('/login');
    } else {
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    if (!user) {
      navigate('/login?redirect=cart');
    } else {
      navigate('/cart');
    }
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: '#ffffff',
      borderBottom: '1px solid #eaeaea',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 1rem',
      justifyContent: 'space-between',
    }}>
      {/* Left side: Hamburger + Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={() => setOpen(prev => !prev)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.4rem',
            color: '#313137',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Toggle Navigation Menu"
        >
          {open ? '✕' : '☰'}
        </button>
        <Link to="/" style={{ textDecoration: 'none', color: '#f68b1e', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '1.25rem', fontWeight: 800 }}>
          <span>SKY PHONES</span>
          <span style={{ fontSize: '0.9rem', color: '#f68b1e' }}>★</span>
        </Link>
      </div>

      {/* Right side: User Profile Icon + Cart Icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* User icon */}
        <a href="#profile" onClick={handleProfileClick} style={{ color: '#313137', textDecoration: 'none', display: 'flex', alignItems: 'center', padding: '4px' }} title="Profile">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </a>

        {/* Cart icon */}
        <a href="#cart" onClick={handleCartClick} style={{ color: '#313137', textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center', padding: '4px' }} title="Cart">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-6px',
              background: '#f68b1e',
              color: '#ffffff',
              borderRadius: '50%',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              minWidth: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
              border: '1.5px solid #ffffff'
            }}>
              {cartCount}
            </span>
          )}
        </a>
      </div>

      {/* Hamburger Dropdown Drawer / Menu */}
      {open && (
        <>
          <div 
            onClick={() => setOpen(false)} 
            style={{
              position: 'fixed',
              top: '56px',
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 999
            }}
          />
          <div style={{
            position: 'absolute',
            top: '56px',
            left: 0,
            width: '260px',
            background: '#ffffff',
            borderRight: '1px solid #eaeaea',
            boxShadow: '2px 4px 10px rgba(0,0,0,0.05)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem 0',
            animation: 'fadeUp 0.2s ease-out'
          }}>
            <Link to="/" onClick={() => setOpen(false)} style={{ display: 'block', padding: '0.75rem 1.5rem', color: '#313137', fontWeight: 600, borderBottom: '1px solid #f5f5f5' }}>
              Home Catalog
            </Link>
            <a href="#cart" onClick={handleCartClick} style={{ display: 'block', padding: '0.75rem 1.5rem', color: '#313137', fontWeight: 600, borderBottom: '1px solid #f5f5f5' }}>
              Cart ({cartCount})
            </a>
            
            {user ? (
              <>
                <div style={{ padding: '0.75rem 1.5rem', color: '#75757a', fontSize: '0.85rem' }}>
                  Logged in as:<br/>
                  <strong style={{ color: '#313137' }}>{user.email}</strong>
                </div>
                {role === 'admin' ? (
                  <Link to="/admin" onClick={() => setOpen(false)} style={{ display: 'block', padding: '0.75rem 1.5rem', color: '#313137', fontWeight: 600, borderBottom: '1px solid #f5f5f5' }}>
                    Admin Panel
                  </Link>
                ) : (
                  <Link to="/dashboard" onClick={() => setOpen(false)} style={{ display: 'block', padding: '0.75rem 1.5rem', color: '#313137', fontWeight: 600, borderBottom: '1px solid #f5f5f5' }}>
                    Customer Dashboard
                  </Link>
                )}
                <div style={{ padding: '1rem 1.5rem' }}>
                  <button onClick={handleLogout} className="btn btn-primary" style={{ width: '100%', padding: '0.5rem 1rem' }}>
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/login" onClick={() => setOpen(false)} className="btn btn-outline" style={{ width: '100%', padding: '0.5rem 1rem' }}>
                  Login
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn btn-primary" style={{ width: '100%', padding: '0.5rem 1rem' }}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;
