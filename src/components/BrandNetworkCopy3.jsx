import React, { useEffect, useRef, useState } from "react";
import { brandsWithAngle } from "../data/brands";

export default function BrandNetworkCopy3({
  selectedBrands = [],
  onToggleBrand,
  onToggleAll,
}) {
  const PULSE_DELAY = 100;
  const PULSE_DURATION = 100;

  const containerRef = useRef(null);
  const centerRef = useRef(null);
  const brandRefs = useRef([]);
  const organismRef = useRef(null); // new

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const timeRef = useRef(0);
  const rafRef = useRef(null);

  const startBrandPulse = (i) => {
    const el = brandRefs.current[i];
    if (!el) return;
    el.classList.remove("brand-pulse", "pulse-run");
    void el.offsetWidth;
    el.classList.add("brand-pulse", "pulse-run");
    setTimeout(() => el.classList.remove("brand-pulse", "pulse-run"), 800);
  };

  const handleToggleBrand = (index, name) => {
    const isSelecting = !selectedBrands.includes(name);

    centerRef.current?.animate(
      [{ filter: "brightness(1) drop-shadow(0 0 20px rgba(180,180,200,0.4))" },
       { filter: "brightness(1.4) drop-shadow(0 0 50px rgba(180,180,200,0.9))" },
       { filter: "brightness(1) drop-shadow(0 0 20px rgba(180,180,200,0.4))" }],
      { duration: 600, easing: "ease-out" }
    );

    if (isSelecting) setTimeout(() => startBrandPulse(index), PULSE_DELAY);

    setTimeout(() => onToggleBrand(name), PULSE_DELAY + PULSE_DURATION);
  };

  const handleToggleAll = () => {
    centerRef.current?.animate(
      [{ filter: "brightness(1)" }, { filter: "brightness(1.6)" }, { filter: "brightness(1)" }],
      { duration: 800, easing: "ease-out" }
    );
    setTimeout(() => onToggleAll(), PULSE_DELAY + PULSE_DURATION);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(([e]) => {
      setWidth(e.contentRect.width);
      setHeight(e.contentRect.height);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // MAIN ANIMATION LOOP — now controls organism breathing & color
  useEffect(() => {
    if (!width) return;

    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(width, height) / 2 - height * 0.2;

    const animate = () => {
      timeRef.current += 0.012;
      const t = timeRef.current;

      // Organic breathing of the whole organism
      const breathe = 1 + Math.sin(t * 0.8) * 0.04;
      const hueShift = 180 + Math.sin(t * 0.5) * 20;
      const activeCount = selectedBrands.length + 1; // +1 for center
      const intensity = Math.min(activeCount / 4, 1);

      if (organismRef.current) {
        organismRef.current.style.filter = `hue-rotate(${hueShift}deg) brightness(${1 + intensity * 0.3})`;
      }

      // Center
      if (centerRef.current) {
        const s = breathe + Math.sin(t * 1.3) * 0.03;
        centerRef.current.style.transform = `translate(-50%, -50%) scale(${s})`;
      }

      brandsWithAngle.forEach((b, i) => {
        const angle = ((b.angle + Math.sin(t + i * 0.7) * 6) * Math.PI) / 180;
        const r = maxRadius + Math.sin(t * 1.1 + i) * height * 0.04;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const s = breathe + Math.sin(t * 1.6 + i) * 0.05;

        const btn = brandRefs.current[i];
        if (btn) {
          btn.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${s})`;
        }
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height, selectedBrands]);

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-[500px] h-[300px]">
      {width > 0 && (
        <>
          {/* SUPER LIQUID ORGANISM */}
          <svg width={width} height={height} className="absolute inset-0 pointer-events-none overflow-visible">
            <defs>
              <filter id="supergoo" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="blur"/>
                <feColorMatrix
                  in="blur"
                  values="1 0 0 0 0 
                          0 1 0 0 0 
                          0 0 1 0 0 
                          0 0 0 40 -18"
                  result="goo"/>
                <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
              </filter>
            </defs>

            <g ref={organismRef} filter="url(#supergoo)" style={{ transition: "filter 2s ease" }}>
              {/* CENTER */}
              <circle cx={width/2} cy={height/2} r={height * 0.26} fill="#e4e3e9"/>

              {/* ACTIVE BRANDS — perfectly merged */}
              {brandsWithAngle.map((b) => {
                if (!selectedBrands.includes(b.name)) return null;

                const angle = (b.angle * Math.PI) / 180;
                const r = Math.min(width, height) / 2 - height * 0.2;
                const x = width/2 + Math.cos(angle) * r;
                const y = height/2 + Math.sin(angle) * r;

                return (
                  <circle
                    key={b.name}
                    cx={x}
                    cy={y}
                    r={height * 0.18}
                    fill="#e4e3e9"
                  />
                );
              })}
            </g>
          </svg>

          {/* CENTER BUTTON */}
          <button
            ref={centerRef}
            onClick={handleToggleAll}
            className="absolute rounded-full shadow-2xl overflow-hidden bg-gray-200"
            style={{
              width: height * 0.4,
              height: height * 0.4,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 30px rgba(180,180,200,0.5)",
            }}
          >
            <img src="Gtex-logo.png" alt="All" className="w-full h-full object-contain p-4"/>
          </button>

          {/* BRAND BUTTONS */}
          {brandsWithAngle.map((b, i) => {
            const active = selectedBrands.includes(b.name);
            return (
              <button
                key={b.name}
                ref={el => brandRefs.current[i] = el}
                onClick={() => handleToggleBrand(i, b.name)}
                className={`absolute rounded-full shadow-2xl overflow-hidden transition-all duration-500
                  ${active ? "ring-8 ring-white/40" : ""}`}
                style={{
                  width: height * 0.3,
                  height: height * 0.3,
                  left: 0,
                  top: 0,
                  transform: "translate(-50%, -50%)",
                  boxShadow: active 
                    ? "0 0 40px rgba(180,180,200,0.8)" 
                    : "0 0 15px rgba(0,0,0,0.2)",
                }}
              >
                <img src={b.image} alt={b.name} className="w-full h-full object-contain p-3"/>
              </button>
            );
          })}
        </>
      )}
    </div>
  );
}