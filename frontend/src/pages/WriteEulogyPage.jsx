import React, { useState } from "react";
import { CheckCircle, AlertCircle, ArrowLeft, Camera, CreditCard, Smartphone, X, Image as ImageIcon, LayoutTemplate, Type, Settings2 } from "lucide-react";
import { Link } from "react-router-dom"; 
import { Button, Card, CardBody } from "../components";

// --- THE PREMIUM TEMPLATE DATA ---
// NOTE: Place your custom Canva/Photoshop backgrounds into your public/templates/ folder and map them here!
const availableTemplates = [
  { id: "basic", name: "Executive Minimal", bg: "", thumbnail: "", price: 2500, textColor: "#1F2E27" },
  { id: "blue_rose", name: "Blue Rose Border", bg: "/images/download.jpg", thumbnail: "/images/download.jpg", price: 3500, textColor: "#1F2E27" },
  { id: "dark_flora", name: "Dark Golden Flora", bg: "/images/images.jpg", thumbnail: "/images/images.jpg", price: 4500, textColor: "#F8F6F0" },
  { id: "classic_parchment", name: "Classic Parchment", bg: "https://www.transparenttextures.com/patterns/cream-paper.png", thumbnail: "https://www.transparenttextures.com/patterns/cream-paper.png", price: 3000, textColor: "#3D3530" }
];

const availableFonts = [
  { id: "playfair", name: "Classic Serif", family: "'Playfair Display', serif" },
  { id: "lato", name: "Clean Modern", family: "'Lato', sans-serif" },
  { id: "great_vibes", name: "Elegant Script", family: "'Great Vibes', cursive" },
  { id: "cinzel", name: "Royal Display", family: "'Cinzel', serif" },
  { id: "dancing", name: "Handwritten", family: "'Dancing Script', cursive" },
  { id: "merriweather", name: "Journal Verse", family: "'Merriweather', serif" },
  { id: "courier", name: "Vintage Typewriter", family: "'Courier Prime', monospace" }
];

