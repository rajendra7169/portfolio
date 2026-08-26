/**
 * ledgerRidge.glsl.ts — shader source for the signature object (DESIGN.md §5.3).
 *
 * Kept out of the component so the GLSL reads as GLSL rather than as a string
 * wedged into JSX.
 *
 * The 2D simplex implementation is Ashima Arts / Stefan Gustavson's, MIT
 * licensed and unchanged. Everything below `ridged()` is this project's.
 */

/** Ashima Arts simplex noise, MIT. Copyright (C) 2011 Ashima Arts. */
const SIMPLEX = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

export const RIDGE_VERTEX = /* glsl */ `
${SIMPLEX}

uniform float uMorph;
uniform float uTime;
uniform float uAmplitude;

/** 1.0 for a segment running along X — a ruled line. 0.0 for a cross member. */
attribute float aAxis;

varying float vHeight;
varying float vAxis;

/**
 * Three octaves, ridged. 1.0 - abs(n) folds the noise at zero so peaks come to
 * a sharp crest instead of rolling — the difference between hills and a
 * ridgeline, and the whole reason this reads as Himalaya rather than terrain.
 */
float ridged(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 3; i++) {
    float n = snoise(p * freq);
    sum += (1.0 - abs(n)) * amp;
    freq *= 2.0;
    amp *= 0.5;
  }
  // Three octaves at gain 0.5 sum to 0.875; bring the range back to ~0..1.
  return sum / 0.875;
}

void main() {
  vec3 pos = position;

  // smoothstep, not linear: it should feel like something lifting off a
  // surface — slow at the edges, fastest through the middle (DESIGN.md §5.3).
  float morph = smoothstep(0.0, 1.0, uMorph);

  float h = ridged(vec2(pos.x, pos.z) * 0.045 + vec2(0.0, uTime * 0.006));
  // Flat at the near edge so the paper stays paper where the reader is closest,
  // and the ridge builds toward the horizon.
  float distanceFalloff = smoothstep(-6.0, 22.0, pos.z);

  float displaced = h * uAmplitude * morph * distanceFalloff;
  pos.y += displaced;

  vHeight = clamp(displaced / max(uAmplitude, 0.0001), 0.0, 1.0);
  vAxis = aAxis;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const RIDGE_FRAGMENT = /* glsl */ `
/**
 * No precision declaration here on purpose. three.js prepends a precision
 * qualifier to both stages, and declaring mediump only in the fragment shader
 * makes uMorph's precision differ between the two — the program then fails to
 * link with "Precisions of uniform uMorph differ", and the ridge silently
 * disappears while the console fills with draw errors.
 */
uniform vec3 uRule;
uniform vec3 uLedger;
uniform float uMorph;
uniform float uOpacity;

varying float vHeight;
varying float vAxis;

void main() {
  // Crests catch red, valleys stay neutral. This is where the accent earns its
  // place — it is doing work no other colour on the page could do.
  vec3 color = mix(uRule, uLedger, smoothstep(0.3, 0.95, vHeight));

  // At uMorph = 0 only the lines running along X are drawn: evenly spaced
  // parallel rules, unmistakably ledger paper in perspective. The cross members
  // fade in as the ruling becomes a mesh.
  float cross = mix(0.0, 1.0, smoothstep(0.05, 0.55, uMorph));
  float alpha = uOpacity * mix(cross, 1.0, vAxis);

  if (alpha < 0.004) discard;
  gl_FragColor = vec4(color, alpha);
}
`;
