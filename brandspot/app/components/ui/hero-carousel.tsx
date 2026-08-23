'use client';
// A full-bleed editorial hero driven by a filmstrip.
//
// Every card shares one top edge. The focused card unfurls to full height while
// its neighbours stay clipped to half, so the strip reads as a row of cropped
// looks with one complete portrait standing in the middle of it. Changing the
// focus re-grades the whole background to that image.
//
// Geometry is measured, never hard-coded: one ResizeObserver reads the stage and
// every size below is a ratio of it, so the same component holds up in a small
// preview box and on a 4K display.
//
// Liquid glass: every chrome surface (rail, meta, department pills, card label)
// is a glass panel sitting directly on the graded photo — which is the one place
// the displacement filter has real detail to refract.
import * as React from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { glass, CAMEL } from "../../lib/glass";

export interface HeroCarouselItem {
  id?: string | number;
  /** Headline for the active slide. Newlines become separate reveal lines. */
  title: string;
  image: string;
  /** Byline printed beside the headline. */
  credit?: string;
  /** Right-aligned facts, e.g. ["NEW IN", "FROM 9.90 JD"]. */
  meta?: string[];
  /** CSS colour the background is graded to: the photo keeps its luminance and takes this hue. */
  accent?: string;
}

export interface HeroCarouselProps {
  items: HeroCarouselItem[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  autoplay?: boolean;
  autoplayDelay?: number;
  /** Rendered inside a glass panel under the headline (department pills, CTAs). */
  actions?: React.ReactNode;
  /** Mirrors the strip and the rail for RTL. */
  rtl?: boolean;
  /** Label on the cue shown at the last slide. @default "Scroll" */
  scrollHint?: string;
  className?: string;
}

/* Ratios, all relative to the stage box. */
const CARD_H = 0.264;
const CARD_AR = 0.75;
const GAP = 0.038;
const STRIP_TOP = 0.5;
const TITLE = 0.067;
const LABEL = 0.0103;
const PAD = 0.017;
const RAIL = 0.2;

const WHEEL_THRESHOLD = 60;
const WHEEL_COOLDOWN = 420;

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function HeroCarousel({
  items,
  index: controlled,
  defaultIndex = 0,
  onIndexChange,
  autoplay = false,
  autoplayDelay = 4000,
  actions,
  rtl = false,
  scrollHint = "Scroll",
  className = "",
}: HeroCarouselProps) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [box, setBox] = React.useState({ w: 0, h: 0 });
  const [uncontrolled, setUncontrolled] = React.useState(defaultIndex);
  const [dragging, setDragging] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const reduced = useReducedMotion();

  const last = items.length - 1;
  const index = clamp(controlled ?? uncontrolled, 0, Math.max(0, last));

