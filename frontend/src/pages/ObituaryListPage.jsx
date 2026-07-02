import React, { useState } from "react";
import { Search, Calendar, Users } from "lucide-react";
import { Card, CardBody } from "../components";

export default function ObituaryListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");

  const obituaries = [
    {
      id: 1,
      name: "Margaret Ellen Coats",
      born: "1941",
      died: "2026-06-17",
      note: "Beloved teacher and grandmother",
      service: "June 27, 2026",
    },
    {
      id: 2,
      name: "Walter James Hidalgo",
      born: "1958",
      died: "2026-06-15",
      note: "Devoted father and friend",
      service: "June 24, 2026",
    },
    {
      id: 3,
      name: "Ruth Anne Okafor",
      born: "1933",
      died: "2026-06-12",
      note: "Cherished community leader",
      service: "June 20, 2026",
    },
    {
      id: 4,
      name: "Donald Earl Bryce",
      born: "1947",
      died: "2026-06-09",
      note: "US Navy Veteran",
      service: "June 18, 2026",
    },
    {
      id: 5,
      name: "Patricia Lynn Saunders",
      born: "1962",
      died: "2026-06-05",
      note: "Loving mother of three",
      service: "June 14, 2026",
    },
    {
      id: 6,
      name: "Harold Vance Whitcomb",
      born: "1929",
      died: "2026-05-29",
      note: "Retired postmaster",
      service: "June 7, 2026",
    },
  ];

  const filtered = obituaries.filter((obit) => {
    const matchesSearch =
      obit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obit.note.toLowerCase().includes(searchTerm.toLowerCase());

    const obituaryMonth = new Date(obit.died).toLocaleString("default", {
      month: "long",
    });
    const matchesFilter = filterMonth === "all" || obituaryMonth === filterMonth;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-[#F8F6F0]">
      <div className="site-container py-12">
        <h1 className="text-4xl font-serif font-semibold text-[#1F2E27] mb-2">
          Obituaries & Memorials
        </h1>
        <p className="text-[#3D3530] mb-12">
          Honor and remember the lives of those we've helped celebrate.
        </p>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg border border-[#E8DFD1] p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-3 text-[#A8895C]"
              />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]"
              />
            </div>

            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-4 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]"
            >
              <option value="all">All Months</option>
              <option value="June">June</option>
              <option value="May">May</option>
              <option value="April">April</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {filtered.length > 0 ? (
          <div className="grid gap-4">
            {filtered.map((obit) => (
              <Card key={obit.id}>
                <CardBody>
                  <h3 className="text-lg font-serif font-semibold text-[#1F2E27] mb-2">
                    {obit.name}
                  </h3>
                  <p className="text-[#3D3530] text-sm mb-3">{obit.note}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-[#3D3530]">
                    <span className="flex items-center gap-1">
                      <Calendar size={16} className="text-[#A8895C]" />
                      {obit.born} – {obit.died}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={16} className="text-[#A8895C]" />
                      Service: {obit.service}
                    </span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#3D3530] mb-4">No obituaries found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
