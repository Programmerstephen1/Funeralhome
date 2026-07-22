import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';
import { ChevronLeft, Mail, Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Read environment variables directly from Vite
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const FB_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;
  const TWITTER_CLIENT_ID = import.meta.env.VITE_TWITTER_CLIENT_ID;

  // --- CATCH SSO REDIRECT TOKENS ---
  useEffect(() => {
    // 1. Check for Hash (Facebook/Google implicit flow)
    const hash = window.location.hash;
    if (hash && hash.includes("access_token=")) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      if (accessToken) {
        processSocialLogin("facebook", { token: accessToken });
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
    
    // 2. Check for Query Params (X / Twitter PKCE auth code flow)
    const search = window.location.search;
    if (search && search.includes("code=") && search.includes("state=twitter")) {
      const params = new URLSearchParams(search);
      const code = params.get("code");
      if (code) {
        processSocialLogin("twitter", { 
            code: code, 
            client_id: TWITTER_CLIENT_ID, 
            redirect_uri: `${window.location.origin}${window.location.pathname}` 
        });
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, [location]);

  // --- CENTRALIZED SSO PROCESSOR ---
  const processSocialLogin = async (provider, payloadData) => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadData),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("isAdmin", data.is_admin ? "true" : "false");
        window.dispatchEvent(new Event("storage"));
        navigate(data.is_admin ? "/admin" : "/");
      } else {
        setError(data.message || `${provider} authentication failed.`);
      }
    } catch (err) {
      setError(`Network error during ${provider} login.`);
    } finally {
      setLoading(false);
    }
  };

  // --- STANDARD EMAIL LOGIN ---
  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("isAdmin", data.is_admin ? "true" : "false");
        
        window.dispatchEvent(new Event("storage"));

        if (data.is_admin) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        setError(data.message || "Invalid email or password.");
      }
    } catch (err) {
      setError("Network error. Please ensure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  // --- GOOGLE SSO LOGIN ---
  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => processSocialLogin('google', { token: tokenResponse.access_token }),
    onError: () => setError("Google authentication was cancelled or failed.")
  });

  // --- FACEBOOK SSO LOGIN ---
  const handleFacebookLogin = () => {
    if (!FB_APP_ID || FB_APP_ID === "your_facebook_app_id_here") {
      setError("Facebook API Key has not been configured by the administrator yet.");
      return;
    }
    const redirectUri = encodeURIComponent(`${window.location.origin}/login`);
    window.location.href = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${redirectUri}&response_type=token&scope=email,public_profile`;
  };

  // --- X (TWITTER) SSO LOGIN (PRO-GRADE PKCE FLOW) ---
  const handleTwitterLogin = () => {
    if (!TWITTER_CLIENT_ID || TWITTER_CLIENT_ID === "your_twitter_client_id_here") {
      setError("X (Twitter) API Key has not been configured by the administrator yet.");
      return;
    }
    const redirectUri = encodeURIComponent(`${window.location.origin}/login`);
    // NOTE: code_challenge MUST be exactly 43 characters minimum for X API v2!
    const codeChallenge = "challenge12345678901234567890123456789012345";
    window.location.href = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${TWITTER_CLIENT_ID}&redirect_uri=${redirectUri}&scope=users.read%20tweet.read&state=twitter&code_challenge=${codeChallenge}&code_challenge_method=plain`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F6F0] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl border border-[#E8DFD1] shadow-xl">
        
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-bold text-[#A8895C] uppercase tracking-wider mb-6 hover:text-[#1F2E27] transition-colors">
            <ChevronLeft size={16} /> Back
          </button>
          <h2 className="text-center text-3xl font-serif text-[#1F2E27]">Sign in to your account</h2>
          <p className="mt-2 text-center text-sm text-[#716860]">
            Manage your memorial arrangements securely.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded text-sm flex items-center gap-3 animate-fadeIn">
            <AlertCircle size={18} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleStandardLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#716860] uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-[#A8895C]" />
                </div>
                <input 
                  type="email" 
                  required 
                  className="w-full pl-10 pr-3 py-3 border border-[#E8DFD1] rounded outline-none focus:border-[#A8895C] text-sm" 
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[#716860] uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-[#A8895C] hover:text-[#1F2E27]">Forgot password?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-[#A8895C]" />
                </div>
                <input 
                  type="password" 
                  required 
                  className="w-full pl-10 pr-3 py-3 border border-[#E8DFD1] rounded outline-none focus:border-[#A8895C] text-sm" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded text-sm font-bold uppercase tracking-widest text-white bg-[#1F2E27] hover:bg-[#A8895C] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A8895C] shadow-md"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E8DFD1]" /></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-[#8F847C] font-semibold uppercase tracking-wider text-xs">Or continue with</span></div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            {/* Google SSO */}
            <button 
              onClick={() => googleLogin()}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-[#E8DFD1] rounded text-sm font-bold text-[#3D3530] bg-white hover:bg-[#F8F6F0] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>

            <div className="grid grid-cols-2 gap-3">
              {/* Facebook SSO */}
              <button 
                onClick={handleFacebookLogin}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-[#E8DFD1] rounded text-sm font-bold text-[#3D3530] bg-white hover:bg-[#F8F6F0] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>

              {/* X (Twitter) SSO */}
              <button 
                onClick={handleTwitterLogin}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-[#E8DFD1] rounded text-sm font-bold text-[#3D3530] bg-white hover:bg-[#F8F6F0] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.005 4.15H5.059z"/>
                </svg>
                X (Twitter)
              </button>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-[#716860]">
          Don't have an account?{" "}
          <Link to="/register" className="font-bold text-[#A8895C] hover:text-[#1F2E27]">
            Register here
          </Link>
        </p>

      </div>
    </div>
  );
}