import React, { useState } from "react";
import { UserPlus, Lock, Mail, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // PRO-GRADE: Added React Router hooks
import api from "../services/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate(); // Hook for seamless page transitions

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
      navigate("/verify"); // Seamless React routing instead of window.location
    } catch (error) {
      setAuthError(error.message || "Registration failed. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#F8F6F0] py-12 px-4">
      <div className="bg-white border border-[#E8DFD1] p-10 max-w-md w-full shadow-lg relative overflow-hidden rounded-xl">
        
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

        {/* --- PRO-GRADE OAUTH BUTTONS START --- */}
        <div className="mt-8 mb-6">
          <div className="flex items-center justify-between">
            <span className="w-1/5 border-b border-[#E8DFD1] lg:w-1/4"></span>
            <span className="text-[10px] text-center text-[#8F847C] uppercase tracking-widest font-bold">
              Or continue with
            </span>
            <span className="w-1/5 border-b border-[#E8DFD1] lg:w-1/4"></span>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {/* Google Button */}
            <button type="button" className="flex items-center justify-center py-3 px-4 border border-[#E8DFD1] rounded-lg hover:bg-[#F8F6F0] hover:border-[#A8895C] transition-all shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 15.02 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            </button>

            {/* X (Twitter) Button */}
            <button type="button" className="flex items-center justify-center py-3 px-4 border border-[#E8DFD1] rounded-lg hover:bg-[#F8F6F0] hover:border-[#A8895C] transition-all shadow-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.005 4.15H5.059z"/>
              </svg>
            </button>

            {/* Facebook Button */}
            <button type="button" className="flex items-center justify-center py-3 px-4 border border-[#E8DFD1] rounded-lg hover:bg-[#F8F6F0] hover:border-[#A8895C] transition-all shadow-sm">
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
          </div>
        </div>
        {/* --- PRO-GRADE OAUTH BUTTONS END --- */}

        <div className="mt-8 pt-6 border-t border-[#E8DFD1] text-center">
          <p className="text-[#3D3530] text-sm">
            Already have an account? <Link to="/login" className="text-[#A8895C] font-semibold hover:text-[#1F2E27] transition-colors">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}