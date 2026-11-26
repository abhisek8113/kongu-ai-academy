"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const NeuralCore = dynamic(() => import("./NeuralCore"), { ssr: false, loading: () => <Fallback /> });

/** Static SVG shown while the 3D scene loads, and when WebGL is not available. */
export function Fallback() {
  return (
    <svg viewBox="0 0 400 400" className="absolute inset-0 m-auto h-[80%] w-[80%] opacity-80" aria-hidden="true">
      <defs>
        <radialGradient id="fcore"><stop offset="0" stopColor="#00D4FF" stopOpacity=".9" /><stop offset=".5" stopColor="#386BFF" stopOpacity=".35" /><stop offset="1" stopColor="#386BFF" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx="200" cy="200" r="120" fill="url(#fcore)" />
      {[150, 170, 190].map((r, i) => <ellipse key={r} cx="200" cy="200" rx={r} ry={r * 0.38} fill="none" stroke={["#386BFF", "#00D4FF", "#D6B46A"][i]} strokeOpacity=".35" transform={`rotate(${[-20, 25, 60][i]} 200 200)`} />)}
    </svg>
  );
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function HeroScene() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => setOk(hasWebGL()), []);
  if (ok === null || ok === false) return <Fallback />;
  return <NeuralCore />;
}
