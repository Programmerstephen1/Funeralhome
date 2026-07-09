import React, { useState } from "react";
import { UserPlus, Lock, Mail, Loader2 } from "lucide-react";
import api from "../services/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError("");

    if (!email.trim() || password.length < 6) {
      setAuthError("Please enter a valid email and a password with at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setAuthError("Passwords do not match. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      await api.register(email, password);
      await api.sendOtp(email);
      localStorage.setItem("userEmail", email);
      window.location.hash = "#verify";
    } catch (error) {
      setAuthError(error.message || "Registration failed. Is the backend running?");
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
          <p className="text-[#3D3530] text-sm">Join Last Planner Julz Hub.</p>
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
            {isLoading ? <><Loader2 size={18} className="animate-spin" /> Creating Account...</> : <><UserPlus size={18} /> Register</>}
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