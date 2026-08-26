/**
 * LedgerRules — what you see *through* the glass.
 *
 * This is the ledger-to-terrain idea, rebuilt. The previous version was a
 * 60x30 wireframe plane at 128x128 segments, which is a full-screen grid: the
 * oldest, cheapest effect in web 3D, and at that density the lines aliased into
 * grey mush anyway.
 *
 * Now it is what it always should have been — a small stack of ruled lines, no
 * cross members, sitting directly behind the artifact so the refraction has
 * something worth bending. Straight and evenly spaced at morph 0, an unmistakable
 * ledger page. At morph 1 every rule takes a slice through the same ridged
 * surface, so the stack reads as a contour drawing of a mountain.
 *
 * Twenty-two lines instead of two hundred and fifty. You can count them, which
 * is the point: they read as drawn, not as noise.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LedgerRulesProps {
  /** Base line colour. --rule is too dark to survive behind glass on --ground. */
  rule: string;
  ledger: string;
  /** 0 = ruled page, 1 = ridgeline. Driven by scroll across the Pivot act. */
  morph: React.RefObject<number>;
  presence: React.RefObject<number>;
  rows: number;
}

const WIDTH = 8;
const DEPTH = 6.4;
const AMPLITUDE = 0.95;
const SEGMENTS = 72;

const VERTEX = /* glsl */ `
uniform float uMorph;
uniform float uTime;
uniform float uAmplitude;

attribute float aRow;

varying float vHeight;
varying float vRow;

// Compact value noise. Simplex is overkill for a profile this size, and this
// compiles to a fraction of the instructions.
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y) * 2.0 - 1.0;
}

// Ridged: folding at zero puts a sharp crest where a rolling hill would be.
// That fold is the difference between terrain and a ridgeline.
float ridged(vec2 p) {
  float sum = 0.0, amp = 0.5, freq = 1.0;
  for (int i = 0; i < 3; i++) {
    sum += (1.0 - abs(vnoise(p * freq))) * amp;
    freq *= 2.03;
    amp *= 0.5;
  }
  return sum / 0.875;
}

void main() {
  vec3 pos = position;

  float morph = smoothstep(0.0, 1.0, uMorph);

  // Every rule slices the same surface, so the stack reads as one landform
  // rather than as a set of unrelated wiggly lines.
  float h = ridged(vec2(pos.x * 0.34, pos.z * 0.34 + uTime * 0.012));
  // Ease the displacement out at the left and right ends so the rules resolve
  // back into the page rather than being cut off mid-mountain.
  float ends = smoothstep(0.0, 0.22, 1.0 - abs(pos.x) / (${WIDTH.toFixed(1)} * 0.5));

  float lift = h * uAmplitude * morph * ends;
  pos.y += lift;

  vHeight = clamp(lift / max(uAmplitude, 0.0001), 0.0, 1.0);
  vRow = aRow;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
uniform vec3 uRule;
uniform vec3 uLedger;
uniform float uOpacity;

varying float vHeight;
varying float vRow;

void main() {
  // Crests catch red, valleys stay neutral. This is the one place the accent
  // does something no other colour could.
  vec3 color = mix(uRule, uLedger, smoothstep(0.55, 0.96, vHeight));

  // Rules nearer the back fade, which gives the stack depth without fog.
  float depth = mix(1.0, 0.55, vRow);
  gl_FragColor = vec4(color, uOpacity * depth);
}
`;

function buildRules(rows: number): THREE.BufferGeometry {
  const positions = new Float32Array(rows * SEGMENTS * 2 * 3);
  const rowAttr = new Float32Array(rows * SEGMENTS * 2);
  let v = 0;
  let a = 0;

  for (let r = 0; r < rows; r++) {
    const t = rows > 1 ? r / (rows - 1) : 0;
    const z = (t - 0.5) * DEPTH;
    for (let s = 0; s < SEGMENTS; s++) {
      const x0 = (s / SEGMENTS - 0.5) * WIDTH;
      const x1 = ((s + 1) / SEGMENTS - 0.5) * WIDTH;
      positions[v++] = x0;
      positions[v++] = 0;
      positions[v++] = z;
      rowAttr[a++] = t;
      positions[v++] = x1;
      positions[v++] = 0;
      positions[v++] = z;
      rowAttr[a++] = t;
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  g.setAttribute('aRow', new THREE.BufferAttribute(rowAttr, 1));
  return g;
}

export function LedgerRules({ rule, ledger, morph, presence, rows }: LedgerRulesProps) {
  const geometry = useMemo(() => buildRules(rows), [rows]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uMorph: { value: 0 },
          uTime: { value: 0 },
          uAmplitude: { value: AMPLITUDE },
          uOpacity: { value: 0 },
          uRule: { value: new THREE.Color(rule) },
          uLedger: { value: new THREE.Color(ledger) },
        },
      }),
    // Colours are assigned in an effect; rebuilding here would drop the
    // compiled program on every theme change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    (material.uniforms.uRule as THREE.IUniform<THREE.Color>).value.set(rule);
    (material.uniforms.uLedger as THREE.IUniform<THREE.Color>).value.set(ledger);
  }, [rule, ledger, material]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  const shown = useRef(0);

  useFrame((_, delta) => {
    (material.uniforms.uTime as THREE.IUniform<number>).value += delta;

    const m = material.uniforms.uMorph as THREE.IUniform<number>;
    m.value += ((morph.current ?? 0) - m.value) * Math.min(1, delta * 3);

    shown.current += ((presence.current ?? 0) - shown.current) * Math.min(1, delta * 2.5);
    (material.uniforms.uOpacity as THREE.IUniform<number>).value = shown.current;
  });

  // Tipped toward the camera so the stack is read at an angle rather than
  // edge-on, and set back far enough that the artifact sits clearly in front.
  return (
    <group position={[0, -0.55, -1.7]} rotation={[-0.78, 0, 0]}>
      <lineSegments geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}
