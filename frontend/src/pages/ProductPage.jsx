import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ShoppingCart, Truck, ShieldCheck, ChevronLeft, CheckCircle, AlertCircle } from "lucide-react";

// --- CUSTOM INTERACTIVE STAR COMPONENT ---
const InteractiveStars = ({ rating, setRating, label }) => {
  const [hover, setHover] = useState(0);
  
  return (
    <div className="mb-6">
      <label className="block text-xs font-bold text-[#716860] uppercase tracking-wider mb-2">{label}</label>
      <div className="flex gap-1">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          return (
            <button
              type="button"
              key={starValue}
              className="focus:outline-none transition-transform hover:scale-110"
              onClick={() => setRating(starValue)}
              onMouseEnter={() => setHover(starValue)}
              onMouseLeave={() => setHover(0)}
            >
              <Star
                size={28}
                className={starValue <= (hover || rating) ? "text-[#A8895C] fill-[#A8895C]" : "text-[#E8DFD1] fill-transparent"}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function ProductPage({ addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("description");
  const [mainImage, setMainImage] = useState("");
  const [recentlyAdded, setRecentlyAdded] = useState(false);

  // Split Review State
  const [productRating, setProductRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setMainImage(data.images[0]);
        }
      } else {
        navigate("/catalog");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      setRecentlyAdded(true);
      setTimeout(() => setRecentlyAdded(false), 2000);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewStatus(null);
    const token = localStorage.getItem("token");

    if (!token) {
      setReviewStatus({ type: "error", message: "You must be signed in to leave a review." });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/products/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          productRating: productRating, 
          serviceRating: serviceRating, 
          comment: reviewComment 
        })
      });

      const data = await response.json();

      if (response.ok) {
        setReviewStatus({ type: "success", message: "Review submitted successfully!" });
        setProduct(data.product); 
        setReviewComment("");
        setProductRating(5);
        setServiceRating(5);
      } else {
        setReviewStatus({ type: "error", message: data.error || "Failed to submit review." });
      }
    } catch (error) {
      setReviewStatus({ type: "error", message: "Network error occurred." });
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star 
        key={index} 
        size={14} 
        className={index < Math.round(rating) ? "text-[#A8895C] fill-[#A8895C]" : "text-[#E8DFD1] fill-transparent"} 
      />
    ));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F8F6F0]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A8895C]"></div></div>;
  }

  if (!product) return null;

  // DYNAMIC PRICING CALCULATIONS
  const discountPercent = product.discount_percent || 0;
  const originalPrice = discountPercent > 0 ? (product.price / (1 - discountPercent / 100)) : product.price;
  const ratingScore = product.average_rating || 0;

  return (
    <div className="min-h-screen bg-[#F8F6F0] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[#A8895C] hover:text-[#1F2E27] uppercase tracking-wider font-semibold mb-6 transition-colors">
          <ChevronLeft size={16} /> Back to Catalog
        </button>

        {/* --- TOP SECTION: IMAGE & BUY BOX --- */}
        <div className="bg-white border border-[#E8DFD1] rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            
            {/* Left: Image Gallery */}
            <div className="p-8 border-b lg:border-b-0 lg:border-r border-[#E8DFD1] flex flex-col items-center relative">
              
              {/* Dynamic Discount Badge on Image */}
              {discountPercent > 0 && (
                <div className="absolute top-8 left-8 bg-[#FF4747] text-white text-xs font-bold px-3 py-1 rounded z-20 shadow-md">
                  {discountPercent}% OFF
                </div>
              )}

              <div className="w-full aspect-square bg-[#F4F1EA] rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                <img src={mainImage || "https://via.placeholder.com/600x600?text=No+Image"} alt={product.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-2 overflow-x-auto w-full pb-2 custom-scrollbar">
                {product.images?.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setMainImage(img)}
                    className={`w-20 h-20 shrink-0 rounded border-2 overflow-hidden ${mainImage === img ? 'border-[#A8895C]' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Product Details & Logistics */}
            <div className="p-8 lg:p-12 flex flex-col">
              <h1 className="text-3xl font-serif text-[#1F2E27] mb-3">{product.title}</h1>
              
              <div className="flex items-center gap-2 mb-6 border-b border-[#E8DFD1] pb-6">
                <div className="flex">{renderStars(ratingScore)}</div>
                <span className="text-sm font-semibold text-[#1F2E27]">{ratingScore > 0 ? ratingScore.toFixed(1) : ""}</span>
                <span className="text-sm text-[#8F847C] ml-2 border-l border-[#E8DFD1] pl-2">
                  {product.review_count > 0 ? `${product.review_count} Reviews` : "0 Reviews"}
                </span>
              </div>

              <div className="bg-[#F8F6F0] p-6 rounded-lg border border-[#E8DFD1] mb-8">
                <div className="flex flex-col mb-2">
                  <span className={`text-4xl font-bold ${discountPercent > 0 ? 'text-[#FF4747]' : 'text-[#1F2E27]'}`}>
                    KSh {product.price.toLocaleString()}
                  </span>
                  {discountPercent > 0 && (
                    <span className="text-sm text-[#8F847C] line-through mt-1">
                      KSh {Math.round(originalPrice).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-green-700 flex items-center gap-1 font-semibold mt-4">
                  <ShieldCheck size={16} /> 100% Secure Checkout via M-Pesa
                </p>
              </div>

              {/* Logistics & Delivery Details */}
              <div className="space-y-4 mb-8 text-sm text-[#3D3530]">
                <div className="flex items-start gap-3 border-b border-[#E8DFD1] pb-3">
                  <Truck className="text-[#A8895C] shrink-0 mt-0.5" size={18} />
                  <div>
                    <span className="font-semibold block mb-1">Dispatch Hub:</span>
                    {product.dispatch_location}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={18} />
                  <div>
                    <span className="font-semibold block mb-1">Services:</span>
                    Local Dispatch & Professional Handling
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-[#E8DFD1]">
                <button 
                  onClick={handleAddToCart}
                  disabled={recentlyAdded}
                  className={`w-full py-4 rounded font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 ${
                    recentlyAdded ? "bg-emerald-700 text-white" : "bg-[#1F2E27] text-white hover:bg-[#A8895C]"
                  }`}
                >
                  {recentlyAdded ? <><CheckCircle size={20} /> Added to Cart</> : <><ShoppingCart size={20} /> Add to Booking</>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- BOTTOM SECTION: THE TABBED INTERFACE --- */}
        <div className="bg-white border border-[#E8DFD1] rounded-xl shadow-sm overflow-hidden">
          <div className="flex border-b border-[#E8DFD1] bg-[#F8F6F0] overflow-x-auto">
            {["description", "specifications", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
                  activeTab === tab 
                  ? "bg-white text-[#A8895C] border-t-2 border-t-[#A8895C]" 
                  : "text-[#716860] hover:text-[#1F2E27]"
                }`}
              >
                {tab} {tab === 'reviews' && `(${product.review_count})`}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* 1. Description Tab */}
            {activeTab === "description" && (
              <div className="prose max-w-none text-[#3D3530] leading-relaxed">
                <h3 className="text-xl font-serif mb-4 text-[#1F2E27]">Product Details</h3>
                <p>{product.desc}</p>
              </div>
            )}

            {/* 2. Specifications Tab */}
            {activeTab === "specifications" && (
              <div>
                <h3 className="text-xl font-serif mb-6 text-[#1F2E27]">Detailed Specifications</h3>
                {product.specifications && product.specifications.length > 0 ? (
                  <div className="overflow-hidden border border-[#E8DFD1] rounded-lg">
                    <table className="min-w-full divide-y divide-[#E8DFD1]">
                      <tbody className="bg-white divide-y divide-[#E8DFD1]">
                        {product.specifications.map((spec, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#F8F6F0]"}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#716860] w-1/3">{spec.key}</td>
                            <td className="px-6 py-4 text-sm text-[#3D3530]">{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-[#8F847C] italic">No technical specifications available for this item.</p>
                )}
              </div>
            )}

            {/* 3. Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Customer Reviews */}
                <div>
                  <div className="flex items-end justify-between mb-6">
                    <h3 className="text-xl font-serif text-[#1F2E27]">Customer Feedback</h3>
                    
                    {/* Aggregated Score Breakdown */}
                    {product.review_count > 0 && (
                      <div className="text-right text-xs text-[#8F847C]">
                        <p>Product: <span className="text-[#A8895C] font-bold">{product.product_rating.toFixed(1)}</span></p>
                        <p>Service: <span className="text-[#A8895C] font-bold">{product.service_rating.toFixed(1)}</span></p>
                      </div>
                    )}
                  </div>

                  {product.reviews && product.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {product.reviews.map((review) => (
                         <div key={review.id} className="border-b border-[#E8DFD1] pb-6 last:border-0">
                           <div className="flex flex-col gap-1.5 mb-3 bg-[#F8F6F0] p-3 rounded border border-[#E8DFD1]/50">
                             <div className="flex items-center text-xs text-[#716860]">
                               <span className="w-16 font-semibold uppercase tracking-wider">Product</span>
                               <div className="flex">{renderStars(review.product_rating)}</div>
                             </div>
                             <div className="flex items-center text-xs text-[#716860]">
                               <span className="w-16 font-semibold uppercase tracking-wider">Service</span>
                               <div className="flex">{renderStars(review.service_rating)}</div>
                             </div>
                           </div>
                           
                           <div className="flex justify-between items-center mb-1">
                             <p className="text-sm font-bold text-[#1F2E27]">{review.user_email.split('@')[0]}</p>
                             <span className="text-xs text-[#8F847C]">{new Date(review.created_at).toLocaleDateString()}</span>
                           </div>
                           <p className="text-sm text-[#3D3530] italic">"{review.comment}"</p>
                         </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#8F847C] italic bg-[#F8F6F0] p-6 rounded text-center border border-[#E8DFD1]/50">No reviews have been posted yet. Be the first to share your thoughts.</p>
                  )}
                </div>

                {/* Right: Submit a Review (INTERACTIVE STARS) */}
                <div className="bg-white p-6 lg:p-8 rounded-xl border border-[#E8DFD1] shadow-sm h-fit">
                  <h3 className="text-xl font-serif mb-6 text-[#1F2E27]">Write a Review</h3>
                  
                  {reviewStatus && (
                    <div className={`p-3 rounded mb-6 text-sm flex items-center gap-2 ${reviewStatus.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                      {reviewStatus.type === 'error' ? <AlertCircle size={16}/> : <CheckCircle size={16}/>}
                      {reviewStatus.message}
                    </div>
                  )}

                  <form onSubmit={submitReview} className="space-y-2">
                    
                    {/* Interactive Star Rows */}
                    <InteractiveStars rating={productRating} setRating={setProductRating} label="Product Satisfaction" />
                    <InteractiveStars rating={serviceRating} setRating={setServiceRating} label="Service Satisfaction" />
                    
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-[#716860] uppercase tracking-wider mb-2">Review (Optional)</label>
                      <textarea 
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows="4" 
                        placeholder="Share your thoughts..."
                        className="w-full p-4 border border-[#E8DFD1] rounded outline-none focus:border-[#A8895C] bg-[#F8F6F0] text-sm resize-none transition-colors"
                      ></textarea>
                    </div>
                    
                    <div className="pt-4">
                      <button type="submit" className="bg-[#A8895C] text-white px-6 py-4 rounded text-sm font-bold uppercase tracking-widest hover:bg-[#1F2E27] transition-colors w-full shadow-md">
                        Submit Review
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}