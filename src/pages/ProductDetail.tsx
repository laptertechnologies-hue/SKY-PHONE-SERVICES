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
    <div className="page" style={{ textAlign: 'center', background: '#f1f1f2' }}>
      <h2>Product not found</h2>
      <button className="btn btn-primary mt-2" onClick={() => navigate('/')}>Back to Shop</button>
    </div>
  );

  // Generate stable mock discount percent (20% - 39%) based on product id
  const hash = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const discountPercent = (Math.abs(hash) % 20) + 20; 
  const originalPrice = Math.round((product.price / (1 - discountPercent / 100)) / 1000) * 1000;

  return (
    <div className="page page-enter" style={{ background: '#f1f1f2', minHeight: '100vh', paddingTop: '72px' }}>
      <div className="container" style={{ padding: '0 0.75rem' }}>
        <button className="btn btn-outline mb-2" onClick={() => navigate(-1)} style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
          ← Back
        </button>

        <div className="grid-2" style={{ alignItems: 'start' }}>
          {/* Left Column: Image Card */}
          <div className="card" style={{ padding: '1rem', background: '#ffffff', border: '1px solid #eaeaea', borderRadius: '8px', position: 'relative' }}>
            {/* Discount Badge */}
            <div className="badge-discount" style={{ top: '16px', right: '16px' }}>
              -{discountPercent}%
            </div>
            <div style={{ width: '100%', paddingBottom: '100%', position: 'relative', background: '#ffffff' }}>
              <img
                src={product.image_url || 'https://placehold.co/600x500/ffffff/f68b1e?text=No+Image'}
                alt={product.name}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
          </div>

          {/* Right Column: Info & Actions */}
          <div className="card" style={{ padding: '1.25rem', background: '#ffffff', border: '1px solid #eaeaea', borderRadius: '8px' }}>
            <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {product.category && <span className="badge badge-primary">{product.category}</span>}
              {product.condition && <span className="badge badge-success">{product.condition}</span>}
              {product.stock === 0 && <span className="badge badge-danger">Out of Stock</span>}
            </div>

            <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: '#313137', lineHeight: 1.3 }}>
              {product.name}
            </h1>

            {/* Star Rating Reviews (Jumia Style) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
              <span style={{ color: '#f68b1e', fontSize: '1.1rem' }}>★★★★★</span>
              <span style={{ fontSize: '0.85rem', color: '#0072ff' }}>(18 verified reviews)</span>
            </div>

            {product.brand && <p style={{ color: '#75757a', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Brand: <strong style={{ color: '#313137' }}>{product.brand}</strong></p>}
            {product.model && <p style={{ color: '#75757a', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Model: <strong style={{ color: '#313137' }}>{product.model}</strong></p>}

            {/* Price Box */}
            <div style={{ padding: '0.75rem 0', borderTop: '1px solid #f1f1f2', borderBottom: '1px solid #f1f1f2', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#000000' }}>
                  UGX {product.price.toLocaleString()}
                </span>
                <span className="original-price" style={{ fontSize: '1rem' }}>
                  UGX {originalPrice.toLocaleString()}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#f68b1e', background: '#feefde', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, display: 'inline-block', marginTop: '4px' }}>
                Save UGX {(originalPrice - product.price).toLocaleString()}
              </span>
            </div>

            {product.description && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#313137', marginBottom: '0.4rem' }}>Description</h3>
                <p style={{ color: '#75757a', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {product.description}
                </p>
              </div>
            )}

            {/* Qty + Add to Cart */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.9rem', color: '#75757a', fontWeight: 600 }}>Quantity:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <button
                    className="btn btn-outline"
                    style={{ padding: '0.3rem 0.7rem', fontSize: '0.9rem', borderRadius: '4px' }}
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                  >−</button>
                  <span style={{ minWidth: 36, textAlign: 'center', fontWeight: 700, fontSize: '0.95rem' }}>{qty}</span>
                  <button
                    className="btn btn-outline"
                    style={{ padding: '0.3rem 0.7rem', fontSize: '0.9rem', borderRadius: '4px' }}
                    onClick={() => setQty(q => q + 1)}
                  >+</button>
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', borderRadius: '6px' }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {added ? '✓ Added to Cart!' : 'Add to Cart'}
              </button>
            </div>

            {/* Shipping & Delivery Box */}
            <div style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #eaeaea', padding: '0.85rem', marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', color: '#313137' }}>
                Delivery & Returns
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#75757a', margin: '0.2rem 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ color: '#10b981' }}>✓</span> Next day delivery available in Kampala and surrounding areas.
              </p>
              <p style={{ fontSize: '0.75rem', color: '#75757a', margin: '0.2rem 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ color: '#10b981' }}>✓</span> Secure payment and checkout processing via MazPay.
              </p>
              <p style={{ fontSize: '0.75rem', color: '#75757a', margin: '0.2rem 0', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ color: '#10b981' }}>✓</span> 7-day hassle-free replacement warrantee on manufacturing defects.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
