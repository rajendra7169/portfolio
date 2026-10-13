"use client";

// Editing a profile: name, username, bio, photo and banner. Writers and readers
// edit their own from their profile page; the admin edits anyone's.
import { useRef, useState, type FormEvent } from "react";
import { stories } from "@/lib/stories/store";
import type { Profile } from "@/lib/stories/types";
import { Avatar } from "./ui";

const BANNERS = ["/stories/art/hills.svg", "/stories/art/rain.svg", "/stories/art/flags.svg"];

function Upload({ label, folder, onDone }: { label: string; folder: "avatars" | "banners"; onDone: (url: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <button type="button" className="st-btn st-btn--ghost" onClick={() => input.current?.click()} disabled={busy}>
        {busy ? "Uploading…" : label}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          setError("");
          try {
            onDone(await stories().upload(file, folder));
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      />
      {error && (
        <span className="st-error" role="alert">
          {error}
        </span>
      )}
    </>
  );
}

export default function ProfileForm({ profile, onSaved, onCancel }: { profile: Profile; onSaved?: (p: Profile) => void; onCancel?: () => void }) {
  const [draft, setDraft] = useState(profile);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const saved = await stories().saveProfile({
        id: draft.id,
        name: draft.name.trim(),
        username: draft.username,
        bio: draft.bio.trim(),
        avatar: draft.avatar,
        banner: draft.banner,
      });
      onSaved?.(saved);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="st-form st-profile-form" onSubmit={submit}>
      <div className="st-profile-banner-edit" style={draft.banner ? { backgroundImage: `url("${draft.banner}")` } : undefined}>
        <div className="st-profile-banner-tools">
          <Upload label="Upload banner" folder="banners" onDone={(url) => set("banner", url)} />
          {BANNERS.map((b) => (
            <button
              key={b}
              type="button"
              className={`st-banner-pick${draft.banner === b ? " is-on" : ""}`}
              style={{ backgroundImage: `url("${b}")` }}
              aria-label={`Use the ${b.split("/").pop()!.replace(".svg", "")} banner`}
              aria-pressed={draft.banner === b}
              onClick={() => set("banner", b)}
            />
          ))}
          {draft.banner && (
            <button type="button" className="st-btn st-btn--quiet" onClick={() => set("banner", null)}>
              No banner
            </button>
          )}
        </div>
      </div>

      <div className="st-profile-photo-edit">
        <Avatar profile={draft} size={72} />
        <Upload label="Upload photo" folder="avatars" onDone={(url) => set("avatar", url)} />
        {draft.avatar && (
          <button type="button" className="st-btn st-btn--quiet" onClick={() => set("avatar", null)}>
            Remove photo
          </button>
        )}
      </div>

      <label className="st-field">
        <span>Name</span>
        <input value={draft.name} onChange={(e) => set("name", e.target.value)} required maxLength={80} autoComplete="name" />
      </label>
      <label className="st-field">
        <span>Username</span>
        <input value={draft.username} onChange={(e) => set("username", e.target.value.toLowerCase())} required pattern="[a-z0-9_]{2,32}" maxLength={32} />
        <small>Your profile lives at /stories/authors/{draft.username || "…"}. Letters, numbers and underscores.</small>
      </label>
      <label className="st-field">
        <span>Bio</span>
        <textarea value={draft.bio} onChange={(e) => set("bio", e.target.value)} rows={3} maxLength={600} />
        <small>{600 - draft.bio.length} characters left</small>
      </label>

      {error && (
        <p className="st-error" role="alert">
          {error}
        </p>
      )}
      <div className="st-form-row">
        {onCancel && (
          <button type="button" className="st-btn st-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button className="st-btn" disabled={busy}>
          {busy ? "Saving…" : "Save profile"}
        </button>
      </div>
    </form>
  );
}
