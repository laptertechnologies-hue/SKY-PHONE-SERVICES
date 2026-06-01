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

      // Poll/verify payment status
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
      <div className="page" style={{ textAlign: 'center', paddingTop: '8rem', background: '#f1f1f2', minHeight: '100vh' }}>
        <h2>Your cart is empty</h2>
        <button className="btn btn-primary mt-2" onClick={() => navigate('/')}>
          Shop Now
        </button>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="page page-enter" style={{ textAlign: 'center', paddingTop: '8rem', background: '#f1f1f2', minHeight: '100vh' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{ marginBottom: '0.5rem', color: '#313137' }}>Order Placed!</h1>
        <p style={{ color: '#75757a', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto' }}>
          Thank you, {name}! Your payment was successful and your order is being processed.
          You will receive a confirmation shortly.
        </p>
        <button className="btn btn-primary" style={{ padding: '0.6rem 2rem' }} onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="page page-enter" style={{ background: '#f1f1f2', minHeight: '100vh', paddingTop: '72px' }}>
      <div className="container" style={{ padding: '0 0.75rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem', color: '#313137' }}>Checkout</h1>

        <div className="grid-2" style={{ alignItems: 'start' }}>
          {/* Form */}
          <form onSubmit={handlePay} className="card" style={{ background: '#ffffff', border: '1px solid #eaeaea', boxShadow: 'none', borderRadius: '8px', padding: '1.25rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: '#313137' }}>Delivery & Payment</h2>

            <div className="form-group">
              <label style={{ fontSize: '0.75rem' }}>Full Name</label>
              <input
                type="text"
                required
                placeholder="Your full name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.75rem' }}>Delivery Address</label>
              <input
                type="text"
                required
                placeholder="e.g. Kampala, Nakasero Rd"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.75rem' }}>Mobile Money Number (MTN / Airtel)</label>
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
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid var(--danger)', borderRadius: '4px', padding: '0.65rem', color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
              style={{ justifyContent: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '6px' }}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Processing payment…
                </>
              ) : (
                `Pay UGX ${total.toLocaleString()} with MazPay`
              )}
            </button>

            <p style={{ color: '#75757a', fontSize: '0.75rem', marginTop: '0.75rem', textAlign: 'center' }}>
              🔒 Secured by MazPay mobile-money payment gateway
            </p>
          </form>

          {/* Order Summary */}
          <div className="card" style={{ background: '#ffffff', border: '1px solid #eaeaea', boxShadow: 'none', borderRadius: '8px', padding: '1.25rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: '#313137' }}>Order Summary</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#313137' }}>{item.name}</p>
                    <p style={{ color: '#75757a', fontSize: '0.8rem' }}>Quantity: {item.quantity}</p>
                  </div>
                  <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#000000', whiteSpace: 'nowrap' }}>
                    UGX {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #f1f1f2', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem' }}>
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
