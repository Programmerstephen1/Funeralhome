import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, ShieldCheck, HeartHandshake, Sparkles, FileText, Clock3, ArrowRightCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Button, Card } from "../components";
import { getApiBaseUrl } from "../services/config";

export default function PlanAheadPage() {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [consentGiven, setConsentGiven] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    questions: ""
  });

  const faqs = [
    {
      q: "Why should I plan ahead?",
      a: "Planning ahead provides profound peace of mind for both you and your loved ones. It ensures your exact wishes are honored, prevents your family from having to make difficult decisions during a time of intense grief, and can relieve them of unexpected financial burdens.",
    },
    {
      q: "What does pre-planning include?",
      a: "Pre-planning covers as much or as little as you desire. It typically includes choosing between burial or cremation, selecting a casket or urn, deciding on the type of service or memorial, and outlining specific preferences like music, readings, or floral arrangements.",
    },
    {
      q: "Can I change my plan later?",
      a: "Yes, absolutely. Your pre-planned arrangements are entirely flexible. We understand that life circumstances and preferences change, so you can update your service details, designated representatives, or final wishes at any time.",
    },
    {
      q: "What are the costs associated with planning?",
      a: "A compulsory deposit of 10% of the agreed planning fee is due before planning work begins and is credited toward that fee. We provide the full written fee and terms before you accept. The deposit is not automatically forfeited if you cancel; see the refund and cancellation policy.",
    },
    {
      q: "How do I start the process?",
      a: "You can begin by scheduling a consultation using the contact options below. One of our directors will guide you through the available options at your own pace, ensuring every detail aligns with your personal values.",
    },
  ];

  const processSteps = [
    { title: "Schedule Consultation", desc: "Discuss your wishes and preferences. The team will explain the planning fee, deposit amount, and payment terms before you proceed.", icon: HeartHandshake },
    {
      title: "Review Options",
      desc: "Explore our thoughtfully designed signature packages.",
      icon: Sparkles,
      isLink: true
    },
    { title: "Document Preferences", desc: "Provide personal details, family information, and specific requests.", icon: FileText },
    { title: "Finalize Plan", desc: "Review your arrangements, written estimate, and applicable deposit terms with the team.", icon: ShieldCheck },
    { title: "Peace of Mind", desc: "Rest assured knowing your wishes are documented and our team is handling the logistics.", icon: Clock3 },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Please share your full name.";
    if (!formData.email.trim()) errors.email = "Please add an email address.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Please use a valid email address.";
    if (!formData.phone.trim()) errors.phone = "Please add a phone number.";
    if (!consentGiven) errors.consent = "Please agree to be contacted about this request.";
    return errors;
  };

  const handleConsultationSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Sending your request...");

    try {
      const apiBase = getApiBaseUrl().replace(/\/$/, "");
      const requestUrl = `${apiBase}/api/consultations`;

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, consent: consentGiven }),
      });

      let data = {};
      try { data = await response.json(); } catch (e) { }

      if (response.ok) {
        toast.success(data.message || "Your request has been received. Our team will follow up using the contact details you provided.", { id: toastId });
        setIsModalOpen(false);
        setFormData({ name: "", email: "", phone: "", questions: "" });
        setConsentGiven(false);
      } else {
        const serverMessage = data.message || data.error || (await response.text().catch(() => ""));
        toast.error(`Server error (${response.status}): ${serverMessage || 'Unable to send your request right now.'}`, { id: toastId });
      }
    } catch (error) {
      toast.error(error.message || "We could not send your request. Please try again or call us.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F8F6F0] relative min-h-screen">
      <Toaster position="top-center" reverseOrder={false} />

      {/* --- HERO SECTION --- */}
      <section
        className="relative border-b border-[#E8DFD1] bg-cover bg-center bg-no-repeat pb-16 pt-20"
        style={{ backgroundImage: "url('/images/background().jpg')" }}
      >
        <div className="absolute inset-0 bg-[#F8F6F0]/85 backdrop-blur-[1px]"></div>

        <div className="site-container relative z-10">
          <div className="mb-12 rounded-[2rem] border border-[#E8DFD1] bg-white/90 p-8 shadow-[0_20px_70px_rgba(31,46,39,0.08)] md:p-10">
            <div className="mb-16 text-center">
              <p className="section-eyebrow">Pre-planning</p>
              <h1 className="mb-4 text-4xl font-serif font-semibold text-[#1F2E27] md:text-5xl">
                Plan Ahead with Confidence
              </h1>

              {/* EYE-CATCHING MANTRA */}
              <p className="text-[#A8895C] italic font-serif text-2xl md:text-3xl mb-8 tracking-wide drop-shadow-sm">
                "With you when you need us the most."
              </p>

              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[#3D3530]">
                Take control of your legacy and ease the burden on your loved ones. Pre-planning gives you profound peace of mind and a calm path forward.
              </p>
            </div>

            <div>
              <h2 className="mb-8 text-center text-2xl font-serif font-semibold text-[#1F2E27] md:text-left">
                Our Planning Process
              </h2>
              <div className="grid gap-6 md:grid-cols-5">
                {processSteps.map((step, i) => {
                  const Icon = step.icon;

                  // The core content of the card
                  const CardContent = (
                    <>
                      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#A8895C] text-xl font-bold text-white shadow-lg group-hover:scale-105 transition-transform">
                        {i + 1}
                      </div>
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#A8895C] shadow-sm">
                        <Icon size={18} />
                      </div>
                      <h3 className="mb-3 text-sm font-bold text-[#1F2E27] transition-colors group-hover:text-[#A8895C]">
                        {step.title}
                      </h3>
                      <p className="px-2 text-xs leading-relaxed text-[#3D3530] mb-4">
                        {step.desc}
                      </p>

                      {/* RIGHT-POINTING ARROW FIXED */}
                      {step.isLink && (
                        <div className="mt-auto flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#A8895C] group-hover:text-[#1F2E27] transition-colors">
                          View Packages <ArrowRightCircle size={16} />
                        </div>
                      )}
                    </>
                  );

                  // If it's the "Review Options" step, wrap the entire box in a <Link>
                  return step.isLink ? (
                    <Link
                      key={i}
                      to="/packages"
                      className="group relative flex cursor-pointer flex-col items-center rounded-[1.25rem] border border-[#E8DFD1] bg-[#F8F6F0] p-5 text-center transition-all hover:-translate-y-1 hover:border-[#A8895C] hover:shadow-md"
                    >
                      {CardContent}
                    </Link>
                  ) : (
                    <div
                      key={i}
                      className="group relative flex cursor-default flex-col items-center rounded-[1.25rem] border border-[#E8DFD1] bg-[#F8F6F0] p-5 text-center transition-all hover:-translate-y-1 hover:border-[#A8895C] hover:shadow-md"
                    >
                      {CardContent}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="site-container py-16">
        {/* --- BENEFITS SECTION --- */}
        <section className="mb-16 rounded-[1.5rem] border border-[#D8CFBC] bg-[#EFEAE0] p-8 shadow-sm md:p-12">
          <h2 className="mb-8 text-3xl font-serif font-semibold text-[#1F2E27]">
            Benefits of Pre-Planning
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { title: "Your wishes are honored", text: "Every preference is documented clearly so your family never has to guess." },
              { title: "Less emotional pressure", text: "Your loved ones can focus on comfort and remembrance instead of difficult decisions." },
              { title: "Understand costs", text: "Ask about pre-funding options and the terms that apply to your selected services." },
              { title: "Secure personal guidance", text: "Private, thoughtful planning support that respects your pace and preferences." },
            ].map((benefit, i) => (
              <div key={i} className="rounded-[1.1rem] border border-[#E8DFD1] bg-white/80 p-5">
                <h3 className="mb-2 text-lg font-semibold text-[#1F2E27]">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-[#3D3530]">{benefit.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- FAQ SECTION --- */}
        <section className="mb-20">
          <h2 className="text-3xl font-serif font-semibold text-[#1F2E27] mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i}>
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full p-6 flex items-center justify-between hover:bg-[#EFEAE0] transition-colors"
                >
                  <h3 className="font-semibold text-[#1F2E27] text-left pr-4">
                    {faq.q}
                  </h3>
                  {expandedFaq === i ? (
                    <ChevronUp className="text-[#A8895C] flex-shrink-0" size={24} />
                  ) : (
                    <ChevronDown className="text-[#A8895C] flex-shrink-0" size={24} />
                  )}
                </button>
                {expandedFaq === i && (
                  <div className="px-6 pb-6 text-[#3D3530] border-t border-[#E8DFD1] pt-4 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* --- CTA SECTION --- */}
        <section className="rounded-[1.5rem] border border-[#E8DFD1] bg-white p-10 text-center shadow-sm md:p-12">
          <p className="section-eyebrow">Personalized support</p>
          <h2 className="mb-4 text-3xl font-serif font-semibold text-[#1F2E27]">
            Ready to Plan Ahead?
          </h2>
          <p className="mb-8 text-lg text-[#3D3530] max-w-3xl mx-auto">
            Our specialized team is ready to assist and guide you at your own pace. <br className="hidden md:block" />
            <strong className="text-[#1F2E27]">Planning deposit:</strong> A compulsory 10% deposit of the agreed planning fee is due before work begins and is credited toward that fee. We will provide the full written fee and terms for your approval first. <Link to="/refunds" className="font-semibold underline">Read the refund policy</Link>.
          </p>
          <div onClick={() => setIsModalOpen(true)} className="inline-block">
            <Button variant="primary" size="lg" className="px-8 py-4 text-lg shadow-md transition-all hover:shadow-lg">
              Schedule Your Consultation
            </Button>
          </div>
        </section>
      </div>

      {/* --- CONSULTATION MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="plan-consultation-title">
          <div className="bg-[#F8F6F0] rounded-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto max-w-md w-full shadow-2xl border border-[#D8CFBC]">
            <h3 id="plan-consultation-title" className="text-2xl font-serif font-semibold text-[#1F2E27] mb-2 border-b-2 border-[#A8895C] pb-2 inline-block">
              Schedule a Consultation
            </h3>
            <p className="text-[#3D3530] mb-6 text-sm mt-4">
              Please provide your details and we will contact you to arrange a time.
            </p>

            <form onSubmit={handleConsultationSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="plan-consult-name" className="mb-1 block text-sm font-semibold text-[#1F2E27]">Your name</label>
                <input
                  id="plan-consult-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full name"
                  aria-invalid={!!formErrors.name}
                  className="w-full p-3.5 rounded border border-[#E8DFD1] bg-white text-[#3D3530] focus:outline-none focus:border-[#A8895C] transition-colors"
                />
                {formErrors.name && <p className="mt-2 text-sm text-red-700" role="alert">{formErrors.name}</p>}
              </div>
              <div>
                <label htmlFor="plan-consult-email" className="mb-1 block text-sm font-semibold text-[#1F2E27]">Email address</label>
                <input
                  id="plan-consult-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  aria-invalid={!!formErrors.email}
                  className="w-full p-3.5 rounded border border-[#E8DFD1] bg-white text-[#3D3530] focus:outline-none focus:border-[#A8895C] transition-colors"
                />
                {formErrors.email && <p className="mt-2 text-sm text-red-700" role="alert">{formErrors.email}</p>}
              </div>
              <div>
                <label htmlFor="plan-consult-phone" className="mb-1 block text-sm font-semibold text-[#1F2E27]">Phone number</label>
                <input
                  id="plan-consult-phone"
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+254 …"
                  aria-invalid={!!formErrors.phone}
                  className="w-full p-3.5 rounded border border-[#E8DFD1] bg-white text-[#3D3530] focus:outline-none focus:border-[#A8895C] transition-colors"
                />
                {formErrors.phone && <p className="mt-2 text-sm text-red-700" role="alert">{formErrors.phone}</p>}
              </div>
              <div>
                <label htmlFor="plan-consult-questions" className="mb-1 block text-sm font-semibold text-[#1F2E27]">How can we help? <span className="font-normal text-[#716860]">(optional)</span></label>
                <textarea
                  id="plan-consult-questions"
                  name="questions"
                  value={formData.questions}
                  onChange={handleInputChange}
                  placeholder="Any specific questions? (Optional)"
                  rows="3"
                  className="w-full p-3.5 rounded border border-[#E8DFD1] bg-white text-[#3D3530] focus:outline-none focus:border-[#A8895C] transition-colors resize-none"
                ></textarea>
              </div>

              <div>
                <label className="flex items-start gap-3 text-sm leading-relaxed text-[#3D3530]">
                  <input type="checkbox" required checked={consentGiven} onChange={(event) => { setConsentGiven(event.target.checked); setFormErrors((current) => ({ ...current, consent: "" })); }} className="mt-1 accent-[#1F2E27]" />
                  <span>I agree to be contacted about this request. <Link to="/privacy" className="font-semibold text-[#1F2E27] underline">Read the privacy policy</Link>.</span>
                </label>
                {formErrors.consent && <p className="mt-2 text-sm text-red-700" role="alert">{formErrors.consent}</p>}
              </div>

              <div className="flex gap-4 pt-4 border-t border-[#E8DFD1]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded border-2 border-[#A8895C] text-[#A8895C] font-bold tracking-wide uppercase hover:bg-[#EFEAE0] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded bg-[#A8895C] text-white font-bold tracking-wide uppercase hover:bg-[#8F744D] shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
