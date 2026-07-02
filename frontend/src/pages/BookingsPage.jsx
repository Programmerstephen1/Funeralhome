import React from "react";
import { CalendarDays, Car, ArrowRight, Trash2 } from "lucide-react";

export default function BookingsPage({ serviceBookings = [], removeRental }) {
  
  const handleProceed = () => {
    window.location.hash = "#booking-checkout";
  };

  if (serviceBookings.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#F8F6F0]">
        <div className="w-20 h-20 bg-white border border-[#E8DFD1] rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CalendarDays className="text-[#A8895C]" size={32} />
        </div>
        <h2 className="text-2xl font-serif text-[#1F2E27] mb-4">No Service Bookings</h2>
        <p className="text-[#3D3530] mb-8">You haven't requested any vehicles or services yet.</p>
        
        {/* PRO-GRADE FIX: Deep linking directly to the hearses category */}
        <a href="#catalog/hearses" className="text-sm uppercase tracking-widest bg-[#1F2E27] text-white px-8 py-3 hover:bg-[#A8895C] transition-colors rounded">
          Browse Hearses
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] pb-32 pt-12">
      <div className="site-container max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-semibold text-[#1F2E27] mb-4">Service Requests</h2>
          <p className="text-[#3D3530]">Review your requested vehicles and logistical services.</p>
        </div>

        <div className="bg-white border border-[#E8DFD1] shadow-sm p-6 mb-8 relative">
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
                  <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-grow pr-8">
                  <h4 className="text-lg font-serif text-[#1F2E27] mb-1">{service.title}</h4>
                  <p className="text-sm text-[#3D3530] line-clamp-2">{service.desc}</p>
                </div>
                
                <div className="text-right flex-shrink-0 flex flex-col justify-end">
                  <span className="block text-lg font-semibold text-[#1F2E27]">KSh {service.price.toLocaleString()}</span>
                  <span className="text-xs text-[#A8895C] uppercase tracking-wider font-semibold mt-1">Pending Schedule</span>
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