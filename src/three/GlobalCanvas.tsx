/**
 * GlobalCanvas — the one and only <Canvas> in the application (the brief §4.2).
 *
 * Mounted once at the app root, position: fixed, never unmounted. If you find
 * yourself adding a second one, the architecture is wrong.
 *
 * The <Canvas> sits inside a wrapper this file owns rather than being styled
 * directly. R3F renders its own container divs between the element and any
 * className passed to it, so styling the wrapper is the only way to be certain
 * the fixed positioning, the pointer-events rule and the mobile horizon band
 * actually apply to the thing on screen.
 *
 * Pointer events are off on the whole wrapper. They arrive from document.body
 * instead, so the scene can still be hovered — the skill lattice depends on it
 * — while every link and button in the DOM above keeps its own clicks.
 */
import { Canvas } from '@react-three/fiber';
import type { Quality } from '../hooks/useQualityTier';
import { Scene } from './Scene';

interface GlobalCanvasProps {
  quality: Quality;
}

export function GlobalCanvas({ quality }: GlobalCanvasProps) {
  return (
    <div className="global-canvas" aria-hidden="true">
      <Canvas
        dpr={quality.dpr}
        eventSource={typeof document !== 'undefined' ? document.body : undefined}
        eventPrefix="client"
        gl={{
          antialias: quality.tier === 'desktop',
          alpha: true,
          powerPreference: 'high-performance',
          premultipliedAlpha: false,
          stencil: false,
          depth: true,
        }}
        camera={{ fov: 42, near: 0.1, far: 120, position: [0, 0.5, 6] }}
        // Under reduced motion nothing drifts, so there is nothing to redraw
        // until scroll or the theme changes something.
        frameloop={quality.tier === 'reduced' ? 'demand' : 'always'}
        resize={{ scroll: false, debounce: { scroll: 0, resize: 150 } }}
        onCreated={({ gl }) => {
          // The accessibility tree must not see the scene at all
          // (the brief §9), and it must never be a tab stop.
          gl.domElement.setAttribute('aria-hidden', 'true');
          gl.domElement.setAttribute('role', 'presentation');
          gl.domElement.tabIndex = -1;
        }}
      >
        <Scene quality={quality} />
      </Canvas>
    </div>
  );
}
