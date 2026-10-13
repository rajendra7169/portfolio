"use client";

// Sign in, create an account (needed to comment; writers are made writers by
// the admin), get a password-reset link, and choose a new password after
// following one (?mode=reset). Google sign-in works once Supabase is connected.
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { stories, useDemo, useMe, useStories } from "@/lib/stories/store";
import { Loading } from "./ui";

type Mode = "signin" | "signup" | "forgot" | "reset";
const HEAD: Record<Mode, [string, string]> = {
  signin: ["Welcome back", "Sign in to comment and keep your reactions with you."],
  signup: ["Join Stories", "An account lets you comment, and gives you a profile with your own photo and banner."],
  forgot: ["Forgot your password?", "Enter your account's email and we'll send a link for choosing a new one."],
  reset: ["Choose a new password", "You're signed in from the email link. Pick a new password for next time."],
};

export default function SignIn() {
  const sp = useSearchParams();
  const router = useRouter();
  const me = useMe();
  const raw = sp.get("next") ?? "/stories";
  const next = raw.startsWith("/stories") ? raw : "/stories"; // only back into Stories
  const asked = sp.get("mode");
  const [mode, setMode] = useState<Mode>(asked === "signup" || asked === "reset" ? asked : "signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const demo = useDemo();
  // Only offer Google once it's switched on in Supabase (Authentication → Sign In / Providers).
  const { data: options } = useStories((s) => s.authOptions(), []);

  // Signed in already (or just now): back to where they came from, unless they're here to change the password.
  useEffect(() => {
    if (me && mode !== "reset") router.replace(next);
  }, [me, mode, next, router]);

  const run = async (fn: () => Promise<void>, done?: string) => {
    setBusy(true);
    setError("");
    setNote("");
    try {
      await fn();
      if (done) setNote(done);
    } catch (err) {
      const msg = (err as Error).message;
      // Supabase's "check your email" arrives as an error, but it isn't one.
      if (/check your email/i.test(msg)) setNote(msg);
      else setError(msg);
    } finally {
      setBusy(false);
    }
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === "signin") run(() => stories().signIn(email, password));
    else if (mode === "signup") run(() => stories().signUp(name, email, password));
    else if (mode === "forgot") run(() => stories().resetPassword(email), "Check your email: the link to choose a new password is on its way.");
    else
      run(async () => {
        await stories().updatePassword(password);
        window.setTimeout(() => router.replace(next), 1400);
      }, "Password changed. Taking you back…");
  };
  const switchTo = (m: Mode) => {
    setMode(m);
    setError("");
    setNote("");
  };

  if (mode === "reset" && me === undefined) return <Loading label="Checking your link" />;
  const [title, dek] = HEAD[mode];

  return (
    <div className="st-wrap st-auth">
      <div className="st-auth-card">
        <p className="st-auth-mark" lang="ne" aria-hidden="true">
          कथा
        </p>
        <h1>{title}</h1>
        <p className="st-auth-dek">{mode === "reset" && !me ? "This link has expired or was already used. Ask for a new one." : dek}</p>

        {(mode === "signin" || mode === "signup") && (
          <div className="st-auth-switch" role="tablist" aria-label="Sign in or create an account">
            <button type="button" role="tab" aria-selected={mode === "signin"} onClick={() => switchTo("signin")}>
              Sign in
            </button>
            <button type="button" role="tab" aria-selected={mode === "signup"} onClick={() => switchTo("signup")}>
              Create account
            </button>
          </div>
        )}

        {mode === "reset" && !me ? (
          <button type="button" className="st-btn st-btn--wide" onClick={() => switchTo("forgot")}>
            Send a new link
          </button>
        ) : (
          <form className="st-form" onSubmit={submit}>
            {mode === "signup" && (
              <label className="st-field">
                <span>Your name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} autoComplete="name" />
              </label>
            )}
            {mode !== "reset" && (
              <label className="st-field">
                <span>Email</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </label>
            )}
            {mode !== "forgot" && (
              <label className="st-field">
                <span>{mode === "reset" ? "New password" : "Password"}</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />
                {mode !== "signin" && <small>At least 6 characters.</small>}
              </label>
            )}
            {mode === "signin" && (
              <button type="button" className="st-auth-link" onClick={() => switchTo("forgot")}>
                Forgot your password?
              </button>
            )}
            {error && (
              <p className="st-error" role="alert">
                {error}
              </p>
            )}
            {note && (
              <p className="st-ok" role="status">
                {note}
              </p>
            )}
            <button className="st-btn st-btn--wide" disabled={busy}>
              {busy ? "One moment…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send the link" : "Save new password"}
            </button>
            {mode === "forgot" && (
              <button type="button" className="st-auth-link" onClick={() => switchTo("signin")}>
                Back to sign in
              </button>
            )}
          </form>
        )}

        {(mode === "signin" || mode === "signup") && options?.google && (
          <>
            <div className="st-auth-or">
              <span>or</span>
            </div>
            <button type="button" className="st-btn st-btn--ghost st-btn--wide st-google" disabled={busy} onClick={() => run(() => stories().signInWithGoogle())}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8Z" />
                <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23Z" />
                <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8l3.7-2.8Z" />
                <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4Z" />
              </svg>
              Continue with Google
            </button>
          </>
        )}

        {demo && mode !== "reset" && (
          <div className="st-auth-demo">
            <p>
              <b>Demo mode.</b> Accounts made here stay in this browser. To try the writer&apos;s side, open the demo as its owner.
            </p>
            <button type="button" className="st-btn st-btn--ghost" disabled={busy} onClick={() => run(() => stories().signIn("admin@demo", "demo"))}>
              Open the demo as Rajendra (admin)
            </button>
          </div>
        )}
        <p className="st-auth-back">
          <Link href={next}>Back without signing in</Link>
        </p>
      </div>
    </div>
  );
}
