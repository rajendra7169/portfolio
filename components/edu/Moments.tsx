// The story between the stops on the education path: drawn moments that sit
// on the path between the cards (lib/content.ts `pathMoments` holds their
// words). They follow the same rules as the cards' scenes (Scenes.tsx):
// data-v / data-at say how and when each part comes in, and data-pen marks the
// parts the travelling pen draws or writes itself (data-tool switches the pen
// for that part). Extra kinds used here:
//   write  revealed left to right, as it's written    slam   a stamp landing
//   drop   falls away                                  fly    flies off by data-x / data-y
//   ride   travels along the path whose data-track matches its data-on, or along
//          several in turn (data-route="name@at:duration ..."); data-upright keeps it level
//   toss   thrown up by data-y                         trace  an invisible guide for the pen
//   spin   turns by data-r degrees about data-o (a clock's hands)

const INK = "var(--color-navy)";
const SKY = "#7cc8f0";
const MID = "#2f7fc1";
const PALE = "#a6dff7";
const BOLT = "#f26b38";
const RED = "#d93a3a";
const GREEN = "#1a7f37";
const MUTED = "#7f8dab";
const SKIN = "#e3b48c";
const MONO = { fontFamily: "var(--font-mono)" } as const;
const BODY = { fontFamily: "var(--font-body)" } as const;
const DEVA = { fontFamily: "var(--font-martel), var(--font-body)" } as const;

// A small seeded random, so the hand-drawn lines are the same on every render.
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const f = (n: number) => n.toFixed(1);

/** Joined-up handwriting: a run of loops along a baseline. */
function cursive(x: number, y: number, w: number, h: number, seed: number) {
  const r = rng(seed);
  const a = 3.1; // advance per radian
  let d = `M${f(x)} ${f(y)}`;
  for (let t = 0, b = h; x + a * t < x + w; t += 0.3) {
    if (Math.sin(t) > 0.97) b = h * (0.5 + r() * 0.6);
    d += `L${f(x + a * t - a * 1.55 * Math.sin(t))} ${f(y - (b * (1 - Math.cos(t))) / 2 + Math.sin(t * 0.37) * 1.2)}`;
  }
  return d;
}

