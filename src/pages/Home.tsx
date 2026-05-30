import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const categories = [
    { name: 'Screens', icon: '📺', desc: 'LCD & AMOLED displays for all brands' },
    { name: 'Batteries', icon: '🔋', desc: 'OEM and aftermarket batteries' },
    { name: 'Charging Ports', icon: '⚡', desc: 'USB-C, Lightning, Micro-USB' },
    { name: 'Back Covers', icon: '🛡️', desc: 'Glass & plastic back covers' },
    { name: 'Cameras', icon: '📷', desc: 'Front & rear camera modules' },
    { name: 'Speakers', icon: '🔊', desc: 'Earpiece & loudspeakers' },
    { name: 'Motherboards', icon: '🔌', desc: 'PCBs for all phone models' },
    { name: 'Tools', icon: '🔧', desc: 'Repair tools & accessories' },
  ];

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="hero">
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 96,
          height: 96,
          borderRadius: 24,
          background: 'linear-gradient(135deg, #00c6fb, #0072ff)',
          fontSize: '3rem',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 32px rgba(0, 198, 251, 0.4)',
        }}>
          📱
        </div>
        <h1>Sky Phone Services</h1>
        <p>
          Uganda's #1 online store for phone spare parts. Genuine parts, fast delivery,
          secure mobile-money payments via MazPay.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/products" className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '0.8rem 2rem' }}>
            Shop Now
          </Link>
          <Link to="/register" className="btn btn-outline" style={{ fontSize: '1.05rem', padding: '0.8rem 2rem' }}>
            Create Account
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container" style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { icon: '🚚', title: 'Fast Delivery', desc: 'Delivery across all of Uganda' },
            { icon: '💳', title: 'MazPay Payments', desc: 'Pay with MTN or Airtel Money' },
            { icon: '✅', title: 'Genuine Parts', desc: 'Verified quality spare parts' },
            { icon: '🔒', title: 'Secure Shopping', desc: 'Encrypted & safe checkout' },
          ].map(f => (
            <div key={f.title} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container" style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem' }}>Browse Categories</h2>
        <div className="product-grid">
          {categories.map(cat => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{cat.icon}</div>
                <h3 style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.95rem' }}>{cat.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} Sky Phone Services. All rights reserved. | Kampala, Uganda</p>
      </footer>
    </div>
  );
};

export default Home;
