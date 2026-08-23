'use client';
import * as React from "react";
import { motion } from "framer-motion";
import { glassLight, CAMEL, INK } from "../lib/glass";

export const muted = "rgba(20,20,20,0.7)";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
      <div>
        <h1 className="text-xl font-extrabold sm:text-2xl md:text-3xl" style={{ color: INK, letterSpacing: "-0.02em" }}>{title}</h1>
        {subtitle ? <p className="mt-1 text-[13.5px] font-medium" style={{ color: muted }}>{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[26px] ${className}`} style={glassLight}>
      {children}
    </div>
  );
}

export function Button({
  children, onClick, type = "button", tone = "solid", disabled, className = "",
}: {
  children: React.ReactNode; onClick?: () => void; type?: "button" | "submit";
  tone?: "solid" | "camel" | "ghost" | "danger"; disabled?: boolean; className?: string;
}) {
  const styles: Record<string, React.CSSProperties> = {
    solid: { background: INK, color: "#fff" },
    camel: { background: CAMEL, color: INK },
    ghost: { ...glassLight, color: INK },
    danger: { background: "rgba(190,40,40,0.12)", color: "#a02020" },
  };
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className={`flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-extrabold disabled:opacity-60 ${className}`}
      style={styles[tone]}
    >
      {children}
    </motion.button>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ color: muted }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.85)",
  border: "1px solid rgba(20,20,20,0.10)",
  color: INK,
};

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="rounded-2xl px-4 py-2.5 text-[14px] font-bold outline-none" style={inputStyle} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="rounded-2xl px-4 py-2.5 text-[14px] font-medium outline-none" style={inputStyle} rows={3} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className="rounded-2xl px-4 py-2.5 text-[14px] font-bold outline-none" style={inputStyle} />;
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className="flex items-center gap-2" aria-pressed={on}>
      <span className="relative h-6 w-11 rounded-full transition-colors" style={{ background: on ? CAMEL : "rgba(20,20,20,0.18)" }}>
        <motion.span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white"
          animate={{ left: on ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 34 }}
        />
      </span>
      {label ? <span className="text-[13px] font-bold" style={{ color: INK }}>{label}</span> : null}
    </button>
  );
}

/** Slide-over used by every create/edit form. */
export function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  React.useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <motion.div
        className="absolute inset-0 bg-black/35"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: "100%" }} animate={{ x: 0 }} transition={{ type: "spring", stiffness: 320, damping: 36 }}
        className="relative h-full w-full overflow-y-auto p-5 sm:max-w-md"
        style={{ background: "rgba(249,248,246,0.98)", borderInlineStart: "1px solid rgba(20,20,20,0.08)" }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold" style={{ color: INK }}>{title}</h2>
          <button onClick={onClose} className="rounded-full px-3 py-1.5 text-[13px] font-extrabold" style={{ color: muted }}>Close</button>
        </div>
        {children}
      </motion.aside>
    </div>
  );
}

/** Tables stay wide; the wrapper scrolls instead of breaking the layout. */
export function TableWrap({ children }: { children: React.ReactNode }) {
  return <div className="w-full overflow-x-auto">{children}</div>;
}

export function Empty({ label }: { label: string }) {
  return <p className="px-5 py-14 text-center text-[13.5px] font-bold" style={{ color: muted }}>{label}</p>;
}
