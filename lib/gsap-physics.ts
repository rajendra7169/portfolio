"use client";

// GSAP's Physics2D (`physics2D` tweens: confetti and things thrown), registered
// only by the parts that throw something, like lib/gsap-drag.
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { gsap } from "./gsap";

if (typeof window !== "undefined") gsap.registerPlugin(Physics2DPlugin);
