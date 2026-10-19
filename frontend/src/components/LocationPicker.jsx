import React, { useState, useEffect } from "react";
import { MapPin } from "lucide-react";

export default function LocationPicker({ onLocationSelect, id = "venue-location" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ke`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error("Location search is unavailable");
        const data = await response.json();
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        if (error.name !== "AbortError") setResults([]);
      }
    }, 500);

    return () => {
      clearTimeout(delayDebounceFn);
      controller.abort();
    };
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
        id={id}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-controls={`${id}-suggestions`}
        aria-expanded={isOpen && results.length > 0}
        aria-label="Funeral home or venue location"
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
        <ul id={`${id}-suggestions`} role="listbox" className="absolute z-10 w-full mt-1 bg-white border border-[#E8DFD1] shadow-lg max-h-60 overflow-auto rounded-md">
          {results.map((place) => (
            <li
              key={place.place_id}
              role="presentation"
              className="border-b border-[#E8DFD1] last:border-b-0"
            >
              <button type="button" role="option" aria-selected="false" className="w-full p-3 text-left text-sm text-[#3D3530] hover:bg-[#F8F6F0]" onClick={() => handleSelect(place)}>
                {place.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
