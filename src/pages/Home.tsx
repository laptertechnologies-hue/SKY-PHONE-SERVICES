import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const categories = [
    { name: 'Screens', desc: 'LCD & AMOLED displays for all brands' },
    { name: 'Batteries', desc: 'OEM and aftermarket batteries' },
    { name: 'Charging Ports', desc: 'USB-C, Lightning, Micro-USB' },
    { name: 'Back Covers', desc: 'Glass & plastic back covers' },
    { name: 'Cameras', desc: 'Front & rear camera modules' },
    { name: 'Speakers', desc: 'Earpiece & loudspeakers' },
    { name: 'Motherboards', desc: 'PCBs for all phone models' },
    { name: 'Tools', desc: 'Repair tools & accessories' },
  ];

  const renderCategoryIcon = (name: string) => {
    switch (name) {
      case 'Screens':
        return (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
          </svg>
        );
      case 'Batteries':
        return (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="16" height="10" rx="2" ry="2" />
            <line x1="22" y1="11" x2="22" y2="13" />
            <line x1="6" y1="10" x2="6" y2="14" strokeWidth="2" />
            <line x1="10" y1="10" x2="10" y2="14" strokeWidth="2" />
            <line x1="14" y1="10" x2="14" y2="14" strokeWidth="2" />
          </svg>
        );
      case 'Charging Ports':
        return (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        );
      case 'Back Covers':
        return (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="3" width="14" height="18" rx="2" />
            <circle cx="9" cy="7" r="1.5" />
            <circle cx="15" cy="7" r="1.5" />
            <rect x="8" y="12" width="8" height="5" rx="1" />
          </svg>
        );
      case 'Cameras':
        return (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        );
      case 'Speakers':
        return (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        );
      case 'Motherboards':
        return (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <rect x="9" y="9" width="6" height="6" rx="1" />
            <line x1="9" y1="1" x2="9" y2="4" />
            <line x1="15" y1="1" x2="15" y2="4" />
            <line x1="9" y1="20" x2="9" y2="23" />
            <line x1="15" y1="20" x2="15" y2="23" />
            <line x1="20" y1="9" x2="23" y2="9" />
            <line x1="20" y1="15" x2="23" y2="15" />
          </svg>
        );
      case 'Tools':
        return (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        );
      default:
        return (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
    }
  };

  const renderFeatureIcon = (title: string) => {
    switch (title) {
      case 'Fast Delivery':
        return (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        );
      case 'MazPay Payments':
        return (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
            <line x1="7" y1="15" x2="11" y2="15" />
          </svg>
        );
      case 'Genuine Parts':
        return (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 11l2 2 4-4" />
          </svg>
        );
      case 'Secure Shopping':
        return (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        );
      default:
        return null;
    }
  };

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
          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
          color: '#030712',
          fontSize: '3rem',
          marginBottom: '2rem',
          boxShadow: '0 0 40px rgba(0, 242, 254, 0.35)',
          border: '1.5px solid rgba(255,255,255,0.2)',
        }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
          </svg>
        </div>
        <h1>Sky Phone Services</h1>
        <p>
          Uganda's #1 online store for premium phone spare parts. Genuine parts, lightning-fast delivery,
          and secure mobile-money payments powered by MazPay.
        </p>
        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/products" className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '0.85rem 2.25rem' }}>
            Shop Catalog
          </Link>
          <Link to="/register" className="btn btn-outline" style={{ fontSize: '1.05rem', padding: '0.85rem 2.25rem' }}>
            Register Now
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container" style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {[
            { title: 'Fast Delivery', desc: 'Express dispatch and delivery across all of Uganda' },
            { title: 'MazPay Payments', desc: 'Secure checkout with MTN or Airtel Mobile Money' },
            { title: 'Genuine Parts', desc: 'Fully verified high-quality replacement parts' },
            { title: 'Secure Shopping', desc: '100% encrypted customer & transaction checkouts' },
          ].map(f => (
            <div key={f.title} className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="feature-icon-wrapper">
                {renderFeatureIcon(f.title)}
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.1rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container" style={{ marginBottom: '5rem' }}>
        <h2 style={{ marginBottom: '2rem', fontSize: '1.8rem', textAlign: 'center' }}>
          Browse Spare Parts Categories
        </h2>
        <div className="product-grid">
          {categories.map(cat => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="card" style={{ textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'center' }}>
                <div className="feature-icon-wrapper" style={{ background: 'rgba(0, 242, 254, 0.05)', border: '1px solid rgba(0, 242, 254, 0.1)' }}>
                  {renderCategoryIcon(cat.name)}
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.4rem', fontSize: '1.05rem', color: '#fff' }}>{cat.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>{cat.desc}</p>
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
