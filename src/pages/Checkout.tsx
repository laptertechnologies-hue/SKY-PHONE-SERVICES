import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { initiatePayment, verifyPayment, generateUUID } from '../lib/mazpay';
import { supabase } from '../lib/supabaseClient';

const Checkout: React.FC = () => {
  const { state: { items }, dispatch } = useCart();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'card'>('mobile_money');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [error, setError] = useState('');
  const [paymentStatusText, setPaymentStatusText] = useState('Initiating payment...');

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const normalizePhone = (num: string): string => {
    let clean = num.trim().replace(/[\s-]/g, '');
    if (clean.startsWith('0')) {
      clean = '+256' + clean.slice(1);
    } else if (clean.startsWith('7')) {
      clean = '+256' + clean;
    } else if (clean.startsWith('256')) {
      clean = '+' + clean;
    } else if (!clean.startsWith('+')) {
      clean = '+' + clean;
    }
    return clean;
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setStep('processing');
    setPaymentStatusText('Creating your order...');

    try {
      const reference = generateUUID(); // Must be valid UUID v4
      const { data: { user } } = await supabase.auth.getUser();

      // Format phone number if Mobile Money
      const formattedPhone = paymentMethod === 'mobile_money' ? normalizePhone(phone) : 'Card Payment';

      // Insert Order record first
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          reference,
          user_id: user?.id ?? null,
          customer_name: name,
          delivery_address: address,
          phone_number: formattedPhone,
          items: JSON.stringify(items),
          total,
          status: 'pending',
        })
        .select()
        .single();

      if (orderErr) throw new Error(orderErr.message);

      setPaymentStatusText('Contacting Marz Wallet payment gateway...');

      // Call payment initiation API
      const payment = await initiatePayment(
        total,
        paymentMethod,
        reference,
        paymentMethod === 'mobile_money' ? formattedPhone : undefined
      );

      const txnUuid = payment.data?.transaction?.uuid;
      if (!txnUuid) {
        throw new Error('Payment gateway did not return a transaction identifier.');
      }

      // Update order with transaction uuid for tracking
      await supabase
        .from('orders')
        .update({ transaction_id: txnUuid })
        .eq('id', order.id);

      if (paymentMethod === 'card') {
        const redirectUrl = payment.data?.redirect_url;
        if (!redirectUrl) {
          throw new Error('Card payment initiation succeeded but no redirection link was received.');
        }
        setPaymentStatusText('Redirecting you to secure card checkout...');
        // Clear cart first so user doesn't buy same items twice
        dispatch({ type: 'CLEAR' });
        // Redirect to gateway
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1000);
      } else {
        // Mobile Money: poll status
        setPaymentStatusText('Please approve the USSD prompt on your phone...');
        
        let attempts = 0;
        const maxAttempts = 8; // poll for 40 seconds max

        const pollStatus = async () => {
          try {
            attempts++;
            const verified = await verifyPayment(txnUuid);
            const status = verified.data?.transaction?.status;

            if (status === 'successful' || status === 'completed' || status === 'sandbox') {
              // Update order status in Supabase
              await supabase
                .from('orders')
                .update({ status: 'paid' })
                .eq('id', order.id);

              dispatch({ type: 'CLEAR' });
              setStep('success');
              setLoading(false);
            } else if (status === 'failed' || status === 'cancelled') {
              // Cancel order
              await supabase
                .from('orders')
                .update({ status: 'cancelled' })
                .eq('id', order.id);
              throw new Error('Payment was declined or failed.');
            } else if (attempts < maxAttempts) {
              setPaymentStatusText(`Waiting for prompt authorization... (${attempts}/${maxAttempts})`);
              setTimeout(pollStatus, 5000);
            } else {
              // Timeout: leave order as pending so they can verify later
              dispatch({ type: 'CLEAR' });
              alert('Payment is still processing. You can check status and verify later in your dashboard.');
              navigate('/dashboard');
            }
          } catch (err: any) {
            setError(err.message || 'Verification failed.');
            setStep('form');
            setLoading(false);
          }
        };

        // Start polling
        setTimeout(pollStatus, 3000);
      }

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Order processing failed';
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
          Thank you, {name}! Your mobile money payment was successful and your order is being processed.
          You can track its status in your dashboard.
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
            
            {step === 'processing' ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div className="spinner" style={{ margin: '0 auto 1.5rem', width: '36px', height: '36px' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#313137', marginBottom: '0.5rem' }}>Processing Payment</h3>
                <p style={{ color: '#75757a', fontSize: '0.85rem' }}>{paymentStatusText}</p>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: '#313137' }}>Delivery Details</h2>

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

                {/* Payment Method Tabs */}
                <div style={{ margin: '1.5rem 0 1rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#75757a', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                    Payment Method
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className={`btn ${paymentMethod === 'mobile_money' ? 'btn-primary' : 'btn-outline'}`}
                      style={{ flex: 1, padding: '0.6rem 0.5rem', fontSize: '0.85rem', borderRadius: '6px' }}
                      onClick={() => setPaymentMethod('mobile_money')}
                    >
                      📱 Mobile Money
                    </button>
                    <button
                      type="button"
                      className={`btn ${paymentMethod === 'card' ? 'btn-primary' : 'btn-outline'}`}
                      style={{ flex: 1, padding: '0.6rem 0.5rem', fontSize: '0.85rem', borderRadius: '6px' }}
                      onClick={() => setPaymentMethod('card')}
                    >
                      💳 Credit/Debit Card
                    </button>
                  </div>
                </div>

                {paymentMethod === 'mobile_money' ? (
                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem' }}>MTN / Airtel Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0771234567"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      pattern="[0-9+]{9,15}"
                    />
                    <span style={{ fontSize: '0.75rem', color: '#75757a', marginTop: '0.2rem' }}>
                      Detection will happen automatically based on your digits.
                    </span>
                  </div>
                ) : (
                  <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #eaeaea', marginBottom: '1.25rem' }}>
                    <p style={{ fontSize: '0.8rem', color: '#75757a', margin: 0, lineHeight: 1.5 }}>
                      💳 You will be redirected to the secure card checkout page to complete the payment of <strong>UGX {total.toLocaleString()}</strong>.
                    </p>
                  </div>
                )}

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
                  {paymentMethod === 'mobile_money' 
                    ? `Pay UGX ${total.toLocaleString()} with Mobile Money`
                    : `Proceed to Card Gateway`
                  }
                </button>

                <p style={{ color: '#75757a', fontSize: '0.75rem', marginTop: '0.75rem', textAlign: 'center' }}>
                  🔒 Secured by Marz Wallet Payment Collections UG
                </p>
              </>
            )}
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
