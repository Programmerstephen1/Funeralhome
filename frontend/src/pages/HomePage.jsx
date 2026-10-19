import React, { useEffect, useRef, useState } from "react";
import { Phone, MapPin, Clock, Calendar, ChevronDown, MessageCircle, ArrowRight, Mail } from "lucide-react";
import { Button, Card, CardBody } from "../components";
import { Link, useNavigate } from "react-router-dom";
import { getApiBaseUrl } from "../services/config";
import { BUSINESS } from "../config/business";

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
    {
      question: "What area do you serve?",
      answer: "We are based in Kahawa West and serve families countrywide. Request a quote with your location so we can confirm availability and distance-based delivery.",
    },
    {
      question: "How do I confirm the full cost?",
      answer: "Catalog item and size prices are shown online. Delivery and transport charges depend on distance. Request availability and a written itemized quote before accepting or paying.",
    },
    {
      question: "When can I contact the team?",
      answer: "We are open Monday to Friday, 8:00 am to 6:00 pm, and Saturday, 9:00 am to 5:00 pm. Availability is checked for each request; the website does not show live stock or date availability.",
    },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState("");
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", questions: "", consent: false });
  const scheduleButtonRef = useRef(null);
  const firstFieldRef = useRef(null);
  const wasModalOpenRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isModalOpen) {
      wasModalOpenRef.current = true;
      firstFieldRef.current?.focus();
      return undefined;
    }
    if (wasModalOpenRef.current) {
      scheduleButtonRef.current?.focus();
      wasModalOpenRef.current = false;
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSubmitting) setIsModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, isSubmitting]);

  const handleConsultationSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setIsSubmitting(true);
    try {
      const apiBase = getApiBaseUrl().replace(/\/$/, "");
      const response = await fetch(`${apiBase}/api/consultations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email, phone: formData.phone, questions: formData.questions }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "We could not send your request. Please call us instead.");
      setFormStatus(data.message || "Your request has been received. Our team will follow up using the contact details you provided.");
      setFormData({ name: "", email: "", phone: "", questions: "", consent: false });
    } catch (error) {
      setFormError(error.message || "We could not send your request. Please try again or call us.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  Whatever brings you here, we can explain the available options and help you choose a next step.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
                  <Button 
                    variant="primary" 
                    size="lg"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Get Help Now
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={() => navigate('/plan')}
                  >
                    Plan Ahead
                  </Button>
                  
                  {/* --- PRO-GRADE ADDITION: DIRECT DEMO LINK --- */}
                  <Button 
                    variant="secondary" 
                    size="lg"
                    className="border-[#A8895C] text-[#1F2E27] hover:bg-[#F8F6F0]"
                    onClick={() => navigate('/memorial/demo')}
                  >
                    View Sample Memorial
                  </Button>
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                  <span className="premium-chip rounded-full px-4 py-2 text-sm">A caring team to speak with</span>
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
              title: "Personal Support",
              desc: "Speak with our team during office hours. After-hours arrangements are available by appointment.",
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

      {/* Clear next steps */}
      <section className="border-y border-[#E8DFD1] bg-[#FCFAF5] py-16">
        <div className="site-container">
          <div className="mb-10 text-center">
            <p className="section-eyebrow">A clear next step</p>
            <h2 className="text-3xl font-serif font-semibold text-[#1F2E27]">
              Start wherever you are
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#3D3530]">Whether you need help now, are planning ahead, or want to create a tribute, choose the path that feels right.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <button type="button" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })} className="soft-card group rounded-[1.25rem] p-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F2E27]">
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#1F2E27] text-white"><Phone size={19} /></span>
              <h3 className="text-xl font-serif font-semibold text-[#1F2E27]">I need support now</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#3D3530]">Speak directly with our team or send a consultation request.</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1F2E27]">Contact the team <ArrowRight size={16} /></span>
            </button>
            <button type="button" onClick={() => navigate("/plan")} className="soft-card group rounded-[1.25rem] p-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F2E27]">
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#1F2E27] text-white"><Calendar size={19} /></span>
              <h3 className="text-xl font-serif font-semibold text-[#1F2E27]">I’m planning ahead</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#3D3530]">Explore the planning process and review available packages.</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1F2E27]">Explore planning <ArrowRight size={16} /></span>
            </button>
            <button type="button" onClick={() => navigate("/memorial/demo")} className="soft-card group rounded-[1.25rem] p-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F2E27]">
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#1F2E27] text-white"><MessageCircle size={19} /></span>
              <h3 className="text-xl font-serif font-semibold text-[#1F2E27]">I want to create a tribute</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#3D3530]">Preview a memorial space and its remembrance features.</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1F2E27]">View a sample <ArrowRight size={16} /></span>
            </button>
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

      {/* Contact Section */}
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
                Arranging a tribute takes careful thought. Our team can explain the available services and help you choose a next step.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button 
                  ref={scheduleButtonRef}
                  onClick={() => setIsModalOpen(true)}
                  className="group flex items-center gap-3 bg-[#A8895C] text-white font-semibold tracking-widest text-xs uppercase px-8 py-4 rounded hover:bg-[#1F2E27] transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <Calendar size={16} className="group-hover:rotate-12 transition-transform" />
                  Schedule a Consultation
                </button>
                <a
                  href="tel:+254799847727"
                  className="inline-flex items-center gap-2 rounded-full border border-[#D8CFBC] bg-white px-5 py-3 text-sm font-semibold text-[#1F2E27] transition-colors hover:border-[#A8895C] hover:text-[#A8895C]"
                >
                  <Phone size={16} />
                  Call now
                </a>
              </div>
            </div>

            {/* Right Column: Structured, Bright Contact Card Grid */}
            <div className="lg:col-span-6 bg-white border border-[#E8DFD1] rounded-xl p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h3 className="text-sm font-bold text-[#1F2E27] uppercase tracking-widest border-b border-[#E8DFD1] pb-4 mb-6">
                Contact & Accessibility
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#FDFBF7] border border-[#E8DFD1] rounded-full flex items-center justify-center shrink-0">
                    <Phone size={18} className="text-[#A8895C]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#A8895C] mb-1">
                      Call our team
                    </h4>
                    <a href="tel:+254799847727" className="text-lg font-serif font-semibold text-[#1F2E27] transition-colors hover:text-[#A8895C]">+254 799 847 727</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#FDFBF7] border border-[#E8DFD1] rounded-full flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-[#A8895C]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#A8895C] mb-1">Email our team</h4>
                    <a href={`mailto:${BUSINESS.email}`} className="break-all text-sm font-semibold text-[#1F2E27] transition-colors hover:text-[#A8895C]">{BUSINESS.email}</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#FDFBF7] border border-[#E8DFD1] rounded-full flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-[#A8895C]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#A8895C] mb-1">
                      Service Area
                    </h4>
                    <p className="text-[#3D3530] text-sm leading-relaxed font-medium">
                      <span className="text-[#1F2E27] font-semibold">Based in {BUSINESS.address}</span><br />
                      <span className="text-[#1F2E27] font-semibold">Serving families countrywide</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#FDFBF7] border border-[#E8DFD1] rounded-full flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-[#A8895C]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#A8895C] mb-1">
                      Operating Hours
                    </h4>
                    <p className="text-sm text-[#3D3530] font-medium">
                      <span className="text-[#1F2E27] font-semibold">Monday–Friday: 8:00am–6:00pm</span><br />
                      <span className="text-[#1F2E27] font-semibold">Saturday: 9:00am–5:00pm</span>
                    </p>
                    <p className="text-xs text-[#8F847C] mt-0.5">Availability is confirmed for each request.</p>
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
          <p className="font-medium">&copy; 2026 {BUSINESS.name}. All rights reserved.</p>
          <p className="mt-2 text-[#A8895C] italic">Serving families with dignity, clarity, and compassion.</p>
          <nav aria-label="Legal" className="mt-5 flex justify-center gap-5">
            <Link to="/terms" className="underline underline-offset-4 hover:text-[#1F2E27]">Terms</Link>
            <Link to="/privacy" className="underline underline-offset-4 hover:text-[#1F2E27]">Privacy</Link>
            <Link to="/refunds" className="underline underline-offset-4 hover:text-[#1F2E27]">Refunds</Link>
          </nav>
        </div>
      </footer>

      {/* Consultation Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="consultation-title">
          <div className="w-full max-w-md rounded-lg border border-[#D8CFBC] bg-[#F8F6F0] p-8 shadow-2xl">
            <h3 id="consultation-title" className="mb-2 inline-block border-b-2 border-[#A8895C] pb-2 font-serif text-2xl font-semibold text-[#1F2E27]">
              Schedule a Consultation
            </h3>
            <p className="text-[#3D3530] mb-6 text-sm mt-4">
              Please provide your details and we will contact you to arrange a time.
            </p>
            
            {formStatus ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900" role="status">
                <p className="font-semibold">Request received</p>
                <p className="mt-1">{formStatus}</p>
                <button type="button" onClick={() => { setIsModalOpen(false); setFormStatus(""); }} className="mt-4 rounded border border-emerald-800 px-4 py-2 font-semibold hover:bg-emerald-100">Done</button>
              </div>
            ) : <form onSubmit={handleConsultationSubmit} className="space-y-5">
              {formError && <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{formError}</p>}
              <div>
                <label htmlFor="consultation-name" className="mb-1 block text-sm font-medium text-[#1F2E27]">Your name</label>
                <input
                  ref={firstFieldRef}
                  id="consultation-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  placeholder="Full name"
                  required
                  className="w-full rounded border border-[#E8DFD1] bg-white p-3.5 text-[#3D3530] transition-colors focus:border-[#A8895C] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="consultation-email" className="mb-1 block text-sm font-medium text-[#1F2E27]">Email address</label>
                <input
                  id="consultation-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded border border-[#E8DFD1] bg-white p-3.5 text-[#3D3530] transition-colors focus:border-[#A8895C] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="consultation-phone" className="mb-1 block text-sm font-medium text-[#1F2E27]">Phone number</label>
                <input
                  id="consultation-phone"
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                  placeholder="+254 …"
                  required
                  className="w-full rounded border border-[#E8DFD1] bg-white p-3.5 text-[#3D3530] transition-colors focus:border-[#A8895C] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="consultation-questions" className="mb-1 block text-sm font-medium text-[#1F2E27]">How can we help? <span className="font-normal text-[#716860]">(optional)</span></label>
                <textarea
                  id="consultation-questions"
                  name="questions"
                  value={formData.questions}
                  onChange={(event) => setFormData({ ...formData, questions: event.target.value })}
                  placeholder="Share any details you would like us to know."
                  rows="3"
                  className="w-full resize-none rounded border border-[#E8DFD1] bg-white p-3.5 text-[#3D3530] transition-colors focus:border-[#A8895C] focus:outline-none"
                ></textarea>
              </div>

              <label className="flex items-start gap-3 text-sm leading-relaxed text-[#3D3530]">
                <input type="checkbox" required checked={formData.consent} onChange={(event) => setFormData({ ...formData, consent: event.target.checked })} className="mt-1 accent-[#1F2E27]" />
                <span>I agree to be contacted about this request. <a href="/privacy" className="font-semibold text-[#1F2E27] underline">Read the privacy policy</a>.</span>
              </label>

              <div className="flex gap-4 border-t border-[#E8DFD1] pt-4">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setFormStatus(""); setFormError(""); }}
                  disabled={isSubmitting}
                  className="w-full rounded border-2 border-[#A8895C] px-4 py-3 font-bold uppercase tracking-wide text-[#A8895C] transition-colors hover:bg-[#EFEAE0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded bg-[#A8895C] px-4 py-3 font-bold uppercase tracking-wide text-white shadow-md transition-all hover:bg-[#8F744D] hover:shadow-lg"
                >
                  {isSubmitting ? "Sending request…" : "Send request"}
                </button>
              </div>
            </form>}
          </div>
        </div>
      )}
    </div>
  );
}
