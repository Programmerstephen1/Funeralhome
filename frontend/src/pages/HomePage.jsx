import React from "react";
import { Phone, MapPin, Clock, Calendar } from "lucide-react";
import { Button, Card, CardBody } from "../components";

export default function HomePage() {
  return (
    <div className="bg-[#F8F6F0]">
      {/* Hero Section */}
      <section className="site-container py-20 text-center animate-fadeIn">
        <h1 className="text-5xl md:text-6xl font-serif font-semibold text-[#1F2E27] mb-6">
          A steady place to turn
        </h1>
        <p className="text-xl text-[#3D3530] max-w-2xl mx-auto mb-8 leading-relaxed">
          Last Planner Julz has helped families honor the people they love with absolute dignity. 
          Whatever brought you here, we're here to help.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
          >
            Get Help Now
          </Button>
          <Button 
            variant="secondary" 
            size="lg"
            onClick={() => window.location.hash = '#plan'}
          >
            Plan Ahead
          </Button>
        </div>
      </section>

      {/* Services Preview */}
      <section className="site-container py-16 border-t border-[#D8CFBC]">
        <h2 className="text-3xl font-serif font-semibold text-[#1F2E27] mb-12 text-center md:text-left">
          Our Services
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Funeral Planning",
              desc: "Compassionate guidance through every step of the funeral service arrangement.",
            },
            {
              title: "Obituary Writing",
              desc: "Professional obituary creation that honors your loved one's life and legacy.",
            },
            {
              title: "Memorial Tributes",
              desc: "Online tribute pages with guestbooks, photos, and candle lighting.",
            },
            {
              title: "Pre-Planning",
              desc: "Plan ahead to ease the burden on your family during difficult times.",
            },
            {
              title: "Eulogy Assistance",
              desc: "Guidance in writing and delivering meaningful eulogies.",
            },
            {
              title: "24/7 Support",
              desc: "Our team is available anytime you need us, day or night.",
            },
          ].map((service, i) => (
            <Card key={i} className="hover:border-[#A8895C] transition-colors duration-300">
              <CardBody>
                <h3 className="text-lg font-serif font-semibold text-[#1F2E27] mb-3">
                  {service.title}
                </h3>
                <p className="text-[#3D3530] text-sm leading-relaxed">{service.desc}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Section - PRO-GRADE UPDATE */}
      <section 
        id="contact"
        className="w-full bg-[#FDFBF7] border-t border-[#E8DFD1] py-20 px-4 md:px-8"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Premium Headline & Action */}
            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-3">
                <span className="text-xs font-bold tracking-[0.25em] uppercase text-[#A8895C]">
                  Dedicated Support
                </span>
                <h2 className="text-4xl md:text-5xl font-serif font-semibold text-[#1F2E27] leading-tight">
                  We're here for you <br />
                  <span className="italic text-[#A8895C] font-normal text-3xl md:text-4xl">every step of the way</span>
                </h2>
              </div>
              
              <p className="text-[#3D3530] text-base leading-relaxed max-w-md opacity-90">
                Arranging a beautiful tribute requires careful thought and absolute peace of mind. Our compassionate specialists are available around the clock to guide your family.
              </p>

              <button 
                onClick={() => window.location.hash = '#plan'}
                className="group flex items-center gap-3 bg-[#A8895C] text-white font-semibold tracking-widest text-xs uppercase px-8 py-4 rounded hover:bg-[#1F2E27] transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Calendar size={16} className="group-hover:rotate-12 transition-transform" />
                Schedule a Consultation
              </button>
            </div>

            {/* Right Column: Structured, Bright Contact Card Grid */}
            <div className="lg:col-span-6 bg-white border border-[#E8DFD1] rounded-xl p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h3 className="text-sm font-bold text-[#1F2E27] uppercase tracking-widest border-b border-[#E8DFD1] pb-4 mb-6">
                Contact & Accessibility
              </h3>
              
              <div className="space-y-6">
                {/* Phone Detail Item */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#FDFBF7] border border-[#E8DFD1] rounded-full flex items-center justify-center shrink-0">
                    <Phone size={18} className="text-[#A8895C]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#A8895C] mb-1">
                      24/7 Support Line
                    </h4>
                    <p className="text-lg font-serif font-semibold text-[#1F2E27] hover:text-[#A8895C] transition-colors cursor-pointer">
                      +254 799 847 727
                    </p>
                  </div>
                </div>

                {/* Location Detail Item */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#FDFBF7] border border-[#E8DFD1] rounded-full flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-[#A8895C]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#A8895C] mb-1">
                      Visit Our Office
                    </h4>
                    <p className="text-[#3D3530] text-sm leading-relaxed font-medium">
                      LAST PLANNER JULZ,<br />
                      <span className="text-[#1F2E27] font-semibold">Ruiru, Kiambu County, Kenya</span>
                    </p>
                  </div>
                </div>

                {/* Hours Detail Item */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#FDFBF7] border border-[#E8DFD1] rounded-full flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-[#A8895C]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#A8895C] mb-1">
                      Operating Hours
                    </h4>
                    <p className="text-sm text-[#3D3530] font-medium">
                      Open Daily: <span className="text-[#1F2E27] font-semibold">8:00am – 5:00pm</span>
                    </p>
                    <p className="text-xs text-[#8F847C] mt-0.5 italic">
                      After Hours Services Available By Appointment
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#D8CFBC] bg-[#F8F6F0] py-12">
        <div className="site-container text-center text-[#3D3530] text-sm">
          <p>&copy; 2026 Last Planner Julz Hub. All rights reserved.</p>
          <p className="mt-2 text-[#A8895C] italic">Serving families with dignity and compassion.</p>
        </div>
      </footer>
    </div>
  );
}