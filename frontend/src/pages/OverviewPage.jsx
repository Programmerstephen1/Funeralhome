import React from "react";
import { Card, CardBody } from "../components";

export default function OverviewPage() {
  return (
    <div className="bg-[#F8F6F0] py-12 min-h-screen">
      <div className="site-container">
        <section className="mb-12 text-center">
          <p className="text-sm tracking-[0.28em] uppercase text-[#A8895C] mb-3">Memorial Hub</p>
          <h1 className="text-5xl md:text-6xl font-serif font-semibold text-[#1F2E27] mb-4">Overview</h1>
          <p className="text-lg text-[#3D3530] max-w-3xl mx-auto">
            A calm introduction to the memorial experience, designed to make visitors feel supported and informed.
          </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardBody>
              <h2 className="text-3xl font-serif font-semibold text-[#1F2E27] mb-4">What you’ll find here</h2>
              <p className="text-[#3D3530] leading-8 mb-6">
                This page provides a gentle orientation for guests. It explains the purpose of the Memorial Hub and highlights the sections available for honoring a loved one.
              </p>
              <ul className="list-disc pl-6 space-y-3 text-[#3D3530]">
                <li>Guidance for visitors who want to explore in a meaningful way.</li>
                <li>Clear descriptions of memorial features and how they work.</li>
                <li>A respectful overview of tribute options including candles, flowers, and journal entries.</li>
              </ul>
            </CardBody>
          </Card>

          <div className="rounded-3xl bg-white p-8 shadow-sm border border-[#E8DFD1] h-fit">
            <h2 className="text-2xl font-semibold text-[#1F2E27] mb-4">Return to Memorial Hub</h2>
            <p className="text-[#3D3530] mb-6">
              Go back to the Memorial Hub for a wider view of the tribute sections and choose the next page to visit.
            </p>
            <button 
              onClick={() => {
                // Extract the family ID (e.g., 'kinuthia-family') from the current URL
                const currentHash = window.location.hash;
                const familyId = currentHash.split('/')[1];
                // Send them back to their specific memorial hub
                window.location.hash = familyId ? `#memorial/${familyId}` : "#memorial";
              }}
              className="inline-block w-full border border-[#A8895C] text-[#A8895C] px-6 py-3 text-sm tracking-wider uppercase font-semibold rounded hover:bg-[#A8895C] hover:text-white transition-all duration-300 text-center"
            >
              Back to Memorial Hub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}