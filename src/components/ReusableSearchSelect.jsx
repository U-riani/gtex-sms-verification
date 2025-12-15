import { useState, useRef, useEffect } from "react";

const ReusableSearchSelect = ({
  options = [],
  value = "",
  onChange,
  forElement,
}) => {
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
          item.label.toLowerCase().startsWith(query.toLowerCase())
        );

  // Select item
  const handleSelect = (item) => {
    setQuery(item.label);
    onChange(item.id); // return ID
    setOpen(false);
  };

  // On typing
  const handleInputChange = (val) => {
    setQuery(val);

    const match = options.find(
      (item) => item.label.toLowerCase() === val.toLowerCase()
    );

    if (match) {
      onChange(match.id);
    } else {
      onChange(null);
    }

    setOpen(true);

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
        id={forElement}
        name={forElement}
        type="text"
        className="border px-3 py-2 rounded border-gray-400 w-full cursor-pointer "
        placeholder="Select..."
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onClick={() => setOpen(true)}
      />

      {open && (
        <div className="absolute top-full left-0 right-0 bg-white border rounded shadow-lg max-h-60 overflow-y-auto z-50">
          {filtered.length === 0 ? (
            <p className="p-2 text-gray-500 text-sm">No matches...</p>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className="p-2 cursor-pointer hover:bg-blue-100"
              >
                {item.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ReusableSearchSelect;
