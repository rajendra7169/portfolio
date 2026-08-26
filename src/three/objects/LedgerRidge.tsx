/**
 * LedgerRidge — the signature element (DESIGN.md §5.3). Ledger paper becomes
 * terrain: at uMorph 0 the geometry is a set of straight, evenly spaced,
 * perfectly parallel rules; at uMorph 1 it is a ridged wireframe ridgeline.
 *
 * Built as LineSegments with an `aAxis` attribute rather than a `wireframe:
 * true` plane. A wireframe plane can only ever be a full grid, and a grid is
 * graph paper. Tagging each segment with its direction lets the cross members
 * fade in as the morph runs, which is what makes the flat state read as *ruled*
 * paper and the transition read as ruling becoming mesh.
 *
 * The ridge lives at the horizon for the whole middle of the page. It is
 * atmosphere, not a subject, and it must never rise into a text column.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RIDGE_FRAGMENT, RIDGE_VERTEX } from './ledgerRidge.glsl';

interface LedgerRidgeProps {
  segments: number;
  rule: string;
  ledger: string;
  /** 0 = ruled paper, 1 = ridgeline. Driven by scroll across the Pivot act. */
  morph: React.RefObject<number>;
}

const WIDTH = 60;
const DEPTH = 30;
const AMPLITUDE = 4;

/**
 * A grid of line segments over the XZ plane. Row segments (running along X) are
 * tagged 1.0, cross members 0.0.
 */
function buildGrid(seg: number): THREE.BufferGeometry {
  const lines = seg + 1;
  const total = lines * seg * 2; // rows + columns
  const positions = new Float32Array(total * 2 * 3);
  const axis = new Float32Array(total * 2);

  let v = 0;
  let a = 0;
  const put = (x: number, z: number, isRow: number): void => {
    positions[v++] = x;
    positions[v++] = 0;
    positions[v++] = z;
    axis[a++] = isRow;
  };

  for (let i = 0; i < lines; i++) {
    const z = (i / seg - 0.5) * DEPTH;
    for (let j = 0; j < seg; j++) {
      const x0 = (j / seg - 0.5) * WIDTH;
      const x1 = ((j + 1) / seg - 0.5) * WIDTH;
      put(x0, z, 1);
      put(x1, z, 1);
    }
  }

  for (let i = 0; i < lines; i++) {
    const x = (i / seg - 0.5) * WIDTH;
    for (let j = 0; j < seg; j++) {
      const z0 = (j / seg - 0.5) * DEPTH;
      const z1 = ((j + 1) / seg - 0.5) * DEPTH;
      put(x, z0, 0);
      put(x, z1, 0);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  g.setAttribute('aAxis', new THREE.BufferAttribute(axis, 1));
  return g;
}

export function LedgerRidge({ segments, rule, ledger, morph }: LedgerRidgeProps) {
  const geometry = useMemo(() => buildGrid(segments), [segments]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: RIDGE_VERTEX,
        fragmentShader: RIDGE_FRAGMENT,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uMorph: { value: 0 },
          uTime: { value: 0 },
          uAmplitude: { value: AMPLITUDE },
          uOpacity: { value: 0.85 },
          uRule: { value: new THREE.Color(rule) },
          uLedger: { value: new THREE.Color(ledger) },
        },
      }),
    // Colours are assigned in an effect below; rebuilding the material on a
    // theme change would drop the compiled program for no reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /** The page the lines lifted off. Stays flat — that is the whole point. */
  const ghost = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: RIDGE_VERTEX,
        fragmentShader: RIDGE_FRAGMENT,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uMorph: { value: 0 },
          uTime: { value: 0 },
          uAmplitude: { value: 0 },
          uOpacity: { value: 0.08 },
          uRule: { value: new THREE.Color(rule) },
          uLedger: { value: new THREE.Color(ledger) },
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const group = useRef<THREE.Group>(null);

  useEffect(() => {
    (material.uniforms.uRule as THREE.IUniform<THREE.Color>).value.set(rule);
    (material.uniforms.uLedger as THREE.IUniform<THREE.Color>).value.set(ledger);
    (ghost.uniforms.uRule as THREE.IUniform<THREE.Color>).value.set(rule);
    (ghost.uniforms.uLedger as THREE.IUniform<THREE.Color>).value.set(ledger);
  }, [rule, ledger, material, ghost]);

  useEffect(() => {
    return () => {
      // Dispose on unmount. The canvas never unmounts in normal operation, but
      // hot reload and the theme-toggle memory check both depend on this.
      geometry.dispose();
      material.dispose();
      ghost.dispose();
    };
  }, [geometry, material, ghost]);

  useFrame((_, delta) => {
    (material.uniforms.uTime as THREE.IUniform<number>).value += delta;
    const target = morph.current ?? 0;
    const current = (material.uniforms.uMorph as THREE.IUniform<number>).value;
    // Lerped so a fast flick of the scrollbar does not snap the ridge.
    (material.uniforms.uMorph as THREE.IUniform<number>).value +=
      (target - current) * Math.min(1, delta * 4);
    // The ghost's cross members follow the same fade so the page underneath
    // becomes a grid at the same moment the ridge does.
    (ghost.uniforms.uMorph as THREE.IUniform<number>).value = (
      material.uniforms.uMorph as THREE.IUniform<number>
    ).value;
  });

  return (
    <group ref={group} position={[0, -3.2, -12]}>
      <lineSegments geometry={geometry} material={material} frustumCulled={false} />
      <lineSegments
        geometry={geometry}
        material={ghost}
        position={[0, -0.01, 0]}
        frustumCulled={false}
      />
    </group>
  );
}
