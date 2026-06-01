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
      <div style={{ textAlign: 'center', padding: '10rem', color: '#75757a', background: '#f1f1f2', minHeight: '100vh' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem', borderColor: 'rgba(246,139,30,0.1)', borderTopColor: 'var(--primary)' }} />
        Loading account details...
      </div>
    );
  }

  return (
    <div className="page page-enter" style={{ background: '#f1f1f2', minHeight: '100vh', paddingTop: '72px' }}>
      <div className="container" style={{ maxWidth: 900, padding: '0 0.75rem' }}>
        {/* Profile Card Summary */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', background: '#ffffff', border: '1px solid #eaeaea', boxShadow: 'none', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', color: '#ffffff', fontWeight: 800,
          }}>
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', color: '#313137', fontWeight: 700 }}>My Dashboard</h1>
            <p style={{ color: '#75757a', fontSize: '0.85rem' }}>Logged in as: <strong>{user?.email}</strong></p>
            <p style={{ color: '#75757a', fontSize: '0.8rem' }}>Account Created: {new Date(user?.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Order History */}
        <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', borderBottom: '1px solid #eaeaea', paddingBottom: '0.5rem', color: '#313137', fontWeight: 700, textTransform: 'uppercase' }}>
          Order History ({orders.length})
        </h2>

        {orders.length === 0 ? (
          <div className="card text-center" style={{ padding: '3.5rem', background: '#ffffff', border: '1px solid #eaeaea', boxShadow: 'none', borderRadius: '8px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <h3 style={{ marginBottom: '0.5rem', color: '#313137' }}>No orders placed yet</h3>
            <p style={{ color: '#75757a', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              You haven't ordered any phone spare parts yet. Explore our catalog!
            </p>
            <Link to="/" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
              Browse Spare Parts
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {orders.map(order => {
              const orderItems = JSON.parse(order.items || '[]');
              return (
                <div key={order.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#ffffff', border: '1px solid #eaeaea', boxShadow: 'none', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f1f2', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.85rem' }}>Ref: {order.reference}</span>
                      <span style={{ color: '#75757a', fontSize: '0.8rem', marginLeft: '1rem' }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`badge ${
                      order.status === 'paid' || order.status === 'delivered' ? 'badge-success' :
                      order.status === 'pending' ? 'badge-danger' : 'badge-primary'
                    }`} style={{ fontSize: '0.7rem' }}>{order.status}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'start' }}>
                    <div>
                      {orderItems.map((item: any) => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', borderBottom: '1px dashed #f1f1f2', paddingBottom: '0.25rem' }}>
                          <span style={{ color: '#313137' }}>{item.name} <strong style={{ color: '#75757a' }}>×{item.quantity}</strong></span>
                          <span style={{ color: '#000000', fontWeight: 600 }}>UGX {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--primary)' }}>
                        <span>Total Paid</span>
                        <span>UGX {order.total.toLocaleString()}</span>
                      </div>
                    </div>

                    <div style={{ borderLeft: '1px solid #f1f1f2', paddingLeft: '1rem', fontSize: '0.8rem', color: '#75757a' }}>
                      <p style={{ marginBottom: '0.2rem' }}>Deliver to: <strong style={{ color: '#313137' }}>{order.customer_name}</strong></p>
                      <p style={{ marginBottom: '0.2rem' }}>Number: <strong style={{ color: '#313137' }}>{order.phone_number}</strong></p>
                      <p style={{ marginBottom: '0.2rem' }}>Address: <strong style={{ color: '#313137' }}>{order.delivery_address}</strong></p>
                      {order.transaction_id && <p style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.4rem' }}>Txn: {order.transaction_id}</p>}
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
