import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ProductCard from '../components/ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
  brand: string;
  condition: string;
}

const CATEGORIES = ['All', 'Screens', 'Batteries', 'Charging Ports', 'Back Covers', 'Cameras', 'Speakers', 'Motherboards', 'Tools'];

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All';

  // Flash Sale countdown timer state (stable ticking timer)
  const [timeLeft, setTimeLeft] = useState(3600 + 23 * 60 + 56); // 1h 23m 56s initial state

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 3600 * 2));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}h : ${mins}m : ${secs}s`;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase.from('products').select('*');
      if (activeCategory !== 'All') {
        query = query.eq('category', activeCategory);
      }
      const { data, error } = await query;
      if (error) console.error(error);
      else setProducts((data as Product[]) || []);
      setLoading(false);
    };
    fetchProducts();
  }, [activeCategory]);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand || '').toLowerCase().includes(search.toLowerCase())
  );

  // Derive flash sale products (e.g. first 6 items)
  const flashSaleProducts = filtered.slice(0, 6);

  return (
    <div className="page page-enter" style={{ background: '#f1f1f2', minHeight: '100vh', paddingTop: '64px' }}>
      
      {/* Search Container */}
      <div className="container" style={{ padding: '0 0.75rem' }}>
        <div className="search-bar-container">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#75757a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-bar-input"
            placeholder="Search spare parts by name or brand..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Chips Scroll */}
      <div className="container" style={{ padding: '0 0.75rem', marginBottom: '1rem' }}>
        <div className="category-chips-container">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`category-chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setSearchParams(cat === 'All' ? {} : { category: cat })}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="container" style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 1.25rem' }} />
          Loading phone parts catalog...
        </div>
      ) : filtered.length === 0 ? (
        <div className="container" style={{ padding: '0 0.75rem' }}>
          <div className="card text-center" style={{ padding: '5rem 0', background: '#ffffff', border: '1px solid #eaeaea' }}>
            <p style={{ color: 'var(--text-muted)' }}>No products found in this category.</p>
          </div>
        </div>
      ) : (
        <div className="container" style={{ padding: '0 0.75rem' }}>
          
          {/* Flash Sales Section (Only display if activeCategory is 'All' and we have products) */}
          {activeCategory === 'All' && flashSaleProducts.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              {/* Red Header Banner */}
              <div className="flash-sales-banner">
                <div className="flash-sales-title">
                  <span>⚡ Flash Sales</span>
                  <span className="flash-sales-timer">{formatTime(timeLeft)}</span>
                </div>
                <a href="#all-products" className="flash-sales-see-all">
                  See All &gt;
                </a>
              </div>
              
              {/* Horizontal Scroll Product List */}
              <div className="flash-sales-container">
                <div className="horizontal-scroll">
                  {flashSaleProducts.map(p => (
                    <div key={`flash-${p.id}`} style={{ width: '130px', flexShrink: 0 }}>
                      <ProductCard {...p} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Standard Catalog Grid */}
          <div id="all-products" style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #eaeaea', padding: '0.75rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, padding: '0.25rem 0 0.75rem', borderBottom: '1px solid #f1f1f2', marginBottom: '0.75rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#313137' }}>
              <span style={{ width: '4px', height: '16px', background: 'var(--primary)', borderRadius: '2px' }}></span>
              Phones & Tablets Catalog
            </h2>
            
            <div className="product-grid" style={{ gap: '0.5rem' }}>
              {filtered.map(p => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer" style={{ background: '#ffffff', borderTop: '1px solid #eaeaea', marginTop: '2rem' }}>
        <p>© {new Date().getFullYear()} Sky Phones. All rights reserved. | Kampala, Uganda</p>
      </footer>
    </div>
  );
};

export default Home;
