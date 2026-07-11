import React, { useState } from "react";
import { CheckCircle, AlertCircle, Download, ExternalLink, ArrowLeft } from "lucide-react";
import { QRCodeSVG } from "qrcode.react"; 
import { Link } from "react-router-dom"; 
import { Button, Card, CardBody } from "../components";

export default function WriteEulogyPage({ dynamicId }) {
  const [formData, setFormData] = useState({
    deceased_name: "", birth_year: "", passing_year: "", 
    occupation: "", interests: "", personality: "", 
    favorite_memories: "", legacy: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [eulogyUrl, setEulogyUrl] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.deceased_name.trim()) newErrors.deceased_name = "Name is required";
    if (!formData.birth_year.trim()) newErrors.birth_year = "Birth year is required";
    if (!formData.passing_year.trim()) newErrors.passing_year = "Passing year is required";
    if (!formData.personality.trim()) newErrors.personality = "Please describe their personality";
    if (!formData.favorite_memories.trim()) newErrors.favorite_memories = "Please share a memory";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setIsSubmitting(true);

    try {
      const fullStory = `
PERSONALITY & CHARACTER:
${formData.personality}

FAVORITE MEMORIES:
${formData.favorite_memories}

LEGACY:
${formData.legacy}
      `.trim();

      const payload = {
        deceased_name: formData.deceased_name,
        birth_year: formData.birth_year,
        passing_year: formData.passing_year,
        occupation: formData.occupation,
        interests: formData.interests,
        personality: fullStory
      };

      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || window.location.origin;
      const response = await fetch(`${API_URL}/api/eulogies`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Create the public URL for the QR Code
        const publicUrl = `${window.location.origin}/eulogy_view/${data.eulogy_id}`;
        setEulogyUrl(publicUrl);
        setSubmitted(true);

        // PRO-GRADE LINK: Save this eulogy ID to this specific memorial space!
        if (dynamicId) {
          localStorage.setItem(`LastPlannerJulz_EulogyID_${dynamicId}`, data.eulogy_id);
        }

      } else {
        setErrors({ submit: data.error || data.message || "Failed to save eulogy." });
      }
    } catch (error) {
      setErrors({ submit: "Network error. Please check your connection." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById("eulogy-qr-code");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `Eulogy_QR_${formData.deceased_name.replace(/\s+/g, '_')}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const handleReset = () => {
    setFormData({ deceased_name: "", birth_year: "", passing_year: "", occupation: "", interests: "", personality: "", favorite_memories: "", legacy: "" });
    setSubmitted(false);
    setEulogyUrl("");
    setErrors({});
  };

  return (
    <div className="bg-[#F8F6F0] min-h-screen">
      <div className="site-container py-12 max-w-3xl mx-auto">
        
        <Link 
          to={`/memorial/${dynamicId || ''}`}
          className="inline-flex items-center gap-2 text-sm text-[#A8895C] hover:text-[#1F2E27] uppercase tracking-wider font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Return to Memorial Dashboard
        </Link>

        <section className="text-center mb-12">
          <p className="text-sm tracking-[0.28em] uppercase text-[#A8895C] mb-3">Honor & Remember</p>
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-[#1F2E27] mb-4">
            Digital Eulogy Creator
          </h1>
          <p className="text-lg text-[#3D3530]">
            Draft a meaningful tribute. When finished, you will receive a unique QR code that family and friends can scan to read the eulogy on their phones during the service.
          </p>
        </section>

        {errors.submit && (
           <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-center gap-3 font-semibold shadow-sm" role="alert">
             <AlertCircle size={20} className="shrink-0" /> {errors.submit}
           </div>
        )}

        {!submitted ? (
          <Card className="shadow-lg border border-[#E8DFD1]">
            <CardBody className="p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-10">
                <div>
                  <h3 className="font-serif text-2xl font-semibold text-[#1F2E27] mb-6 flex items-center gap-3 border-b border-[#E8DFD1] pb-4">
                    <span className="w-8 h-8 rounded-full bg-[#1F2E27] text-[#A8895C] flex items-center justify-center text-sm font-bold">1</span>
                    Basic Information
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs uppercase tracking-widest font-bold text-[#1F2E27] mb-2">Name of the Deceased *</label>
                      <input type="text" name="deceased_name" value={formData.deceased_name} onChange={handleChange} placeholder="Full name" className="w-full px-4 py-3 border border-[#E8DFD1] bg-[#F8F6F0] rounded-lg focus:outline-none focus:border-[#A8895C] focus:bg-white transition-colors" />
                      {errors.deceased_name && <p className="text-red-600 text-xs mt-2 font-bold">{errors.deceased_name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs uppercase tracking-widest font-bold text-[#1F2E27] mb-2">Birth Year *</label>
                        <input type="number" name="birth_year" value={formData.birth_year} onChange={handleChange} placeholder="e.g. 1940" className="w-full px-4 py-3 border border-[#E8DFD1] bg-[#F8F6F0] rounded-lg focus:outline-none focus:border-[#A8895C] focus:bg-white transition-colors" />
                        {errors.birth_year && <p className="text-red-600 text-xs mt-2 font-bold">{errors.birth_year}</p>}
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest font-bold text-[#1F2E27] mb-2">Year of Passing *</label>
                        <input type="number" name="passing_year" value={formData.passing_year} onChange={handleChange} placeholder="e.g. 2026" className="w-full px-4 py-3 border border-[#E8DFD1] bg-[#F8F6F0] rounded-lg focus:outline-none focus:border-[#A8895C] focus:bg-white transition-colors" />
                        {errors.passing_year && <p className="text-red-600 text-xs mt-2 font-bold">{errors.passing_year}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs uppercase tracking-widest font-bold text-[#1F2E27] mb-2">Occupation (Optional)</label>
                        <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} placeholder="e.g., Teacher, Engineer" className="w-full px-4 py-3 border border-[#E8DFD1] bg-[#F8F6F0] rounded-lg focus:outline-none focus:border-[#A8895C] focus:bg-white transition-colors" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest font-bold text-[#1F2E27] mb-2">Interests (Optional)</label>
                        <input type="text" name="interests" value={formData.interests} onChange={handleChange} placeholder="e.g., Gardening, Golf" className="w-full px-4 py-3 border border-[#E8DFD1] bg-[#F8F6F0] rounded-lg focus:outline-none focus:border-[#A8895C] focus:bg-white transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-serif text-2xl font-semibold text-[#1F2E27] mb-6 flex items-center gap-3 border-b border-[#E8DFD1] pb-4">
                    <span className="w-8 h-8 rounded-full bg-[#1F2E27] text-[#A8895C] flex items-center justify-center text-sm font-bold">2</span>
                    Who They Were
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs uppercase tracking-widest font-bold text-[#1F2E27] mb-2">Personality & Character *</label>
                      <textarea name="personality" value={formData.personality} onChange={handleChange} rows={5} placeholder="Describe their personality, values, and what made them special..." className="w-full px-4 py-3 border border-[#E8DFD1] bg-[#F8F6F0] rounded-lg focus:outline-none focus:border-[#A8895C] focus:bg-white transition-colors font-serif" />
                      {errors.personality && <p className="text-red-600 text-xs mt-2 font-bold">{errors.personality}</p>}
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest font-bold text-[#1F2E27] mb-2">Favorite Memories *</label>
                      <textarea name="favorite_memories" value={formData.favorite_memories} onChange={handleChange} rows={5} placeholder="Share a cherished memory or moment that exemplified their character..." className="w-full px-4 py-3 border border-[#E8DFD1] bg-[#F8F6F0] rounded-lg focus:outline-none focus:border-[#A8895C] focus:bg-white transition-colors font-serif" />
                      {errors.favorite_memories && <p className="text-red-600 text-xs mt-2 font-bold">{errors.favorite_memories}</p>}
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest font-bold text-[#1F2E27] mb-2">Their Legacy (Optional)</label>
                      <textarea name="legacy" value={formData.legacy} onChange={handleChange} rows={3} placeholder="How will they be remembered? What impact did they have?" className="w-full px-4 py-3 border border-[#E8DFD1] bg-[#F8F6F0] rounded-lg focus:outline-none focus:border-[#A8895C] focus:bg-white transition-colors font-serif" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-8 border-t border-[#E8DFD1]">
                  <Button variant="primary" type="submit" disabled={isSubmitting} className="flex-[2] py-4 uppercase tracking-widest font-bold bg-[#1F2E27] hover:bg-[#A8895C] shadow-lg">
                    {isSubmitting ? "Generating QR Code..." : "Complete & Generate QR"}
                  </Button>
                  <Button variant="secondary" type="button" onClick={handleReset} disabled={isSubmitting} className="flex-1 py-4">
                    Clear Form
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        ) : (
          <Card className="shadow-xl border border-[#A8895C]">
            <CardBody className="text-center py-16 px-8">
              <CheckCircle size={64} className="mx-auto mb-6 text-[#A8895C]" />
              <h2 className="text-4xl font-serif font-semibold text-[#1F2E27] mb-4">
                Eulogy Created Successfully
              </h2>
              <p className="text-[#3D3530] text-lg mb-10 max-w-lg mx-auto">
                Your digital tribute for <strong>{formData.deceased_name}</strong> is ready. Print or share this QR code so guests can read the eulogy on their mobile devices during the service.
              </p>

              <div className="bg-white p-8 rounded-2xl border-2 border-[#E8DFD1] inline-block shadow-lg mb-10 transform hover:scale-105 transition-transform">
                <QRCodeSVG id="eulogy-qr-code" value={eulogyUrl} size={220} level={"H"} includeMargin={true} fgColor={"#1F2E27"} />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={downloadQR} className="flex items-center justify-center gap-2 py-3 px-8 rounded bg-[#1F2E27] text-white text-sm uppercase tracking-widest font-bold hover:bg-[#A8895C] transition-colors shadow-md">
                  <Download size={18} /> Download QR Code
                </button>
                <a href={eulogyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 px-8 rounded border-2 border-[#1F2E27] text-[#1F2E27] text-sm uppercase tracking-widest font-bold hover:bg-[#F8F6F0] transition-colors">
                  <ExternalLink size={18} /> Preview Digital Page
                </a>
              </div>

              <div className="mt-12 pt-8 border-t border-[#E8DFD1]">
                <button onClick={handleReset} className="text-[#A8895C] font-semibold hover:text-[#1F2E27] transition-colors uppercase tracking-widest text-sm">
                  Write Another Eulogy
                </button>
              </div>
            </CardBody>
          </Card>
        )}

        {!submitted && (
          <section className="mt-16 p-8 rounded-2xl border border-[#E8DFD1] shadow-sm bg-white">
            <h3 className="font-serif text-2xl font-semibold text-[#1F2E27] mb-6 border-b border-[#E8DFD1] pb-4">Tips for Writing a Meaningful Eulogy</h3>
            <div className="grid md:grid-cols-2 gap-6 text-[#3D3530] leading-relaxed">
              <p className="flex gap-3"><span className="text-[#A8895C] font-bold">✓</span> Be authentic and speak directly from the heart. Perfection is less important than truth.</p>
              <p className="flex gap-3"><span className="text-[#A8895C] font-bold">✓</span> Include specific memories and stories that highlight their unique character.</p>
              <p className="flex gap-3"><span className="text-[#A8895C] font-bold">✓</span> Celebrate their accomplishments, values, and the lessons they taught you.</p>
              <p className="flex gap-3"><span className="text-[#A8895C] font-bold">✓</span> Keep it concise. A written eulogy of 3 to 5 minutes (when spoken) holds the room beautifully.</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}