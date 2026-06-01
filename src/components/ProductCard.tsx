import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';

interface Props {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category?: string;
  condition?: string;
}

const ProductCard: React.FC<Props> = ({ id, name, price, image_url, category, condition }) => {
  const { dispatch } = useCart();
  const navigate = useNavigate();

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in or register to add parts to your cart.');
        navigate('/login?redirect=cart');
        return;
      }
      
      dispatch({
        type: 'ADD',
        payload: { id, name, price, image_url, quantity: 1 },
      });
    } catch (err) {
      console.error('Error verifying auth:', err);
    }
  };

  return (
    <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Link to={`/products/${id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
        <div style={{
          width: '100%',
          paddingBottom: '75%',
          position: 'relative',
          borderRadius: 8,
          overflow: 'hidden',
          background: '#f8fafc',
          border: '1px solid var(--border)',
        }}>
          <img
            src={image_url || 'https://placehold.co/300x200/ffffff/f68b1e?text=No+Image'}
            alt={name}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      </Link>

      <div style={{ flex: 1 }}>
        {category && (
          <span className="badge badge-primary" style={{ marginBottom: '0.4rem', display: 'inline-block' }}>
            {category}
          </span>
        )}
        <Link to={`/products/${id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>{name}</h3>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
            UGX {price.toLocaleString()}
          </span>
          {condition && (
            <span className="badge badge-success">{condition}</span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Link to={`/products/${id}`} className="btn btn-outline" style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem' }}>
          View
        </Link>
        <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.85rem', padding: '0.5rem' }} onClick={addToCart}>
          + Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
