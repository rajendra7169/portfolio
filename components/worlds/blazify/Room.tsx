"use client";

// The listening room, live. You host: play, pause, skip or drag the seek bar, and
// each one goes over the wire as a playback_action (proto/listentogether.proto),
// through the server to your friend's phone, which does the same as it lands.
// Only the song and the second travel; each phone streams the audio itself.

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const SONGS: [string, number][] = [
  ["Phewa at Dawn", 214],
  ["Ring Road Lights", 187],
  ["Monsoon Static", 241],
];
const FLY = 700; // ms from your phone to your friend's, through the server
type Deck = { song: number; pos: number; playing: boolean };
type Packet = { id: number; label: string; ping?: boolean };
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const hue = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);

export default function Room({ hub }: { hub: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [me, setMe] = useState<Deck>({ song: 0, pos: 42, playing: true });
  const [friend, setFriend] = useState<Deck>({ song: 0, pos: 42, playing: true });
  const [packets, setPackets] = useState<Packet[]>([]);
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const [lag, setLag] = useState(false);
  const seq = useRef(1);
  const rev = useRef(40);
  const shown = useRef(false);
  const timers = useRef<number[]>([]);
  const mine = useRef(me);
  const held = useRef(0);
  useEffect(() => {
    mine.current = me;
  });

  // Both phones keep their own time; the wire only corrects them.
  useEffect(() => {
    const id = setInterval(() => {
      const step = (d: Deck): Deck => {
        if (!d.playing) return d;
        const len = SONGS[d.song][1];
        return d.pos + 0.25 >= len ? { ...d, song: (d.song + 1) % SONGS.length, pos: 0 } : { ...d, pos: d.pos + 0.25 };
      };
      setMe(step);
      setFriend(step);
    }, 250);
    const io = new IntersectionObserver(([e]) => (shown.current = e.isIntersecting));
    io.observe(root.current!);
    const t = timers.current;
    return () => {
      clearInterval(id);
      io.disconnect();
      t.forEach(clearTimeout);
    };
  }, []);

  const fly = (label: string, text: string, land?: () => void, ping = false) => {
    const id = seq.current++;
    setPackets((p) => [...p, { id, label, ping }]);
    setLog((l) => [{ id, text }, ...l].slice(0, 4));
    if (land) setLag(true);
    timers.current.push(
      window.setTimeout(() => {
        land?.();
        setLag(false);
      }, FLY),
      window.setTimeout(() => setPackets((p) => p.filter((x) => x.id !== id)), FLY + 120),
    );
  };
  const act = (action: string, next: Deck) => {
    setMe(next);
    const r = ++rev.current;
    const label = action === "seek" ? `seek ${mmss(next.pos)}` : action.replace("_", " ");
    fly(label, `playback_action { action: "${action}", position: ${Math.round(next.pos * 1000)}, revision: ${r} }`, () =>
      setFriend({ ...next, pos: next.playing ? next.pos + FLY / 1000 : next.pos }),
    );
  };
  // A ping now and then, the way the app keeps the clocks honest.
  useEffect(() => {
    const id = setInterval(() => {
      if (shown.current && !document.hidden) fly("ping", `ping { sequence: ${seq.current} }`, undefined, true);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  const toggle = () => act(me.playing ? "pause" : "play", { ...me, playing: !me.playing });
  const skip = (dir: 1 | -1) => act(dir > 0 ? "skip_next" : "skip_prev", { ...me, song: (me.song + dir + SONGS.length) % SONGS.length, pos: 0 });
  // Dragging moves your bar at once; the seek goes out when the drag settles.
  const seek = (pos: number) => {
    setMe((m) => ({ ...m, pos }));
    clearTimeout(held.current);
    held.current = window.setTimeout(() => act("seek", { ...mine.current, pos }), 160);
  };

  const card = (who: string, d: Deck, host: boolean) => {
    const [title, len] = SONGS[d.song];
    return (
      <div className={`bz-room-dev${host ? " is-host" : ""}${d.playing ? " is-playing" : ""}`}>
        <span className="bz-room-art" style={{ "--h": hue(title) } as CSSProperties} aria-hidden="true">
          <i />
        </span>
        <b>{who}</b>
        <small>
          {title} · {d.playing ? "playing" : "paused"}
        </small>
        {host ? (
          <input
            type="range"
            className="bz-room-seek"
            min={0}
            max={len}
            step={1}
            value={Math.floor(d.pos)}
            aria-label="Seek"
            aria-valuetext={mmss(d.pos)}
            onChange={(e) => seek(Number(e.target.value))}
            style={{ "--p": `${(d.pos / len) * 100}%` } as CSSProperties}
          />
        ) : (
          <span className="bz-room-bar" aria-hidden="true">
            <i style={{ width: `${(d.pos / len) * 100}%` }} />
          </span>
        )}
        <span className="bz-room-time" aria-hidden="true">
          <span>{mmss(d.pos)}</span>
          <span>{mmss(len)}</span>
        </span>
        {host ? (
          <span className="bz-room-ctrl">
            <button type="button" onClick={() => skip(-1)} aria-label="Previous song">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 6v12l-8.5-6L18 6ZM8 6v12H6V6h2Z" />
              </svg>
            </button>
            <button type="button" className="is-main" onClick={toggle} aria-label={d.playing ? "Pause, for everyone" : "Play, for everyone"}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={d.playing ? "M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" : "M8 5v14l11-7z"} />
              </svg>
            </button>
            <button type="button" onClick={() => skip(1)} aria-label="Next song">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6v12l8.5-6L6 6Zm9.5 0v12h2V6h-2Z" />
              </svg>
            </button>
          </span>
        ) : (
          <span className={`bz-room-sync${lag ? " is-lag" : ""}`}>{lag ? "Catching up…" : "In sync with you"}</span>
        )}
      </div>
    );
  };

  return (
    <div className="bz-room-live" ref={root}>
      <div className="bz-room-scene">
        <span className="bz-room-wire" aria-hidden="true">
          {packets.map((p) => (
            <i key={p.id} className={p.ping ? "is-ping" : undefined} style={{ animationDuration: `${FLY}ms` }}>
              {!p.ping && <b>{p.label}</b>}
            </i>
          ))}
        </span>
        {card("You, hosting", me, true)}
        {card("A friend, joined", friend, false)}
        <div className="bz-room-hub">
          {hub}
          <b>His own server</b>
          <small>Go on Docker, WebSockets and protobuf</small>
        </div>
      </div>
      <ol className="bz-room-log" aria-label="On the wire" aria-live="off">
        {log.length ? (
          log.map((m) => <li key={m.id}>{m.text}</li>)
        ) : (
          <li className="is-hint">Press play, skip or drag the bar on your phone, and watch what crosses the wire.</li>
        )}
      </ol>
    </div>
  );
}
