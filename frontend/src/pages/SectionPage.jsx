import React from "react";
import { Button } from "../components";

export default function SectionPage({ pageTitle, pageDescription, pageContent, setCurrentPage }) {
  return (
    <div className="bg-[#F8F6F0] py-12 min-h-screen">
      <div className="site-container">
        <section className="mb-10 text-center">
          <p className="text-sm tracking-[0.28em] uppercase text-[#A8895C] mb-3">
            Memorial Hub
          </p>
          <h1 className="text-5xl md:text-6xl font-serif font-semibold text-[#1F2E27] mb-4">
            {pageTitle}
          </h1>
          <p className="text-lg text-[#3D3530] max-w-3xl mx-auto">{pageDescription}</p>
        </section>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl bg-white p-10 shadow-sm border border-[#E8DFD1]">
            {pageContent.map((block, index) => (
              <section key={index} className={index > 0 ? "mt-10" : ""}>
                <h2 className="text-2xl font-serif font-semibold text-[#1F2E27] mb-4">
                  {block.heading}
                </h2>
                {block.text && <p className="text-[#3D3530] leading-8">{block.text}</p>}
                {block.items && (
                  <ul className="list-disc pl-6 mt-4 text-[#3D3530] space-y-2">
                    {block.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-[#E8DFD1]">
            <h2 className="text-2xl font-semibold text-[#1F2E27] mb-4">Need to return?</h2>
            <p className="text-[#3D3530] mb-6">
              Go back to the Memorial Hub anytime to select another section or continue exploring.
            </p>
            <Button variant="secondary" onClick={() => setCurrentPage("memorial")}>Back to Memorial Hub</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
