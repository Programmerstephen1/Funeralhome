import React from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function ThankYouPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-[#F8F6F0] rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="text-[#A8895C]" size={48} />
      </div>
      <h2 className="text-3xl font-serif text-[#1F2E27] mb-4">Arrangements Confirmed</h2>
      <p className="text-[#3D3530] max-w-md mb-8 leading-relaxed">
        Thank you for trusting Hollow Pine Funeral Home. Our logistics team has received your details and will coordinate with the funeral home to ensure everything is prepared with care and precision.
      </p>
      <a 
        href="#home" 
        className="flex items-center gap-2 text-[#A8895C] font-semibold hover:text-[#1F2E27] transition-colors"
      >
        Return to Home <ArrowRight size={18} />
      </a>
    </div>
  );
}