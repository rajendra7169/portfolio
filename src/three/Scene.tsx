/**
 * Scene — reads the single normalized scroll value and maps it onto camera
 * position, object presence and material uniforms (CLAUDE.md §7).
 *
 * The camera path in DESIGN.md §7 is expressed per act, not per hard-coded
 * progress value, because sections size to their content. The target is found
 * by looking up which act is active and interpolating toward the next one — so
 * adding a paragraph to Systems moves the boundary automatically instead of
 * silently desynchronising the scene from the page.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { acts } from '../content';
import { scroll } from '../hooks/scrollStore';
import { attachPointer, pointer } from './pointer';
import { useTheme } from '../hooks/useTheme';
import type { Quality } from '../hooks/useQualityTier';
import { PointField } from './objects/PointField';
import { Core } from './objects/Core';
import { LedgerRidge } from './objects/LedgerRidge';
import { SkillLattice } from './objects/SkillLattice';
import { Effects } from './Effects';

interface SceneProps {
  quality: Quality;
}

/** DESIGN.md §7, one camera position per act. */
const CAMERA: Record<string, [number, number, number]> = {
  arrival: [0, 0.5, 6],
  origin: [2, 1.5, 9],
  pivot: [0, 3, 7],
  systems: [-3, 2, 6],
  practice: [-2, 2.5, 7],
  evidence: [0, 1, 5],
  documentation: [1, 1, 5.5],
  signal: [0, 0.5, 6],
};

const ORDER: string[] = acts.map((a) => a.id);

export function Scene({ quality }: SceneProps) {
  const { colors } = useTheme();
  const { camera, invalidate } = useThree();

  const morph = useRef(0);
  const corePresence = useRef(0);
  const latticePresence = useRef(0);
  const target = useMemo(() => new THREE.Vector3(0, 0.5, 6), []);
  const lookAt = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  const reduced = quality.tier === 'reduced';
  const cut = quality.camera === 'cut';
  // The mobile path is the same shape, flattened: less lateral travel so the
  // scene stays inside its horizon band rather than swinging across it.
  const damp = quality.camera === 'short' ? 0.45 : 1;

  useEffect(() => attachPointer(), []);

  // A theme change repaints the scene even when the frameloop is on demand.
  useEffect(() => {
    invalidate();
  }, [colors, invalidate]);

  useFrame((_, delta) => {
    const activeIndex = scroll.activeAct ? ORDER.indexOf(scroll.activeAct) : 0;
    const i = activeIndex < 0 ? 0 : activeIndex;
    const from = CAMERA[ORDER[i] as string] ?? CAMERA.arrival!;
    const to = CAMERA[ORDER[Math.min(ORDER.length - 1, i + 1)] as string] ?? from;
    const t = scroll.actProgress;

    target.set(
      THREE.MathUtils.lerp(from[0], to[0], t) * damp,
      THREE.MathUtils.lerp(from[1], to[1], t),
      THREE.MathUtils.lerp(from[2], to[2], t),
    );

    if (cut) {
      // Reduced motion cuts between act positions instead of flying.
      camera.position.copy(target);
    } else {
      // The single number that does more for perceived smoothness than
      // anything else in the project (DESIGN.md §6).
      const k = Math.min(1, delta * 60 * 0.05);
      camera.position.lerp(target, k);
      camera.position.x += pointer.x * 0.12;
      camera.position.y += -pointer.y * 0.06;
    }

    lookAt.set(0, 0, 0);
    camera.lookAt(lookAt);

    // uMorph runs 0 to 1 across the Pivot act — accounting paper lifting into
    // Himalayan geometry — and settles back toward 0.2 in Signal, because the
    // ledger is still part of him.
    const pivot = ORDER.indexOf('pivot');
    const signal = ORDER.indexOf('signal');
    if (i < pivot) morph.current = 0;
    else if (i === pivot) morph.current = reduced ? (t > 0.5 ? 1 : 0) : t;
    else if (i === signal) morph.current = THREE.MathUtils.lerp(1, 0.2, t);
    else morph.current = 1;

    // Core is present in Arrival, recedes through Origin, and returns in
    // Signal so the page closes where it opened.
    if (i === 0) corePresence.current = 1;
    else if (i === 1) corePresence.current = Math.max(0, 1 - t * 2);
    else if (i === signal) corePresence.current = Math.min(1, t * 2);
    else corePresence.current = 0;

    // The lattice fades in over Systems and recedes through Practice.
    const systems = ORDER.indexOf('systems');
    latticePresence.current =
      i === systems ? Math.min(1, t * 2.5) : i === systems + 1 ? Math.max(0, 1 - t * 2) : 0;
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 4]} intensity={0.9} color={colors.ink} />
      <directionalLight position={[-5, -2, -3]} intensity={0.35} color={colors.ledger} />

      {quality.points > 0 ? (
        <PointField count={quality.points} color={colors.inkDim} />
      ) : null}

      <Core
        rule={colors.rule}
        ledger={colors.ledger}
        presence={corePresence}
        animate={!reduced}
      />

      {quality.ridgeSegments > 0 ? (
        <LedgerRidge
          segments={quality.ridgeSegments}
          rule={colors.rule}
          ledger={colors.ledger}
          morph={morph}
        />
      ) : null}

      {quality.lattice ? (
        <SkillLattice rule={colors.rule} ledger={colors.ledger} presence={latticePresence} />
      ) : null}

      {quality.bloom ? <Effects /> : null}
    </>
  );
}
