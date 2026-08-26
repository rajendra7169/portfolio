/**
 * pointer.ts — normalized cursor position, written once per pointermove and
 * read by whatever wants parallax.
 *
 * A module object rather than React state for the same reason as the scroll
 * store: the scene samples it every frame.
 */
export const pointer = { x: 0, y: 0 };

let attached = false;

export function attachPointer(): () => void {
  if (attached || typeof window === 'undefined') return () => {};
  attached = true;

  const onMove = (e: PointerEvent): void => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  // A touch device has no hover; leaving the last touch position latched would
  // freeze the parallax off-centre.
  const onLeave = (): void => {
    pointer.x = 0;
    pointer.y = 0;
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerleave', onLeave, { passive: true });
  window.addEventListener('pointercancel', onLeave, { passive: true });

  return () => {
    attached = false;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('pointercancel', onLeave);
  };
}
