/**
 * GlassArtifact — the object the page is built around.
 *
 * A cut crystal, not a blob. The facets are flat and few, so each one refracts
 * the ledger rules behind it at a different angle; that refraction is the whole
 * effect, and it is why LedgerRules sits directly behind this thing rather than
 * off at a horizon somewhere.
 *
 * It replaces an icosahedron wearing MeshDistortMaterial, which is the default
 * object in every react-three-fiber tutorial ever written and read, correctly,
 * as a brown potato.
 *
 * Transmission is expensive: the material re-renders the scene into a buffer
 * every frame. Mobile gets a flat-shaded solid with a rim instead — same
 * silhouette, same facets, none of the cost.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { pointer } from '../pointer';

interface GlassArtifactProps {
  rule: string;
  ledger: string;
  ink: string;
  inkDim: string;
  /** The page ground. What the transmission buffer clears to — see below. */
  ground: string;
  /** 0 hidden, 1 fully present. */
  presence: React.RefObject<number>;
  /** Extra rotation fed by the scroll, on top of the ambient drift. */
  spin: React.RefObject<number>;
  transmission: boolean;
  animate: boolean;
  samples: number;
}

export function GlassArtifact({
  rule,
  ledger,
  ink,
  inkDim,
  ground,
  presence,
  spin,
  transmission,
  animate,
  samples,
}: GlassArtifactProps) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const shown = useRef(0);

  /**
   * Twenty flat faces. Detail 0 on purpose — subdividing turns a cut stone back
   * into a ball, and the sharp edges are what catch the light.
   *
   * Scaled unevenly on the vertical. A regular icosahedron presents a clean
   * hexagon head-on, which is precisely how the first attempt read: a flat
   * hexagonal plate. Stretching it breaks that silhouette into something with a
   * top and a bottom, the way a cut stone has.
   */
  const geometry = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(0.86, 0);
    g.scale(0.94, 1.22, 0.94);
    return g;
  }, []);

  /**
   * Absorption tint is neutral, not red. Tinting it with the accent turned the
   * whole stone into red plastic — glass reads as glass because it is mostly
   * colourless and picks colour up from what is behind and around it.
   */
  const attenuation = useMemo(() => new THREE.Color(rule), [rule]);
  /**
   * The canvas is alpha:true, so the transmission buffer clears to transparent
   * black. On the dark ground nobody noticed; on paper the stone rendered as a
   * solid black lump, because black is exactly what it was sampling. Clearing
   * to the page colour is the fix, and it has to follow the theme.
   */
  const backdrop = useMemo(() => new THREE.Color(ground), [ground]);
  void ink;
  /* The facet lines are drawn in the quiet colour for the same reason. Red
     edges on a red body is a wireframe cage, not a cut stone. */
  const edgeColor = useMemo(() => new THREE.Color(inkDim), [inkDim]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;

    const target = presence.current ?? 0;
    shown.current += (target - shown.current) * Math.min(1, delta * 2.5);
    g.visible = shown.current > 0.01;
    // Arriving by scale rather than opacity: transmission and opacity fade
    // together look like a rendering bug, not an entrance.
    g.scale.setScalar(0.55 + shown.current * 0.45);

    const m = mesh.current;
    if (!m) return;

    if (animate) {
      // Slow. Sci-fi reads as expensive when slow and sparse (DESIGN.md §6).
      m.rotation.y += delta * 0.09;
      m.rotation.x += delta * 0.035;
    }
    m.rotation.z = (spin.current ?? 0) * 0.6;

    // A little cursor lean, lerped. Never assigned directly.
    const tx = pointer.x * 0.18;
    const ty = -pointer.y * 0.12;
    g.position.x += (tx - g.position.x) * 0.03;
    g.position.y += (ty - g.position.y) * 0.03;
  });

  return (
    <group ref={group}>
      <mesh ref={mesh} geometry={geometry} castShadow={false} receiveShadow={false}>
        {transmission ? (
          <MeshTransmissionMaterial
            samples={samples}
            resolution={256}
            transmission={1}
            /* Thin. A thick stone absorbs its way to opacity, and the whole
               point is that you can see the ruled lines through it and watch
               them displace. */
            thickness={0.55}
            roughness={0.04}
            ior={1.42}
            /* The environment was doing all the work: reflections sat on top of
               the transmission and flattened it into a matte grey solid. */
            envMapIntensity={0.22}
            /* Dispersion, not a post-process aberration. DESIGN.md §9 bans the
               latter across the whole frame; this is confined to the stone and
               is the entire reason cut glass looks like cut glass. */
            chromaticAberration={0.05}
            anisotropy={0.18}
            distortion={0.06}
            distortionScale={0.3}
            temporalDistortion={0.06}
            attenuationColor={attenuation}
            /* 2.2 absorbed almost everything and the stone came out solid
               maroon — opaque, not glass. Long enough now that the red is a
               tint picked up through the thickest part, which is what
               absorption is supposed to look like. */
            attenuationDistance={20}
            /* Glass is tinted by what passes through it, not by the page's text
               colour. Using --ink here made the stone render solid black in
               paper mode, where --ink is #1A211C. */
            color="#f2f4f1"
            background={backdrop}
            backside={false}
            flatShading
          />
        ) : (
          /* Mobile: same stone, lit rather than transmissive. */
          <meshStandardMaterial
            color={rule}
            emissive={ledger}
            emissiveIntensity={0.22}
            roughness={0.25}
            metalness={0.35}
            flatShading
          />
        )}

        {/*
          The facet boundaries, drawn. A transmissive solid with no edges has no
          readable structure — it photographs as a coloured blob, which is
          exactly what the first pass produced. These lines are also what ties
          the object to the hairline-rule language the rest of the page is set in.
        */}
        <Edges threshold={12} color={edgeColor} scale={1.002} />
      </mesh>
    </group>
  );
}
