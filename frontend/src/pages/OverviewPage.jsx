import React from "react";
import { Link } from "react-router-dom"; // PRO-GRADE: React Router
import { ArrowLeft } from "lucide-react";
import { Card, CardBody } from "../components";

export default function OverviewPage({ dynamicId }) {
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
          <p className="text-sm tracking-[0.28em] uppercase text-[#A8895C] mb-3">Memorial Hub</p>
          <h1 className="text-5xl md:text-6xl font-serif font-semibold text-[#1F2E27] mb-4">Overview</h1>
          <p className="text-lg text-[#3D3530] max-w-3xl mx-auto">
            A calm introduction to the memorial experience, designed to make visitors feel supported and informed.
          </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr] max-w-6xl mx-auto">
          <Card className="border-[#E8DFD1] shadow-md">
            <CardBody className="p-8 md:p-12">
              <h2 className="text-3xl font-serif font-semibold text-[#1F2E27] mb-6 border-b border-[#E8DFD1] pb-4">What you’ll find here</h2>
              <p className="text-[#3D3530] text-lg leading-loose mb-6">
                This space provides a gentle orientation for guests. It explains the purpose of the Memorial Hub and highlights the interactive sections available for honoring a loved one.
              </p>
              <ul className="space-y-4 text-[#3D3530]">
                <li className="flex gap-3 items-start"><span className="text-[#A8895C] font-bold">•</span> Guidance for visitors who want to explore in a meaningful way.</li>
                <li className="flex gap-3 items-start"><span className="text-[#A8895C] font-bold">•</span> Clear descriptions of memorial features and how they work.</li>
                <li className="flex gap-3 items-start"><span className="text-[#A8895C] font-bold">•</span> A respectful overview of tribute options including candles, flowers, and journal entries.</li>
              </ul>
            </CardBody>
          </Card>

          <div className="rounded-3xl bg-white p-8 shadow-md border border-[#E8DFD1] h-fit sticky top-24">
            <h2 className="text-2xl font-serif font-semibold text-[#1F2E27] mb-4">Ready to explore?</h2>
            <p className="text-[#3D3530] mb-8 leading-relaxed">
              Go back to the Memorial Hub for a wider view of the tribute sections and choose the next page to visit.
            </p>
            <Link 
              to={`/memorial/${dynamicId || ''}`}
              className="inline-block w-full bg-[#1F2E27] text-white px-6 py-4 text-xs tracking-widest uppercase font-bold rounded shadow-lg hover:bg-[#A8895C] hover:-translate-y-1 transition-all duration-300 text-center"
            >
              Back to Memorial Hub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}