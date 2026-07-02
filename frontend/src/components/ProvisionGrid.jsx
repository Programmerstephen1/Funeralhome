import React, { useState } from "react";
import { ShieldCheck, ShoppingCart } from "lucide-react";

const provisions = [
  { 
    id: 1, 
    category: "Caskets",
    title: "Classic Wooden Casket", 
    desc: "Elegant wooden finish with premium white interior padding for a dignified rest.",
    price: 45000,
    image_url: "/casket.jpg" // Make sure the photo in your public folder is named casket.jpg
  },
  { 
    id: 2, 
    category: "Wreaths",
    title: "Custom Floral Wreath", 
    desc: "Beautifully arranged heart and cross-shaped fresh floral tributes.",
    price: 8500,
    image_url: "/wreath.jpg" // Make sure the photo in your public folder is named wreath.jpg
  },
  { 
    id: 3, 
    category: "Setup",
    title: "Service Tent & Seating", 
    desc: "Complete outdoor setup including premium white tents, seating, and decor.",
    price: 25000,
    image_url: "/tent.jpg" // Make sure the photo in your public folder is named tent.jpg
  },
];

export default function ProvisionGrid() {
  const [cart, setCart] = useState([]);

  const handleAddToCart = (item) => {
    setCart([...cart, item]);
    alert(`${item.title} added to your booking.`);
  };

  return (
    <section className="bg-[#F8F6F0] py-16 border-t border-[#E8DFD1]">
      <div className="site-container px-4 mx-auto max-w-6xl">
        
        <div className="text-center mb-12">
          <p className="text-sm tracking-[0.28em] uppercase text-[#A8895C] mb-3">
            Classic Provisions
          </p>
          <h2 className="text-4xl font-serif font-semibold text-[#1F2E27] mb-4">
            Curated Memorial Catalog
          </h2>
          <div className="flex items-center justify-center gap-2 text-sm text-emerald-700 bg-emerald-50 w-fit mx-auto px-4 py-2 rounded-full border border-emerald-100">
            <ShieldCheck size={16} />
            <span>100% Secure Checkout via M-Pesa API</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {provisions.map((item) => (
            <div 
              key={item.id} 
              className="bg-white border border-[#E8DFD1] p-6 hover:border-[#A8895C] hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* THE IMAGE FRAME - Now uses actual images with a subtle hover effect */}
              <div className="w-full aspect-square bg-[#F4F1EA] border border-[#E8DFD1] mb-6 relative overflow-hidden flex items-center justify-center">
                <img 
                  src={item.image_url} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback just in case the image name is wrong
                    e.target.src = "https://via.placeholder.com/400x400?text=Photo+Pending";
                  }}
                />
              </div>
              
              <div className="flex-grow text-center">
                <p className="text-xs uppercase tracking-widest text-[#A8895C] mb-2">{item.category}</p>
                <h3 className="text-xl font-serif text-[#1F2E27] mb-3 border-b border-[#E8DFD1] pb-3 mx-4">
                  {item.title}
                </h3>
                <p className="text-sm text-[#3D3530] leading-relaxed mb-6 px-2">
                  {item.desc}
                </p>
              </div>

              <div className="mt-auto flex flex-col items-center gap-4">
                <span className="text-lg font-semibold text-[#1F2E27]">
                  KSh {item.price.toLocaleString()}
                </span>
                
                <button 
                  onClick={() => handleAddToCart(item)}
                  className="w-full py-3 bg-[#1F2E27] text-white text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-[#A8895C] transition-colors"
                >
                  <ShoppingCart size={16} />
                  Add to Booking
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}