  const go = React.useCallback(
    (next: number) => {
      const clamped = clamp(next, 0, Math.max(0, last));
      if (controlled === undefined) setUncontrolled(clamped);
      if (clamped !== index) onIndexChange?.(clamped);
    },
    [controlled, index, last, onIndexChange]
  );

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const read = () => setBox({ w: stage.clientWidth, h: stage.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  const fullH = clamp(box.h * CARD_H, 96, 360);
  const halfH = fullH / 2;
  const cardW = fullH * CARD_AR;
  const gap = Math.max(4, Math.round(cardW * GAP));
  const stepW = cardW + gap;
  const pad = Math.max(16, Math.round(box.w * PAD));
  const label = Math.max(9, Math.round(box.h * LABEL));

  /* RTL is handled in one place: the strip is laid out LTR always (the track
     carries dir="ltr" so flex order never depends on the page direction), and
     the slides are simply hung in reverse order, so slide 0 sits at the right
     end. Every offset below is computed on that visual position, never on the
     data index. */
  const pos = React.useCallback((i: number) => (rtl ? last - i : i), [rtl, last]);
  const fromPos = React.useCallback((p: number) => (rtl ? last - p : p), [rtl, last]);

  const xFor = React.useCallback(
    (i: number) => box.w / 2 - (pos(i) * stepW + cardW / 2),
    [box.w, stepW, cardW, pos]
  );

  const x = useMotionValue(0);
  const target = xFor(index);

  const swing = reduced ? { duration: 0 } : { duration: 0.7, ease: "easeOut" as const };
  const spring = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 260, damping: 34, mass: 0.9 };

  // Driven by a motion value rather than an `animate` prop so a drag that starts
  // mid-spring reads the real position, not where the spring was headed.
  React.useEffect(() => {
    if (dragging) return;
    const run = animate(x, target, spring);
    return () => run.stop();
  }, [target, dragging, reduced, x]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let acc = 0;
    let until = 0;
    const onWheel = (e: WheelEvent) => {
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const raw = horizontal ? e.deltaX : e.deltaY;
      // A horizontal gesture follows the strip: in RTL, swiping the track
      // leftwards walks forward through the slides.
      const delta = horizontal && rtl ? -raw : raw;
      // Scroll chaining, part one: at either end, hand the gesture straight
      // back to the page so a full-height carousel is never a dead end.
      if ((delta > 0 && index === last) || (delta < 0 && index === 0)) {
        acc = 0;
        return;
      }
      // Part two: only capture the wheel while the stage genuinely fills the
      // viewport. Without this, scrolling back up from the section below is
      // caught by the strip and you have to walk every slide to escape.
      const r = stage.getBoundingClientRect();
      const covered = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      if (covered < window.innerHeight * 0.75) {
        acc = 0;
        return;
      }
      e.preventDefault();
      const now = e.timeStamp;
      if (now < until) return;
      acc += delta;
      if (Math.abs(acc) < WHEEL_THRESHOLD) return;
      go(index + Math.sign(acc));
      acc = 0;
      until = now + WHEEL_COOLDOWN;
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [go, index, last, rtl]);

  React.useEffect(() => {
    if (!autoplay || paused || dragging || items.length < 2) return;
    const id = window.setTimeout(() => go(index === last ? 0 : index + 1), autoplayDelay);
    return () => window.clearTimeout(id);
  }, [autoplay, autoplayDelay, dragging, go, index, items.length, last, paused]);

  const active = items[index];
  if (!active) return null;

  const lines = active.title.split("\n");
  const accent = active.accent ?? "#8a8a8a";
  // Bounds are in visual space: leftmost card is the one at position `last`.
  const dragBounds = { left: box.w / 2 - (last * stepW + cardW / 2), right: box.w / 2 - cardW / 2 };
  const ordered = rtl ? items.map((_, i) => items[last - i]!) : items;

  return (
    <div
      ref={stageRef}
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      aria-label="Featured looks"
      onKeyDown={(e) => {
        const fwd = rtl ? "ArrowLeft" : "ArrowRight";
        const back = rtl ? "ArrowRight" : "ArrowLeft";
        const keys: Record<string, number> = { [back]: index - 1, [fwd]: index + 1, Home: 0, End: last };
        if (!(e.key in keys)) return;
        e.preventDefault();
        go(keys[e.key]!);
      }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={`relative h-full min-h-[24rem] w-full select-none overflow-hidden bg-black text-white outline-none focus-visible:ring-1 focus-visible:ring-white/40 focus-visible:ring-inset ${className}`}
    >
      {/* ── Background: the focused photo, blown up and re-hued to its accent ── */}
      <AnimatePresence initial={false}>
        <motion.div key={index} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={swing}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            src={active.image}
            alt=""
            aria-hidden
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ scale: reduced ? 1.28 : 1.42 }}
            animate={{ scale: 1.28 }}
            transition={reduced ? { duration: 0 } : { duration: 6, ease: "linear" }}
          />
          {/* Keep the photo's luminance, take the accent's hue. */}
          <div className="absolute inset-0" style={{ backgroundColor: accent, mixBlendMode: "color" }} />
          <div className="absolute inset-0 opacity-55" style={{ backgroundColor: accent, mixBlendMode: "multiply" }} />
        </motion.div>
      </AnimatePresence>

      {/* Legibility wash + grain, above the swap so they never flicker. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/45" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-overlay" style={{ backgroundImage: GRAIN, backgroundSize: "180px 180px" }} />

      {/* ── Headline block, sitting just above the strip's top edge ── */}
      <div
        className="absolute inset-x-0 top-0 flex flex-col justify-end"
        style={{ height: `${STRIP_TOP * 100}%`, paddingInline: pad, paddingBottom: Math.round(box.h * 0.028) }}
      >
        <div className="flex w-full flex-wrap items-end gap-x-[5vw] gap-y-3">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.h1
              key={index}
              className="font-extrabold leading-[0.9] tracking-[-0.035em]"
              style={{ fontSize: Math.max(26, Math.round(box.h * TITLE)), textShadow: "0 2px 30px rgba(0,0,0,0.35)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.18 } }}
            >
              {lines.map((line, i) => (
                // Each line wipes up from behind its own edge.
                <span key={i} className="block overflow-hidden">
                  <motion.span
                    className="block"
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={reduced ? { duration: 0 } : { duration: 0.62, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </motion.h1>
          </AnimatePresence>

          {active.credit ? (
            <motion.p
              key={`credit-${index}`}
              className="font-bold uppercase tracking-[0.14em] opacity-100"
              style={{ fontSize: label }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {active.credit}
            </motion.p>
          ) : null}

          {active.meta?.length ? (
            <motion.div
              className="flex items-center rounded-full px-4 py-2.5"
              style={{ ...glass, marginInlineStart: "auto", gap: `${Math.max(14, box.w * 0.03)}px` }}
              initial={reduced ? undefined : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.14 }}
            >
              {active.meta.map((fact, i) => (
                <span key={`${index}-${fact}`} className="flex items-center gap-3 whitespace-nowrap font-bold uppercase tracking-[0.14em]" style={{ fontSize: label }}>
                  {i > 0 ? <span aria-hidden className="h-3 w-px" style={{ background: "rgba(255,255,255,0.35)" }} /> : null}
                  {fact}
                </span>
              ))}
            </motion.div>
          ) : null}
        </div>

        {actions ? (
          <motion.div
            className="mt-5 flex flex-wrap items-center gap-2.5"
            initial={reduced ? undefined : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {actions}
          </motion.div>
        ) : null}
      </div>

      {/* ── The strip: one shared top edge, the focused card twice as tall ── */}
      <div className="absolute inset-x-0" style={{ top: `${STRIP_TOP * 100}%`, height: fullH }}>
        <motion.div
          className="flex items-start"
          dir="ltr"
          style={{ gap, x, cursor: dragging ? "grabbing" : "grab" }}
          drag="x"
          dragMomentum={false}
          dragElastic={0.08}
          dragConstraints={dragBounds}
          onDragStart={() => setDragging(true)}
          onDragEnd={(_, info) => {
            setDragging(false);
            // Land on whatever card the release sits nearest, nudged by throw
            // velocity so a flick clears more than one card.
            const thrown = x.get() + info.velocity.x * 0.12;
            go(fromPos(Math.round((box.w / 2 - thrown - cardW / 2) / stepW)));
          }}
        >
          {ordered.map((item, p) => {
            const i = fromPos(p);
            return (
            <motion.button
              key={item.id ?? i}
              type="button"
              aria-label={item.title.replace(/\n/g, " ")}
              aria-current={i === index}
              onClick={() => go(i)}
              className="relative shrink-0 overflow-hidden bg-white/5"
              style={{ width: cardW }}
              animate={{ height: i === index ? fullH : halfH }}
              transition={spring}
            >
              {/* The focused card is exactly 3:4, so object-position only picks
                  which band of the portrait the half-height neighbours keep. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt="" draggable={false} className="h-full w-full object-cover" style={{ objectPosition: "50% 26%" }} />
              <motion.span aria-hidden className="absolute inset-0 bg-black" animate={{ opacity: i === index ? 0 : 0.18 }} transition={spring} />
              {/* glass sliver on the focused card, refracting the photo under it */}
              <motion.span
                className="pointer-events-none absolute bottom-2 flex items-center justify-center rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em]"
                style={{ ...glass, insetInline: "0.5rem", color: "#fff" }}
                animate={{ opacity: i === index ? 1 : 0 }}
                transition={spring}
              >
                <span style={{ color: CAMEL }}>{item.credit ?? item.title.replace(/\n/g, " ")}</span>
              </motion.span>
            </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* ── Exit cue: appears once the strip is spent, so it is clear the page
             carries on below rather than the hero being a dead end. ── */}
      <AnimatePresence>
        {index === last ? (
          <motion.div
            key="exit-cue"
            className="pointer-events-none absolute flex items-center gap-2 rounded-full px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ ...glass, insetInlineEnd: pad, bottom: Math.max(14, box.h * 0.022), color: "#fff" }}
            initial={reduced ? undefined : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.4 }}
          >
            {scrollHint}
            <motion.span
              aria-hidden
              animate={reduced ? undefined : { y: [0, 4, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              style={{ color: CAMEL }}
            >
              ↓
            </motion.span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── Position rail, in glass ── */}
      <div
        className="absolute rounded-2xl px-4 py-3"
        style={{ ...glass, insetInlineStart: pad, bottom: Math.max(14, box.h * 0.022), width: Math.max(150, box.w * RAIL) }}
      >
        <div className="flex justify-between font-bold tabular-nums opacity-100" style={{ fontSize: label }}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span>{String(items.length).padStart(2, "0")}</span>
        </div>
        <div className="relative mt-2 h-px w-full bg-white/25">
          <motion.div
            className="absolute inset-y-0"
            style={{ width: `${100 / items.length}%`, background: CAMEL, boxShadow: `0 0 12px ${CAMEL}` }}
            animate={{ insetInlineStart: `${(index / items.length) * 100}%` }}
            transition={spring}
          />
        </div>
      </div>
    </div>
  );
}
