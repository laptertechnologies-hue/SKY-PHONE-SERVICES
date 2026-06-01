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

  return (
    <div className="page-enter">
      {/* Banner Section */}
      <section className="container" style={{ marginTop: '1rem', marginBottom: '2rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(246, 139, 30, 0.05) 0%, rgba(0, 114, 255, 0.03) 100%)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: 'var(--text)', marginBottom: '0.5rem', fontWeight: 800 }}>
            Sky Phones Catalog
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
            Find and order high-quality phone spare parts in Uganda with secure payment via MazPay.
          </p>
        </div>
      </section>

      {/* Catalog Search & Category Filters */}
      <section className="container" style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Search bar */}
          <div className="form-group" style={{ maxWidth: 450, margin: 0 }}>
            <input
              type="search"
              placeholder="Search spare parts by name or brand..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '0.8rem 1rem' }}
            />
          </div>

          {/* Categories tag filters */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.85rem', padding: '0.45rem 1rem', borderRadius: '20px' }}
                onClick={() => setSearchParams(cat === 'All' ? {} : { category: cat })}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Catalog Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 1.25rem' }} />
            Loading phone parts catalog...
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center" style={{ padding: '5rem 0' }}>
            <p style={{ color: 'var(--text-muted)' }}>No products found in this category.</p>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map(p => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} Sky Phones. All rights reserved. | Kampala, Uganda</p>
      </footer>
    </div>
  );
};

export default Home;
