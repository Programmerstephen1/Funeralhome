import React, { useState, useEffect } from "react";
import { Heart, Flame, ArrowLeft, Plus } from "lucide-react";
import { Link } from "react-router-dom"; // PRO-GRADE: React Router
import { Button, Card, CardBody, Modal } from "../components";

export default function TributePage({ dynamicId }) {
  // Persistent Storage Added for Pro-Grade feel
  const [tributes, setTributes] = useState(() => {
    try {
      const saved = localStorage.getItem(`LastPlannerJulz_Tributes_${dynamicId}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [candles, setCandles] = useState(new Set());
  const [showTributeForm, setShowTributeForm] = useState(false);
  const [newTribute, setNewTribute] = useState({ name: "", message: "" });

  useEffect(() => {
    if (dynamicId) {
      localStorage.setItem(`LastPlannerJulz_Tributes_${dynamicId}`, JSON.stringify(tributes));
    }
  }, [tributes, dynamicId]);

  const handleLightCandle = (id) => {
    setCandles((prev) => new Set(prev).add(id));
  };

  const handleAddTribute = () => {
    if (newTribute.name.trim() && newTribute.message.trim()) {
      setTributes((prev) => [
        {
          id: Date.now(),
          name: newTribute.name,
          message: newTribute.message,
          date: new Date().toLocaleDateString(),
        },
        ...prev,
      ]);
      setNewTribute({ name: "", message: "" });
      setShowTributeForm(false);
    }
  };

  return (
    <div className="bg-[#F8F6F0] min-h-screen py-12">
      <div className="site-container max-w-5xl mx-auto">
        
        <Link 
          to={`/memorial/${dynamicId || ''}`}
          className="inline-flex items-center gap-2 text-sm text-[#A8895C] hover:text-[#1F2E27] uppercase tracking-wider font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Return to Dashboard
        </Link>

        {/* Hero */}
        <section className="text-center mb-16">
          <Heart size={48} className="mx-auto mb-4 text-[#A8895C]" />
          <p className="text-sm tracking-[0.28em] uppercase text-[#A8895C] mb-3">Honoring Memory</p>
          <h1 className="text-5xl md:text-6xl font-serif font-semibold text-[#1F2E27] mb-4">A Place to Remember</h1>
          <p className="text-lg text-[#3D3530] max-w-2xl mx-auto">
            Share your memories, light a candle, and honor those we've loved and lost.
          </p>
          <Button variant="primary" size="lg" className="mt-8 shadow-md hover:-translate-y-1 transition-transform" onClick={() => setShowTributeForm(true)}>
            <Plus size={18} className="inline mr-2" /> Share a Tribute
          </Button>
        </section>

        {/* Tributes Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-serif font-semibold text-[#1F2E27] mb-8 border-b border-[#E8DFD1] pb-4">
            Community Tributes ({tributes.length})
          </h2>
          
          {tributes.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-[#E8DFD1] rounded-2xl">
              <Heart size={48} className="mx-auto mb-4 text-[#E8DFD1]" />
              <p className="text-[#3D3530] italic">No tributes shared yet. Be the first to honor their memory.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {tributes.map((tribute) => (
                <Card key={tribute.id} className="hover:border-[#A8895C] transition-colors shadow-sm">
                  <CardBody className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-xl font-serif text-[#1F2E27]">{tribute.name}</h3>
                        <p className="text-xs uppercase tracking-widest text-[#A8895C] font-semibold mt-1">{tribute.date}</p>
                      </div>
                      <button onClick={() => handleLightCandle(tribute.id)} disabled={candles.has(tribute.id)} className="p-3 bg-[#F8F6F0] rounded-full hover:bg-[#EFEAE0] transition-colors disabled:opacity-50 border border-[#E8DFD1]" title="Light a candle for this tribute">
                        <Flame size={20} className={candles.has(tribute.id) ? "text-orange-500 fill-orange-500 animate-pulse" : "text-[#A8895C]"} />
                      </button>
                    </div>
                    <p className="text-[#3D3530] leading-relaxed italic font-serif">"{tribute.message}"</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </section>

        <Modal isOpen={showTributeForm} onClose={() => setShowTributeForm(false)} title="Share Your Tribute">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1F2E27] mb-2">Your Name</label>
              <input type="text" value={newTribute.name} onChange={(e) => setNewTribute({ ...newTribute, name: e.target.value })} placeholder="Enter your name" className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2E27] mb-2">Your Tribute</label>
              <textarea value={newTribute.message} onChange={(e) => setNewTribute({ ...newTribute, message: e.target.value })} placeholder="Share a memory or kind words..." rows={5} className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]" />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="primary" onClick={handleAddTribute} className="flex-1 bg-[#1F2E27] hover:bg-[#A8895C] text-white" disabled={!newTribute.name || !newTribute.message}>
                Submit Tribute
              </Button>
              <Button variant="secondary" onClick={() => setShowTributeForm(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </Modal>

        <section className="rounded-2xl p-10 mt-16 border border-[#E8DFD1] shadow-sm" style={{ backgroundColor: "#EFEAE0" }}>
          <h2 className="text-3xl font-serif font-semibold text-[#1F2E27] mb-4">The Power of Memory</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <p className="text-[#3D3530] leading-loose">
              This tribute page is a sacred space to honor and remember those we love. Every message, every candle lit, represents the enduring bond between the living and those we've lost.
            </p>
            <p className="text-[#3D3530] leading-loose">
              Share your favorite memories, kind words, or a simple acknowledgment of their passing. Your tribute will help keep their spirit alive in the hearts of all who knew them.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}