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
    <div className="bg-[#F8F6F0] relative min-h-screen">
      {/* Toast Notification Component */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* --- HIGHLIGHTED BACKGROUND SECTION --- */}
      <section 
        className="relative bg-cover bg-center bg-no-repeat pt-20 pb-16 border-b border-[#E8DFD1]"
        style={{ backgroundImage: "url('/images/background().jpg')" }}
      >
        {/* Soft overlay to ensure text remains readable over the image */}
        <div className="absolute inset-0 bg-[#F8F6F0]/85 backdrop-blur-[1px]"></div>
        
        <div className="site-container relative z-10">
          
          {/* Hero */}
          <div className="mb-20 text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-semibold text-[#1F2E27] mb-6">
              Plan Ahead with Confidence
            </h1>
            <p className="text-lg text-[#3D3530] max-w-2xl mx-auto leading-relaxed">
              Take control of your legacy and ease the burden on your loved ones.
              Pre-planning gives you profound peace of mind.
            </p>
          </div>

          {/* Process Steps */}
          <div>
            <h2 className="text-2xl font-serif font-semibold text-[#1F2E27] mb-10 text-center md:text-left">
              Our Planning Process
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {processSteps.map((step, i) => (
                <div key={i} className="text-center flex flex-col items-center group cursor-pointer">
                  {/* The Wobble Circle */}
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center font-serif text-xl font-bold text-white shadow-lg mb-5 hover-wobble"
                    style={{ backgroundColor: "#A8895C" }}
                  >
                    {i + 1}
                  </div>
                  <h3 className="font-bold text-[#1F2E27] text-sm mb-3 group-hover:text-[#A8895C] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#3D3530] leading-relaxed px-2">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
      {/* --- END HIGHLIGHTED SECTION --- */}

      <div className="site-container py-16">
        {/* Benefits */}
        <section 
          className="rounded-lg p-8 md:p-12 mb-16 shadow-sm border border-[#D8CFBC]"
          style={{ backgroundColor: "#EFEAE0" }}
        >
          <h2 className="text-3xl font-serif font-semibold text-[#1F2E27] mb-8">
            Benefits of Pre-Planning
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "✓ Ensures your exact wishes are honored",
              "✓ Reduces emotional burden on your family",
              "✓ Potential long-term cost savings",
              "✓ Detailed personal information preserved securely",
              "✓ Flexible options tailored to suit your values",
              "✓ Deep peace of mind for you and loved ones",
            ].map((benefit, i) => (
              <p key={i} className="text-[#3D3530] flex items-center font-medium">
                {benefit}
              </p>
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
        <section className="text-center bg-white border border-[#E8DFD1] rounded-lg p-12 shadow-sm">
          <h2 className="text-3xl font-serif font-semibold text-[#1F2E27] mb-4">
            Ready to Plan Ahead?
          </h2>
          <p className="text-[#3D3530] mb-8 text-lg">
            Our specialized team is ready to assist and guide you at your own pace.
          </p>
          <div onClick={() => setIsModalOpen(true)} className="inline-block">
            <Button variant="primary" size="lg" className="px-8 py-4 text-lg shadow-md hover:shadow-lg transition-all">
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
            
            <form onSubmit={handleConsultationSubmit} className="space-y-5">
              <div>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your Full Name" 
                  required 
                  className="w-full p-3.5 rounded border border-[#E8DFD1] bg-white text-[#3D3530] focus:outline-none focus:border-[#A8895C] transition-colors"
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
                  className="w-full p-3.5 rounded border border-[#E8DFD1] bg-white text-[#3D3530] focus:outline-none focus:border-[#A8895C] transition-colors"
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
                  className="w-full p-3.5 rounded border border-[#E8DFD1] bg-white text-[#3D3530] focus:outline-none focus:border-[#A8895C] transition-colors"
                />
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