import React, { useState } from "react";
import { Clock, MapPin, Calendar, CheckCircle2, Phone, Loader2, Car } from "lucide-react";
import mpesaIcon from "../assets/mpesa.png";

export default function BookingCheckoutPage({ serviceBookings }) {
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const subtotal = serviceBookings?.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0) || 0;
  const bookingFee = 1500;
  const totalAmount = subtotal + bookingFee;

  const handlePayment = async () => {
    setPaymentError("");
    setPaymentMessage("");

    if (paymentMethod === "mpesa") {
      const sanitizedPhone = phone.replace(/\D/g, "");
      if (sanitizedPhone.length < 10) {
        setPaymentError("Please enter a valid Kenyan M-Pesa phone number to secure the booking.");
        return;
      }

      setIsProcessing(true);
      
      // PRO-GRADE ADDITION: Target user email for automated transport confirmation
      const currentUserEmail = localStorage.getItem("userEmail") || "";

      try {
        const response = await fetch("http://127.0.0.1:5000/api/payments/stkpush", {
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
          setPaymentMessage("Prompt sent! Please check your phone and enter your M-Pesa PIN to secure your transport.");
          setTimeout(() => { window.location.hash = "#thankyou"; }, 10000);
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

  if (!serviceBookings || serviceBookings.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#F8F6F0]">
        <div className="w-24 h-24 bg-white border border-[#E8DFD1] rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Car size={40} className="text-[#A8895C]" />
        </div>
        <h2 className="text-2xl font-serif text-[#1F2E27] mb-4">No scheduled transport to secure.</h2>
        <a href="#catalog" className="text-[#A8895C] underline hover:text-[#1F2E27] uppercase tracking-widest text-sm">Return to Catalog</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] pb-32">
      <div className="bg-[#1F2E27] py-10 md:py-12 mb-8 text-center border-b-4 border-[#A8895C] px-4">
        <h1 className="text-3xl md:text-4xl font-serif text-white tracking-wide mb-2">Secure Transport Booking</h1>
        <p className="text-[#E8DFD1] text-xs md:text-sm uppercase tracking-widest opacity-80">Fleet Orchestration & Payment Verification</p>
      </div>

      <div className="site-container max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column: Scheduled Fleet Logistics */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <h2 className="text-xl md:text-2xl font-serif text-[#1F2E27] border-b border-[#E8DFD1] pb-4">Fleet Logistics Summary</h2>
          
          <div className="flex flex-col gap-5">
            {serviceBookings.map((item, index) => (
              <div key={index} className="bg-white border border-[#E8DFD1] p-5 md:p-6 shadow-sm flex flex-col sm:flex-row gap-6 rounded-sm">
                <div className="w-full sm:w-1/3 aspect-[4/3] bg-[#F8F6F0] border border-[#E8DFD1] overflow-hidden rounded-sm flex-shrink-0">
                  <img src={item.images?.[0]} alt={item.title} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col">
                  <h3 className="text-xl font-serif text-[#1F2E27] mb-1">{item.title}</h3>
                  <p className="text-sm text-[#A8895C] font-medium mb-5 tracking-wide">KSh {item.price.toLocaleString()}</p>
                  
                  {item.rentalSchedule && (
                    <div className="bg-[#F8F6F0] p-4 md:p-5 rounded-sm border border-[#E8DFD1] space-y-4 mt-auto">
                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="text-[#A8895C] mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-[#3D3530] space-y-1.5">
                          <p><span className="font-semibold text-[#1F2E27] tracking-wide uppercase text-[11px]">Pick-up:</span> {item.rentalSchedule.pickup}</p>
                          <p><span className="font-semibold text-[#1F2E27] tracking-wide uppercase text-[11px]">Destination:</span> {item.rentalSchedule.dropoff}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 border-t border-[#E8DFD1] pt-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-[#A8895C]" />
                          <span className="text-sm text-[#3D3530] font-medium">{item.rentalSchedule.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-[#A8895C]" />
                          <span className="text-sm text-[#3D3530] font-medium">{item.rentalSchedule.time}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Payment & Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[#E8DFD1] shadow-sm p-6 md:p-8 rounded-sm sticky top-24">
            <h2 className="text-xl font-serif text-[#1F2E27] mb-6">Payment Authorization</h2>
            
            <div className="border-2 border-[#A8895C] bg-[#F8F6F0] p-4 flex items-center justify-between mb-8 cursor-pointer rounded-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-9 flex items-center justify-center bg-white rounded border border-[#E8DFD1]">
                  <img src={mpesaIcon} alt="M-Pesa" className="max-h-full max-w-full object-contain p-1.5" />
                </div>
                <span className="font-semibold text-[#1F2E27] tracking-wide">M-PESA Express</span>
              </div>
              <CheckCircle2 className="text-[#A8895C]" size={22} />
            </div>

            <div className="mb-8">
              // BEFORE (Has both block and flex)
// AFTER
<label className="text-sm font-medium text-[#3D3530] mb-3 flex items-center gap-2">
                <Phone size={16} className="text-[#A8895C]"/> Mobile Money Number
              </label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="e.g. 0712345678" 
                className="w-full p-4 border border-[#E8DFD1] bg-[#F8F6F0] focus:border-[#A8895C] focus:bg-white outline-none transition-colors rounded-sm text-lg tracking-wide" 
              />
            </div>

            <div className="border-t border-[#E8DFD1] pt-6 mb-8">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#3D3530] mb-5">Final Ledger</h3>
              <div className="flex justify-between text-sm text-[#3D3530] mb-3">
                <span>Fleet Total</span>
                <span className="font-medium">KSh {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-[#3D3530] mb-5">
                <span>Dispatch & Routing Fee</span>
                <span className="font-medium">KSh {bookingFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-[#1F2E27] pt-5 border-t border-[#E8DFD1]/50">
                <span>Total Due</span>
                <span className="text-[#A8895C]">KSh {totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {paymentError && <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm border border-red-200 rounded-sm leading-relaxed">{paymentError}</div>}
            {paymentMessage && <div className="mb-6 p-4 bg-green-50 text-green-800 text-sm border border-green-200 rounded-sm leading-relaxed">{paymentMessage}</div>}

            <button 
              onClick={handlePayment}
              disabled={isProcessing}
              className={`w-full py-4 md:py-5 uppercase tracking-widest text-sm font-semibold transition-all flex items-center justify-center gap-3 rounded-sm
                ${isProcessing ? "bg-[#3D3530] text-[#E8DFD1] cursor-not-allowed" : "bg-[#1F2E27] text-white hover:bg-[#A8895C] shadow-lg hover:shadow-xl hover:-translate-y-0.5"}`}
            >
              {isProcessing ? <><Loader2 size={20} className="animate-spin" /> Authorizing...</> : `Secure Booking KSh ${totalAmount.toLocaleString()}`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}