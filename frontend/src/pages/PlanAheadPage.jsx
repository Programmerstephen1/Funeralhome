import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Button, Card, CardBody } from "../components"; // Note: CardBody is imported but not used, leaving it as is from your code

export default function PlanAheadPage() {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    { title: "Schedule Consultation", desc: "Meet with our planning specialists to discuss your wishes and preferences." },
    { title: "Review Options", desc: "Explore service packages, merchandise, and memorial options." },
    { title: "Document Preferences", desc: "Provide personal details, family information, and specific requests." },
    { title: "Finalize Plan", desc: "Review your complete plan and make any adjustments." },
    { title: "Peace of Mind", desc: "Rest assured knowing your wishes are documented and respected." },
  ];

  // Update state when user types
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit to Flask API
  const handleConsultationSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create a loading toast
    const toastId = toast.loading("Sending your request...");

    try {
      const response = await fetch("http://127.0.0.1:5000/api/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Success!
        toast.success("Request sent successfully! Check your email.", { id: toastId });
        setIsModalOpen(false);
        setFormData({ name: "", email: "", phone: "", questions: "" });
      } else {
        // Backend returned an error
        toast.error(`Error: ${data.error || "Failed to send"}`, { id: toastId });
      }
    } catch (error) {
      // Network crash
      console.error("Submission Error:", error);
      toast.error("Network error. Is your backend running?", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F8F6F0] relative">
      {/* Toast Notification Component */}
      <Toaster position="top-center" reverseOrder={false} />

      <div className="site-container py-12">
        {/* Hero */}
        <section className="mb-16 text-center">
          <h1 className="text-4xl font-serif font-semibold text-[#1F2E27] mb-4">
            Plan Ahead with Confidence
          </h1>
          <p className="text-lg text-[#3D3530] max-w-2xl mx-auto">
            Take control of your legacy and ease the burden on your loved ones.
            Pre-planning gives you peace of mind.
          </p>
        </section>

        {/* Process */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif font-semibold text-[#1F2E27] mb-8">
            Our Planning Process
          </h2>
          <div className="grid md:grid-cols-5 gap-4 mb-8">
            {processSteps.map((step, i) => (
              <div key={i} className="text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-serif font-semibold text-white mx-auto mb-3"
                  style={{ backgroundColor: "#A8895C" }}
                >
                  {i + 1}
                </div>
                <h3 className="font-semibold text-[#1F2E27] text-sm mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-[#3D3530]">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section 
          className="rounded-lg p-8 mb-16"
          style={{ backgroundColor: "#EFEAE0" }}
        >
          <h2 className="text-2xl font-serif font-semibold text-[#1F2E27] mb-6">
            Benefits of Pre-Planning
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "✓ Ensures your wishes are honored",
              "✓ Reduces burden on your family",
              "✓ Potential cost savings",
              "✓ Detailed personal information preserved",
              "✓ Flexible options to suit your values",
              "✓ Peace of mind for you and loved ones",
            ].map((benefit, i) => (
              <p key={i} className="text-[#3D3530]">
                {benefit}
              </p>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif font-semibold text-[#1F2E27] mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i}>
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full p-6 flex items-center justify-between hover:bg-[#EFEAE0] transition-colors"
                >
                  <h3 className="font-semibold text-[#1F2E27] text-left">
                    {faq.q}
                  </h3>
                  {expandedFaq === i ? (
                    <ChevronUp className="text-[#A8895C] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="text-[#A8895C] flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === i && (
                  <div className="px-6 pb-6 text-[#3D3530] border-t border-[#E8DFD1] pt-4">
                    {faq.a}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-2xl font-serif font-semibold text-[#1F2E27] mb-4">
            Ready to Plan Ahead?
          </h2>
          <p className="text-[#3D3530] mb-6">
            Our team is ready to help you at your own pace.
          </p>
          <div onClick={() => setIsModalOpen(true)} className="inline-block">
            <Button variant="primary" size="lg">
              Schedule Your Consultation
            </Button>
          </div>
        </section>
      </div>

      {/* Consultation Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#F8F6F0] rounded-lg p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-serif font-semibold text-[#1F2E27] mb-2">
              Schedule a Consultation
            </h3>
            <p className="text-[#3D3530] mb-6 text-sm">
              Please provide your details and we will contact you to arrange a time.
            </p>
            
            <form onSubmit={handleConsultationSubmit} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your Name" 
                  required 
                  className="w-full p-3 rounded border border-[#E8DFD1] bg-white text-[#3D3530] focus:outline-none focus:border-[#A8895C]"
                />
              </div>
              <div>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Address" 
                  required 
                  className="w-full p-3 rounded border border-[#E8DFD1] bg-white text-[#3D3530] focus:outline-none focus:border-[#A8895C]"
                />
              </div>
              <div>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone Number" 
                  required 
                  className="w-full p-3 rounded border border-[#E8DFD1] bg-white text-[#3D3530] focus:outline-none focus:border-[#A8895C]"
                />
              </div>
              <div>
                <textarea 
                  name="questions"
                  value={formData.questions}
                  onChange={handleInputChange}
                  placeholder="Any specific questions? (Optional)" 
                  rows="3"
                  className="w-full p-3 rounded border border-[#E8DFD1] bg-white text-[#3D3530] focus:outline-none focus:border-[#A8895C]"
                ></textarea>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 rounded border border-[#A8895C] text-[#A8895C] font-semibold hover:bg-[#EFEAE0] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 rounded bg-[#A8895C] text-white font-semibold hover:bg-[#8F744D] transition-colors disabled:opacity-50"
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