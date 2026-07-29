import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Check, Star, ShieldCheck, Box, Route as RouteIcon, MapPin, Fuel, ShoppingCart, CheckCircle } from "lucide-react";

// --- FALLBACK DATA WITH INCLUSIONS ---
const fallbackProducts = [
  { id: 101, categoryId: "casket_list", title: "Pure White Quilted Casket", desc: "Elegant white finish with premium padded interior.", price: 95000, has_sizes: true, images: ["/images/caskets/casket1().jpg", "/images/caskets/casket1(0).jpg"] },
  { id: 102, categoryId: "casket_list", title: "Standard Oak Finish Casket", desc: "Classic oak wood finish featuring a pristine white interior.", price: 92000, has_sizes: true, images: ["/images/caskets/casket2().jpeg", "/images/caskets/casket2(0).jpg"] },
  { id: 103, categoryId: "casket_list", title: "Glossy Mahogany Casket", desc: "Premium reddish-brown mahogany with a high-gloss finish.", price: 105000, has_sizes: true, images: ["/images/caskets/casket3().jpeg", "/images/caskets/casket3.jpeg"] },
  { id: 104, categoryId: "casket_list", title: "Classic Red Wood Casket", desc: "Traditional deep red wood build with sturdy handles.", price: 98000, has_sizes: true, images: ["/images/caskets/casket4.jpg"] },
  { id: 105, categoryId: "casket_list", title: "Premium Pine Casket", desc: "Smooth light wood finish for a natural, dignified rest.", price: 96000, has_sizes: true, images: ["/images/caskets/casket5().jpeg", "/images/caskets/casket5(0).jpeg", "/images/caskets/casket5(1).jpg", "/images/caskets/casket5(2).jpg"] },
  { id: 401, categoryId: "hearses", title: "Mercedes Executive Hearse 1", desc: "Dignified Mercedes-Benz transport. Base daily rate shown.", price: 25000, inclusions: ["Auto lowering gear", "Casket gazebo tent", "Public system for the grave yard site", "A portrait stand to hold the deceased persons image", "Church trolley to carry the body inside the casket", "Graveside turf"], images: ["/images/hearses/hearse1(0).jpeg"] },
  { id: 403, categoryId:"hearses", title: "Classic Van Hearse", desc: "Spacious, reliable, and elegant van transport. Base daily rate shown.", price: 15000, inclusions: ["Auto lowering gear", "Casket gazebo tent", "Public system for the grave yard site", "A portrait stand to hold the deceased persons image", "Church trolley to carry the body inside the casket", "Graveside turf"], images: ["/images/hearses/hearse2(0).jpeg"] },
  { id: 405, categoryId:"hearses", title: "Premium Black Transport", desc: "Discreet and highly professional dark vehicle option. Base daily rate shown.", price: 20000, inclusions: ["Auto lowering gear", "Casket gazebo tent", "Public system for the grave yard site", "A portrait stand to hold the deceased persons image", "Church trolley to carry the body inside the casket", "Graveside turf"], images: ["/images/hearses/hearse4(0).jpg"] },
  { id: 201, categoryId: "wreaths", title: "Dual White Hearts on Stand", desc: "Two elegant heart-shaped floral displays on a shared stand.", price: 18000, images: ["/images/wreaths/wreath1.jpeg"] },
  { id: 151, categoryId: "urns", title: "Classic Marble Box Urn", desc: "Solid cultured marble in a deep burgundy finish.", price: 18000, images: ["/images/urns/images(0).jpg"] },
  { id: 701, categoryId: "media", title: "Standard Photo Package", desc: "One professional photographer for 6 hours.", price: 25000, inclusions: ["Sound systems"], images: ["/images/images().jpg"] },
  { id: 702, categoryId: "media", title: "Cinematic Videography & Livestream", desc: "Two videographers, edited memorial video.", price: 55000, inclusions: ["Sound systems"], images: ["/images/images.jpg"] }
];

