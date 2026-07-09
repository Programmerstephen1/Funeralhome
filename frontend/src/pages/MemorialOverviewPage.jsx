import React, { useState, useEffect } from "react"; 
import { Bookmark, BookOpen, Image as ImageIcon, PenTool, Flower, Flame, Users, TreeDeciduous, FileText, ArrowRight, Lock, UserPlus, FileSignature, CheckCircle, Upload } from "lucide-react";
import { Card, CardBody, Button } from "../components";

const sections = [
  { icon: Bookmark, title: "Overview", description: "A calm introduction to the memorial site and its purpose.", target: "overview" },
  { icon: BookOpen, title: "Memorial Wall", description: "A dedicated space for highlighted remembrances and honored names.", target: "memorialWall" },
  { icon: PenTool, title: "Memorial Pages", description: "Individual pages for sharing stories, photos, and memories.", target: "memorialPages" },
  { icon: ImageIcon, title: "Gallery", description: "A refined gallery of photographs, momentos, and visual tributes.", target: "gallery" },
  { icon: Flower, title: "Visitor Flowers", description: "A thoughtful way for family and friends to leave floral tributes.", target: "visitorFlowers" },
  { icon: Flame, title: "Visitor Candles", description: "Light a candle to honor a life and send a quiet message of support.", target: "visitorCandles" },
  { icon: Users, title: "Family & Friends", description: "A curated roster of loved ones connected to the memorial.", target: "familyAndFriends" },
  { icon: TreeDeciduous, title: "Family Tree", description: "A gentle family tree view for tracing relationships and heritage.", target: "familyTree" },
  { icon: FileText, title: "Live Journal", description: "A journal space for updates, reflections, and ongoing remembrance.", target: "liveJournal" },
  { icon: FileSignature, title: "Write Eulogy", description: "Draft a digital tribute and generate a secure QR code for attendees.", target: "eulogy" },
];

