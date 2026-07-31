import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, Share2, Heart, Calendar, BookOpen, Check, ArrowLeft, ShieldCheck, FileText } from "lucide-react";

export default function DigitalTribute() {
  const { eulogyId } = useParams();
  const [eulogy, setEulogy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!eulogyId) return;

    fetch(`${API_URL}/api/eulogies/${eulogyId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Digital memorial page not found.");
        return res.json();
      })
      .then((data) => {
        setEulogy(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load memorial:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [eulogyId, API_URL]);

  const handleDownloadPDF = () => {
    if (!eulogyId) return;
    const downloadUrl = `${API_URL}/api/eulogies/${eulogyId}/download`;
    window.open(downloadUrl, "_blank");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Digital Memorial - ${eulogy?.deceased_name || 'In Memory'}`,
        text: `In loving memory of ${eulogy?.deceased_name}. View the full digital eulogy program.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Helper to parse story text and extract metadata
  const parseEulogyContent = (rawText) => {
    if (!rawText) return { template: "Executive Minimal", chapters: [] };

    let cleanedText = rawText;
    let metadata = {};

    const metaMatch = rawText.match(/\[PRODUCTION METADATA\](.*?)\[\/PRODUCTION METADATA\]/s);
    if (metaMatch) {
      const metaBlock = metaMatch[1];
      metaBlock.split('\n').forEach(line => {
        if (line.includes(':')) {
          const [key, val] = line.split(':', 2);
          metadata[key.trim()] = val.trim();
        }
      });
      cleanedText = rawText.replace(metaMatch[0], '').strip ? rawText.replace(metaMatch[0], '').strip() : rawText.replace(metaMatch[0], '').trim();
    }

    // Split text by capital headers like "EARLY LIFE:"
    const rawChapters = cleanedText.split(/([A-Z\s&]+):/);
    const chapters = [];

    for (let i = 1; i < rawChapters.length; i += 2) {
      const title = rawChapters[i].trim();
      const content = rawChapters[i + 1] ? rawChapters[i + 1].trim() : "";
      if (title && content) {
        chapters.push({ title, content });
      }
    }

    // Fallback if no uppercase markers found
    if (chapters.length === 0 && cleanedText) {
      chapters.push({ title: "Life Reflections", content: cleanedText });
    }

    return { metadata, chapters };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#A8895C] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-serif text-[#1F2E27] tracking-widest uppercase">Opening Digital Memorial...</p>
      </div>
    );
  }

  if (error || !eulogy) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] px-4 py-16 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-[#E8DFD1] p-8 rounded-2xl text-center shadow-sm">
          <Heart size={48} className="text-[#A8895C] mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-serif text-[#1F2E27] mb-2">Memorial Not Found</h2>
          <p className="text-sm text-[#716860] mb-6">The requested memorial page could not be located or may still be processing.</p>
          <Link to="/" className="inline-block px-6 py-3 bg-[#1F2E27] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#A8895C] transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const { chapters } = parseEulogyContent(eulogy.personality);

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#3D3530] font-sans pb-20">
      
      {/* Sticky Header Bar */}
      <header className="sticky top-0 z-40 bg-[#1F2E27] text-white py-3 px-4 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xs font-serif tracking-widest text-[#A8895C] uppercase">
            Last Planner Julz
          </Link>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              <span>{copied ? "Link Copied" : "Share"}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#A8895C] hover:bg-[#8F744D] text-white text-xs font-bold transition-colors shadow-sm"
            >
              <Download size={14} />
              <span>Save PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-[#E8DFD1] py-12 px-4 shadow-sm">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-[#A8895C] font-extrabold mb-3">
            In Loving Memory
          </p>
          <h1 className="text-4xl sm:text-5xl font-serif text-[#1F2E27] font-bold mb-4 leading-tight">
            {eulogy.deceased_name}
          </h1>

          <div className="flex items-center justify-center gap-3 text-sm font-bold text-[#716860] uppercase tracking-wider mb-8">
            <Calendar size={16} className="text-[#A8895C]" />
            <span>{eulogy.birth_year ? eulogy.birth_year.slice(0, 4) : "YYYY"}</span>
            <span>—</span>
            <span>{eulogy.passing_year ? eulogy.passing_year.slice(0, 4) : "YYYY"}</span>
          </div>

          {/* Quick Action Download Banner */}
          <div className="bg-[#F8F6F0] border border-[#E8DFD1] rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-left max-w-xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl border border-[#E8DFD1] text-[#A8895C]">
                <FileText size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1F2E27]">Official Printed Program</h4>
                <p className="text-xs text-[#716860]">Keep a formatted PDF copy on your phone.</p>
              </div>
            </div>
            
            <button
              onClick={handleDownloadPDF}
              className="w-full sm:w-auto px-6 py-3 bg-[#1F2E27] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#A8895C] transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0"
            >
              <Download size={15} /> Download PDF
            </button>
          </div>
        </div>
      </section>

      {/* Life Story Chapters Container */}
      <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        {chapters.map((chap, idx) => (
          <article key={idx} className="bg-white border border-[#E8DFD1] rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold font-serif text-[#1F2E27] uppercase tracking-wider mb-4 border-b border-[#F8F6F0] pb-3 flex items-center gap-2">
              <BookOpen size={18} className="text-[#A8895C]" />
              {chap.title}
            </h2>
            <div className="text-base leading-relaxed text-[#3D3530] whitespace-pre-wrap font-serif">
              {chap.content}
            </div>
          </article>
        ))}

        {/* Footer Actions */}
        <div className="bg-white border border-[#E8DFD1] rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <Heart size={32} className="text-[#A8895C] mx-auto" />
          <h3 className="text-xl font-serif text-[#1F2E27]">Honoring a Life Well Lived</h3>
          <p className="text-xs text-[#716860] max-w-md mx-auto leading-relaxed">
            Thank you for being part of this tribute. You can download the complete eulogy document to preserve these memories.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={handleDownloadPDF}
              className="px-8 py-3.5 bg-[#1F2E27] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#A8895C] transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <Download size={16} /> Save Official Program
            </button>

            <button
              onClick={handleShare}
              className="px-6 py-3.5 border border-[#E8DFD1] bg-[#F8F6F0] text-[#1F2E27] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2"
            >
              <Share2 size={16} /> Share Memorial
            </button>
          </div>
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="text-center py-6 text-xs text-[#8F847C]">
        <p>Published & Preserved by Last Planner Julz Funeral Home</p>
      </footer>

    </div>
  );
}