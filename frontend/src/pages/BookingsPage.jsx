import React from "react";
import { CalendarDays, Car, ArrowRight, Trash2, Clock3, ShieldCheck } from "lucide-react";

export default function BookingsPage({ serviceBookings = [], removeRental }) {
  
  const handleProceed = () => {
    window.location.hash = "#booking-checkout";
  };

  if (serviceBookings.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#F8F6F0] px-4 py-16">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#E8DFD1] bg-white shadow-sm">
          <CalendarDays className="text-[#A8895C]" size={32} />
        </div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#A8895C]">Service requests</p>
        <h2 className="mb-4 text-2xl font-serif text-[#1F2E27]">No service requests yet</h2>
        <p className="mb-8 max-w-md text-center text-[#3D3530]">You haven't requested any vehicles or support services yet. Browse our transport and setup options to begin a thoughtful arrangement.</p>
        
        <a href="#catalog" className="rounded-full bg-[#1F2E27] px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-[#A8895C]">
          Browse Services
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] pb-32 pt-12">
      <div className="site-container max-w-4xl mx-auto px-4">
        <div className="mb-12 text-center">
          <p className="section-eyebrow">Service requests</p>
          <h2 className="mb-4 text-4xl font-serif font-semibold text-[#1F2E27]">Service Requests</h2>
          <p className="text-[#3D3530]">Review your requested vehicles and logistical services in one calm, organized place.</p>
        </div>

        <div className="mb-6 rounded-[1.25rem] border border-[#E8DFD1] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full bg-[#F8F6F0] p-2 text-[#A8895C]">
              <ShieldCheck size={16} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#A8895C]">Prepared for review</p>
              <p className="text-sm text-[#3D3530]">Each request is kept organized so your planning stays simple and calm.</p>
            </div>
          </div>
        </div>

        <div className="relative mb-8 border border-[#E8DFD1] bg-white p-6 shadow-sm">
          <h3 className="text-xl font-serif text-[#1F2E27] mb-6 flex items-center gap-2 border-b border-[#E8DFD1] pb-4">
            <Car className="text-[#A8895C]" size={20} /> Reserved Fleet
          </h3>
          
          <div className="flex flex-col gap-6">
            {serviceBookings.map((service, index) => (
              <div key={index} className="flex flex-col md:flex-row items-center gap-6 p-4 bg-[#F8F6F0] border border-[#E8DFD1] relative group transition-all hover:border-[#A8895C]">
                
                <button 
                  onClick={() => removeRental(index)}
                  className="absolute top-4 right-4 text-[#A8895C] hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-all"
                  title="Remove this vehicle"
                >
                  <Trash2 size={18} />
                </button>

                <div className="w-32 h-24 bg-white border border-[#E8DFD1] flex-shrink-0">
                  <img src={service.images[0]} alt={service.title} loading="lazy" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-grow pr-8">
                  <h4 className="text-lg font-serif text-[#1F2E27] mb-1">{service.title}</h4>
                  <p className="text-sm text-[#3D3530] line-clamp-2">{service.desc}</p>
                </div>
                
                <div className="text-right flex-shrink-0 flex flex-col justify-end">
                  <span className="block text-lg font-semibold text-[#1F2E27]">KSh {service.price.toLocaleString()}</span>
                  <span className="mt-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A8895C]">
                    <Clock3 size={12} /> Pending schedule
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleProceed}
            className="bg-[#1F2E27] text-white px-8 py-4 uppercase tracking-widest text-sm hover:bg-[#A8895C] transition-colors flex items-center gap-2 rounded"
          >
            Proceed with Scheduling <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}