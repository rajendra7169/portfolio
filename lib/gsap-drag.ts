"use client";

// GSAP's Draggable, for the few parts that are dragged (the Experience badge, the
// contact hand, some project worlds). Registered here rather than in lib/gsap, so
// pages with nothing to drag don't download it (it was in every page's script).
import { Draggable } from "gsap/Draggable";
import { gsap } from "./gsap";

if (typeof window !== "undefined") gsap.registerPlugin(Draggable);

export { Draggable };
