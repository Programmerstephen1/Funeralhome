import React from "react";
import { Phone, MapPin, Clock } from "lucide-react";
import { Button, Card, CardBody } from "../components";

export default function HomePage() {
  return (
    <div className="bg-[#F8F6F0]">
      {/* Hero Section */}
      <section className="site-container py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-serif font-semibold text-[#1F2E27] mb-6">
          A steady place to turn
        </h1>
        <p className="text-xl text-[#3D3530] max-w-2xl mx-auto mb-8">
          Last Planner julz has helped families honor the people they love for over 60 years. 
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
        <h2 className="text-3xl font-serif font-semibold text-[#1F2E27] mb-12">Our Services</h2>
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
            <Card key={i}>
              <CardBody>
                <h3 className="text-lg font-serif font-semibold text-[#1F2E27] mb-3">
                  {service.title}
                </h3>
                <p className="text-[#3D3530] text-sm">{service.desc}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section 
        id="contact"
        className="site-container py-16 border-t border-[#D8CFBC]"
        style={{ backgroundColor: "#EFEAE0" }}
      >
        <div className="max-w-2xl">
          <h2 className="text-3xl font-serif font-semibold text-[#1F2E27] mb-8">
            We're here for you
          </h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <Phone className="text-[#A8895C] flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-[#1F2E27] mb-1">24/7 Support Line</h3>
                <p className="text-[#3D3530]">(555) 123-4567</p>
              </div>
            </div>

            <div className="flex gap-4">
              <MapPin className="text-[#A8895C] flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-[#1F2E27] mb-1">Visit Us</h3>
                <p className="text-[#3D3530]">
                  428 Oak Street<br />
                  Millbrook, CA 94025
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Clock className="text-[#A8895C] flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-[#1F2E27] mb-1">Hours</h3>
                <p className="text-[#3D3530]">
                  Open Daily: 8am – 5pm<br />
                  After Hours: By Appointment
                </p>
              </div>
            </div>
          </div>

          <Button 
            variant="primary" 
            size="lg" 
            className="mt-8"
            onClick={() => window.location.href = 'mailto:info@lastplannerjulzhub.com'}
          >
            Schedule a Consultation
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#D8CFBC] bg-[#F8F6F0] py-12">
        <div className="site-container text-center text-[#3D3530] text-sm">
          <p>&copy; 2026 Last Planner julz Hub. All rights reserved.</p>
          <p className="mt-2">Serving families with dignity and compassion since 1958.</p>
        </div>
      </footer>
    </div>
  );
}