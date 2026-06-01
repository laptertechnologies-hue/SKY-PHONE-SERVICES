import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart: React.FC = () => {
  const { state: { items }, dispatch } = useCart();
  const navigate = useNavigate();

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: '8rem', background: '#f1f1f2', minHeight: '100vh' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
        <h2 style={{ marginBottom: '0.5rem', color: '#313137' }}>Your cart is empty</h2>
        <p style={{ color: '#75757a', marginBottom: '1.5rem' }}>
          Browse our catalogue to find spare parts you need.
        </p>
        <Link to="/" className="btn btn-primary" style={{ padding: '0.6rem 2rem' }}>Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="page page-enter" style={{ background: '#f1f1f2', minHeight: '100vh', paddingTop: '72px' }}>
      <div className="container" style={{ padding: '0 0.75rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: '#313137' }}>
          Shopping Cart ({items.reduce((s, i) => s + i.quantity, 0)} Items)
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {items.map(item => (
            <div key={item.id} className="card" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.85rem',
              flexWrap: 'wrap',
              background: '#ffffff',
              border: '1px solid #eaeaea',
              boxShadow: 'none',
              borderRadius: '8px'
            }}>
              <img
                src={item.image_url || 'https://placehold.co/80x80/ffffff/f68b1e?text=?'}
                alt={item.name}
                style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 4, flexShrink: 0, border: '1px solid #f1f1f2' }}
              />
              
              <div style={{ flex: 1, minWidth: 120 }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.2rem', color: '#313137' }}>{item.name}</h3>
                <p style={{ color: '#000000', fontWeight: 700, fontSize: '0.9rem' }}>UGX {item.price.toLocaleString()}</p>
              </div>

              {/* Quantity Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <button
                  className="btn btn-outline"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', borderRadius: '4px' }}
                  onClick={() => dispatch({ type: 'UPDATE_QTY', payload: { id: item.id, quantity: item.quantity - 1 } })}
                >−</button>
                <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#313137' }}>{item.quantity}</span>
                <button
                  className="btn btn-outline"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', borderRadius: '4px' }}
                  onClick={() => dispatch({ type: 'UPDATE_QTY', payload: { id: item.id, quantity: item.quantity + 1 } })}
                >+</button>
              </div>

              {/* Subtotal */}
              <div style={{ minWidth: 100, textAlign: 'right' }}>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#000000' }}>
                  UGX {(item.price * item.quantity).toLocaleString()}
                </p>
              </div>

              {/* Delete Button */}
              <button
                className="btn btn-danger"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px' }}
                onClick={() => dispatch({ type: 'REMOVE', payload: item.id })}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Summary Card */}
        <div className="card" style={{ maxWidth: 400, marginLeft: 'auto', background: '#ffffff', border: '1px solid #eaeaea', boxShadow: 'none', borderRadius: '8px', padding: '1rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.85rem', color: '#313137' }}>Order Summary</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#75757a' }}>
            <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <span style={{ fontWeight: 600, color: '#313137' }}>UGX {total.toLocaleString()}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem', fontSize: '0.85rem', color: '#75757a' }}>
            <span>Delivery</span>
            <span>Calculated at checkout</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.25rem', borderTop: '1px solid #f1f1f2', paddingTop: '0.75rem' }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>UGX {total.toLocaleString()}</span>
          </div>

          <button className="btn btn-primary w-full" style={{ padding: '0.75rem', borderRadius: '6px' }} onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </button>
          <Link to="/" className="btn btn-outline w-full mt-1" style={{ padding: '0.75rem', borderRadius: '6px', justifyContent: 'center' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
