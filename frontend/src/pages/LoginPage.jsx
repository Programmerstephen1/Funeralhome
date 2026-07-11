import React, { useState } from "react";
import { AlertCircle, Loader2, Mail, Lock } from "lucide-react";
import { Button, Card } from "../components";
import api from "../services/api";
import { useNavigate, useLocation, Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from?.pathname || "/memorial";

  const handleLogin = async (e) => {
    e.preventDefault();
    setFeedback({ type: "", message: "" });
    setIsLoading(true);

    try {
      const data = await api.login(email, password);
      
      localStorage.setItem("userEmail", email);
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      
      window.dispatchEvent(new Event("storage"));

      if (data?.is_verified === false) {
        navigate("/verify", { replace: true });
      } else {
        navigate(destination, { replace: true });
      }
      
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Invalid credentials. Please check your details and try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[#F8F6F0] px-4 py-12">
      <Card className="w-full max-w-md border border-[#E8DFD1] p-8 shadow-lg">
        <h2 className="mb-6 text-2xl font-serif text-[#1F2E27] text-center">Welcome back</h2>
        
        {feedback.message && (
          <div className={`mb-4 flex items-start gap-2 rounded border px-3 py-3 text-sm ${feedback.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`} role="alert">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{feedback.message}</span>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block text-sm font-semibold text-[#1F2E27]">
            <span className="mb-2 block uppercase tracking-wider">Email Address</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A8895C]" size={18} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-[#E8DFD1] bg-[#F8F6F0] p-3 pl-10 outline-none transition-colors focus:border-[#A8895C]"
                required
              />
            </div>
          </label>
          <label className="block text-sm font-semibold text-[#1F2E27]">
            <span className="mb-2 block uppercase tracking-wider">Password</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A8895C]" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-[#E8DFD1] bg-[#F8F6F0] p-3 pl-10 outline-none transition-colors focus:border-[#A8895C]"
                required
              />
            </div>
          </label>
          <Button variant="primary" className="w-full shadow-md py-4 mt-2 uppercase tracking-widest text-sm font-bold" disabled={isLoading}>
            {isLoading ? <><Loader2 size={16} className="mr-2 inline animate-spin" /> Signing In...</> : "Sign In"}
          </Button>
        </form>

        <div className="mt-5 text-center text-sm text-[#3D3530]">
          <Link to="/forgot-password" className="font-semibold text-[#A8895C] hover:text-[#1F2E27] transition-colors">Forgot password?</Link>
        </div>

        {/* --- PRO-GRADE OAUTH BUTTONS START --- */}
        <div className="mt-8 mb-2">
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
      </Card>
    </div>
  );
}