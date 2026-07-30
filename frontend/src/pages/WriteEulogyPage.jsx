import React, { useState, useEffect } from "react";
import { 
  CheckCircle, AlertCircle, ArrowLeft, ArrowRight, Camera, 
  CreditCard, Smartphone, Image as ImageIcon, LayoutTemplate, 
  Type, Settings2, User, BookOpen, Mail, QrCode, FileText,
  ChevronDown, ChevronUp, Clock, RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom"; 
import { Card, CardBody } from "../components";

// --- THE PREMIUM TEMPLATE DATA ---
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

// --- THE LIFE CHAPTERS ---
const lifeChapters = [
  { id: "early_life", title: "Early Life", subtitle: "Beginnings", desc: "The formative years and family roots.", placeholder: "Share where their story began, their family roots, childhood memories, and the early experiences that shaped them..." },
  { id: "education", title: "Education", subtitle: "Learning", desc: "Academic journey and lifelong learning.", placeholder: "Share their educational milestones, favorite subjects, schools attended, or passions they pursued..." },
  { id: "career", title: "Career", subtitle: "Service", desc: "Professional milestones and dedication.", placeholder: "Describe their work life, passions, achievements, and the colleagues they impacted..." },
  { id: "marriage_family", title: "Marriage & Family", subtitle: "Home", desc: "Love, family, and home life.", placeholder: "Talk about their spouse, children, family traditions, and the life they built at home..." },
  { id: "faith_values", title: "Faith & Values", subtitle: "Spiritual Life", desc: "Faith, service, and spiritual life.", placeholder: "Share their core beliefs, spiritual journey, values, or community service..." },
  { id: "final_chapter", title: "Final Chapter", subtitle: "Farewell", desc: "Strength, care, and farewell.", placeholder: "Reflect on their later years, their strength during challenges, and final farewells..." },
  { id: "legacy", title: "Legacy", subtitle: "Remembrance", desc: "The values, memories, and impact they leave behind.", placeholder: "How will they be remembered? What lasting impact did they have on those around them?" }
];

export default function WriteEulogyPage({ dynamicId }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepStatus, setStepStatus] = useState("drafting"); // 'drafting', 'pending_payment', or 'success'
  const [activeChapter, setActiveChapter] = useState("early_life");
  
  // Book Preview State
  const [previewPage, setPreviewPage] = useState(0);

  // 2-Hour Timer State (7200 seconds)
  const [timeLeft, setTimeLeft] = useState(7200);
  
  // Date formats strictly handle DD/MM/YYYY
  const [formData, setFormData] = useState({
    deceased_name: "", birth_date: "", passing_date: "", 
    occupation: "", interests: "", recipient_email: "",
    early_life: "", education: "", career: "", 
    marriage_family: "", faith_values: "", final_chapter: "", legacy: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [activeTemplateIndex, setActiveTemplateIndex] = useState(0);
  const [activeFontIndex, setActiveFontIndex] = useState(0);
  const [fontSize, setFontSize] = useState(16); 
  const [layoutOffset, setLayoutOffset] = useState(15); 
  
  const [displayImageUrl, setDisplayImageUrl] = useState(""); 
  const [backendImageUrl, setBackendImageUrl] = useState(""); 
  
  const [phone, setPhone] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // --- TIMER EFFECT FOR PENDING PAYMENTS ---
  useEffect(() => {
    let timer;
    if (stepStatus === "pending_payment" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft <= 0) {
      setStepStatus("drafting"); // Reset if time expires
      setErrors({ payment: "Your 2-hour reservation window has expired. Please resubmit." });
    }
    return () => clearInterval(timer);
  }, [stepStatus, timeLeft]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (errors.story) setErrors((prev) => ({ ...prev, story: "" }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setDisplayImageUrl(reader.result); 
    reader.readAsDataURL(file);

    setIsUploading(true);
    const token = localStorage.getItem("token");
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: uploadData,
      });
      const data = await response.json();
      if (response.ok) setBackendImageUrl(data.image_url); 
    } catch (err) {
      console.warn("Backend image upload failed. Local preview remains active.");
    } finally {
      setIsUploading(false);
    }
  };

  // --- VALIDATION & NAVIGATION ---
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.deceased_name) newErrors.deceased_name = "Name is required";
    if (!formData.birth_date) newErrors.birth_date = "Birth date is required";
    if (!formData.passing_date) newErrors.passing_date = "Passing date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    const hasAnyContent = lifeChapters.some(c => formData[c.id]?.trim().length > 0);
    if (!hasAnyContent) {
      newErrors.story = "Please write at least one chapter of their life story to proceed.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep(prev => Math.min(prev + 1, 4));
    setPreviewPage(0); // Reset book preview to cover
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleChapter = (chapterId) => {
    setActiveChapter(prev => prev === chapterId ? null : chapterId);
  };

  // --- BOOK PREVIEW LOGIC ---
  // Chunk chapters into pages (2 chapters per page)
  const filledChapters = lifeChapters.filter(c => formData[c.id]?.trim().length > 0);
  const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
    return chunks;
  };
  const chapterPages = chunkArray(filledChapters, 2);
  const totalPages = 1 + chapterPages.length; // 1 for cover + inner pages

  // --- PAYMENT & SUBMISSION ---
  const handlePaymentAndSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!phone) newErrors.payment = "Please provide an M-Pesa phone number.";
    if (!formData.recipient_email) newErrors.recipient_email = "Email is required for PDF delivery.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const currentTemplate = availableTemplates[activeTemplateIndex];
    const currentFont = availableFonts[activeFontIndex];
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail") || "guest@example.com";

    // Build the payload
    const compiledStory = lifeChapters
      .filter(c => formData[c.id]?.trim().length > 0)
      .map(c => `${c.title.toUpperCase()}:\n${formData[c.id]}\n`)
      .join("\n");

    const fullPayloadStory = `[PRODUCTION METADATA]\nTemplate: ${currentTemplate.name}\nFont: ${currentFont.name}\nSize: ${fontSize}px\nRecipient: ${formData.recipient_email}\n[/PRODUCTION METADATA]\n\n${compiledStory}`;

    const payload = {
      deceased_name: formData.deceased_name,
      birth_year: formData.birth_date, 
      passing_year: formData.passing_date,
      occupation: formData.occupation,
      interests: formData.interests,
      personality: fullPayloadStory,
      template_id: currentTemplate.id,
      price: currentTemplate.price,
      recipient_email: formData.recipient_email 
    };

    try {
      // 1. Trigger M-Pesa STK Push
      const paymentResponse = await fetch(`${API_URL}/api/payments/stkpush`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ amount: currentTemplate.price, phone: phone, email: userEmail }),
      });

      if (!paymentResponse.ok) {
        throw new Error("Insufficient funds or M-Pesa prompt failed.");
      }

      // 2. If Payment OK, Save as Success
      const eulogyResponse = await fetch(`${API_URL}/api/eulogies`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (eulogyResponse.ok) {
        setStepStatus("success");
      } else {
        throw new Error("Failed to save eulogy to server.");
      }

    } catch (error) {
      // 3. IF PAYMENT FAILS -> Save as Pending Draft and Start 2-Hour Timer
      console.warn("Payment failed, entering pending state:", error.message);
      
      try {
        // Attempt to save to backend as a draft (if API allows)
        await fetch(`${API_URL}/api/eulogies`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ ...payload, payment_status: 'pending' }),
        });
      } catch (saveError) {
        console.error("Draft save also failed, but continuing local session.", saveError);
      }
      
      setTimeLeft(7200); // Reset timer to exactly 2 hours
      setStepStatus("pending_payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ deceased_name: "", birth_date: "", passing_date: "", occupation: "", interests: "", recipient_email: "", early_life: "", education: "", career: "", marriage_family: "", faith_values: "", final_chapter: "", legacy: "" });
    setDisplayImageUrl("");
    setPhone("");
    setCurrentStep(1);
    setStepStatus("drafting");
    setErrors({});
  };

  const currentTemplate = availableTemplates[activeTemplateIndex];
  const currentFont = availableFonts[activeFontIndex];

  const formatPreviewDate = (dateString) => {
    if (!dateString) return "YYYY";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; 
    return date.getFullYear(); 
  };

  // --- STEP 1: DATE VALIDATION ---
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-[#F8F6F0] min-h-screen relative pb-20">
      
      {/* Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
        .book-page-enter {
          animation: fadeSlideIn 0.4s ease-out forwards;
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}} />

      <div className="site-container pt-12 pb-6 max-w-5xl mx-auto">
        
        <Link 
          to={`/memorial/${dynamicId || ''}`}
          className="inline-flex items-center gap-2 text-sm text-[#716860] hover:text-[#1F2E27] font-bold mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Exit Builder
        </Link>

        {/* PROGRESS INDICATOR */}
        {stepStatus === "drafting" && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#E8DFD1] p-6 mb-8 overflow-hidden relative">
            <div className="flex items-center justify-between relative max-w-3xl mx-auto">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#F8F6F0] z-0"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#A8895C] z-0 transition-all duration-500 ease-out" style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>
              
              {[
                { num: 1, label: "Details", icon: User },
                { num: 2, label: "Life Story", icon: BookOpen },
                { num: 3, label: "Design", icon: LayoutTemplate },
                { num: 4, label: "Publish", icon: CheckCircle }
              ].map((s) => {
                const Icon = s.icon;
                const isActive = currentStep >= s.num;
                const isCurrent = currentStep === s.num;
                return (
                  <div key={s.num} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2 sm:px-4 transition-all">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive ? 'bg-[#A8895C] border-[#A8895C] text-white shadow-md scale-110' : 'bg-white border-[#E8DFD1] text-[#D8CFBC]'}`}>
                      <Icon size={18} className={isCurrent ? "animate-pulse" : ""} />
                    </div>
                    <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${isCurrent ? 'text-[#1F2E27]' : isActive ? 'text-[#A8895C]' : 'text-[#D8CFBC] hidden sm:block'}`}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MAIN DRAFTING UI */}
        {stepStatus === "drafting" && (
          <div className="bg-white rounded-2xl shadow-xl border border-[#E8DFD1] overflow-hidden min-h-[60vh] flex flex-col">
            
            {/* STEP 1: BASIC INFO */}
            {currentStep === 1 && (
              <div className="p-8 md:p-12 animate-fadeIn flex-grow">
                <h2 className="text-2xl font-serif text-[#1F2E27] font-bold mb-2">Basic Details</h2>
                <p className="text-sm text-[#716860] mb-8 pb-6 border-b border-[#E8DFD1]">Start with the details family and friends will recognize first.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="col-span-1">
                    <label className="cursor-pointer group w-full aspect-square rounded-2xl border-2 border-dashed border-[#A8895C] bg-[#F8F6F0] flex flex-col items-center justify-center overflow-hidden relative transition-all hover:bg-[#EFEAE0]">
                      {displayImageUrl ? (
                        <img src={displayImageUrl} alt="Profile" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                      ) : (
                        <>
                          <Camera size={48} className="text-[#D8CFBC] mb-4 group-hover:scale-110 transition-transform" />
                          <p className="text-xs font-bold text-[#A8895C] uppercase tracking-widest text-center px-4">Upload Photo</p>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      {isUploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#A8895C] border-t-transparent rounded-full"></div></div>}
                    </label>
                  </div>
                  
                  <div className="col-span-2 space-y-6">
                    <div>
                      <label className="block text-xs uppercase tracking-widest font-bold text-[#1F2E27] mb-2">Full Name *</label>
                      <input type="text" name="deceased_name" value={formData.deceased_name} onChange={handleChange} placeholder="e.g., Jackline Wanjiru Kamau" className="w-full px-4 py-3.5 border border-[#E8DFD1] bg-[#F8F6F0] rounded-xl focus:outline-none focus:border-[#A8895C] focus:bg-white transition-colors" />
                      {errors.deceased_name && <p className="text-red-600 text-xs mt-1 font-bold">{errors.deceased_name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs uppercase tracking-widest font-bold text-[#1F2E27] mb-2">Date of Birth *</label>
                        <input type="date" name="birth_date" max={today} value={formData.birth_date} onChange={handleChange} className="w-full px-4 py-3.5 border border-[#E8DFD1] bg-[#F8F6F0] rounded-xl focus:outline-none focus:border-[#A8895C] focus:bg-white transition-colors text-[#3D3530]" />
                        {errors.birth_date && <p className="text-red-600 text-xs mt-1 font-bold">{errors.birth_date}</p>}
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest font-bold text-[#1F2E27] mb-2">Date of Passing *</label>
                        <input type="date" name="passing_date" max={today} value={formData.passing_date} onChange={handleChange} className="w-full px-4 py-3.5 border border-[#E8DFD1] bg-[#F8F6F0] rounded-xl focus:outline-none focus:border-[#A8895C] focus:bg-white transition-colors text-[#3D3530]" />
                        {errors.passing_date && <p className="text-red-600 text-xs mt-1 font-bold">{errors.passing_date}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs uppercase tracking-widest font-bold text-[#1F2E27] mb-2">Occupation (Optional)</label>
                        <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} placeholder="e.g., Teacher" className="w-full px-4 py-3.5 border border-[#E8DFD1] bg-[#F8F6F0] rounded-xl focus:outline-none focus:border-[#A8895C] focus:bg-white transition-colors" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest font-bold text-[#1F2E27] mb-2">Interests (Optional)</label>
                        <input type="text" name="interests" value={formData.interests} onChange={handleChange} placeholder="e.g., Gardening" className="w-full px-4 py-3.5 border border-[#E8DFD1] bg-[#F8F6F0] rounded-xl focus:outline-none focus:border-[#A8895C] focus:bg-white transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: LIFE STORY (ACCORDION STYLE) */}
            {currentStep === 2 && (
              <div className="p-8 md:p-12 animate-fadeIn flex-grow">
                <h2 className="text-2xl font-serif text-[#1F2E27] font-bold mb-2">Life Story</h2>
                <p className="text-sm text-[#716860] mb-8 pb-6 border-b border-[#E8DFD1]">Tell their story in gentle chapters. A few honest words are enough.</p>
                
                {errors.story && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm flex items-start gap-2 font-semibold">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" /> {errors.story}
                  </div>
                )}

                <div className="space-y-4">
                  {lifeChapters.map(chapter => {
                    const isActive = activeChapter === chapter.id;
                    const hasContent = formData[chapter.id]?.trim().length > 0;
                    
                    return (
                      <div key={chapter.id} className={`border rounded-xl transition-all duration-300 ${isActive ? 'border-[#A8895C] bg-[#F8F6F0] shadow-sm' : 'border-[#E8DFD1] bg-white hover:border-[#A8895C]/50'}`}>
                        <button 
                          type="button"
                          onClick={() => toggleChapter(chapter.id)}
                          className="w-full px-6 py-5 flex items-center justify-between outline-none"
                        >
                          <div className="flex flex-col text-left">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-[#1F2E27] text-lg">{chapter.title}</span>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[#A8895C] bg-[#A8895C]/10 px-2 py-0.5 rounded">{chapter.subtitle}</span>
                            </div>
                            <span className="text-sm text-[#716860] mt-1">{chapter.desc}</span>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            {hasContent && <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle size={14} /> Written</span>}
                            {isActive ? <ChevronUp size={24} className="text-[#A8895C]" /> : <ChevronDown size={24} className="text-[#A8895C]" />}
                          </div>
                        </button>
                        
                        {isActive && (
                          <div className="px-6 pb-6 animate-slideDown">
                            <textarea 
                              name={chapter.id} 
                              value={formData[chapter.id]} 
                              onChange={handleChange} 
                              rows={5} 
                              placeholder={chapter.placeholder} 
                              className="w-full p-5 border border-[#E8DFD1] bg-white rounded-xl focus:outline-none focus:border-[#A8895C] transition-colors font-serif resize-none leading-relaxed text-[#3D3530]" 
                            />
                            <div className="flex justify-end mt-4">
                              <button 
                                onClick={() => setActiveChapter(null)} 
                                className="text-xs font-bold uppercase tracking-widest text-[#716860] hover:text-[#A8895C] transition-colors"
                              >
                                Save Chapter
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: DESIGN & BOOK PREVIEW */}
            {currentStep === 3 && (
              <div className="flex flex-col md:flex-row h-full min-h-[60vh] animate-fadeIn flex-grow">
                {/* Visual "Book" Preview */}
                <div className="w-full md:w-[60%] bg-[#EFEAE0] p-4 lg:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#E8DFD1] relative">
                  
                  <div className="absolute top-6 left-6 z-20 bg-white/80 backdrop-blur px-3 py-1.5 rounded text-[10px] uppercase tracking-[0.2em] text-[#3D3530] font-bold shadow-sm">
                    Interactive Preview
                  </div>

                  {/* The Page Container */}
                  <div 
                    key={previewPage} 
                    className="book-page-enter w-full max-w-[400px] aspect-[1/1.4] shadow-2xl rounded-sm relative bg-cover bg-center transition-all overflow-hidden flex flex-col"
                    style={{
                      backgroundImage: currentTemplate.bg ? `url('${currentTemplate.bg}')` : 'none',
                      backgroundColor: currentTemplate.bg ? 'transparent' : '#F8F6F0',
                      color: currentTemplate.textColor,
                      fontFamily: currentFont.family,
                    }}
                  >
                    {currentTemplate.id === "dark_flora" && <div className="absolute inset-0 bg-black/40 rounded-sm pointer-events-none z-0"></div>}
                    
                    <div className="relative z-10 w-full h-full flex flex-col px-8 pb-8 custom-scrollbar overflow-y-auto">
                      
                      {/* PAGE 0: COVER */}
                      {previewPage === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center" style={{ paddingTop: `${layoutOffset}%` }}>
                          <p className="uppercase tracking-widest mb-6 opacity-80 font-bold" style={{ fontSize: `${fontSize * 0.7}px` }}>In Loving Memory Of</p>
                          <div className="w-[45%] aspect-square rounded-full overflow-hidden border-[4px] border-white/80 shadow-2xl mx-auto mb-6 relative" style={{ backgroundColor: currentTemplate.id === 'basic' ? '#E8DFD1' : '#1F2E27' }}>
                            {displayImageUrl ? (
                              <img src={displayImageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center opacity-50"><ImageIcon size={32} /></div>
                            )}
                          </div>
                          <h2 className="mb-4 leading-tight font-bold drop-shadow-md" style={{ fontSize: `${fontSize * 2.4}px` }}>{formData.deceased_name || "Name"}</h2>
                          <div className="w-16 h-0.5 mx-auto mb-4 bg-current opacity-60"></div>
                          <p className="font-bold tracking-widest opacity-90 drop-shadow-md" style={{ fontSize: `${fontSize * 0.9}px` }}>
                            {formatPreviewDate(formData.birth_date)} — {formatPreviewDate(formData.passing_date)}
                          </p>
                        </div>
                      )}

                      {/* PAGES > 0: TEXT CONTENT */}
                      {previewPage > 0 && (
                        <div className="pt-12 pb-6 text-left">
                          {chapterPages[previewPage - 1].map((chap, i) => (
                            <div key={i} className="mb-8 last:mb-0">
                              <h3 className="font-bold mb-3 uppercase tracking-widest opacity-90 border-b border-current pb-2" style={{ fontSize: `${fontSize * 1.1}px` }}>
                                {chap.title}
                              </h3>
                              <p className="leading-relaxed opacity-90 whitespace-pre-wrap" style={{ fontSize: `${fontSize}px` }}>
                                {formData[chap.id]}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Page Navigation Controls */}
                  <div className="flex items-center gap-6 mt-8 z-20">
                    <button 
                      onClick={() => setPreviewPage(p => Math.max(0, p - 1))} 
                      disabled={previewPage === 0}
                      className="w-10 h-10 rounded-full bg-white border border-[#E8DFD1] shadow-md flex items-center justify-center text-[#1F2E27] disabled:opacity-30 hover:bg-[#F8F6F0] transition-all"
                    ><ArrowLeft size={18}/></button>
                    
                    <span className="text-xs font-bold uppercase tracking-widest text-[#716860]">
                      Page {previewPage + 1} of {totalPages}
                    </span>
                    
                    <button 
                      onClick={() => setPreviewPage(p => Math.min(totalPages - 1, p + 1))} 
                      disabled={previewPage === totalPages - 1}
                      className="w-10 h-10 rounded-full bg-[#1F2E27] border border-[#1F2E27] shadow-md flex items-center justify-center text-white disabled:opacity-30 hover:bg-[#A8895C] transition-all"
                    ><ArrowRight size={18}/></button>
                  </div>
                </div>

                {/* Editor Tools */}
                <div className="w-full md:w-[40%] p-8 bg-white overflow-y-auto">
                  <h3 className="text-xl font-serif font-bold text-[#1F2E27] mb-6 border-b border-[#E8DFD1] pb-4">Theme Settings</h3>
                  
                  <div className="mb-8">
                    <label className="block text-xs uppercase tracking-widest font-bold text-[#716860] mb-4">Select Template</label>
                    <div className="grid grid-cols-2 gap-3">
                      {availableTemplates.map((temp, idx) => (
                        <button 
                          key={temp.id} onClick={() => setActiveTemplateIndex(idx)}
                          className={`relative h-24 rounded-xl overflow-hidden border-2 transition-all ${activeTemplateIndex === idx ? "border-[#A8895C] shadow-md scale-[1.02]" : "border-[#E8DFD1] hover:border-[#A8895C]/50"}`}
                        >
                          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: temp.thumbnail ? `url('${temp.thumbnail}')` : 'none', backgroundColor: temp.thumbnail ? 'transparent' : '#E8DFD1' }}></div>
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2"><span className="text-white text-xs font-bold text-center leading-tight drop-shadow-md">{temp.name}</span></div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6 border-t border-[#E8DFD1] pt-6">
                    <div>
                      <label className="block text-xs uppercase tracking-widest font-bold text-[#716860] mb-3">Typography</label>
                      <select value={activeFontIndex} onChange={(e) => setActiveFontIndex(Number(e.target.value))} className="w-full p-3 border border-[#E8DFD1] rounded-xl bg-[#F8F6F0] outline-none">
                        {availableFonts.map((font, idx) => <option key={idx} value={idx}>{font.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#F8F6F0] p-4 rounded-xl border border-[#E8DFD1]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#716860] block mb-2">Font Size</span>
                        <input type="range" min="10" max="24" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-[#A8895C]"/>
                      </div>
                      <div className="bg-[#F8F6F0] p-4 rounded-xl border border-[#E8DFD1]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#716860] block mb-2">Shift Cover Text</span>
                        <input type="range" min="0" max="50" value={layoutOffset} onChange={(e) => setLayoutOffset(Number(e.target.value))} className="w-full accent-[#A8895C]"/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: PUBLISH & PAY */}
            {currentStep === 4 && (
              <div className="p-8 md:p-12 animate-fadeIn flex-grow flex flex-col md:flex-row gap-12">
                
                <div className="w-full md:w-1/2">
                  <h2 className="text-2xl font-serif text-[#1F2E27] font-bold mb-4">Digital Delivery</h2>
                  <p className="text-sm text-[#716860] mb-8">Upon successful processing, our system will automatically generate a polished PDF and a unique QR Code for {formData.deceased_name || "your loved one"}.</p>
                  
                  <div className="flex gap-4 mb-8">
                    <div className="flex-1 bg-[#F8F6F0] border border-[#E8DFD1] rounded-2xl p-6 text-center shadow-sm">
                      <FileText size={32} className="text-[#A8895C] mx-auto mb-3" />
                      <h4 className="font-bold text-[#1F2E27] text-sm">PDF Eulogy</h4>
                      <p className="text-[10px] text-[#716860] mt-1 uppercase tracking-widest">Print Ready</p>
                    </div>
                    <div className="flex-1 bg-[#F8F6F0] border border-[#E8DFD1] rounded-2xl p-6 text-center shadow-sm">
                      <QrCode size={32} className="text-[#A8895C] mx-auto mb-3" />
                      <h4 className="font-bold text-[#1F2E27] text-sm">QR Code</h4>
                      <p className="text-[10px] text-[#716860] mt-1 uppercase tracking-widest">For Programs</p>
                    </div>
                  </div>

                  <div>
                    <label className="flex w-full justify-between items-center text-xs uppercase tracking-widest font-bold text-[#1F2E27] mb-2">Email Address for Delivery * {errors.recipient_email && <span className="text-red-600">Required</span>}</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8895C]" size={18} />
                      <input type="email" name="recipient_email" value={formData.recipient_email} onChange={handleChange} placeholder="Where should we send the files?" className="w-full pl-12 pr-4 py-4 border border-[#E8DFD1] bg-[#F8F6F0] rounded-xl focus:outline-none focus:border-[#A8895C] focus:bg-white transition-colors" />
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-1/2 bg-[#F8F6F0] p-8 rounded-2xl border border-[#E8DFD1]">
                  <h3 className="text-xl font-serif text-[#1F2E27] font-bold mb-6 border-b border-[#E8DFD1] pb-4">Order Summary</h3>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-[#716860]">Template: {currentTemplate.name}</span>
                    <span className="font-bold text-[#1F2E27]">KSh {currentTemplate.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-8 pb-6 border-b border-[#E8DFD1]">
                    <span className="text-sm text-[#716860]">Digital Generation (PDF & QR)</span>
                    <span className="font-bold text-emerald-600">Included</span>
                  </div>

                  <div className="flex justify-between items-end mb-8">
                    <span className="text-sm font-bold text-[#1F2E27] uppercase tracking-wider">Total Due</span>
                    <span className="text-3xl font-bold text-[#1F2E27]">KSh {currentTemplate.price.toLocaleString()}</span>
                  </div>

                  {errors.payment && (
                     <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm flex items-start gap-2 font-semibold">
                       <AlertCircle size={18} className="shrink-0 mt-0.5" /> {errors.payment}
                     </div>
                  )}

                  <label className="block text-xs uppercase tracking-widest font-bold text-[#1F2E27] mb-2">M-Pesa Phone Number *</label>
                  <div className="relative mb-8">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" size={18} />
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" className="w-full pl-12 pr-4 py-4 border border-[#E8DFD1] bg-white rounded-xl focus:outline-none focus:border-emerald-500 font-bold" />
                  </div>
                </div>
              </div>
            )}

            {/* WIZARD NAVIGATION CONTROLS */}
            <div className="p-6 md:px-12 bg-[#F8F6F0] border-t border-[#E8DFD1] flex justify-between items-center mt-auto rounded-b-2xl">
              <button 
                onClick={handleBack}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors ${currentStep === 1 ? 'invisible' : 'text-[#716860] hover:text-[#1F2E27] hover:bg-white border border-transparent hover:border-[#E8DFD1]'}`}
              >
                <ArrowLeft size={16} /> Back
              </button>

              {currentStep < 4 ? (
                <button 
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-bold uppercase tracking-widest bg-[#1F2E27] text-white hover:bg-[#A8895C] transition-colors shadow-md"
                >
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button 
                  onClick={handlePaymentAndSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-10 py-3.5 rounded-lg text-sm font-bold uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : <><CreditCard size={18} /> Pay & Publish</>}
                </button>
              )}
            </div>
          </div>
        )}

        {/* --- PENDING PAYMENT VAULT (2-HOUR TIMER) --- */}
        {stepStatus === "pending_payment" && (
          <div className="bg-white rounded-2xl shadow-2xl border-t-4 border-t-amber-500 text-center py-16 px-8 animate-fadeIn">
            <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-100">
              <Clock size={48} className="text-amber-500" />
            </div>
            
            <h2 className="text-4xl font-serif font-bold text-[#1F2E27] mb-2">
              Payment Pending
            </h2>
            <p className="text-sm font-bold uppercase tracking-widest text-amber-600 mb-8">
              M-Pesa Prompt Failed or Timed Out
            </p>

            <p className="text-[#3D3530] text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Don't worry, we have securely saved your eulogy draft. You have <strong className="text-[#1F2E27]">2 hours</strong> to complete the payment before this draft is deleted from our servers.
            </p>

            {/* The Live Clock */}
            <div className="text-6xl font-serif font-bold text-[#1F2E27] mb-10 bg-[#F8F6F0] py-6 px-12 rounded-xl inline-block border border-[#E8DFD1] shadow-inner tracking-widest">
              {formatTime(timeLeft)}
            </div>

            <div className="max-w-md mx-auto mb-8 bg-[#F8F6F0] p-6 rounded-xl border border-[#E8DFD1] text-left">
              <label className="block text-xs uppercase tracking-widest font-bold text-[#1F2E27] mb-2">Update M-Pesa Number</label>
              <div className="relative mb-4">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" size={18} />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" className="w-full pl-12 pr-4 py-4 border border-[#E8DFD1] bg-white rounded-xl focus:outline-none focus:border-emerald-500 font-bold" />
              </div>
              <button 
                onClick={handlePaymentAndSubmit}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-lg text-sm font-bold uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-50"
              >
                {isSubmitting ? "Sending Prompt..." : <><RefreshCw size={18} /> Retry Payment</>}
              </button>
            </div>
            
            <button onClick={handleReset} className="text-[#716860] hover:text-red-600 text-sm font-bold uppercase tracking-widest transition-colors">
              Cancel Order & Start Over
            </button>
          </div>
        )}

        {/* --- SUCCESS STATE --- */}
        {stepStatus === "success" && (
          <div className="bg-white rounded-2xl shadow-xl border-t-4 border-t-[#A8895C] text-center py-16 px-8 animate-fadeIn">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-100">
              <CheckCircle size={48} className="text-emerald-500" />
            </div>
            <p className="text-sm tracking-[0.28em] uppercase text-emerald-600 mb-3 font-bold">Transaction Successful</p>
            <h2 className="text-4xl font-serif font-bold text-[#1F2E27] mb-6">
              Tribute Published
            </h2>
            <p className="text-[#3D3530] text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              We have received your order for {formData.deceased_name}. The system is currently generating your high-resolution PDF and custom QR code. These will be sent to <strong className="text-[#A8895C]">{formData.recipient_email}</strong> momentarily.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/memorial" className="px-8 py-4 bg-[#1F2E27] text-white rounded-lg font-bold uppercase tracking-widest hover:bg-[#A8895C] transition-colors">
                Return to Memorial Hub
              </Link>
              <button onClick={handleReset} className="px-8 py-4 border-2 border-[#E8DFD1] text-[#1F2E27] rounded-lg font-bold uppercase tracking-widest hover:bg-[#F8F6F0] transition-colors">
                Create Another
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}