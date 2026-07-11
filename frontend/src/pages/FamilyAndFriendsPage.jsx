import React, { useState, useEffect } from "react";
import { Users, Heart, ArrowLeft, Plus } from "lucide-react";
import { Link } from "react-router-dom"; // PRO-GRADE: React Router
import { Card, CardBody, Button, Modal } from "../components";

export default function FamilyAndFriendsPage({ dynamicId }) {
  const [memorialData, setMemorialData] = useState({ name: "our beloved" });

  const [family, setFamily] = useState(() => {
    try {
      const saved = localStorage.getItem(`LastPlannerJulz_Family_${dynamicId}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [friends, setFriends] = useState(() => {
    try {
      const saved = localStorage.getItem(`LastPlannerJulz_Friends_${dynamicId}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [showForm, setShowForm] = useState(false);
  const [newPerson, setNewPerson] = useState({ name: "", role: "", quote: "", category: "family" });

  useEffect(() => {
    if (dynamicId) {
      const allMemorials = JSON.parse(localStorage.getItem("LastPlannerJulz_Memorials") || "{}");
      if (allMemorials[dynamicId]) setMemorialData(allMemorials[dynamicId]);
    }
  }, [dynamicId]);

  useEffect(() => {
    if (dynamicId) {
      localStorage.setItem(`LastPlannerJulz_Family_${dynamicId}`, JSON.stringify(family));
      localStorage.setItem(`LastPlannerJulz_Friends_${dynamicId}`, JSON.stringify(friends));
    }
  }, [family, friends, dynamicId]);

  const handleAddPerson = () => {
    if (newPerson.name.trim() && newPerson.role.trim()) {
      const entry = {
        id: Date.now(),
        name: newPerson.name,
        role: newPerson.role,
        quote: newPerson.quote || "Forever remembered and deeply missed."
      };
      if (newPerson.category === "family") setFamily((prev) => [...prev, entry]);
      else setFriends((prev) => [...prev, entry]);

      setNewPerson({ name: "", role: "", quote: "", category: "family" });
      setShowForm(false);
    }
  };

  return (
    <div className="bg-[#F8F6F0] py-12 min-h-screen">
      <div className="site-container max-w-6xl mx-auto">
        <Link 
          to={`/memorial/${dynamicId || ''}`}
          className="inline-flex items-center gap-2 text-sm text-[#A8895C] hover:text-[#1F2E27] uppercase tracking-wider font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Return to Dashboard
        </Link>

        <section className="mb-16 text-center">
          <Users size={48} className="mx-auto mb-4 text-[#A8895C]" />
          <p className="text-sm tracking-[0.28em] uppercase text-[#A8895C] mb-3">Memorial Hub</p>
          <h1 className="text-5xl md:text-6xl font-serif font-semibold text-[#1F2E27] mb-4">Family & Friends</h1>
          <p className="text-lg text-[#3D3530] max-w-3xl mx-auto">
            The people who shared in a life of meaning, love, and lasting connection with {memorialData.name}.
          </p>
          <Button variant="primary" size="lg" className="mt-8 shadow-md hover:-translate-y-1 transition-transform" onClick={() => setShowForm(true)}>
            <Plus size={18} className="inline mr-2" /> Add a Loved One
          </Button>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-serif font-semibold text-[#1F2E27] mb-8">Immediate Family</h2>
          {family.length === 0 ? (
            <div className="p-8 border border-dashed border-[#D8CFBC] rounded-2xl text-[#3D3530] text-center italic bg-white/50">
              No family members added yet. Click "Add a Loved One" to begin.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {family.map((member) => (
                <Card key={member.id} className="hover:border-[#A8895C] transition-colors shadow-sm">
                  <CardBody className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#F8F6F0] border border-[#E8DFD1] flex items-center justify-center flex-shrink-0 mt-1">
                        <Heart size={20} className="text-[#A8895C]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1F2E27] text-lg">{member.name}</h3>
                        <p className="text-sm text-[#A8895C] font-medium">{member.role}</p>
                        <p className="text-xs uppercase tracking-wider text-[#3D3530] mt-1">Primary Family</p>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#F0ECE1]">
                      <p className="font-serif italic text-[#3D3530]">"{member.quote}"</p>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-serif font-semibold text-[#1F2E27] mb-8">Cherished Friends</h2>
          {friends.length === 0 ? (
            <div className="p-8 border border-dashed border-[#D8CFBC] rounded-2xl text-[#3D3530] text-center italic bg-white/50">
              No friends added yet. Click "Add a Loved One" to begin.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {friends.map((friend) => (
                <Card key={friend.id} className="hover:border-[#A8895C] transition-colors shadow-sm">
                  <CardBody className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#F8F6F0] border border-[#E8DFD1] flex items-center justify-center flex-shrink-0 mt-1">
                        <Users size={20} className="text-[#A8895C]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1F2E27] text-lg">{friend.name}</h3>
                        <p className="text-sm text-[#A8895C] font-medium">{friend.role}</p>
                        <p className="text-xs uppercase tracking-wider text-[#3D3530] mt-1">Close Circle</p>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-[#F0ECE1]">
                      <p className="font-serif italic text-[#3D3530]">"{friend.quote}"</p>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </section>

        <div className="rounded-3xl bg-white border border-[#E8DFD1] p-10 mb-12 shadow-sm text-center">
          <h2 className="text-3xl font-serif font-semibold text-[#1F2E27] mb-4">A Community of Love</h2>
          <p className="text-[#3D3530] leading-8 max-w-4xl mx-auto mb-8">
            Every person listed here played a meaningful role in a life that touched many. Their presence, support, and shared memories create a tapestry of connection and care that extends far beyond any single moment.
          </p>
          <Link 
            to={`/memorial/${dynamicId || ''}`}
            className="inline-block border border-[#E8DFD1] text-[#3D3530] px-8 py-3 text-sm tracking-wider font-semibold uppercase rounded hover:border-[#A8895C] hover:text-[#A8895C] transition-colors"
          >
            Return to Memorial Hub
          </Link>
        </div>

        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add to Family & Friends">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1F2E27] mb-2">Category</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={newPerson.category === "family"} onChange={() => setNewPerson({ ...newPerson, category: "family" })} className="text-[#A8895C] focus:ring-[#A8895C]" />
                  <span className="text-[#3D3530] text-sm">Immediate Family</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={newPerson.category === "friend"} onChange={() => setNewPerson({ ...newPerson, category: "friend" })} className="text-[#A8895C] focus:ring-[#A8895C]" />
                  <span className="text-[#3D3530] text-sm">Cherished Friend</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2E27] mb-2">Full Name</label>
              <input type="text" value={newPerson.name} onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })} placeholder="e.g., Sarah Mitchell" className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2E27] mb-2">Relationship / Role</label>
              <input type="text" value={newPerson.role} onChange={(e) => setNewPerson({ ...newPerson, role: e.target.value })} placeholder={newPerson.category === "family" ? "e.g., Granddaughter" : "e.g., Lifelong Friend"} className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2E27] mb-2">A Short Memory or Quote</label>
              <textarea value={newPerson.quote} onChange={(e) => setNewPerson({ ...newPerson, quote: e.target.value })} placeholder="e.g., Her greatest joy and pride." rows={3} className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]" />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="primary" onClick={handleAddPerson} disabled={!newPerson.name || !newPerson.role} className="flex-1 bg-[#1F2E27] hover:bg-[#A8895C] text-white disabled:opacity-50">
                Add to List
              </Button>
              <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}