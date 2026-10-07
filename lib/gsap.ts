"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const DESKTOP = "(min-width: 900px)";

export { gsap, ScrollTrigger, useGSAP };
