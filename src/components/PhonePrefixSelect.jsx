import { useState } from "react";
import { phonePrefixes } from "../data/phoneNumberPrefixes";

const PhonePrefixSelect = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const selected = phonePrefixes.find((p) => p.code === value);

  return (
    <div className="relative w-32 overflox-y-auto">
      {/* Selected */}
      <div
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 border px-2 py-1 rounded cursor-pointer bg-white"
      >
        <img
          className="w-5"
          src={`https://flagcdn.com/w20/${selected.country.toLocaleLowerCase()}.png`}
        />{" "}
        <span>{selected.country}</span>
        <span>{selected.code}</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 w-full bg-white border rounded shadow z-50">
          <div className="relative h-50 overflow-y-auto">
            {phonePrefixes.map((p) => (
              <div
                key={`${p.country}-${p.code}`}
                onClick={() => {
                  onChange(p.code);
                  setOpen(false);
                }}
                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 cursor-pointer"
              >
                <img
                  className="w-5"
                  src={`https://flagcdn.com/w20/${p.country.toLocaleLowerCase()}.png`}
                />
                <span>{p.country}</span>
                <span>{p.code}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhonePrefixSelect;
