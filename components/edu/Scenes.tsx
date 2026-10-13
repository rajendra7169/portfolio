// What each stop on the education path was about, drawn instead of written:
// the scenes sit where a card's bullet points were (the points stay in the
// page for screen readers). EduPathMotion builds each one as the card scrolls
// by, from the data-v (how) and data-at (when, 0 to 1) on its parts:
//   draw  a stroke draws itself     fade  fades up
//   pop   scales in                 grow  rises from its foot
// Nothing animated carries an SVG transform attribute (GSAP writes its own),
// so anything placed with one is wrapped in a group; and nothing drawn is
// dashed, since drawing takes over the dash pattern.

const INK = "var(--color-navy)";
const SKY = "#7cc8f0";
const MID = "#2f7fc1";
const PALE = "#a6dff7";
const BOLT = "#f26b38";
const GREEN = "#1a7f37";
const MUTED = "#7f8dab";
const RULE = "rgb(0 28 85 / 0.08)";
const MONO = { fontFamily: "var(--font-mono)" } as const;
const BODY = { fontFamily: "var(--font-body)" } as const;
const DEVA = { fontFamily: "var(--font-martel), var(--font-body)" } as const;

/** School: an exercise book, letters and numbers on one page and geometry on the other. */
export function SchoolScene() {
  const lines = Array.from({ length: 9 }, (_, i) => 74 + i * 32);
  return (
    <svg viewBox="0 0 600 400" className="es es-school" aria-hidden="true">
      {/* the cover peeking out, then the two pages */}
      <rect data-v="fade" data-at="0" x="18" y="30" width="564" height="348" rx="16" fill={MID} />
      <rect data-v="fade" data-at="0.02" x="28" y="22" width="272" height="344" rx="10" fill="#fff" />
      <rect data-v="fade" data-at="0.02" x="300" y="22" width="272" height="344" rx="10" fill="#fff" />
      <path data-v="draw" data-at="0.04" d="M300 22V366" stroke="rgb(0 28 85 / 0.16)" strokeWidth="2" />
      {lines.map((y, i) => (
        <path key={y} data-v="draw" data-at={0.05 + i * 0.008} d={`M40 ${y}H288M312 ${y}H560`} stroke={RULE} strokeWidth="1.2" />
      ))}
      <path data-v="draw" data-at="0.08" d="M66 34V354" stroke="rgb(242 107 56 / 0.45)" strokeWidth="1.4" />

      {/* left page: the alphabet, in two scripts, and the numbers */}
      {["क", "ख", "ग", "घ", "ङ"].map((c, i) => (
        <text key={c} data-v="fade" data-at={0.12 + i * 0.03} x={84 + i * 42} y="98" fill={INK} style={{ ...DEVA, fontSize: 25, fontWeight: 600 }}>
          {c}
        </text>
      ))}
      {["A", "B", "C", "D", "E"].map((c, i) => (
        <text key={c} data-v="fade" data-at={0.28 + i * 0.03} x={86 + i * 42} y="162" fill={MID} style={{ ...BODY, fontSize: 24, fontWeight: 700 }}>
          {c}
        </text>
      ))}
      {["१", "२", "३", "४", "५"].map((c, i) => (
        <text key={c} data-v="fade" data-at={0.42 + i * 0.03} x={86 + i * 42} y="226" fill={INK} style={{ ...DEVA, fontSize: 24, fontWeight: 600 }}>
          {c}
        </text>
      ))}
      <text data-v="fade" data-at="0.56" x="84" y="290" fill={INK} style={{ ...MONO, fontSize: 18 }}>
        12 + 29 = 41
      </text>
      {/* the teacher's tick and a star */}
      <path data-v="draw" data-at="0.62" d="M222 286l8 9 18-22" fill="none" stroke="#d93a3a" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <g transform="translate(236 334)">
        <g data-v="pop" data-at="0.68">
          <path d="M0-17l5 10.5 11.5 1.5-8.4 8 2 11.4L0 9 -10.1 14.4l2-11.4L-16.5-5 -5-6.5Z" fill="#ffc83d" stroke="#e0a100" strokeWidth="1.4" strokeLinejoin="round" />
        </g>
      </g>

      {/* right page: a compass circle, a times table and Pythagoras */}
      <path data-v="draw" data-at="0.3" d="M372 126m-40 0a40 40 0 1 0 80 0a40 40 0 1 0-80 0" fill="none" stroke={INK} strokeWidth="1.8" />
      <path data-v="draw" data-at="0.4" d="M372 126H412" stroke={BOLT} strokeWidth="1.8" />
      <g transform="translate(372 126)">
        <g data-v="pop" data-at="0.38">
          <circle r="3.4" fill={INK} />
        </g>
      </g>
      <text data-v="fade" data-at="0.44" x="388" y="120" fill={BOLT} style={{ ...MONO, fontSize: 12 }}>
        r
      </text>
      {["7 × 6 = 42", "7 × 7 = 49", "7 × 8 = 56"].map((t, i) => (
        <text key={t} data-v="fade" data-at={0.46 + i * 0.04} x="440" y={98 + i * 32} fill={INK} style={{ ...MONO, fontSize: 14 }}>
          {t}
        </text>
      ))}
      <path data-v="draw" data-at="0.6" d="M340 298V204L470 298Z" fill="none" stroke={MID} strokeWidth="2.2" strokeLinejoin="round" />
      <path data-v="draw" data-at="0.7" d="M340 284H354V298" fill="none" stroke={MID} strokeWidth="1.6" />
      {[
        ["a", 324, 256],
        ["b", 400, 318],
        ["c", 412, 244],
      ].map(([t, x, y], i) => (
        <text key={t} data-v="fade" data-at={0.72 + i * 0.02} x={x} y={y} fill={MID} style={{ ...MONO, fontSize: 14, fontStyle: "italic" }}>
          {t}
        </text>
      ))}
      <text data-v="fade" data-at="0.8" x="340" y="350" fill={INK} style={{ ...MONO, fontSize: 15, fontWeight: 700 }}>
        a² + b² = c²
      </text>
    </svg>
  );
}

