import React, { useState, useEffect } from "react";
import { Flower, ArrowLeft } from "lucide-react";
import { Button, Card, CardBody, Modal } from "../components";

export default function VisitorFlowersPage({ dynamicId }) {
  const [memorialData, setMemorialData] = useState({ name: "our beloved", portrait: null });
  
  // Load persistent flowers for this specific memorial
  const [flowers, setFlowers] = useState(() => {
    try {
      const saved = localStorage.getItem(`LastPlannerJulz_Flowers_${dynamicId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [newFlower, setNewFlower] = useState({ from: "", arrangement: "" });

  const arrangements = [
    { name: "White Roses & Lilies", desc: "Classic elegance" },
    { name: "Mixed Garden Arrangement", desc: "Colorful & vibrant" },
    { name: "Peach & Cream Blooms", desc: "Soft & gentle" },
    { name: "Lavender Dreams", desc: "Calming & peaceful" },
    { name: "Sunflower Tribute", desc: "Warm & radiant" },
    { name: "Sympathy Wreath", desc: "Traditional honor" },
  ];

  // Fetch the global profile data
  useEffect(() => {
    if (dynamicId) {
      const allMemorials = JSON.parse(localStorage.getItem("LastPlannerJulz_Memorials") || "{}");
      if (allMemorials[dynamicId]) {
        setMemorialData(allMemorials[dynamicId]);
      }
    }
  }, [dynamicId]);

  // Auto-save flowers when updated
  useEffect(() => {
    if (dynamicId) {
      localStorage.setItem(`LastPlannerJulz_Flowers_${dynamicId}`, JSON.stringify(flowers));
    }
  }, [flowers, dynamicId]);

  const handleAddFlower = () => {
    if (newFlower.from.trim() && newFlower.arrangement.trim()) {
      setFlowers((prev) => [
        { 
          id: Date.now(), 
          from: newFlower.from, 
          arrangement: newFlower.arrangement, 
          date: new Date().toLocaleDateString() 
        },
        ...prev,
      ]);
      setNewFlower({ from: "", arrangement: "" });
      setShowForm(false);
    }
  };

  return (
    <div className="bg-[#F8F6F0] py-12 min-h-screen">
      <div className="site-container">
        
        <a 
          href={`#memorial/${dynamicId || ''}`}
          className="inline-flex items-center gap-2 text-sm text-[#A8895C] hover:text-[#1F2E27] uppercase tracking-wider font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Return to Dashboard
        </a>

        <section className="mb-16 text-center flex flex-col items-center">
          <div className="relative mb-6">
            {memorialData.portrait ? (
              <div 
                className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg"
                style={{ 
                  backgroundImage: `url(${memorialData.portrait})`, 
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center' 
                }}
              />
            ) : (
              <div className="w-48 h-48 rounded-full bg-[#EFEAE0] flex items-center justify-center border-4 border-white shadow-lg">
                <Flower size={64} className="text-[#A8895C] opacity-50" />
              </div>
            )}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-2 shadow-md">
              <Flower size={24} className="text-[#A8895C]" />
            </div>
          </div>

          <p className="text-sm tracking-[0.28em] uppercase text-[#A8895C] mb-3">Floral Tributes</p>
          <h1 className="text-4xl font-serif font-semibold text-[#1F2E27] mb-4">
            In loving memory of {memorialData.name}
          </h1>
          <p className="text-lg text-[#3D3530] max-w-2xl mx-auto">
            Send a floral tribute to honor and remember with beauty and grace. Your arrangement will be placed in the digital garden below.
          </p>
          <Button variant="primary" size="lg" className="mt-8 shadow-md hover:-translate-y-1 transition-transform" onClick={() => setShowForm(true)}>
            + Place Flowers
          </Button>
        </section>

        <div className="grid lg:grid-cols-3 gap-6 mb-16">
          {arrangements.map((arr) => (
            <Card key={arr.name} className="hover:border-[#A8895C] transition-colors">
              <CardBody>
                <Flower size={32} className="text-[#A8895C] mb-3" />
                <h3 className="font-semibold text-[#1F2E27] mb-2">{arr.name}</h3>
                <p className="text-sm text-[#3D3530] mb-4">{arr.desc}</p>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => {
                    setNewFlower({ ...newFlower, arrangement: arr.name });
                    setShowForm(true);
                  }}
                >
                  Select This
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>

        <section className="mb-12 bg-white p-8 rounded-3xl border border-[#E8DFD1] shadow-sm">
          <h2 className="text-3xl font-serif font-semibold text-[#1F2E27] mb-8 border-b border-[#E8DFD1] pb-4">
            The Digital Garden ({flowers.length})
          </h2>
          
          {flowers.length === 0 ? (
            <p className="text-[#3D3530] italic text-center py-8">The garden is waiting for its first tribute.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {flowers.map((flower) => (
                <div key={flower.id} className="p-4 bg-[#F8F6F0] rounded-xl border border-[#E8DFD1] flex items-start justify-between group hover:shadow-md transition-all">
                  <div>
                    <p className="font-semibold text-[#1F2E27]">{flower.arrangement}</p>
                    <p className="text-sm text-[#3D3530] mt-1">From: {flower.from}</p>
                    <p className="text-xs text-[#A8895C] mt-2 font-medium tracking-wide uppercase">{flower.date}</p>
                  </div>
                  <Flower size={24} className="text-[#A8895C] opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}
        </section>

        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Place a Floral Tribute">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2E27] mb-2">Your Name</label>
              <input
                type="text"
                value={newFlower.from}
                onChange={(e) => setNewFlower({ ...newFlower, from: e.target.value })}
                placeholder="Your name"
                className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2E27] mb-2">Arrangement</label>
              <select
                value={newFlower.arrangement}
                onChange={(e) => setNewFlower({ ...newFlower, arrangement: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]"
              >
                <option value="">Select an arrangement...</option>
                {arrangements.map((arr) => (
                  <option key={arr.name} value={arr.name}>{arr.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="primary" onClick={handleAddFlower} className="flex-1">Place in Garden</Button>
              <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}