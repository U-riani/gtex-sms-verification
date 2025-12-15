import React, { useEffect, useRef, useState } from "react";
import {brandsWithAngle} from "../data/brands";


export default function BrandNetwork({
  selectedBrands = [],
  onToggleBrand,
  onToggleAll,
}) {
  const containerRef = useRef(null);

  const [size, setSize] = useState(0);

  const timeRef = useRef(0);
  const rafRef = useRef(null);
  const ropeFrameRef = useRef(0);

  const brandRefs = useRef([]);
  const pathRefs = useRef([]);
  const centerRef = useRef(null);

  // --------- MEASURE CONTAINER ---------
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setSize(rect.width);
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // --------- ANIMATION LOOP ---------
  useEffect(() => {
    if (!size) return;

    const center = size / 2;
    const baseRadius = size * 0.38;

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
        const radius = baseRadius + Math.sin(t * 1.2 + i) * size * 0.03;

        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;

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
          const dx = x - center;
          const dy = y - center;
          const len = Math.hypot(dx, dy) || 1;

          const midX = (center + x) / 2;
          const midY = (center + y) / 2;

          const cx = midX - (dy / len) * size * 0.025;
          const cy = midY + (dx / len) * size * 0.025;

          const path = pathRefs.current[i];
          if (path) {
            path.setAttribute(
              "d",
              `M ${center} ${center} Q ${cx} ${cy} ${x} ${y}`
            );
          }
        }
      });

      ropeFrameRef.current++;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [size]);

  const allSelected =
    selectedBrands.length === brandsWithAngle.length &&
    brandsWithAngle.every((b) => selectedBrands.includes(b.name));

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[500px] mx-auto aspect-square relative"
    >
      {size > 0 && (
        <>
          <svg
            width={size}
            height={size}
            className="absolute inset-0 pointer-events-none"
          >
            {brandsWithAngle.map((_, i) => (
              <path
                key={i}
                ref={(el) => (pathRefs.current[i] = el)}
                stroke="#000"
                strokeWidth="2"
                fill="none"
                strokeDasharray="6 6"
              />
            ))}
          </svg>

          {/* CENTER */}
          <button
            ref={centerRef}
            onClick={onToggleAll}
            type="button"
            className={`absolute flex items-center justify-center
    text-lg font-bold rounded-full shadow-lg transition-colors cursor-pointer hover:shadow-lg hover:bg-stone-300
    ${allSelected ? "bg-[#040037] text-white" : "bg-gray-100 text-gray-800"}`}
            style={{
              width: size * 0.2,
              height: size * 0.2,
              left: size / 2,
              top: size / 2,
              transform: "translate(-50%, -50%)",
              willChange: "transform",
            }}
          >
            <span className={allSelected ? "text-white" : "text-red-600"}>
              G
            </span>
            tex
          </button>

          {/* BRANDS */}
          {brandsWithAngle.map((b, i) => {
            const active = selectedBrands.includes(b.name);

            return (
              <button
                type="button"
                key={b.name}
                ref={(el) => (brandRefs.current[i] = el)}
                onClick={() => onToggleBrand(b.name)}
                className={`absolute flex items-center justify-center
        rounded-full text-center leading-tight px-2 shadow-md hover:shadow-lg hover:bg-gray-300
        transition-colors duration-200 cursor-pointer
        ${active ? "bg-[#040037] text-white" : "bg-gray-200 text-gray-800"}`}
                style={{
                  width: size * 0.17,
                  height: size * 0.17,
                  fontSize: Math.max(size * 0.025, 9),
                  left: 0,
                  top: 0,
                  transform: "translate(-50%, -50%)",
                  willChange: "transform",
                }}
              >
                {b.name}
              </button>
            );
          })}
        </>
      )}
    </div>
  );
}
