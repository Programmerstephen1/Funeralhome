import React, { useState, useEffect } from "react";
import { ArrowLeft, BookOpen, Flower, Flame, Pin, FileText, Image as ImageIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // PRO-GRADE: React Router
import { Card, CardBody } from "../components";

export default function MemorialWallPage({ dynamicId }) {
  const navigate = useNavigate();
  const [memorialData, setMemorialData] = useState({ name: "our beloved", portrait: null });
  
  const [stats, setStats] = useState({ flowers: 0, candles: 0, memories: 0, photos: 0, journal: 0 });
  const [latestJournal, setLatestJournal] = useState(null);
  const [latestMemory, setLatestMemory] = useState(null);

  useEffect(() => {
    if (dynamicId) {
      const allMemorials = JSON.parse(localStorage.getItem("LastPlannerJulz_Memorials") || "{}");
      if (allMemorials[dynamicId]) setMemorialData(allMemorials[dynamicId]);

      const flowers = JSON.parse(localStorage.getItem(`LastPlannerJulz_Flowers_${dynamicId}`) || "[]");
      const candles = JSON.parse(localStorage.getItem(`LastPlannerJulz_Candles_${dynamicId}`) || "[]"); 
      const memories = JSON.parse(localStorage.getItem(`LastPlannerJulz_Memories_${dynamicId}`) || "[]");
      const photos = JSON.parse(localStorage.getItem(`LastPlannerJulz_Gallery_${dynamicId}`) || "[]");
      const journal = JSON.parse(localStorage.getItem(`LastPlannerJulz_Journal_${dynamicId}`) || "[]");

      setStats({
        flowers: flowers.length,
        candles: candles.length,
        memories: memories.length,
        photos: photos.length,
        journal: journal.length
      });

      if (journal.length > 0) setLatestJournal(journal[0]);
      if (memories.length > 0) setLatestMemory(memories[0]);
    }
  }, [dynamicId]);

  return (
    <div className="bg-[#F8F6F0] py-12 min-h-screen">
      <div className="site-container">
        
        <Link 
          to={`/memorial/${dynamicId || ''}`}
          className="inline-flex items-center gap-2 text-sm text-[#A8895C] hover:text-[#1F2E27] uppercase tracking-wider font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Return to Dashboard
        </Link>

        <section className="mb-16 text-center">
          <BookOpen size={48} className="mx-auto mb-4 text-[#A8895C]" />
          <p className="text-sm tracking-[0.28em] uppercase text-[#A8895C] mb-3">Highlight Reel</p>
          <h1 className="text-5xl md:text-6xl font-serif font-semibold text-[#1F2E27] mb-4">The Memorial Wall</h1>
          <p className="text-lg text-[#3D3530] max-w-3xl mx-auto mb-10">
            A unified view honoring the legacy of {memorialData.name}, aggregating the love, memories, and tributes shared across their entire digital space.
          </p>

          <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-[#E8DFD1] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-32 bg-[#1F2E27] transition-colors group-hover:bg-[#3D3530]"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              {memorialData.portrait ? (
                <div className="w-48 h-48 rounded-full object-cover border-8 border-white shadow-xl mb-6 transform transition-transform group-hover:scale-105" style={{ backgroundImage: `url(${memorialData.portrait})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              ) : (
                <div className="w-48 h-48 rounded-full bg-[#EFEAE0] flex items-center justify-center border-8 border-white shadow-xl mb-6 transform transition-transform group-hover:scale-105">
                  <span className="text-6xl font-serif text-[#A8895C]">{memorialData.name[0]}</span>
                </div>
              )}
              <h2 className="text-4xl font-serif font-bold text-[#1F2E27] mb-2">{memorialData.name}</h2>
              <p className="text-sm uppercase tracking-widest text-[#A8895C] font-semibold">Forever in our hearts</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-[#E8DFD1]">
              <div className="text-center hover:-translate-y-1 transition-transform cursor-pointer" onClick={() => navigate(`/flowers/${dynamicId}`)}>
                <Flower size={24} className="mx-auto text-[#A8895C] mb-2" />
                <p className="text-3xl font-serif font-bold text-[#1F2E27]">{stats.flowers}</p>
                <p className="text-xs uppercase tracking-wider text-[#3D3530]">Floral Tributes</p>
              </div>
              <div className="text-center hover:-translate-y-1 transition-transform cursor-pointer" onClick={() => navigate(`/pages/${dynamicId}`)}>
                <Pin size={24} className="mx-auto text-[#A8895C] mb-2" />
                <p className="text-3xl font-serif font-bold text-[#1F2E27]">{stats.memories}</p>
                <p className="text-xs uppercase tracking-wider text-[#3D3530]">Pinned Stories</p>
              </div>
              <div className="text-center hover:-translate-y-1 transition-transform cursor-pointer" onClick={() => navigate(`/gallery/${dynamicId}`)}>
                <ImageIcon size={24} className="mx-auto text-[#A8895C] mb-2" />
                <p className="text-3xl font-serif font-bold text-[#1F2E27]">{stats.photos}</p>
                <p className="text-xs uppercase tracking-wider text-[#3D3530]">Gallery Photos</p>
              </div>
              <div className="text-center hover:-translate-y-1 transition-transform cursor-pointer" onClick={() => navigate(`/journal/${dynamicId}`)}>
                <FileText size={24} className="mx-auto text-[#A8895C] mb-2" />
                <p className="text-3xl font-serif font-bold text-[#1F2E27]">{stats.journal}</p>
                <p className="text-xs uppercase tracking-wider text-[#3D3530]">Journal Entries</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm tracking-[0.2em] uppercase text-[#A8895C] mb-4 font-semibold flex items-center gap-2"><Pin size={16} /> Latest Shared Memory</h3>
            {latestMemory ? (
              <Card className="h-full border-[#E8DFD1] hover:border-[#A8895C] transition-colors cursor-pointer hover:shadow-lg" onClick={() => navigate(`/pages/${dynamicId}`)}>
                <CardBody className="p-8">
                  <p className="font-serif italic text-xl text-[#3D3530] leading-relaxed mb-6">"{latestMemory.text}"</p>
                  <p className="text-xs uppercase tracking-widest text-[#A8895C] font-bold border-t border-[#F0ECE1] pt-4">Pinned by {latestMemory.author}</p>
                </CardBody>
              </Card>
            ) : (
              <Card className="h-full border-[#E8DFD1] border-dashed"><CardBody className="p-8 text-center text-[#3D3530] flex items-center justify-center italic">No memories pinned yet.</CardBody></Card>
            )}
          </div>
          <div>
            <h3 className="text-sm tracking-[0.2em] uppercase text-[#A8895C] mb-4 font-semibold flex items-center gap-2"><FileText size={16} /> Latest Journal Entry</h3>
            {latestJournal ? (
              <Card className="h-full bg-[#1F2E27] text-white cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all" onClick={() => navigate(`/journal/${dynamicId}`)}>
                <CardBody className="p-8">
                  <h4 className="text-2xl font-serif font-semibold mb-3">{latestJournal.title}</h4>
                  <p className="text-white/80 leading-relaxed mb-6 font-serif italic">"{latestJournal.excerpt}"</p>
                  <p className="text-xs uppercase tracking-widest text-[#A8895C] font-bold border-t border-white/20 pt-4">Written by {latestJournal.author}</p>
                </CardBody>
              </Card>
            ) : (
              <Card className="h-full border-[#E8DFD1] border-dashed"><CardBody className="p-8 text-center text-[#3D3530] flex items-center justify-center italic">No journal entries written yet.</CardBody></Card>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}