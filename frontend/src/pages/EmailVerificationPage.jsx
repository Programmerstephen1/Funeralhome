import { getApiBaseUrl } from "../services/config";
import React, { useEffect, useState, useRef } from "react";
import { Mail, Check, RefreshCw, Clock } from "lucide-react";

export default function EmailVerificationPage({ userEmail }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [status, setStatus] = useState({ type: "", message: "" });
  const inputRefs = useRef([]);

  // PRO-GRADE FIX: Safely retrieve the email whether they are logged in or just registered
  const activeEmail = userEmail || localStorage.getItem("pendingVerificationEmail");

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = window.setTimeout(() => setResendCooldown((remaining) => remaining - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    const notice = localStorage.getItem("pendingVerificationNotice");
    if (notice) setStatus({ type: "error", message: notice });
  }, []);

  const handleChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && index > 0 && code[index] === "") {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (event) => {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    event.preventDefault();
    setCode([...digits, ...Array(6 - digits.length).fill("")]);
    inputRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const finalCode = code.join("");
    if (!activeEmail) {
      setStatus({ type: "error", message: "Your verification session expired. Please register again." });
      return;
    }
    if (finalCode.length !== 6) {
      setStatus({ type: "error", message: "Enter all six digits from the email." });
      return;
    }

      setIsVerifying(true);
      setStatus({ type: "", message: "" });
      try {
        const API_URL = getApiBaseUrl();
        const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // FIX: Now securely sends the activeEmail instead of a null prop
          body: JSON.stringify({ email: activeEmail, code: finalCode }),
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
          localStorage.removeItem("pendingVerificationEmail");
          localStorage.removeItem("pendingVerificationNotice");
          localStorage.setItem("verificationSuccessEmail", activeEmail);
          window.location.hash = "#login";
        } else {
          setStatus({ type: "error", message: data.message || "The code is invalid or expired. Request a new code and try again." });
          setCode(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
        }
      } catch (error) {
        console.error("Network Error:", error);
        setStatus({ type: "error", message: "We could not connect to the verification service. Please try again." });
      } finally {
        setIsVerifying(false);
      }
  };

  const handleResend = async () => {
    if (!activeEmail) return setStatus({ type: "error", message: "No pending email was found. Please register again." });
    if (resendCooldown > 0 || isResending) return;

    const API_URL = getApiBaseUrl();

    try {
      setIsResending(true);
      setStatus({ type: "", message: "" });
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: activeEmail, purpose: "verify" }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        localStorage.removeItem("pendingVerificationNotice");
        setStatus({ type: "success", message: data.message || "A new code has been sent. Check your inbox and spam folder." });
        setResendCooldown(30);
      } else {
        setStatus({ type: "error", message: data.message || "We could not resend the code. Please try again." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "We could not connect to resend the code. Please try again." });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-[#F8F6F0] flex flex-col items-center justify-center p-4">
      
      <div className="w-20 h-20 bg-white border border-[#E8DFD1] rounded-full flex items-center justify-center mb-8 shadow-sm">
        <Mail className="text-[#A8895C]" size={32} />
      </div>

      <div className="text-center mb-10">
        <h1 className="text-4xl font-serif font-semibold text-[#1F2E27] mb-3">
          Verify Your Email
        </h1>
        <p className="text-[#3D3530] text-lg">
          Enter the 6-digit code we sent to
        </p>
        <p className="text-[#A8895C] font-semibold mt-1">
          {activeEmail || "your email address"}
        </p>
        {status.message && <p role="status" className={`mx-auto mt-4 max-w-md rounded p-3 text-sm ${status.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{status.message}</p>}
      </div>

      <div className="bg-white border border-[#E8DFD1] rounded-2xl shadow-lg p-8 md:p-10 w-full max-w-md">
        
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[#A8895C] font-bold">#</span>
          <label className="text-sm tracking-widest uppercase font-semibold text-[#1F2E27]">
            6-Digit Code
          </label>
        </div>

        <div className="flex justify-between gap-2 md:gap-3 mb-6">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-serif font-bold text-[#1F2E27] bg-[#F8F6F0] border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C] focus:bg-white transition-all shadow-inner"
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-[#3D3530] mb-8">
          <Clock size={16} className="text-[#A8895C]" />
          <span>Code expires in 10 minutes</span>
        </div>

        <button 
          onClick={handleVerify}
            disabled={isVerifying || code.join("").length !== 6}
          className={`w-full text-white py-4 rounded transition-colors flex items-center justify-center gap-2 uppercase tracking-widest font-semibold text-sm shadow-md ${
            isVerifying ? "bg-[#3D3530] cursor-not-allowed" : "bg-[#1F2E27] hover:bg-[#A8895C]"
          }`}
        >
          {isVerifying ? "Verifying..." : <><Check size={18} /> Verify Email</>}
        </button>

        <div className="mt-8 text-center border-t border-[#E8DFD1] pt-6">
          <p className="text-[#3D3530] text-sm mb-3">Didn't receive the code?</p>
          <button 
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
            className="flex items-center justify-center gap-2 text-[#A8895C] hover:text-[#1F2E27] disabled:cursor-not-allowed disabled:opacity-50 font-semibold text-sm tracking-wider uppercase transition-colors w-full"
          >
            <RefreshCw size={16} className={isResending ? "animate-spin" : ""} /> {isResending ? "Sending…" : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
          </button>
        </div>

      </div>
    </div>
  );
}
