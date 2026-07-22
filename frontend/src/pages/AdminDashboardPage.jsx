import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ShoppingBag, CreditCard, DollarSign, Activity, AlertCircle, RefreshCw, Package, ArrowUpRight, Smartphone, Plus, Edit, Trash2, MessageSquare, Send, X, Star, CheckCircle } from "lucide-react";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_users: 0, total_orders: 0, total_revenue: 0, pending_payments: 0 });
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("orders"); // 'orders', 'payments', 'catalog', 'reviews'

  // Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ title: "", desc: "", price: 0, category_id: "casket_list", images: "", discount_percent: 0 });

  // Reply State
  const [replyText, setReplyText] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/login");
      return;
    }
    
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
        throw new Error("Failed to authenticate admin credentials.");
      }

      setStats(await statsRes.json());
      setOrders(await ordersRes.json());
      setPayments(await paymentsRes.json());
      setProducts(await productsRes.json());
      setReviews(await reviewsRes.json());
    } catch (err) { 
      console.error("Admin fetch failed", err);
      setError("Access Denied. You must be an authorized administrator to view this data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [navigate, API_URL]);

  // --- PRODUCT CRUD HANDLERS ---
  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm({ title: "", desc: "", price: 0, category_id: "casket_list", images: "", discount_percent: 0 });
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
      discount_percent: prod.discount_percent || 0
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

  // --- REVIEW REPLY HANDLER ---
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

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl border border-red-200 shadow-xl max-w-md w-full text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-[#1F2E27] mb-2">Security Lock</h2>
          <p className="text-[#716860] mb-6">{error}</p>
          <button onClick={() => navigate("/")} className="bg-[#1F2E27] text-white px-6 py-3 rounded text-sm font-bold uppercase tracking-widest hover:bg-[#A8895C] transition-colors w-full">
            Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] py-12 px-4 sm:px-6 lg:px-8">
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
          {/* Revenue Card */}
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

          {/* Orders Card */}
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

          {/* Users Card */}
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

          {/* Payments Card */}
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
          {["orders", "payments", "catalog", "reviews"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 whitespace-nowrap ${activeTab === tab ? "border-[#A8895C] text-[#1F2E27]" : "border-transparent text-[#8F847C] hover:text-[#1F2E27]"}`}>
              {tab === 'orders' && <span className="flex items-center gap-2"><Package size={16}/> Orders ({orders.length})</span>}
              {tab === 'payments' && <span className="flex items-center gap-2"><Smartphone size={16}/> M-Pesa Gateway</span>}
              {tab === 'catalog' && <span className="flex items-center gap-2"><ShoppingBag size={16}/> Catalog CMS ({products.length})</span>}
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
                          <button onClick={() => handleDeleteProduct(p.id)} className="p-2 bg-red-50 text-red-700 rounded hover:bg-red-100"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CLIENT REVIEWS & REPLIES */}
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
                <div><label className="block text-xs font-bold text-[#716860] uppercase mb-1">Price</label><input type="number" required value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})} className="w-full p-3 border border-[#E8DFD1] rounded text-sm"/></div>
                <div><label className="block text-xs font-bold text-[#716860] uppercase mb-1">Discount (%)</label><input type="number" min="0" max="99" value={productForm.discount_percent} onChange={(e) => setProductForm({...productForm, discount_percent: e.target.value})} className="w-full p-3 border border-[#E8DFD1] rounded text-sm"/></div>
                <div>
                  <label className="block text-xs font-bold text-[#716860] uppercase mb-1">Category</label>
                  <select value={productForm.category_id} onChange={(e) => setProductForm({...productForm, category_id: e.target.value})} className="w-full p-3 border border-[#E8DFD1] rounded text-sm">
                    <option value="casket_list">Caskets</option>
                    <option value="urns">Urns</option>
                    <option value="wreaths">Wreaths</option>
                    <option value="lowering_gears">Lowering Gears</option>
                    <option value="tents">Tents</option>
                    <option value="hearses">Hearses</option>
                    <option value="attire">Attire</option>
                  </select>
                </div>
              </div>
              
              <div><label className="block text-xs font-bold text-[#716860] uppercase mb-1">Description</label><textarea rows="3" required value={productForm.desc} onChange={(e) => setProductForm({...productForm, desc: e.target.value})} className="w-full p-3 border border-[#E8DFD1] rounded text-sm resize-none"></textarea></div>
              <div><label className="block text-xs font-bold text-[#716860] uppercase mb-1">Image URLs (Comma-separated)</label><input type="text" placeholder="/images/caskets/casket1().jpg" value={productForm.images} onChange={(e) => setProductForm({...productForm, images: e.target.value})} className="w-full p-3 border border-[#E8DFD1] rounded text-sm"/></div>
              
              <button type="submit" className="w-full bg-[#1F2E27] text-white py-4 rounded font-bold uppercase tracking-widest hover:bg-[#A8895C] transition-colors mt-4">Save Catalog Item</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}