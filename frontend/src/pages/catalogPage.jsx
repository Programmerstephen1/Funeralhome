import React, { useState, useEffect } from "react";
import { ShieldCheck, ShoppingCart, Check, ChevronLeft, ChevronRight, X, Calendar, MapPin, Clock } from "lucide-react";

// --- 1. The Categories & Sub-Categories ---
const categories = [
  { 
    id: "caskets", 
    title: "Caskets & Urns", 
    desc: "A carefully curated selection of premium quality caskets and resting vessels.", 
    images: ["/images/caskets/casket3.jpeg"] 
  },
  { 
    id: "wreaths", 
    title: "Floral Wreaths", 
    desc: "Beautifully arranged fresh floral tributes to honor your loved one.", 
    images: ["/images/wreaths/wreath1.jpeg"] 
  },
  { 
    id: "setup", 
    title: "Service Setup", 
    desc: "Complete outdoor setup including premium tents, lowering gears, and decor.", 
    images: [
      "/images/tents/tent3.jpeg", 
      "/images/lowering-gears/setup10.jpeg"
    ],
    subcategories: [
      { 
        id: "lowering_gears", 
        title: "Lowering Gear", 
        desc: "Professional metal lowering gear and graveside decor.", 
        images: ["/images/lowering-gears/setup11.jpeg"] 
      },
      { 
        id: "tents", 
        title: "Tents", 
        desc: "High-quality marquees, seating, and outdoor decor.", 
        images: ["/images/tents/tent3.jpeg"] 
      }
    ]
  },
  { 
    id: "hearses", 
    title: "Hearses & Transport", 
    desc: "Dignified hearse and fleet services for a peaceful journey.", 
    images: ["/images/hearses/hearse1(0).jpeg"] 
  },
];