/** +2 in Business Studies: a journal page that writes and balances itself, and a statistics note. */
export function LedgerScene() {
  const rows = [
    ["Apr 1", "Cash A/c", "Dr.", "5,000", ""],
    ["", "To Capital A/c", "", "", "5,000"],
    ["Apr 9", "Purchases A/c", "Dr.", "2,000", ""],
    ["", "To Cash A/c", "", "", "2,000"],
    ["Apr 14", "Cash A/c", "Dr.", "3,500", ""],
    ["", "To Sales A/c", "", "", "3,500"],
  ];
  const y0 = 116;
  return (
    <svg viewBox="0 0 600 400" className="es es-ledger" aria-hidden="true">
      {/* the page */}
      <rect data-v="fade" data-at="0" x="14" y="24" width="390" height="352" rx="14" fill="#fff" stroke="rgb(0 28 85 / 0.12)" />
      <text data-v="fade" data-at="0.02" x="34" y="58" fill={INK} style={{ ...BODY, fontWeight: 800, fontSize: 18 }}>
        Journal
      </text>
      <text data-v="fade" data-at="0.04" x="384" y="58" textAnchor="end" fill={MUTED} style={{ ...MONO, fontSize: 11 }}>
        2015–16
      </text>
      {/* columns */}
      {(
        [
          ["Date", 34, "start"],
          ["Particulars", 96, "start"],
          ["Dr. Rs", 308, "end"],
          ["Cr. Rs", 384, "end"],
        ] as const
      ).map(([t, x, anchor], i) => (
        <text key={t} data-v="fade" data-at={0.06 + i * 0.01} x={x} y="88" textAnchor={anchor} fill={MUTED} style={{ ...BODY, fontWeight: 600, fontSize: 11.5 }}>
          {t}
        </text>
      ))}
      <path data-v="draw" data-at="0.08" d="M30 96H390" stroke={INK} strokeWidth="1.5" />
      {[88, 242, 320].map((x, i) => (
        <path key={x} data-v="draw" data-at={0.1 + i * 0.02} d={`M${x} 74V306`} stroke="rgb(0 28 85 / 0.14)" strokeWidth="1" />
      ))}
      {rows.map((_, i) => (
        <path key={i} data-v="draw" data-at={0.12 + i * 0.015} d={`M30 ${y0 + i * 30 + 10}H390`} stroke={RULE} strokeWidth="1" />
      ))}
      {/* the entries, one after another */}
      {rows.map(([date, part, dr, a, b], i) => (
        <g key={i} data-v="fade" data-at={0.2 + i * 0.075}>
          <text x="34" y={y0 + i * 30} fill={MUTED} style={{ ...MONO, fontSize: 11 }}>
            {date}
          </text>
          <text x={b ? 112 : 96} y={y0 + i * 30} fill={INK} style={{ ...BODY, fontSize: 13.5 }}>
            {part}
          </text>
          {dr && (
            <text x="236" y={y0 + i * 30} textAnchor="end" fill={MUTED} style={{ ...BODY, fontSize: 12 }}>
              {dr}
            </text>
          )}
          <text x="308" y={y0 + i * 30} textAnchor="end" fill={INK} style={{ ...MONO, fontSize: 12.5 }}>
            {a}
          </text>
          <text x="384" y={y0 + i * 30} textAnchor="end" fill={INK} style={{ ...MONO, fontSize: 12.5 }}>
            {b}
          </text>
        </g>
      ))}
      {/* the totals, double-ruled, and the tick */}
      <path data-v="draw" data-at="0.68" d="M250 300H390" stroke={INK} strokeWidth="1.4" />
      <path data-v="draw" data-at="0.78" d="M250 334H390M250 339H390" stroke={INK} strokeWidth="1.4" />
      <text data-v="fade" data-at="0.72" x="96" y="322" fill={INK} style={{ ...BODY, fontWeight: 700, fontSize: 13.5 }}>
        Total
      </text>
      <text data-v="fade" data-at="0.74" x="308" y="322" textAnchor="end" fill={INK} style={{ ...MONO, fontSize: 13, fontWeight: 700 }}>
        10,500
      </text>
      <text data-v="fade" data-at="0.76" x="384" y="322" textAnchor="end" fill={INK} style={{ ...MONO, fontSize: 13, fontWeight: 700 }}>
        10,500
      </text>
      <g transform="translate(108 354)">
        <g data-v="pop" data-at="0.84">
          <circle r="11" fill={GREEN} />
          <path d="M-5 0l3.5 3.5L5.5-4" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
      <text data-v="fade" data-at="0.86" x="126" y="359" fill={GREEN} style={{ ...BODY, fontWeight: 700, fontSize: 13.5 }}>
        Balanced
      </text>

      {/* a statistics note, pinned beside the page */}
      <g transform="translate(424 62) rotate(3)">
        <g data-v="fade" data-at="0.3">
          <rect width="160" height="214" rx="10" fill="#fff8e6" stroke="rgb(0 28 85 / 0.1)" />
          <circle cx="80" cy="0" r="6" fill={BOLT} />
          <text x="14" y="32" fill={INK} style={{ ...BODY, fontWeight: 700, fontSize: 12.5 }}>
            Business Statistics
          </text>
        </g>
        <path data-v="draw" data-at="0.36" d="M16 180H146" stroke={INK} strokeWidth="1.4" />
        {[46, 78, 58, 104, 88].map((h, i) => (
          <rect key={i} data-v="grow" data-at={0.4 + i * 0.05} x={22 + i * 25} y={180 - h} width="16" height={h} rx="3" fill={i === 3 ? MID : SKY} />
        ))}
        {/* the mean of the five bars */}
        <path data-v="draw" data-at="0.68" d="M16 105.2H146" stroke={BOLT} strokeWidth="1.8" />
        <text data-v="fade" data-at="0.72" x="146" y="58" textAnchor="end" fill={BOLT} style={{ ...MONO, fontSize: 11 }}>
          mean 74.8
        </text>
        <text data-v="fade" data-at="0.5" x="14" y="200" fill={MUTED} style={{ ...MONO, fontSize: 10 }}>
          marks, five terms
        </text>
      </g>
      {/* what it was all about */}
      {["Accounting", "Business Studies", "Statistics"].map((t, i) => (
        <g key={t} transform={`translate(432 ${298 + i * 26})`}>
          <g data-v="pop" data-at={0.55 + i * 0.06}>
            <rect width={t.length * 7.2 + 22} height="20" rx="10" fill={PALE} />
            <text x="11" y="14" fill={INK} style={{ ...BODY, fontWeight: 600, fontSize: 11.5 }}>
              {t}
            </text>
          </g>
        </g>
      ))}
    </svg>
  );
}