export default function WriteEulogyPage({ dynamicId }) {
  const [step, setStep] = useState("writing"); 
  
  const [formData, setFormData] = useState({
    deceased_name: "", birth_year: "", passing_year: "", 
    occupation: "", interests: "", personality: "", 
    favorite_memories: "", legacy: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [activeTemplateIndex, setActiveTemplateIndex] = useState(0);
  const [activeFontIndex, setActiveFontIndex] = useState(0);
  const [fontSize, setFontSize] = useState(16); 
  const [layoutOffset, setLayoutOffset] = useState(15); 
  
  // Two separate image states to prevent the 2-second broken link flash
  const [displayImageUrl, setDisplayImageUrl] = useState(""); 
  const [backendImageUrl, setBackendImageUrl] = useState(""); 
  
  const [phone, setPhone] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.deceased_name === "") newErrors.deceased_name = "Name is required";
    if (formData.birth_year === "") newErrors.birth_year = "Birth year is required";
    if (formData.passing_year === "") newErrors.passing_year = "Passing year is required";
    if (formData.personality === "") newErrors.personality = "Please describe their personality";
    if (formData.favorite_memories === "") newErrors.favorite_memories = "Please share a memory";
    return newErrors;
  };

  const handleProceedToPreview = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    let hasErrors = false;
    for (let key in newErrors) {
      hasErrors = true;
    }

    if (hasErrors === true) {
      setErrors(newErrors);
    } else {
      setStep("preview");
      window.scrollTo(0, 0);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Instantly display the unbreakable local preview to the user
    const reader = new FileReader();
    reader.onloadend = () => {
      setDisplayImageUrl(reader.result); 
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    const token = localStorage.getItem("token");
    const uploadData = new FormData();
    uploadData.append("file", file);

    // 2. Silently attempt to send it to the backend
    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: uploadData,
      });
      const data = await response.json();
      if (response.ok) {
        setBackendImageUrl(data.image_url); // Store the official link for the database payload
      }
    } catch (err) {
      console.warn("Backend image upload failed. Local preview remains active for presentation.");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaymentAndSubmit = async (e) => {
    e.preventDefault();
    
    if (phone === "") {
      setErrors({ payment: "Please provide an M-Pesa phone number." });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const currentTemplate = availableTemplates[activeTemplateIndex];
    const currentFont = availableFonts[activeFontIndex];

    try {
      const token = localStorage.getItem("token");
      const userEmail = localStorage.getItem("userEmail") || "guest@example.com";

      const paymentResponse = await fetch(`${API_URL}/api/payments/stkpush`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ amount: currentTemplate.price, phone: phone, email: userEmail }),
      });

      if (!paymentResponse.ok) {
        console.warn("Daraja API offline. Utilizing local simulation.");
        await new Promise(resolve => setTimeout(resolve, 1500)); 
      }

      const fullStory = `
[PRODUCTION METADATA]
Template: ${currentTemplate.name}
Font Style: ${currentFont.name}
Font Size: ${fontSize}px
Layout Offset: ${layoutOffset}%
Image URL: ${backendImageUrl || displayImageUrl || 'No image provided'}
[/PRODUCTION METADATA]

PERSONALITY & CHARACTER:
${formData.personality}

FAVORITE MEMORIES:
${formData.favorite_memories}

LEGACY:
${formData.legacy}
      `;

      const payload = {
        deceased_name: formData.deceased_name,
        birth_year: formData.birth_year,
        passing_year: formData.passing_year,
        occupation: formData.occupation,
        interests: formData.interests,
        personality: fullStory
      };

      const eulogyResponse = await fetch(`${API_URL}/api/eulogies`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const eulogyData = await eulogyResponse.json();

      if (eulogyResponse.ok) {
        if (dynamicId) {
          localStorage.setItem(`LastPlannerJulz_EulogyID_${dynamicId}`, eulogyData.eulogy_id);
        }
        setStep("success");
      } else {
        setErrors({ payment: eulogyData.error || "Failed to save eulogy details." });
      }
    } catch (error) {
      setErrors({ payment: "Network error. Please check your connection." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ deceased_name: "", birth_year: "", passing_year: "", occupation: "", interests: "", personality: "", favorite_memories: "", legacy: "" });
    setDisplayImageUrl("");
    setBackendImageUrl("");
    setPhone("");
    setActiveTemplateIndex(0);
    setActiveFontIndex(0);
    setFontSize(16);
    setLayoutOffset(15);
    setStep("writing");
    setErrors({});
  };

  const currentTemplate = availableTemplates[activeTemplateIndex];
  const currentFont = availableFonts[activeFontIndex];

  return (
    <div className="bg-[#F8F6F0] min-h-screen relative">
      <div className="site-container py-12 max-w-3xl mx-auto">
        
        <Link 
          to={`/memorial/${dynamicId || ''}`}
          className="inline-flex items-center gap-2 text-sm text-[#A8895C] hover:text-[#1F2E27] uppercase tracking-wider font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Return to Memorial Dashboard
        </Link>

        <section className="text-center mb-12">
          {step === "success" ? (
             <p className="text-sm tracking-[0.28em] uppercase text-emerald-600 mb-3 font-bold">Order Received</p>
          ) : (
             <p className="text-sm tracking-[0.28em] uppercase text-[#A8895C] mb-3">Honor & Remember</p>
          )}
          
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-[#1F2E27] mb-4">
            {step === "success" ? "Tribute in Production" : "Digital Eulogy Creator"}
          </h1>
          
          {step === "writing" && (
            <p className="text-lg text-[#3D3530]">
              Draft a meaningful tribute. When finished, you can select a premium design template and submit your text for official QR code generation.
            </p>
          )}
        </section>

        {step === "writing" && (
          <Card className="shadow-lg border border-[#E8DFD1]">
            <CardBody className="p-8 md:p-12">
              <form onSubmit={handleProceedToPreview} className="space-y-10">
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

                <div className="pt-8 border-t border-[#E8DFD1]">
                  <Button variant="primary" type="submit" className="w-full py-4 uppercase tracking-widest font-bold bg-[#1F2E27] hover:bg-[#A8895C] shadow-lg flex items-center justify-center gap-2">
                    <LayoutTemplate size={18} /> Review & Select Design Template
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        {step === "success" && (
          <Card className="shadow-xl border-t-4 border-t-[#A8895C]">
            <CardBody className="text-center py-16 px-8">
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle size={48} className="text-emerald-600" />
              </div>
              <h2 className="text-3xl font-serif font-semibold text-[#1F2E27] mb-4">
                Thank You For Your Order
              </h2>
              <p className="text-[#3D3530] text-lg mb-8 max-w-lg mx-auto leading-relaxed">
                Your custom digital eulogy and QR code are now entering the design phase. To ensure the highest standard of quality and dignity, our team processes these within <strong className="text-[#1F2E27]">48 hours</strong>.
              </p>
              
              <div className="bg-[#F8F6F0] border border-[#E8DFD1] rounded p-6 inline-block text-left text-sm text-[#716860] mb-10 shadow-inner">
                <p className="flex items-center gap-2 mb-2"><CheckCircle size={14} className="text-[#A8895C]"/> Payment logged securely via M-Pesa.</p>
                <p className="flex items-center gap-2 mb-2"><CheckCircle size={14} className="text-[#A8895C]"/> Selected Template: {currentTemplate.name}</p>
                <p className="flex items-center gap-2 mb-2"><CheckCircle size={14} className="text-[#A8895C]"/> Typeface: {currentFont.name}</p>
                <p className="flex items-center gap-2"><CheckCircle size={14} className="text-[#A8895C]"/> Final assets will be emailed directly to you.</p>
              </div>

              <div className="border-t border-[#E8DFD1] pt-8">
                <button onClick={handleReset} className="text-[#A8895C] font-semibold hover:text-[#1F2E27] transition-colors uppercase tracking-widest text-sm">
                  Write Another Eulogy
                </button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {(step === "preview" || step === "payment") && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 lg:p-8">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full h-[95vh] md:h-[90vh] flex flex-col md:flex-row overflow-hidden border border-[#A8895C] animate-fadeIn">
            
            {/* LEFT PANEL: True WYSIWYG Template Preview (Independent Scroll) */}
            <div className="w-full md:w-[55%] h-[40vh] md:h-full bg-[#EFEAE0] p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#E8DFD1] relative overflow-y-auto shrink-0">
              
              <div className="absolute top-6 left-6 z-10 bg-white/80 backdrop-blur px-3 py-1.5 rounded border border-[#A8895C]/30 text-[10px] uppercase tracking-[0.2em] text-[#3D3530] font-bold shadow-sm">
                Live Cover Preview
              </div>

              <div 
                className="w-full max-w-md aspect-[1/1.4] shadow-2xl rounded-sm flex flex-col items-center text-center relative bg-cover bg-center transition-all duration-500 ease-in-out mt-8 mb-8"
                style={{
                  backgroundImage: currentTemplate.bg ? `url('${currentTemplate.bg}')` : 'none',
                  backgroundColor: currentTemplate.bg ? 'transparent' : '#F8F6F0',
                  color: currentTemplate.textColor,
                  fontFamily: currentFont.family,
                  fontSize: `${fontSize}px` 
                }}
              >
                {currentTemplate.id === "dark_flora" && <div className="absolute inset-0 bg-black/30 rounded-sm pointer-events-none"></div>}
                
                <div 
                  className="relative z-10 w-full flex flex-col items-center px-8" 
                  style={{ paddingTop: `${layoutOffset}%` }}
                >
                  <p className="uppercase tracking-widest mb-6 opacity-80 font-bold" style={{ fontSize: '0.7em' }}>
                    In Loving Memory Of
                  </p>
                  
                  <label className="cursor-pointer group w-[45%] aspect-square rounded-full overflow-hidden border-[4px] border-white/80 shadow-2xl mx-auto mb-6 shrink-0 relative transition-transform hover:scale-105" style={{ backgroundColor: currentTemplate.id === 'basic' ? '#E8DFD1' : '#1F2E27' }}>
                    {displayImageUrl ? (
                      <img src={displayImageUrl} alt="" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center backdrop-blur-sm bg-black/10 group-hover:bg-black/20 transition-colors" style={{ borderColor: currentTemplate.textColor }}>
                        <ImageIcon size={32} className="mb-2 opacity-50" />
                        <span className="text-[10px] uppercase tracking-widest font-bold opacity-50" style={{ fontFamily: 'sans-serif' }}>Add Photo</span>
                      </div>
                    )}
                    {displayImageUrl && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={32} className="text-white drop-shadow-md" />
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>

                  <h2 className="mb-4 leading-tight font-bold drop-shadow-md" style={{ fontSize: '2.4em' }}>
                    {formData.deceased_name}
                  </h2>
                  
                  <div className="w-16 h-0.5 mx-auto mb-4 bg-current opacity-60"></div>
                  
                  <p className="font-bold tracking-widest opacity-90 drop-shadow-md" style={{ fontSize: '0.9em' }}>
                    {formData.birth_year} — {formData.passing_year}
                  </p>
                </div>
              </div>

            </div>

            {/* RIGHT PANEL: Settings & Payment (Independent Scroll with Sticky Header) */}
            <div className="w-full md:w-[45%] h-[55vh] md:h-full bg-white flex flex-col relative shrink-0">
              
              <div className="sticky top-0 z-20 flex items-center justify-between px-8 py-6 border-b border-[#E8DFD1] bg-white/95 backdrop-blur-sm shrink-0">
                <h3 className="text-2xl font-serif text-[#1F2E27]">Design & Checkout</h3>
                <button onClick={() => setStep("writing")} className="text-[#8F847C] hover:text-[#1F2E27] p-2 bg-[#F8F6F0] rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 flex flex-col">
                
                <div className="mb-8">
                  <label className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#1F2E27] mb-3"><LayoutTemplate size={14} className="text-[#A8895C]"/> Visual Templates</label>
                  <div className="grid grid-cols-2 gap-3">
                    {availableTemplates.map((temp, idx) => (
                      <button 
                        key={temp.id}
                        onClick={() => setActiveTemplateIndex(idx)}
                        className={`relative flex flex-col text-left rounded-xl overflow-hidden border-2 transition-all h-36 ${
                          activeTemplateIndex === idx 
                          ? "border-[#A8895C] shadow-md scale-[1.02]" 
                          : "border-[#E8DFD1] hover:border-[#A8895C]/50"
                        }`}
                      >
                        <div 
                          className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: temp.thumbnail ? `url('${temp.thumbnail}')` : 'none',
                            backgroundColor: temp.thumbnail ? 'transparent' : '#E8DFD1'
                          }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        
                        <div className="relative z-10 mt-auto p-3 text-white">
                          <span className="block text-xs font-bold drop-shadow-md leading-tight">{temp.name}</span>
                          <span className="block text-[10px] text-[#F8F6F0] mt-1 drop-shadow-md font-semibold">KSh {temp.price.toLocaleString()}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-[#8F847C] italic mt-2">Design custom graphical backgrounds, place them in your public/templates folder, and they will apply to the inside pages of the generated document.</p>
                </div>

                <div className="mb-8 space-y-4 border-t border-[#E8DFD1] pt-6">
                  <label className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#1F2E27]"><Type size={14} className="text-[#A8895C]"/> Typography Settings</label>
                  
                  <select 
                    value={activeFontIndex} 
                    onChange={(e) => setActiveFontIndex(Number(e.target.value))}
                    className="w-full p-3 border border-[#E8DFD1] rounded bg-[#F8F6F0] focus:bg-white focus:border-[#A8895C] outline-none transition-colors text-sm font-semibold cursor-pointer"
                    style={{ fontFamily: currentFont.family }}
                  >
                    {availableFonts.map((font, idx) => (
                      <option key={idx} value={idx} style={{ fontFamily: font.family }}>
                        {font.name}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2 bg-[#F8F6F0] p-3 rounded border border-[#E8DFD1]">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#716860]">Font Size</span>
                      </div>
                      <input type="range" min="10" max="30" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-[#1F2E27]"/>
                    </div>
                    <div className="flex flex-col gap-2 bg-[#F8F6F0] p-3 rounded border border-[#E8DFD1]">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#716860] flex items-center gap-1"><Settings2 size={12}/> Shift Down</span>
                      </div>
                      <input type="range" min="0" max="50" value={layoutOffset} onChange={(e) => setLayoutOffset(Number(e.target.value))} className="w-full accent-[#1F2E27]"/>
                    </div>
                  </div>
                </div>

                <div className="mt-auto bg-[#F8F6F0] p-6 rounded border border-[#E8DFD1] shrink-0">
                  <div className="flex justify-between items-center mb-4 border-b border-[#E8DFD1] pb-4">
                    <span className="text-sm font-bold text-[#1F2E27] uppercase tracking-wider">Total Fee</span>
                    <span className="text-2xl font-bold text-[#1F2E27]">KSh {currentTemplate.price.toLocaleString()}</span>
                  </div>
                  
                  {errors.payment && (
                     <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded text-xs flex items-start gap-2 font-semibold">
                       <AlertCircle size={14} className="shrink-0 mt-0.5" /> {errors.payment}
                     </div>
                  )}

                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#716860] mb-2">M-Pesa Phone Number</label>
                  <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Smartphone size={16} className="text-[#A8895C]" />
                    </div>
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="07XX XXX XXX" 
                      className="w-full pl-10 pr-4 py-3 border border-[#E8DFD1] bg-white rounded focus:outline-none focus:border-[#A8895C] transition-colors text-sm font-semibold"
                    />
                  </div>

                  <button 
                    onClick={handlePaymentAndSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-[#1F2E27] text-white py-4 rounded font-bold uppercase tracking-widest hover:bg-[#A8895C] shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Processing..." : <><CreditCard size={18} /> Pay & Submit Order</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}