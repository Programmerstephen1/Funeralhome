import React, { useState } from "react";
import { Calendar, Building2, CheckCircle2, Phone, Loader2 } from "lucide-react";
import mpesaIcon from "../assets/mpesa.png";
import airtelIcon from "../assets/airtel.png";
import debitIcon from "../assets/debit.png";
import LocationPicker from "../components/LocationPicker"; 

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

  const subtotal = cart?.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0) || 0;
  const serviceFee = 2500;
  const totalAmount = subtotal + serviceFee;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const paymentOptions = [
    { id: "mpesa", label: "M-PESA", icon: mpesaIcon },
    { id: "airtel", label: "Airtel Money", icon: airtelIcon },
    { id: "card", label: "Debit/Credit Card", icon: debitIcon },
  ];

  const handlePayment = async () => {
    setPaymentError("");
    setPaymentMessage("");

    if (!formData.contactName || !formData.venueName || !formData.burialDate) {
      setPaymentError("Please fill in all service details before proceeding.");
      return;
    }
    
    if (paymentMethod === "mpesa") {
      const sanitizedPhone = formData.phone.replace(/\D/g, "");
      if (sanitizedPhone.length < 10) {
        setPaymentError("Please enter a valid Kenyan M-Pesa phone number.");
        return;
      }

      setIsProcessing(true);
      const currentUserEmail = localStorage.getItem("userEmail") || "";
      
      // PRO-GRADE FIX: Dynamic API URL for Render deployment
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

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

        const data = await response.json();

        if (response.ok) {
          setPaymentMessage("Prompt sent! Please check your phone and enter your M-Pesa PIN.");
          setTimeout(() => {
            window.location.hash = "#thankyou";
          }, 10000);
        } else {
          setPaymentError(data.error || "Failed to initiate payment. Please try again.");
          setIsProcessing(false);
        }
      } catch (err) {
        setPaymentError("Network error. Please check your connection to the server.");
        setIsProcessing(false);
      }
    } else {
      setPaymentMessage("This payment method is currently in development.");
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#F8F6F0]">
        <h2 className="text-2xl font-serif text-[#1F2E27] mb-4">No items to checkout.</h2>
        <a href="#catalog" className="text-[#A8895C] underline hover:text-[#1F2E27] uppercase tracking-widest text-sm">Return to Catalog</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] pb-32">
      <div className="bg-white border-b border-[#E8DFD1] py-6 mb-8">
        <div className="site-container max-w-4xl mx-auto px-4 flex items-center justify-between text-[10px] md:text-xs uppercase tracking-widest font-semibold">
          <div className="text-[#A8895C] flex items-center gap-1 md:gap-2"><span>01</span> Cart</div>
          <div className="h-px bg-[#E8DFD1] flex-grow mx-2 md:mx-4"></div>
          <div className="text-[#A8895C] flex items-center gap-1 md:gap-2"><span>02</span> Orchestration & Payment</div>
          <div className="h-px bg-[#E8DFD1] flex-grow mx-2 md:mx-4"></div>
          <div className="text-[#1F2E27] opacity-50 flex items-center gap-1 md:gap-2"><span>03</span> Complete</div>
        </div>
      </div>

      <div className="site-container max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-[#E8DFD1] shadow-sm p-6 md:p-8 rounded-sm">
            <h2 className="text-xl font-serif text-[#1F2E27] mb-6 flex items-center gap-2">
              <Building2 className="text-[#A8895C]" size={20} /> Service & Logistics Details
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#3D3530] mb-2">Contact Person Name</label>
                <input name="contactName" onChange={handleInputChange} className="w-full p-3 border border-[#E8DFD1] bg-[#F8F6F0] focus:outline-none focus:border-[#A8895C] transition-colors rounded-sm" placeholder="Who should we contact?" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#3D3530] mb-2">Funeral Home / Venue Location</label>
                <LocationPicker onLocationSelect={(address) => setFormData({ ...formData, venueName: address })} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#3D3530] mb-2">Burial Date</label>
                  <input type="date" name="burialDate" onChange={handleInputChange} className="w-full p-3 border border-[#E8DFD1] bg-[#F8F6F0] focus:outline-none focus:border-[#A8895C] transition-colors rounded-sm" />
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

          <div className="bg-white border border-[#E8DFD1] shadow-sm p-6 md:p-8 rounded-sm">
            <h2 className="text-xl font-serif text-[#1F2E27] mb-6">Select Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {paymentOptions.map((option) => (
                <div 
                  key={option.id}
                  onClick={() => setPaymentMethod(option.id)}
                  className={`border-2 p-4 cursor-pointer transition-all flex flex-col items-center gap-3 relative rounded-sm ${paymentMethod === option.id ? "border-[#A8895C] bg-[#F8F6F0]" : "border-[#E8DFD1] hover:border-[#D8CFBC]"}`}
                >
                  <div className="w-16 h-12 flex items-center justify-center">
                    <img src={option.icon} alt={option.label} className="max-h-full max-w-full object-contain" />
                  </div>
                  <span className="text-xs font-semibold text-[#1F2E27] text-center">{option.label}</span>
                  {paymentMethod === option.id && <CheckCircle2 className="absolute top-2 right-2 text-[#A8895C]" size={16} />}
                </div>
              ))}
            </div>

            {paymentMethod === "mpesa" && (
              <div className="bg-[#F8F6F0] p-5 rounded-sm border border-[#E8DFD1] transition-opacity duration-300">
                <label className="text-sm font-medium text-[#3D3530] mb-3 flex items-center gap-2">
                  <Phone size={16} className="text-[#A8895C]" /> M-Pesa Phone Number
                </label>
                <input 
                  type="tel" 
                  name="phone" 
                  onChange={handleInputChange} 
                  placeholder="e.g. 0712345678 or 254712345678" 
                  className="w-full p-3.5 border border-[#E8DFD1] bg-white rounded-sm focus:outline-none focus:border-[#A8895C] transition-colors" 
                />
                <p className="text-xs text-[#8F744D] mt-3 tracking-wide">A secure payment prompt will be sent directly to this number.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#E8DFD1] shadow-sm p-6 md:p-8 h-fit sticky top-24 rounded-sm">
          <h2 className="text-lg font-serif text-[#1F2E27] mb-6 border-b border-[#E8DFD1] pb-4">Booking Summary</h2>
          <div className="flex flex-col gap-4 mb-6">
            {cart.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-[#3D3530]">{item.quantity || 1}x {item.title}</span>
                <span className="font-medium">KSh {(item.price * (item.quantity || 1)).toLocaleString()}</span>
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

          {paymentError && <div className="mt-6 p-4 bg-red-50 text-red-700 text-sm rounded-sm border border-red-200 leading-relaxed">{paymentError}</div>}
          {paymentMessage && <div className="mt-6 p-4 bg-green-50 text-green-800 text-sm rounded-sm border border-green-200 leading-relaxed">{paymentMessage}</div>}

          <button 
            onClick={handlePayment}
            disabled={isProcessing}
            className={`w-full mt-8 py-4 uppercase tracking-widest text-sm font-semibold transition-all flex items-center justify-center gap-2 rounded-sm
              ${isProcessing ? "bg-[#3D3530] text-[#E8DFD1] cursor-not-allowed" : "bg-[#1F2E27] text-white hover:bg-[#A8895C] shadow-md hover:shadow-lg"}`}
          >
            {isProcessing ? (
              <><Loader2 size={18} className="animate-spin" /> Processing Payment...</>
            ) : (
              `Pay KSh ${totalAmount.toLocaleString()}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}