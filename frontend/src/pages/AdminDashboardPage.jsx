import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ShoppingBag, CreditCard, DollarSign, Activity, AlertCircle, RefreshCw, Package, ArrowUpRight, Smartphone, Plus, Edit, Trash2, MessageSquare, Send, X, Star, CheckCircle, Bookmark } from "lucide-react";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_users: 0, total_orders: 0, total_revenue: 0, pending_payments: 0 });
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  
  const [memorials, setMemorials] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("orders");

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ 
    title: "", desc: "", price: 0, category_id: "casket_list", images: "", discount_percent: 0, has_sizes: false, inclusions: "" 
  });
  const [showSizesModal, setShowSizesModal] = useState(false);
  const [sizesProduct, setSizesProduct] = useState(null);
  const [sizesList, setSizesList] = useState([]);
  const [sizeForm, setSizeForm] = useState({ label: '', price_modifier: 0 });
  const [editingSize, setEditingSize] = useState(null);

  const [replyText, setReplyText] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    
    // Load local memorials
    const localMemorials = JSON.parse(localStorage.getItem("LastPlannerJulz_Memorials") || "{}");
    setMemorials(localMemorials);

    const token = localStorage.getItem("token") || "";
    
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      
      const [statsRes, ordersRes, paymentsRes, productsRes, reviewsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/dashboard-stats`, { headers }),
        fetch(`${API_URL}/api/admin/orders`, { headers }),
        fetch(`${API_URL}/api/admin/payments`, { headers }),
        fetch(`${API_URL}/api/products`),
        fetch(`${API_URL}/api/admin/reviews`, { headers })
      ]);
      
      if (!statsRes.ok || !ordersRes.ok || !paymentsRes.ok) {
        throw new Error("Failed to authenticate or connect to API.");
      }

      setStats(await statsRes.json());
      setOrders(await ordersRes.json());
      setPayments(await paymentsRes.json());
      setProducts(await productsRes.json());
      setReviews(await reviewsRes.json());
      
    } catch (err) { 
      console.error("Database Connection Error:", err);
      setError("Failed to sync with the live database. Please check your connection.");
      // Reset to strict zero values if the connection fails
      setStats({ total_users: 0, total_orders: 0, total_revenue: 0, pending_payments: 0 });
      setOrders([]);
      setPayments([]);
      setProducts([]);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [navigate, API_URL]);

  // --- MEMORIAL MANAGEMENT LOGIC ---
  const handleDeleteMemorial = (idToRemove) => {
    if (!window.confirm(`Are you sure you want to permanently delete the memorial space: "${idToRemove}"?`)) return;
    
    const updatedMemorials = { ...memorials };
    delete updatedMemorials[idToRemove];
    
    localStorage.setItem("LastPlannerJulz_Memorials", JSON.stringify(updatedMemorials));
    setMemorials(updatedMemorials);
  };

  // --- PRODUCT CRUD HANDLERS ---
  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm({ 
      title: "", desc: "", price: 0, category_id: "casket_list", images: "", discount_percent: 0, has_sizes: false, inclusions: "" 
    });
    setShowProductModal(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      title: prod.title,
      desc: prod.desc,
      price: prod.price,
      category_id: prod.categoryId,
      images: prod.images ? prod.images.join(", ") : "",
      discount_percent: prod.discount_percent || 0,
      has_sizes: prod.has_sizes || false,
      inclusions: prod.inclusions ? prod.inclusions.join(", ") : ""
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const imageArray = productForm.images.split(",").map(i => i.trim()).filter(Boolean);
    
    const payload = { 
      ...productForm, 
      price: parseFloat(productForm.price), 
      discount_percent: parseInt(productForm.discount_percent) || 0,
      images: imageArray 
    };

    const url = editingProduct ? `${API_URL}/api/admin/products/${editingProduct.id}` : `${API_URL}/api/admin/products`;
    const method = editingProduct ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowProductModal(false);
        fetchAdminData();
      } else alert("Failed to save product.");
    } catch (err) { alert("Network error saving product."); }
  };

  const handleCategoryChange = (value) => {
    const VEHICLE_REQUIRED = [
      'Auto-lowering gear',
      'Casket gazebo tent',
      'Public system for the grave yard site',
      'Portrait stand',
      'Church trolley',
      'Graveside turf'
    ];

    let inclusions = productForm.inclusions || '';

    if (value === 'hearses' || value === 'hearse' || value === 'vehicles') {
      const existing = new Set((inclusions || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean));
      VEHICLE_REQUIRED.forEach(req => {
        if (!existing.has(req.toLowerCase())) {
          inclusions = inclusions ? `${inclusions}, ${req}` : req;
        }
      });
      setProductForm({ ...productForm, category_id: value, inclusions, has_sound_system: productForm.has_sound_system });
      return;
    }

    if (value === 'media' || value === 'videography') {
      if (!inclusions.toLowerCase().includes('sound')) {
        inclusions = inclusions ? `${inclusions}, Sound systems` : 'Sound systems';
      }
      setProductForm({ ...productForm, category_id: value, inclusions, has_sound_system: true });
      return;
    }

    setProductForm({ ...productForm, category_id: value });
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to remove this product from the live catalog?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchAdminData();
    } catch (err) { alert("Failed to delete product."); }
  };

  // --- SIZES MANAGEMENT HANDLERS ---
  const openSizesModal = async (product) => {
    setSizesProduct(product);
    setShowSizesModal(true);
    setEditingSize(null);
    setSizeForm({ label: '', price_modifier: 0 });

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/products/${product.id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSizesList(data.sizes || []);
    } catch (err) {
      setSizesList(product.sizes || []);
    }
  };

  const handleSaveSize = async () => {
    if (!sizesProduct) return;

    const token = localStorage.getItem('token');
    const payload = { label: sizeForm.label, price_modifier: Number(sizeForm.price_modifier) };

    try {
      let res;
      if (editingSize) {
        res = await fetch(`${API_URL}/api/admin/products/${sizesProduct.id}/sizes/${editingSize.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_URL}/api/admin/products/${sizesProduct.id}/sizes`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setEditingSize(null);
        setSizeForm({ label: '', price_modifier: 0 });
        const detail = await (await fetch(`${API_URL}/api/products/${sizesProduct.id}`)).json();
        setSizesList(detail.sizes || []);
        fetchAdminData();
      } else {
        alert('Failed to save size');
      }
    } catch (err) {
      alert('Network error saving size');
    }
  };

  const handleDeleteSize = async (sizeId) => {
    if (!sizesProduct) return;
    if (!window.confirm('Remove this size option?')) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/admin/products/${sizesProduct.id}/sizes/${sizeId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const detail = await (await fetch(`${API_URL}/api/products/${sizesProduct.id}`)).json();
        setSizesList(detail.sizes || []);
        fetchAdminData();
      } else alert('Failed to delete size');
    } catch (err) { alert('Network error deleting size'); }
  };

  const handleSendReply = async (reviewId) => {
    const text = replyText[reviewId];
    if (!text) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/admin/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ reply: text })
      });
      if (res.ok) {
        setReplyText({ ...replyText, [reviewId]: "" });
        fetchAdminData();
      }
    } catch (err) { alert("Failed to post reply."); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A8895C]"></div>
          <p className="text-[#8F847C] font-semibold uppercase tracking-widest text-sm">Authenticating Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] py-12 px-4 sm:px-6 lg:px-8">
      
      {/* ERROR BANNER */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6 bg-[#FFF4F4] border border-[#FF4747] text-[#FF4747] p-4 rounded-lg shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} />
            <div>
              <p className="font-bold text-sm uppercase tracking-widest">Connection Error</p>
              <p className="text-xs">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-[#A8895C] text-xs font-bold uppercase tracking-[0.2em] mb-2">Enterprise Administration</p>
            <h1 className="text-3xl lg:text-4xl font-serif text-[#1F2E27] flex items-center gap-3">
              <Activity className="text-[#A8895C]"/> System Overview Command
            </h1>
          </div>
          <button onClick={fetchAdminData} className="flex items-center gap-2 bg-white border border-[#E8DFD1] text-[#3D3530] px-4 py-2 rounded shadow-sm hover:border-[#A8895C] transition-colors text-sm font-semibold">
            <RefreshCw size={16} /> Sync Live Data
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl border border-[#E8DFD1] shadow-sm relative overflow-hidden group hover:border-[#A8895C] transition-colors">
            <div className="absolute -right-6 -top-6 text-emerald-50 opacity-50 group-hover:scale-110 transition-transform"><DollarSign size={120}/></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg"><DollarSign size={20}/></div>
                <span className="text-emerald-600 text-xs font-bold flex items-center bg-emerald-50 px-2 py-1 rounded"><ArrowUpRight size={12} className="mr-1"/> Live</span>
              </div>
              <p className="text-xs text-[#8F847C] uppercase font-bold tracking-wider mb-1">Gross Revenue</p>
              <p className="text-3xl font-bold text-[#1F2E27]">KSh {stats.total_revenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E8DFD1] shadow-sm relative overflow-hidden group hover:border-[#A8895C] transition-colors">
            <div className="absolute -right-6 -top-6 text-blue-50 opacity-50 group-hover:scale-110 transition-transform"><ShoppingBag size={120}/></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 text-blue-700 rounded-lg"><ShoppingBag size={20}/></div>
              </div>
              <p className="text-xs text-[#8F847C] uppercase font-bold tracking-wider mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-[#1F2E27]">{stats.total_orders}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E8DFD1] shadow-sm relative overflow-hidden group hover:border-[#A8895C] transition-colors">
            <div className="absolute -right-6 -top-6 text-purple-50 opacity-50 group-hover:scale-110 transition-transform"><Users size={120}/></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 text-purple-700 rounded-lg"><Users size={20}/></div>
              </div>
              <p className="text-xs text-[#8F847C] uppercase font-bold tracking-wider mb-1">Registered Users</p>
              <p className="text-3xl font-bold text-[#1F2E27]">{stats.total_users}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E8DFD1] shadow-sm relative overflow-hidden group hover:border-[#A8895C] transition-colors">
            <div className="absolute -right-6 -top-6 text-orange-50 opacity-50 group-hover:scale-110 transition-transform"><CreditCard size={120}/></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 text-orange-700 rounded-lg"><CreditCard size={20}/></div>
              </div>
              <p className="text-xs text-[#8F847C] uppercase font-bold tracking-wider mb-1">Pending M-Pesa</p>
              <p className="text-3xl font-bold text-[#1F2E27]">{stats.pending_payments}</p>
            </div>
          </div>
        </div>

        {/* Data View Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[#E8DFD1] overflow-x-auto">
          {["orders", "payments", "catalog", "memorials", "reviews"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 whitespace-nowrap ${activeTab === tab ? "border-[#A8895C] text-[#1F2E27]" : "border-transparent text-[#8F847C] hover:text-[#1F2E27]"}`}>
              {tab === 'orders' && <span className="flex items-center gap-2"><Package size={16}/> Orders ({orders.length})</span>}
              {tab === 'payments' && <span className="flex items-center gap-2"><Smartphone size={16}/> M-Pesa Gateway</span>}
              {tab === 'catalog' && <span className="flex items-center gap-2"><ShoppingBag size={16}/> Catalog CMS ({products.length})</span>}
              {tab === 'memorials' && <span className="flex items-center gap-2"><Bookmark size={16}/> Memorial Spaces ({Object.keys(memorials).length})</span>}
              {tab === 'reviews' && <span className="flex items-center gap-2"><MessageSquare size={16}/> Client Reviews ({reviews.length})</span>}
            </button>
          ))}
        </div>

        {/* Data Logs Container */}
        <div className="bg-white border border-[#E8DFD1] rounded-xl shadow-sm overflow-hidden mb-12">
          
          {/* TAB 1: ORDERS */}
          {activeTab === "orders" && (
            <>
              <div className="bg-[#1F2E27] px-8 py-5 text-white flex justify-between items-center">
                <h3 className="font-serif text-xl tracking-wide text-[#A8895C]">Order History</h3>
                <span className="text-xs font-mono bg-black/30 px-3 py-1 rounded border border-[#A8895C]/30">Showing latest {orders.length}</span>
              </div>
              
              {orders.length === 0 ? (
                <div className="p-12 text-center text-[#716860]">
                  <Package size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-serif">No orders processed yet.</p>
                  <p className="text-sm">When customers complete checkout, their logs will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-[#3D3530]">
                    <thead className="bg-[#F8F6F0] border-b border-[#E8DFD1] text-xs uppercase tracking-wider text-[#8F847C]">
                      <tr>
                        <th className="p-5 font-bold">Order ID</th>
                        <th className="p-5 font-bold">Date & Time</th>
                        <th className="p-5 font-bold">Customer Email</th>
                        <th className="p-5 font-bold">Purchased Items</th>
                        <th className="p-5 font-bold text-right">Total Amount</th>
                        <th className="p-5 font-bold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DFD1]">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-[#F8F6F0]/50 transition-colors">
                          <td className="p-5 font-mono text-[#A8895C] font-semibold">ORD-{order.id.toString().padStart(4, '0')}</td>
                          <td className="p-5 text-xs text-[#716860]">{new Date(order.created_at).toLocaleString()}</td>
                          <td className="p-5 font-semibold">{order.user_email}</td>
                          <td className="p-5 text-xs">
                            <ul className="space-y-1">
                              {order.items.map(i => (
                                <li key={i.id} className="flex items-start gap-1">
                                  <span className="text-[#A8895C] font-bold">x{i.quantity}</span> 
                                  <span>{i.product_title}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="p-5 font-bold text-right text-lg">KSh {order.total_amount.toLocaleString()}</td>
                          <td className="p-5 text-center">
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                              order.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-orange-100 text-orange-800 border border-orange-200'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* TAB 2: PAYMENTS */}
          {activeTab === "payments" && (
            <>
              <div className="bg-[#1F2E27] px-8 py-5 text-white flex justify-between items-center">
                <h3 className="font-serif text-xl tracking-wide text-[#A8895C]">Live M-Pesa Gateway Logs</h3>
                <span className="text-xs font-mono bg-black/30 px-3 py-1 rounded border border-[#A8895C]/30">Showing latest {payments.length}</span>
              </div>
              
              {payments.length === 0 ? (
                <div className="p-12 text-center text-[#716860]">
                  <CreditCard size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-serif">No transactions initiated yet.</p>
                  <p className="text-sm">STK push requests will log here in real-time.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-[#3D3530]">
                    <thead className="bg-[#F8F6F0] border-b border-[#E8DFD1] text-xs uppercase tracking-wider text-[#8F847C]">
                      <tr>
                        <th className="p-5 font-bold">Request ID</th>
                        <th className="p-5 font-bold">Date & Time</th>
                        <th className="p-5 font-bold">Contact Info</th>
                        <th className="p-5 font-bold text-right">Amount</th>
                        <th className="p-5 font-bold text-center">Gateway Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DFD1]">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-[#F8F6F0]/50 transition-colors">
                          <td className="p-5 font-mono text-xs text-[#8F847C] w-1/4">
                            <span className="truncate block w-48" title={payment.checkout_request_id}>
                              {payment.checkout_request_id || "N/A"}
                            </span>
                          </td>
                          <td className="p-5 text-xs text-[#716860]">{new Date(payment.created_at).toLocaleString()}</td>
                          <td className="p-5">
                            <div className="font-semibold">{payment.phone}</div>
                            <div className="text-xs text-[#8F847C]">{payment.email || "No email provided"}</div>
                          </td>
                          <td className="p-5 font-bold text-right text-lg">KSh {payment.amount ? payment.amount.toLocaleString() : "0"}</td>
                          <td className="p-5 text-center">
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                              payment.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
                              payment.status === 'failed' ? 'bg-red-100 text-red-800 border border-red-200' :
                              'bg-orange-100 text-orange-800 border border-orange-200'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* TAB 3: CATALOG CMS */}
          {activeTab === "catalog" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-serif text-[#1F2E27]">Inventory Control</h3>
                  <p className="text-xs text-[#8F847C]">Add, modify, or remove catalog items live.</p>
                </div>
                <button onClick={openAddModal} className="bg-[#1F2E27] text-white px-5 py-3 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-[#A8895C] transition-colors"><Plus size={16}/> Add New Product</button>
              </div>

              {products.length === 0 ? (
                <div className="p-12 text-center text-[#716860]">
                  <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-serif">Catalog is currently empty.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded border border-[#E8DFD1]">
                  <table className="w-full text-left text-sm text-[#3D3530]">
                    <thead className="bg-[#F8F6F0] border-b border-[#E8DFD1] text-xs uppercase text-[#8F847C]">
                      <tr><th className="p-4">ID</th><th className="p-4">Title</th><th className="p-4">Category</th><th className="p-4 text-right">Price</th><th className="p-4 text-center">Discount</th><th className="p-4 text-center">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DFD1]">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-[#F8F6F0]/50">
                          <td className="p-4 font-mono text-xs text-[#A8895C]">#{p.id}</td>
                          <td className="p-4 font-semibold">{p.title}</td>
                          <td className="p-4 text-xs uppercase">{p.categoryId}</td>
                          <td className="p-4 font-bold text-right">KSh {p.price.toLocaleString()}</td>
                          <td className="p-4 text-center">
                            {p.discount_percent > 0 ? (
                              <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-1 rounded">{p.discount_percent}% OFF</span>
                            ) : (
                              <span className="text-[#8F847C] text-xs">-</span>
                            )}
                          </td>
                          <td className="p-4 text-center flex justify-center gap-2">
                            <button onClick={() => openEditModal(p)} className="p-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"><Edit size={16}/></button>
                            <button onClick={() => openSizesModal(p)} className="p-2 bg-white border text-[#3D3530] rounded hover:bg-[#F8F6F0]" title="Manage sizes">Sizes</button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="p-2 bg-red-50 text-red-700 rounded hover:bg-red-100"><Trash2 size={16}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MEMORIAL SPACES MANAGEMENT */}
          {activeTab === "memorials" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-serif text-[#1F2E27]">Memorial Hub Access Management</h3>
                  <p className="text-xs text-[#8F847C]">Monitor private family hubs, verify PINs, and manage hosting.</p>
                </div>
              </div>

              {Object.keys(memorials).length === 0 ? (
                <div className="text-center text-[#716860] py-12 bg-[#F8F6F0] rounded border border-dashed border-[#E8DFD1]">
                  <Bookmark size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-serif">No memorial spaces generated.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded border border-[#E8DFD1]">
                  <table className="w-full text-left text-sm text-[#3D3530]">
                    <thead className="bg-[#F8F6F0] border-b border-[#E8DFD1] text-[10px] uppercase text-[#8F847C] font-bold tracking-wider">
                      <tr>
                        <th className="p-4">Memorial ID (URL)</th>
                        <th className="p-4">Honored Name</th>
                        <th className="p-4 text-center">General PIN</th>
                        <th className="p-4 text-center">Nuclear PIN</th>
                        <th className="p-4 text-center">Treasurer M-Pesa No.</th>
                        <th className="p-4 text-center">Hosting Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8DFD1]">
                      {Object.keys(memorials).map((id) => (
                        <tr key={id} className="hover:bg-[#F8F6F0]/50 transition-colors">
                          <td className="p-4 font-mono text-xs text-[#A8895C] font-semibold">{id}</td>
                          <td className="p-4 font-semibold text-[#1F2E27]">{memorials[id].name}</td>
                          <td className="p-4 text-center font-mono tracking-widest">{memorials[id].pin}</td>
                          <td className="p-4 text-center font-mono tracking-widest text-emerald-700">{memorials[id].familyTreePin}</td>
                          <td className="p-4 text-center font-mono">{memorials[id].donationNumber || "Not Set"}</td>
                          <td className="p-4 text-center flex justify-center gap-2">
                            <button onClick={() => window.open(`/memorial/${id}`, "_blank")} className="p-2 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100" title="Visit Live Space"><ArrowUpRight size={16}/></button>
                            <button onClick={() => handleDeleteMemorial(id)} className="p-2 bg-red-50 text-red-700 rounded hover:bg-red-100" title="Revoke Hosting"><Trash2 size={16}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CLIENT REVIEWS & REPLIES */}
          {activeTab === "reviews" && (
            <div className="p-6 bg-[#F8F6F0]">
              <div className="mb-6">
                <h3 className="text-xl font-serif text-[#1F2E27]">Client Feedback & Communication</h3>
                <p className="text-xs text-[#8F847C]">Read client comments and post official merchant replies directly to the product pages.</p>
              </div>

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-center text-[#716860] italic py-8">No reviews have been posted yet.</p>
                ) : (
                  reviews.map(r => (
                    <div key={r.id} className="bg-white p-6 rounded-xl border border-[#E8DFD1] shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-xs font-bold text-[#A8895C] block mb-1">{r.product_title}</span>
                          <span className="font-semibold text-sm text-[#1F2E27]">{r.user_email}</span>
                          {r.is_verified_buyer && <span className="ml-2 text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded"><CheckCircle size={10} className="inline mr-1"/>Verified</span>}
                        </div>
                        <span className="text-xs text-[#8F847C]">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm italic text-[#3D3530] mb-4 bg-[#F8F6F0] p-4 rounded border border-[#E8DFD1]">"{r.comment}"</p>

                      {r.admin_reply ? (
                        <div className="bg-[#1F2E27] text-white p-4 rounded border border-[#A8895C]">
                          <span className="text-xs text-[#A8895C] font-bold uppercase tracking-wider block mb-1">Official Response:</span>
                          <p className="text-sm italic">"{r.admin_reply}"</p>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input type="text" placeholder="Type official response to client..." value={replyText[r.id] || ""} onChange={(e) => setReplyText({ ...replyText, [r.id]: e.target.value })} className="flex-grow p-3 border border-[#E8DFD1] rounded text-sm outline-none focus:border-[#A8895C]"/>
                          <button onClick={() => handleSendReply(r.id)} className="bg-[#A8895C] text-white px-5 py-3 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:bg-[#1F2E27] transition-colors"><Send size={14}/> Reply</button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EDIT/ADD PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 border border-[#E8DFD1] relative">
            <button onClick={() => setShowProductModal(false)} className="absolute top-4 right-4 text-[#8F847C] hover:text-[#1F2E27]"><X size={20}/></button>
            <h3 className="text-2xl font-serif text-[#1F2E27] mb-6">{editingProduct ? "Edit Catalog Item" : "Add New Catalog Item"}</h3>
            
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div><label className="block text-xs font-bold text-[#716860] uppercase mb-1">Title</label><input type="text" required value={productForm.title} onChange={(e) => setProductForm({...productForm, title: e.target.value})} className="w-full p-3 border border-[#E8DFD1] rounded text-sm"/></div>
              
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-xs font-bold text-[#716860] uppercase mb-1">Base Price</label><input type="number" required value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})} className="w-full p-3 border border-[#E8DFD1] rounded text-sm"/></div>
                <div><label className="block text-xs font-bold text-[#716860] uppercase mb-1">Discount (%)</label><input type="number" min="0" max="99" value={productForm.discount_percent} onChange={(e) => setProductForm({...productForm, discount_percent: e.target.value})} className="w-full p-3 border border-[#E8DFD1] rounded text-sm"/></div>
                <div>
                  <label className="block text-xs font-bold text-[#716860] uppercase mb-1">Category</label>
                  <select value={productForm.category_id} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full p-3 border border-[#E8DFD1] rounded text-sm">
                    <option value="casket_list">Caskets</option>
                    <option value="urns">Urns</option>
                    <option value="wreaths">Wreaths</option>
                    <option value="lowering_gears">Lowering Gears</option>
                    <option value="tents">Tents</option>
                    <option value="hearses">Hearses</option>
                    <option value="attire">Attire</option>
                    <option value="media">Media</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#F8F6F0] rounded border border-[#E8DFD1]">
                <input 
                  type="checkbox" 
                  id="has_sizes"
                  checked={productForm.has_sizes} 
                  onChange={(e) => setProductForm({...productForm, has_sizes: e.target.checked})} 
                  className="w-4 h-4 accent-[#1F2E27] cursor-pointer"
                />
                <label htmlFor="has_sizes" className="text-xs font-bold text-[#1F2E27] uppercase tracking-wider cursor-pointer">
                  Enable Casket Sizing Engine (2ft - 12ft options)
                </label>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-[#F8F6F0] rounded border border-[#E8DFD1]">
                <input 
                  type="checkbox" 
                  id="has_sound_system"
                  checked={productForm.has_sound_system} 
                  onChange={(e) => setProductForm({...productForm, has_sound_system: e.target.checked})} 
                  className="w-4 h-4 accent-[#1F2E27] cursor-pointer"
                />
                <label htmlFor="has_sound_system" className="text-xs font-bold text-[#1F2E27] uppercase tracking-wider cursor-pointer">
                  Include Sound Systems / Videography Options
                </label>
              </div>
              
              <div><label className="block text-xs font-bold text-[#716860] uppercase mb-1">Description</label><textarea rows="2" required value={productForm.desc} onChange={(e) => setProductForm({...productForm, desc: e.target.value})} className="w-full p-3 border border-[#E8DFD1] rounded text-sm resize-none"></textarea></div>
              
              <div><label className="block text-xs font-bold text-[#716860] uppercase mb-1">Package Inclusions (Comma-separated)</label><input type="text" placeholder="Auto-lowering gear, Gazebo tent, PA system" value={productForm.inclusions} onChange={(e) => setProductForm({...productForm, inclusions: e.target.value})} className="w-full p-3 border border-[#E8DFD1] rounded text-sm"/></div>

              <div><label className="block text-xs font-bold text-[#716860] uppercase mb-1">Image URLs (Comma-separated)</label><input type="text" placeholder="/images/caskets/casket1().jpg" value={productForm.images} onChange={(e) => setProductForm({...productForm, images: e.target.value})} className="w-full p-3 border border-[#E8DFD1] rounded text-sm"/></div>
              
              <button type="submit" className="w-full bg-[#1F2E27] text-white py-4 rounded font-bold uppercase tracking-widest hover:bg-[#A8895C] transition-colors mt-4">Save Catalog Item</button>
            </form>
          </div>
        </div>
      )}

      {/* SIZES MANAGEMENT MODAL */}
      {showSizesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-[#E8DFD1] relative">
            <button onClick={() => { setShowSizesModal(false); setSizesProduct(null); setSizesList([]); setEditingSize(null); setSizeForm({label:'',price_modifier:0}); }} className="absolute top-4 right-4 text-[#8F847C] hover:text-[#1F2E27]"><X size={20}/></button>
            <h3 className="text-2xl font-serif text-[#1F2E27] mb-4">Manage Sizes for: {sizesProduct?.title}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-bold text-[#716860] mb-2">Existing Sizes</h4>
                <div className="space-y-2">
                  {sizesList.length === 0 ? (
                    <p className="text-sm text-[#716860] italic">No sizes defined for this product.</p>
                  ) : (
                    sizesList.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          {editingSize && editingSize.id === s.id ? (
                            <div className="space-y-1">
                              <input value={sizeForm.label} onChange={(e) => setSizeForm({...sizeForm, label: e.target.value})} className="w-full p-2 border border-[#E8DFD1] rounded text-sm mb-1" />
                              <input type="number" value={sizeForm.price_modifier} onChange={(e) => setSizeForm({...sizeForm, price_modifier: e.target.value})} className="w-full p-2 border border-[#E8DFD1] rounded text-sm" />
                            </div>
                          ) : (
                            <>
                              <div className="font-semibold">{s.label}</div>
                              <div className="text-xs text-[#716860]">Modifier: KSh {Number(s.price_modifier).toLocaleString()}</div>
                            </>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {editingSize && editingSize.id === s.id ? (
                            <>
                              <button onClick={() => handleSaveSize()} className="p-2 bg-emerald-50 text-emerald-700 rounded">Save</button>
                              <button onClick={() => { setEditingSize(null); setSizeForm({label:'', price_modifier:0}); }} className="p-2 bg-gray-50 text-[#3D3530] rounded">Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => { setEditingSize(s); setSizeForm({ label: s.label, price_modifier: s.price_modifier }); }} className="p-2 bg-blue-50 text-blue-700 rounded"><Edit size={14}/></button>
                              <button onClick={() => handleDeleteSize(s.id)} className="p-2 bg-red-50 text-red-700 rounded"><Trash2 size={14}/></button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#716860] mb-2">Add / Edit Size</h4>
                <form onSubmit={(e) => { e.preventDefault(); handleSaveSize(); }} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[#716860] uppercase mb-1 block">Label</label>
                    <input type="text" required value={sizeForm.label} onChange={(e) => setSizeForm({...sizeForm, label: e.target.value})} className="w-full p-3 border border-[#E8DFD1] rounded text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#716860] uppercase mb-1 block">Price Modifier (KSh)</label>
                    <input type="number" required value={sizeForm.price_modifier} onChange={(e) => setSizeForm({...sizeForm, price_modifier: e.target.value})} className="w-full p-3 border border-[#E8DFD1] rounded text-sm" />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-[#1F2E27] text-white py-2 rounded font-bold">{editingSize ? 'Save Changes' : 'Add Size'}</button>
                    <button type="button" onClick={() => { setEditingSize(null); setSizeForm({label:'',price_modifier:0}); }} className="flex-1 border border-[#E8DFD1] py-2 rounded">Clear</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}