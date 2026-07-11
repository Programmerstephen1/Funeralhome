import React, { useState } from "react";
import { Search, Calendar, Users, ChevronRight } from "lucide-react";
import { Card, CardBody } from "../components";

export default function ObituaryListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");

  const obituaries = [
    { id: 1, name: "Margaret Ellen Coats", born: "1941", died: "2026-06-17", note: "Beloved teacher and grandmother", service: "June 27, 2026" },
    { id: 2, name: "Walter James Hidalgo", born: "1958", died: "2026-06-15", note: "Devoted father and friend", service: "June 24, 2026" },
    { id: 3, name: "Ruth Anne Okafor", born: "1933", died: "2026-06-12", note: "Cherished community leader", service: "June 20, 2026" },
    { id: 4, name: "Donald Earl Bryce", born: "1947", died: "2026-06-09", note: "US Navy Veteran", service: "June 18, 2026" },
    { id: 5, name: "Patricia Lynn Saunders", born: "1962", died: "2026-06-05", note: "Loving mother of three", service: "June 14, 2026" },
    { id: 6, name: "Harold Vance Whitcomb", born: "1929", died: "2026-05-29", note: "Retired postmaster", service: "June 7, 2026" },
  ];

  const filtered = obituaries.filter((obit) => {
    const matchesSearch = obit.name.toLowerCase().includes(searchTerm.toLowerCase()) || obit.note.toLowerCase().includes(searchTerm.toLowerCase());
    const obituaryMonth = new Date(obit.died).toLocaleString("default", { month: "long" });
    const matchesFilter = filterMonth === "all" || obituaryMonth === filterMonth;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-[#F8F6F0] min-h-screen">
      <div className="site-container py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif font-semibold text-[#1F2E27] mb-4">Obituaries & Memorials</h1>
          <p className="text-[#3D3530] text-lg max-w-2xl mx-auto">Honor and remember the lives of those we've helped celebrate.</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E8DFD1] p-6 mb-12 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-3.5 text-[#A8895C]" />
              <input type="text" placeholder="Search by name or keyword..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C] bg-[#F8F6F0]" />
            </div>
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="px-6 py-3 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C] bg-[#F8F6F0] font-semibold text-[#1F2E27] uppercase tracking-wider text-sm">
              <option value="all">All Months</option>
              <option value="June">June 2026</option>
              <option value="May">May 2026</option>
              <option value="April">April 2026</option>
            </select>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((obit) => (
              <Card key={obit.id} className="hover:border-[#A8895C] transition-colors group cursor-pointer hover:shadow-lg">
                <CardBody className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-serif font-bold text-[#1F2E27] group-hover:text-[#A8895C] transition-colors">{obit.name}</h3>
                    <ChevronRight size={20} className="text-[#E8DFD1] group-hover:text-[#A8895C] transition-colors" />
                  </div>
                  <p className="text-[#3D3530] italic font-serif mb-6">"{obit.note}"</p>
                  <div className="flex flex-col sm:flex-row gap-4 text-xs tracking-wider uppercase font-semibold text-[#8F847C] border-t border-[#F0ECE1] pt-4">
                    <span className="flex items-center gap-2"><Calendar size={14} className="text-[#A8895C]" /> {obit.born} – {obit.died}</span>
                    <span className="flex items-center gap-2"><Users size={14} className="text-[#A8895C]" /> Service: {obit.service}</span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-[#E8DFD1]">
            <Search size={48} className="mx-auto text-[#E8DFD1] mb-4" />
            <p className="text-[#3D3530] text-lg">No obituaries found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}