/** BSc. IT: an editor where a search tree builds, a table fills and a network lights up. */
export function StackScene() {
  const tree: [number, number, number, number | null][] = [
    // value, x, y, parent
    [8, 98, 122, null],
    [3, 58, 168, 0],
    [10, 140, 168, 0],
    [1, 34, 214, 1],
    [6, 82, 214, 1],
    [14, 162, 214, 2],
    [4, 64, 260, 4],
    [7, 100, 260, 4],
  ];
  const layers = [
    [134, 184, 234],
    [118, 160, 202, 244],
    [160, 206],
  ];
  const lx = [432, 494, 556];
  return (
    <svg viewBox="0 0 600 400" className="es es-stack" aria-hidden="true">
      {/* the editor */}
      <rect data-v="fade" data-at="0" x="8" y="18" width="584" height="362" rx="16" fill="#0b1f45" />
      <g data-v="fade" data-at="0.02">
        <circle cx="30" cy="40" r="5" fill="#ff5f57" />
        <circle cx="46" cy="40" r="5" fill="#febc2e" />
        <circle cx="62" cy="40" r="5" fill="#28c840" />
      </g>
      {(
        [
          ["tree.py", 86, 0.04],
          ["schema.sql", 198, 0.36],
          ["model.py", 310, 0.62],
        ] as const
      ).map(([t, x, at]) => (
        <g key={t} data-v="fade" data-at={at}>
          <rect x={x} y="28" width="104" height="24" rx="7" fill="rgb(255 255 255 / 0.08)" />
          <text x={x + 12} y="45" fill="#cfe6f7" style={{ ...MONO, fontSize: 11.5 }}>
            {t}
          </text>
        </g>
      ))}
      <path data-v="draw" data-at="0.02" d="M8 62H592" stroke="rgb(255 255 255 / 0.08)" />

      {/* 1. a binary search tree, node by node */}
      <text data-v="fade" data-at="0.05" x="24" y="88" fill={MUTED} style={{ ...MONO, fontSize: 10.5 }}>
        Data Structures
      </text>
      {tree.map(([, x, y, p], i) => (p === null ? null : <path key={`e${i}`} data-v="draw" data-at={0.08 + i * 0.03} d={`M${tree[p][1]} ${tree[p][2]}L${x} ${y}`} stroke={SKY} strokeWidth="1.6" />))}
      {tree.map(([v, x, y], i) => (
        <g key={`n${i}`} transform={`translate(${x} ${y})`}>
          <g data-v="pop" data-at={0.07 + i * 0.03}>
            <circle r="13" fill={i === 0 ? BOLT : "#16356e"} stroke={SKY} strokeWidth="1.4" />
            <text y="4.5" textAnchor="middle" fill="#fff" style={{ ...MONO, fontSize: 12, fontWeight: 700 }}>
              {v}
            </text>
          </g>
        </g>
      ))}

      {/* 2. a table, row by row */}
      <text data-v="fade" data-at="0.36" x="206" y="88" fill={MUTED} style={{ ...MONO, fontSize: 10.5 }}>
        DBMS
      </text>
      <text data-v="fade" data-at="0.38" x="206" y="114" fill="#9ad7ff" style={{ ...MONO, fontSize: 11 }}>
        SELECT * FROM modules;
      </text>
      <rect data-v="fade" data-at="0.4" x="206" y="126" width="188" height="24" rx="5" fill="rgb(124 200 240 / 0.18)" />
      {["id", "module", "year"].map((h, i) => (
        <text key={h} data-v="fade" data-at="0.41" x={[214, 242, 356][i]} y="142" fill="#cfe6f7" style={{ ...MONO, fontSize: 10.5, fontWeight: 700 }}>
          {h}
        </text>
      ))}
      {[
        ["1", "Algorithms", "1"],
        ["2", "DBMS", "1"],
        ["3", "Operating Sys", "2"],
        ["4", "Cloud", "2"],
        ["5", "Deep Learning", "3"],
      ].map((r, i) => (
        <g key={i} data-v="fade" data-at={0.44 + i * 0.035}>
          <path d={`M206 ${174 + i * 24}H394`} stroke="rgb(255 255 255 / 0.06)" />
          {r.map((c, j) => (
            <text key={j} x={[214, 242, 356][j]} y={168 + i * 24} fill="#e9f4fb" style={{ ...MONO, fontSize: 10.5 }}>
              {c}
            </text>
          ))}
        </g>
      ))}

      {/* 3. a small network, layer by layer, ending on a prediction */}
      <text data-v="fade" data-at="0.62" x="414" y="88" fill={MUTED} style={{ ...MONO, fontSize: 10.5 }}>
        Artificial Intelligence
      </text>
      {layers
        .slice(0, -1)
        .flatMap((ys, l) =>
          ys.flatMap((y1, a) =>
            layers[l + 1].map((y2, b) => (
              <path key={`${l}${a}${b}`} data-v="draw" data-at={0.66 + l * 0.08 + a * 0.008} d={`M${lx[l]} ${y1}L${lx[l + 1]} ${y2}`} stroke={SKY} strokeOpacity="0.35" strokeWidth="1.2" />
            )),
          ),
        )}
      {layers.flatMap((ys, l) =>
        ys.map((y, i) => (
          <g key={`${l}${i}`} transform={`translate(${lx[l]} ${y})`}>
            <g data-v="pop" data-at={0.64 + l * 0.09 + i * 0.01}>
              <circle r="10" fill={l === 2 && i === 0 ? BOLT : "#16356e"} stroke={SKY} strokeWidth="1.4" />
            </g>
          </g>
        )),
      )}
      <text data-v="fade" data-at="0.86" x="556" y="236" textAnchor="middle" fill="#ffb38f" style={{ ...MONO, fontSize: 10.5 }}>
        0.97
      </text>

      {/* the status bar */}
      <path data-v="draw" data-at="0.88" d="M8 344H592" stroke="rgb(255 255 255 / 0.08)" />
      <text data-v="fade" data-at="0.9" x="24" y="367" fill="#7ee2a8" style={{ ...MONO, fontSize: 11 }}>
        ✓ build passed
      </text>
      <text data-v="fade" data-at="0.92" x="576" y="367" textAnchor="end" fill="#cfe6f7" style={{ ...MONO, fontSize: 11 }}>
        Java Python SQL
      </text>
    </svg>
  );
}

