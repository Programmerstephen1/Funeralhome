import React, { useState, useEffect } from "react";
import { FileText, ArrowLeft, PenTool, Lock, AlertCircle, Calendar, X } from "lucide-react";
import { Link } from "react-router-dom"; 
import { Button, Card, CardBody, Modal } from "../components";

export default function LiveJournalPage({ dynamicId }) {
  const [memorialData, setMemorialData] = useState({ name: "our beloved" });
  
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem(`LastPlannerJulz_Journal_${dynamicId}`);
      if (saved) return JSON.parse(saved);
      
      // Load premium demo data if viewing the demo space
      if (dynamicId === "demo") {
        return [
          { id: 2, author: "The Doe Family", title: "Funeral Service Arrangements", excerpt: "The main service will be held at St. Jude's Cathedral this Friday at 10:00 AM...", full: "The main service will be held at St. Jude's Cathedral this Friday at 10:00 AM. A small reception will follow at the family home. All are welcome to join us in celebrating her life. Please dress in bright colors as she requested.", date: new Date().toLocaleDateString() },
          { id: 1, author: "John Doe", title: "Thank You For Your Support", excerpt: "We are deeply moved by the outpouring of love, floral tributes, and messages...", full: "We are deeply moved by the outpouring of love, floral tributes, and messages we have received over the last few days. It brings us great comfort knowing how many lives she touched.", date: new Date(Date.now() - 86400000).toLocaleDateString() }
        ];
      }
      return [];
    } catch { return []; }
  });

  // --- ENTERPRISE SECURITY STATE ---
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return localStorage.getItem(`LastPlannerJulz_NuclearFamily_${dynamicId}`) === "true";
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [accessPin, setAccessPin] = useState("");
  const [authError, setAuthError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [newEntry, setNewEntry] = useState({ author: "", title: "", full: "" });

  useEffect(() => {
    if (dynamicId) {
      const allMemorials = JSON.parse(localStorage.getItem("LastPlannerJulz_Memorials") || "{}");
      if (allMemorials[dynamicId]) setMemorialData(allMemorials[dynamicId]);
    }
  }, [dynamicId]);

  useEffect(() => {
    if (dynamicId) {
      localStorage.setItem(`LastPlannerJulz_Journal_${dynamicId}`, JSON.stringify(entries));
    }
  }, [entries, dynamicId]);

  // --- PIN VERIFICATION LOGIC ---
  const handleUnlock = (e) => {
    e.preventDefault();
    const allMemorials = JSON.parse(localStorage.getItem("LastPlannerJulz_Memorials") || "{}");
    const currentMemorial = allMemorials[dynamicId];

    if (currentMemorial && accessPin === currentMemorial.familyTreePin) {
      setIsAuthorized(true);
      setAuthError("");
      setShowAuthModal(false);
      localStorage.setItem(`LastPlannerJulz_NuclearFamily_${dynamicId}`, "true");
      setShowForm(true); // Auto-open the write form upon successful login
    } else {
      setAuthError("Incorrect Nuclear Family PIN. Please try again.");
    }
  };

  const handleAddEntry = () => {
    if (newEntry.author.trim() && newEntry.title.trim() && newEntry.full.trim()) {
      setEntries((prev) => [
        {
          id: Date.now(),
          author: newEntry.author,
          date: new Date().toLocaleDateString(),
          title: newEntry.title,
          excerpt: newEntry.full.length > 150 ? newEntry.full.substring(0, 150) + "..." : newEntry.full,
          full: newEntry.full,
        },
        ...prev,
      ]);
      setNewEntry({ author: "", title: "", full: "" });
      setShowForm(false);
    }
  };

  return (
    <div className="bg-[#F8F6F0] py-12 min-h-screen">
      <div className="site-container max-w-4xl mx-auto px-4">
        
        <Link 
          to={`/memorial/${dynamicId || ''}`}
          className="inline-flex items-center gap-2 text-sm text-[#A8895C] hover:text-[#1F2E27] uppercase tracking-wider font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Return to Dashboard
        </Link>

        <section className="mb-16 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border border-[#E8DFD1]">
            <FileText size={32} className="text-[#A8895C]" />
          </div>
          <p className="text-sm tracking-[0.28em] uppercase text-[#A8895C] mb-3">Timeline & Announcements</p>
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-[#1F2E27] mb-4">The Memorial Journal</h1>
          <p className="text-lg text-[#3D3530] max-w-2xl mx-auto mb-8">
            Official updates, arrangements, and ongoing reflections regarding {memorialData.name}.
          </p>
          
          {/* THE FIX: Dynamic button based on security clearance */}
          <button 
            onClick={() => isAuthorized ? setShowForm(true) : setShowAuthModal(true)}
            className="bg-[#1F2E27] text-white px-8 py-4 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2 mx-auto hover:bg-[#A8895C] transition-all shadow-xl hover:-translate-y-1"
          >
            {isAuthorized ? <PenTool size={18} /> : <Lock size={18} />}
            {isAuthorized ? "Write an Entry" : "Family Login to Post"}
          </button>
        </section>

        {entries.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E8DFD1] border-dashed shadow-sm">
            <FileText size={48} className="mx-auto mb-4 text-[#E8DFD1]" />
            <h3 className="text-xl font-serif text-[#1F2E27] mb-2">The Journal is empty</h3>
            <p className="text-[#3D3530]">The family has not posted any announcements yet.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-[#D8CFBC] ml-4 md:ml-8 space-y-12 pb-12">
            {entries.map((entry) => (
              <div key={entry.id} className="relative pl-8 md:pl-12">
                <div className="absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-[#A8895C] border-4 border-[#F8F6F0]"></div>
                <Card className="hover:shadow-lg transition-shadow group border-[#E8DFD1]">
                  <CardBody className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-serif font-semibold text-[#1F2E27] mb-2">{entry.title}</h3>
                        
                        <div className="flex items-center gap-4 text-[10px] font-bold text-[#A8895C] uppercase tracking-widest mb-4">
                          <span>By {entry.author}</span>
                          <span className="w-1 h-1 rounded-full bg-[#D8CFBC]"></span>
                          <span className="flex items-center gap-1"><Calendar size={12}/> {entry.date}</span>
                        </div>

                        <p className="text-[#3D3530] leading-loose mb-6 font-serif text-lg italic text-black/80">
                          "{entry.excerpt}"
                        </p>
                        <button onClick={() => setSelectedEntry(entry)} className="text-[#A8895C] border-b border-[#A8895C] pb-0.5 hover:text-[#1F2E27] hover:border-[#1F2E27] text-sm font-semibold transition-colors uppercase tracking-widest">
                          Read Full Entry
                        </button>
                      </div>
                      <div className="flex-shrink-0 opacity-20 group-hover:opacity-100 transition-opacity hidden sm:block">
                        <FileText size={48} className="text-[#A8895C]" />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* --- PIN UNLOCK MODAL --- */}
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-[#E8DFD1] animate-fadeIn relative">
              <button onClick={() => {setShowAuthModal(false); setAuthError("");}} className="absolute top-4 right-4 text-[#8F847C] hover:text-[#1F2E27] transition-colors"><X size={20} /></button>
              <div className="p-8 text-center pt-10">
                <div className="w-16 h-16 bg-[#1F2E27] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Lock size={28} className="text-[#A8895C]" />
                </div>
                <h2 className="text-2xl font-serif text-[#1F2E27] mb-2">Family Access</h2>
                <p className="text-[#716860] mb-6 text-xs leading-relaxed">
                  Only the Nuclear Family can post official announcements. Please enter the PIN.
                </p>
                
                <form onSubmit={handleUnlock} className="space-y-4">
                  <div>
                    <input 
                      type="password" 
                      placeholder="Enter PIN" 
                      value={accessPin}
                      onChange={(e) => setAccessPin(e.target.value)}
                      className="w-full text-center tracking-[0.5em] text-xl font-bold py-3 rounded border border-[#E8DFD1] bg-[#F8F6F0] outline-none focus:border-[#A8895C]"
                    />
                    {authError !== "" && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-100 text-red-700 rounded text-[10px] flex items-center justify-center gap-1 font-semibold">
                        <AlertCircle size={12} /> {authError}
                      </div>
                    )}
                  </div>
                  <button type="submit" className="w-full bg-[#1F2E27] text-white py-4 rounded font-bold uppercase tracking-widest text-xs hover:bg-[#A8895C] transition-colors shadow-md">
                    Verify & Unlock
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* --- WRITE ENTRY MODAL (Your existing layout, styled to match) --- */}
        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Write a Journal Entry">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1F2E27] uppercase tracking-wider mb-2">Author Name</label>
              <input type="text" value={newEntry.author} onChange={(e) => setNewEntry({ ...newEntry, author: e.target.value })} placeholder="e.g. The Doe Family" className="w-full px-4 py-3 border border-[#E8DFD1] rounded bg-[#F8F6F0] focus:outline-none focus:border-[#A8895C] focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1F2E27] uppercase tracking-wider mb-2">Subject / Title</label>
              <input type="text" value={newEntry.title} onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })} placeholder="e.g. Service Time Update" className="w-full px-4 py-3 border border-[#E8DFD1] rounded bg-[#F8F6F0] focus:outline-none focus:border-[#A8895C] focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1F2E27] uppercase tracking-wider mb-2">Announcement Details</label>
              <textarea value={newEntry.full} onChange={(e) => setNewEntry({ ...newEntry, full: e.target.value })} placeholder="Share arrangements, memories, or reflections..." rows={6} className="w-full px-4 py-3 border border-[#E8DFD1] rounded bg-[#F8F6F0] focus:outline-none focus:border-[#A8895C] focus:bg-white transition-colors font-serif resize-none" />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="primary" onClick={handleAddEntry} className="flex-1 bg-[#1F2E27] hover:bg-[#A8895C] text-white py-4 uppercase tracking-widest text-xs font-bold">Publish Entry</Button>
            </div>
          </div>
        </Modal>

        {/* --- READ ENTRY MODAL (Your existing layout) --- */}
        {selectedEntry && (
          <Modal isOpen={!!selectedEntry} onClose={() => setSelectedEntry(null)} title={selectedEntry.title}>
            <div className="p-2">
              <p className="text-xs uppercase tracking-widest text-[#A8895C] font-bold mb-6 border-b border-[#E8DFD1] pb-4">
                By {selectedEntry.author} <span className="mx-2 text-[#D8CFBC]">|</span> {selectedEntry.date}
              </p>
              <p className="text-[#3D3530] leading-loose whitespace-pre-wrap font-serif text-lg">
                {selectedEntry.full}
              </p>
              <div className="mt-8 pt-6 border-t border-[#E8DFD1]">
                <Button variant="secondary" onClick={() => setSelectedEntry(null)} className="w-full py-4 uppercase tracking-widest text-xs font-bold">Close Entry</Button>
              </div>
            </div>
          </Modal>
        )}

      </div>
    </div>
  );
}