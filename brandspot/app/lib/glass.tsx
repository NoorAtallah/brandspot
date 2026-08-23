export const CAMEL = "#C7A781";
export const PAPER = "#F9F8F6";
export const INK = "#141414";

/* Dark tier — for glass sitting on photos or dark scrims. White text. */
export const glass = {
  backdropFilter: "url(#liquid-glass) blur(2px) saturate(140%) brightness(1.05)",
  WebkitBackdropFilter: "blur(10px) saturate(140%)",
  background: "rgba(255,255,255,0.20)",
  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -1px 2px rgba(255,255,255,0.35), 0 12px 40px rgba(20,20,20,0.28)",
  border: "1px solid rgba(255,255,255,0.5)",
} as const;

/* Light tier — for glass on the paper/ambient background. Ink text.
   Lower displacement scale so it bends rather than smears. */
export const glassLight = {
  backdropFilter: "url(#liquid-glass-soft) blur(6px) saturate(180%) brightness(1.02)",
  WebkitBackdropFilter: "blur(14px) saturate(180%)",
  background: "rgba(255,255,255,0.68)",
  boxShadow:
    "inset 0 1px 1px rgba(255,255,255,0.95), inset 0 -14px 24px -18px rgba(199,167,129,0.55), 0 10px 30px rgba(20,20,20,0.10)",
  border: "1px solid rgba(20,20,20,0.06)",
} as const;

const MAP = "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='60'><defs><linearGradient id='r' x1='0' y1='0' x2='1' y2='0'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#f00'/></linearGradient><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#0f0'/></linearGradient></defs><rect width='100%' height='100%' fill='#000'/><rect width='100%' height='100%' fill='url(#r)'/><rect width='100%' height='100%' fill='url(#g)' style='mix-blend-mode:screen'/></svg>`
);

export function GlassFilter() {
  return (
    <svg className="pointer-events-none absolute h-0 w-0" aria-hidden>
      <filter id="liquid-glass" colorInterpolationFilters="sRGB">
        <feImage href={MAP} x="0" y="0" width="100%" height="100%" result="map" preserveAspectRatio="none" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale={30} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="liquid-glass-soft" colorInterpolationFilters="sRGB">
        <feImage href={MAP} x="0" y="0" width="100%" height="100%" result="map" preserveAspectRatio="none" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale={12} xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

/* Grain: high-frequency detail so the displacement has something to bend.
   Without this, glass over a flat fill reads as a plain white box. */
const NOISE = "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='0.55'/></svg>`
);

/* One fixed backdrop for the whole app. Sections stay transparent, so every
   glass surface on every page has gradient + grain underneath it to refract.
   Being fixed, the blobs drift relative to cards on scroll — free motion. */
export function Ambient() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10" style={{ background: PAPER }}>
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(58rem 46rem at 12% 8%, rgba(199,167,129,0.42), transparent 62%)",
            "radial-gradient(46rem 40rem at 88% 26%, rgba(156,126,86,0.30), transparent 60%)",
            "radial-gradient(52rem 44rem at 68% 92%, rgba(20,20,20,0.14), transparent 64%)",
            "radial-gradient(38rem 32rem at 24% 70%, rgba(199,167,129,0.26), transparent 62%)",
          ].join(","),
          filter: "blur(38px)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: `url("${NOISE}")`, backgroundRepeat: "repeat", opacity: 0.04 }}
      />
    </div>
  );
}
