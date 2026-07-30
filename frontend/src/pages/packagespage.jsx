import React from "react";
import { Phone, MessageCircle, Mail, CheckCircle2, Diamond, Gem, Crown, Sparkles } from "lucide-react";

const signaturePackages = [
  {
    name: "Diamond",
    icon: <Diamond size={32} className="text-[#A8895C] mb-4" />,
    subtitle: "Essential Care",
    description: "A dignified and essential arrangement covering the fundamental requirements with profound respect.",
    price: "Consultation Required",
    note: "*Price dependent on no. of mourners",
    themeClasses: "bg-white/80 backdrop-blur-md border-[#D8CFBC]",
    buttonTheme: "bg-[#1F2E27] text-white hover:bg-[#A8895C]",
    features: ["Corpse transport", "Standard casket", "Floral wreaths", "Portrait stand"]
  },
  {
    name: "Opals",
    icon: <Sparkles size={32} className="text-[#A8895C] mb-4" />,
    subtitle: "Standard Tribute",
    description: "A comprehensive tribute that ensures the family is transported together alongside beautiful memorial additions.",
    price: "Consultation Required",
    note: "*Price dependent on no. of mourners",
    themeClasses: "bg-white/90 backdrop-blur-md border-[#A8895C]/50 shadow-lg",
    buttonTheme: "bg-[#1F2E27] text-white hover:bg-[#A8895C]",
    features: ["Family transport", "Corpse transport", "Deceased attire", "Standard casket", "Floral wreaths", "Portrait stand"]
  },
  {
    name: "Rubies",
    icon: <Gem size={32} className="text-[#A8895C] mb-4" />,
    subtitle: "Premium Memorial",
    description: "An elevated package that handles all transport, attire, and professional media coverage for lasting memories.",
    price: "Consultation Required",
    note: "*Price dependent on no. of mourners",
    themeClasses: "bg-[#F8F6F0]/95 backdrop-blur-md border-[#A8895C] shadow-xl scale-100 lg:scale-105 z-10",
    buttonTheme: "bg-[#A8895C] text-white hover:bg-[#8F744D]",
    features: ["Family transport", "Corpse transport", "Family attire", "Premium casket", "Floral wreaths", "Portrait stand", "Videography & photography"]
  },
  {
    name: "Emerald",
    icon: <Crown size={32} className="text-[#A8895C] mb-4" />,
    subtitle: "Complete Orchestration",
    description: "Our highest tier of service. We handle every single logistical detail, allowing you to focus entirely on family.",
    price: "Custom Quote",
    note: "*Price dependent on no. of mourners",
    themeClasses: "bg-[#1F2E27]/95 backdrop-blur-md border-emerald-700/50 shadow-2xl text-white ring-1 ring-emerald-500/30",
    buttonTheme: "bg-[#A8895C] text-white hover:bg-[#8F744D]",
    textColor: "text-gray-300",
    features: ["Catering services", "Tents and chairs", "Family transport", "Corpse transport", "Family attire", "Premium casket", "Floral wreaths", "Portrait stand", "Repatriation services", "Videography & photography"]
  }
];

export default function PackagesPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
      
      {/* Animated CSS Background (Mimics a slow, elegant video aura) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1F2E27] via-[#0a0a0a] to-[#2c241b] opacity-90 animate-gradient-slow"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#A8895C] mix-blend-screen filter blur-[150px] opacity-20 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#1F2E27] mix-blend-screen filter blur-[150px] opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-emerald-900 mix-blend-screen filter blur-[150px] opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 pt-24 pb-20 px-4">
        
        {/* Page Header - Cleaned up to only feature the mantra */}
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fadeIn">
          <h1 className="text-3xl md:text-5xl text-white font-serif italic drop-shadow-lg leading-relaxed">
            "With you when you need us the most."
          </h1>
        </div>

        {/* The Interactive Packages Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-6 items-center">
          {signaturePackages.map((pkg, idx) => (
            <div 
              key={idx} 
              className={`rounded-3xl border p-8 flex flex-col transition-all duration-500 ease-out hover:-translate-y-4 hover:shadow-[0_20px_40px_rgba(168,137,92,0.15)] ${pkg.themeClasses} animate-slideUp`}
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              
              <div className="mb-6 pb-6 border-b border-gray-300/20">
                {pkg.icon}
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#A8895C]">
                  {pkg.subtitle}
                </span>
                <h3 className={`text-3xl font-serif font-bold mt-2 ${pkg.name === 'Emerald' ? 'text-white' : 'text-[#1F2E27]'}`}>
                  {pkg.name}
                </h3>
                <p className={`mt-3 text-sm leading-relaxed ${pkg.textColor || 'text-[#716860]'}`}>
                  {pkg.description}
                </p>
              </div>

              <div className="mb-8">
                <p className={`text-xl font-bold ${pkg.name === 'Emerald' ? 'text-emerald-400' : 'text-[#1F2E27]'}`}>
                  {pkg.price}
                </p>
                <p className="text-xs font-semibold text-[#A8895C] mt-1">
                  {pkg.note}
                </p>
              </div>

              <ul className="flex-grow space-y-4 mb-10">
                {pkg.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className={`shrink-0 mt-0.5 ${pkg.name === 'Emerald' ? 'text-[#A8895C]' : 'text-emerald-700'}`} />
                    <span className={`text-sm font-medium ${pkg.textColor || 'text-[#3D3530]'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Action Buttons */}
              <div className="mt-auto space-y-3 pt-6 border-t border-gray-300/20">
                <p className="text-center text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">
                  Request an Appointment
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <a href="tel:+254799847727" className="flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-colors bg-black/5 text-[#A8895C] border border-[#A8895C]/30 hover:bg-[#A8895C] hover:text-white">
                    <Phone size={14} /> Call
                  </a>
                  <a href="https://wa.me/254799847727" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-colors bg-black/5 text-[#A8895C] border border-[#A8895C]/30 hover:bg-green-600 hover:border-green-600 hover:text-white">
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                </div>
                
                <a 
                  href={`mailto:lastplannerjulzlimited@gmail.com?subject=Inquiry:%20${pkg.name}%20Package`}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-lg text-sm font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-lg ${pkg.buttonTheme}`}
                >
                  <Mail size={16} /> Email Us
                </a>
              </div>

            </div>
          ))}
        </div>

        {/* Footer Disclaimer */}
        <div className="max-w-3xl mx-auto mt-20 text-center bg-black/40 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
          <p className="text-sm text-gray-300 leading-relaxed">
            <strong className="text-white">Please note:</strong> To initiate our formal event orchestration and planning services, an upfront payment of <strong className="text-[#A8895C]">10% of the total estimated planning fee</strong> is required.
          </p>
        </div>

      </div>

      {/* Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 15s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.8s ease-out forwards;
          opacity: 0;
        }
      `}} />
    </div>
  );
}