import React, { useState } from "react";
import { Button, Card } from "../components";
import api from "../services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // 1. Perform login via your API service
      await api.login(email, password); 
      
      // 2. IMPORTANT: Manually set the email in localStorage here
      // This ensures App.jsx detects the user immediately
      localStorage.setItem("userEmail", email);
      
      // 3. PRO-GRADE ROUTING: Use the hash system instead of href
      // This tells App.jsx to switch the ActivePage to MemorialOverview
      window.location.hash = "#memorial"; 
      
      // 4. Force a tiny reload or dispatch event so App.jsx refreshes its state
      window.dispatchEvent(new Event('storage'));
      
    } catch (err) {
      alert("Login failed: Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F8F6F0]">
      <Card className="w-full max-w-md p-8 border border-[#E8DFD1] shadow-lg">
        <h2 className="text-2xl font-serif text-[#1F2E27] mb-6">Welcome back</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-3 border border-[#E8DFD1] rounded bg-[#F8F6F0] focus:border-[#A8895C] outline-none"
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-3 border border-[#E8DFD1] rounded bg-[#F8F6F0] focus:border-[#A8895C] outline-none"
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <Button 
            variant="primary" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </Card>
    </div>
  );
}