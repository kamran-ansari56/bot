"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import Dojo from "../components/Dojo";

const C = { ink: "#15120F", panel: "#1E1A16", raised: "#272220", line: "#3A332E", you: "#E0894F", youInk: "#241405", text: "#E9E1D6", soft: "#B3A89B", faint: "#7E7468", good: "#7FB069", bad: "#C45D4A" };
const DISPLAY = "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif";
const BODY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const DEFAULT_STORE = { log: [], streak: 0, lastActiveDay: null };

export default function Page() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [store, setStore] = useState(null);
  const [loadingStore, setLoadingStore] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setChecking(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setStore(null); return; }
    let live = true;
    setLoadingStore(true);
    supabase.from("dojo_state").select("state").eq("user_id", session.user.id).maybeSingle()
      .then(({ data }) => { if (live) { setStore(data?.state || DEFAULT_STORE); setLoadingStore(false); } });
    return () => { live = false; };
  }, [session]);

  async function persist(next) {
    if (!session) return;
    await supabase.from("dojo_state").upsert({ user_id: session.user.id, state: next, updated_at: new Date().toISOString() });
  }
  async function sendLink() {
    setErr(""); const e = email.trim();
    if (!e || !e.includes("@")) { setErr("Enter a valid email."); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ email: e, options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined } });
    setBusy(false);
    if (error) setErr(error.message); else setSent(true);
  }
  async function signOut() { await supabase.auth.signOut(); setSent(false); setEmail(""); }

  const wrap = { background: C.ink, color: C.text, fontFamily: BODY, minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 18px" };

  if (checking) return <div style={{ ...wrap }}><div style={{ color: C.faint, fontSize: 14 }}>Loading…</div></div>;

  if (!session) {
    return (
      <div style={wrap}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ color: C.faint, letterSpacing: "0.22em", fontSize: 11, textTransform: "uppercase" }}>Charisma gym</div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(30px, 9vw, 40px)", lineHeight: 1.02, margin: "10px 0 10px", fontWeight: 600 }}>The Read</h1>
          <p style={{ color: C.soft, fontSize: 14.5, lineHeight: 1.6, marginBottom: 22 }}>Sign in with your email. Your sessions, streak, and progress follow you to any device.</p>
          {sent ? (
            <div style={{ border: `1px solid ${C.good}`, borderRadius: 12, background: C.panel, padding: "16px 18px" }}>
              <div style={{ color: C.good, fontSize: 14, lineHeight: 1.6 }}>Link sent to {email}. Open it on this device to sign in. You can close this tab.</div>
              <button onClick={() => setSent(false)} style={{ marginTop: 12, background: "transparent", color: C.soft, border: `1px solid ${C.line}`, borderRadius: 9, padding: "8px 14px", cursor: "pointer", fontSize: 13 }}>Use a different email</button>
            </div>
          ) : (
            <div>
              <input value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendLink(); }} placeholder="you@email.com" inputMode="email" autoComplete="email" style={{ width: "100%", background: C.raised, color: C.text, border: `1px solid ${C.line}`, borderRadius: 12, padding: "13px 14px", fontSize: 16, fontFamily: BODY, outline: "none" }} />
              {err && <div style={{ color: C.bad, fontSize: 13, marginTop: 8 }}>{err}</div>}
              <button onClick={sendLink} disabled={busy} style={{ width: "100%", marginTop: 12, background: busy ? C.raised : C.you, color: busy ? C.faint : C.youInk, border: "none", borderRadius: 12, padding: "14px", cursor: busy ? "default" : "pointer", fontSize: 15, fontWeight: 600 }}>{busy ? "Sending…" : "Send me a sign-in link"}</button>
              <p style={{ color: C.faint, fontSize: 12, lineHeight: 1.6, marginTop: 14 }}>No password. We email a one-tap link. The same email always loads the same account.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loadingStore || store === null) return <div style={wrap}><div style={{ color: C.faint, fontSize: 14 }}>Loading your progress…</div></div>;

  return <Dojo initialStore={store} persist={persist} email={session.user.email} onSignOut={signOut} />;
}
