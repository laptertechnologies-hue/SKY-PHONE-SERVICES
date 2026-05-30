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

const Products: React.FC = () => {
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
    <div className="page page-enter">
      <div className="container">
        <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Phone Spare Parts</h1>

        {/* Search */}
        <div className="form-group" style={{ maxWidth: 400, marginBottom: '1.5rem' }}>
          <input
            type="search"
            placeholder="Search by name or brand…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}
              onClick={() => setSearchParams(cat === 'All' ? {} : { category: cat })}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem', borderColor: 'rgba(0,198,251,0.3)', borderTopColor: '#00c6fb' }} />
            Loading products…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            No products found.
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map(p => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
