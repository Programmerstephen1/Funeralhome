import React, { useState } from "react";
import { UserPlus, Lock, Mail } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 🔴 FIXED: Your actual live Render Backend URL
// Dynamically use environment variable if set, otherwise fall back to deployed URL or localhost
const API_URL = import.meta.env.VITE_API_URL 
  || "https://startup-simulator-v2.onrender.com" 
  || "http://localhost:5000";

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError("");

    if (password !== confirmPassword) {
      setAuthError("Passwords do not match. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const registerData = await registerResponse.json();

      if (registerResponse.ok) {
        const otpResponse = await fetch(`${API_URL}/api/auth/send-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (otpResponse.ok) {
          localStorage.setItem("userEmail", email);
          window.location.hash = "#verify";
        } else {
          setAuthError("Account created, but failed to send the verification email. Your email provider may be blocking it.");
        }
      } else {
        setAuthError(registerData.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Network error:", error);
      setAuthError("Could not connect to the server. Is your Python backend running?");
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
            <UserPlus className="text-[#A8895C]" size={28} />
          </div>
          <h2 className="text-3xl font-serif text-[#1F2E27] mb-2">Create Account</h2>
          <p className="text-[#3D3530] text-sm">Join last planner julz Hub.</p>
        </div>

        {authError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded">
            {authError}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
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

          <div>
            <label className="block text-sm font-semibold text-[#1F2E27] mb-2 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8895C]" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F8F6F0] border border-[#E8DFD1] focus:border-[#A8895C] focus:bg-white outline-none transition-colors rounded text-[#3D3530]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1F2E27] mb-2 uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8895C]" size={18} />
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F8F6F0] border border-[#E8DFD1] focus:border-[#A8895C] focus:bg-white outline-none transition-colors rounded text-[#3D3530]"
                placeholder="••••••••"
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
            {isLoading ? "Creating Account..." : <><UserPlus size={18} /> Register</>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#E8DFD1] text-center">
          <p className="text-[#3D3530] text-sm">
            Already have an account? <a href="#login" className="text-[#A8895C] font-semibold hover:text-[#1F2E27] transition-colors">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  );
}