// --- 2. The Products ---
const products = [
  // ==========================================
  // --- CASKETS ---
  // ==========================================
  { id: 101, categoryId: "caskets", title: "Premium Mahogany Casket", desc: "Elegant reddish-brown mahogany finish with premium white interior padding and brass handles.", price: 85000, images: ["/images/caskets/casket3.jpeg", "/images/caskets/casket4.jpeg", "/images/caskets/casket7 (1).jpeg", "/images/caskets/casket7 (2).jpeg", "/images/caskets/casket7 (5).jpeg", "/images/caskets/casket7 (6).jpeg", "/images/caskets/casket8.jpeg"] },
  { id: 102, categoryId: "caskets", title: "Pearl White Casket", desc: "Glossy pure white finish with silver hardware and pristine white interior.", price: 75000, images: ["/images/caskets/casket10.jpeg", "/images/caskets/casket10(1).jpeg", "/images/caskets/casket7 (8).jpeg", "/images/caskets/casket12.jpeg"] },
  { id: 103, categoryId: "caskets", title: "Classic Light Oak Casket", desc: "Traditional light oak wood build with polished silver handles.", price: 65000, images: ["/images/caskets/casket17.jpeg", "/images/caskets/casket16.jpeg", "/images/caskets/casket7 (4).jpeg", "/images/caskets/casket5.jpeg"] },
  { id: 104, categoryId: "caskets", title: "Executive Dark Wood Casket", desc: "Sophisticated deep dark brown/black finish for a dignified rest.", price: 90000, images: ["/images/caskets/casket.jpeg", "/images/caskets/casket7 (10).jpeg", "/images/caskets/casket7 (9).jpeg", "/images/caskets/casket11.jpeg", "/images/caskets/casket14.jpeg", "/images/caskets/casket15.jpeg"] },
  { id: 105, categoryId: "caskets", title: "Standard Hardwood Casket", desc: "Classic mid-tone wood finish with elegant blue and white interior padding.", price: 45000, images: ["/images/caskets/casket2.jpeg"] },
  { id: 106, categoryId: "caskets", title: "Brushed Bronze Metal Casket", desc: "Premium metal construction with a brushed bronze and gold finish.", price: 120000, images: ["/images/caskets/casket6.jpeg"] },
  { id: 107, categoryId: "caskets", title: "Silver Steel Casket", desc: "Durable metal construction with a sleek silver finish.", price: 110000, images: ["/images/caskets/casket7 (7).jpeg"] },

  // ==========================================
  // --- WREATHS ---
  // ==========================================
  { id: 201, categoryId: "wreaths", title: "Classic Heart Wreaths", desc: "Elegant heart-shaped floral displays.", price: 8500, images: ["/images/wreaths/wreath1.jpeg", "/images/wreaths/wreath9.jpeg"] },
  { id: 202, categoryId: "wreaths", title: "Deep Red Heart Wreath", desc: "Stunning full red rose heart arrangement.", price: 10000, images: ["/images/wreaths/wreath21.jpeg"] },
  { id: 203, categoryId: "wreaths", title: "Broken Heart Tribute", desc: "Symbolic broken heart floral arrangement in red and white.", price: 12000, images: ["/images/wreaths/wreath23.jpeg"] },
  { id: 204, categoryId: "wreaths", title: "Custom Lettering Heart", desc: "Heart wreath with custom ribbon (e.g., 'MY LOVE').", price: 11500, images: ["/images/wreaths/wreath17.jpeg"] },
  { id: 205, categoryId: "wreaths", title: "Standing Heart Tribute", desc: "Elevated heart-shaped floral display on a stand.", price: 15000, images: ["/images/wreaths/wreath5.jpeg"] },
  { id: 206, categoryId: "wreaths", title: "Pure White Cross Wreath", desc: "Traditional cross arrangement with white blooms.", price: 9500, images: ["/images/wreaths/wreath13.jpeg", "/images/wreaths/wreath26.jpeg"] },
  { id: 207, categoryId: "wreaths", title: "Cross & Heart Combo Set", desc: "A beautifully matched set featuring a cross and dual hearts.", price: 22000, images: ["/images/wreaths/wreath10.jpeg", "/images/wreaths/wreath14.jpeg"] },
  { id: 208, categoryId: "wreaths", title: "Pristine White Round Wreath", desc: "Classic circular arrangement in pure white.", price: 7000, images: ["/images/wreaths/wreath2.jpeg", "/images/wreaths/wreath4.jpeg", "/images/wreaths/wreath11.jpeg", "/images/wreaths/wreath20.jpeg"] },
  { id: 209, categoryId: "wreaths", title: "Sunshine Mix Round Wreath", desc: "Vibrant yellow and white circular floral tribute.", price: 7500, images: ["/images/wreaths/wreath8.jpeg"] },
  { id: 210, categoryId: "wreaths", title: "Red & White Accent Wreath", desc: "White base with striking red floral accents.", price: 8000, images: ["/images/wreaths/wreath7.jpeg", "/images/wreaths/wreath22.jpeg"] },
  { id: 211, categoryId: "wreaths", title: "Custom Text Round Wreath", desc: "Round wreath tailored with a name or title.", price: 9000, images: ["/images/wreaths/wreath15.jpeg"] },
  { id: 212, categoryId: "wreaths", title: "Casket Floral Spray", desc: "Luxurious floral blanket designed to rest atop the casket.", price: 18000, images: ["/images/wreaths/wreath18.jpeg", "/images/wreaths/wreath24.jpeg"] },
  { id: 213, categoryId: "wreaths", title: "Hanging Floral Chandelier", desc: "Unique suspended floral arrangement.", price: 25000, images: ["/images/wreaths/wreath6.jpeg"] },
  { id: 214, categoryId: "wreaths", title: "Dome Pedestal Arrangement", desc: "Elegant dome-shaped floral display.", price: 14000, images: ["/images/wreaths/wreath3.jpeg"] },

  // ==========================================
  // --- LOWERING GEARS ---
  // ==========================================
  { id: 301, categoryId: "lowering_gears", title: "Standard Lowering Device", desc: "Heavy-duty metal lowering gear mechanism with sturdy green straps.", price: 15000, images: ["/images/lowering-gears/setup1.jpeg", "/images/lowering-gears/setup3.jpeg", "/images/lowering-gears/setup5.jpeg"] },
  { id: 302, categoryId: "lowering_gears", title: "Graveside AstroTurf Setup", desc: "Lowering gear accompanied by premium artificial grass for a clean, dignified graveside.", price: 20000, images: ["/images/lowering-gears/setup.jpeg", "/images/lowering-gears/setup2.jpeg"] },
  { id: 303, categoryId: "lowering_gears", title: "Executive Placement Setup", desc: "Complete elegant lowering service setup, tested for stability and grace.", price: 25000, images: ["/images/lowering-gears/setup11.jpeg", "/images/lowering-gears/setup10.jpeg"] },

  // ==========================================
  // --- TENTS ---
  // ==========================================
  { id: 304, categoryId: "tents", title: "Standard Pagoda Tent", desc: "High-peak white tents ideal for family seating and medium-sized gatherings.", price: 10000, images: ["/images/tents/tent1.jpeg", "/images/tents/tent2.jpeg"] },
  { id: 305, categoryId: "tents", title: "Premium Marquee Tent", desc: "Spacious clear-span marquee tent for large gatherings and VIP seating.", price: 50000, images: ["/images/tents/tent3.jpeg"] },
  { id: 306, categoryId: "tents", title: "Graveside Red Carpet Setup", desc: "Specialized tent placement at the gravesite featuring a dignified red carpet walkway.", price: 15000, images: ["/images/tents/tent4.jpeg"] },
  { id: 307, categoryId: "tents", title: "Basic Gazebo Shade", desc: "Simple green pop-up tent for utility, overflow, or minimal shade needs.", price: 5000, images: ["/images/tents/tent5.jpeg"] },

  // ==========================================
  // --- HEARSES ---
  // ==========================================
  { id: 401, categoryId: "hearses", title: "Mercedes Executive Hearse", desc: "Dignified Mercedes-Benz transport.", price: 25000, images: ["/images/hearses/hearse1(0).jpeg", "/images/hearses/hearse1(1).jpeg", "/images/hearses/hearse1(2).jpeg", "/images/hearses/hearse1(3).jpeg"] },
  { id: 402, categoryId: "hearses", title: "Classic Van Hearse", desc: "Spacious and elegant van transport.", price: 15000, images: ["/images/hearses/hearse2(0).jpeg", "/images/hearses/hearse2(1).jpeg", "/images/hearses/hearse2(3).jpeg"] },
  { id: 403, categoryId: "hearses", title: "Executive Bus", desc: "Luxury bus for family transport.", price: 35000, images: ["/images/hearses/hearse3(0).jpeg", "/images/hearses/hearse3(1).jpeg", "/images/hearses/hearse3(2).jpeg"] },
];

