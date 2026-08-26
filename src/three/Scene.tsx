/**
 * Scene — reads the single normalized scroll value and maps it onto the
 * artifact, the rules behind it and a very small amount of camera movement.
 *
 * The camera barely moves on purpose. The previous version flew it between
 * eight hand-written positions, which threw the composition around and made a
 * full-screen wireframe swing across the text. Here the camera dollies a few
 * tenths of a unit and the *objects* carry the change. Slow and still reads as
 * expensive; busy reads as cheap.
 *
 * Nothing in this file needs to dodge the text column any more. The canvas
 * element itself occupies only the scene column (see .global-canvas), so the
 * safe-zone contract is enforced by layout rather than by hoping an object
 * stays out of the way.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { acts } from '../content';
import { scroll } from '../hooks/scrollStore';
import { attachPointer, pointer } from './pointer';
import { useTheme } from '../hooks/useTheme';
import type { Quality } from '../hooks/useQualityTier';
import { PointField } from './objects/PointField';
import { GlassArtifact } from './objects/GlassArtifact';
import { LedgerRules } from './objects/LedgerRules';
import { SkillLattice } from './objects/SkillLattice';
import { Effects } from './Effects';

interface SceneProps {
  quality: Quality;
}

const ORDER: string[] = acts.map((a) => a.id);

/** Per act: how present the artifact is, how present the rules are, camera z. */
const BEATS: Record<string, { artifact: number; rules: number; z: number }> = {
  arrival: { artifact: 1, rules: 0.85, z: 6.5 },
  origin: { artifact: 0.72, rules: 1, z: 6.3 },
  pivot: { artifact: 1, rules: 1, z: 5.9 },
  systems: { artifact: 0.85, rules: 0.95, z: 6.3 },
  practice: { artifact: 0.8, rules: 0.85, z: 6.5 },
  evidence: { artifact: 0.4, rules: 0.45, z: 7.0 },
  documentation: { artifact: 0.7, rules: 0.7, z: 6.6 },
  signal: { artifact: 1, rules: 0.85, z: 6.5 },
};

const lerp = THREE.MathUtils.lerp;

