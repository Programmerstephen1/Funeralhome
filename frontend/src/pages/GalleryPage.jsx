import React, { useState, useEffect } from "react";
import { Image as ImageIcon, ArrowLeft, Upload, Plus } from "lucide-react";
import { Button, Modal } from "../components";

export default function GalleryPage({ dynamicId }) {
  const [memorialData, setMemorialData] = useState({ name: "our beloved" });
  
  // Load persistent gallery photos for this specific memorial
  const [photos, setPhotos] = useState(() => {
    try {
      const saved = localStorage.getItem(`hollowPineGallery_${dynamicId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [newPhoto, setNewPhoto] = useState({ image: null, caption: "", uploader: "" });

  // Fetch the deceased's name
  useEffect(() => {
    if (dynamicId) {
      const allMemorials = JSON.parse(localStorage.getItem("hollowPineMemorials") || "{}");
      if (allMemorials[dynamicId]) {
        setMemorialData(allMemorials[dynamicId]);
      }
    }
  }, [dynamicId]);

  // Save photos automatically whenever the array changes
  useEffect(() => {
    if (dynamicId) {
      localStorage.setItem(`hollowPineGallery_${dynamicId}`, JSON.stringify(photos));
    }
  }, [photos, dynamicId]);

  // Magic function that reads the file from the phone/computer and turns it into a saveable URL
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewPhoto(prev => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file); // Converts image to Base64 string so it can be saved in localStorage
    }
  };

  const handleAddPhoto = () => {
    if (newPhoto.image) {
      setPhotos((prev) => [
        {
          id: Date.now(),
          image: newPhoto.image,
          caption: newPhoto.caption,
          uploader: newPhoto.uploader || "Family Member",
          date: new Date().toLocaleDateString()
        },
        ...prev
      ]);
      setNewPhoto({ image: null, caption: "", uploader: "" });
      setShowForm(false);
    }
  };

  return (
    <div className="bg-[#F8F6F0] py-12 min-h-screen">
      <div className="site-container">
        
        {/* Dynamic Return Button */}
        <a 
          href={`#memorial/${dynamicId || ''}`}
          className="inline-flex items-center gap-2 text-sm text-[#A8895C] hover:text-[#1F2E27] uppercase tracking-wider font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Return to Dashboard
        </a>

        {/* Hero Section */}
        <section className="mb-12 text-center">
          <ImageIcon size={48} className="mx-auto mb-4 text-[#A8895C]" />
          <p className="text-sm tracking-[0.28em] uppercase text-[#A8895C] mb-3">Visual Legacy</p>
          <h1 className="text-5xl md:text-6xl font-serif font-semibold text-[#1F2E27] mb-4">
            Memorial Gallery
          </h1>
          <p className="text-lg text-[#3D3530] max-w-3xl mx-auto">
            A curated collection of photographs celebrating the life and memories of {memorialData.name}.
          </p>
          
          <Button variant="primary" size="lg" className="mt-8 shadow-md hover:-translate-y-1 transition-transform" onClick={() => setShowForm(true)}>
            <Plus size={18} className="inline mr-2" /> Add to Gallery
          </Button>
        </section>

        {/* Dynamic Image Grid */}
        {photos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E8DFD1] border-dashed">
            <ImageIcon size={48} className="mx-auto mb-4 text-[#E8DFD1]" />
            <h3 className="text-xl font-serif text-[#1F2E27] mb-2">The Gallery is empty</h3>
            <p className="text-[#3D3530]">Upload the first photograph to begin the visual tribute.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {photos.map((photo) => (
              <div key={photo.id} className="break-inside-avoid bg-white rounded-xl overflow-hidden shadow-sm border border-[#E8DFD1] group relative hover:shadow-md transition-shadow">
                
                {/* The Uploaded Image */}
                <img src={photo.image} alt="Memorial" className="w-full h-auto object-cover" />
                
                {/* Hover Overlay with Caption & Details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  {photo.caption && <p className="text-white font-serif italic text-lg mb-2">"{photo.caption}"</p>}
                  <div className="flex justify-between items-center text-white/70 text-xs tracking-wider uppercase border-t border-white/20 pt-3">
                    <span>Added by {photo.uploader}</span>
                    <span>{photo.date}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Upload a Photograph">
          <div className="space-y-5">
            
            {/* The Native File Input (Triggers Camera/Library on mobile) */}
            <div>
              <label className="flex text-sm font-medium text-[#1F2E27] mb-2 items-center gap-2">
                <Upload size={16} /> Select Image *
              </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="w-full p-2 border border-[#E8DFD1] rounded bg-[#F8F6F0] text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#1F2E27] file:text-white hover:file:bg-[#A8895C] transition-colors cursor-pointer" 
              />
              {newPhoto.image && <div className="mt-2 text-xs text-green-600 font-semibold">✓ Image selected and ready</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2E27] mb-2">Caption (Optional)</label>
              <input
                type="text"
                value={newPhoto.caption}
                onChange={(e) => setNewPhoto({ ...newPhoto, caption: e.target.value })}
                placeholder="e.g., Summer vacation, 1998"
                className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2E27] mb-2">Added By (Optional)</label>
              <input
                type="text"
                value={newPhoto.uploader}
                onChange={(e) => setNewPhoto({ ...newPhoto, uploader: e.target.value })}
                placeholder="Your name"
                className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="primary" 
                onClick={handleAddPhoto} 
                className="flex-1 bg-[#1F2E27] hover:bg-[#A8895C] text-white disabled:opacity-50"
                disabled={!newPhoto.image}
              >
                Upload to Gallery
              </Button>
              <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

      </div>
    </div>
  );
}