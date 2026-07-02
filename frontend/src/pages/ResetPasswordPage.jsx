import React, { useState, useRef } from "react";
import { ShieldCheck, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  const userEmail = localStorage.getItem("resetEmail");

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

  const handleReset = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    const finalCode = code.join("");
    if (finalCode.length !== 6) return setStatus({ type: "error", message: "Please enter the full 6-digit code." });
    if (newPassword !== confirmPassword) return setStatus({ type: "error", message: "Passwords do not match." });
    if (newPassword.length < 6) return setStatus({ type: "error", message: "Password must be at least 6 characters long." });

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, code: finalCode, new_password: newPassword }),
      });

      if (response.ok) {
        alert("Password reset successfully! You can now log in.");
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
            <ShieldCheck className="text-[#A8895C]" size={28} />
          </div>
          <h2 className="text-3xl font-serif text-[#1F2E27] mb-2">Secure Reset</h2>
          <p className="text-[#3D3530] text-sm">Enter the code sent to {userEmail || "your email"}</p>
        </div>

        {status.message && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 text-sm rounded">
            {status.message}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-6">
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
                  className="w-12 h-14 text-center text-xl font-serif font-bold text-[#1F2E27] bg-[#F8F6F0] border border-[#E8DFD1] rounded focus:outline-none focus:border-[#A8895C] focus:bg-white transition-all shadow-inner"
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1F2E27] mb-2 uppercase tracking-wider">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8895C]" size={18} />
              <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-[#F8F6F0] border border-[#E8DFD1] focus:border-[#A8895C] focus:bg-white outline-none rounded" placeholder="••••••••" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1F2E27] mb-2 uppercase tracking-wider">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8895C]" size={18} />
              <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-[#F8F6F0] border border-[#E8DFD1] focus:border-[#A8895C] focus:bg-white outline-none rounded" placeholder="••••••••" />
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