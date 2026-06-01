import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart: React.FC = () => {
  const { state: { items }, dispatch } = useCart();
  const navigate = useNavigate();

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: '6rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
        <h2 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Browse our catalogue to find spare parts you need.
        </p>
        <Link to="/" className="btn btn-primary">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="page page-enter">
      <div className="container">
        <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--text)' }}>Shopping Cart</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '2rem' }}>
          {items.map(item => (
            <div key={item.id} className="card" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              flexWrap: 'wrap',
            }}>
              <img
                src={item.image_url || 'https://placehold.co/80x80/ffffff/f68b1e?text=?'}
                alt={item.name}
                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: '1px solid var(--border)' }}
              />
              <div style={{ flex: 1, minWidth: 120 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--text)' }}>{item.name}</h3>
                <p style={{ color: 'var(--primary)', fontWeight: 700 }}>UGX {item.price.toLocaleString()}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  className="btn btn-outline"
                  style={{ padding: '0.3rem 0.65rem' }}
                  onClick={() => dispatch({ type: 'UPDATE_QTY', payload: { id: item.id, quantity: item.quantity - 1 } })}
                >−</button>
                <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 700, color: 'var(--text)' }}>{item.quantity}</span>
                <button
                  className="btn btn-outline"
                  style={{ padding: '0.3rem 0.65rem' }}
                  onClick={() => dispatch({ type: 'UPDATE_QTY', payload: { id: item.id, quantity: item.quantity + 1 } })}
                >+</button>
              </div>
              <p style={{ fontWeight: 700, minWidth: 100, textAlign: 'right', color: 'var(--text)' }}>
                UGX {(item.price * item.quantity).toLocaleString()}
              </p>
              <button
                className="btn btn-danger"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                onClick={() => dispatch({ type: 'REMOVE', payload: item.id })}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card" style={{ maxWidth: 400, marginLeft: 'auto' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Order Summary</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
            <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <span>UGX {total.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <span>Delivery</span>
            <span>Calculated at checkout</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>UGX {total.toLocaleString()}</span>
          </div>
          <button className="btn btn-primary w-full" onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </button>
          <Link to="/" className="btn btn-outline w-full mt-1" style={{ justifyContent: 'center' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
