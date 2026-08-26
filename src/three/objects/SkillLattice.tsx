/**
 * SkillLattice — DESIGN.md §5.4. One instanced mesh, one box geometry, one
 * cube per entry in skills.data[].softwareSkills. Seventeen cubes, one draw
 * call.
 *
 * Hovering a cube highlights the matching technology name in the DOM, and
 * hovering the name highlights the cube. That two-way link is the one real
 * interactive moment on the page, and the only thing that demonstrates the
 * geometry is wired to the information rather than being wallpaper.
 *
 * Desktop only. On mobile the marks render as DOM chips and this never mounts.
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
  presence: React.RefObject<number>;
}

const ENTRIES = skills.data.flatMap((category) =>
  category.software.map((skill) => ({ name: skill.name, category: category.id })),
);

/**
 * A loose 3D grid with a deterministic per-entry offset. Without the offset
 * seventeen cubes on a lattice read as a spreadsheet, which is the one thing
 * this section must not look like.
 */
const LAYOUT = ENTRIES.map((entry, i) => {
  const cols = 3;
  const col = i % cols;
  const row = Math.floor(i / cols) % 3;
  const layer = Math.floor(i / (cols * 3));
  // Cheap deterministic hash — same jitter on every load.
  const h = Math.sin(i * 12.9898) * 43758.5453;
  const jitter = (n: number): number => ((h * n) % 1) - 0.5;
  return {
    ...entry,
    position: [
      (col - 1) * 0.85 + jitter(1) * 0.35,
      (row - 1) * 0.85 + jitter(2) * 0.35,
      (layer - 1) * 0.85 + jitter(3) * 0.35,
    ] as [number, number, number],
  };
});

export function SkillLattice({ rule, ledger, presence }: SkillLatticeProps) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<string | null>(getHoveredSkill);
  const opacity = useRef(0);

  useEffect(() => subscribeHoveredSkill(setHovered), []);

  const ledgerColor = useMemo(() => new THREE.Color(ledger), [ledger]);
  const ruleColor = useMemo(() => new THREE.Color(rule), [rule]);

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;
    node.rotation.y += delta * 0.08;

    const target = presence.current ?? 0;
    opacity.current += (target - opacity.current) * Math.min(1, delta * 3);
    node.visible = opacity.current > 0.02;
    node.scale.setScalar(0.6 + opacity.current * 0.4);
  });

  return (
    <group ref={group} position={[-3.4, 0.4, -1]}>
      <Instances limit={LAYOUT.length} frustumCulled={false}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial
          transparent
          opacity={0.9}
          roughness={0.5}
          metalness={0.1}
          color={ruleColor}
        />
        {LAYOUT.map((entry) => (
          <Cube
            key={entry.name}
            name={entry.name}
            position={entry.position}
            active={hovered === entry.name}
            ledger={ledgerColor}
            rule={ruleColor}
          />
        ))}
      </Instances>
    </group>
  );
}

interface CubeProps {
  name: string;
  position: [number, number, number];
  active: boolean;
  ledger: THREE.Color;
  rule: THREE.Color;
}

function Cube({ name, position, active, ledger, rule }: CubeProps) {
  const ref = useRef<THREE.Object3D & { color: THREE.Color }>(null);

  useFrame((_, delta) => {
    const node = ref.current;
    if (!node) return;
    const target = active ? 1.4 : 1;
    const s = node.scale.x + (target - node.scale.x) * Math.min(1, delta * 8);
    node.scale.setScalar(s);
    node.color?.lerp(active ? ledger : rule, Math.min(1, delta * 8));
  });

  return (
    <Instance
      ref={ref as never}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoveredSkill(name);
      }}
      onPointerOut={() => setHoveredSkill(null)}
    />
  );
}