/** A smooth curve through points (Catmull-Rom as cubic Béziers). */
function smooth(pts: [number, number][]) {
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [pts[i - 1] ?? pts[i], pts[i], pts[i + 1], pts[i + 2] ?? pts[i + 1]];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

/** A scribbled knot round a centre, ending at `end`. */
function tangle(cx: number, cy: number, R: number, start: [number, number], end: [number, number], seed: number) {
  const r = rng(seed);
  const pts: [number, number][] = [start];
  for (let k = 0; k < 17; k++) {
    const th = k * 2.35 + r() * 0.8;
    const rad = R * (0.3 + r() * 0.7);
    pts.push([cx + Math.cos(th) * rad * 1.25, cy + Math.sin(th) * rad]);
  }
  pts.push(end);
  return smooth(pts);
}

/** A rounded label with a little tail, like a speech bubble. */
function Bubble({ x, y, text, fill = INK, color = "#fff", tail = 14 }: { x: number; y: number; text: string; fill?: string; color?: string; tail?: number }) {
  const w = text.length * 7.6 + 24;
  return (
    <>
      <rect x={x} y={y} width={w} height="26" rx="13" fill={fill} />
      <path d={`M${x + tail} ${y + 24}l-2 10 10-9Z`} fill={fill} />
      <text x={x + 12} y={y + 17.5} fill={color} style={{ ...BODY, fontWeight: 700, fontSize: 13 }}>
        {text}
      </text>
    </>
  );
}

/** A graduation cap, its base's centre at 0,0. */
function Cap({ fill = INK }: { fill?: string }) {
  return (
    <>
      <path d="M-15 -12V-3Q0 5 15-3V-12Q0-6-15-12Z" fill="#0d2a66" />
      <path d="M-30-16 0-28 30-16 0-4Z" fill={fill} />
      <circle cx="0" cy="-16" r="2.4" fill={BOLT} />
      <path d="M0-16Q17-14 21-3" fill="none" stroke={BOLT} strokeWidth="2" />
      <rect x="18.5" y="-4" width="5" height="9" rx="2" fill={BOLT} />
    </>
  );
}

/** Village to Kathmandu: school up in the hills; the pencil draws the road down
    to the city, a bus takes it, and the pencil sketches the college it stops at. */
export function KathmanduScene() {
  const tags: [string, number, number][] = [
    ["new city", 520, 40],
    ["new people", 640, 60],
    ["new place", 540, 102],
    ["new challenges", 662, 122],
  ];
  const hut = (x: number, y: number, at: number) => (
    <g data-v="grow" data-at={at}>
      <rect x={x - 14} y={y - 20} width="28" height="20" fill="#fff" stroke={INK} strokeWidth="1.5" />
      <path d={`M${x - 19} ${y - 18} ${x} ${y - 34} ${x + 19} ${y - 18}Z`} fill="#c2562f" />
      <rect x={x - 4} y={y - 12} width="8" height="12" fill={MID} />
    </g>
  );
  return (
    <svg viewBox="0 0 800 450" className="es es-moment" data-tool="pencil" aria-hidden="true">
      {/* the hills, and the terraces the pencil sketches into them */}
      <path data-v="fade" data-at="0" d="M0 362H800V372C560 396 240 396 0 372Z" fill={PALE} opacity="0.45" />
      <path data-v="fade" data-at="0" d="M-4 362C30 300 96 226 176 220 260 214 340 290 470 362Z" fill={PALE} opacity="0.6" />
      <path data-v="fade" data-at="0.02" d="M30 362C120 322 250 318 400 362Z" fill={SKY} opacity="0.35" />
      {["M110 268C140 250 180 246 214 252", "M60 300C110 270 170 264 230 274", "M40 330C110 300 200 294 290 312"].map((d, i) => (
        <path key={d} data-v="draw" data-pen data-at={(0.04 + i * 0.045).toFixed(3)} data-d="0.035" d={d} fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      ))}
      {hut(318, 300, 0.1)}
      {hut(372, 330, 0.12)}
      <g transform="translate(52 330)">
        <g data-v="pop" data-at="0.06">
          <rect x="-3" y="-34" width="6" height="34" fill="#8a5a3c" />
          <circle cy="-48" r="22" fill="#3f9a6b" />
          <circle cx="-12" cy="-38" r="14" fill="#4fb07c" />
        </g>
      </g>
      {/* the school */}
      <g data-v="grow" data-at="0.08">
        <rect x="96" y="264" width="126" height="66" fill="#fff" stroke={INK} strokeWidth="2" />
        <rect x="108" y="290" width="26" height="18" fill={PALE} stroke={INK} strokeWidth="1.5" />
        <rect x="184" y="290" width="26" height="18" fill={PALE} stroke={INK} strokeWidth="1.5" />
        <rect x="150" y="294" width="18" height="36" fill={MID} />
        <rect x="128" y="270" width="62" height="15" rx="3" fill={BOLT} />
        <text x="159" y="281.5" textAnchor="middle" fill="#fff" style={{ ...DEVA, fontSize: 10, fontWeight: 700 }}>
          विद्यालय
        </text>
      </g>
      <path data-v="fade" data-at="0.08" d="M88 268 158 230 230 268Z" fill={INK} />
      <path data-v="draw" data-at="0.1" d="M240 330V216" stroke={INK} strokeWidth="2" />
      <g transform="translate(240 216)">
        <g data-v="pop" data-at="0.12">
          <path d="M0 0 26 22H10L26 42H0Z" fill="#dc143c" stroke="#003893" strokeWidth="2.4" strokeLinejoin="round" />
        </g>
      </g>

      {/* the road the pencil draws, from the school down to the city */}
      <path data-v="draw" data-at="0.2" data-d="0.22" d="M236 338C292 346 318 384 400 382S500 360 560 362" fill="none" stroke="#fff" strokeWidth="14" strokeLinecap="round" />
      <path data-v="draw" data-pen data-track="road" data-at="0.2" data-d="0.22" d="M236 338C292 346 318 384 400 382S500 360 560 362" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />

      {/* Kathmandu: the mountains behind, the temple, the tower, the city */}
      <path data-v="fade" data-at="0.44" d="M500 362 548 268 572 292 628 200 660 240 700 196 742 248 800 222V362Z" fill="#fff" stroke="rgb(0 28 85 / 0.12)" />
      <path data-v="fade" data-at="0.45" d="M616 220 628 200 640 220 632 216ZM690 212 700 196 712 214 702 210Z" fill={PALE} />
      {(
        [
          [748, 28, 82, MID],
          [778, 24, 58, SKY],
        ] as const
      ).map(([x, w, h, c], i) => (
        <g key={x} data-v="grow" data-at={0.48 + i * 0.03}>
          <rect x={x} y={362 - h} width={w} height={h} fill={c} />
          {Array.from({ length: Math.floor(h / 22) }, (_, k) => (
            <rect key={k} x={x + 6} y={362 - h + 9 + k * 22} width={w - 12} height="7" rx="1.5" fill="#fff" opacity="0.7" />
          ))}
        </g>
      ))}
      <g data-v="grow" data-at="0.52">
        <rect x="662" y="322" width="36" height="40" fill="#c2562f" />
        <path d="M646 326 680 306 714 326ZM654 306 680 290 706 306ZM662 288 680 276 698 288Z" fill={INK} />
        <path d="M680 276V262" stroke={INK} strokeWidth="2" />
        <circle cx="680" cy="260" r="3.5" fill="#f2b33d" />
      </g>
      <g data-v="grow" data-at="0.55">
        <path d="M720 362 724 216H734L738 362Z" fill="#fff" stroke={INK} strokeWidth="1.6" />
        <rect x="717" y="228" width="24" height="5" rx="1" fill={INK} />
        <path d="M722 216Q729 196 736 216Z" fill={INK} />
        <path d="M729 200V184" stroke={INK} strokeWidth="1.6" />
      </g>
      <path data-v="draw" data-at="0.44" d="M500 362H800" stroke={INK} strokeWidth="2" />

      {/* the college, sketched by the pencil, then filled in */}
      <g data-v="fade" data-at="0.76">
        <rect x="532" y="300" width="108" height="52" fill="#fff" />
        <path d="M526 300 586 270 646 300Z" fill={INK} />
        {[540, 560, 580, 600, 620].map((x) => (
          <rect key={x} x={x} y="308" width="10" height="44" rx="2" fill={PALE} />
        ))}
        <rect x="522" y="352" width="128" height="10" fill="#c9d6e3" />
        <circle cx="586" cy="288" r="7" fill="#fff" />
        <path d="M586 284V288H589" fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
      </g>
      <path data-v="draw" data-pen data-at="0.64" data-d="0.12" d="M532 352V300H640V352M526 300 586 270 646 300M522 362V352H650V362" fill="none" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <g transform="translate(586 318)">
        <g data-v="pop" data-at="0.8">
          <rect x="-26" y="-9" width="52" height="15" rx="3" fill={BOLT} />
          <text y="2.5" textAnchor="middle" fill="#fff" style={{ ...BODY, fontSize: 9.5, fontWeight: 800, letterSpacing: 1 }}>
            COLLEGE
          </text>
        </g>
      </g>

      {/* the bus, after the road is drawn, to the college steps */}
      <g data-v="fade" data-at="0.43" data-d="0.02">
        <g data-v="ride" data-on="road" data-at="0.44" data-d="0.18" transform="translate(560 362)">
          <rect x="-26" y="-22" width="52" height="20" rx="5" fill={BOLT} />
          {[-19, -7, 5].map((x) => (
            <rect key={x} x={x} y="-18" width="9" height="7" rx="1.5" fill="#fff" />
          ))}
          <rect x="17" y="-18" width="6" height="11" rx="1.5" fill={PALE} />
          <circle cx="-14" cy="-2" r="5" fill={INK} />
          <circle cx="14" cy="-2" r="5" fill={INK} />
        </g>
      </g>

      {tags.map(([t, x, y], i) => (
        <g key={t} data-v="pop" data-at={0.84 + i * 0.04}>
          <Bubble x={x} y={y} text={t} fill={i % 2 ? MID : INK} />
        </g>
      ))}
    </svg>
  );
}

/** A standing figure, its feet at x,y. */
function Person({ x = 0, y = 0, shirt, hair = INK, long = false, s = 1.25 }: { x?: number; y?: number; shirt: string; hair?: string; long?: boolean; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {long && <rect x="-12" y="-69" width="24" height="31" rx="11" fill={hair} />}
      <rect x="-7" y="-24" width="5" height="24" rx="2" fill={INK} />
      <rect x="2" y="-24" width="5" height="24" rx="2" fill={INK} />
      <path d={long ? "M-15-14-10-44Q0-49 10-44L15-14Z" : "M-12-20Q-12-46 0-46 12-46 12-20Z"} fill={shirt} />
      <circle cy="-56" r="10" fill={SKIN} />
      <path d={long ? "M-10-58C-9-70 9-70 10-58 2-64-4-64-10-58Z" : "M-10-57C-10-70 10-70 10-57 5-63-5-63-10-57Z"} fill={hair} />
    </g>
  );
}

/** A little chat bubble with three dots. */
function Chat({ x, y, at }: { x: number; y: number; at: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g data-v="pop" data-at={at}>
        <rect x="-18" y="-12" width="36" height="22" rx="11" fill="#fff" stroke="rgb(0 28 85 / 0.15)" />
        <path d="M-6 9-10 17-1 10Z" fill="#fff" />
        {[-8, 0, 8].map((dx) => (
          <circle key={dx} cx={dx} cy="-1" r="2.4" fill={MUTED} />
        ))}
      </g>
    </g>
  );
}

/** New in the city: on my own in a crowd, then friends, then on stage hosting a programme. */
export function FriendsScene() {
  const groupA = [128, 168, 208];
  const groupB = [300, 340, 380];
  return (
    <svg viewBox="0 0 800 450" className="es es-moment" data-tool="pencil" aria-hidden="true">
      <path data-v="draw" data-at="0" d="M16 404H784" stroke="rgb(0 28 85 / 0.18)" strokeWidth="2" strokeLinecap="round" />

      {/* the stage, waiting */}
      <rect data-v="fade" data-at="0.02" x="540" y="112" width="240" height="220" fill="#16356e" />
      <path data-v="fade" data-at="0.03" d="M528 98H792V118H528ZM528 118C548 170 540 260 572 330H528ZM792 118C772 170 780 260 748 330H792Z" fill="#a3283a" />
      <rect data-v="fade" data-at="0.04" x="510" y="330" width="290" height="16" rx="3" fill="#c49a6c" />
      <rect data-v="fade" data-at="0.04" x="514" y="346" width="282" height="58" fill="#8a5a3c" />
      <path data-v="fade" data-at="0.05" d="M470 404V384H486V365H498V346H514V404Z" fill="#c49a6c" />

      {/* (the lights come up later, behind whoever is on stage) */}
      <path data-v="fade" data-at="0.74" d="M566 112 540 330H664L602 112ZM752 112 678 330H790Z" fill="#fff8d6" opacity="0.28" />

      {/* two groups, talking among themselves */}
      {[...groupA, ...groupB].map((x, i) => (
        <g key={x} data-v="pop" data-at={0.06 + i * 0.015}>
          <Person x={x} y={402} shirt={[SKY, MID, PALE][i % 3]} long={i === 1 || i === 5} />
        </g>
      ))}
      <Chat x={160} y={292} at={0.16} />
      <Chat x={344} y={288} at={0.19} />

      {/* the way over to them, and on to the stage */}
      <path data-v="draw" data-pen data-track="walk1" data-at="0.26" data-d="0.06" d="M50 404C100 414 190 414 248 404" fill="none" stroke={BOLT} strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
      <g transform="translate(160 292)">
        <g data-v="pop" data-at="0.44">
          <rect x="-18" y="-12" width="36" height="22" rx="11" fill={MID} />
          <path d="M-6 9-10 17-1 10Z" fill={MID} />
          <text y="3.5" textAnchor="middle" fill="#fff" style={{ ...BODY, fontWeight: 800, fontSize: 12 }}>
            hi!
          </text>
        </g>
      </g>
      <path data-v="draw" data-pen data-track="walk2" data-at="0.5" data-d="0.12" d="M248 404C330 414 420 414 470 404L506 346 602 330" fill="none" stroke={BOLT} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />

      {/* me: on my own at first, then walking over, then up on the stage */}
      <g data-v="fade" data-at="0.1">
        <g data-v="ride" data-upright data-route="walk1@0.33:0.09 walk2@0.63:0.12" transform="translate(602 330)">
          <Person shirt={BOLT} />
        </g>
      </g>

      {/* the co-host, and the mics */}
      <g data-v="pop" data-at="0.76">
        <Person x={704} y={330} shirt={MID} long />
      </g>
      {[613, 693].map((x, i) => (
        <g key={x} transform={`translate(${x} 294)`}>
          <g data-v="pop" data-at={0.78 + i * 0.02}>
            <path d="M0 0 4-12" stroke="#2b2b33" strokeWidth="3" strokeLinecap="round" />
            <circle cx="4.5" cy="-14" r="3.6" fill="#2b2b33" />
          </g>
        </g>
      ))}
      <g data-v="pop" data-at="0.8">
        <rect x="514" y="170" width="200" height="40" rx="20" fill="#fff" stroke="rgb(0 28 85 / 0.15)" />
        <path d="M590 208 600 226 604 208Z" fill="#fff" />
      </g>
      <text data-v="write" data-pen data-at="0.83" data-d="0.1" x="536" y="195" fill={INK} style={{ ...BODY, fontWeight: 700, fontSize: 14 }}>
        Good evening, everyone!
      </text>

      {/* and the room claps */}
      {(
        [
          [100, 318],
          [236, 318],
          [272, 314],
          [408, 314],
        ] as const
      ).map(([x, y], i) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <g data-v="pop" data-at={0.93 + i * 0.015}>
            <path d="M-8-4-14-10M0-8V-16M8-4 14-10" stroke={BOLT} strokeWidth="2.2" strokeLinecap="round" />
          </g>
        </g>
      ))}
    </svg>
  );
}

