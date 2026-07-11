import React, { useState, useEffect } from "react";
import { ArrowLeft, Pin, ImagePlus, Plus } from "lucide-react";
import { Link } from "react-router-dom"; // PRO-GRADE: React Router
import { Card, CardBody, Button, Modal } from "../components";

export default function MemorialPagesPage({ dynamicId }) {
  const [memorialData, setMemorialData] = useState({ name: "our beloved" });
  
  const [memories, setMemories] = useState(() => {
    try {
      const saved = localStorage.getItem(`LastPlannerJulz_Memories_${dynamicId}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [showForm, setShowForm] = useState(false);
  const [newMemory, setNewMemory] = useState({ author: "", text: "", image: null });

  useEffect(() => {
    if (dynamicId) {
      const allMemorials = JSON.parse(localStorage.getItem("LastPlannerJulz_Memorials") || "{}");
      if (allMemorials[dynamicId]) setMemorialData(allMemorials[dynamicId]);
    }
  }, [dynamicId]);

  useEffect(() => {
    if (dynamicId) {
      localStorage.setItem(`LastPlannerJulz_Memories_${dynamicId}`, JSON.stringify(memories));
    }
  }, [memories, dynamicId]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewMemory(prev => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handlePinMemory = () => {
    if (newMemory.author.trim() && (newMemory.text.trim() || newMemory.image)) {
      setMemories((prev) => [
        {
          id: Date.now(),
          author: newMemory.author,
          text: newMemory.text,
          image: newMemory.image,
          date: new Date().toLocaleDateString()
        },
        ...prev
      ]);
      setNewMemory({ author: "", text: "", image: null });
      setShowForm(false);
    }
  };

  return (
    <div className="bg-[#F8F6F0] py-12 min-h-screen">
      <div className="site-container">
        
        <Link 
          to={`/memorial/${dynamicId || ''}`}
          className="inline-flex items-center gap-2 text-sm text-[#A8895C] hover:text-[#1F2E27] uppercase tracking-wider font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Return to Dashboard
        </Link>

        <section className="mb-12 text-center">
          <p className="text-sm tracking-[0.28em] uppercase text-[#A8895C] mb-3">The Memory Board</p>
          <h1 className="text-5xl md:text-6xl font-serif font-semibold text-[#1F2E27] mb-4">Shared Stories & Reflections</h1>
          <p className="text-lg text-[#3D3530] max-w-3xl mx-auto">
            A collaborative space for family and friends to pin stories, photographs, and cherished moments with {memorialData.name}.
          </p>
          <Button variant="primary" size="lg" className="mt-8 shadow-md hover:-translate-y-1 transition-transform" onClick={() => setShowForm(true)}>
            <Plus size={18} className="inline mr-2" /> Pin a Memory
          </Button>
        </section>

        {memories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E8DFD1] border-dashed">
            <Pin size={48} className="mx-auto mb-4 text-[#E8DFD1]" />
            <h3 className="text-xl font-serif text-[#1F2E27] mb-2">No memories pinned yet</h3>
            <p className="text-[#3D3530]">Be the first to share a story or photo.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {memories.map((memory) => (
              <div key={memory.id} className="break-inside-avoid bg-white rounded-2xl p-6 shadow-sm border border-[#E8DFD1] relative group hover:shadow-xl transition-shadow cursor-pointer">
                <div className="absolute top-4 left-4 text-[#A8895C] bg-[#F8F6F0] p-1.5 rounded-full shadow-sm z-10 group-hover:-translate-y-1 transition-transform">
                  <Pin size={16} className="fill-current -rotate-45" />
                </div>
                {memory.image && (
                  <div className="mb-4 -mx-6 -mt-6 rounded-t-2xl overflow-hidden relative">
                    <img src={memory.image} alt="Memory" className="w-full h-auto object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  </div>
                )}
                <div className={memory.image ? "mt-4 pt-2" : "mt-8"}>
                  {memory.text && <p className="text-[#3D3530] leading-relaxed mb-4 whitespace-pre-wrap font-serif italic text-lg">"{memory.text}"</p>}
                  <div className="pt-4 border-t border-[#F0ECE1] flex justify-between items-end">
                    <p className="font-semibold text-[#1F2E27] text-sm uppercase tracking-wide">{memory.author}</p>
                    <span className="text-xs text-[#A8895C] font-medium">{memory.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Pin a New Memory">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1F2E27] mb-2">Your Name</label>
              <input type="text" value={newMemory.author} onChange={(e) => setNewMemory({ ...newMemory, author: e.target.value })} placeholder="e.g., Uncle Robert" className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]" />
            </div>
            <div>
              <label className="flex text-sm font-medium text-[#1F2E27] mb-2 items-center gap-2"><ImagePlus size={16} /> Attach a Photo (Optional)</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full p-2 border border-[#E8DFD1] rounded bg-[#F8F6F0] text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:font-semibold file:bg-[#1F2E27] file:text-white hover:file:bg-[#A8895C] transition-colors cursor-pointer" />
              {newMemory.image && <div className="mt-2 text-xs text-green-600 font-semibold">✓ Image ready to pin</div>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2E27] mb-2">Your Story or Thoughts</label>
              <textarea value={newMemory.text} onChange={(e) => setNewMemory({ ...newMemory, text: e.target.value })} placeholder="Share a favorite moment, a lesson learned, or a simple thought..." rows={5} className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]" />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="primary" onClick={handlePinMemory} className="flex-1 bg-[#1F2E27] hover:bg-[#A8895C] text-white disabled:opacity-50" disabled={!newMemory.author || (!newMemory.text && !newMemory.image)}>
                Pin to Board
              </Button>
              <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}