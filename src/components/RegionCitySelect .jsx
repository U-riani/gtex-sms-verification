import { useState, useRef, useEffect } from "react";

const ReusableSearchSelect = ({ options = [], value = "", onChange }) => {
  const dropdownRef = useRef(null);
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);

  // Sync value from outside (important for reset)
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Filter logic
  const filtered =
    query.trim() === ""
      ? options
      : options.filter((item) =>
          item.toLowerCase().startsWith(query.toLowerCase())
        );

  // Select item
  const handleSelect = (item) => {
    setQuery(item);
    onChange(item);
    setOpen(false);
  };

  // On typing
  const handleInputChange = (val) => {
    const normalized = options.find(
      (item) => item.toLowerCase() === val.toLowerCase()
    );

    if (normalized) {
      setQuery(normalized);
      onChange(normalized);
    } else {
      setQuery(val);
      onChange(""); // invalid
    }

    setOpen(true);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const closeDropdown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input
        type="text"
        className="border px-3 py-2 rounded w-full cursor-pointer"
        placeholder="Select..."
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onClick={() => setOpen(true)}
        required
      />

      {open && (
        <div className="absolute top-full left-0 right-0 bg-white border rounded shadow-lg max-h-60 overflow-y-auto z-50">
          {filtered.length === 0 ? (
            <p className="p-2 text-gray-500 text-sm">No matches...</p>
          ) : (
            filtered.map((item) => (
              <div
                key={item}
                onClick={() => handleSelect(item)}
                className="p-2 cursor-pointer hover:bg-blue-100"
              >
                {item}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ReusableSearchSelect;
