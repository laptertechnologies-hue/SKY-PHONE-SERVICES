import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useCart } from '../context/CartContext';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
  brand: string;
  model: string;
  condition: string;
  stock: number;
  description: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { dispatch } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) { console.error(error); setLoading(false); return; }
      setProduct(data as Product);
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in or register to add parts to your cart.');
        navigate('/login?redirect=cart');
        return;
      }
      
      dispatch({
        type: 'ADD',
        payload: { id: product.id, name: product.name, price: product.price, image_url: product.image_url, quantity: qty },
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error('Error verifying auth:', err);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '8rem', color: 'var(--text-muted)' }}>
      <div className="spinner" style={{ margin: '0 auto', borderColor: 'rgba(246,139,30,0.1)', borderTopColor: 'var(--primary)' }} />
    </div>
  );

  if (!product) return (
    <div className="page" style={{ textAlign: 'center' }}>
      <h2>Product not found</h2>
      <button className="btn btn-primary mt-2" onClick={() => navigate('/')}>Back to Shop</button>
    </div>
  );

  return (
    <div className="page page-enter">
      <div className="container">
        <button className="btn btn-outline mb-2" onClick={() => navigate(-1)}>← Back</button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Image */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <img
              src={product.image_url || 'https://placehold.co/600x500/ffffff/f68b1e?text=No+Image'}
              alt={product.name}
              style={{ width: '100%', display: 'block', borderRadius: 12 }}
            />
          </div>

          {/* Info */}
          <div>
            <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {product.category && <span className="badge badge-primary">{product.category}</span>}
              {product.condition && <span className="badge badge-success">{product.condition}</span>}
              {product.stock === 0 && <span className="badge badge-danger">Out of Stock</span>}
            </div>

            <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 2rem)', marginBottom: '0.5rem', color: 'var(--text)' }}>{product.name}</h1>
            {product.brand && <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Brand: <strong>{product.brand}</strong></p>}
            {product.model && <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Model: <strong>{product.model}</strong></p>}

            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
              UGX {product.price.toLocaleString()}
            </div>

            {product.description && (
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                {product.description}
              </p>
            )}

            {/* Qty + Add to Cart */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  className="btn btn-outline"
                  style={{ padding: '0.4rem 0.8rem' }}
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                >−</button>
                <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 700 }}>{qty}</span>
                <button
                  className="btn btn-outline"
                  style={{ padding: '0.4rem 0.8rem' }}
                  onClick={() => setQty(q => q + 1)}
                >+</button>
              </div>
              <button
                className="btn className btn-primary"
                style={{ flex: 1 }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {added ? '✓ Added!' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
