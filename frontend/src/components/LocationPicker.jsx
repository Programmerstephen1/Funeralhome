import React, { useState, useEffect } from "react";
import { MapPin } from "lucide-react";

export default function LocationPicker({ onLocationSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        // Free OpenStreetMap API, restricted to Kenya
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ke`
        );
        const data = await response.json();
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (place) => {
    setQuery(place.display_name);
    setIsOpen(false);
    onLocationSelect(place.display_name);
  };

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-3.5 text-[#A8895C]" size={16} />
      <input
        type="text"
        className="w-full pl-10 p-3 border border-[#E8DFD1] bg-[#F8F6F0]"
        placeholder="Search for a town or venue (e.g., Langata)"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          // NEW: This ensures that even if they don't click the dropdown, 
          // the typed text is saved and clears the checkout error!
          onLocationSelect(e.target.value); 
        }}
      />
      
      {isOpen && results.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-[#E8DFD1] shadow-lg max-h-60 overflow-auto rounded-md">
          {results.map((place) => (
            <li
              key={place.place_id}
              className="p-3 hover:bg-[#F8F6F0] cursor-pointer text-sm text-[#3D3530] border-b border-[#E8DFD1] last:border-b-0"
              onClick={() => handleSelect(place)}
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}