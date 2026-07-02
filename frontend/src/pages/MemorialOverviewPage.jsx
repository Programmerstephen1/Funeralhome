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
  const [createPortrait, setCreatePortrait] = useState(""); // NEW: Portrait state
  
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "#login";
  }, []);

  const triggerToastAndRedirect = (message, hashUrl) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: "" });
      window.location.hash = hashUrl;
    }, 1500); 
  };

  // Convert uploaded image to Base64 for local storage
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
    const memorials = JSON.parse(localStorage.getItem("hollowPineMemorials") || "{}");
    
    if (memorials[cleanId]) {
      return setError("This Memorial ID is already taken. Please choose another.");
    }

    // Save all data including the portrait
    memorials[cleanId] = { 
      name: createName, 
      pin: createPin,
      portrait: createPortrait 
    };
    localStorage.setItem("hollowPineMemorials", JSON.stringify(memorials));
    
    triggerToastAndRedirect("Secure memorial space generated successfully!", `#memorial/${cleanId}`);
  };

  const handleAccessMemorial = (e) => {
    e.preventDefault();
    const cleanAccessId = accessId.toLowerCase().replace(/\s+/g, '-');
    const memorials = JSON.parse(localStorage.getItem("hollowPineMemorials") || "{}");
    
    if (memorials[cleanAccessId] && memorials[cleanAccessId].pin === accessPin) {
      triggerToastAndRedirect("Access granted. Unlocking dashboard...", `#memorial/${cleanAccessId}`);
    } else {
      setError("Invalid Memorial ID or PIN.");
    }
  };

  if (!dynamicId) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] py-16 flex items-center justify-center relative overflow-hidden">
        {toast.show && (
          <div className="absolute top-10 transform left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#1F2E27] text-white px-6 py-4 shadow-2xl rounded border border-[#A8895C] animate-pulse">
            <CheckCircle size={20} className="text-[#A8895C]" />
            <span className="font-semibold text-sm tracking-wide">{toast.message}</span>
          </div>
        )}

        <div className="w-full max-w-md px-4">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-serif font-semibold text-[#1F2E27] mb-3">Private Memorials</h1>
            <p className="text-[#3D3530]">Secure, personalized spaces for families.</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-[#E8DFD1]">
            <div className="flex border-b border-[#E8DFD1] mb-6">
              <button 
                className={`flex-1 py-3 text-sm font-semibold tracking-wider uppercase transition-colors ${view === "access" ? "text-[#A8895C] border-b-2 border-[#A8895C]" : "text-[#3D3530] hover:text-[#1F2E27]"}`}
                onClick={() => { setView("access"); setError(""); }}
              >
                Access Space
              </button>
              <button 
                className={`flex-1 py-3 text-sm font-semibold tracking-wider uppercase transition-colors ${view === "create" ? "text-[#A8895C] border-b-2 border-[#A8895C]" : "text-[#3D3530] hover:text-[#1F2E27]"}`}
                onClick={() => { setView("create"); setError(""); }}
              >
                Create Space
              </button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">{error}</div>}

            {view === "access" && (
              <form onSubmit={handleAccessMemorial} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#1F2E27] mb-1 flex items-center gap-2"><Lock size={14}/> Memorial ID</label>
                  <input type="text" value={accessId} onChange={e => setAccessId(e.target.value)} placeholder="e.g., doe-family" className="w-full p-3 border border-[#E8DFD1] rounded bg-[#F8F6F0] focus:border-[#A8895C] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1F2E27] mb-1">Family Access PIN</label>
                  <input type="password" value={accessPin} onChange={e => setAccessPin(e.target.value)} placeholder="••••" className="w-full p-3 border border-[#E8DFD1] rounded bg-[#F8F6F0] focus:border-[#A8895C] outline-none" />
                </div>
                <button type="submit" className="w-full py-3.5 bg-[#1F2E27] text-white font-semibold uppercase tracking-widest text-sm rounded hover:bg-[#A8895C] transition-colors mt-2">
                  Unlock Memorial
                </button>
              </form>
            )}

            {view === "create" && (
              <form onSubmit={handleCreateMemorial} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#1F2E27] mb-1 flex items-center gap-2"><UserPlus size={14}/> Name of Loved One *</label>
                  <input type="text" value={createName} onChange={e => setCreateName(e.target.value)} placeholder="e.g., John Doe" className="w-full p-3 border border-[#E8DFD1] rounded bg-[#F8F6F0] focus:border-[#A8895C] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1F2E27] mb-1">Memorial Access ID *</label>
                  <input type="text" value={createId} onChange={e => setCreateId(e.target.value)} placeholder="e.g., doe-family" className="w-full p-3 border border-[#E8DFD1] rounded bg-[#F8F6F0] focus:border-[#A8895C] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1F2E27] mb-1">Create a Secure PIN *</label>
                  <input type="password" value={createPin} onChange={e => setCreatePin(e.target.value)} placeholder="4-digit PIN" className="w-full p-3 border border-[#E8DFD1] rounded bg-[#F8F6F0] focus:border-[#A8895C] outline-none" />
                </div>
                
                {/* NEW FIELD: Portrait Uploader */}
                <div>
                  <label className="block text-sm font-medium text-[#1F2E27] mb-1 flex items-center gap-2"><Upload size={14}/> Primary Portrait (Optional)</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full p-2 border border-[#E8DFD1] rounded bg-[#F8F6F0] text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#1F2E27] file:text-white hover:file:bg-[#A8895C] transition-colors cursor-pointer" />
                </div>

                <button type="submit" className="w-full py-3.5 bg-[#A8895C] text-white font-semibold uppercase tracking-widest text-sm rounded hover:bg-[#1F2E27] transition-colors mt-4">
                  Generate Secure Space
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F6F0] py-12">
      <div className="site-container">
        <section className="mb-12 text-center">
          <p className="text-sm tracking-[0.28em] uppercase text-[#A8895C] mb-3">Private Memorial Hub</p>
          <h1 className="text-5xl md:text-6xl font-serif font-semibold text-[#1F2E27] mb-4">A quiet place for collective remembrance</h1>
          <p className="text-lg text-[#3D3530] max-w-3xl mx-auto">
            You are securely managing the memorial space for <strong>{dynamicId}</strong>. Each space below is personalized to support thoughtful tribute and shared memory.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sections.map(({ icon: Icon, title, description, target }) => {
            const isActive = activeSection === title;
            return (
              <Card
                key={title}
                className={`transition-all duration-200 flex flex-col h-full ${isActive ? "border-2 border-[#A8895C] shadow-lg" : "border border-[#E8DFD1] hover:border-[#A8895C] hover:shadow-lg"}`}
                onClick={() => {
                  setActiveSection(title);
                  window.location.hash = `#${target}/${dynamicId}`;
                }}
              >
                <CardBody className="cursor-pointer flex flex-col h-full p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#A8895C]/10 text-[#A8895C] mt-1"><Icon size={20} /></span>
                    <div>
                      <h2 className="text-lg font-semibold text-[#1F2E27]">{title}</h2>
                      <p className="text-sm text-[#3D3530]">{description}</p>
                    </div>
                  </div>
                  <div className="mt-auto pt-4">
                    <Button
                      variant={isActive ? "primary" : "secondary"}
                      size="sm"
                      className="w-full"
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

        <section className="mt-16 rounded-3xl bg-white border border-[#E8DFD1] p-10">
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
            <div>
              <h2 className="text-3xl font-serif font-semibold text-[#1F2E27] mb-4">Keep every memory close.</h2>
              <p className="text-[#3D3530] leading-7 max-w-2xl">The Memorial Hub brings all the spaces families need together in one thoughtful experience.</p>
            </div>
            <a 
              href={`#overview/${dynamicId}`}
              className="inline-flex items-center gap-2 bg-[#A8895C] text-white px-8 py-4 uppercase tracking-widest text-sm font-semibold hover:bg-[#1F2E27] transition-all duration-300 shadow-md hover:shadow-lg group shrink-0"
            >
              Start with Overview 
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}