export default function MemorialOverviewPage({ dynamicId }) {
  const [activeSection, setActiveSection] = useState(sections[0].title);
  const [view, setView] = useState("access"); 
  
  const [accessId, setAccessId] = useState("");
  const [accessPin, setAccessPin] = useState("");
  
  const [createName, setCreateName] = useState("");
  const [createId, setCreateId] = useState(""); 
  const [createPin, setCreatePin] = useState("");
  const [createPortrait, setCreatePortrait] = useState("");
  
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "" });
  const [helpText, setHelpText] = useState("Choose an option to open a private memorial space.");

  useEffect(() => {
    // Falls back to userEmail if token isn't used in your auth flow yet
    const token = localStorage.getItem("token") || localStorage.getItem("userEmail");
    if (!token) window.location.hash = "#login";
  }, []);

  const triggerToastAndRedirect = (message, hashUrl) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: "" });
      window.location.hash = hashUrl;
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
    if (!createName || !createId || !createPin) return setError("Please fill out all required fields.");
    
    const cleanId = createId.toLowerCase().replace(/\s+/g, '-');
    const memorials = JSON.parse(localStorage.getItem("LastPlannerJulz_Memorials") || "{}");
    
    if (memorials[cleanId]) {
      return setError("This Memorial ID is already taken. Please choose another.");
    }

    memorials[cleanId] = { 
      name: createName, 
      pin: createPin,
      portrait: createPortrait 
    };
    localStorage.setItem("LastPlannerJulz_Memorials", JSON.stringify(memorials));
    
    triggerToastAndRedirect("Secure memorial space generated successfully!", `#memorial/${cleanId}`);
  };

  const handleAccessMemorial = (e) => {
    e.preventDefault();
    const cleanAccessId = accessId.toLowerCase().replace(/\s+/g, '-');
    const memorials = JSON.parse(localStorage.getItem("LastPlannerJulz_Memorials") || "{}");
    
    if (memorials[cleanAccessId] && memorials[cleanAccessId].pin === accessPin) {
      triggerToastAndRedirect("Access granted. Unlocking dashboard...", `#memorial/${cleanAccessId}`);
    } else {
      setError("Invalid Memorial ID or PIN.");
    }
  };

  // If no dynamic ID is present, show the Access/Create portal
  if (!dynamicId) {
    return (
      <div className="min-h-[80vh] bg-[#F8F6F0] py-16 flex items-center justify-center relative overflow-hidden px-4">
        {toast.show && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#1F2E27] text-white px-6 py-4 shadow-2xl rounded-lg border border-[#A8895C] animate-fade-in-down">
            <CheckCircle size={20} className="text-[#A8895C]" />
            <span className="font-semibold text-sm tracking-wide">{toast.message}</span>
          </div>
        )}

        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-serif font-semibold text-[#1F2E27] mb-3">Private Memorials</h1>
            <p className="text-[#3D3530]">Secure, personalized spaces for families.</p>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-[#E8DFD1]">
            <div className="flex border-b border-[#E8DFD1] mb-8">
              <button 
                className={`flex-1 py-4 text-xs font-bold tracking-widest uppercase transition-all duration-300 ${view === "access" ? "text-[#A8895C] border-b-2 border-[#A8895C] bg-[#F8F6F0]/50" : "text-[#8F847C] hover:text-[#1F2E27] hover:bg-gray-50"}`}
                onClick={() => { setView("access"); setError(""); setHelpText("Enter the memorial ID and PIN shared with your family."); }}
              >
                Access Space
              </button>
              <button 
                className={`flex-1 py-4 text-xs font-bold tracking-widest uppercase transition-all duration-300 ${view === "create" ? "text-[#A8895C] border-b-2 border-[#A8895C] bg-[#F8F6F0]/50" : "text-[#8F847C] hover:text-[#1F2E27] hover:bg-gray-50"}`}
                onClick={() => { setView("create"); setError(""); setHelpText("Create a secure memorial space and choose a memorable access ID."); }}
              >
                Create Space
              </button>
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{error}</div>}
            <div className="mb-6 rounded-lg border border-[#E8DFD1] bg-[#F8F6F0] px-4 py-3 text-sm text-[#3D3530]">{helpText}</div>

            {view === "access" && (
              <form onSubmit={handleAccessMemorial} className="space-y-6">
                <div>
                  {/* FIXED: Removed conflicting 'block' class, kept 'flex' */}
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1F2E27] mb-2"><Lock size={14} className="text-[#A8895C]"/> Memorial ID</label>
                  <input type="text" value={accessId} onChange={e => setAccessId(e.target.value)} placeholder="e.g., doe-family" className="w-full p-4 border border-[#E8DFD1] rounded-lg bg-[#F8F6F0] focus:border-[#A8895C] focus:ring-2 focus:ring-[#A8895C]/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1F2E27] mb-2">Family Access PIN</label>
                  <input type="password" value={accessPin} onChange={e => setAccessPin(e.target.value)} placeholder="••••" className="w-full p-4 border border-[#E8DFD1] rounded-lg bg-[#F8F6F0] focus:border-[#A8895C] focus:ring-2 focus:ring-[#A8895C]/20 outline-none transition-all" />
                </div>
                <button type="submit" className="w-full py-4 bg-[#1F2E27] text-white font-semibold uppercase tracking-widest text-sm rounded-lg hover:bg-[#A8895C] transition-colors mt-4 shadow-md">
                  Unlock Memorial
                </button>
              </form>
            )}

            {view === "create" && (
              <form onSubmit={handleCreateMemorial} className="space-y-6">
                <div>
                  {/* FIXED: Removed conflicting 'block' class, kept 'flex' */}
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1F2E27] mb-2"><UserPlus size={14} className="text-[#A8895C]"/> Name of Loved One *</label>
                  <input type="text" value={createName} onChange={e => setCreateName(e.target.value)} placeholder="e.g., John Doe" className="w-full p-4 border border-[#E8DFD1] rounded-lg bg-[#F8F6F0] focus:border-[#A8895C] focus:ring-2 focus:ring-[#A8895C]/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1F2E27] mb-2">Memorial Access ID *</label>
                  <input type="text" value={createId} onChange={e => setCreateId(e.target.value)} placeholder="e.g., doe-family" className="w-full p-4 border border-[#E8DFD1] rounded-lg bg-[#F8F6F0] focus:border-[#A8895C] focus:ring-2 focus:ring-[#A8895C]/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1F2E27] mb-2">Create a Secure PIN *</label>
                  <input type="password" value={createPin} onChange={e => setCreatePin(e.target.value)} placeholder="4-digit PIN" className="w-full p-4 border border-[#E8DFD1] rounded-lg bg-[#F8F6F0] focus:border-[#A8895C] focus:ring-2 focus:ring-[#A8895C]/20 outline-none transition-all" />
                </div>
                
                <div>
                  {/* FIXED: Removed conflicting 'block' class, kept 'flex' */}
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1F2E27] mb-2"><Upload size={14} className="text-[#A8895C]"/> Primary Portrait (Optional)</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full p-2 border border-[#E8DFD1] rounded-lg bg-[#F8F6F0] text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded file:border-0 file:text-xs file:uppercase file:tracking-wider file:font-bold file:bg-[#1F2E27] file:text-white hover:file:bg-[#A8895C] transition-colors cursor-pointer" />
                </div>

                <button type="submit" className="w-full py-4 bg-[#A8895C] text-white font-semibold uppercase tracking-widest text-sm rounded-lg hover:bg-[#1F2E27] transition-colors mt-6 shadow-md">
                  Generate Secure Space
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If dynamic ID is present, show the Memorial Hub Dashboard
  return (
    <div className="bg-[#F8F6F0] py-16">
      <div className="site-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="mb-16 text-center">
          <p className="text-xs font-bold tracking-[0.28em] uppercase text-[#A8895C] mb-4">Private Memorial Hub</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-[#1F2E27] mb-6 leading-tight">A quiet place for <br className="hidden md:block"/> collective remembrance</h1>
          <p className="text-lg text-[#3D3530] max-w-2xl mx-auto leading-relaxed">
            You are securely managing the memorial space for <strong className="text-[#1F2E27]">{dynamicId}</strong>. Each space below is designed to support thoughtful tribute, shared memory, and calm family connection.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sections.map(({ icon: Icon, title, description, target }) => {
            const isActive = activeSection === title;
            return (
              <Card
                key={title}
                className={`transition-all duration-300 flex flex-col h-full rounded-xl overflow-hidden cursor-pointer ${isActive ? "border-2 border-[#A8895C] shadow-xl transform -translate-y-1" : "border border-[#E8DFD1] hover:border-[#A8895C] hover:shadow-lg hover:-translate-y-1 bg-white"}`}
                onClick={() => {
                  setActiveSection(title);
                  window.location.hash = `#${target}/${dynamicId}`;
                }}
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
                    <Button
                      variant={isActive ? "primary" : "secondary"}
                      size="sm"
                      className="w-full uppercase tracking-wider text-xs py-3"
                      onClick={(event) => {
                        event.stopPropagation();
                        window.location.hash = `#${target}/${dynamicId}`;
                      }}
                    >
                      Visit {title}
                    </Button>
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
            <a 
              href={`#overview/${dynamicId}`}
              className="inline-flex items-center gap-3 bg-[#A8895C] text-white px-8 py-4 uppercase tracking-widest text-sm font-semibold rounded hover:bg-[#1F2E27] transition-all duration-300 shadow-md hover:shadow-xl group shrink-0"
            >
              Start with Overview 
              <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}