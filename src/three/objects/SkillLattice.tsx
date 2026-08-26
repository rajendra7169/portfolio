/**
 * SkillLattice — one instanced octahedron per technology in skills.data.
 * Seventeen shards, one draw call.
 *
 * They were solid dark cubes, which at this size read as debris. Now they share
 * the artifact's language: the same flat facets, metallic enough to pick up the
 * procedural environment, so they catch the same light the stone does. No
 * transmission here — seventeen refracting bodies would each re-render the
 * scene, and the frame budget would be gone in one act.
 *
 * Hovering a shard highlights the matching technology name in the DOM, and
 * hovering the name highlights the shard. That two-way link is the one real
 * interactive moment on the page.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';
import { skills } from '../../content';
import {
  getHoveredSkill,
  setHoveredSkill,
  subscribeHoveredSkill,
} from '../../hooks/latticeStore';

interface SkillLatticeProps {
  rule: string;
  ledger: string;
  ink: string;
  presence: React.RefObject<number>;
  transmission: boolean;
}

const ENTRIES = skills.data.flatMap((c) => c.software.map((s) => ({ name: s.name })));

/**
 * A loose shell rather than a grid. Seventeen shards on a lattice read as a
 * spreadsheet, which is the one thing this section must not look like — so they
 * sit on a jittered sphere around the artifact instead, using a deterministic
 * hash so the arrangement is identical on every load.
 */
const LAYOUT = ENTRIES.map((entry, i) => {
  const n = ENTRIES.length;
  // Fibonacci sphere: even coverage without clumping.
  const y = 1 - (i / (n - 1)) * 2;
  const radius = Math.sqrt(Math.max(0, 1 - y * y));
  const phi = i * Math.PI * (3 - Math.sqrt(5));
  const h = Math.sin(i * 12.9898) * 43758.5453;
  const jitter = (k: number): number => ((h * k) % 1) - 0.5;
  const r = 2.15 + jitter(1) * 0.5;
  return {
    ...entry,
    position: [
      Math.cos(phi) * radius * r + jitter(2) * 0.2,
      y * r * 0.75 + jitter(3) * 0.2,
      Math.sin(phi) * radius * r,
    ] as [number, number, number],
    rotation: [jitter(4) * 3, jitter(5) * 3, jitter(6) * 3] as [number, number, number],
  };
});

export function SkillLattice({ rule, ledger, ink, presence, transmission }: SkillLatticeProps) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<string | null>(getHoveredSkill);
  const shown = useRef(0);

  useEffect(() => subscribeHoveredSkill(setHovered), []);

  const ledgerColor = useMemo(() => new THREE.Color(ledger), [ledger]);
  const baseColor = useMemo(() => new THREE.Color(transmission ? ink : rule), [ink, rule, transmission]);

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;
    node.rotation.y += delta * 0.08;

    shown.current += ((presence.current ?? 0) - shown.current) * Math.min(1, delta * 2.5);
    node.visible = shown.current > 0.02;
    node.scale.setScalar(0.5 + shown.current * 0.5);
  });

  return (
    <group ref={group}>
      <Instances limit={LAYOUT.length} frustumCulled={false}>
        <octahedronGeometry args={[0.17, 0]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.15}
          metalness={0.9}
          flatShading
          transparent
          opacity={0.95}
        />
        {LAYOUT.map((entry) => (
          <Shard
            key={entry.name}
            name={entry.name}
            position={entry.position}
            rotation={entry.rotation}
            active={hovered === entry.name}
            ledger={ledgerColor}
            base={baseColor}
          />
        ))}
      </Instances>
    </group>
  );
}

interface ShardProps {
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  active: boolean;
  ledger: THREE.Color;
  base: THREE.Color;
}

function Shard({ name, position, rotation, active, ledger, base }: ShardProps) {
  const ref = useRef<THREE.Object3D & { color: THREE.Color }>(null);

  useFrame((_, delta) => {
    const node = ref.current;
    if (!node) return;
    const target = active ? 1.45 : 1;
    const k = Math.min(1, delta * 8);
    node.scale.setScalar(node.scale.x + (target - node.scale.x) * k);
    node.color?.lerp(active ? ledger : base, k);
  });

  return (
    <Instance
      ref={ref as never}
      position={position}
      rotation={rotation}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoveredSkill(name);
      }}
      onPointerOut={() => setHoveredSkill(null)}
    />
  );
}
