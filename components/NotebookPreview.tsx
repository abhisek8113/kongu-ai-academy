import hero from "@/lib/heroData.json";

// A real cell from Lab 04 (KNN on Iris) and its real output:
// 5-fold cross-validated accuracy for k = 1..30, computed on the lab's iris.csv.
const code = `pipe = make_pipeline(StandardScaler(), KNeighborsClassifier())
scores = [cross_val_score(pipe.set_params(kneighborsclassifier__n_neighbors=k),
                          X, y, cv=5).mean() for k in range(1, 31)]
best_k = range(1, 31)[np.argmax(scores)]`;

export default function NotebookPreview() {
  const W = 520, H = 230, L = 44, R = 14, T = 16, B = 34;
  const { ks, acc, best } = hero as { ks: number[]; acc: number[]; best: number };
  const yMin = 0.9, yMax = 1.0;
  const x = (k: number) => L + ((k - 1) / (ks.length - 1)) * (W - L - R);
  const y = (a: number) => T + (1 - (a - yMin) / (yMax - yMin)) * (H - T - B);
  const path = ks.map((k, i) => `${i ? "L" : "M"}${x(k).toFixed(1)},${y(acc[i]).toFixed(1)}`).join(" ");
  const bestAcc = acc[ks.indexOf(best)];
  return (
    <figure className="border border-ink bg-white">
      <div className="flex items-center justify-between border-b border-ink px-4 py-2 font-mono text-[12px]">
        <span>lab-04-knn-iris.ipynb</span>
        <span className="text-mute">Google Colab</span>
      </div>
      <div className="grid grid-cols-[2.5rem_1fr] border-b border-rule bg-cream font-mono text-[12.5px] leading-relaxed">
        <span className="select-none pt-3 text-right text-mute">[3]</span>
        <pre className="overflow-x-auto px-3 py-3"><code>{code}</code></pre>
      </div>
      <div className="px-4 pb-3 pt-3">
        <div className="font-mono text-[12px] text-mute">Out: best_k = {best} · accuracy {(bestAcc * 100).toFixed(1)}%</div>
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label={`Cross-validated accuracy by k; best k is ${best}`}>
          {[0.9, 0.92, 0.94, 0.96, 0.98, 1].map((v) => (
            <g key={v}>
              <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#e4e4e1" />
              <text x={L - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fontFamily="IBM Plex Mono" fill="#5f5f5b">{Math.round(v * 100)}%</text>
            </g>
          ))}
          {[1, 5, 10, 15, 20, 25, 30].map((k) => (
            <text key={k} x={x(k)} y={H - 14} textAnchor="middle" fontSize="11" fontFamily="IBM Plex Mono" fill="#5f5f5b">{k}</text>
          ))}
          <text x={W - R} y={H - 1} textAnchor="end" fontSize="11" fontFamily="IBM Plex Mono" fill="#5f5f5b">k (neighbours)</text>
          <line x1={x(best)} x2={x(best)} y1={T} y2={H - B} stroke="#b3261e" strokeDasharray="3 3" />
          <path d={path} fill="none" stroke="#111" strokeWidth="1.75" />
          {ks.map((k, i) => <circle key={k} cx={x(k)} cy={y(acc[i])} r={k === best ? 4.5 : 2} fill={k === best ? "#b3261e" : "#111"} />)}
          <text x={x(best) + 8} y={y(bestAcc) - 8} fontSize="12" fontFamily="IBM Plex Sans" fontWeight="600" fill="#b3261e">k = {best}</text>
        </svg>
      </div>
      <figcaption className="border-t border-rule px-4 py-2 text-[13px] text-mute">
        Lab 04 exercise: choose k by cross-validation. Chart computed on the lab's own iris.csv.
      </figcaption>
    </figure>
  );
}
