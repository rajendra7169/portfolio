/**
 * PointField — DESIGN.md §5.1. Ambient, always present, never the subject.
 *
 * Positions are randomised once into a 40x40x60 box and then only ever
 * translated, so the buffer is uploaded to the GPU a single time. Drift wraps
 * in the shader-free path by rewriting one component of the attribute, which is
 * cheaper than rebuilding the geometry and keeps the draw call count at one.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { scroll } from '../../hooks/scrollStore';
import { pointer } from '../pointer';

interface PointFieldProps {
  count: number;
  color: string;
}

const BOX = { x: 40, y: 40, z: 60 };

export function PointField({ count, color }: PointFieldProps) {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.PointsMaterial>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    // Deterministic scatter: a fixed seed means the field is identical between
    // reloads, so a visual regression is a real change and not noise.
    let seed = 0x9e3779b9;
    const rand = (): number => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 0xffffffff;
    };
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rand() - 0.5) * BOX.x;
      arr[i * 3 + 1] = (rand() - 0.5) * BOX.y;
      arr[i * 3 + 2] = (rand() - 0.5) * BOX.z;
    }
    return arr;
  }, [count]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  useFrame((_, delta) => {
    const mesh = points.current;
    if (!mesh) return;

    const attr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const rise = 0.02 * delta * 60;
    const half = BOX.y / 2;
    for (let i = 1; i < arr.length; i += 3) {
      let y = (arr[i] as number) + rise;
      if (y > half) y -= BOX.y;
      arr[i] = y;
    }
    attr.needsUpdate = true;

    // Parallax: 0.3x the camera's scroll travel, plus a fraction of the cursor.
    // Lerped, never assigned — a direct assignment is what makes cursor
    // parallax feel twitchy (DESIGN.md §5.1).
    const targetX = pointer.x * 0.05 * 20;
    const targetY = -pointer.y * 0.05 * 20 - scroll.progress * 0.3 * 6;
    mesh.position.x += (targetX - mesh.position.x) * 0.02;
    mesh.position.y += (targetY - mesh.position.y) * 0.02;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        ref={material}
        color={color}
        size={0.015}
        sizeAttenuation
        transparent
        opacity={0.35}
        depthWrite={false}
      />
    </points>
  );
}
