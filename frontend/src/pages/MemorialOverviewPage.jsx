import React, { useState, useEffect } from "react"; 
import { Bookmark, BookOpen, Image as ImageIcon, PenTool, Flower, Flame, Users, TreeDeciduous, FileText, ArrowRight, Lock, UserPlus, FileSignature, CheckCircle, Upload, Smartphone, HelpCircle, ShieldAlert } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardBody, Modal } from "../components";

const sections = [
  { icon: Bookmark, title: "Overview", description: "A calm introduction to the memorial site and its purpose.", target: "overview" },
  { icon: BookOpen, title: "Memorial Wall", description: "A dedicated space for highlighted remembrances and honored names.", target: "wall" },
  { icon: PenTool, title: "Memorial Pages", description: "Individual pages for sharing stories, photos, and memories.", target: "pages" },
  { icon: ImageIcon, title: "Gallery", description: "A refined gallery of photographs, momentos, and visual tributes.", target: "gallery" },
  { icon: Flower, title: "Visitor Flowers", description: "A thoughtful way for family and friends to leave floral tributes.", target: "flowers" },
  { icon: Flame, title: "Visitor Candles", description: "Light a candle to honor a life and send a quiet message of support.", target: "candles" },
  { icon: Users, title: "Family & Friends", description: "A curated roster of loved ones connected to the memorial.", target: "family" },
  { icon: TreeDeciduous, title: "Family Tree", description: "A gentle family tree view for tracing relationships and heritage.", target: "tree" },
  { icon: FileText, title: "Live Journal", description: "A journal space for updates, reflections, and ongoing remembrance.", target: "journal" },
  { icon: FileSignature, title: "Write Eulogy", description: "Draft a digital tribute and generate a secure QR code for attendees.", target: "eulogy" }
];

const securityQuestionsList = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What was your childhood nickname?",
  "What is your mother's maiden name?",
  "What was the name of your first school?"
];