/** The paper: the pages fill in, and its figure routes a user to the nearest laundry. */
export function PaperScene() {
  const pins = [
    [436, 196],
    [512, 150],
    [528, 254],
  ] as const;
  return (
    <svg viewBox="0 0 600 400" className="es es-paper" aria-hidden="true">
      {/* the page behind, then the page */}
      <g transform="translate(46 34) rotate(-4)">
        <rect data-v="fade" data-at="0" width="300" height="344" rx="8" fill="#f4f8fb" stroke="rgb(0 28 85 / 0.1)" />
      </g>
      <rect data-v="fade" data-at="0.03" x="64" y="22" width="300" height="356" rx="8" fill="#fff" stroke="rgb(0 28 85 / 0.14)" />
      {/* title and author */}
      <text data-v="fade" data-at="0.06" x="88" y="62" fill={INK} style={{ ...BODY, fontWeight: 800, fontSize: 16.5 }}>
        Laundry Recommendation
      </text>
      <text data-v="fade" data-at="0.09" x="88" y="83" fill={INK} style={{ ...BODY, fontWeight: 800, fontSize: 16.5 }}>
        System Web Application
      </text>
      <path data-v="draw" data-at="0.12" d="M88 96H156" stroke={BOLT} strokeWidth="3" strokeLinecap="round" />
      <text data-v="fade" data-at="0.14" x="88" y="116" fill={MUTED} style={{ ...BODY, fontSize: 11 }}>
        Rajendra Pandey, Sunway College, Kathmandu
      </text>
      {/* abstract */}
      <text data-v="fade" data-at="0.16" x="88" y="142" fill={INK} style={{ ...BODY, fontWeight: 700, fontSize: 11.5 }}>
        Abstract
      </text>
      {[330, 322, 334, 300, 318].map((x2, i) => (
        <path key={i} data-v="draw" data-at={0.18 + i * 0.03} d={`M88 ${156 + i * 12}H${x2}`} stroke="rgb(0 28 85 / 0.2)" strokeWidth="4" strokeLinecap="round" />
      ))}
      {/* the stack it was built with */}
      <text data-v="fade" data-at="0.34" x="88" y="236" fill={INK} style={{ ...BODY, fontWeight: 700, fontSize: 11.5 }}>
        Built with
      </text>
      {["HTML", "CSS", "JS", "Node.js", "MongoDB"].map((t, i) => (
        <g key={t} transform={`translate(${88 + [0, 46, 86, 118, 184][i]} 246)`}>
          <g data-v="pop" data-at={0.36 + i * 0.03}>
            <rect width={t.length * 6.4 + 14} height="18" rx="9" fill={PALE} />
            <text x="7" y="12.5" fill={INK} style={{ ...MONO, fontSize: 10 }}>
              {t}
            </text>
          </g>
        </g>
      ))}
      {[318, 330, 270].map((x2, i) => (
        <path key={i} data-v="draw" data-at={0.44 + i * 0.03} d={`M88 ${286 + i * 12}H${x2}`} stroke="rgb(0 28 85 / 0.2)" strokeWidth="4" strokeLinecap="round" />
      ))}
      <text data-v="fade" data-at="0.5" x="88" y="352" fill={MUTED} style={{ ...MONO, fontSize: 10 }}>
        Published 20 Dec 2024
      </text>

      {/* Fig. 1: the nearest laundry, routed */}
      <rect data-v="fade" data-at="0.5" x="384" y="96" width="196" height="214" rx="12" fill="#eef7fc" stroke="rgb(0 28 85 / 0.12)" />
      {["M384 160C430 150 470 186 580 170", "M452 96C462 160 440 230 460 310", "M384 250C450 240 520 280 580 262"].map((d, i) => (
        <path key={i} data-v="draw" data-at={0.52 + i * 0.03} d={d} stroke="#fff" strokeWidth="7" fill="none" />
      ))}
      {pins.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <g data-v="pop" data-at={0.62 + i * 0.04}>
            <path d="M0 0c-8-10-12-16-12-22a12 12 0 0 1 24 0c0 6-4 12-12 22Z" fill={i === 0 ? BOLT : MID} />
            <circle cy="-22" r="4.5" fill="#fff" />
          </g>
        </g>
      ))}
      <g transform="translate(406 286)">
        <g data-v="pop" data-at="0.66">
          <circle r="9" fill={INK} stroke="#fff" strokeWidth="3" />
        </g>
      </g>
      <path data-v="draw" data-at="0.72" d="M406 286C414 258 400 236 418 222S436 204 436 196" stroke={BOLT} strokeWidth="3.4" strokeLinecap="round" fill="none" />
      <g transform="translate(496 214)">
        <g data-v="pop" data-at="0.84">
          <rect x="-32" y="-12" width="64" height="22" rx="11" fill={INK} />
          <text y="3.5" textAnchor="middle" fill="#fff" style={{ ...MONO, fontSize: 10.5 }}>
            1.2 km
          </text>
        </g>
      </g>
      <text data-v="fade" data-at="0.88" x="384" y="330" fill={MUTED} style={{ ...BODY, fontSize: 11 }}>
        Fig. 1. The nearest laundry, routed.
      </text>
    </svg>
  );
}

export const SCENES = { school: SchoolScene, ledger: LedgerScene, stack: StackScene, paper: PaperScene } as const;
