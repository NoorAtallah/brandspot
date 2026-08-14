export const CAMEL = "#C7A781";
export const PAPER = "#F9F8F6";
export const INK = "#141414";

export const glass = {
  backdropFilter: "url(#liquid-glass) blur(2px) saturate(140%) brightness(1.05)",
  WebkitBackdropFilter: "blur(10px) saturate(140%)",
  background: "rgba(255,255,255,0.14)",
  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -1px 2px rgba(255,255,255,0.35), 0 12px 40px rgba(20,20,20,0.28)",
  border: "1px solid rgba(255,255,255,0.5)",
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
    </svg>
  );
}