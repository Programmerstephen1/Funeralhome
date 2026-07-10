import React, { useState } from "react";
import { Calendar, Building2, CheckCircle2, Phone, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import ProgressSteps from "../components/ProgressSteps";
import mpesaIcon from "../assets/mpesa.png";
import airtelIcon from "../assets/airtel.png";
import debitIcon from "../assets/debit.png";
import LocationPicker from "../components/LocationPicker"; 

// PRO-GRADE ADDITIONS: Import Router hooks and components
import { useNavigate, Link } from "react-router-dom";

export default function CheckoutPage({ cart }) {
  const [formData, setFormData] = useState({
    contactName: "",
    venueName: "",
    burialDate: "",
    timing: "morning",
    phone: "", 
  });

  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // PRO-GRADE ADDITION: Initialize navigate
  const navigate = useNavigate();

  const subtotal = cart?.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0) || 0;
  const serviceFee = 2500;
  const totalAmount = subtotal + serviceFee;
  
  const progressSteps = [
    { id: "selection", label: "Select arrangements", description: "curated choices" },
    { id: "payment", label: "Confirm details", description: "secure payment" },
    { id: "complete", label: "Complete booking", description: "confirmation" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const paymentOptions = [
    { id: "mpesa", label: "M-PESA", icon: mpesaIcon },
    { id: "airtel", label: "Airtel Money", icon: airtelIcon },
    { id: "card", label: "Debit/Credit Card", icon: debitIcon },
  ];

  const handlePayment = async () => {
    setPaymentError("");
    setPaymentMessage("");

    // 1. Form Validation
    const errors = {};
    if (!formData.contactName.trim()) errors.contactName = "Please add the contact person's name.";
    if (!formData.venueName.trim()) errors.venueName = "Please choose a funeral home or venue location.";
    if (!formData.burialDate) errors.burialDate = "Please choose a burial date.";
    
    const PAYMENT_PROVIDER = import.meta.env.VITE_PAYMENT_PROVIDER || "mpesa";

    if (paymentMethod === "mpesa" && PAYMENT_PROVIDER === "mpesa") {
      const sanitizedPhone = (formData.phone || "").replace(/\D/g, "");
      if (sanitizedPhone.length < 10) errors.phone = "Please enter a valid Kenyan M-Pesa phone number.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setPaymentError("Please fix the highlighted details before continuing.");
      return;
    }
    
    // 2. M-Pesa Payment Processing
    if (paymentMethod === "mpesa") {
      const sanitizedPhone = formData.phone.replace(/\D/g, "");

      setIsProcessing(true);
      const currentUserEmail = localStorage.getItem("userEmail") || "";
      
      const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

      try {
        const response = await fetch(`${API_URL}/api/payments/stkpush`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalAmount,
            phone: sanitizedPhone,
            email: currentUserEmail
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
          setPaymentMessage("Prompt sent! Please check your phone and enter your M-Pesa PIN.");
          setTimeout(() => {
            // PRO-GRADE ADDITION: Smoothly push to the next route
            navigate("/thankyou");
          }, 10000);
        } else {
          const errMsg = data.detail || data.error || data.message || "Failed to initiate payment. Please try again.";
          setPaymentError(errMsg);
          setIsProcessing(false);
        }
      } catch (err) {
        setPaymentError("Network error. Please check your connection to the server.");
        setIsProcessing(false);
      }
    } else if (paymentMethod === "mpesa" && PAYMENT_PROVIDER === "mock") {
      // Mock payment endpoint for testing without Daraja
      setIsProcessing(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || window.location.origin;
        const resp = await fetch(`${API_URL}/api/payments/mock`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: totalAmount, phone: (formData.phone || '').replace(/\D/g, ''), email: localStorage.getItem('userEmail') || '' })
        });
        const data = await resp.json().catch(() => ({}));
        
        if (resp.ok) {
          setPaymentMessage("Payment simulated successfully. Thank you.");
          setTimeout(() => { 
            // PRO-GRADE ADDITION: Smoothly push to the next route
            navigate("/thankyou"); 
          }, 1500);
        } else {
          setPaymentError(data.error || data.message || "Mock payment failed.");
          setIsProcessing(false);
        }
      } catch (err) {
        setPaymentError("Network error during mock payment.");
        setIsProcessing(false);
      }
    } else {
      setPaymentError("This payment method is currently in development.");
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#F8F6F0]">
        <h2 className="text-2xl font-serif text-[#1F2E27] mb-4">No items to checkout.</h2>
        {/* PRO-GRADE ADDITION: Swapped the anchor tag for a Link Component */}
        <Link to="/catalog" className="text-[#A8895C] underline hover:text-[#1F2E27] uppercase tracking-widest text-sm">Return to Catalog</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] pb-32">
      <div className="mb-8 border-b border-[#E8DFD1] bg-white py-6">
        <div className="site-container mx-auto max-w-4xl px-4">
          <ProgressSteps
            steps={progressSteps}
            currentStep="payment"
            title="Arrange and confirm your booking"
            subtitle="A calm, guided path to secure your selections"
          />
        </div>
      </div>

      <div className="site-container mx-auto grid max-w-4xl grid-cols-1 gap-8 px-4 md:grid-cols-3">
        <div className="flex flex-col gap-6 md:col-span-2">
          
          {/* Service & Logistics Section */}
          <div className="rounded-[1.25rem] border border-[#E8DFD1] bg-white p-6 shadow-sm md:p-8 animate-fadeIn">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="section-eyebrow">Arrangement details</p>
                <h2 className="mt-2 flex items-center gap-2 text-xl font-serif text-[#1F2E27]">
                  <Building2 className="text-[#A8895C]" size={20} /> Service & Logistics Details
                </h2>
              </div>
              <div className="rounded-full border border-[#E8DFD1] bg-[#F8F6F0] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A8895C]">
                Secure booking
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#3D3530] mb-2">Contact Person Name</label>
                <input name="contactName" onChange={handleInputChange} value={formData.contactName} className="w-full p-3 border border-[#E8DFD1] bg-[#F8F6F0] focus:outline-none focus:border-[#A8895C] transition-colors rounded-sm" placeholder="Who should we contact?" aria-invalid={!!formErrors.contactName} />
                {formErrors.contactName && <p className="mt-2 text-sm text-red-700" role="alert">{formErrors.contactName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#3D3530] mb-2">Funeral Home / Venue Location</label>
                <LocationPicker onLocationSelect={(address) => { setFormData({ ...formData, venueName: address }); setFormErrors((prev) => ({ ...prev, venueName: "" })); }} />
                {formErrors.venueName && <p className="mt-2 text-sm text-red-700" role="alert">{formErrors.venueName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#3D3530] mb-2">Burial Date</label>
                  <input type="date" name="burialDate" onChange={handleInputChange} value={formData.burialDate} className="w-full p-3 border border-[#E8DFD1] bg-[#F8F6F0] focus:outline-none focus:border-[#A8895C] transition-colors rounded-sm" aria-invalid={!!formErrors.burialDate} />
                  {formErrors.burialDate && <p className="mt-2 text-sm text-red-700" role="alert">{formErrors.burialDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#3D3530] mb-2">Arrival Preference</label>
                  <select name="timing" onChange={handleInputChange} className="w-full p-3 border border-[#E8DFD1] bg-[#F8F6F0] focus:outline-none focus:border-[#A8895C] transition-colors rounded-sm">
                    <option value="morning">Morning of Burial</option>
                    <option value="prior">Day Prior (Evening)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="rounded-[1.25rem] border border-[#E8DFD1] bg-white p-6 shadow-sm md:p-8 animate-fadeIn" style={{ animationDelay: '100ms' }}>
            <h2 className="mb-6 text-xl font-serif text-[#1F2E27]">Select Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {paymentOptions.map((option) => (
                <div 
                  key={option.id}
                  onClick={() => setPaymentMethod(option.id)}
                  className={`border-2 p-4 cursor-pointer transition-all flex flex-col items-center gap-3 relative rounded-sm ${paymentMethod === option.id ? "border-[#A8895C] bg-[#F8F6F0]" : "border-[#E8DFD1] hover:border-[#D8CFBC] opacity-60 hover:opacity-100"}`}
                >
                  <div className="w-16 h-12 flex items-center justify-center">
                    <img src={option.icon} alt={option.label} className="max-h-full max-w-full object-contain" />
                  </div>
                  <span className="text-xs font-semibold text-[#1F2E27] text-center uppercase tracking-wider">{option.label}</span>
                  {paymentMethod === option.id && <CheckCircle2 className="absolute top-2 right-2 text-[#A8895C]" size={16} />}
                </div>
              ))}
            </div>

            {paymentMethod === "mpesa" && (
              <div className="bg-[#F8F6F0] p-5 rounded-sm border border-[#E8DFD1] transition-opacity duration-300 animate-fadeIn">
                <label className="text-sm font-medium text-[#3D3530] mb-3 flex items-center gap-2">
                  <Phone size={16} className="text-[#A8895C]" /> M-Pesa Phone Number
                </label>
                <input 
                  type="tel" 
                  name="phone" 
                  onChange={handleInputChange} 
                  value={formData.phone}
                  placeholder="e.g. 254708374149" 
                  aria-invalid={!!formErrors.phone}
                  className="w-full p-4 border border-[#E8DFD1] bg-white rounded-sm focus:outline-none focus:border-[#A8895C] transition-colors text-lg" 
                />
                {formErrors.phone && <p className="mt-2 text-sm text-red-700" role="alert">{formErrors.phone}</p>}
                <p className="text-xs text-[#8F744D] mt-3 tracking-wide">A secure payment prompt will be sent directly to this number.</p>
              </div>
            )}
          </div>
        </div>

        {/* Booking Summary Sidebar */}
        <div className="sticky top-24 h-fit rounded-[1.25rem] border border-[#E8DFD1] bg-white p-6 shadow-sm md:p-8 animate-fadeIn" style={{ animationDelay: '200ms' }}>
          <h2 className="mb-6 border-b border-[#E8DFD1] pb-4 text-lg font-serif text-[#1F2E27]">Booking Summary</h2>
          
          <div className="flex flex-col gap-4 mb-6 max-h-60 overflow-y-auto custom-scrollbar pr-2">
            {cart.map((item, i) => (
              <div key={i} className="flex justify-between text-sm items-start">
                <span className="text-[#3D3530] pr-4">{item.quantity || 1}x {item.title}</span>
                <span className="font-medium text-[#1F2E27]">KSh {(item.price * (item.quantity || 1)).toLocaleString()}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-[#E8DFD1] pt-5 flex flex-col gap-3">
            <div className="flex justify-between text-sm text-[#3D3530]">
              <span>Orchestration Fee</span>
              <span>KSh {serviceFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-[#1F2E27] mt-2 pt-4 border-t border-[#E8DFD1]/50">
              <span>Total Due</span>
              <span className="text-[#A8895C]">KSh {totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* DYNAMIC API FEEDBACK BOXES */}
          {paymentError && (
            <div className="mt-6 p-4 rounded-sm border border-red-200 bg-red-50 text-sm font-medium leading-relaxed text-red-800 animate-fadeIn flex items-start gap-3" role="alert">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <span>{paymentError}</span>
            </div>
          )}
          
          {paymentMessage && (
            <div className="mt-6 p-4 rounded-sm border border-emerald-200 bg-emerald-50 text-sm font-medium leading-relaxed text-emerald-800 animate-fadeIn flex items-start gap-3" role="status">
              <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
              <span>{paymentMessage}</span>
            </div>
          )}
          
          {!paymentError && !paymentMessage && (
            <p className="mt-6 text-sm leading-relaxed text-[#3D3530]">Once confirmed, you will receive a payment prompt and a brief confirmation summary for your records.</p>
          )}

          {/* SINGLE PREMIUM SUBMIT BUTTON */}
          <button 
            onClick={handlePayment}
            disabled={isProcessing}
            className={`w-full mt-6 py-4 uppercase tracking-widest text-sm font-semibold transition-all flex items-center justify-center gap-2 rounded-sm
              ${isProcessing ? "bg-[#3D3530] text-[#E8DFD1] cursor-not-allowed" : "bg-[#1F2E27] text-white hover:bg-[#A8895C] shadow-md hover:shadow-lg"}`}
          >
            {isProcessing ? (
              <><Loader2 size={18} className="animate-spin" /> Processing...</>
            ) : (
              `Pay KSh ${totalAmount.toLocaleString()}`
            )}
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#8F847C]">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Secured by Safaricom Daraja API</span>
          </div>
          
        </div>
      </div>
    </div>
  );
}