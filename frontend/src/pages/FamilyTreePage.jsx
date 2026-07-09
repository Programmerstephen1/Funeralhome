import React, { useState, useEffect } from "react";
import { TreeDeciduous, Camera, User, Plus, X, Quote } from "lucide-react";
import { Button, Card, CardBody } from "../components";

export default function FamilyTreePage({ dynamicId }) {
  // 1. Synchronized Deceased Photo
  const [deceasedPhoto, setDeceasedPhoto] = useState(null);

  // 2. Dynamic Family Members State (Starts Empty!)
  const [familyMembers, setFamilyMembers] = useState([]);
  const [announcement, setAnnouncement] = useState("");
  
  // 3. Modal State for adding a new relative
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    relationship: "",
    quote: "",
    photo: null
  });

  // Fetch the deceased photo from the exact same storage as the Memorial Wall
  useEffect(() => {
    // Robustly grab the family ID from the prop or the URL
    const currentHash = window.location.hash;
    const hashParts = currentHash.split('/');
    const familyId = dynamicId || (hashParts.length > 1 ? hashParts[1] : null);
    
    if (familyId) {
      // Look inside the exact same ledger the Memorial Wall uses
      const allMemorials = JSON.parse(localStorage.getItem("LastPlannerJulz_Memorials") || "{}");
      
      // If the family exists and has a portrait, set it!
      if (allMemorials[familyId] && allMemorials[familyId].portrait) {
        setDeceasedPhoto(allMemorials[familyId].portrait);
      }
    }
  }, [dynamicId]);

  // Handle Image Upload inside the Modal
  const handleMemberPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMember({ ...newMember, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Save the new family member connection
  const handleSaveConnection = (e) => {
    e.preventDefault();
    
    const newConnection = {
      id: Date.now(), // Temporary ID until database is connected
      ...newMember
    };

    // Update the UI instantly
    setFamilyMembers([...familyMembers, newConnection]);
    setAnnouncement("Your tribute has been added to the family tree.");
    
    // --- DATABASE INTEGRATION POINT ---
    // Here is where you will send the data to your Flask/Neon backend so it sticks for everyone
    
    // Reset and close modal
    setNewMember({ name: "", relationship: "", quote: "", photo: null });
    setIsModalOpen(false);
  };

  return (
    <div className="bg-[#F8F6F0] py-12 min-h-screen">
      <div className="site-container max-w-5xl mx-auto px-4">
        
        {/* --- PAGE HEADER --- */}
        <section className="mb-12 text-center">
          <TreeDeciduous size={48} className="mx-auto mb-4 text-[#A8895C]" />
          <p className="text-sm tracking-[0.28em] uppercase text-[#A8895C] mb-3">Memorial Hub</p>
          <h1 className="text-5xl md:text-6xl font-serif font-semibold text-[#1F2E27] mb-4">Family Connections</h1>
          <p className="text-lg text-[#3D3530] max-w-2xl mx-auto">
            A collaborative space honoring the lives touched, the relationships built, and the legacy left behind.
          </p>
        </section>

        {/* --- SYNCHRONIZED "IN LOVING MEMORY" HERO FRAME --- */}
        <div className="relative w-full max-w-3xl mx-auto mb-16 rounded-2xl overflow-hidden shadow-2xl bg-[#0B0B0A] aspect-[4/3] sm:aspect-video flex items-center justify-center border border-[#2A2A2A]">
          
          {/* Layer 1: The Custom Graphic Frame (Sits in the background) */}
          <img 
            src="/images/family tree background.png" 
            alt="In Loving Memory Frame" 
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" 
            onError={(e) => e.target.style.display = 'none'} 
          />

          {/* Layer 2: The Main Deceased Photo (Nudged UP to 8.2% to cover the top checkerboard gap) */}
          {deceasedPhoto ? (
            <div 
              className="absolute z-10 overflow-hidden rounded-full shadow-inner"
              style={{
                top: '8.2%',          // Decreased from 9.5% to slide the circle HIGHER
                left: '50%', 
                transform: 'translateX(-50%)',
                width: '43.5%',       // Keeps your perfectly refined width diameter
                aspectRatio: '1/1'
              }}
            >
              <img 
                src={deceasedPhoto} 
                alt="Deceased" 
                className="w-full h-full object-cover" 
              />
            </div>
          ) : (
            <div 
              className="absolute z-10 flex items-center justify-center overflow-hidden rounded-full bg-[#1A1A18]"
              style={{ 
                top: '8.2%',          // Decreased from 9.5% to slide the circle HIGHER
                left: '50%', 
                transform: 'translateX(-50%)', 
                width: '43.5%', 
                aspectRatio: '1/1' 
              }}
            >
              <User size={64} className="text-[#A8895C] opacity-20" />
            </div>
          )}
        </div>

        {announcement && (
          <div className="mx-auto mb-8 flex max-w-2xl items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            {announcement}
          </div>
        )}

        {/* --- ADD CONNECTION BUTTON --- */}
        <div className="flex justify-center mb-12">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1F2E27] text-white px-8 py-4 rounded shadow-xl hover:bg-[#A8895C] transition-all flex items-center gap-3 uppercase tracking-widest font-semibold text-sm"
          >
            <Plus size={20} /> Add Your Tribute & Connection
          </button>
        </div>

        {/* --- DYNAMIC COLLABORATIVE GRID --- */}
        {familyMembers.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-[#E8DFD1] rounded-2xl mb-12">
            <TreeDeciduous size={48} className="mx-auto mb-4 text-[#E8DFD1]" />
            <h3 className="text-xl font-serif text-[#1F2E27] mb-2">The Tree is Waiting</h3>
            <p className="text-[#8F847C] max-w-md mx-auto">
              Be the first to add your name, relationship, and a dedicating verse to the family tree.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {familyMembers.map((member) => (
              <Card key={member.id} className="overflow-hidden border border-[#E8DFD1] bg-white shadow-md relative">
                <CardBody className="p-8">
                  <div className="flex items-start gap-6">
                    {/* Uploaded Relative Photo */}
                    <div className="w-20 h-20 rounded-full bg-[#F8F6F0] border-2 border-[#E8DFD1] flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
                      {member.photo ? (
                        <img src={member.photo} className="w-full h-full object-cover" alt={member.name} />
                      ) : (
                        <User size={32} className="text-[#A8895C] opacity-40" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-2xl font-serif font-bold text-[#1F2E27] mb-1">{member.name}</h3>
                      <p className="text-xs text-[#A8895C] font-bold tracking-widest uppercase mb-4">{member.relationship}</p>
                      
                      {/* Bible Verse / Quote Section */}
                      {member.quote && (
                        <div className="relative bg-[#F8F6F0] p-4 rounded border-l-4 border-[#A8895C]">
                          <Quote size={16} className="text-[#E8DFD1] absolute top-3 right-3" />
                          <p className="text-[#3D3530] italic font-serif text-sm leading-relaxed pr-6">
                            "{member.quote}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* --- FOOTER BUTTON --- */}
        <div className="text-center">
          <Button 
            variant="secondary" 
            onClick={() => {
              const currentHash = window.location.hash;
              const familyId = currentHash.split('/')[1];
              window.location.hash = familyId ? `#memorial/${familyId}` : "#memorial";
            }}
          >
            Return to Memorial Hub
          </Button>
        </div>
        
      </div>

      {/* --- ADD CONNECTION MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-8 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E8DFD1]">
            
            <div className="bg-[#1F2E27] p-5 flex justify-between items-center text-white border-b-4 border-[#A8895C]">
              <h3 className="font-serif text-xl tracking-wide">Add Your Connection</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:text-[#A8895C] transition-colors p-1">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveConnection} className="p-6 space-y-6">
              
              {/* Photo Upload */}
              <div className="flex justify-center">
                <div className="relative w-24 h-24 rounded-full bg-[#F8F6F0] border-2 border-[#E8DFD1] flex items-center justify-center overflow-hidden shadow-inner group">
                  {newMember.photo ? (
                    <img src={newMember.photo} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <User size={32} className="text-[#A8895C] opacity-40" />
                  )}
                  <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera size={20} className="text-white" />
                    <input type="file" accept="image/*" onChange={handleMemberPhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>
              <p className="text-center text-xs text-[#8F847C] uppercase tracking-wider">Upload Profile Photo</p>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2E27] uppercase tracking-wider mb-1">Your Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    className="w-full p-3 border border-[#E8DFD1] rounded bg-[#F8F6F0] focus:bg-white focus:border-[#A8895C] outline-none transition-colors"
                    placeholder="e.g. Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1F2E27] uppercase tracking-wider mb-1">Relationship to Deceased</label>
                  <input 
                    type="text" 
                    required
                    value={newMember.relationship}
                    onChange={(e) => setNewMember({...newMember, relationship: e.target.value})}
                    className="w-full p-3 border border-[#E8DFD1] rounded bg-[#F8F6F0] focus:bg-white focus:border-[#A8895C] outline-none transition-colors"
                    placeholder="e.g. Daughter, Best Friend, Brother"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1F2E27] uppercase tracking-wider mb-1">Bible Verse or Tribute Quote</label>
                  <textarea 
                    required
                    rows="3"
                    value={newMember.quote}
                    onChange={(e) => setNewMember({...newMember, quote: e.target.value})}
                    className="w-full p-3 border border-[#E8DFD1] rounded bg-[#F8F6F0] focus:bg-white focus:border-[#A8895C] outline-none transition-colors resize-none italic font-serif"
                    placeholder="e.g. 'Blessed are those who mourn, for they shall be comforted.' - Matthew 5:4"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#A8895C] text-white py-4 rounded font-bold uppercase tracking-widest hover:bg-[#8F744D] transition-colors shadow-lg"
              >
                Save to Family Tree
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}