/** After +2: the application, the fees, the flight that never left, refused. */
export function VisaScene() {
  const fields: [string, number][] = [
    ["Full name", 140],
    ["Course of study", 200],
    ["Funds", 260],
  ];
  const notes: [number, number, number, number, number][] = [
    // x, y, tilt, where it flies
    [574, 330, -6, 150, -250],
    [596, 350, 5, 210, -190],
    [618, 370, -2, 120, -300],
  ];
  return (
    <svg viewBox="0 0 800 450" className="es es-moment" data-tool="pen" aria-hidden="true">
      {/* the passport */}
      <g transform="translate(130 240) rotate(-8)">
        <g data-v="pop" data-at="0.02">
          <rect x="-72" y="-98" width="144" height="196" rx="12" fill="#7a1f33" />
          <circle cy="-22" r="28" fill="none" stroke="#e2c27a" strokeWidth="2.2" />
          <path d="M0-40l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1Z" fill="#e2c27a" />
          <text y="40" textAnchor="middle" fill="#e2c27a" style={{ ...BODY, fontWeight: 800, fontSize: 13, letterSpacing: 2 }}>
            PASSPORT
          </text>
          <text y="60" textAnchor="middle" fill="#e2c27a" style={{ ...BODY, fontWeight: 600, fontSize: 10, letterSpacing: 2 }}>
            NEPAL
          </text>
        </g>
      </g>

      {/* the application form, filled in by the pen */}
      <rect data-v="fade" data-at="0.05" x="246" y="38" width="304" height="374" rx="10" fill="#fff" stroke="rgb(0 28 85 / 0.14)" />
      <text data-v="fade" data-at="0.07" x="268" y="74" fill={INK} style={{ ...BODY, fontWeight: 800, fontSize: 15 }}>
        Student visa application
      </text>
      <path data-v="draw" data-at="0.08" d="M268 86H528" stroke={INK} strokeWidth="1.4" />
      <g data-v="fade" data-at="0.09">
        <rect x="470" y="98" width="58" height="68" rx="4" fill="#eef7fc" stroke="rgb(0 28 85 / 0.14)" />
        <circle cx="499" cy="124" r="11" fill={MUTED} opacity="0.5" />
        <path d="M480 160C482 144 516 144 518 160Z" fill={MUTED} opacity="0.5" />
      </g>
      {fields.map(([label, y], i) => (
        <g key={label}>
          <text data-v="fade" data-at={0.1 + i * 0.01} x="268" y={y - 22} fill={MUTED} style={{ ...BODY, fontSize: 11 }}>
            {label}
          </text>
          <path data-v="draw" data-at={0.11 + i * 0.01} d={`M268 ${y}H${i ? 528 : 456}`} stroke="rgb(0 28 85 / 0.25)" strokeWidth="1.2" />
          <path data-v="draw" data-pen data-at={(0.17 + i * 0.1).toFixed(2)} data-d="0.085" d={cursive(274, y - 5, i ? 190 : 150, 10, 3 + i)} fill="none" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
        </g>
      ))}
      <text data-v="fade" data-at="0.13" x="268" y="318" fill={MUTED} style={{ ...BODY, fontSize: 11 }}>
        Signature
      </text>
      <path data-v="draw" data-at="0.14" d="M268 360H420" stroke="rgb(0 28 85 / 0.25)" strokeWidth="1.2" />
      <path data-v="draw" data-pen data-at="0.47" data-d="0.07" d={`${cursive(276, 352, 110, 22, 9)}l18 -4`} fill="none" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />

      {/* the fees, paid */}
      {notes.map(([x, y, tilt, dx, dy], i) => (
        <g key={x} transform={`translate(${x} ${y}) rotate(${tilt})`}>
          <g data-v="fly" data-at={0.84 + i * 0.03} data-x={dx} data-y={dy} data-r={i % 2 ? 50 : -60}>
            <g data-v="pop" data-at={0.55 + i * 0.03}>
              <rect x="-46" y="-22" width="92" height="44" rx="4" fill="#efe3c2" stroke="#b89b5e" strokeWidth="1.4" />
              <circle cx="24" r="11" fill="none" stroke="#b89b5e" strokeWidth="1.2" />
              <text x="-36" y="6" fill="#7a5b2a" style={{ ...DEVA, fontWeight: 700, fontSize: 14 }}>
                रु १०००
              </text>
            </g>
          </g>
        </g>
      ))}

      {/* the flight it was for */}
      <path data-v="draw" data-pen data-at="0.62" data-d="0.07" d="M552 118C618 40 690 30 744 78" fill="none" stroke={MID} strokeWidth="2.4" strokeLinecap="round" />
      <g transform="translate(748 82) rotate(30)">
        <g data-v="drop" data-at="0.86">
          <g data-v="pop" data-at="0.69">
            <path d="M-18-3 6-3 18-16 24-16 16-3 22-3 26-8 30-8 27 0 30 8 26 8 22 3 16 3 24 16 18 16 6 3-18 3Q-24 0-18-3Z" fill={INK} />
          </g>
        </g>
      </g>

      {/* refused */}
      <g transform="translate(398 230) rotate(-14)">
        <g data-v="slam" data-at="0.76">
          <rect x="-128" y="-34" width="256" height="68" rx="12" fill="rgb(217 58 58 / 0.07)" stroke={RED} strokeWidth="4" />
          <rect x="-120" y="-26" width="240" height="52" rx="8" fill="none" stroke={RED} strokeWidth="1.4" />
          <text y="11" textAnchor="middle" fill={RED} style={{ ...BODY, fontWeight: 900, fontSize: 30, letterSpacing: 1 }}>
            VISA REFUSED
          </text>
        </g>
      </g>
    </svg>
  );
}

