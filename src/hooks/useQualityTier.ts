/**
 * useQualityTier — the brief §6. Chosen once on mount and never changed
 * mid-session: a tier that flips while the reader is scrolling produces a
 * visible pop and, worse, re-uploads geometry to the GPU.
 */
import { useState } from 'react';
import { prefersReducedMotion } from './useReducedMotion';

export type Tier = 'desktop' | 'mobile' | 'reduced' | 'none';

export interface Quality {
  tier: Tier;
  /** False means render the static backdrop and the complete DOM instead. */
  webgl: boolean;
  dpr: [number, number];
  points: number;
  ridgeSegments: number;
  bloom: boolean;
  lattice: boolean;
  /** 'full' | 'short' | 'cut' — how the camera moves between acts. */
  camera: 'full' | 'short' | 'cut';
}

/**
 * A real context, not a `'webgl' in window` guess. Blocklisted drivers, GPU
 * process crashes and headless environments all fail here rather than at the
 * first draw call, which is the point — the brief §4.7.
 */
export function detectWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl');
    if (!gl) return false;
    // Some software rasterisers report a context and then fail on first use.
    const ok = typeof (gl as WebGLRenderingContext).getParameter === 'function';
    (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext();
    return ok;
  } catch {
    return false;
  }
}

interface NavigatorWithHints extends Navigator {
  deviceMemory?: number;
}

function isConstrainedDevice(): boolean {
  if (typeof window === 'undefined') return true;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const narrow = window.matchMedia('(max-width: 63.999rem)').matches;
  const nav = navigator as NavigatorWithHints;
  const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4;
  const fewCores =
    typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
  return coarse || narrow || lowMemory || fewCores;
}

function resolve(): Quality {
  if (!detectWebGL()) {
    return {
      tier: 'none',
      webgl: false,
      dpr: [1, 1],
      points: 0,
      ridgeSegments: 0,
      bloom: false,
      lattice: false,
      camera: 'cut',
    };
  }

  if (prefersReducedMotion()) {
    return {
      tier: 'reduced',
      webgl: true,
      dpr: [1, 1.5],
      points: 0,
      ridgeSegments: 0,
      bloom: false,
      lattice: false,
      camera: 'cut',
    };
  }

  if (isConstrainedDevice()) {
    return {
      tier: 'mobile',
      webgl: true,
      dpr: [1, 1.5],
      points: 2500,
      ridgeSegments: 48,
      bloom: false,
      lattice: false,
      camera: 'short',
    };
  }

  return {
    tier: 'desktop',
    webgl: true,
    dpr: [1, 2],
    points: 8000,
    ridgeSegments: 128,
    bloom: true,
    lattice: true,
    camera: 'full',
  };
}

export function useQualityTier(): Quality {
  // Lazy initialiser: resolved on the first client render, then frozen.
  const [quality] = useState<Quality>(resolve);
  return quality;
}
