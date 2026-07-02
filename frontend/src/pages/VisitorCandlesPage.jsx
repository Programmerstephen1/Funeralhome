import React, { useState, useEffect } from "react";
import { Flame, ArrowLeft } from "lucide-react";
import { Button, Card, CardBody, Modal } from "../components";

export default function VisitorCandlesPage({ dynamicId }) {
  const [candles, setCandles] = useState([
    { id: 1, from: "Anonymous", message: "In loving memory.", date: "June 22, 2026" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newCandle, setNewCandle] = useState({ from: "", message: "" });
  const [memorialData, setMemorialData] = useState({ name: "our beloved", portrait: null });

  // Fetch the global profile data for this specific family
  useEffect(() => {
    if (dynamicId) {
      const allMemorials = JSON.parse(localStorage.getItem("hollowPineMemorials") || "{}");
      if (allMemorials[dynamicId]) {
        setMemorialData(allMemorials[dynamicId]);
      }
    }
  }, [dynamicId]);

  const handleLightCandle = () => {
    if (newCandle.from.trim() && newCandle.message.trim()) {
      setCandles((prev) => [
        { id: Math.max(...prev.map((c) => c.id), 0) + 1, from: newCandle.from, message: newCandle.message, date: new Date().toLocaleDateString() },
        ...prev,
      ]);
      setNewCandle({ from: "", message: "" });
      setShowForm(false);
    }
  };

  // Determine glow intensity based on how many candles are lit
  const glowIntensity = Math.min(candles.length * 10, 60);

  return (
    <div className="bg-[#F8F6F0] py-12 min-h-screen">
      {/* CUSTOM CSS FOR CANDLE FLICKER */}
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
        
        <a 
          href={`#memorial/${dynamicId || ''}`}
          className="inline-flex items-center gap-2 text-sm text-[#A8895C] hover:text-[#1F2E27] uppercase tracking-wider font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Return to Dashboard
        </a>

        {/* DYNAMIC PORTRAIT SECTION */}
        <section className="mb-16 text-center flex flex-col items-center">
          <div className="relative mb-6">
            {memorialData.portrait ? (
              <div 
                className="w-48 h-48 rounded-full object-cover border-4 border-white flicker-glow"
                style={{ 
                  backgroundImage: `url(${memorialData.portrait})`, 
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center' 
                }}
              />
            ) : (
              <div className="w-48 h-48 rounded-full bg-[#EFEAE0] flex items-center justify-center border-4 border-white flicker-glow">
                <Flame size={64} className="text-[#A8895C] opacity-50" />
              </div>
            )}
            
            {/* Decorative Flame overlay at the bottom of the portrait */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-2 shadow-md">
              <Flame size={24} className="text-orange-500 fill-orange-500 animate-pulse" />
            </div>
          </div>

          <h2 className="text-3xl font-serif text-[#1F2E27] mb-2">
            In loving memory of {memorialData.name}
          </h2>
          <p className="text-lg text-[#3D3530] max-w-2xl mx-auto mt-4">
            Light a candle as a symbol of remembrance, support, and eternal hope. Your flame joins others in a circle of quiet reflection.
          </p>
          
          <Button variant="primary" size="lg" className="mt-8 shadow-lg hover:-translate-y-1 transition-transform" onClick={() => setShowForm(true)}>
            <Flame size={20} /> Light a Candle
          </Button>
        </section>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-8 mb-12">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-[#1F2E27] mb-6 border-b border-[#E8DFD1] pb-4">
              Lit Candles ({candles.length})
            </h2>
            <div className="space-y-4">
              {candles.map((candle) => (
                <Card key={candle.id} className="border-l-4 border-l-orange-400">
                  <CardBody>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <Flame size={24} className="text-orange-500 fill-orange-500 animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#1F2E27]">{candle.from}</p>
                        <p className="text-[#3D3530] italic mt-2">"{candle.message}"</p>
                        <p className="text-xs text-[#A8895C] mt-3">{candle.date}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-[#E8DFD1] p-8 shadow-sm h-fit">
            <h3 className="text-xl font-serif font-semibold text-[#1F2E27] mb-4 flex items-center gap-2">
              <Flame size={20} className="text-[#A8895C]" /> The Circle of Light
            </h3>
            <p className="text-sm text-[#3D3530] leading-7">
              As more family and friends light candles, the glow surrounding the portrait grows stronger. Each candle represents a moment of quiet reflection, a message of support, and a connection to those who came before us. 
            </p>
          </div>
        </div>

        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Light a Candle in Memory">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2E27] mb-2">Your Name (or leave anonymous)</label>
              <input
                type="text"
                value={newCandle.from}
                onChange={(e) => setNewCandle({ ...newCandle, from: e.target.value || "Anonymous" })}
                placeholder="Your name or 'Anonymous'"
                className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2E27] mb-2">Your Message</label>
              <textarea
                value={newCandle.message}
                onChange={(e) => setNewCandle({ ...newCandle, message: e.target.value })}
                placeholder="A word, thought, or brief memory..."
                rows={4}
                className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="primary" onClick={handleLightCandle} className="flex-1 flex gap-2 justify-center bg-orange-600 hover:bg-orange-700 text-white border-none">
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