/** BBS, left; a knot of worry; then one straight line to a screen. */
export function BbsScene() {
  const marks: [number, number, number][] = [
    [296, 122, 36],
    [508, 112, 28],
    [318, 340, 26],
    [470, 344, 40],
    [404, 92, 22],
  ];
  return (
    <svg viewBox="0 0 800 450" className="es es-moment" data-tool="pen" aria-hidden="true">
      {/* the admission card, struck out */}
      <g transform="translate(140 196) rotate(-5)">
        <g data-v="pop" data-at="0.02">
          <rect x="-112" y="-82" width="224" height="164" rx="14" fill="#fff" stroke="rgb(0 28 85 / 0.14)" />
          <path d="M-112-68a14 14 0 0 1 14-14H98a14 14 0 0 1 14 14v18H-112Z" fill={INK} />
          <text x="-96" y="-60" fill="#fff" style={{ ...BODY, fontWeight: 700, fontSize: 12 }}>
            Admission
          </text>
          <text x="-96" y="2" fill={INK} style={{ ...BODY, fontWeight: 900, fontSize: 44 }}>
            BBS
          </text>
          <text x="-96" y="26" fill={MUTED} style={{ ...BODY, fontSize: 11.5 }}>
            Bachelor of Business Studies
          </text>
          <rect x="-96" y="42" width="120" height="6" rx="3" fill="rgb(0 28 85 / 0.12)" />
          <rect x="-96" y="56" width="84" height="6" rx="3" fill="rgb(0 28 85 / 0.12)" />
        </g>
        <path data-v="draw" data-pen data-at="0.1" data-d="0.06" d="M-100-12C-40-22 40-4 100-18" fill="none" stroke={RED} strokeWidth="4" strokeLinecap="round" />
        <text data-v="write" data-pen data-at="0.18" data-d="0.05" x="42" y="62" fill={RED} style={{ ...BODY, fontStyle: "italic", fontWeight: 800, fontSize: 22 }}>
          left
        </text>
      </g>

      {/* stress and confusion, then a way out */}
      <path data-v="draw" data-pen data-at="0.27" data-d="0.24" d={tangle(400, 226, 92, [292, 252], [488, 232], 11)} fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      {marks.map(([x, y, s], i) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <g data-v="pop" data-at={0.5 + i * 0.025}>
            <text textAnchor="middle" y={s * 0.35} fill={i % 2 ? BOLT : MUTED} style={{ ...BODY, fontWeight: 900, fontSize: s }}>
              ?
            </text>
          </g>
        </g>
      ))}
      <path data-v="draw" data-pen data-at="0.64" data-d="0.05" d="M488 232H600" fill="none" stroke={MID} strokeWidth="3" strokeLinecap="round" />

      {/* the screen that caught my interest */}
      <circle data-v="fade" data-at="0.68" cx="690" cy="186" r="118" fill={PALE} opacity="0.35" />
      <rect data-v="fade" data-at="0.66" x="600" y="120" width="180" height="128" rx="12" fill={INK} />
      <rect data-v="fade" data-at="0.67" x="610" y="130" width="160" height="108" rx="6" fill="#0b1f45" />
      <rect data-v="fade" data-at="0.71" x="610" y="130" width="160" height="108" rx="6" fill="#16356e" />
      <rect data-v="fade" data-at="0.66" x="680" y="248" width="20" height="22" fill={INK} />
      <rect data-v="fade" data-at="0.66" x="652" y="268" width="76" height="9" rx="4" fill={INK} />
      <g transform="translate(690 180)">
        <g data-v="pop" data-at="0.74">
          <text textAnchor="middle" y="10" fill={SKY} style={{ ...MONO, fontWeight: 700, fontSize: 30 }}>
            {"</>"}
          </text>
        </g>
      </g>
      <text data-v="write" data-pen data-tool="cursor" data-at="0.82" data-d="0.1" x="628" y="222" fill="#7ee2a8" style={{ ...MONO, fontSize: 14 }}>
        Hello, world
      </text>
    </svg>
  );
}