// --- REUSABLE COMPONENT: Automatic Image Slider ---
const ImageSlider = ({ images, altText, aspectClass }) => {
  const [imgIndex, setImgIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const nextImg = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImg = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className={`w-full ${aspectClass} bg-[#F4F1EA] border-b border-[#E8DFD1] overflow-hidden relative group/slider`}>
      <img 
        src={images[imgIndex]} 
        alt={altText}
        onError={(e) => { e.target.src = "https://via.placeholder.com/400x400?text=Photo+Pending" }} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      
      {images.length > 1 && (
        <>
          <button 
            onClick={prevImg}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full text-[#1F2E27] hover:bg-[#A8895C] hover:text-white opacity-0 group-hover/slider:opacity-100 transition-all z-10"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={nextImg}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full text-[#1F2E27] hover:bg-[#A8895C] hover:text-white opacity-0 group-hover/slider:opacity-100 transition-all z-10"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 left-0 w-full flex justify-center gap-1.5 z-10">
            {images.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all ${idx === imgIndex ? "bg-[#A8895C] w-4" : "bg-white/60 w-1.5"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// --- COMPONENT: Category / Sub-Category Card (No Prices) ---
const CategoryCard = ({ item, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-white border border-[#E8DFD1] hover:border-[#A8895C] hover:shadow-xl transition-all duration-300 flex flex-col text-left group overflow-hidden w-full"
  >
    <ImageSlider images={item.images} altText={item.title} aspectClass="aspect-[4/3]" />
    <div className="p-6 flex-grow flex flex-col w-full">
      <h3 className="text-xl font-serif text-[#1F2E27] mb-3 group-hover:text-[#A8895C] transition-colors">
        {item.title}
      </h3>
      <p className="text-sm text-[#3D3530] leading-relaxed mb-6">
        {item.desc}
      </p>
      <span className="mt-auto text-xs uppercase tracking-widest text-[#1F2E27] font-semibold border-b border-[#1F2E27] pb-1 w-fit group-hover:border-[#A8895C] group-hover:text-[#A8895C] transition-colors">
        View Collection
      </span>
    </div>
  </button>
);

// --- COMPONENT: Product Card (Shows Prices and Add to Cart) ---
const ProductCard = ({ item, recentlyAdded, onAddToCart, onOpenRentalModal }) => (
  <div className="bg-white border border-[#E8DFD1] hover:border-[#A8895C] hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden">
    <ImageSlider images={item.images} altText={item.title} aspectClass="aspect-square" />
    <div className="p-6 flex-grow flex flex-col text-center">
      <h3 className="text-xl font-serif text-[#1F2E27] mb-3 border-b border-[#E8DFD1] pb-3 mx-4">
        {item.title}
      </h3>
      <p className="text-sm text-[#3D3530] leading-relaxed mb-6 px-2">
        {item.desc}
      </p>
      <div className="mt-auto flex flex-col items-center gap-4">
        <span className="text-lg font-semibold text-[#1F2E27]">
          KSh {item.price.toLocaleString()}
        </span>
        <button 
          onClick={() => {
            if (item.categoryId === "hearses") {
              onOpenRentalModal(item);
            } else {
              onAddToCart(item);
            }
          }}
          disabled={recentlyAdded === item.id}
          className={`w-full py-3 text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-300 ${
            recentlyAdded === item.id 
              ? "bg-emerald-700 text-white" 
              : "bg-[#1F2E27] text-white hover:bg-[#A8895C]"
          }`}
        >
          {recentlyAdded === item.id ? (
            <><Check size={16} /> Added</>
          ) : (
            item.categoryId === "hearses" ? (
              "Schedule Hearse"
            ) : (
              <><ShoppingCart size={16} /> Add to Booking</>
            )
          )}
        </button>
      </div>
    </div>
  </div>
);

// --- MAIN PAGE ---
// PRO-GRADE FIX: Accept the `dynamicId` prop from the routing engine
export default function CatalogPage({ dynamicId, cart, addToCart, bookRental }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubCategory, setActiveSubCategory] = useState(null);
  const [recentlyAdded, setRecentlyAdded] = useState(null);

  const [showRentalModal, setShowRentalModal] = useState(false);
  const [selectedHearse, setSelectedHearse] = useState(null);
  const [rentalDetails, setRentalDetails] = useState({ pickup: "", dropoff: "", date: "", time: "" });

  // PRO-GRADE FIX: Robust Deep-Link Listener
  useEffect(() => {
    if (dynamicId) {
      // 1. Check if the URL hash matches a main category (like "hearses" or "caskets")
      const mainCat = categories.find(c => c.id === dynamicId);
      if (mainCat) {
        setActiveCategory(mainCat);
        setActiveSubCategory(null);
        return;
      }
      
      // 2. Check if the URL hash matches a subcategory (like "tents" or "lowering_gears")
      for (const cat of categories) {
        if (cat.subcategories) {
          const sub = cat.subcategories.find(s => s.id === dynamicId);
          if (sub) {
            setActiveCategory(cat);
            setActiveSubCategory(sub);
            return;
          }
        }
      }
    } else {
      // 3. If no dynamic ID, reset to the main directory
      setActiveCategory(null);
      setActiveSubCategory(null);
    }
  }, [dynamicId]);

  const handleAddToCart = (product) => {
    addToCart(product);
    setRecentlyAdded(product.id);
    setTimeout(() => setRecentlyAdded(null), 2000);
  };

  const handleOpenRentalModal = (hearse) => {
    setSelectedHearse(hearse);
    setShowRentalModal(true);
  };

  const handleConfirmRental = () => {
    const customizedHearse = {
      ...selectedHearse,
      title: `${selectedHearse.title} (Scheduled)`,
      rentalSchedule: rentalDetails
    };
    
    if (bookRental) {
      bookRental(customizedHearse);
    } else {
      addToCart(customizedHearse);
    }
    
    setRecentlyAdded(selectedHearse.id);
    setTimeout(() => setRecentlyAdded(null), 2000);
    
    setShowRentalModal(false);
    setRentalDetails({ pickup: "", dropoff: "", date: "", time: "" });
  };

  // PRO-GRADE FIX: Keep the URL perfectly in sync when clicking the Back button
  const handleBackClick = () => {
    if (activeCategory?.subcategories && activeSubCategory) {
      // Go back one level to the parent category
      window.location.hash = `#catalog/${activeCategory.id}`;
    } else {
      // Go back all the way to the root directory
      window.location.hash = "#catalog";
    }
  };

  const isFormValid = rentalDetails.pickup.trim() && rentalDetails.dropoff.trim() && rentalDetails.date && rentalDetails.time;

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col relative">
      <div className="pt-12 pb-24 flex-grow">
        <section className="site-container px-4 mx-auto max-w-6xl">
          
          {/* Page Header */}
          <div className="text-center mb-12">
            <p className="text-sm tracking-[0.28em] uppercase text-[#A8895C] mb-3">
              Classic Provisions
            </p>
            <h2 className="text-4xl font-serif font-semibold text-[#1F2E27] mb-4">
              Curated Memorial Catalog
            </h2>
            <div className="flex items-center justify-center gap-2 text-sm text-emerald-700 bg-emerald-50 w-fit mx-auto px-4 py-2 rounded-full border border-emerald-100 mb-8">
              <ShieldCheck size={16} />
              <span>100% Secure Checkout via M-Pesa API</span>
            </div>
          </div>

          {/* VIEW 1: Main Directory Cards */}
          {!activeCategory && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
              {categories.map((cat) => (
                <CategoryCard 
                  key={cat.id} 
                  item={cat} 
                  // Update the URL instead of internal state, letting the deep-link logic handle the rest
                  onClick={() => window.location.hash = `#catalog/${cat.id}`} 
                />
              ))}
            </div>
          )}

          {/* VIEW 2: Sub-Category Cards */}
          {activeCategory && activeCategory.subcategories && !activeSubCategory && (
            <div className="animate-fadeIn">
              <button 
                onClick={handleBackClick}
                className="flex items-center gap-2 text-sm text-[#A8895C] hover:text-[#1F2E27] uppercase tracking-wider font-semibold mb-8 transition-colors"
              >
                <ChevronLeft size={16} /> Back to Directory
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto gap-8">
                {activeCategory.subcategories.map((sub) => (
                  <CategoryCard 
                    key={sub.id} 
                    item={sub} 
                    onClick={() => window.location.hash = `#catalog/${sub.id}`} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* VIEW 3: Final Products & Prices (e.g. Hearses View) */}
          {activeCategory && (!activeCategory.subcategories || activeSubCategory) && (
            <div className="animate-fadeIn">
              <button 
                onClick={handleBackClick}
                className="flex items-center gap-2 text-sm text-[#A8895C] hover:text-[#1F2E27] uppercase tracking-wider font-semibold mb-8 transition-colors"
              >
                <ChevronLeft size={16} /> 
                {activeCategory.subcategories ? `Back to ${activeCategory.title}` : "Back to Directory"}
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {products
                  .filter((p) => p.categoryId === (activeSubCategory ? activeSubCategory.id : activeCategory.id))
                  .map((item) => (
                    <ProductCard 
                      key={item.id} 
                      item={item} 
                      recentlyAdded={recentlyAdded} 
                      onAddToCart={handleAddToCart} 
                      onOpenRentalModal={handleOpenRentalModal} 
                    />
                  ))}
              </div>
            </div>
          )}

        </section>
      </div>

      {/* RENTAL SCHEDULING MODAL */}
      {showRentalModal && selectedHearse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn border border-[#E8DFD1]">
            <div className="bg-[#1F2E27] p-5 flex justify-between items-center text-white border-b-4 border-[#A8895C]">
              <div>
                <h3 className="font-serif text-xl tracking-wide">Schedule Transport</h3>
                <p className="text-xs text-[#E8DFD1] opacity-80 mt-1 uppercase tracking-widest">{selectedHearse.title}</p>
              </div>
              <button onClick={() => setShowRentalModal(false)} className="hover:text-[#A8895C] transition-colors p-1">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-7">
              <p className="text-sm text-[#3D3530] mb-6 leading-relaxed">
                Please provide the logistical details for the hearse. These details will be finalized during checkout.
              </p>
              
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-[#1F2E27] flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-[#A8895C]"/> Pick-up Location
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Montezuma Funeral Home" 
                    className="w-full p-3 border border-[#E8DFD1] bg-[#F8F6F0] rounded text-sm outline-none focus:border-[#A8895C] focus:bg-white transition-colors" 
                    value={rentalDetails.pickup} 
                    onChange={(e) => setRentalDetails({...rentalDetails, pickup: e.target.value})} 
                  />
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-[#1F2E27] flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-[#A8895C]"/> Destination (Burial Site)
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Langata Cemetery" 
                    className="w-full p-3 border border-[#E8DFD1] bg-[#F8F6F0] rounded text-sm outline-none focus:border-[#A8895C] focus:bg-white transition-colors" 
                    value={rentalDetails.dropoff} 
                    onChange={(e) => setRentalDetails({...rentalDetails, dropoff: e.target.value})} 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-semibold text-[#1F2E27] flex items-center gap-2 mb-2">
                      <Calendar size={16} className="text-[#A8895C]"/> Date
                    </label>
                    <input 
                      type="date" 
                      className="w-full p-3 border border-[#E8DFD1] bg-[#F8F6F0] rounded text-sm outline-none focus:border-[#A8895C] focus:bg-white transition-colors text-[#3D3530]" 
                      value={rentalDetails.date} 
                      onChange={(e) => setRentalDetails({...rentalDetails, date: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#1F2E27] flex items-center gap-2 mb-2">
                      <Clock size={16} className="text-[#A8895C]"/> Time
                    </label>
                    <input 
                      type="time" 
                      className="w-full p-3 border border-[#E8DFD1] bg-[#F8F6F0] rounded text-sm outline-none focus:border-[#A8895C] focus:bg-white transition-colors text-[#3D3530]" 
                      value={rentalDetails.time} 
                      onChange={(e) => setRentalDetails({...rentalDetails, time: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-4 pt-6 border-t border-[#E8DFD1]">
                <button 
                  onClick={() => setShowRentalModal(false)} 
                  className="flex-1 py-3.5 text-sm font-semibold tracking-wider uppercase bg-transparent text-[#3D3530] border-2 border-[#E8DFD1] hover:bg-[#F8F6F0] hover:border-[#D8CFBC] transition-all rounded"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmRental} 
                  disabled={!isFormValid}
                  className={`flex-1 py-3.5 text-sm font-semibold tracking-wider uppercase transition-all rounded ${
                    isFormValid 
                    ? "bg-[#1F2E27] text-white hover:bg-[#A8895C] shadow-lg hover:shadow-xl" 
                    : "bg-[#E8DFD1] text-[#A8895C] cursor-not-allowed"
                  }`}
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}