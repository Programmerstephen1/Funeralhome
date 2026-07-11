import React, { useState, useEffect } from "react";
import { Flame, ArrowLeft, Plus } from "lucide-react";
import { Link } from "react-router-dom"; // PRO-GRADE: React Router
import { Button, Card, CardBody, Modal } from "../components";

export default function VisitorCandlesPage({ dynamicId }) {
  // PRO-GRADE: Added Persistent Storage
  const [candles, setCandles] = useState(() => {
    try {
      const saved = localStorage.getItem(`LastPlannerJulz_Candles_${dynamicId}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [showForm, setShowForm] = useState(false);
  const [newCandle, setNewCandle] = useState({ from: "", message: "" });
  const [memorialData, setMemorialData] = useState({ name: "our beloved", portrait: null });

  useEffect(() => {
    if (dynamicId) {
      const allMemorials = JSON.parse(localStorage.getItem("LastPlannerJulz_Memorials") || "{}");
      if (allMemorials[dynamicId]) setMemorialData(allMemorials[dynamicId]);
    }
  }, [dynamicId]);

  useEffect(() => {
    if (dynamicId) {
      localStorage.setItem(`LastPlannerJulz_Candles_${dynamicId}`, JSON.stringify(candles));
    }
  }, [candles, dynamicId]);

  const handleLightCandle = () => {
    if (newCandle.from.trim() && newCandle.message.trim()) {
      setCandles((prev) => [
        { id: Date.now(), from: newCandle.from, message: newCandle.message, date: new Date().toLocaleDateString() },
        ...prev,
      ]);
      setNewCandle({ from: "", message: "" });
      setShowForm(false);
    }
  };

  const glowIntensity = Math.min(candles.length * 10, 60);

  return (
    <div className="bg-[#1A1A18] py-12 min-h-screen text-white">
      <style>{`
        @keyframes candleFlicker {
          0%, 100% { box-shadow: 0 0 ${glowIntensity}px rgba(249, 115, 22, 0.4), 0 0 ${glowIntensity * 2}px rgba(253, 186, 116, 0.2); }
          50% { box-shadow: 0 0 ${glowIntensity + 15}px rgba(249, 115, 22, 0.6), 0 0 ${glowIntensity * 2.5}px rgba(253, 186, 116, 0.3); }
        }
        .flicker-glow {
          animation: candleFlicker 3s infinite ease-in-out;
        }
      `}</style>

      <div className="site-container">
        
        <Link 
          to={`/memorial/${dynamicId || ''}`}
          className="inline-flex items-center gap-2 text-sm text-[#A8895C] hover:text-white uppercase tracking-wider font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Return to Dashboard
        </Link>

        <section className="mb-16 text-center flex flex-col items-center">
          <div className="relative mb-8">
            {memorialData.portrait ? (
              <div 
                className="w-48 h-48 rounded-full object-cover border-4 border-[#2A2A28] flicker-glow"
                style={{ backgroundImage: `url(${memorialData.portrait})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              />
            ) : (
              <div className="w-48 h-48 rounded-full bg-[#2A2A28] flex items-center justify-center border-4 border-[#3A3A38] flicker-glow">
                <Flame size={64} className="text-[#A8895C] opacity-30" />
              </div>
            )}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-[#1A1A18] rounded-full p-2 shadow-[0_0_15px_rgba(249,115,22,0.5)] border border-[#2A2A28]">
              <Flame size={28} className="text-orange-500 fill-orange-500 animate-pulse" />
            </div>
          </div>

          <p className="text-sm tracking-[0.28em] uppercase text-[#A8895C] mb-3">Vigil & Remembrance</p>
          <h2 className="text-5xl font-serif text-[#F8F6F0] mb-4">In loving memory of {memorialData.name}</h2>
          <p className="text-lg text-[#E8DFD1] max-w-2xl mx-auto opacity-80">
            Light a candle as a symbol of remembrance, support, and eternal hope. Your flame joins others in a circle of quiet reflection in the darkness.
          </p>
          
          <Button variant="primary" size="lg" className="mt-8 shadow-[0_0_20px_rgba(249,115,22,0.3)] bg-gradient-to-r from-orange-600 to-amber-500 border-none hover:-translate-y-1 transition-transform" onClick={() => setShowForm(true)}>
            <Plus size={18} className="inline mr-2"/> Light a Candle
          </Button>
        </section>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-8 mb-12">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-[#F8F6F0] mb-6 border-b border-[#3A3A38] pb-4">
              Lit Candles ({candles.length})
            </h2>
            
            {candles.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#3A3A38] rounded-2xl">
                <Flame size={32} className="mx-auto text-[#3A3A38] mb-4" />
                <p className="text-[#A8895C] italic">The night is quiet. Be the first to light a candle.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {candles.map((candle) => (
                  <div key={candle.id} className="bg-[#2A2A28] border-l-4 border-l-orange-500 rounded-lg p-6 flex items-start gap-5 shadow-lg">
                    <div className="flex-shrink-0 mt-1">
                      <Flame size={28} className="text-orange-500 fill-orange-500 animate-pulse drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white text-lg">{candle.from}</p>
                      <p className="text-[#E8DFD1] italic mt-2 font-serif">"{candle.message}"</p>
                      <p className="text-xs text-[#A8895C] uppercase tracking-widest mt-4 font-bold">{candle.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-[#2A2A28] border border-[#3A3A38] p-8 shadow-2xl h-fit sticky top-24">
            <h3 className="text-2xl font-serif font-semibold text-[#F8F6F0] mb-4 flex items-center gap-3">
              <Flame size={24} className="text-[#A8895C]" /> The Circle of Light
            </h3>
            <p className="text-sm text-[#E8DFD1] opacity-80 leading-loose">
              As more family and friends light candles, the glow surrounding the portrait grows stronger. Each candle represents a moment of quiet reflection, a message of support, and a connection to those who came before us. 
            </p>
          </div>
        </div>

        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Light a Candle in Memory">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1F2E27] mb-2">Your Name (or leave anonymous)</label>
              <input type="text" value={newCandle.from} onChange={(e) => setNewCandle({ ...newCandle, from: e.target.value || "Anonymous" })} placeholder="Your name or 'Anonymous'" className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2E27] mb-2">Your Message</label>
              <textarea value={newCandle.message} onChange={(e) => setNewCandle({ ...newCandle, message: e.target.value })} placeholder="A word, thought, or brief memory..." rows={4} className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-orange-500" />
            </div>
            <div className="flex gap-3 pt-4 border-t border-[#E8DFD1]">
              <Button variant="primary" onClick={handleLightCandle} className="flex-1 flex gap-2 justify-center bg-orange-600 hover:bg-orange-700 text-white border-none shadow-[0_4px_15px_rgba(249,115,22,0.3)]">
                <Flame size={16} /> Ignite Light
              </Button>
              <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </Modal>

      </div>
    </div>
  );
}