/** The hard part: failed subjects, sat again and passed; late nights; and the
    final-year project, accepted the first time. */
export function HustleScene() {
  const rows: [number, boolean][] = [
    [118, true],
    [96, false],
    [130, true],
    [104, true],
    [122, false],
    [88, true],
  ];
  return (
    <svg viewBox="0 0 800 450" className="es es-moment" data-tool="pen" aria-hidden="true">
      {/* the results */}
      <g transform="translate(40 52) rotate(-3)">
        <rect data-v="fade" data-at="0" width="250" height="330" rx="8" fill="#fff" stroke="rgb(0 28 85 / 0.14)" />
        <text data-v="fade" data-at="0.02" x="22" y="38" fill={INK} style={{ ...BODY, fontWeight: 800, fontSize: 15 }}>
          Semester results
        </text>
        <path data-v="draw" data-at="0.03" d="M22 50H228" stroke={INK} strokeWidth="1.4" />
        {rows.map(([w, pass], k) => {
          const y = 86 + k * 40;
          return (
            <g key={k}>
              <rect data-v="fade" data-at={0.04 + k * 0.012} x="22" y={y - 9} width={w} height="9" rx="4.5" fill="rgb(0 28 85 / 0.14)" />
              <text data-v="fade" data-at={0.05 + k * 0.012} x="160" y={y} fill={pass ? GREEN : RED} style={{ ...BODY, fontWeight: 800, fontSize: 13 }}>
                {pass ? "Pass" : "Fail"}
              </text>
            </g>
          );
        })}
        {/* the fails, sat again: struck out and passed */}
        {rows.flatMap(([, pass], k) =>
          pass
            ? []
            : [
                <path key={`s${k}`} data-v="draw" data-pen data-at={(0.14 + (k === 1 ? 0 : 0.12)).toFixed(2)} data-d="0.03" d={`M156 ${81 + k * 40}H192`} stroke={RED} strokeWidth="2.6" strokeLinecap="round" />,
                <text key={`p${k}`} data-v="write" data-pen data-at={(0.18 + (k === 1 ? 0 : 0.12)).toFixed(2)} data-d="0.04" x="198" y={86 + k * 40} fill={GREEN} style={{ ...BODY, fontStyle: "italic", fontWeight: 800, fontSize: 13 }}>
                  Pass
                </text>,
              ],
        )}
      </g>

      {/* the late nights */}
      <g transform="translate(470 66)">
        <g data-v="pop" data-at="0.34">
          <path d="M12-18A20 20 0 1 0 22 16 16 16 0 1 1 12-18Z" fill="#ffc83d" />
        </g>
      </g>
      <circle data-v="fade" data-at="0.34" cx="400" cy="160" r="54" fill="#fff" stroke={INK} strokeWidth="3" />
      {Array.from({ length: 12 }, (_, k) => {
        const a = (k / 12) * Math.PI * 2;
        return <path key={k} data-v="fade" data-at={0.35} d={`M${f(400 + Math.cos(a) * 44)} ${f(160 + Math.sin(a) * 44)}L${f(400 + Math.cos(a) * 50)} ${f(160 + Math.sin(a) * 50)}`} stroke={INK} strokeWidth={k % 3 ? 1.4 : 2.6} />;
      })}
      <path data-v="spin" data-at="0.36" data-d="0.24" data-r="1440" data-o="400 160" d="M400 160V122" stroke={MID} strokeWidth="2.6" strokeLinecap="round" />
      <path data-v="spin" data-at="0.36" data-d="0.24" data-r="120" data-o="400 160" d="M400 160H428" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <circle data-v="fade" data-at="0.35" cx="400" cy="160" r="4" fill={BOLT} />
      <path data-v="draw" data-at="0.36" d="M318 392H482" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      {(
        [
          [330, 16, 120, MID],
          [334, 14, 128, BOLT],
          [328, 15, 112, SKY],
        ] as const
      ).map(([x, h, w, c], k) => (
        <rect key={k} data-v="grow" data-at={0.4 + k * 0.03} x={x} y={392 - (k + 1) * 16} width={w} height={h} rx="3" fill={c} />
      ))}
      {[0, 1, 2].map((k) => (
        <g key={k} data-v="pop" data-at={0.44 + k * 0.05}>
          <rect x={410 + k * 22} y="324" width="18" height="20" rx="4" fill="#fff" stroke={INK} strokeWidth="1.8" />
          <path d={`M${428 + k * 22} 328c7 0 7 10 0 10`} fill="none" stroke={INK} strokeWidth="1.8" />
        </g>
      ))}

      {/* the final-year project, accepted the first time */}
      <g transform="translate(546 56) rotate(2)">
        <rect data-v="fade" data-at="0.56" width="220" height="330" rx="8" fill="#fff" stroke="rgb(0 28 85 / 0.14)" />
        <text data-v="write" data-pen data-tool="cursor" data-at="0.6" data-d="0.05" x="20" y="40" fill={INK} style={{ ...BODY, fontWeight: 800, fontSize: 14.5 }}>
          Final year project
        </text>
        <text data-v="fade" data-at="0.64" x="20" y="60" fill={MUTED} style={{ ...BODY, fontSize: 10.5 }}>
          Laundry Recommendation System
        </text>
        {[170, 150, 176, 120].map((w, j) => (
          <path key={j} data-v="draw" data-pen data-at={(0.67 + j * 0.025).toFixed(3)} data-d="0.02" d={`M20 ${88 + j * 15}h${w}`} stroke="rgb(0 28 85 / 0.2)" strokeWidth="4" strokeLinecap="round" />
        ))}
        <rect data-v="fade" data-at="0.77" x="20" y="152" width="180" height="78" rx="6" fill="#eef7fc" />
        {[24, 40, 32, 54, 46].map((h, j) => (
          <rect key={j} data-v="grow" data-at={0.78 + j * 0.012} x={34 + j * 32} y={218 - h} width="18" height={h} rx="3" fill={j === 3 ? MID : SKY} />
        ))}
        <g transform="translate(110 280) rotate(-10)">
          <g data-v="slam" data-at="0.87">
            <rect x="-86" y="-30" width="172" height="58" rx="10" fill="rgb(26 127 55 / 0.08)" stroke={GREEN} strokeWidth="3.6" />
            <text y="2" textAnchor="middle" fill={GREEN} style={{ ...BODY, fontWeight: 900, fontSize: 24, letterSpacing: 1 }}>
              ACCEPTED
            </text>
            <text y="19" textAnchor="middle" fill={GREEN} style={{ ...BODY, fontWeight: 700, fontSize: 10.5, letterSpacing: 1.5 }}>
              FIRST SUBMISSION
            </text>
          </g>
        </g>
      </g>
      {(
        [
          [770, 330],
          [740, 400],
          [540, 404],
        ] as const
      ).map(([x, y], i) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <g data-v="pop" data-at={0.94 + i * 0.015}>
            <path d="M0-10 2.6-2.6 10 0 2.6 2.6 0 10-2.6 2.6-10 0-2.6-2.6Z" fill="#ffc83d" />
          </g>
        </g>
      ))}
    </svg>
  );
}

