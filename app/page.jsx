"use client";
export const dynamic = "force-dynamic";
import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase";
import Dojo from "../components/Dojo";

const C = { ink: "#15120F", panel: "#1E1A16", raised: "#272220", line: "#3A332E", you: "#E0894F", youInk: "#241405", text: "#E9E1D6", soft: "#B3A89B", faint: "#7E7468", good: "#7FB069", bad: "#C45D4A" };
const DISPLAY = "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif";
const BODY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const DEFAULT_STORE = { log: [], streak: 0, lastActiveDay: null };

export default function Page() {
  const [user, setUser] = useState(undefined);
  const [store, setStore] = useState(null);
  const [loadingStore, setLoadingStore] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u || null)), []);

  useEffect(() => {
    if (!user) { setStore(null); return; }
    let live = true;
    setLoadingStore(true);
    getDoc(doc(db, "dojo_state", user.uid))
      .then((snap) => { if (live) setStore(snap.exists() ? (snap.data().state || DEFAULT_STORE) : DEFAULT_STORE); })
      .catch(() => { if (live) setStore(DEFAULT_STORE); })
      .finally(() => { if (live) setLoadingStore(false); });
    return () => { live = false; };
  }, [user]);

  async function persist(next) {
    if (!user) return;
    try { await setDoc(doc(db, "dojo_state", user.uid), { state: next, updated: Date.now() }, { merge: true }); } catch {}
  }

  async function login() {
    setErr(""); setBusy(true);
    try { await signInWithPopup(auth, googleProvider); }
    catch (e) { setErr(e?.message || "Sign-in failed."); }
    setBusy(false);
  }

  async function doSignOut() { await signOut(auth); }

  const wrap = { background: C.ink, color: C.text, fontFamily: BODY, minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 18px" };

  if (user === undefined) return <div style={wrap}><div style={{ color: C.faint, fontSize: 14 }}>Loading…</div></div>;

  if (!user) {
    return (
      <div style={wrap}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ color: C.faint, letterSpacing: "0.22em", fontSize: 11, textTransform: "uppercase" }}>Charisma gym</div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(30px, 9vw, 40px)", lineHeight: 1.02, margin: "10px 0 10px", fontWeight: 600 }}>The Read</h1>
          <p style={{ color: C.soft, fontSize: 14.5, lineHeight: 1.6, marginBottom: 22 }}>Sign in to keep your sessions, streak, and progress on every device.</p>
          <button onClick={login} disabled={busy} style={{ width: "100%", background: busy ? C.raised : C.you, color: busy ? C.faint : C.youInk, border: "none", borderRadius: 12, padding: "14px", cursor: busy ? "default" : "pointer", fontSize: 15, fontWeight: 600 }}>{busy ? "Opening…" : "Continue with Google"}</button>
          {err && <div style={{ color: C.bad, fontSize: 13, marginTop: 10, lineHeight: 1.5 }}>{err}</div>}
          <p style={{ color: C.faint, fontSize: 12, lineHeight: 1.6, marginTop: 14 }}>The same Google account always loads the same progress, anywhere you sign in.</p>
        </div>
      </div>
    );
  }

  if (loadingStore || store === null) return <div style={wrap}><div style={{ color: C.faint, fontSize: 14 }}>Loading your progress…</div></div>;

  return <Dojo initialStore={store} persist={persist} email={user.email} onSignOut={doSignOut} />;
}
