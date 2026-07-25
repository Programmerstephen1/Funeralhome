import React, { useState, useEffect } from "react";
import { TreeDeciduous, Camera, User, Plus, X, Quote, ArrowLeft, Lock, HelpCircle, ShieldAlert } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; 
import { Button, Card, CardBody } from "../components";

export default function FamilyTreePage({ dynamicId }) {
  const [memorialData, setMemorialData] = useState(null);
  
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return localStorage.getItem(`LastPlannerJulz_NuclearFamily_${dynamicId}`) === "true";
  });
  const [accessPin, setAccessPin] = useState("");
  const [authError, setAuthError] = useState("");

  // PIN Recovery State
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryAnswerInput, setRecoveryAnswerInput] = useState("");
  const [recoveredPin, setRecoveredPin] = useState(null);

  const [deceasedPhoto, setDeceasedPhoto] = useState(null);
  const [familyMembers, setFamilyMembers] = useState(() => {
    try {
      const saved = localStorage.getItem(`LastPlannerJulz_Tree_${dynamicId}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [announcement, setAnnouncement] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", relationship: "", quote: "", photo: null });

  const navigate = useNavigate();

  useEffect(() => {
    if (dynamicId) {
      const allMemorials = JSON.parse(localStorage.getItem("LastPlannerJulz_Memorials") || "{}");
      if (allMemorials[dynamicId]) {
        setMemorialData(allMemorials[dynamicId]);
        if (allMemorials[dynamicId].portrait) {
          setDeceasedPhoto(allMemorials[dynamicId].portrait);
        }
      }
      localStorage.setItem(`LastPlannerJulz_Tree_${dynamicId}`, JSON.stringify(familyMembers));
    }
  }, [dynamicId, familyMembers]);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (memorialData && accessPin === memorialData.familyTreePin) {
      setIsAuthorized(true);
      setAuthError("");
      localStorage.setItem(`LastPlannerJulz_NuclearFamily_${dynamicId}`, "true");
    } else {
      setAuthError("Incorrect Nuclear Family PIN. Please try again.");
    }
  };

  const handleVerifyRecovery = () => {
    setAuthError("");
    if (memorialData && recoveryAnswerInput.toLowerCase().trim() === memorialData.securityAnswer) {
      setRecoveredPin(memorialData.familyTreePin);
    } else {
      setAuthError("Incorrect security answer. Please try again.");
    }
  };

  const handleMemberPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewMember({ ...newMember, photo: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSaveConnection = (e) => {
    e.preventDefault();
    if (newMember.name !== "" && newMember.relationship !== "" && newMember.quote !== "") {
      const newConnection = { id: Date.now(), ...newMember };
      setFamilyMembers([...familyMembers, newConnection]);
      setAnnouncement("Your tribute has been added to the family tree.");
      setNewMember({ name: "", relationship: "", quote: "", photo: null });
      setIsModalOpen(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="bg-[#F8F6F0] py-12 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#E8DFD1] p-8 text-center animate-fadeIn relative">
          
          <div className="w-16 h-16 bg-[#1F2E27] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            {recoveryMode ? <HelpCircle size={28} className="text-[#A8895C]" /> : <Lock size={28} className="text-[#A8895C]" />}
          </div>
          <h2 className="text-3xl font-serif text-[#1F2E27] mb-2">{recoveryMode ? "Recover Access" : "Restricted Access"}</h2>
          
          {authError !== "" && (
            <div className="mb-4 p-2 bg-red-50 border border-red-100 text-red-700 rounded text-xs flex items-center justify-center gap-1 font-semibold">
              <ShieldAlert size={14} /> {authError}
            </div>
          )}

          {/* Login Mode */}
          {!recoveryMode && (
            <>
              <p className="text-[#716860] mb-8 text-sm leading-relaxed">
                For privacy and closure, the Family Tree module is restricted exclusively to the Nuclear Family. Please enter the specific Family Tree PIN.
              </p>
              <form onSubmit={handleUnlock} className="space-y-4">
                <input 
                  type="password" 
                  placeholder="Enter 4-Digit PIN" 
                  value={accessPin}
                  onChange={(e) => setAccessPin(e.target.value)}
                  className="w-full text-center tracking-[0.5em] text-2xl font-bold py-4 rounded border border-[#E8DFD1] bg-[#F8F6F0] outline-none focus:border-[#A8895C]"
                />
                <button type="submit" className="w-full bg-[#1F2E27] text-white py-4 rounded font-bold uppercase tracking-widest hover:bg-[#A8895C] transition-colors shadow-md">
                  Verify Access
                </button>
                <button type="button" onClick={() => {setRecoveryMode(true); setAuthError("");}} className="text-[10px] uppercase font-bold tracking-widest text-[#A8895C] hover:text-[#1F2E27] transition-colors mt-4 block mx-auto">
                  Forgot Family PIN?
                </button>
              </form>
            </>
          )}

          {/* Recovery Mode */}
          {recoveryMode && !recoveredPin && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-[#F8F6F0] p-4 rounded border border-[#E8DFD1] mb-4">
                <span className="text-[10px] uppercase font-bold text-[#A8895C] block mb-1">Security Question</span>
                <p className="font-serif text-[#1F2E27] text-sm">{memorialData?.securityQuestion || "No question set."}</p>
              </div>
              <input 
                type="text" 
                value={recoveryAnswerInput} 
                onChange={(e) => setRecoveryAnswerInput(e.target.value)} 
                placeholder="Type your answer..." 
                className="w-full p-4 border border-[#E8DFD1] rounded bg-[#F8F6F0] outline-none focus:border-[#A8895C] text-center text-sm" 
              />
              <div className="flex gap-2">
                <button onClick={() => {setRecoveryMode(false); setAuthError("");}} className="flex-1 bg-[#F8F6F0] text-[#3D3530] py-3 rounded font-bold uppercase tracking-widest text-[10px] hover:bg-[#E8DFD1] transition-colors border border-[#E8DFD1]">Back</button>
                <button onClick={handleVerifyRecovery} className="flex-1 bg-[#A8895C] text-white py-3 rounded font-bold uppercase tracking-widest text-[10px] hover:bg-[#1F2E27] transition-colors">Verify</button>
              </div>
            </div>
          )}

          {/* Recovery Success */}
          {recoveryMode && recoveredPin && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-[#1F2E27] p-6 rounded border border-[#1F2E27]">
                <span className="text-[10px] uppercase font-bold text-[#A8895C] block mb-2">Nuclear Family PIN</span>
                <p className="font-mono text-3xl tracking-[0.3em] text-white font-bold">{recoveredPin}</p>
              </div>
              <button onClick={() => {setRecoveryMode(false); setRecoveredPin(null);}} className="w-full border border-[#E8DFD1] text-[#1F2E27] py-3 rounded font-bold uppercase tracking-widest text-xs hover:bg-[#F8F6F0] transition-colors">Return to Login</button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-[#E8DFD1]">
            <Link to={`/memorial/${dynamicId || ''}`} className="text-xs font-bold text-[#A8895C] uppercase tracking-wider hover:text-[#1F2E27]">
              Return to Public Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F6F0] py-12 min-h-screen">
      <div className="site-container max-w-5xl mx-auto px-4">
        
        <Link 
          to={`/memorial/${dynamicId || ''}`}
          className="inline-flex items-center gap-2 text-sm text-[#A8895C] hover:text-[#1F2E27] uppercase tracking-wider font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Return to Dashboard
        </Link>

        <section className="mb-12 text-center">
          <TreeDeciduous size={48} className="mx-auto mb-4 text-[#A8895C]" />
          <p className="text-sm tracking-[0.28em] uppercase text-emerald-700 font-bold mb-3">Nuclear Family Verified</p>
          <h1 className="text-5xl md:text-6xl font-serif font-semibold text-[#1F2E27] mb-4">Family Connections</h1>
          <p className="text-lg text-[#3D3530] max-w-2xl mx-auto">
            A collaborative space honoring the lives touched, the relationships built, and the legacy left behind.
          </p>
        </section>

        <div className="relative w-full max-w-3xl mx-auto mb-16 rounded-2xl overflow-hidden shadow-2xl bg-[#0B0B0A] border border-[#2A2A2A]">
          <img src="/images/family tree background.png" alt="In Loving Memory Frame" className="relative w-full h-auto z-0 pointer-events-none block" onError={(e) => e.target.style.display = 'none'} />
          {deceasedPhoto !== null ? (
            <div className="absolute z-10 overflow-hidden rounded-full shadow-inner" style={{ top: '11.3%', left: '50%', transform: 'translateX(-50%)', width: '40.4%', aspectRatio: '1/1' }}>
              <img src={deceasedPhoto} alt="Deceased" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="absolute z-10 flex items-center justify-center overflow-hidden rounded-full bg-[#1A1A18]" style={{ top: '11.3%', left: '50%', transform: 'translateX(-50%)', width: '40.4%', aspectRatio: '1/1' }}>
              <User size={64} className="text-[#A8895C] opacity-20" />
            </div>
          )}
        </div>

        {announcement !== "" && (
          <div className="mx-auto mb-8 flex max-w-2xl items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700 font-bold">
            {announcement}
          </div>
        )}

        <div className="flex justify-center mb-12">
          <button onClick={() => setIsModalOpen(true)} className="bg-[#1F2E27] text-white px-8 py-4 rounded shadow-xl hover:bg-[#A8895C] hover:-translate-y-1 transition-all flex items-center gap-3 uppercase tracking-widest font-semibold text-sm">
            <Plus size={20} /> Add Your Tribute & Connection
          </button>
        </div>

        {familyMembers.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-[#E8DFD1] rounded-2xl mb-12">
            <TreeDeciduous size={48} className="mx-auto mb-4 text-[#E8DFD1]" />
            <h3 className="text-xl font-serif text-[#1F2E27] mb-2">The Tree is Waiting</h3>
            <p className="text-[#8F847C] max-w-md mx-auto">Be the first to add your name, relationship, and a dedicating verse to the family tree.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {familyMembers.map((member) => (
              <Card key={member.id} className="overflow-hidden border border-[#E8DFD1] bg-white shadow-md relative hover:shadow-lg transition-shadow">
                <CardBody className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 rounded-full bg-[#F8F6F0] border-2 border-[#E8DFD1] flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
                      {member.photo !== null ? <img src={member.photo} className="w-full h-full object-cover" alt={member.name} /> : <User size={32} className="text-[#A8895C] opacity-40" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-serif font-bold text-[#1F2E27] mb-1">{member.name}</h3>
                      <p className="text-xs text-[#A8895C] font-bold tracking-widest uppercase mb-4">{member.relationship}</p>
                      {member.quote !== "" && (
                        <div className="relative bg-[#F8F6F0] p-4 rounded-lg border-l-4 border-[#A8895C]">
                          <Quote size={16} className="text-[#E8DFD1] absolute top-3 right-3" />
                          <p className="text-[#3D3530] italic font-serif text-sm leading-relaxed pr-6">"{member.quote}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center">
          <Button variant="secondary" onClick={() => navigate(`/memorial/${dynamicId || ''}`)}>
            Return to Memorial Hub
          </Button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-8 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E8DFD1]">
            <div className="bg-[#1F2E27] p-5 flex justify-between items-center text-white border-b-4 border-[#A8895C]">
              <h3 className="font-serif text-xl tracking-wide">Add Your Connection</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:text-[#A8895C] transition-colors p-1"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveConnection} className="p-6 space-y-6">
              <div className="flex justify-center">
                <div className="relative w-24 h-24 rounded-full bg-[#F8F6F0] border-2 border-[#E8DFD1] flex items-center justify-center overflow-hidden shadow-inner group">
                  {newMember.photo !== null ? <img src={newMember.photo} className="w-full h-full object-cover" alt="Preview" /> : <User size={32} className="text-[#A8895C] opacity-40" />}
                  <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera size={20} className="text-white" />
                    <input type="file" accept="image/*" onChange={handleMemberPhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>
              <p className="text-center text-xs text-[#8F847C] uppercase tracking-wider">Upload Profile Photo</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2E27] uppercase tracking-wider mb-1">Your Full Name</label>
                  <input type="text" required value={newMember.name} onChange={(e) => setNewMember({...newMember, name: e.target.value})} className="w-full p-3 border border-[#E8DFD1] rounded bg-[#F8F6F0] focus:bg-white focus:border-[#A8895C] outline-none transition-colors" placeholder="e.g. Jane Doe" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1F2E27] uppercase tracking-wider mb-1">Relationship to Deceased</label>
                  <input type="text" required value={newMember.relationship} onChange={(e) => setNewMember({...newMember, relationship: e.target.value})} className="w-full p-3 border border-[#E8DFD1] rounded bg-[#F8F6F0] focus:bg-white focus:border-[#A8895C] outline-none transition-colors" placeholder="e.g. Daughter, Best Friend, Brother" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1F2E27] uppercase tracking-wider mb-1">Bible Verse or Tribute Quote</label>
                  <textarea required rows="3" value={newMember.quote} onChange={(e) => setNewMember({...newMember, quote: e.target.value})} className="w-full p-3 border border-[#E8DFD1] rounded bg-[#F8F6F0] focus:bg-white focus:border-[#A8895C] outline-none transition-colors resize-none italic font-serif" placeholder="e.g. 'Blessed are those who mourn, for they shall be comforted.' - Matthew 5:4" />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#A8895C] text-white py-4 rounded font-bold uppercase tracking-widest hover:bg-[#8F744D] transition-colors shadow-lg hover:-translate-y-1">
                Save to Family Tree
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}