import React from "react";
import { TreeDeciduous, ChevronDown } from "lucide-react";
import { Button, Card, CardBody } from "../components";

export default function FamilyTreePage({ setCurrentPage }) {
  const generations = [
    {
      gen: "Grandparents",
      members: [
        { name: "William Henry", years: "1920–1995", role: "Patriarch" },
        { name: "Margaret Anne", years: "1925–2005", role: "Matriarch" },
      ],
    },
    {
      gen: "Parents",
      members: [
        { name: "Robert James", years: "1945–2015", role: "Father" },
        { name: "Patricia Ellen", years: "1950–present", role: "Mother" },
      ],
    },
    {
      gen: "This Generation",
      members: [
        { name: "Elizabeth Thompson", years: "1970–present", role: "Daughter" },
        { name: "Michael Thompson", years: "1972–present", role: "Son" },
      ],
    },
    {
      gen: "Children",
      members: [
        { name: "Sarah Mitchell", years: "1995–present", role: "Granddaughter" },
        { name: "David Mitchell", years: "1998–present", role: "Grandson" },
      ],
    },
  ];

  return (
    <div className="bg-[#F8F6F0] py-12 min-h-screen">
      <div className="site-container">
        <section className="mb-12 text-center">
          <TreeDeciduous size={48} className="mx-auto mb-4 text-[#A8895C]" />
          <p className="text-sm tracking-[0.28em] uppercase text-[#A8895C] mb-3">Memorial Hub</p>
          <h1 className="text-5xl md:text-6xl font-serif font-semibold text-[#1F2E27] mb-4">Family Tree</h1>
          <p className="text-lg text-[#3D3530] max-w-3xl mx-auto">
            A visual journey through generations of family heritage and connection.
          </p>
        </section>

        <div className="mb-12 space-y-8">
          {generations.map((gen, idx) => (
            <div key={gen.gen}>
              <h2 className="text-2xl font-serif font-semibold text-[#1F2E27] mb-6">{gen.gen}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {gen.members.map((member) => (
                  <Card key={member.name}>
                    <CardBody>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#A8895C]/10 flex items-center justify-center flex-shrink-0">
                          <TreeDeciduous size={20} className="text-[#A8895C]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#1F2E27]">{member.name}</h3>
                          <p className="text-sm text-[#A8895C] font-medium">{member.role}</p>
                          <p className="text-sm text-[#3D3530] mt-2">{member.years}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
              {idx < generations.length - 1 && (
                <div className="flex justify-center mt-8 mb-4">
                  <ChevronDown size={28} className="text-[#A8895C]" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-white border border-[#E8DFD1] p-10 mb-12">
          <h2 className="text-3xl font-serif font-semibold text-[#1F2E27] mb-4">A Legacy of Love</h2>
          <p className="text-[#3D3530] leading-8 mb-6">
            This family tree represents more than names and dates—it is a record of lives lived with purpose, relationships nurtured with care, and a heritage that continues to shape those who came after.
          </p>
          <p className="text-[#3D3530] leading-8">
            Every person on this tree contributed to the family story. Their values, their lessons, and their love live on in the hearts of those who knew them and in the generations yet to come.
          </p>
        </div>

        <div className="text-center">
          <Button variant="secondary" onClick={() => setCurrentPage("memorial")}>Return to Memorial Hub</Button>
        </div>
      </div>
    </div>
  );
}
