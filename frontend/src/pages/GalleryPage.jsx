import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  ArrowLeft,
  Upload,
  Plus,
  Lock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button, Modal } from "../components";
import { getApiBaseUrl } from "../services/config";

export default function GalleryPage({ dynamicId }) {
  const [memorialData, setMemorialData] = useState({ name: "our beloved" });

  const [photos, setPhotos] = useState(() => {
    try {
      const saved = localStorage.getItem(
        `LastPlannerJulz_Gallery_${dynamicId}`,
      );
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isUnlocked, setIsUnlocked] = useState(() => {
    return (
      localStorage.getItem(`LastPlannerJulz_GalleryUnlocked_${dynamicId}`) ===
      "true"
    );
  });

  const [showForm, setShowForm] = useState(false);
  const [newPhoto, setNewPhoto] = useState({
    image: null,
    caption: "",
    uploader: "",
  });

  const API_URL = getApiBaseUrl();

  useEffect(() => {
    if (dynamicId) {
      const allMemorials = JSON.parse(
        localStorage.getItem("LastPlannerJulz_Memorials") || "{}",
      );
      if (allMemorials[dynamicId]) setMemorialData(allMemorials[dynamicId]);
    }
  }, [dynamicId]);

  useEffect(() => {
    if (dynamicId) {
      localStorage.setItem(
        `LastPlannerJulz_Gallery_${dynamicId}`,
        JSON.stringify(photos),
      );
    }
  }, [photos, dynamicId]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setNewPhoto((prev) => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhoto = () => {
    if (newPhoto.image !== null) {
      setPhotos((prev) => [
        {
          id: Date.now(),
          image: newPhoto.image,
          caption: newPhoto.caption,
          uploader:
            newPhoto.uploader === "" ? "Family Member" : newPhoto.uploader,
          date: new Date().toLocaleDateString(),
        },
        ...prev,
      ]);
      setNewPhoto({ image: null, caption: "", uploader: "" });
      setShowForm(false);
    }
  };

  return (
    <div className="bg-[#F8F6F0] py-12 min-h-screen">
      <div className="site-container">
        <Link
          to={`/memorial/${dynamicId || ""}`}
          className="inline-flex items-center gap-2 text-sm text-[#805400] hover:text-[#1F2E27] uppercase tracking-wider font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Return to Dashboard
        </Link>

        <section className="mb-12 text-center">
          <ImageIcon size={48} className="mx-auto mb-4 text-[#805400]" />
          <p className="text-sm tracking-[0.28em] uppercase text-[#805400] mb-3">
            Visual Legacy
          </p>
          <h1 className="text-5xl md:text-6xl font-serif font-semibold text-[#1F2E27] mb-4">
            Memorial Gallery
          </h1>
          <p className="text-lg text-[#3D3530] max-w-3xl mx-auto">
            A curated collection of photographs celebrating the life and
            memories of {memorialData.name}.
          </p>
          <Button
            variant="primary"
            size="lg"
            className="mt-8 shadow-md hover:-translate-y-1 transition-transform"
            onClick={() => setShowForm(true)}
          >
            <Plus size={18} className="inline mr-2" /> Add to Gallery
          </Button>
        </section>

        {photos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E8DFD1] border-dashed">
            <ImageIcon size={48} className="mx-auto mb-4 text-[#E8DFD1]" />
            <h2 className="text-xl font-serif text-[#1F2E27] mb-2">
              The Gallery is empty
            </h2>
            <p className="text-[#3D3530]">
              Upload the first photograph to begin the visual tribute.
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="break-inside-avoid bg-white rounded-xl overflow-hidden shadow-sm border border-[#E8DFD1] group relative hover:shadow-xl transition-shadow cursor-pointer"
              >
                <img
                  src={photo.image}
                  alt={photo.alt_text || photo.caption || "Photo shared in this memorial gallery"}
                  loading="lazy"
                  width="1200"
                  height="900"
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  {photo.caption !== "" && (
                    <p className="text-white font-serif italic text-lg mb-2">
                      "{photo.caption}"
                    </p>
                  )}
                  <div className="flex justify-between items-center text-white/70 text-xs tracking-wider uppercase border-t border-white/20 pt-3">
                    <span>Added by {photo.uploader}</span>
                    <span>{photo.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title={isUnlocked ? "Upload a Photograph" : "Unlock Gallery Storage"}
        >
          {isUnlocked ? (
            <div className="space-y-5">
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
                {newPhoto.image && (
                  <div className="mt-2 text-xs text-green-600 font-semibold">
                    ✓ Image selected and ready
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2E27] mb-2">
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  value={newPhoto.caption}
                  onChange={(e) =>
                    setNewPhoto({ ...newPhoto, caption: e.target.value })
                  }
                  placeholder="e.g., Summer vacation, 1998"
                  className="w-full px-3 py-2 border border-[#E8DFD1] rounded-lg focus:outline-none focus:border-[#A8895C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2E27] mb-2">
                  Added By (Optional)
                </label>
                <input
                  type="text"
                  value={newPhoto.uploader}
                  onChange={(e) =>
                    setNewPhoto({ ...newPhoto, uploader: e.target.value })
                  }
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
                <Button
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-[#F8F6F0] border border-[#E8DFD1] rounded-lg p-6 text-center">
                <Lock size={48} className="mx-auto mb-4 text-[#805400]" />
                <h2 className="text-xl font-serif text-[#1F2E27] mb-2">
                  Add photos to this device
                </h2>
                <p className="text-sm text-[#716860] mb-4">
                  This version stores gallery photos only in this browser. They
                  are not uploaded, shared with family, or backed up. Contact us
                  to arrange a shared gallery before adding private photographs.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUnlocked(true)}
                  className="flex-1 bg-[#1F2E27] text-white py-4 rounded font-bold uppercase tracking-widest hover:bg-[#A8895C] shadow-md flex items-center justify-center gap-2 transition-colors"
                >
                  <Lock size={18} /> Continue to local upload
                </button>
              </div>
              <a
                href="tel:+254799847727"
                className="block text-center text-sm font-semibold text-[#1F2E27] underline underline-offset-2"
              >
                Call to ask about a shared gallery
              </a>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
