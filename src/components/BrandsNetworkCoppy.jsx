import React, { useEffect, useRef, useState } from "react";
import { brandsWithAngle } from "../data/brands";

export default function BrandNetworkCoppy({
  selectedBrands = [],
  onToggleBrand,
  onToggleAll,
}) {
  const containerRef = useRef(null);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);

  const timeRef = useRef(0);
  const rafRef = useRef(null);
  const ropeFrameRef = useRef(0);

  const brandRefs = useRef([]);
  const pathRefs = useRef([]);
  const centerRef = useRef(null);
  
  const handleToggleAll = () => {
    onToggleAll();
    setPulseKey((k) => k + 1);
  };

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
    const brandSize = height * 0.25; // same as button size
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
      className="w-full max-w-[500px] mx-auto relative h-[250px]"
    >
      {width > 0 && (
        <>
          <svg
            width={width}
            height={height}
            className="absolute inset-0 pointer-events-none"
          >
            {brandsWithAngle.map((_, i) => (
              <path
                key={i}
                ref={(el) => (pathRefs.current[i] = el)}
                stroke="#000"
                strokeWidth="2"
                fill="none"
                strokeDasharray="4 4"
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
              width: height * 0.3,
              height: height * 0.3,
              left: width / 2,
              top: height / 2,
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
                  width: height * 0.24,
                  height: height * 0.24,
                  fontSize: Math.max(width * 0.025, 9),
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
