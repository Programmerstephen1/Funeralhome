import React, { useState, useRef } from "react";
import { Mail, Check, RefreshCw, Clock } from "lucide-react";

export default function EmailVerificationPage({ userEmail }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^[0-9]*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-advance to the next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Auto-backspace to the previous input
    if (e.key === "Backspace" && index > 0 && code[index] === "") {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const finalCode = code.join("");
    if (finalCode.length === 6) {
      setIsVerifying(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || window.location.origin;
        const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, code: finalCode }),
        });

        const data = await response.json();

        if (response.ok) {
          // Success! Route them to the Memorial Hub
          window.location.hash = "#memorial"; 
        } else {
          alert(`Verification failed: ${data.message}`);
          // Clear inputs on failure so they can try again
          setCode(["", "", "", "", "", ""]);
          inputRefs.current[0].focus();
        }
      } catch (error) {
        console.error("Network Error:", error);
        alert("Could not connect to the server. Is your Python backend running?");
      } finally {
        setIsVerifying(false);
      }
    } else {
      alert("Please enter the full 6-digit code.");
    }
  };

  const handleResend = async () => {
    const emailToUse = userEmail || localStorage.getItem("userEmail");
    if (!emailToUse) return alert("No email found. Please register again.");

    const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToUse }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        alert(data.message || "A new code has been sent to your email!");
      } else {
        alert(data.message || "Failed to resend code. Please try again.");
      }
    } catch (error) {
      alert("Could not connect to the server to resend the code.");
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
          {userEmail || "your email address"}
        </p>
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
          disabled={isVerifying}
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
            className="flex items-center justify-center gap-2 text-[#A8895C] hover:text-[#1F2E27] font-semibold text-sm tracking-wider uppercase transition-colors w-full"
          >
            <RefreshCw size={16} /> Resend Code
          </button>
        </div>

      </div>
    </div>
  );
}