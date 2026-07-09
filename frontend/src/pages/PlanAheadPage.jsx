import React, { useState } from "react";
import { ChevronDown, ChevronUp, ShieldCheck, HeartHandshake, Sparkles, FileText, Clock3 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Button, Card } from "../components";

export default function PlanAheadPage() {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [serverHealth, setServerHealth] = useState(null); // null | 'ok' | 'error'
  const [serverUrlChecked, setServerUrlChecked] = useState(null);
  
  // Track the form inputs
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
      a: "Yes, absolutely. Your pre-planned arrangements are entirely flexible. We understand that life circumstances and preferences change, so you can update your service details, designated representatives, or final wishes at any time without penalty.",
    },
    {
      q: "Is pre-planning expensive?",
      a: "Documenting your wishes with us is completely free. If you choose to pre-fund your plan, it can actually save money in the long run. Pre-funding allows you to lock in today's prices, protecting your family from future inflation.",
    },
    {
      q: "How do I start the process?",
      a: "You can begin simply by scheduling a free, no-obligation consultation using the button below. One of our directors will guide you through the available options at your own pace, ensuring every detail aligns with your personal values.",
    },
  ];

  const processSteps = [
    { title: "Schedule Consultation", desc: "Meet with our planning specialists to discuss your wishes and preferences.", icon: HeartHandshake },
    { title: "Review Options", desc: "Explore service packages, merchandise, and memorial options.", icon: Sparkles },
    { title: "Document Preferences", desc: "Provide personal details, family information, and specific requests.", icon: FileText },
    { title: "Finalize Plan", desc: "Review your complete plan and make any adjustments.", icon: ShieldCheck },
    { title: "Peace of Mind", desc: "Rest assured knowing your wishes are documented and respected.", icon: Clock3 },
  ];

  // Update state when user types
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
    if (!formData.questions.trim()) errors.questions = "Please tell us what you would like help with.";
    return errors;
  };

  // Submit to Flask API
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
      const apiBase = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://127.0.0.1:5000" : window.location.origin);
      const requestUrl = `${apiBase}/api/consultations`;

      // Helpful debug output for deployed environments
      console.info("[PlanAhead] Submitting consultation to:", requestUrl);

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      let data = {};
      try { data = await response.json(); } catch (e) { /* non-json responses */ }

      if (response.ok) {
        toast.success(data.message || "Request received successfully. We will follow up with you shortly.", { id: toastId });
        setIsModalOpen(false);
        setFormData({ name: "", email: "", phone: "", questions: "" });
      } else {
        const serverMessage = data.message || data.error || (await response.text().catch(() => ""));
        console.warn("[PlanAhead] Consultation failed", response.status, serverMessage);
        toast.error(`Server error (${response.status}): ${serverMessage || 'Unable to send your request right now.'}`, { id: toastId });
      }
    } catch (error) {
      // Network / CORS / SSL errors land here
      console.error("[PlanAhead] Submission Error:", error);
      const apiBase = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://127.0.0.1:5000" : window.location.origin);
      const requestUrl = `${apiBase}/api/consultations`;
      toast.error(`Network error when contacting ${requestUrl}: ${error.message || error}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check server health when modal opens so deployed users see clear diagnostics
  React.useEffect(() => {
    if (!isModalOpen) return;

    let mounted = true;
    (async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://127.0.0.1:5000" : window.location.origin);
        const healthUrl = `${apiBase}/api/health`;
        setServerUrlChecked(healthUrl);
        console.info("[PlanAhead] Checking server health:", healthUrl);
        const res = await fetch(healthUrl, { method: "GET" });
        if (!mounted) return;
        if (res.ok) {
          setServerHealth('ok');
        } else {
          setServerHealth('error');
        }
      } catch (err) {
        if (!mounted) return;
        console.warn('[PlanAhead] Health check failed', err);
        setServerHealth('error');
      }
    })();

    return () => { mounted = false; };
  }, [isModalOpen]);

  return (
    <div className="bg-[#F8F6F0] relative min-h-screen">
      {/* Toast Notification Component */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* --- HIGHLIGHTED BACKGROUND SECTION --- */}
      <section 
        className="relative border-b border-[#E8DFD1] bg-cover bg-center bg-no-repeat pb-16 pt-20"
        style={{ backgroundImage: "url('/images/background().jpg')" }}
      >
        <div className="absolute inset-0 bg-[#F8F6F0]/85 backdrop-blur-[1px]"></div>
        
        <div className="site-container relative z-10">
          <div className="mb-12 rounded-[2rem] border border-[#E8DFD1] bg-white/90 p-8 shadow-[0_20px_70px_rgba(31,46,39,0.08)] md:p-10">
            <div className="mb-16 text-center">
              <p className="section-eyebrow">Pre-planning</p>
              <h1 className="mb-6 text-4xl font-serif font-semibold text-[#1F2E27] md:text-5xl">
                Plan Ahead with Confidence
              </h1>
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
                  return (
                    <div key={i} className="group flex cursor-pointer flex-col items-center rounded-[1.25rem] border border-[#E8DFD1] bg-[#F8F6F0] p-5 text-center transition-all hover:-translate-y-1 hover:border-[#A8895C] hover:shadow-md">
                      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#A8895C] text-xl font-bold text-white shadow-lg hover-wobble">
                        {i + 1}
                      </div>
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#A8895C] shadow-sm">
                        <Icon size={18} />
                      </div>
                      <h3 className="mb-3 text-sm font-bold text-[#1F2E27] transition-colors group-hover:text-[#A8895C]">
                        {step.title}
                      </h3>
                      <p className="px-2 text-xs leading-relaxed text-[#3D3530]">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* --- END HIGHLIGHTED SECTION --- */}

      <div className="site-container py-16">
        {/* Benefits */}
        <section className="mb-16 rounded-[1.5rem] border border-[#D8CFBC] bg-[#EFEAE0] p-8 shadow-sm md:p-12">
          <h2 className="mb-8 text-3xl font-serif font-semibold text-[#1F2E27]">
            Benefits of Pre-Planning
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { title: "Your wishes are honored", text: "Every preference is documented clearly so your family never has to guess." },
              { title: "Less emotional pressure", text: "Your loved ones can focus on comfort and remembrance instead of difficult decisions." },
              { title: "Long-term value", text: "Pre-funding can help secure today’s pricing and reduce future financial uncertainty." },
              { title: "Secure personal guidance", text: "Private, thoughtful planning support that respects your pace and preferences." },
            ].map((benefit, i) => (
              <div key={i} className="rounded-[1.1rem] border border-[#E8DFD1] bg-white/80 p-5">
                <h3 className="mb-2 text-lg font-semibold text-[#1F2E27]">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-[#3D3530]">{benefit.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
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

        {/* CTA */}
        <section className="rounded-[1.5rem] border border-[#E8DFD1] bg-white p-10 text-center shadow-sm md:p-12">
          <p className="section-eyebrow">Personalized support</p>
          <h2 className="mb-4 text-3xl font-serif font-semibold text-[#1F2E27]">
            Ready to Plan Ahead?
          </h2>
          <p className="mb-8 text-lg text-[#3D3530]">
            Our specialized team is ready to assist and guide you at your own pace with dignified care and clear options.
          </p>
          <div onClick={() => setIsModalOpen(true)} className="inline-block">
            <Button variant="primary" size="lg" className="px-8 py-4 text-lg shadow-md transition-all hover:shadow-lg">
              Schedule Your Consultation
            </Button>
          </div>
        </section>
      </div>

      {/* Consultation Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#F8F6F0] rounded-lg p-8 max-w-md w-full shadow-2xl border border-[#D8CFBC]">
            <h3 className="text-2xl font-serif font-semibold text-[#1F2E27] mb-2 border-b-2 border-[#A8895C] pb-2 inline-block">
              Schedule a Consultation
            </h3>
            <p className="text-[#3D3530] mb-6 text-sm mt-4">
              Please provide your details and we will contact you to arrange a time.
            </p>
            
            <form onSubmit={handleConsultationSubmit} className="space-y-5" noValidate>
              {/* API health / diagnostics shown to user for easier troubleshooting */}
              {serverUrlChecked && (
                <div className="mb-2 flex items-center justify-between rounded border border-[#E8DFD1] bg-white p-3 text-sm">
                  <div className="flex-1">
                    <span className="font-medium">API:</span>
                    <div className="break-words text-xs text-[#3D3530]">{serverUrlChecked}</div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <span className={`inline-block px-2 py-1 rounded text-white text-xs ${serverHealth === 'ok' ? 'bg-green-600' : 'bg-red-600'}`}>
                      {serverHealth === 'ok' ? 'Reachable' : 'Unreachable'}
                    </span>
                  </div>
                </div>
              )}
              <div>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your Full Name" 
                  aria-invalid={!!formErrors.name}
                  className="w-full p-3.5 rounded border border-[#E8DFD1] bg-white text-[#3D3530] focus:outline-none focus:border-[#A8895C] transition-colors"
                />
                {formErrors.name && <p className="mt-2 text-sm text-red-700" role="alert">{formErrors.name}</p>}
              </div>
              <div>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Address" 
                  aria-invalid={!!formErrors.email}
                  className="w-full p-3.5 rounded border border-[#E8DFD1] bg-white text-[#3D3530] focus:outline-none focus:border-[#A8895C] transition-colors"
                />
                {formErrors.email && <p className="mt-2 text-sm text-red-700" role="alert">{formErrors.email}</p>}
              </div>
              <div>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone Number" 
                  aria-invalid={!!formErrors.phone}
                  className="w-full p-3.5 rounded border border-[#E8DFD1] bg-white text-[#3D3530] focus:outline-none focus:border-[#A8895C] transition-colors"
                />
                {formErrors.phone && <p className="mt-2 text-sm text-red-700" role="alert">{formErrors.phone}</p>}
              </div>
              <div>
                <textarea 
                  name="questions"
                  value={formData.questions}
                  onChange={handleInputChange}
                  placeholder="Any specific questions? (Optional)" 
                  rows="3"
                  className="w-full p-3.5 rounded border border-[#E8DFD1] bg-white text-[#3D3530] focus:outline-none focus:border-[#A8895C] transition-colors resize-none"
                ></textarea>
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