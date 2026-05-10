const STARS: [number, number, number][] = [
  [5,12,1],[15,87,1],[25,43,2],[35,68,1],[45,22,1],[55,91,2],[65,37,1],[75,58,1],[85,14,2],[92,76,1],
  [10,52,1],[20,28,1],[30,83,1],[40,8,1],[50,63,2],[60,45,1],[70,93,1],[80,19,1],[90,70,1],[8,36,2],
  [18,72,1],[28,16,1],[38,50,1],[48,88,1],[58,25,2],[68,79,1],[78,40,1],[88,5,1],[3,60,1],[13,95,1],
  [23,3,2],[33,38,1],[43,75,1],[53,10,1],[63,55,1],[73,30,2],[83,65,1],[93,20,1],[7,46,1],[17,20,1],
];

type Props = { modelPath?: string };

export default function Viewer3D({ modelPath: _ }: Props) {
  return (
    <div
      className="relative w-full h-[480px] rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center select-none"
      style={{ background: "radial-gradient(ellipse at 50% 55%, #0d1b3e 0%, #05090f 100%)" }}
    >
      <style>{`
        @keyframes nasa-orbit {
          from { transform: rotate(0deg) translateX(158px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(158px) rotate(-360deg); }
        }
        @keyframes nasa-orbit2 {
          from { transform: rotate(180deg) translateX(110px) rotate(-180deg); }
          to   { transform: rotate(540deg) translateX(110px) rotate(-540deg); }
        }
        @keyframes planet-shimmer {
          0%,100% { opacity: 0.85; } 50% { opacity: 1; }
        }
      `}</style>

      {STARS.map(([l, t, s], i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{ left: `${l}%`, top: `${t}%`, width: s, height: s, opacity: 0.3 + (i % 6) * 0.1 }}
        />
      ))}

      {/* outer glow */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 320, height: 320, background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 68%)" }}
      />

      {/* planet */}
      <div
        className="absolute rounded-full"
        style={{
          width: 190,
          height: 190,
          background: "radial-gradient(circle at 38% 34%, #5b9bd5 0%, #1e4a8a 48%, #091530 100%)",
          boxShadow: "0 0 55px 10px rgba(30,74,138,0.55), inset -22px -22px 44px rgba(0,0,0,0.6)",
          animation: "planet-shimmer 6s ease-in-out infinite",
        }}
      />

      {/* continent blobs */}
      <div className="absolute rounded-full overflow-hidden pointer-events-none" style={{ width: 190, height: 190 }}>
        <div className="absolute rounded-full bg-green-800/35" style={{ width: 58, height: 42, top: "28%", left: "30%" }} />
        <div className="absolute rounded-full bg-green-800/30" style={{ width: 46, height: 32, top: "56%", left: "54%" }} />
        <div className="absolute rounded-full bg-green-800/25" style={{ width: 28, height: 20, top: "40%", left: "62%" }} />
      </div>

      {/* atmosphere */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 210, height: 210, border: "9px solid rgba(96,165,250,0.1)", boxShadow: "0 0 22px 5px rgba(96,165,250,0.07)" }}
      />

      {/* outer orbit ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 320, height: 320, border: "1px solid rgba(255,255,255,0.1)" }}
      />

      {/* inner orbit ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 224, height: 224, border: "1px dashed rgba(255,255,255,0.07)" }}
      />

      {/* outer satellite */}
      <div className="absolute" style={{ animation: "nasa-orbit 14s linear infinite" }}>
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: "#FC3D21", boxShadow: "0 0 10px 3px rgba(252,61,33,0.7)" }}
        />
      </div>

      {/* inner satellite */}
      <div className="absolute" style={{ animation: "nasa-orbit2 22s linear infinite" }}>
        <div
          className="w-2 h-2 rounded-full bg-blue-300"
          style={{ boxShadow: "0 0 6px 2px rgba(147,197,253,0.6)" }}
        />
      </div>
    </div>
  );
}
