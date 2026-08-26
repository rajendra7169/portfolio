/**
 * Core — DESIGN.md §5.2. Present in Arrival, returns in Signal, so the page
 * closes where it opened.
 *
 * Between those two acts the material's opacity fades rather than the component
 * unmounting: re-uploading three and a half thousand faces to the GPU every
 * time the reader scrolls past the middle of the page would be a real cost for
 * an object nobody can see.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import type * as THREE from 'three';

interface CoreProps {
  rule: string;
  ledger: string;
  /** 0 hidden, 1 fully present. Driven by scroll. */
  presence: React.RefObject<number>;
  /** Distortion is animation; reduced motion holds the shape still. */
  animate: boolean;
}

export function Core({ rule, ledger, presence, animate }: CoreProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.Material & { opacity: number }>(null);

  useFrame((_, delta) => {
    const m = material.current;
    if (m) {
      const target = presence.current ?? 0;
      m.opacity += (target - m.opacity) * Math.min(1, delta * 3);
      m.visible = m.opacity > 0.01;
    }
    const node = mesh.current;
    if (node && animate) {
      // 0.08–0.15 rad/sec. Faster reads as cheap (DESIGN.md §6).
      node.rotation.y += delta * 0.1;
      node.rotation.x += delta * 0.04;
    }
  });

  return (
    <mesh ref={mesh} position={[2.6, 0.6, 0]}>
      <icosahedronGeometry args={[1.4, 12]} />
      <MeshDistortMaterial
        ref={material as never}
        color={rule}
        emissive={ledger}
        emissiveIntensity={0.35}
        roughness={0.4}
        metalness={0.05}
        distort={animate ? 0.35 : 0}
        speed={1.2}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </mesh>
  );
}
