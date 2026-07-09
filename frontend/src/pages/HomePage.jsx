import React, { useState } from "react";
import { Phone, MapPin, Clock, Calendar, ChevronDown } from "lucide-react";
import { Button, Card, CardBody } from "../components";

const testimonials = [
    {
      name: "Amina N",
      quote: "The team made an overwhelming time feel calm and dignified. Every step was handled with care and grace.",
    },
    {
      name: "Daniel O",
      quote: "Their planning guidance was thoughtful and reassuring. We felt supported from the first conversation onward.",
    },
    {
      name: "Sarah M",
      quote: "The memorial experience they helped us create was beautiful, personal, and deeply meaningful.",
    },
  ];

const faqs = [
    {
      question: "How quickly can we begin planning?",
      answer: "We can start with a consultation right away and help you build a plan that fits your timeline and preferences.",
    },
    {
      question: "Do you help with both burial and memorial arrangements?",
      answer: "Yes. We offer guidance for funerals, memorial tributes, transport, catering, and remembrance experiences.",
    },
    {
      question: "Can I plan ahead without making a final decision yet?",
      answer: "Absolutely. Our team can help you document wishes, compare options, and build a thoughtful plan at your own pace.",
    },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="bg-[#F8F6F0]">
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ backgroundImage: "url('/images/background().jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-[#F8F6F0]/85 backdrop-blur-[2px]"></div>
        <div className="relative site-container py-20 md:py-24">
          <div className="mx-auto max-w-6xl rounded-[2rem] border border-[#E8DFD1] bg-white/85 p-8 shadow-[0_20px_70px_rgba(31,46,39,0.08)] backdrop-blur md:p-12">
            <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="text-center lg:text-left">
                <span className="section-eyebrow">Compassionate funeral planning</span>
                <h1 className="mb-6 text-5xl font-serif font-semibold text-[#1F2E27] md:text-6xl">
                  A steady place to turn
                </h1>
                <p className="mx-auto max-w-2xl text-xl leading-relaxed text-[#3D3530] lg:mx-0">
                  Last Planner Julz has helped families honor the people they love with absolute dignity. Whatever brought you here, we're here to help.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
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
                <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                  <span className="premium-chip rounded-full px-4 py-2 text-sm">24/7 support</span>
                  <span className="premium-chip rounded-full px-4 py-2 text-sm">Trusted guidance</span>
                  <span className="premium-chip rounded-full px-4 py-2 text-sm">Elegant arrangements</span>
                </div>
              </div>

              <div className="fade-in-up rounded-[1.5rem] border border-[#E8DFD1] bg-[#F8F6F0] p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="soft-card rounded-2xl p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#A8895C]">Guided care</p>
                    <p className="mt-2 text-sm text-[#3D3530]">Thoughtful support for every part of the planning journey.</p>
                  </div>
                  <div className="soft-card rounded-2xl p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#A8895C]">Personal tribute</p>
                    <p className="mt-2 text-sm text-[#3D3530]">Beautiful memorial pages and remembrance experiences.</p>
                  </div>
                  <div className="soft-card rounded-2xl p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#A8895C]">Transparent planning</p>
                    <p className="mt-2 text-sm text-[#3D3530]">Clear options, calm choices, and simple next steps.</p>
                  </div>
                  <div className="soft-card rounded-2xl p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#A8895C]">Flexible support</p>
                    <p className="mt-2 text-sm text-[#3D3530]">Available when you need us most, with respect and discretion.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="site-container py-16 border-t border-[#D8CFBC]">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-eyebrow">Our services</p>
            <h2 className="text-3xl font-serif font-semibold text-[#1F2E27]">
              Dignified support, thoughtfully arranged
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-[#3D3530]">
            From initial planning to memorial remembrance, every step is handled with calm professionalism and care.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
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
            <Card key={i} className="transition-all duration-300 hover:-translate-y-1 hover:border-[#A8895C] hover:shadow-[0_12px_32px_rgba(31,46,39,0.08)]">
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

      {/* Why Families Trust Us */}
      <section className="site-container py-16">
        <div className="mb-10 max-w-3xl">
          <p className="section-eyebrow">Why families choose us</p>
          <h2 className="text-3xl font-serif font-semibold text-[#1F2E27]">Professional care with a deeply personal touch</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Peace of mind",
              text: "Clear, compassionate guidance that helps families make thoughtful choices without pressure."
            },
            {
              title: "Elegant presentation",
              text: "Every detail is thoughtfully styled to feel dignified, warm, and beautifully considered."
            },
            {
              title: "Flexible planning",
              text: "Plans that adapt to your timeline, your preferences, and the needs of your loved ones."
            }
          ].map((item) => (
            <div key={item.title} className="soft-card rounded-[1.25rem] p-6">
              <h3 className="text-xl font-serif font-semibold text-[#1F2E27]">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#3D3530]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-[#E8DFD1] bg-[#FCFAF5] py-16">
        <div className="site-container">
          <div className="mb-10 text-center">
            <p className="section-eyebrow">Families we support</p>
            <h2 className="text-3xl font-serif font-semibold text-[#1F2E27]">
              Trusted guidance during deeply personal moments
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.name} className="soft-card rounded-[1.25rem] p-6">
                <p className="text-sm leading-relaxed text-[#3D3530]">“{item.quote}”</p>
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#A8895C]">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="site-container py-16">
        <div className="mb-10 text-center">
          <p className="section-eyebrow">Frequently asked questions</p>
          <h2 className="text-3xl font-serif font-semibold text-[#1F2E27]">Helpful answers, clearly shared</h2>
        </div>
        <div className="mx-auto max-w-3xl space-y-4">
          {faqs.map((faq, index) => (
            <div key={faq.question} className="rounded-[1rem] border border-[#E8DFD1] bg-white shadow-sm">
              <button
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                aria-expanded={openFaq === index}
              >
                <span className="font-semibold text-[#1F2E27]">{faq.question}</span>
                <ChevronDown className={`shrink-0 text-[#A8895C] transition-transform ${openFaq === index ? "rotate-180" : ""}`} size={18} />
              </button>
              {openFaq === index && (
                <div className="border-t border-[#F2EBDD] px-5 py-4 text-sm leading-relaxed text-[#3D3530]">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section - PRO-GRADE UPDATE */}
      <section 
        id="contact"
        className="w-full border-t border-[#E8DFD1] bg-[linear-gradient(135deg,#FDFBF7_0%,#F8F6F0_100%)] py-20 px-4 md:px-8"
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
          <p className="font-medium">&copy; 2026 Last Planner Julz Hub. All rights reserved.</p>
          <p className="mt-2 text-[#A8895C] italic">Serving families with dignity, clarity, and compassion.</p>
        </div>
      </footer>
    </div>
  );
}