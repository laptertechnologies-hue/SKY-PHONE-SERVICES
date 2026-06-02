import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { verifyPayment } from '../lib/mazpay';

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

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  category: string;
  brand: string;
  model: string;
  condition: string;
  stock: number;
}

const CATEGORIES = ['Screens', 'Batteries', 'Charging Ports', 'Back Covers', 'Cameras', 'Speakers', 'Motherboards', 'Tools'];

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');

  // Product Form State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [condition, setCondition] = useState('New');
  const [stock, setStock] = useState(10);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Authentication check
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error || profile?.role !== 'admin') {
          setIsAdmin(false);
          setAuthLoading(false);
          return;
        }

        setIsAdmin(true);
        setAuthLoading(false);
        fetchData();
      } catch (err) {
        console.error(err);
        setAuthLoading(false);
      }
    };

    checkAdmin();
  }, [navigate]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      // Fetch Orders
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch Products
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      setOrders(orderData ? (orderData as Order[]) : []);
      setProducts(prodData ? (prodData as Product[]) : []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Open form for adding a new product
  const handleAddClick = () => {
    setEditingProduct(null);
    setName('');
    setPrice(0);
    setDescription('');
    setImageUrl('');
    setCategory(CATEGORIES[0]);
    setBrand('');
    setModel('');
    setCondition('New');
    setStock(10);
    setFormError('');
    setFormOpen(true);
  };

  // Open form for editing a product
  const handleEditClick = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setPrice(p.price);
    setDescription(p.description || '');
    setImageUrl(p.image_url || '');
    setCategory(p.category);
    setBrand(p.brand || '');
    setModel(p.model || '');
    setCondition(p.condition || 'New');
    setStock(p.stock || 0);
    setFormError('');
    setFormOpen(true);
  };

  // Delete a product
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  // Submit Product Add/Edit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    const payload = {
      name,
      price: Number(price),
      description,
      image_url: imageUrl,
      category,
      brand,
      model,
      condition,
      stock: Number(stock),
    };

    try {
      if (editingProduct) {
        // Edit existing
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
      }

      setFormOpen(false);
      fetchData(); // Refresh list
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      if (error) throw error;

      setOrders(orders.map(o => (o.id === orderId ? { ...o, status } : o)));
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  // Verify payment status with Marz Wallet
  const handleVerifyPayment = async (orderId: string, txnUuid: string) => {
    try {
      const response = await verifyPayment(txnUuid);
      const marzStatus = response.data?.transaction?.status;
      
      alert(`Marz Wallet Status for this collection: "${marzStatus}"`);

      let updatedStatus = '';
      if (marzStatus === 'successful' || marzStatus === 'completed' || marzStatus === 'sandbox') {
        updatedStatus = 'paid';
      } else if (marzStatus === 'failed' || marzStatus === 'cancelled') {
        updatedStatus = 'cancelled';
      }

      if (updatedStatus) {
        const { error } = await supabase
          .from('orders')
          .update({ status: updatedStatus })
          .eq('id', orderId);
        if (error) throw error;

        setOrders(orders.map(o => (o.id === orderId ? { ...o, status: updatedStatus } : o)));
      }
    } catch (err: any) {
      alert(`Verification failed: ${err.message || 'Unknown network error.'}`);
    }
  };

  if (authLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '10rem', color: 'var(--text-muted)' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem', borderColor: 'rgba(0,242,254,0.1)', borderTopColor: 'var(--primary)' }} />
        Checking Authorization...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="page text-center" style={{ paddingTop: '8rem' }}>
        <div className="card" style={{ maxWidth: 450, margin: '0 auto', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ marginBottom: '1rem', color: 'var(--danger)' }}>Access Denied</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            You do not have administrator permissions to access this page. Please log in with an authorized administrator account.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Dashboard Stats Calculations
  const totalSales = orders
    .filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalProducts = products.length;

  // Get unique customers (unique phone numbers)
  const totalCustomers = new Set(orders.map(o => o.phone_number)).size;

  return (
    <div className="page page-enter">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--text)' }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage store orders, parts inventory, and operations.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-outline" onClick={fetchData} disabled={loadingData}>
              {loadingData ? 'Syncing...' : 'Sync Data'}
            </button>
            {activeTab === 'products' && (
              <button className="btn btn-primary" onClick={handleAddClick}>
                + Add Product
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'Total Revenue', value: `UGX ${totalSales.toLocaleString()}`, color: 'var(--primary)' },
            { label: 'Total Orders', value: orders.length.toString(), color: 'var(--text)' },
            { label: 'Pending Orders', value: pendingOrders.toString(), color: 'var(--danger)' },
            { label: 'Active Customers', value: totalCustomers.toString(), color: 'var(--success)' },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
              <h3 style={{ fontSize: '1.6rem', marginTop: '0.4rem', color: stat.color }}>{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Tabs switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '2rem', gap: '1.5rem' }}>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'orders' ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '1.05rem',
              fontWeight: 700,
              paddingBottom: '0.75rem',
              borderBottom: activeTab === 'orders' ? '3px solid var(--primary)' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
            onClick={() => setActiveTab('orders')}
          >
            Orders ({orders.length})
          </button>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'products' ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '1.05rem',
              fontWeight: 700,
              paddingBottom: '0.75rem',
              borderBottom: activeTab === 'products' ? '3px solid var(--primary)' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
            onClick={() => setActiveTab('products')}
          >
            Products Inventory ({totalProducts})
          </button>
        </div>

        {/* Tab Contents */}
        {loadingData ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            Loading store data...
          </div>
        ) : activeTab === 'orders' ? (
          orders.length === 0 ? (
            <div className="card text-center" style={{ padding: '4rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>No customer orders found in the database.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {orders.map(order => {
                const orderItems = JSON.parse(order.items || '[]');
                return (
                  <div key={order.id} className="card" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem', alignItems: 'start' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <span style={{ fontWeight: 800, color: 'var(--primary)' }}>Ref: {order.reference}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '1rem' }}>
                          {new Date(order.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {order.transaction_id && (order.status === 'pending' || order.status === 'processing') && (
                          <button
                            className="btn btn-outline"
                            type="button"
                            style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.75rem',
                              borderRadius: '4px',
                              background: '#feefde',
                              color: '#f68b1e',
                              borderColor: '#f68b1e',
                              height: '28px',
                              lineHeight: '1',
                              fontWeight: 700,
                            }}
                            onClick={() => handleVerifyPayment(order.id, order.transaction_id!)}
                          >
                            🔍 Verify Payment
                          </button>
                        )}
                        
                        <span className={`badge ${
                          order.status === 'paid' || order.status === 'delivered' ? 'badge-success' :
                          order.status === 'pending' ? 'badge-danger' : 'badge-primary'
                        }`}>{order.status}</span>
                        
                        <select
                          value={order.status}
                          onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                          style={{
                            background: '#ffffff',
                            color: 'var(--text)',
                            border: '1px solid var(--border)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            outline: 'none',
                            height: '28px',
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', flexWrap: 'wrap' }}>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Order Items:</h4>
                        {orderItems.map((item: any) => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem', borderBottom: '1px dashed var(--border)', paddingBottom: '0.25rem' }}>
                            <span>{item.name} <strong style={{ color: 'var(--text-muted)' }}>×{item.quantity}</strong></span>
                            <span>UGX {(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, marginTop: '0.5rem', fontSize: '1rem', color: 'var(--primary)' }}>
                          <span>Total Amount</span>
                          <span>UGX {order.total.toLocaleString()}</span>
                        </div>
                      </div>

                      <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                        <h4 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Customer Details:</h4>
                        <p style={{ marginBottom: '0.25rem' }}>Name: <strong>{order.customer_name}</strong></p>
                        <p style={{ marginBottom: '0.25rem' }}>Phone: <strong>{order.phone_number}</strong></p>
                        <p style={{ marginBottom: '0.25rem' }}>Address: <strong>{order.delivery_address}</strong></p>
                        {order.transaction_id && (
                          <p style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.5rem' }}>
                            Txn ID: {order.transaction_id}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Products Tab */
          <div>
            <div className="product-grid">
              {products.map(p => (
                <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
                  <div style={{ width: '100%', paddingBottom: '70%', position: 'relative', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
                    <img
                      src={p.image_url || 'https://placehold.co/300x200/0a0e1a/00c6fb?text=No+Image'}
                      alt={p.name}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span className="badge badge-primary" style={{ marginBottom: '0.4rem', display: 'inline-block' }}>{p.category}</span>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>{p.name}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>UGX {p.price.toLocaleString()}</span>
                      <span className={`badge ${p.stock > 0 ? 'badge-success' : 'badge-danger'}`}>Stock: {p.stock}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button className="btn btn-outline" style={{ flex: 1, padding: '0.4rem', fontSize: '0.85rem' }} onClick={() => handleEditClick(p)}>
                      Edit
                    </button>
                    <button className="btn btn-danger" style={{ flex: 1, padding: '0.4rem', fontSize: '0.85rem' }} onClick={() => handleDeleteProduct(p.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Modal Form Overlay */}
        {formOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(3, 7, 18, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            overflowY: 'auto',
          }}>
            <form onSubmit={handleFormSubmit} className="card page-enter" style={{ width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--text)' }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
                  onClick={() => setFormOpen(false)}
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid var(--danger)', borderRadius: 8, padding: '0.65rem', color: 'var(--danger)', fontSize: '0.875rem' }}>
                  {formError}
                </div>
              )}

              <div className="form-group">
                <label>Product Name</label>
                <input type="text" required placeholder="e.g. iPhone 13 OLED Screen Replacement" value={name} onChange={e => setName(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Price (UGX)</label>
                  <input type="number" required min="0" placeholder="e.g. 750000" value={price || ''} onChange={e => setPrice(Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label>Stock Count</label>
                  <input type="number" required min="0" placeholder="10" value={stock} onChange={e => setStock(Number(e.target.value))} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Condition</label>
                  <select value={condition} onChange={e => setCondition(e.target.value)}>
                    <option value="New">New</option>
                    <option value="Refurbished">Refurbished</option>
                    <option value="Used">Used</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Brand</label>
                  <input type="text" placeholder="e.g. Apple" value={brand} onChange={e => setBrand(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Model</label>
                  <input type="text" placeholder="e.g. iPhone 13 Pro Max" value={model} onChange={e => setModel(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input type="url" placeholder="https://images.unsplash.com/..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} placeholder="Provide details about the item quality, fitment, or installation suggestions..." value={description} onChange={e => setDescription(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setFormOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
