import React, { useEffect, useRef, useState } from "react";
import { brandsWithAngle } from "../data/brands";

export default function BrandNetworkCopy2({
  selectedBrands = [],
  onToggleBrand,
  onToggleAll,
}) {
  const PULSE_DELAY = 100; // 0.2s
  const PULSE_DURATION = 100; // matches CSS animation
  const WAVE_STEP = 60;

  const containerRef = useRef(null);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);
  const [pulseTarget, setPulseTarget] = useState(null);
  // null | "all" | brandIndex

  const timeRef = useRef(0);
  const rafRef = useRef(null);
  const ropeFrameRef = useRef(0);

  const brandRefs = useRef([]);
  const pathRefs = useRef([]);
  const centerRef = useRef(null);

  const startBrandPulse = (i) => {
    const el = brandRefs.current[i];
    if (!el) return;

    // FULL reset
    el.classList.remove("brand-pulse", "pulse-run");
    void el.offsetWidth;

    // create animation
    el.classList.add("brand-pulse");

    // start it
    el.classList.add("pulse-run");

    // cleanup
    setTimeout(() => {
      el.classList.remove("brand-pulse", "pulse-run");
    }, 650);
  };

  const handleToggleBrand = (index, name) => {
    const isSelecting = !selectedBrands.includes(name);

    // center pulse always (feels responsive)
    centerRef.current?.animate(
      [
        { boxShadow: "0 0 0 rgba(4,0,55,0)" },
        { boxShadow: "0 0 18px rgba(4,0,55,0.6)" },
        { boxShadow: "0 0 0 rgba(4,0,55,0)" },
      ],
      { duration: 350, easing: "ease-out" }
    );

    if (isSelecting) {
      // ✅ SELECT → rope + brand pulse
      setPulseTarget(index);
      setPulseKey((k) => k + 1);

      setTimeout(() => {
        startBrandPulse(index);
      }, PULSE_DELAY);
    } else {
      // ❌ UNSELECT → no rope pulse
      setPulseTarget(null);
    }

    // state update AFTER visuals
    setTimeout(() => {
      onToggleBrand(name);
    }, PULSE_DELAY + PULSE_DURATION);
  };

  const handleToggleAll = () => {
    const isSelectingAll = selectedBrands.length !== brandsWithAngle.length;

    // center pulse always
    centerRef.current?.animate(
      [
        { boxShadow: "0 0 0 rgba(4,0,55,0)" },
        { boxShadow: "0 0 40px rgba(4,0,55,0.9)" },
        { boxShadow: "0 0 0 rgba(4,0,55,0)" },
      ],
      { duration: 500, easing: "ease-out" }
    );

    if (isSelectingAll) {
      // ✅ SELECT ALL → animate ropes + pulses
      setPulseTarget("all");
      setPulseKey((k) => k + 1);

      brandsWithAngle.forEach((_, i) => {
        setTimeout(() => {
          startBrandPulse(i);
        }, PULSE_DELAY + i * WAVE_STEP);
      });
    } else {
      // ❌ UNSELECT ALL → kill rope animation
      setPulseTarget(null);
    }

    // state update AFTER visuals
    setTimeout(() => {
      onToggleAll();
    }, PULSE_DELAY + PULSE_DURATION);
  };

  useEffect(() => {
    if (!pulseTarget) return;

    pathRefs.current.forEach((path, i) => {
      if (!path) return;

      const shouldPulse = pulseTarget === "all" || pulseTarget === i;
      if (!shouldPulse) return;

      const length = path.getTotalLength();

      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;

      // Force layout so browser registers dash reset
      path.getBoundingClientRect();

      path.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], {
        duration: 350,
        easing: "ease-out",
        fill: "forwards",
      });
    });
  }, [pulseKey]);

  // --------- MEASURE CONTAINER ---------
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setWidth(width);
      setHeight(height);
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // --------- ANIMATION LOOP ---------
  useEffect(() => {
    if (!width) return;
    const brandSize = height * 0.25; // Same as button size
    const maxRadius = Math.min(width, height) / 2 - brandSize / 2;

    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = maxRadius;

    const animate = () => {
      timeRef.current += 0.015;
      const t = timeRef.current;

      // Center pulse
      if (centerRef.current) {
        const centerScale = 1 + Math.sin(t * 1.2) * 0.06;
        centerRef.current.style.transform = `
          translate(-50%, -50%) scale(${centerScale})
        `;
      }

      brandsWithAngle.forEach((b, i) => {
        const angle = ((b.angle + Math.sin(t + i) * 4) * Math.PI) / 180;
        const radius = Math.min(
          baseRadius + Math.sin(t * 1.2 + i) * height * 0.02,
          maxRadius
        );

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        // Brand scale
        const scale = 1 + Math.sin(t * 1.5 + i) * 0.06;

        const btn = brandRefs.current[i];
        if (btn) {
          btn.style.transform = `
            translate(-50%, -50%)
            translate(${x}px, ${y}px)
            scale(${scale})
          `;
        }

        // Rope (throttled)
        if (ropeFrameRef.current % 2 === 0) {
          const dx = x - centerX;
          const dy = y - centerY;
          const len = Math.hypot(dx, dy) || 1;

          const midX = (centerX + x) / 2;
          const midY = (centerY + y) / 2;

          const cx = midX - (dy / len) * width * 0.025;
          const cy = midY + (dx / len) * width * 0.025;

          const path = pathRefs.current[i];
          if (path) {
            path.setAttribute(
              "d",
              `M ${centerX} ${centerY} Q ${cx} ${cy} ${x} ${y}`
            );
          }
        }
      });

      ropeFrameRef.current++;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height]);

  const allSelected =
    selectedBrands.length === brandsWithAngle.length &&
    brandsWithAngle.every((b) => selectedBrands.includes(b.name));

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[500px] mx-auto relative h-[300px]"
    >
      {width > 0 && (
        <>
          <svg
            width={width}
            height={height}
            className="absolute inset-0 pointer-events-none"
          >
            {brandsWithAngle.map((_, i) => {
              const shouldPulse = pulseTarget === "all" || pulseTarget === i;
              const brandName = brandsWithAngle[i].name;
              const isActive = selectedBrands.includes(brandName);

              return (
                <path
                  key={i}
                  ref={(el) => (pathRefs.current[i] = el)}
                  stroke="#040037"
                  strokeWidth="2"
                  fill="none"
                  style={{
                    opacity: isActive ? 1 : 0,
                  }}
                  className={shouldPulse && isActive ? "rope-glow" : ""}
                />
              );
            })}
          </svg>

          {/* CENTER */}
          <button
            ref={centerRef}
            onClick={handleToggleAll}
            type="button"
            className={`absolute flex items-center justify-center
  rounded-full text-center leading-tight px-2 shadow-md
  transition-colors duration-200 cursor-pointer
  
  ${allSelected ? "bg-[#040037] text-white" : "bg-gray-200 text-gray-800"}`}
            style={{
              width: height * 0.4,
              height: height * 0.4,
              left: width / 2,
              top: height / 2,
              transform: "translate(-50%, -50%)",
              willChange: "transform",
            }}
          >
            {/* <span className={allSelected ? "text-white" : "text-red-600"}>
              G
            </span>
            tex */}
            <img src="Gtex-logo.png" alt="All Brands" className="w-full object-cover" />
          </button>

          {/* BRANDS */}
          {brandsWithAngle.map((b, i) => {
            const active = selectedBrands.includes(b.name);

            return (
              <button
                type="button"
                key={b.name}
                ref={(el) => (brandRefs.current[i] = el)}
                onClick={() => handleToggleBrand(i, b.name)}
                className={`absolute flex items-center justify-center
  rounded-full text-center leading-tight px-1 shadow-md
  transition-colors duration-200 cursor-pointer
  ${active ? "brand-active" : "brand-inactive"}

`}
                style={{
                  width: height * 0.3,
                  height: height * 0.3,
                  fontSize: Math.max(width * 0.025, 9),
                  left: 0,
                  top: 0,
                  transform: "translate(-50%, -50%)",
                  willChange: "transform",
                  "--index": i, // For wave effect delay
                }}
              >
                <img src={b.image} alt={b.name} className="w-full object-cover" />
                {/* {b.name} */}
              </button>
            );
          })}
        </>
      )}
    </div>
  );
}
