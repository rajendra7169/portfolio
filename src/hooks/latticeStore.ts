/**
 * latticeStore — the shared hover between the DOM technology marks and the
 * cubes in SkillLattice (DESIGN.md §5.4).
 *
 * Neither side owns the state. The DOM writes on pointer enter, the scene writes
 * on raycast hit, and both read. Putting the state in React and passing it down
 * would mean the scene re-renders the section on every raycast frame.
 */
import { useEffect, useState } from 'react';

let hovered: string | null = null;
const listeners = new Set<(name: string | null) => void>();

export function setHoveredSkill(name: string | null): void {
  if (name === hovered) return;
  hovered = name;
  for (const fn of listeners) fn(hovered);
}

export function getHoveredSkill(): string | null {
  return hovered;
}

export function subscribeHoveredSkill(fn: (name: string | null) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** For the DOM half, which does want a re-render — it changes one class. */
export function useHoveredSkill(): string | null {
  const [name, setName] = useState<string | null>(hovered);
  useEffect(() => subscribeHoveredSkill(setName), []);
  return name;
}