/** Convocation: the pen comes in as a cap and lands on my head. */
export function ConvocationScene() {
  const r = rng(5);
  const confetti = Array.from({ length: 16 }, (_, i) => [60 + r() * 680, 150 + r() * 220, r() * 360, ["#001c55", MID, SKY, BOLT, "#ffc83d"][i % 5]] as const);
  const caps: [number, number, number][] = [
    [190, 360, 190],
    [278, 392, 230],
    [528, 388, 210],
    [616, 356, 180],
  ];
  return (
    <svg viewBox="0 0 800 450" className="es es-moment" data-tool="cap" aria-hidden="true">
      {/* the bunting and the banner */}
      <path data-v="draw" data-at="0.02" d="M30 34Q400 96 770 34" fill="none" stroke={INK} strokeWidth="1.6" />
      {Array.from({ length: 13 }, (_, i) => {
        const x = 70 + i * 55;
        const y = 34 + ((96 - 34) * 2 * (x - 30) * (770 - x)) / (740 * 740);
        return <path key={i} data-v="pop" data-at={0.04 + i * 0.008} d={`M${x - 12} ${y}h24l-12 22Z`} fill={[MID, BOLT, SKY, "#ffc83d"][i % 4]} />;
      })}
      <text data-v="fade" data-at="0.12" x="400" y="134" textAnchor="middle" fill={INK} style={{ ...BODY, fontWeight: 800, fontSize: 28, letterSpacing: -0.5 }}>
        Class of 2024
      </text>

      {/* me, in the gown, with the degree */}
      <g data-v="grow" data-at="0.16">
        <path d="M350 420 370 252Q400 238 430 252L450 420Z" fill={INK} />
        <path d="M384 252 374 420H390L398 256ZM416 252 426 420H410L402 256Z" fill={BOLT} />
        <path d="M388 250 400 272 412 250Z" fill="#fff" />
        <circle cx="400" cy="216" r="24" fill={SKIN} />
        <path d="M376 212C376 186 424 186 424 212C414 200 388 198 376 212Z" fill={INK} />
        <path d="M391 224Q400 231 409 224" fill="none" stroke="#7a4a2c" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g transform="translate(454 304) rotate(-28)">
        <g data-v="pop" data-at="0.22">
          <rect x="-28" y="-8" width="56" height="16" rx="8" fill="#fff" stroke="rgb(0 28 85 / 0.2)" />
          <rect x="-4" y="-9" width="8" height="18" fill={RED} />
        </g>
      </g>
      {/* the cap that stays on, once the pen has moved on */}
      <g transform="translate(400 194)">
        <g data-v="pop" data-at="0.95" data-d="0.04">
          <Cap />
        </g>
      </g>
      {/* the pen's flight: up over the banner and down onto my head */}
      <path data-v="trace" data-pen data-tool="cap" data-at="0.3" data-d="0.3" d="M108 380C150 120 300 30 400 194" fill="none" />

      {/* everyone else's caps, thrown */}
      {caps.map(([x, y, up], i) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <g data-v="toss" data-at={0.56 + i * 0.03} data-d="0.24" data-y={up}>
            <g transform="scale(0.75)">
              <Cap fill={i % 2 ? MID : INK} />
            </g>
          </g>
        </g>
      ))}
      {confetti.map(([x, y, rot, c], i) => (
        <g key={i} transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)})`}>
          <rect data-v="pop" data-at={0.62 + (i % 8) * 0.012} x="-4" y="-2" width="8" height="4" rx="1" fill={c} />
        </g>
      ))}
    </svg>
  );
}

/** Here now: the desk, and a few lines of code that say it. */
export function NowScene() {
  const code: { at: number; d: number; parts: [string, string][] }[] = [
    { at: 0.12, d: 0.06, parts: [["const", SKY], [" me = {", "#e9f4fb"]] },
    { at: 0.22, d: 0.13, parts: [["  from: ", "#9ad7ff"], ['"a village school"', "#ffb38f"], [",", "#e9f4fb"]] },
    { at: 0.4, d: 0.13, parts: [["  now: ", "#9ad7ff"], ['"Matrika Technology"', "#ffb38f"], [",", "#e9f4fb"]] },
    { at: 0.58, d: 0.08, parts: [["  learning: ", "#9ad7ff"], ["true", BOLT], [",", "#e9f4fb"]] },
    { at: 0.7, d: 0.03, parts: [["};", "#e9f4fb"]] },
  ];
  return (
    <svg viewBox="0 0 800 450" className="es es-moment" data-tool="cursor" aria-hidden="true">
      <path data-v="draw" data-at="0.02" d="M24 392H776" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      {/* the laptop */}
      <rect data-v="fade" data-at="0.04" x="186" y="96" width="372" height="244" rx="14" fill={INK} />
      <rect data-v="fade" data-at="0.05" x="200" y="110" width="344" height="216" rx="6" fill="#0b1f45" />
      <path data-v="fade" data-at="0.05" d="M150 340H594L616 380Q618 392 604 392H140Q126 392 128 380Z" fill="#c9d6e3" />
      <rect data-v="fade" data-at="0.06" x="330" y="348" width="84" height="6" rx="3" fill="#9fb2c6" />
      {code.map((line, i) => (
        <text key={i} data-v="write" data-pen data-at={line.at} data-d={line.d} x="222" y={156 + i * 32} xmlSpace="preserve" style={{ ...MONO, fontSize: 15, whiteSpace: "pre" }}>
          {line.parts.map(([t, c], j) => (
            <tspan key={j} fill={c}>
              {t}
            </tspan>
          ))}
        </text>
      ))}
      {/* the mug, the plant and the badge */}
      <g data-v="pop" data-at="0.76">
        <rect x="628" y="326" width="48" height="64" rx="9" fill="#fff" stroke={INK} strokeWidth="2.2" />
        <path d="M676 342c18 0 18 30 0 30" fill="none" stroke={INK} strokeWidth="2.2" />
        <rect x="636" y="346" width="32" height="8" rx="4" fill={SKY} />
      </g>
      {["M642 314c-8-12 8-18 0-30", "M660 316c-8-12 8-18 0-30"].map((d, i) => (
        <path key={d} data-v="draw" data-at={0.8 + i * 0.03} d={d} fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round" />
      ))}
      <g data-v="grow" data-at="0.84">
        <path d="M70 334h40l-5 58H75Z" fill={BOLT} />
        <path d="M90 334C86 300 60 296 54 280c22 0 34 18 36 54ZM90 334c2-36 18-54 40-56-6 18-30 22-40 56ZM90 334c0-30 6-46 0-62-8 16-4 34 0 62Z" fill="#3f9a6b" />
      </g>
      <g transform="translate(726 364) rotate(10)">
        <g data-v="pop" data-at="0.88">
          <rect x="-26" y="-34" width="52" height="66" rx="7" fill="#fff" stroke="rgb(0 28 85 / 0.2)" />
          <rect x="-26" y="-34" width="52" height="16" rx="7" fill={MID} />
          <circle cy="-2" r="9" fill={PALE} />
          <rect x="-16" y="12" width="32" height="5" rx="2.5" fill="rgb(0 28 85 / 0.2)" />
          <rect x="-11" y="21" width="22" height="4" rx="2" fill="rgb(0 28 85 / 0.14)" />
        </g>
      </g>
    </svg>
  );
}

/** The travelling pen: each tool is drawn with its tip at 0,0. */
export function PenTools() {
  return (
    <div className="ep-pen" aria-hidden="true">
      <span className="ep-pen-tool" data-tool="pencil">
        <svg viewBox="-4 -78 82 82" width="82" height="82" style={{ left: -4, top: -78 }}>
          <g transform="rotate(-45)">
            <path d="M7 -3 18 -6.5V6.5L7 3Z" fill="#f4d4a4" />
            <path d="M0 0 7 -3V3Z" fill="#2b2b33" />
            <rect x="18" y="-6.5" width="62" height="13" fill="#ffc83d" />
            <rect x="18" y="-2" width="62" height="4" fill="#f0a92a" />
            <rect x="80" y="-6.5" width="8" height="13" fill="#b9c4cf" />
            <rect x="88" y="-6.5" width="11" height="13" rx="3.5" fill="#f49ab0" />
          </g>
        </svg>
      </span>
      <span className="ep-pen-tool" data-tool="pen">
        <svg viewBox="-4 -78 82 82" width="82" height="82" style={{ left: -4, top: -78 }}>
          <g transform="rotate(-45)">
            <path d="M0 0 13 -4.5V4.5Z" fill="#c9d3de" />
            <path d="M3 0H11" stroke="#7f8dab" strokeWidth="1" />
            <rect x="13" y="-5.5" width="16" height="11" rx="2" fill="#001c55" />
            <rect x="29" y="-6" width="62" height="12" rx="2" fill="#2f7fc1" />
            <rect x="91" y="-6" width="9" height="12" rx="4" fill="#001c55" />
            <rect x="66" y="-8.5" width="30" height="3" rx="1.5" fill="#dfe9f2" />
          </g>
        </svg>
      </span>
      <span className="ep-pen-tool" data-tool="cursor">
        <svg viewBox="-7 -32 14 34" width="14" height="34" style={{ left: -7, top: -32 }}>
          <rect x="-2" y="-30" width="4" height="30" rx="1.5" fill="#f26b38" stroke="#fff" strokeWidth="1.2" />
        </svg>
      </span>
      <span className="ep-pen-tool" data-tool="cap">
        <svg viewBox="-36 -34 72 44" width="72" height="44" style={{ left: -36, top: -34 }}>
          <Cap />
        </svg>
      </span>
    </div>
  );
}

export const MOMENTS = {
  kathmandu: KathmanduScene,
  friends: FriendsScene,
  visa: VisaScene,
  bbs: BbsScene,
  project: HustleScene,
  convocation: ConvocationScene,
  now: NowScene,
} as const;
