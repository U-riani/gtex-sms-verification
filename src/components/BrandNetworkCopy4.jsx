import React, { useEffect, useRef, useState } from "react";
import { brandsWithAngle } from "../data/brands";

export default function BrandNetwork({
  selectedBrands = [],
  onToggleBrand,
  onToggleAll,
}) {
  const PULSE_DELAY = 100; // 0.2s
  const PULSE_DURATION = 100; // matches CSS animation
  const WAVE_STEP = 60;
  const CONTAINER_WIDTH = 500; // matches your max-w-[500px]
  const CONTAINER_HEIGHT = 300; // matches your fixed h-[300px]
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
        const scale = 1 + Math.sin(t * 1.5 + i) * 0.1;

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
      className="w-full max-w-[500px] mx-auto relative h-[300px] "
      style={{
        background: `
    radial-gradient(circle at center,
      rgba(230, 220, 255, 0.4) 0%,
      rgba(210, 200, 255, 0.41) 10%,
      rgba(232, 232, 245, 0.62) 20%,
      transparent 100%
    )
  `,
      }}
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
                  stroke="rgba(255, 255, 255, 0.53)" /* Soft light purple line */
                  strokeWidth={isActive ? "3.5" : "2.5"}
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
          {/* CENTER */}
          {/* CENTER */}
          <button
            type="button"
            ref={centerRef}
            onClick={handleToggleAll}
            className={`absolute flex items-center justify-center rounded-full overflow-hidden transition-all duration-500 cursor-pointer ${
              allSelected
                ? "transform translate-x-2 translate-y-2 scale-110 z-10"
                : ""
            }`}
            style={{
              width: height * 0.4,
              height: height * 0.4,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              willChange: "transform",
              background: `${
                allSelected
                  ? "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 1) 0%, transparent 50%),rgba(191, 206, 255, 0.33)"
                  : "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.76) 0%, transparent 50%),rgba(104, 220, 255, 0.03)"
              }
    `,

              border: "1px solid rgba(255, 255, 255, 1)",
              boxShadow: `
      inset 0 4px 12px rgba(255, 255, 255, 1),
      inset 0 -4px 8px rgba(255, 255, 255, 1),
      0 0 40px rgba(180, 180, 240, ${allSelected ? 0.8 : 0.5})
    `,
            }}
          >
            <img
              src="Gtex-logo.png"
              alt="All Brands"
              className="w-full h-full object-contain p-6 "
            />
          </button>
          {/* BRANDS */}
          {/* BRANDS */}
          {brandsWithAngle.map((b, i) => {
            const active = selectedBrands.includes(b.name);

            return (
              <button
                type="button"
                key={b.name}
                ref={(el) => (brandRefs.current[i] = el)}
                onClick={() => handleToggleBrand(i, b.name)}
                className={`absolute flex items-center justify-center px-1 rounded-full shadow-2xl  border border-white/30 transition-all duration-400 cursor-pointer 
                  ${active ? "ring-8 ring-purple/40" : ""}`}
                style={{
                  width: height * 0.3,
                  height: height * 0.3,
                  fontSize: Math.max(width * 0.025, 9),
                  left: 0,
                  top: 0,
                  transform: "translate(-50%, -50%)",
                  willChange: "transform",
                  "--index": i,
                  background: active
                    ? "rgba(190, 190, 255, 0.01)"
                    : "rgba(252, 252, 255, 0.13)",
                  boxShadow: active
                    ? "0 0 40px rgba(180,180,200,0.8)"
                    : "0 0 15px rgba(0,0,0,0.2)",
                }}
              >
                <img
                  src={b.image}
                  alt={b.name}
                  className="w-full object-cover"
                />
              </button>
            );
          })}
        </>
      )}
    </div>
  );
}
