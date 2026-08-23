'use client';
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, LoaderCircle } from "lucide-react";
import { createClient } from "../../lib/supabase/client";
import { glassLight, CAMEL, INK } from "../../lib/glass";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setBusy(false);
      return;
    }
    // Full reload so the server components pick up the fresh session cookie.
    router.replace(next);
    router.refresh();
  };

  return (
    <main dir="ltr" className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-5">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm rounded-[30px] p-6 sm:p-8"
        style={glassLight}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-extrabold tracking-tight" style={{ color: INK }}>brans</span>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: CAMEL }} />
          <span className="text-xl font-extrabold tracking-tight" style={{ color: CAMEL }}>spot</span>
        </div>

        <h1 className="mt-5 text-2xl font-extrabold" style={{ color: INK }}>Admin sign in</h1>
        <p className="mt-1.5 text-[13.5px] font-medium" style={{ color: "rgba(20,20,20,0.72)" }}>
          Staff only. Use the account created in Supabase.
        </p>

        <label className="mt-6 flex items-center gap-2 rounded-full px-4 py-3" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(20,20,20,0.08)" }}>
          <Mail size={17} strokeWidth={2.3} style={{ color: CAMEL }} />
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="min-w-0 flex-1 bg-transparent text-[14px] font-bold outline-none"
            style={{ color: INK }}
          />
        </label>

        <label className="mt-3 flex items-center gap-2 rounded-full px-4 py-3" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(20,20,20,0.08)" }}>
          <Lock size={17} strokeWidth={2.3} style={{ color: CAMEL }} />
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="min-w-0 flex-1 bg-transparent text-[14px] font-bold outline-none"
            style={{ color: INK }}
          />
        </label>

        {error ? (
          <p className="mt-3 rounded-2xl px-4 py-2.5 text-[13px] font-bold" style={{ background: "rgba(190,40,40,0.10)", color: "#a02020" }}>
            {error}
          </p>
        ) : null}

        <motion.button
          type="submit"
          disabled={busy}
          whileTap={busy ? {} : { scale: 0.97 }}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-extrabold disabled:opacity-70"
          style={{ background: INK, color: "#fff" }}
        >
          {busy ? (
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }} className="flex">
              <LoaderCircle size={17} strokeWidth={2.6} />
            </motion.span>
          ) : null}
          {busy ? "Signing in…" : "Sign in"}
        </motion.button>
      </motion.form>
    </main>
  );
}
