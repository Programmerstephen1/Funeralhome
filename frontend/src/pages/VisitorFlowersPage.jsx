import React, { useState, useEffect } from "react";
import { Flower, ArrowLeft, Plus } from "lucide-react";
import { Link } from "react-router-dom"; // PRO-GRADE: React Router
import { Button, Card, CardBody, Modal } from "../components";

export default function VisitorFlowersPage({ dynamicId }) {
  const [memorialData, setMemorialData] = useState({ name: "our beloved", portrait: null });
  
  const [flowers, setFlowers] = useState(() => {
    try {
      const saved = localStorage.getItem(`LastPlannerJulz_Flowers_${dynamicId}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
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

  useEffect(() => {
    if (dynamicId) {
      const allMemorials = JSON.parse(localStorage.getItem("LastPlannerJulz_Memorials") || "{}");
      if (allMemorials[dynamicId]) setMemorialData(allMemorials[dynamicId]);
    }
  }, [dynamicId]);

  useEffect(() => {
    if (dynamicId) {
      localStorage.setItem(`LastPlannerJulz_Flowers_${dynamicId}`, JSON.stringify(flowers));
    }
  }, [flowers, dynamicId]);

  const handleAddFlower = () => {
    if (newFlower.from.trim() && newFlower.arrangement.trim()) {
      setFlowers((prev) => [
        { id: Date.now(), from: newFlower.from, arrangement: newFlower.arrangement, date: new Date().toLocaleDateString() },
        ...prev,
      ]);
      setNewFlower({ from: "", arrangement: "" });
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

        <section className="mb-16 text-center flex flex-col items-center">
          <div className="relative mb-6">
            {memorialData.portrait ? (
              <div className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg hover:shadow-xl transition-shadow" style={{ backgroundImage: `url(${memorialData.portrait})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
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
          <h1 className="text-5xl font-serif font-semibold text-[#1F2E27] mb-4">
            In loving memory of {memorialData.name}
          </h1>
          <p className="text-lg text-[#3D3530] max-w-2xl mx-auto">
            Send a floral tribute to honor and remember with beauty and grace. Your arrangement will be placed in the digital garden below.
          </p>
          <Button variant="primary" size="lg" className="mt-8 shadow-md hover:-translate-y-1 transition-transform" onClick={() => setShowForm(true)}>
            <Plus size={18} className="inline mr-2" /> Place Flowers
          </Button>
        </section>

        <div className="grid lg:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto">
          {arrangements.map((arr) => (
            <Card key={arr.name} className="hover:border-[#A8895C] transition-colors hover:shadow-lg group">
              <CardBody className="p-8">
                <Flower size={36} className="text-[#A8895C] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-serif font-semibold text-[#1F2E27] mb-2">{arr.name}</h3>
                <p className="text-sm text-[#3D3530] mb-6">{arr.desc}</p>
                <Button variant="secondary" size="sm" className="w-full" onClick={() => { setNewFlower({ ...newFlower, arrangement: arr.name }); setShowForm(true); }}>
                  Select This Arrangement
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>

        <section className="mb-12 bg-white p-8 md:p-12 rounded-[2rem] border border-[#E8DFD1] shadow-sm max-w-6xl mx-auto">
          <h2 className="text-3xl font-serif font-semibold text-[#1F2E27] mb-8 border-b border-[#E8DFD1] pb-4">
            The Digital Garden ({flowers.length})
          </h2>
          
          {flowers.length === 0 ? (
            <p className="text-[#3D3530] italic text-center py-12">The garden is waiting for its first tribute.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {flowers.map((flower) => (
                <div key={flower.id} className="p-6 bg-[#F8F6F0] rounded-2xl border border-[#E8DFD1] flex flex-col justify-between group hover:shadow-md transition-all hover:-translate-y-1">
                  <div>
                    <Flower size={24} className="text-[#A8895C] mb-4" />
                    <p className="font-serif text-lg font-semibold text-[#1F2E27]">{flower.arrangement}</p>
                    <p className="text-sm text-[#3D3530] mt-2 italic font-serif">From: {flower.from}</p>
                  </div>
                  <p className="text-xs text-[#A8895C] mt-6 font-bold tracking-widest uppercase border-t border-[#E8DFD1] pt-4">{flower.date}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Place a Floral Tribute">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1F2E27] mb-2">Your Name</label>
              <input type="text" value={newFlower.from} onChange={(e) => setNewFlower({ ...newFlower, from: e.target.value })} placeholder="e.g. The Smith Family" className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2E27] mb-2">Chosen Arrangement</label>
              <select value={newFlower.arrangement} onChange={(e) => setNewFlower({ ...newFlower, arrangement: e.target.value })} className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C] bg-[#F8F6F0] font-semibold text-[#1F2E27]">
                <option value="">Select an arrangement...</option>
                {arrangements.map((arr) => (
                  <option key={arr.name} value={arr.name}>{arr.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="primary" onClick={handleAddFlower} disabled={!newFlower.from || !newFlower.arrangement} className="flex-1 bg-[#1F2E27] hover:bg-[#A8895C] text-white disabled:opacity-50">Place in Garden</Button>
              <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}