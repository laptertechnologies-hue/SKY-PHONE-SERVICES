import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface Order {
  id: string;
  reference: string;
  customer_name: string;
  delivery_address: string;
  phone_number: string;
  items: string;
  total: number;
  status: string;
  transaction_id?: string;
  created_at: string;
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }
        setUser(user);

        const { data: orderData, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(orderData ? (orderData as Order[]) : []);
      } catch (err) {
        console.error('Error fetching user orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '10rem', color: 'var(--text-muted)' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem', borderColor: 'rgba(0,242,254,0.1)', borderTopColor: 'var(--primary)' }} />
        Loading account details...
      </div>
    );
  }

  return (
    <div className="page page-enter">
      <div className="container" style={{ maxWidth: 900 }}>
        {/* Profile Card Summary */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', color: '#ffffff', fontWeight: 800,
          }}>
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--text)' }}>My Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Logged in as: <strong>{user?.email}</strong></p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Account Created: {new Date(user?.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Order History */}
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', color: 'var(--text)' }}>
          My Order History ({orders.length})
        </h2>

        {orders.length === 0 ? (
          <div className="card text-center" style={{ padding: '3.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>No orders placed yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              You haven't ordered any phone spare parts yet. Explore our catalog!
            </p>
            <Link to="/" className="btn btn-primary">
              Browse Spare Parts
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {orders.map(order => {
              const orderItems = JSON.parse(order.items || '[]');
              return (
                <div key={order.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontWeight: 800, color: 'var(--primary)' }}>Ref: {order.reference}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '1rem' }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`badge ${
                      order.status === 'paid' || order.status === 'delivered' ? 'badge-success' :
                      order.status === 'pending' ? 'badge-danger' : 'badge-primary'
                    }`}>{order.status}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'start' }}>
                    <div>
                      {orderItems.map((item: any) => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem', borderBottom: '1px dashed var(--border)', paddingBottom: '0.25rem' }}>
                          <span style={{ color: 'var(--text)' }}>{item.name} <strong style={{ color: 'var(--text-muted)' }}>×{item.quantity}</strong></span>
                          <span style={{ color: 'var(--text)' }}>UGX {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, marginTop: '0.5rem', fontSize: '1rem', color: 'var(--primary)' }}>
                        <span>Total Paid</span>
                        <span>UGX {order.total.toLocaleString()}</span>
                      </div>
                    </div>

                    <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <p style={{ marginBottom: '0.2rem' }}>Deliver to: <strong style={{ color: 'var(--text)' }}>{order.customer_name}</strong></p>
                      <p style={{ marginBottom: '0.2rem' }}>Number: <strong style={{ color: 'var(--text)' }}>{order.phone_number}</strong></p>
                      <p style={{ marginBottom: '0.2rem' }}>Address: <strong style={{ color: 'var(--text)' }}>{order.delivery_address}</strong></p>
                      {order.transaction_id && <p style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.4rem' }}>Payment Txn: {order.transaction_id}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