export default function MemorialOverviewPage({ dynamicId }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(sections[0].title);
  const [view, setView] = useState("access"); 
  
  const [accessId, setAccessId] = useState("");
  const [accessPin, setAccessPin] = useState("");
  
  const [createName, setCreateName] = useState("");
  const [createId, setCreateId] = useState(""); 
  const [createPin, setCreatePin] = useState("");
  const [createFamilyTreePin, setCreateFamilyTreePin] = useState(""); 
  const [createDonationNumber, setCreateDonationNumber] = useState("");
  const [createPortrait, setCreatePortrait] = useState("");
  
  // Security Question State for Creation
  const [securityQuestion, setSecurityQuestion] = useState(securityQuestionsList[0]);
  const [securityAnswer, setSecurityAnswer] = useState("");
  
  // Forgot PIN Recovery State
  const [showForgotPin, setShowForgotPin] = useState(false);
  const [recoveryId, setRecoveryId] = useState("");
  const [recoveryStep, setRecoveryStep] = useState(1); // 1: Enter ID, 2: Answer Q, 3: Show PINs
  const [recoveryAnswerInput, setRecoveryAnswerInput] = useState("");
  const [recoveredData, setRecoveredData] = useState(null);

  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "" });
  const [helpText, setHelpText] = useState("Choose an option to open a private memorial space.");

  useEffect(() => {
    if (dynamicId === "demo") {
      const memorials = JSON.parse(localStorage.getItem("LastPlannerJulz_Memorials") || "{}");
      
      if (!memorials["demo"]) {
        memorials["demo"] = { 
          name: "Jane Doe (Sample)", 
          pin: "0000", 
          familyTreePin: "1111", 
          donationNumber: "0712 345 678", 
          portrait: "https://via.placeholder.com/400x400?text=Jane+Doe",
          securityQuestion: "What was the name of your first pet?",
          securityAnswer: "fluffy" // Demo recovery answer
        };
        localStorage.setItem("LastPlannerJulz_Memorials", JSON.stringify(memorials));

        localStorage.setItem("LastPlannerJulz_Gallery_demo", JSON.stringify([
          { id: 1, image: "https://via.placeholder.com/600x400?text=Family+Vacation", caption: "A beautiful day together", uploader: "John", date: new Date().toLocaleDateString() }
        ]));

        localStorage.setItem("LastPlannerJulz_Candles_demo", JSON.stringify([
          { id: 1, from: "The Smith Family", message: "Your light will always shine bright in our hearts.", date: new Date().toLocaleDateString() }
        ]));

        localStorage.setItem("LastPlannerJulz_Flowers_demo", JSON.stringify([
          { id: 1, from: "Grace & Tom", arrangement: "White Roses & Lilies", date: new Date().toLocaleDateString() }
        ]));

        localStorage.setItem("LastPlannerJulz_NuclearFamily_demo", "true");
        localStorage.setItem("LastPlannerJulz_Tree_demo", JSON.stringify([
          { id: 1, name: "John Doe", relationship: "Husband", quote: "Forever my love.", photo: null }
        ]));
      }
      return; 
    }

    const token = localStorage.getItem("token") || localStorage.getItem("userEmail");
    if (!token) {
      navigate("/login");
    }
  }, [navigate, dynamicId]);

  const triggerToastAndRedirect = (message, routeUrl) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: "" });
      navigate(routeUrl);
    }, 1500); 
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCreatePortrait(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateMemorial = (e) => {
    e.preventDefault();
    if (!createName || !createId || !createPin || !createFamilyTreePin || !createDonationNumber || !securityAnswer) {
      setError("Please fill out all required fields, including your security answer.");
      return;
    }
    
    const cleanId = createId.toLowerCase().split(' ').join('-');
    const memorials = JSON.parse(localStorage.getItem("LastPlannerJulz_Memorials") || "{}");
    
    if (memorials[cleanId]) {
      setError("This Memorial ID is already taken. Please choose another.");
      return;
    }

    memorials[cleanId] = { 
      name: createName, 
      pin: createPin, 
      familyTreePin: createFamilyTreePin, 
      donationNumber: createDonationNumber, 
      portrait: createPortrait,
      securityQuestion: securityQuestion,
      securityAnswer: securityAnswer.toLowerCase().trim() 
    };
    localStorage.setItem("LastPlannerJulz_Memorials", JSON.stringify(memorials));
    
    triggerToastAndRedirect("Secure memorial space generated successfully!", `/memorial/${cleanId}`);
  };

  const handleAccessMemorial = (e) => {
    e.preventDefault();
    const cleanAccessId = accessId.toLowerCase().split(' ').join('-');
    const memorials = JSON.parse(localStorage.getItem("LastPlannerJulz_Memorials") || "{}");
    
    if (memorials[cleanAccessId] && memorials[cleanAccessId].pin === accessPin) {
      triggerToastAndRedirect("Access granted. Unlocking dashboard...", `/memorial/${cleanAccessId}`);
    } else {
      setError("Invalid Memorial ID or General Access PIN.");
    }
  };

  // --- RECOVERY LOGIC ---
  const handleInitiateRecovery = () => {
    setError("");
    const cleanId = recoveryId.toLowerCase().split(' ').join('-');
    const memorials = JSON.parse(localStorage.getItem("LastPlannerJulz_Memorials") || "{}");
    
    if (memorials[cleanId]) {
      setRecoveredData(memorials[cleanId]);
      setRecoveryStep(2);
    } else {
      setError("Memorial ID not found in the system.");
    }
  };

  const handleVerifyRecovery = () => {
    setError("");
    if (recoveryAnswerInput.toLowerCase().trim() === recoveredData.securityAnswer) {
      setRecoveryStep(3); // Show PINs
    } else {
      setError("Incorrect security answer. Please try again.");
    }
  };

  const closeRecoveryModal = () => {
    setShowForgotPin(false);
    setRecoveryStep(1);
    setRecoveryId("");
    setRecoveryAnswerInput("");
    setRecoveredData(null);
    setError("");
  };

  if (!dynamicId) {
    return (
      <div className="min-h-[80vh] bg-[#F8F6F0] py-16 flex items-center justify-center relative overflow-hidden px-4">
        {toast.show && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#1F2E27] text-white px-6 py-4 shadow-2xl rounded-lg border border-[#A8895C] animate-fade-in-down">
            <CheckCircle size={20} className="text-[#A8895C]" />
            <span className="font-semibold text-sm tracking-wide">{toast.message}</span>
          </div>
        )}

        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-serif font-semibold text-[#1F2E27] mb-3">Private Memorials</h1>
            <p className="text-[#3D3530]">Secure, personalized spaces for families.</p>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-[#E8DFD1]">
            <div className="flex border-b border-[#E8DFD1] mb-8">
              <button className={`flex-1 py-4 text-xs font-bold tracking-widest uppercase transition-all duration-300 ${view === "access" ? "text-[#A8895C] border-b-2 border-[#A8895C] bg-[#F8F6F0]/50" : "text-[#8F847C] hover:text-[#1F2E27] hover:bg-gray-50"}`} onClick={() => { setView("access"); setError(""); setHelpText("Enter the memorial ID and PIN shared with your family."); }}>Access Space</button>
              <button className={`flex-1 py-4 text-xs font-bold tracking-widest uppercase transition-all duration-300 ${view === "create" ? "text-[#A8895C] border-b-2 border-[#A8895C] bg-[#F8F6F0]/50" : "text-[#8F847C] hover:text-[#1F2E27] hover:bg-gray-50"}`} onClick={() => { setView("create"); setError(""); setHelpText("Create a secure memorial space and set up your access controls."); }}>Create Space</button>
            </div>

            {error !== "" && !showForgotPin && <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{error}</div>}
            {!showForgotPin && <div className="mb-6 rounded-lg border border-[#E8DFD1] bg-[#F8F6F0] px-4 py-3 text-sm text-[#3D3530]">{helpText}</div>}

            {view === "access" && (
              <form onSubmit={handleAccessMemorial} className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1F2E27] mb-2"><Lock size={14} className="text-[#A8895C]"/> Memorial ID</label>
                  <input type="text" value={accessId} onChange={e => setAccessId(e.target.value)} placeholder="e.g., doe-family" className="w-full p-4 border border-[#E8DFD1] rounded-lg bg-[#F8F6F0] focus:border-[#A8895C] focus:ring-2 focus:ring-[#A8895C]/20 outline-none transition-all" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1F2E27]">General Access PIN</label>
                    <button type="button" onClick={() => {setShowForgotPin(true); setError("");}} className="text-[10px] uppercase font-bold tracking-widest text-[#A8895C] hover:text-[#1F2E27] transition-colors">Forgot PIN?</button>
                  </div>
                  <input type="password" value={accessPin} onChange={e => setAccessPin(e.target.value)} placeholder="••••" className="w-full p-4 border border-[#E8DFD1] rounded-lg bg-[#F8F6F0] focus:border-[#A8895C] focus:ring-2 focus:ring-[#A8895C]/20 outline-none transition-all tracking-[0.5em] text-center text-xl" />
                </div>
                <button type="submit" className="w-full py-4 bg-[#1F2E27] text-white font-semibold uppercase tracking-widest text-sm rounded-lg hover:bg-[#A8895C] transition-colors mt-4 shadow-md hover:-translate-y-0.5">Unlock Memorial</button>
              </form>
            )}

            {view === "create" && (
              <form onSubmit={handleCreateMemorial} className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1F2E27] mb-2"><UserPlus size={14} className="text-[#A8895C]"/> Name of Loved One *</label>
                  <input type="text" value={createName} onChange={e => setCreateName(e.target.value)} placeholder="e.g., John Doe" className="w-full p-4 border border-[#E8DFD1] rounded-lg bg-[#F8F6F0] focus:border-[#A8895C] focus:ring-2 focus:ring-[#A8895C]/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1F2E27] mb-2">Memorial Access ID (URL Slug) *</label>
                  <input type="text" value={createId} onChange={e => setCreateId(e.target.value)} placeholder="e.g., doe-family" className="w-full p-4 border border-[#E8DFD1] rounded-lg bg-[#F8F6F0] focus:border-[#A8895C] focus:ring-2 focus:ring-[#A8895C]/20 outline-none transition-all" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1F2E27] mb-2">General Guest PIN *</label>
                    <input type="password" value={createPin} onChange={e => setCreatePin(e.target.value)} placeholder="e.g. 1234" className="w-full p-4 border border-[#E8DFD1] rounded-lg bg-[#F8F6F0] focus:border-[#A8895C] focus:ring-2 focus:ring-[#A8895C]/20 outline-none transition-all text-center tracking-widest" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1F2E27] mb-2">Nuclear Family PIN *</label>
                    <input type="password" value={createFamilyTreePin} onChange={e => setCreateFamilyTreePin(e.target.value)} placeholder="e.g. 9999" className="w-full p-4 border border-[#E8DFD1] rounded-lg bg-[#F8F6F0] focus:border-[#A8895C] focus:ring-2 focus:ring-[#A8895C]/20 outline-none transition-all text-center tracking-widest" />
                  </div>
                </div>

                {/* SECURITY QUESTIONS SETUP */}
                <div className="bg-[#F8F6F0] p-4 rounded-lg border border-[#E8DFD1] space-y-4">
                  <div className="flex items-center gap-2 mb-2 border-b border-[#E8DFD1] pb-2">
                    <ShieldAlert size={14} className="text-[#A8895C]"/>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1F2E27]">Security Recovery Setup</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#716860] mb-2">Select a Question</label>
                    <select value={securityQuestion} onChange={(e) => setSecurityQuestion(e.target.value)} className="w-full p-3 border border-[#E8DFD1] rounded bg-white text-sm outline-none focus:border-[#A8895C]">
                      {securityQuestionsList.map((q, idx) => (
                        <option key={idx} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#716860] mb-2">Your Answer *</label>
                    <input type="text" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} placeholder="e.g., Fluffy" className="w-full p-3 border border-[#E8DFD1] rounded bg-white text-sm outline-none focus:border-[#A8895C]" />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1F2E27] mb-2"><Smartphone size={14} className="text-[#A8895C]"/> Family Treasurer Mobile No. *</label>
                  <input type="tel" value={createDonationNumber} onChange={e => setCreateDonationNumber(e.target.value)} placeholder="07XX XXX XXX (For Remittances)" className="w-full p-4 border border-[#E8DFD1] rounded-lg bg-[#F8F6F0] focus:border-[#A8895C] focus:ring-2 focus:ring-[#A8895C]/20 outline-none transition-all" />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1F2E27] mb-2"><Upload size={14} className="text-[#A8895C]"/> Primary Portrait (Optional)</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full p-2 border border-[#E8DFD1] rounded-lg bg-[#F8F6F0] text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded file:border-0 file:text-xs file:uppercase file:tracking-wider file:font-bold file:bg-[#1F2E27] file:text-white hover:file:bg-[#A8895C] transition-colors cursor-pointer" />
                </div>
                
                <div className="pt-4 border-t border-[#E8DFD1]">
                  <button type="submit" className="w-full py-4 bg-[#A8895C] text-white font-semibold uppercase tracking-widest text-sm rounded-lg hover:bg-[#1F2E27] transition-colors shadow-md hover:-translate-y-0.5">Generate Secure Space</button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* FORGOT PIN RECOVERY MODAL */}
        {showForgotPin && (
          <Modal isOpen={showForgotPin} onClose={closeRecoveryModal} title="Security Recovery">
            <div className="p-4 space-y-6 text-center">
              <ShieldAlert size={48} className="mx-auto text-[#A8895C] mb-4" />
              
              {error !== "" && <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-100 font-semibold">{error}</div>}

              {recoveryStep === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-[#3D3530]">Enter your Memorial Access ID to locate your security question.</p>
                  <input 
                    type="text" 
                    value={recoveryId} 
                    onChange={(e) => setRecoveryId(e.target.value)} 
                    placeholder="e.g., doe-family" 
                    className="w-full p-4 border border-[#E8DFD1] rounded bg-[#F8F6F0] outline-none focus:border-[#A8895C] text-center" 
                  />
                  <button onClick={handleInitiateRecovery} className="w-full bg-[#1F2E27] text-white py-3 rounded font-bold uppercase tracking-widest text-xs hover:bg-[#A8895C] transition-colors">Find Account</button>
                </div>
              )}

              {recoveryStep === 2 && recoveredData && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-[#F8F6F0] p-4 rounded border border-[#E8DFD1]">
                    <span className="text-[10px] uppercase font-bold text-[#A8895C] block mb-1">Security Question</span>
                    <p className="font-serif text-[#1F2E27] text-lg">{recoveredData.securityQuestion}</p>
                  </div>
                  <input 
                    type="text" 
                    value={recoveryAnswerInput} 
                    onChange={(e) => setRecoveryAnswerInput(e.target.value)} 
                    placeholder="Type your answer..." 
                    className="w-full p-4 border border-[#E8DFD1] rounded bg-[#F8F6F0] outline-none focus:border-[#A8895C] text-center" 
                  />
                  <button onClick={handleVerifyRecovery} className="w-full bg-[#A8895C] text-white py-3 rounded font-bold uppercase tracking-widest text-xs hover:bg-[#1F2E27] transition-colors">Verify Answer</button>
                </div>
              )}

              {recoveryStep === 3 && recoveredData && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-emerald-600" />
                  </div>
                  <p className="text-sm text-[#3D3530] font-semibold">Identity Verified. Please save your PINs securely.</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#F8F6F0] p-4 rounded border border-[#E8DFD1]">
                      <span className="text-[10px] uppercase font-bold text-[#716860] block mb-2">General PIN</span>
                      <p className="font-mono text-2xl tracking-[0.3em] text-[#1F2E27] font-bold">{recoveredData.pin}</p>
                    </div>
                    <div className="bg-[#1F2E27] p-4 rounded border border-[#1F2E27]">
                      <span className="text-[10px] uppercase font-bold text-[#A8895C] block mb-2">Nuclear PIN</span>
                      <p className="font-mono text-2xl tracking-[0.3em] text-white font-bold">{recoveredData.familyTreePin}</p>
                    </div>
                  </div>
                  <button onClick={closeRecoveryModal} className="w-full border border-[#E8DFD1] text-[#1F2E27] py-3 rounded font-bold uppercase tracking-widest text-xs hover:bg-[#F8F6F0] transition-colors">Close & Login</button>
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#F8F6F0] py-16">
      <div className="site-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="mb-16 text-center">
          <p className="text-xs font-bold tracking-[0.28em] uppercase text-[#A8895C] mb-4">Private Memorial Hub</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-[#1F2E27] mb-6 leading-tight">A quiet place for <br className="hidden md:block"/> collective remembrance</h1>
          
          <p className="text-lg text-[#3D3530] max-w-2xl mx-auto leading-relaxed">
            {dynamicId === "demo" ? (
              <span>You are exploring the interactive sample memorial space for <strong className="text-[#1F2E27]">Jane Doe</strong>. Feel free to navigate the modules below to see how our platform works.</span>
            ) : (
              <span>You are securely managing the memorial space for <strong className="text-[#1F2E27]">{dynamicId}</strong>. Each space below is designed to support thoughtful tribute, shared memory, and calm family connection.</span>
            )}
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sections.map(({ icon: Icon, title, description, target }) => {
            const isActive = activeSection === title;
            return (
              <Card
                key={title}
                className={`transition-all duration-300 flex flex-col h-full rounded-xl overflow-hidden ${isActive ? "border-2 border-[#A8895C] shadow-xl transform -translate-y-1" : "border border-[#E8DFD1] hover:border-[#A8895C] hover:shadow-lg hover:-translate-y-1 bg-white"}`}
              >
                <CardBody className="flex flex-col h-full p-8">
                  <div className="flex flex-col mb-6">
                    <span className={`flex h-14 w-14 items-center justify-center rounded-full mb-6 transition-colors ${isActive ? "bg-[#A8895C] text-white" : "bg-[#F8F6F0] text-[#A8895C] border border-[#E8DFD1]"}`}>
                      <Icon size={24} />
                    </span>
                    <div>
                      <h2 className="text-xl font-serif font-semibold text-[#1F2E27] mb-2">{title}</h2>
                      <p className="text-sm text-[#3D3530] leading-relaxed opacity-90">{description}</p>
                    </div>
                  </div>
                  <div className="mt-auto pt-6 border-t border-[#F8F6F0]">
                    <Link
                      to={`/${target}/${dynamicId}`}
                      className={`inline-block w-full text-center rounded-sm px-4 py-3 uppercase tracking-wider text-xs font-semibold transition-colors ${isActive ? "bg-[#1F2E27] text-white hover:bg-[#3D3530]" : "border border-[#E8DFD1] text-[#3D3530] hover:bg-[#F8F6F0] hover:text-[#A8895C] hover:border-[#A8895C]"}`}
                      onClick={() => setActiveSection(title)}
                    >
                      Visit {title}
                    </Link>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        <section className="mt-20 rounded-[1.5rem] border border-[#E8DFD1] bg-white p-8 shadow-sm ring-1 ring-[#F2EBDD] md:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#A8895C]"></div>
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-between pl-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-[#1F2E27] mb-4">Keep every memory close.</h2>
              <p className="text-[#3D3530] text-lg leading-relaxed max-w-2xl opacity-90">The Memorial Hub brings all the spaces families need together in one thoughtful, dignified experience.</p>
            </div>
            <Link 
              to={`/overview/${dynamicId}`}
              className="inline-flex items-center gap-3 bg-[#A8895C] text-white px-8 py-4 uppercase tracking-widest text-sm font-semibold rounded hover:bg-[#1F2E27] transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 group shrink-0"
            >
              Start with Overview 
              <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}