// --- STRICT ENTERPRISE SIZING MATH ---
const casketSizes = [
  { id: "s2", label: "Small (2 ft)", priceModifier: -30000 },
  { id: "s4", label: "Small (4 ft)", priceModifier: -26000 },
  { id: "s6", label: "Small (6 ft)", priceModifier: -22000 },
  { id: "s8", label: "Small (8 ft)", priceModifier: -18000 },
  { id: "s10", label: "Small (10 ft)", priceModifier: -14000 },
  { id: "s12", label: "Small (12 ft)", priceModifier: -10000 },
  { id: "normal", label: "Normal (Standard Adult)", priceModifier: 0 },
  { id: "large", label: "Large (Oversized)", priceModifier: 50000 },
  { id: "xl", label: "Extra Large (Custom Fit)", priceModifier: 68000 }
];

export default function ProductPage({ addToCart, bookRental }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [recentlyAdded, setRecentlyAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Configuration States
  const [casketSizeIndex, setCasketSizeIndex] = useState(6); // Normal Size Default (Index 6)
  const [rentalDetails, setRentalDetails] = useState({ 
    pickup: "", dropoff: "", pickupDate: "", returnDate: "", mileagePlan: "limited", estimatedDistance: "", fuelPolicy: "full_to_full" 
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`${API_URL}/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        // INJECTION: Force merge the hardcoded inclusions into the live database response
        const fallbackMatch = fallbackProducts.find(fp => fp.id === parseInt(id));
        if (fallbackMatch && fallbackMatch.inclusions && (!data.inclusions || data.inclusions.length === 0)) {
          data.inclusions = fallbackMatch.inclusions;
        }
        setProduct(data);
        setMainImage(data.images && data.images.length > 0 ? data.images[0] : "");
        setLoading(false);
      })
      .catch(() => {
        let found = null;
        for (let i = 0; i < fallbackProducts.length; i++) {
          if (fallbackProducts[i].id === parseInt(id)) {
            found = fallbackProducts[i];
          }
        }
        setProduct(found);
        if (found && found.images && found.images.length > 0) {
          setMainImage(found.images[0]);
        }
        setLoading(false);
      });
  }, [id, API_URL]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A8895C]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex flex-col items-center justify-center text-center p-4">
        <Box size={48} className="text-[#A8895C] mb-4" />
        <h2 className="text-2xl font-serif text-[#1F2E27] mb-4">Item Not Found</h2>
        <Link to="/catalog" className="bg-[#1F2E27] text-white px-6 py-3 rounded text-sm uppercase tracking-widest hover:bg-[#A8895C] transition-colors">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isCasket = product.has_sizes || product.categoryId === "casket_list";
  const isHearse = product.categoryId === "hearses";
  
  const discountPercent = product.discount_percent || 0;
  const originalPrice = discountPercent > 0 ? (product.price / (1 - discountPercent / 100)) : product.price;

  // DYNAMIC PRICE CALCULATION
  let finalPrice = product.price;
  
  if (isCasket) {
    finalPrice = product.price + casketSizes[casketSizeIndex].priceModifier;
  } else if (isHearse) {
    const baseDailyRate = product.price;
    let days = 1;
    if (rentalDetails.pickupDate && rentalDetails.returnDate) {
      const start = new Date(rentalDetails.pickupDate);
      const end = new Date(rentalDetails.returnDate);
      const timeDiff = end.getTime() - start.getTime();
      if (timeDiff > 0) days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
    const totalBasePrice = baseDailyRate * days;

    let distanceCharge = 0;
    const distance = Number(rentalDetails.estimatedDistance) || 0;
    if (rentalDetails.mileagePlan === "limited") {
      const allowedDistance = 150 * days;
      if (distance > allowedDistance) distanceCharge = (distance - allowedDistance) * 120;
    } else if (rentalDetails.mileagePlan === "unlimited") {
      distanceCharge = 8000 * days; 
    }

    let fuelCharge = 0;
    if (rentalDetails.fuelPolicy === "pre_purchased") {
        fuelCharge = 12500;
    }
    
    finalPrice = totalBasePrice + distanceCharge + fuelCharge;
  }

  const handleAction = (isBuyNow) => {
    let itemToAdd = { ...product, price: finalPrice };

    if (isCasket) {
      const size = casketSizes[casketSizeIndex];
      itemToAdd.cartItemId = `${product.id}-${size.id}`;
      itemToAdd.title = `${product.title} (${size.label})`;
      addToCart(itemToAdd);
    } else if (isHearse) {
      itemToAdd.title = `${product.title} (Scheduled Transport)`;
      itemToAdd.rentalSchedule = rentalDetails;
      bookRental(itemToAdd);
    } else {
      itemToAdd.cartItemId = product.id;
      addToCart(itemToAdd);
    }

    setRecentlyAdded(true);
    setTimeout(() => setRecentlyAdded(false), 2000);
    
    if (isBuyNow) {
      window.location.hash = "#cart";
    }
  };

  let isFormValid = true;
  if (isHearse) {
    if (rentalDetails.pickup === "" || rentalDetails.dropoff === "" || rentalDetails.pickupDate === "" || rentalDetails.returnDate === "" || rentalDetails.estimatedDistance <= 0) {
      isFormValid = false;
    }
  }

  return (
    <div className="bg-[#F8F6F0] min-h-screen py-12">
      <div className="site-container max-w-6xl mx-auto px-4">
        
        <div className="mb-8">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-sm text-[#716860] hover:text-[#A8895C] font-bold transition-colors">
            <ChevronLeft size={16} /> Back to Results
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="bg-white border border-[#E8DFD1] rounded-xl p-4 aspect-square flex items-center justify-center overflow-hidden shadow-sm">
              <img src={mainImage} alt={product.title} className="w-full h-full object-contain" onError={(e) => { e.target.src = "https://via.placeholder.com/600x600?text=Photo+Pending" }} />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                {product.images.map((img, idx) => (
                  <button key={idx} onClick={() => setMainImage(img)} className={`w-20 h-20 shrink-0 bg-white border rounded overflow-hidden transition-all ${mainImage === img ? "border-[#A8895C] ring-2 ring-[#A8895C]/20" : "border-[#E8DFD1] hover:border-[#A8895C]"}`}>
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Configuration & Purchase Block */}
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#A8895C] uppercase tracking-widest mb-2 block">
              {product.categoryId?.replace(/_/g, " ")}
            </span>
            <h1 className="text-3xl lg:text-4xl font-serif text-[#1F2E27] mb-4">{product.title}</h1>
            
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#E8DFD1]">
              <div className="flex flex-col">
                <span className="text-4xl font-bold text-[#1F2E27]">
                  KSh {finalPrice.toLocaleString()} {isHearse && <span className="text-sm text-[#8F847C] font-normal tracking-wide">/ calculated</span>}
                </span>
                {discountPercent > 0 && (
                   <span className="text-sm text-[#8F847C] line-through mt-1">
                     Was KSh {Math.round(originalPrice).toLocaleString()}
                   </span>
                )}
              </div>
            </div>

            <p className="text-[#3D3530] leading-relaxed mb-6">{product.desc}</p>

            {/* --- INJECTIONS RENDERED HERE --- */}
            {product.inclusions && product.inclusions.length > 0 && (
              <div className="mb-8 pt-6 border-t border-[#E8DFD1]">
                <span className="text-[10px] font-bold text-[#A8895C] uppercase tracking-wider block mb-3">Package Includes:</span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.inclusions.map((inc, i) => (
                    <li key={i} className="text-sm text-[#716860] flex items-start gap-2">
                      <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* EMBEDDED CASKET SIZING ENGINE */}
            {isCasket && (
              <div className="bg-white p-6 rounded border border-[#E8DFD1] mb-8 shadow-sm">
                <h4 className="text-sm font-bold text-[#1F2E27] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Box size={16} className="text-[#A8895C]"/> Select Dimensions
                </h4>
                <div className="space-y-3">
                  {casketSizes.map((size, index) => {
                    const priceModifierText = size.priceModifier === 0 
                      ? "Base Price" 
                      : size.priceModifier > 0 
                        ? `+ KSh ${size.priceModifier.toLocaleString()}` 
                        : `- KSh ${Math.abs(size.priceModifier).toLocaleString()}`;
                        
                    return (
                      <label key={size.id} className={`flex items-center justify-between p-4 rounded border cursor-pointer transition-all ${casketSizeIndex === index ? "bg-[#F8F6F0] border-[#A8895C] shadow-sm" : "border-[#E8DFD1] hover:bg-[#F8F6F0]"}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="casketSize" className="accent-[#A8895C] w-4 h-4" checked={casketSizeIndex === index} onChange={() => setCasketSizeIndex(index)}/>
                          <span className="text-sm font-semibold text-[#3D3530]">{size.label}</span>
                        </div>
                        <span className={`text-xs font-bold ${casketSizeIndex === index ? "text-[#A8895C]" : "text-[#716860]"}`}>{priceModifierText}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* EMBEDDED RENTAL ENGINE */}
            {isHearse && (
              <div className="bg-white p-6 rounded border border-[#E8DFD1] mb-8 space-y-8 shadow-sm">
                 <h4 className="text-sm font-bold text-[#1F2E27] uppercase tracking-wider flex items-center gap-2 border-b border-[#F8F6F0] pb-4">
                  <MapPin size={16} className="text-[#A8895C]"/> Logistics Configuration
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#716860] mb-1">Pick-up Location</label>
                    <input type="text" className="w-full p-3 border border-[#E8DFD1] rounded text-sm outline-none focus:border-[#A8895C] bg-[#F8F6F0]" value={rentalDetails.pickup} onChange={(e) => setRentalDetails({...rentalDetails, pickup: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#716860] mb-1">Destination (Burial Site)</label>
                    <input type="text" className="w-full p-3 border border-[#E8DFD1] rounded text-sm outline-none focus:border-[#A8895C] bg-[#F8F6F0]" value={rentalDetails.dropoff} onChange={(e) => setRentalDetails({...rentalDetails, dropoff: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#716860] mb-1">Pick-up Date</label>
                    <input type="date" className="w-full p-3 border border-[#E8DFD1] rounded text-sm outline-none focus:border-[#A8895C] bg-[#F8F6F0] text-[#3D3530]" value={rentalDetails.pickupDate} onChange={(e) => setRentalDetails({...rentalDetails, pickupDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#716860] mb-1">Return Date</label>
                    <input type="date" className="w-full p-3 border border-[#E8DFD1] rounded text-sm outline-none focus:border-[#A8895C] bg-[#F8F6F0] text-[#3D3530]" value={rentalDetails.returnDate} onChange={(e) => setRentalDetails({...rentalDetails, returnDate: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#716860] mb-1">Mileage Structure</label>
                    <select className="w-full p-3 border border-[#E8DFD1] rounded text-sm outline-none focus:border-[#A8895C] bg-[#F8F6F0] text-[#3D3530]" value={rentalDetails.mileagePlan} onChange={(e) => setRentalDetails({...rentalDetails, mileagePlan: e.target.value})}>
                      <option value="limited">Capped Mileage (150 km/day included)</option>
                      <option value="unlimited">Unlimited Mileage (Premium Flat Fee)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#716860] mb-1">Estimated Distance (Kilometers)</label>
                    <input type="number" min="1" className="w-full p-3 border border-[#E8DFD1] rounded text-sm outline-none focus:border-[#A8895C] bg-[#F8F6F0]" value={rentalDetails.estimatedDistance} onChange={(e) => setRentalDetails({...rentalDetails, estimatedDistance: e.target.value})} />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-auto">
              <button 
                onClick={() => handleAction(false)}
                disabled={!isFormValid || recentlyAdded}
                className={`flex-1 py-4 text-xs font-bold rounded uppercase tracking-widest transition-colors shadow-md ${(!isFormValid || recentlyAdded) ? "bg-[#E8DFD1] text-[#A8895C] cursor-not-allowed" : "bg-[#1F2E27] text-white hover:bg-[#3D3530]"}`}
              >
                {recentlyAdded ? (
                  <span className="flex items-center justify-center gap-2"><Check size={18}/> Added</span>
                ) : (
                  <span className="flex items-center justify-center gap-2"><ShoppingCart size={18}/> {isHearse ? "Add to Booking Requests" : "Add to Cart"}</span>
                )}
              </button>
              
              <button 
                 onClick={() => handleAction(true)}
                 disabled={!isFormValid}
                className={`flex-1 py-4 text-xs font-bold text-white rounded uppercase tracking-widest transition-colors shadow-md ${!isFormValid ? "bg-[#FF8888] cursor-not-allowed" : "bg-[#FF4747] hover:bg-[#E63939]"}`}
              >
                {isHearse ? "Book Now" : "Buy Now"}
              </button>
            </div>
            
            <div className="mt-6 flex items-center gap-3 text-sm text-[#716860] bg-white p-4 border border-[#E8DFD1] rounded shadow-sm">
               <ShieldCheck size={18} className="text-[#A8895C] shrink-0" />
               <p>Verified Last Planner Julz Inventory. Secure Checkout.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}