export function Scene({ quality }: SceneProps) {
  const { colors, theme } = useTheme();
  const { camera, invalidate } = useThree();

  const morph = useRef(0);
  const spin = useRef(0);
  const artifactPresence = useRef(0);
  const rulesPresence = useRef(0);
  const latticePresence = useRef(0);

  const reduced = quality.tier === 'reduced';
  const cut = quality.camera === 'cut';
  const target = useMemo(() => new THREE.Vector3(0, 0, 6.5), []);

  useEffect(() => attachPointer(), []);
  useEffect(() => {
    invalidate();
  }, [colors, invalidate]);

  useFrame((_, delta) => {
    const i = Math.max(0, scroll.activeAct ? ORDER.indexOf(scroll.activeAct) : 0);
    const from = BEATS[ORDER[i] as string] ?? BEATS.arrival!;
    const to = BEATS[ORDER[Math.min(ORDER.length - 1, i + 1)] as string] ?? from;
    const t = scroll.actProgress;

    artifactPresence.current = lerp(from.artifact, to.artifact, t);
    rulesPresence.current = lerp(from.rules, to.rules, t);

    // uMorph runs 0 to 1 across the Pivot act — the page's one real transition
    // — and settles back toward 0.2 in Signal, because the ledger is still part
    // of him.
    const pivot = ORDER.indexOf('pivot');
    const signal = ORDER.indexOf('signal');
    if (i < pivot) morph.current = 0;
    else if (i === pivot) morph.current = reduced ? (t > 0.5 ? 1 : 0) : t;
    else if (i === signal) morph.current = lerp(1, 0.2, t);
    else morph.current = 1;

    // One slow turn of the stone across the whole document.
    spin.current = scroll.progress;

    const systems = ORDER.indexOf('systems');
    latticePresence.current =
      i === systems
        ? Math.min(1, t * 2.5)
        : i === systems + 1
          ? Math.max(0, 1 - t * 2)
          : 0;

    target.set(0, 0, lerp(from.z, to.z, t));

    if (cut) {
      camera.position.copy(target);
    } else {
      // The single number that does more for perceived smoothness than
      // anything else here (DESIGN.md §6).
      camera.position.lerp(target, Math.min(1, delta * 60 * 0.05));
      camera.position.x += pointer.x * 0.05;
      camera.position.y += -pointer.y * 0.03;
    }
    camera.lookAt(0, 0, 0);
  });

  const keyIntensity = theme === 'dark' ? 1.5 : 1.8;

  return (
    <>
      <ambientLight intensity={theme === 'dark' ? 0.5 : 0.85} />
      {/* Lights are light-coloured in both themes. Driving them from --ink meant
          that in paper mode the key light was #1A211C — a black light, which is
          not a lighting choice, it is an absence of one. */}
      <directionalLight position={[3, 4, 5]} intensity={keyIntensity} color="#fdfdfb" />
      {/* A rim, not a wash. This light exists to catch one or two facet edges. */}
      <directionalLight position={[-4, -1, 2]} intensity={0.22} color={colors.ledger} />

      {/**
       * A procedural environment, built from lightformers. drei's presets each
       * pull an HDRI file down off a CDN, and a downloaded asset is exactly what
       * the brief §4.1 exists to prevent — the rule is about model files but the
       * reasoning is about bundle weight and about the page owning its own
       * appearance. frames={1} bakes it once and never renders it again.
       */}
      {quality.transmission ? (
        <Environment resolution={128} frames={1}>
          <Lightformer
            form="rect"
            intensity={theme === 'dark' ? 1.0 : 0.8}
            position={[2, 3, 3]}
            scale={[6, 6, 1]}
            color="#fdfdfb"
          />
          {/* One accent source, kept low. At 2.2 it flooded the stone red
              before the material's own absorption had any say. */}
          <Lightformer
            form="circle"
            intensity={theme === 'dark' ? 0.45 : 0.3}
            position={[-3, -1, 2]}
            scale={[4, 4, 1]}
            color={colors.ledger}
          />
          <Lightformer
            form="rect"
            intensity={theme === 'dark' ? 1.4 : 0.9}
            position={[0, -3, -1]}
            scale={[8, 3, 1]}
            color={theme === 'dark' ? '#8c9994' : '#ffffff'}
          />
          {/* Small and hot. Facets need a highlight to travel across them or
              the stone reads as matte no matter how transmissive it is. */}
          <Lightformer
            form="circle"
            intensity={theme === 'dark' ? 2.4 : 1.6}
            position={[-1.6, 2.4, 1.8]}
            scale={[0.7, 0.7, 1]}
            color="#ffffff"
          />
        </Environment>
      ) : null}

      {quality.points > 0 ? (
        <PointField count={quality.points} color={colors.inkDim} />
      ) : null}

      {quality.ridgeSegments > 0 ? (
        <LedgerRules
          rows={quality.ridgeSegments}
          /* --ink-dim, not --rule. #2A363B on #0B1114 is 1.5:1 — invisible,
             and a refraction with nothing behind it is just a grey polygon. */
          rule={colors.inkDim}
          ledger={colors.ledger}
          morph={morph}
          presence={rulesPresence}
        />
      ) : null}

      <GlassArtifact
        rule={colors.rule}
        ledger={colors.ledger}
        ink={colors.ink}
        inkDim={colors.inkDim}
        ground={colors.ground}
        presence={artifactPresence}
        spin={spin}
        transmission={quality.transmission}
        animate={!reduced}
        samples={quality.samples}
      />

      {quality.lattice ? (
        <SkillLattice
          rule={colors.rule}
          ledger={colors.ledger}
          ink={colors.ink}
          presence={latticePresence}
          transmission={quality.transmission}
        />
      ) : null}

      {quality.bloom ? <Effects /> : null}
    </>
  );
}
