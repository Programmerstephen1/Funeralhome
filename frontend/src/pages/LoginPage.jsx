import React, { useState } from "react";
import { AlertCircle, Loader2, Mail, Lock } from "lucide-react";
import { Button, Card } from "../components";
import api from "../services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    setFeedback({ type: "", message: "" });
    setIsLoading(true);

    try {
      const data = await api.login(email, password);
      localStorage.setItem("userEmail", email);
      if (data?.is_verified === false) {
        window.location.hash = "#verify";
      } else {
        window.location.hash = "#memorial";
      }
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Invalid credentials. Please check your details and try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F6F0] px-4 py-12">
      <Card className="w-full max-w-md border border-[#E8DFD1] p-8 shadow-lg">
        <h2 className="mb-6 text-2xl font-serif text-[#1F2E27]">Welcome back</h2>
        {feedback.message && (
          <div className={`mb-4 flex items-start gap-2 rounded border px-3 py-3 text-sm ${feedback.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`} role="alert">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{feedback.message}</span>
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block text-sm font-semibold text-[#1F2E27]">
            <span className="mb-2 block">Email</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A8895C]" size={18} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-[#E8DFD1] bg-[#F8F6F0] p-3 pl-10 outline-none transition-colors focus:border-[#A8895C]"
                required
              />
            </div>
          </label>
          <label className="block text-sm font-semibold text-[#1F2E27]">
            <span className="mb-2 block">Password</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A8895C]" size={18} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-[#E8DFD1] bg-[#F8F6F0] p-3 pl-10 outline-none transition-colors focus:border-[#A8895C]"
                required
              />
            </div>
          </label>
          <Button variant="primary" className="w-full" disabled={isLoading}>
            {isLoading ? <><Loader2 size={16} className="mr-2 animate-spin" /> Signing In...</> : "Sign In"}
          </Button>
        </form>
        <div className="mt-5 text-center text-sm text-[#3D3530]">
          <a href="#forgot-password" className="font-semibold text-[#A8895C] hover:text-[#1F2E27]">Forgot password?</a>
        </div>
      </Card>
    </div>
  );
}