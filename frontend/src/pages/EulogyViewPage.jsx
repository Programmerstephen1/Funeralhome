import React, { useState, useEffect } from "react";
import { AlertCircle, Download, ArrowLeft } from "lucide-react";

export default function EulogyViewPage({ dynamicId }) {
  const [eulogy, setEulogy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!dynamicId) {
      setError("No eulogy ID provided.");
      setLoading(false);
      return;
    }

    const fetchEulogy = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || window.location.origin;
        const response = await fetch(`${API_URL}/api/eulogies/${dynamicId}`);
        const data = await response.json();

        if (response.ok) {
          setEulogy(data);
        } else {
          setError(data.error || "Eulogy not found.");
        }
      } catch (err) {
        setError("Failed to load eulogy. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchEulogy();
  }, [dynamicId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center">
        <p className="text-[#A8895C] font-semibold text-lg">Loading tribute...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex flex-col items-center justify-center p-4">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-serif text-[#1F2E27] mb-2">Something went wrong</h2>
        <p className="text-[#3D3530] mb-6">{error}</p>
        <a href="#home" className="text-[#A8895C] hover:underline font-semibold">
          Return to Last planner Julz Hub
        </a>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F6F0] min-h-screen pb-12">
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            body { background-color: white; }
          }
        `}
      </style>

      <div className="site-container max-w-3xl pt-8">
        
        <div className="flex justify-between items-center mb-8 no-print">
          <a href="#home" className="flex items-center gap-2 text-[#A8895C] hover:text-[#8F744D] transition-colors font-semibold">
            <ArrowLeft size={20} /> Back to Home
          </a>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#1F2E27] text-white px-4 py-2 rounded shadow hover:bg-[#3D3530] transition-colors"
          >
            <Download size={18} /> Save as PDF
          </button>
        </div>

        <div className="bg-white p-8 md:p-16 rounded shadow-sm border border-[#E8DFD1]">
          
          <div className="text-center mb-12 border-b border-[#E8DFD1] pb-8">
            <h1 className="text-4xl md:text-5xl font-serif font-semibold text-[#1F2E27] mb-4">
              In Loving Memory
            </h1>
            <h2 className="text-3xl text-[#A8895C] font-serif mb-4">
              {eulogy.deceased_name}
            </h2>
            <p className="text-lg text-[#3D3530] tracking-widest uppercase">
              {eulogy.birth_year || "Unknown"} — {eulogy.passing_year || "Unknown"}
            </p>
          </div>

          {(eulogy.occupation || eulogy.interests) && (
            <div className="mb-10 text-center italic text-[#3D3530]">
              <p>
                {eulogy.occupation && `Remembered as a dedicated ${eulogy.occupation}. `}
                {eulogy.interests && `Found joy in ${eulogy.interests}.`}
              </p>
            </div>
          )}

          <div className="prose max-w-none text-[#3D3530] leading-relaxed whitespace-pre-wrap">
            {eulogy.personality}
          </div>

          <div className="mt-16 pt-8 border-t border-[#EFEAE0] text-center no-print">
            <p className="text-sm text-[#8F744D] uppercase tracking-widest font-semibold">
              Thank you for celebrating the life of {eulogy.deceased_name} with us.
              last planner Julz Hub is honored to have been part of this tribute.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}