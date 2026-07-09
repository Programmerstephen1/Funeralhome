import React, { useState } from "react";
import { KeyRound, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const API_URL = import.meta.env.VITE_API_URL || window.location.origin;
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        localStorage.setItem("resetEmail", email);
        setStatus({ type: "success", message: data.message || "Reset code sent. Please check your inbox." });
        window.location.hash = "#reset-password";
      } else {
        setStatus({ type: "error", message: data.message || "Failed to send reset code." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Network error. Please try again shortly." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#F8F6F0] py-12 px-4">
      <div className="bg-white border border-[#E8DFD1] p-10 max-w-md w-full shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#A8895C]"></div>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#F8F6F0] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E8DFD1]">
            <KeyRound className="text-[#A8895C]" size={28} />
          </div>
          <h2 className="text-3xl font-serif text-[#1F2E27] mb-2">Forgot Password</h2>
          <p className="text-[#3D3530] text-sm">Enter your email to receive a secure reset code.</p>
        </div>

        {status.message && (
          <div className={`mb-6 p-4 text-sm rounded border ${status.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleRequestReset} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#1F2E27] mb-2 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8895C]" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F8F6F0] border border-[#E8DFD1] focus:border-[#A8895C] focus:bg-white outline-none transition-colors rounded text-[#3D3530]"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-4 mt-4 uppercase tracking-widest text-sm font-semibold flex items-center justify-center gap-2 transition-all rounded shadow-md ${
              isLoading ? "bg-[#3D3530] text-white cursor-not-allowed" : "bg-[#1F2E27] text-white hover:bg-[#A8895C]"
            }`}
          >
            {isLoading ? <><Loader2 size={18} className="animate-spin" /> Sending Code...</> : <>Send Reset Code <ArrowRight size={18} /></>}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <a href="#login" className="text-sm text-[#A8895C] font-semibold hover:text-[#1F2E27] transition-colors">Return to Sign In</a>
        </div>
      </div>
    </div>
  );
}