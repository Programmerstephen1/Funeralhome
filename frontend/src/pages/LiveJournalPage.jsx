import React, { useState, useEffect } from "react";
import { FileText, ArrowLeft, PenTool } from "lucide-react";
import { Button, Card, CardBody, Modal } from "../components";

export default function LiveJournalPage({ dynamicId }) {
  const [memorialData, setMemorialData] = useState({ name: "our beloved" });
  
  // Persistent Journal Storage
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem(`hollowPineJournal_${dynamicId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [newEntry, setNewEntry] = useState({ author: "", title: "", full: "" });

  useEffect(() => {
    if (dynamicId) {
      const allMemorials = JSON.parse(localStorage.getItem("hollowPineMemorials") || "{}");
      if (allMemorials[dynamicId]) {
        setMemorialData(allMemorials[dynamicId]);
      }
    }
  }, [dynamicId]);

  useEffect(() => {
    if (dynamicId) {
      localStorage.setItem(`hollowPineJournal_${dynamicId}`, JSON.stringify(entries));
    }
  }, [entries, dynamicId]);

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
      <div className="site-container max-w-4xl mx-auto">
        
        <a 
          href={`#memorial/${dynamicId || ''}`}
          className="inline-flex items-center gap-2 text-sm text-[#A8895C] hover:text-[#1F2E27] uppercase tracking-wider font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Return to Dashboard
        </a>

        <section className="mb-16 text-center">
          <FileText size={48} className="mx-auto mb-4 text-[#A8895C]" />
          <p className="text-sm tracking-[0.28em] uppercase text-[#A8895C] mb-3">Timeline & Reflections</p>
          <h1 className="text-5xl md:text-6xl font-serif font-semibold text-[#1F2E27] mb-4">
            Live Journal
          </h1>
          <p className="text-lg text-[#3D3530] max-w-2xl mx-auto">
            A chronological space for updates, anniversaries, and ongoing reflections celebrating {memorialData.name}.
          </p>
          <Button variant="primary" size="lg" className="mt-8 shadow-md hover:-translate-y-1 transition-transform" onClick={() => setShowForm(true)}>
            <PenTool size={18} className="inline mr-2" /> Write an Entry
          </Button>
        </section>

        {entries.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E8DFD1] border-dashed">
            <FileText size={48} className="mx-auto mb-4 text-[#E8DFD1]" />
            <h3 className="text-xl font-serif text-[#1F2E27] mb-2">The Journal is empty</h3>
            <p className="text-[#3D3530]">Be the first to share a reflection or life update.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-[#D8CFBC] ml-4 md:ml-8 space-y-12 pb-12">
            {entries.map((entry) => (
              <div key={entry.id} className="relative pl-8 md:pl-12">
                {/* Timeline Dot */}
                <div className="absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-[#A8895C] border-4 border-[#F8F6F0]"></div>
                
                <Card className="hover:shadow-md transition-shadow group border-[#E8DFD1]">
                  <CardBody className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-serif font-semibold text-[#1F2E27] mb-2">{entry.title}</h3>
                        <p className="text-xs tracking-wider uppercase text-[#A8895C] font-bold mb-4">
                          By {entry.author} <span className="mx-2 text-[#D8CFBC]">|</span> {entry.date}
                        </p>
                        <p className="text-[#3D3530] leading-loose mb-6 font-serif text-lg italic text-black/80">
                          "{entry.excerpt}"
                        </p>
                        <button
                          onClick={() => setSelectedEntry(entry)}
                          className="text-[#A8895C] border-b border-[#A8895C] pb-0.5 hover:text-[#1F2E27] hover:border-[#1F2E27] text-sm font-semibold transition-colors uppercase tracking-widest"
                        >
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

        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Write a Journal Entry">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2E27] mb-2">Your Name</label>
              <input
                type="text" value={newEntry.author} onChange={(e) => setNewEntry({ ...newEntry, author: e.target.value })}
                placeholder="Your name" className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2E27] mb-2">Title</label>
              <input
                type="text" value={newEntry.title} onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                placeholder="A title for your reflection" className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2E27] mb-2">Your Entry</label>
              <textarea
                value={newEntry.full} onChange={(e) => setNewEntry({ ...newEntry, full: e.target.value })}
                placeholder="Share a memory, reflection, or life update..." rows={6}
                className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="primary" onClick={handleAddEntry} className="flex-1 bg-[#1F2E27] hover:bg-[#A8895C] text-white">Publish Entry</Button>
              <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </Modal>

        {selectedEntry && (
          <Modal isOpen={!!selectedEntry} onClose={() => setSelectedEntry(null)} title={selectedEntry.title}>
            <div className="p-2">
              <p className="text-xs uppercase tracking-widest text-[#A8895C] font-bold mb-6 border-b border-[#E8DFD1] pb-4">
                By {selectedEntry.author} <span className="mx-2">|</span> {selectedEntry.date}
              </p>
              <p className="text-[#3D3530] leading-loose whitespace-pre-wrap font-serif text-lg">
                {selectedEntry.full}
              </p>
              <div className="mt-8 pt-6 border-t border-[#E8DFD1]">
                <Button variant="secondary" onClick={() => setSelectedEntry(null)} className="w-full">Close Entry</Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}