import { getApiBaseUrl } from "../services/config";
import React, { useEffect, useState, useRef } from "react";
import { ShieldCheck, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  const userEmail = localStorage.getItem("resetEmail");

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = window.setTimeout(() => setResendCooldown((remaining) => remaining - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  const handleCodeChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value !== "" && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && index > 0 && code[index] === "") {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleCodePaste = (event) => {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    event.preventDefault();
    setCode([...digits, ...Array(6 - digits.length).fill("")]);
    inputRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  const handleResendCode = async () => {
    if (!userEmail || isResending || resendCooldown > 0) return;
    setIsResending(true);
    setStatus({ type: "", message: "" });
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, purpose: "reset" }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus({ type: "error", message: data.message || "We could not resend a code. Please try again." });
        return;
      }
      setCode(["", "", "", "", "", ""]);
      setStatus({ type: "success", message: "If an account exists for this email, a new code has been sent." });
      setResendCooldown(30);
    } catch (error) {
      setStatus({ type: "error", message: "We could not connect to resend your code. Please try again." });
    } finally {
      setIsResending(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    const finalCode = code.join("");
    if (finalCode.length !== 6) return setStatus({ type: "error", message: "Please enter the full 6-digit code." });
    if (newPassword !== confirmPassword) return setStatus({ type: "error", message: "Passwords do not match." });
    if (!userEmail) return setStatus({ type: "error", message: "Your password reset session expired. Request a new code." });
    if (newPassword.length < 8) return setStatus({ type: "error", message: "Choose a password with at least 8 characters." });
    if (new TextEncoder().encode(newPassword).length > 72) return setStatus({ type: "error", message: "Password must be 72 bytes or fewer." });

    setIsLoading(true);

    try {
      const API_URL = getApiBaseUrl();
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, code: finalCode, new_password: newPassword }),
      });

      if (response.ok) {
        localStorage.removeItem("resetEmail");
        localStorage.setItem("passwordResetSuccess", "true");
        window.location.hash = "#login";
      } else {
        const data = await response.json();
        setStatus({ type: "error", message: data.message || "Failed to reset password." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Network error. Is the server running?" });
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
            <ShieldCheck className="text-[#805400]" size={28} />
          </div>
          <h1 className="text-3xl font-serif text-[#1F2E27] mb-2">Secure Reset</h1>
          <p className="text-[#3D3530] text-sm">Enter the code sent to {userEmail || "your email"}</p>
          <p className="mt-2 text-xs text-[#716860]">If an account exists, a code will arrive shortly. Check your spam folder if it does not appear.</p>
        </div>

        {status.message && (
          <div role="status" className={`mb-6 p-4 text-sm rounded border ${status.type === "error" ? "bg-red-50 text-red-700 border-red-100" : "bg-green-50 text-green-800 border-green-100"}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-6">
          {!userEmail && <a href="#forgot-password" className="block text-center text-sm font-semibold text-[#805400] underline">Request a new reset code</a>}
          {/* Pro OTP Input */}
          <div>
            <label className="block text-sm font-semibold text-[#1F2E27] mb-3 uppercase tracking-wider text-center">6-Digit Code</label>
            <div className="flex justify-between gap-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handleCodePaste}
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  className="w-12 h-14 text-center text-xl font-serif font-bold text-[#1F2E27] bg-[#F8F6F0] border border-[#E8DFD1] rounded focus:outline-none focus:border-[#A8895C] focus:bg-white transition-all shadow-inner"
                />
              ))}
            </div>
            <button type="button" onClick={handleResendCode} disabled={!userEmail || isResending || resendCooldown > 0} className="mt-3 w-full text-center text-sm font-semibold text-[#805400] hover:text-[#1F2E27] disabled:cursor-not-allowed disabled:opacity-50">
              {isResending ? "Sending…" : resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend reset code"}
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1F2E27] mb-2 uppercase tracking-wider">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#805400]" size={18} />
              <input type="password" required minLength={8} maxLength={72} autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-[#F8F6F0] border border-[#E8DFD1] focus:border-[#A8895C] focus:bg-white outline-none rounded" placeholder="At least 8 characters" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1F2E27] mb-2 uppercase tracking-wider">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#805400]" size={18} />
              <input type="password" required minLength={8} maxLength={72} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-[#F8F6F0] border border-[#E8DFD1] focus:border-[#A8895C] focus:bg-white outline-none rounded" placeholder="Confirm your new password" />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-4 uppercase tracking-widest text-sm font-semibold flex items-center justify-center gap-2 rounded shadow-md bg-[#1F2E27] text-white hover:bg-[#A8895C] transition-all">
            {isLoading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
