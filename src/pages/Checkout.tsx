import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { initiatePayment, verifyPayment } from '../lib/mazpay';
import { supabase } from '../lib/supabaseClient';

const Checkout: React.FC = () => {
  const { state: { items }, dispatch } = useCart();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [error, setError] = useState('');

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setStep('processing');

    try {
      const reference = `SPS-${Date.now()}`;

      // Save order to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          reference,
          user_id: user?.id ?? null,
          customer_name: name,
          delivery_address: address,
          phone_number: phone,
          items: JSON.stringify(items),
          total,
          status: 'pending',
        })
        .select()
        .single();

      if (orderErr) throw new Error(orderErr.message);

      // Initiate MazPay payment
      const payment = await initiatePayment(total, phone, reference);

      // Poll/verify payment status (in production, use webhooks)
      let attempts = 0;
      const poll = async () => {
        attempts++;
        const verified = await verifyPayment(payment.transaction_id);

        if (verified.status === 'completed' || verified.status === 'successful') {
          // Update order status in Supabase
          await supabase
            .from('orders')
            .update({ status: 'paid', transaction_id: payment.transaction_id })
            .eq('id', order.id);

          dispatch({ type: 'CLEAR' });
          setStep('success');
          setLoading(false);
        } else if (attempts < 5 && (verified.status === 'pending')) {
          setTimeout(poll, 5000);
        } else {
          throw new Error('Payment not completed. Please try again.');
        }
      };
      await poll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment failed';
      setError(msg);
      setStep('form');
      setLoading(false);
    }
  };

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: '6rem' }}>
        <h2>Your cart is empty</h2>
        <button className="btn btn-primary mt-2" onClick={() => navigate('/')}>
          Shop Now
        </button>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="page page-enter" style={{ textAlign: 'center', paddingTop: '6rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{ marginBottom: '0.5rem' }}>Order Placed!</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Thank you, {name}! Your payment was successful and your order is being processed.
          You will receive a confirmation shortly.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="page page-enter">
      <div className="container">
        <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Checkout</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Form */}
          <form onSubmit={handlePay} className="card">
            <h2 style={{ marginBottom: '1.25rem' }}>Delivery & Payment</h2>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                required
                placeholder="Your full name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Delivery Address</label>
              <input
                type="text"
                required
                placeholder="e.g. Kampala, Nakasero Rd"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Mobile Money Number (MTN / Airtel)</label>
              <input
                type="tel"
                required
                placeholder="e.g. 0771234567"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                pattern="[0-9]{10,13}"
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid var(--danger)', borderRadius: 8, padding: '0.75rem', color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
              style={{ justifyContent: 'center', gap: '0.75rem' }}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Processing…
                </>
              ) : (
                `Pay UGX ${total.toLocaleString()} with MazPay`
              )}
            </button>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.75rem', textAlign: 'center' }}>
              🔒 Secured by MazPay mobile-money payment gateway
            </p>
          </form>

          {/* Order Summary */}
          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Order Summary</h2>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>×{item.quantity}</p>
                </div>
                <p style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>UGX {(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>UGX {total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
