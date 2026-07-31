import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Cropper from "react-easy-crop";
import { 
  User, Shield, AlertTriangle, Camera, Trash2, 
  CheckCircle, Save, CreditCard, BookOpen, X 
} from "lucide-react";

// --- NATIVE CANVAS HELPER TO EXTRACT THE CROPPED IMAGE ---
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg');
  });
};

export default function SettingsPage() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "account" ? "account" : "profile";

  const [profile, setProfile] = useState({ first_name: "", last_name: "", phone: "", profile_picture: "", email: "" });
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false); 
  const [imgError, setImgError] = useState(false);   
  const [message, setMessage] = useState({ type: "", text: "" });

  // --- PRO-GRADE INSTANT PREVIEW STATE ---
  const [localPreview, setLocalPreview] = useState(null);

  // --- CROPPER STATES ---
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProfile({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          profile_picture: data.profile_picture || "",
          email: data.email || ""
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile.");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(profile)
      });
      if (res.ok) showMessage("success", "Profile details saved successfully.");
      else showMessage("error", "Failed to update profile.");
    } catch (err) {
      showMessage("error", "Network error while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (password.length < 6) return showMessage("error", "Password must be at least 6 characters.");
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/user/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        showMessage("success", "Password updated successfully.");
        setPassword("");
      } else showMessage("error", "Failed to update password.");
    } catch (err) {
      showMessage("error", "Network error while updating password.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.addEventListener("load", () => {
        setImageToCrop(reader.result);
      });
    }
    e.target.value = null; 
  };

  const onCropComplete = (croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleUploadCroppedImage = async () => {
    try {
      setUploading(true);
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      
      // PRO-GRADE FIX: Generate instant local preview URL from memory to bypass loading delays
      const instantLocalUrl = URL.createObjectURL(croppedBlob);
      setLocalPreview(instantLocalUrl);
      setImgError(false); 
      setImageToCrop(null); 
      
      const formData = new FormData();
      formData.append("file", croppedBlob, "profile_pic.jpg");

      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      
      if (res.ok) {
        setProfile({ ...profile, profile_picture: data.image_url });
        
        // Pass both the real server URL and the instant local URL to the Navbar
        window.dispatchEvent(new CustomEvent('profilePictureUpdated', { 
          detail: { serverUrl: data.image_url, localUrl: instantLocalUrl } 
        }));
        
        showMessage("success", "Profile picture uploaded! Click 'Save Profile Changes' below to fully apply.");
      } else {
        setLocalPreview(null); // Revert preview on failure
        showMessage("error", data.error || "Failed to upload image.");
      }
    } catch (err) {
      setLocalPreview(null);
      showMessage("error", "Network error. Failed to process image.");
    } finally {
      setUploading(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Are you absolutely sure? This action is permanent and deletes all your data.");
    if (!confirmed) return;
    
    try {
      const res = await fetch(`${API_URL}/api/user/account`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        localStorage.clear();
        window.location.href = "/";
      }
    } catch (err) {
      showMessage("error", "Failed to delete account.");
    }
  };

  // Determine what image source to display in the UI
  const displaySrc = localPreview || (profile.profile_picture ? getImageUrl(profile.profile_picture) : null);

  if (loading) return <div className="min-h-screen bg-[#F8F6F0] p-12 text-center text-[#716860] font-bold uppercase tracking-widest text-sm">Loading data...</div>;

  return (
    <div className="min-h-screen bg-[#F8F6F0] py-12 px-4 sm:px-6 relative">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeSlideUp { animation: fadeSlideUp 0.3s ease-out forwards; }
      `}} />

      {/* --- ENTERPRISE CROP MODAL OVERLAY --- */}
      {imageToCrop && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl animate-fadeSlideUp">
            <div className="p-4 border-b border-[#E8DFD1] flex justify-between items-center bg-[#F8F6F0]">
              <h3 className="font-serif text-[#1F2E27] font-bold text-lg">Crop Profile Photo</h3>
              <button onClick={() => setImageToCrop(null)} className="text-[#716860] hover:text-[#1F2E27]"><X size={20}/></button>
            </div>
            
            <div className="relative w-full h-72 bg-gray-100">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="p-5 flex flex-col gap-4 bg-white border-t border-[#E8DFD1]">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#716860] uppercase tracking-widest">Zoom</span>
                <input 
                  type="range" 
                  value={zoom} 
                  min={1} 
                  max={3} 
                  step={0.1} 
                  onChange={(e) => setZoom(e.target.value)} 
                  className="flex-1 accent-[#A8895C]" 
                />
              </div>
              <button onClick={handleUploadCroppedImage} className="w-full bg-[#1F2E27] text-white px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#A8895C] transition-colors">
                Apply & Upload
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-bold text-sm shadow-sm animate-fadeSlideUp ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {message.text}
          </div>
        )}

        {/* --- PROFILE VIEW --- */}
        {activeTab === 'profile' && (
          <div className="bg-white border border-[#E8DFD1] rounded-2xl p-8 shadow-sm animate-fadeSlideUp">
            
            <div className="flex items-center gap-3 mb-8">
              <User className="text-[#A8895C]" size={24} />
              <h2 className="text-2xl font-serif text-[#1F2E27] font-bold">Profile Details</h2>
            </div>

            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-full bg-[#EFEAE0] border border-[#E8DFD1] overflow-hidden flex items-center justify-center shrink-0 shadow-sm relative">
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 backdrop-blur-[1px]">
                    <div className="w-6 h-6 border-2 border-[#A8895C] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {displaySrc && !imgError ? (
                  <img 
                    src={displaySrc} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                    onError={() => setImgError(true)} 
                  />
                ) : (
                  <span className="text-3xl font-bold text-[#A8895C] uppercase">{profile.first_name?.[0] || profile.email?.[0] || 'U'}</span>
                )}
              </div>
              <div>
                <label className="cursor-pointer inline-flex bg-white border border-[#E8DFD1] px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-[#1F2E27] hover:bg-[#F8F6F0] transition-colors items-center gap-2 shadow-sm mb-2">
                  <Camera size={14} /> {uploading ? "Processing..." : "Change Photo"}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} disabled={uploading} />
                </label>
                <p className="text-[10px] text-[#716860] uppercase tracking-wider font-semibold">JPG, PNG. Max 2MB.</p>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#716860] uppercase tracking-wider mb-2">First Name</label>
                  <input type="text" value={profile.first_name} onChange={(e) => setProfile({...profile, first_name: e.target.value})} className="w-full p-3.5 border border-[#E8DFD1] bg-white rounded-xl focus:border-[#A8895C] transition-colors outline-none font-medium text-[#1F2E27]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#716860] uppercase tracking-wider mb-2">Last Name</label>
                  <input type="text" value={profile.last_name} onChange={(e) => setProfile({...profile, last_name: e.target.value})} className="w-full p-3.5 border border-[#E8DFD1] bg-white rounded-xl focus:border-[#A8895C] transition-colors outline-none font-medium text-[#1F2E27]" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[#716860] uppercase tracking-wider mb-2">Email Address</label>
                <input type="email" value={profile.email} disabled className="w-full p-3.5 border border-[#E8DFD1] bg-[#F8F6F0] text-[#716860] rounded-xl outline-none cursor-not-allowed font-medium" />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#716860] uppercase tracking-wider mb-2">Phone Number</label>
                <input type="tel" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full p-3.5 border border-[#E8DFD1] bg-white rounded-xl focus:border-[#A8895C] transition-colors outline-none font-medium text-[#1F2E27]" />
              </div>

              <div className="pt-2">
                <button disabled={saving || uploading} type="submit" className="w-full flex items-center justify-center gap-2 bg-[#1F2E27] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#A8895C] transition-colors shadow-md disabled:opacity-70">
                  <Save size={16} /> {saving ? "Saving..." : "Save Profile Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- ACCOUNT SETTINGS VIEW --- */}
        {activeTab === 'account' && (
          <div className="space-y-6 animate-fadeSlideUp">
            
            <div className="bg-white border border-[#E8DFD1] rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <Shield className="text-[#A8895C]" size={24} />
                <h2 className="text-2xl font-serif text-[#1F2E27] font-bold">Sign-In & Security</h2>
              </div>
              
              <form onSubmit={handlePasswordSave} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[#716860] uppercase tracking-wider mb-2">New Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full p-3.5 border border-[#E8DFD1] bg-white rounded-xl focus:border-[#A8895C] transition-colors outline-none font-medium" />
                </div>
                
                <div className="pt-2">
                  <button disabled={saving} type="submit" className="w-full flex items-center justify-center gap-2 bg-white border border-[#E8DFD1] text-[#1F2E27] px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#F8F6F0] transition-colors shadow-sm disabled:opacity-70">
                    <Shield size={16} /> Update Password
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-[#DC2626]" size={24} />
                <h2 className="text-2xl font-serif text-[#DC2626] font-bold">Danger Zone</h2>
              </div>
              
              <p className="text-sm text-[#DC2626] mb-6 font-medium leading-relaxed">
                Permanently delete your account and everything you own. You will lose access to all related content and files.
              </p>
              
              <button onClick={handleDeleteAccount} className="w-full flex items-center justify-center gap-2 bg-[#DC2626] text-white px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-red-700 transition-colors shadow-md">
                <Trash2 size={16} /> Delete Account
              </button>
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}