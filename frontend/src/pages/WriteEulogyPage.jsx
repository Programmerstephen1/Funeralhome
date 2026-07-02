import React, { useState } from "react";
import { CheckCircle, AlertCircle, Download, ExternalLink, ArrowLeft } from "lucide-react";
import { QRCodeSVG } from "qrcode.react"; 
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
      const response = await fetch("http://127.0.0.1:5000/api/eulogies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        const publicUrl = `${window.location.origin}/#eulogy_view/${data.eulogy_id}`;
        setEulogyUrl(publicUrl);
        setSubmitted(true);
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
    setFormData({
      deceased_name: "", birth_year: "", passing_year: "", occupation: "",
      interests: "", personality: "", favorite_memories: "", legacy: "",
    });
    setSubmitted(false);
    setEulogyUrl("");
    setErrors({});
  };

  return (
    <div className="bg-[#F8F6F0]">
      <div className="site-container py-12 max-w-2xl">
        
        {/* NEW: Dynamic Return Button */}
        <a 
          href={`#memorial/${dynamicId || ''}`}
          className="inline-flex items-center gap-2 text-sm text-[#A8895C] hover:text-[#1F2E27] uppercase tracking-wider font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Return to Memorial Dashboard
        </a>

        <section className="text-center mb-12">
          <h1 className="text-4xl font-serif font-semibold text-[#1F2E27] mb-4">
            Digital Eulogy Creator
          </h1>
          <p className="text-lg text-[#3D3530]">
            Draft a meaningful tribute. When finished, you will receive a unique QR code 
            that family and friends can scan to read the eulogy on their phones.
          </p>
        </section>

        {errors.submit && (
           <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
             <AlertCircle size={20} />
             {errors.submit}
           </div>
        )}

        {!submitted ? (
          <Card>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="font-semibold text-[#1F2E27] mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#A8895C] text-white flex items-center justify-center text-xs">1</span>
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1F2E27] mb-2">Name of the Deceased</label>
                      <input
                        type="text" name="deceased_name" value={formData.deceased_name} onChange={handleChange}
                        placeholder="Full name" className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]"
                      />
                      {errors.deceased_name && <p className="text-red-600 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} /> {errors.deceased_name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#1F2E27] mb-2">Birth Year</label>
                        <input
                          type="number" name="birth_year" value={formData.birth_year} onChange={handleChange}
                          placeholder="1940" className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]"
                        />
                        {errors.birth_year && <p className="text-red-600 text-sm mt-1">{errors.birth_year}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#1F2E27] mb-2">Year of Passing</label>
                        <input
                          type="number" name="passing_year" value={formData.passing_year} onChange={handleChange}
                          placeholder="2026" className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]"
                        />
                        {errors.passing_year && <p className="text-red-600 text-sm mt-1">{errors.passing_year}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#1F2E27] mb-2">Occupation (Optional)</label>
                        <input
                          type="text" name="occupation" value={formData.occupation} onChange={handleChange}
                          placeholder="e.g., Teacher, Engineer" className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#1F2E27] mb-2">Interests (Optional)</label>
                        <input
                          type="text" name="interests" value={formData.interests} onChange={handleChange}
                          placeholder="e.g., Gardening, Golf" className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1F2E27] mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#A8895C] text-white flex items-center justify-center text-xs">2</span>
                    Who They Were
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1F2E27] mb-2">Personality & Character *</label>
                      <textarea
                        name="personality" value={formData.personality} onChange={handleChange} rows={4}
                        placeholder="Describe their personality, values, and what made them special..."
                        className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]"
                      />
                      {errors.personality && <p className="text-red-600 text-sm mt-1">{errors.personality}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1F2E27] mb-2">Favorite Memories *</label>
                      <textarea
                        name="favorite_memories" value={formData.favorite_memories} onChange={handleChange} rows={4}
                        placeholder="Share a cherished memory or moment that exemplified their character..."
                        className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]"
                      />
                      {errors.favorite_memories && <p className="text-red-600 text-sm mt-1">{errors.favorite_memories}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1F2E27] mb-2">Their Legacy (Optional)</label>
                      <textarea
                        name="legacy" value={formData.legacy} onChange={handleChange} rows={3}
                        placeholder="How will they be remembered? What impact did they have?"
                        className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-[#E8DFD1]">
                  <Button variant="primary" type="submit" disabled={isSubmitting} className="flex-1 flex justify-center items-center">
                    {isSubmitting ? "Generating QR Code..." : "Complete & Generate QR"}
                  </Button>
                  <Button variant="secondary" type="button" onClick={handleReset} disabled={isSubmitting} className="flex-1">
                    Clear Form
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody className="text-center py-12 px-6">
              <CheckCircle size={56} className="mx-auto mb-4 text-[#A8895C]" />
              <h2 className="text-2xl font-serif font-semibold text-[#1F2E27] mb-2">
                Eulogy Created Successfully
              </h2>
              <p className="text-[#3D3530] mb-8 max-w-md mx-auto">
                Your digital tribute for <strong>{formData.deceased_name}</strong> is ready. 
                Print or share this QR code so guests can read the eulogy on their mobile devices during the service.
              </p>

              <div className="bg-white p-6 rounded-xl border border-[#E8DFD1] inline-block shadow-sm mb-8">
                <QRCodeSVG 
                  id="eulogy-qr-code"
                  value={eulogyUrl} 
                  size={200}
                  level={"H"}
                  includeMargin={true}
                  fgColor={"#1F2E27"} 
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={downloadQR}
                  className="flex items-center justify-center gap-2 py-2 px-6 rounded bg-[#1F2E27] text-white font-semibold hover:bg-[#3D3530] transition-colors"
                >
                  <Download size={18} /> Download QR Code
                </button>
                <a 
                  href={eulogyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2 px-6 rounded border border-[#1F2E27] text-[#1F2E27] font-semibold hover:bg-[#EFEAE0] transition-colors"
                >
                  <ExternalLink size={18} /> Preview Digital Page
                </a>
              </div>

              <div className="mt-12 pt-6 border-t border-[#E8DFD1]">
                <button onClick={handleReset} className="text-[#A8895C] font-semibold hover:underline">
                  Write Another Eulogy
                </button>
              </div>
            </CardBody>
          </Card>
        )}

        {!submitted && (
          <section className="mt-12 p-6 rounded-lg" style={{ backgroundColor: "#EFEAE0" }}>
            <h3 className="font-semibold text-[#1F2E27] mb-3">Tips for Writing a Eulogy</h3>
            <ul className="text-[#3D3530] space-y-2 text-sm">
              <li>✓ Be authentic and speak from the heart</li>
              <li>✓ Include specific memories and stories</li>
              <li>✓ Celebrate their accomplishments and character</li>
              <li>✓ Keep it concise (3-5 minutes of speaking time)</li>
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}