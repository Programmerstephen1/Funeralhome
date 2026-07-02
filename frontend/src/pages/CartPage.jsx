import React, { useState, useEffect } from "react";
import { Trash2, Plus, Minus, ShieldCheck, ArrowLeft, ShoppingBag } from "lucide-react";

export default function CartPage({ cart, updateQuantity, removeFromCart }) {
  // State to track which items are checked/selected for checkout
  const [selectedItems, setSelectedItems] = useState([]);

  // When cart changes, default to selecting all items if they aren't already managed
  useEffect(() => {
    setSelectedItems(cart.map(item => item.id));
  }, [cart.length]);

  const toggleSelection = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map(item => item.id));
    }
  };

  const deleteSelected = () => {
    selectedItems.forEach(id => removeFromCart(id));
    setSelectedItems([]);
  };

  // Calculate the total only for checked items
  const subtotal = cart
    .filter(item => selectedItems.includes(item.id))
    .reduce((total, item) => total + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#F8F6F0] flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag size={64} className="text-[#D8CFBC] mb-6" />
        <h2 className="text-3xl font-serif text-[#1F2E27] mb-4">Your Booking Cart is Empty</h2>
        <p className="text-[#3D3530] mb-8 max-w-md">Browse our curated memorial catalog to add caskets, wreaths, and service setups to your arrangement.</p>
        <a href="#catalog" className="bg-[#1F2E27] text-white px-8 py-3 tracking-widest text-sm uppercase hover:bg-[#A8895C] transition-colors">
          Return to Catalog
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] py-12">
      <div className="site-container px-4 mx-auto max-w-5xl">
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif text-[#1F2E27]">Your Booking Summary</h1>
          <a href="#catalog" className="flex items-center gap-2 text-sm text-[#A8895C] hover:text-[#1F2E27] uppercase tracking-wider font-semibold transition-colors">
            <ArrowLeft size={16} /> Continue Browsing
          </a>
        </div>

        {/* Bulk Action Header */}
        <div className="bg-white border border-[#E8DFD1] p-4 flex items-center justify-between mb-4 shadow-sm">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={selectedItems.length === cart.length && cart.length > 0}
              onChange={toggleSelectAll}
              className="w-5 h-5 accent-[#A8895C] cursor-pointer"
            />
            <span className="text-[#1F2E27] font-medium">Select All</span>
          </label>
          
          {selectedItems.length > 0 && (
            <button 
              onClick={deleteSelected}
              className="text-red-700 hover:text-red-900 text-sm flex items-center gap-1 font-medium transition-colors"
            >
              <Trash2 size={16} /> Delete Selected
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex flex-col gap-4 mb-8">
          {cart.map((item) => (
            <div key={item.id} className="bg-white border border-[#E8DFD1] p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm">
              
              {/* Checkbox */}
              <input 
                type="checkbox" 
                checked={selectedItems.includes(item.id)}
                onChange={() => toggleSelection(item.id)}
                className="w-5 h-5 accent-[#A8895C] cursor-pointer mt-2 md:mt-0 flex-shrink-0"
              />

              {/* Image */}
              <div className="w-24 h-24 bg-[#F4F1EA] border border-[#E8DFD1] flex-shrink-0 overflow-hidden">
                <img 
                  src={item.images?.[0] || item.image_url} 
                  alt={item.title} 
                  onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Image" }}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex-grow">
                <p className="text-xs tracking-widest uppercase text-[#A8895C] mb-1">{item.categoryId?.replace("_", " ")}</p>
                <h3 className="text-lg font-serif text-[#1F2E27] mb-2">{item.title}</h3>
                <p className="text-sm text-[#3D3530] line-clamp-2 max-w-md">{item.desc}</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center border border-[#E8DFD1] rounded bg-[#F8F6F0]">
                <button 
                  onClick={() => updateQuantity(item.id, -1)}
                  className="p-2 text-[#3D3530] hover:text-[#1F2E27] hover:bg-[#E8DFD1] transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm font-medium text-[#1F2E27]">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, 1)}
                  className="p-2 text-[#3D3530] hover:text-[#1F2E27] hover:bg-[#E8DFD1] transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Price & Individual Delete */}
              <div className="flex flex-col items-end gap-3 min-w-[120px]">
                <span className="text-lg font-semibold text-[#1F2E27]">
                  KSh {(item.price * item.quantity).toLocaleString()}
                </span>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-sm text-[#3D3530] hover:text-red-700 flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Checkout Summary Footer */}
        <div className="bg-white border border-[#E8DFD1] p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 sticky bottom-4">
          <div className="flex items-center gap-3 text-sm text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
            <ShieldCheck size={18} />
            <span>Secure <b>M-Pesa API</b> Integration</span>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
            <div className="text-right">
              <p className="text-sm text-[#3D3530] uppercase tracking-wider mb-1">Total Amount</p>
              <p className="text-2xl font-serif font-bold text-[#1F2E27]">
                KSh {subtotal.toLocaleString()}
              </p>
            </div>
            
            <button 
              disabled={selectedItems.length === 0}
              onClick={() => window.location.hash = "#checkout"}
              className="w-full md:w-auto px-10 py-4 bg-[#1F2E27] text-white text-sm tracking-widest uppercase hover:bg-[#A8895C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}