// Hero picture: loom threads converging into a neural network
export default function Loom() {
  const layers = [[150, 175, 200, 225, 250, 275, 300, 325], [175, 215, 255, 295], [230]];
  const ys = [230, 320, 395];
  const top = Array.from({ length: 16 }, (_, i) => 52 + i * 23.5);
  return (
    <div className="relative mx-auto aspect-[1/0.92] w-full max-w-md" aria-hidden="true">
      <svg viewBox="0 0 460 420" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="beam" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#f6c27a" /><stop offset="1" stopColor="#d9892a" /></linearGradient>
          <radialGradient id="node" cx=".35" cy=".35"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#f2a541" /></radialGradient>
        </defs>
        <rect x="30" y="18" width="400" height="26" rx="10" fill="url(#beam)" />
        {top.map((x, i) => {
          const tx = layers[0][i % 8];
          return <path key={i} className="thread" d={`M${x} 44 C ${x} 140, ${tx} 150, ${tx} ${ys[0]}`} stroke="#fff" strokeOpacity={0.35 + (i % 3) * 0.15} strokeWidth="2" fill="none" />;
        })}
        {[0, 1].map((l) => layers[l].map((a) => layers[l + 1].map((b) => (
          <line key={`${l}-${a}-${b}`} x1={a} y1={ys[l]} x2={b} y2={ys[l + 1]} stroke="#fff" strokeOpacity=".28" strokeWidth="1.4" />
        ))))}
        {layers.map((L, l) => L.map((x) => {
          const r = l === 2 ? 20 : l === 1 ? 11 : 8;
          return <g key={`${l}-${x}`}><circle cx={x} cy={ys[l] + 4} r={r} fill="#00000035" /><circle cx={x} cy={ys[l]} r={r} fill="url(#node)" /></g>;
        }))}
        <text x="230" y="400" textAnchor="middle" fontFamily="Archivo" fontWeight="800" fontSize="15" fill="#3a0c12">AI</text>
      </svg>
      <style>{`.thread{stroke-dasharray:6 10;animation:flow 3.2s linear infinite}@keyframes flow{to{stroke-dashoffset:-64}}@media(prefers-reduced-motion:reduce){.thread{animation:none}}`}</style>
    </div>
  );
}
