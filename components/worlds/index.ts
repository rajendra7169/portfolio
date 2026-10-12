// Each project page is its own world.
import type { ComponentType } from "react";
import type { Project } from "@/lib/projects";
import Blazify from "./blazify/Blazify";
import Fitevo from "./fitevo/Fitevo";
import NexTerm from "./nexterm/NexTerm";
import Jarvis from "./jarvis/Jarvis";
import Tally from "./tally/Tally";
import RAi from "./r-ai/RAi";
import Vocabu from "./vocabu/Vocabu";

export const WORLDS: Record<string, ComponentType<{ p: Project }>> = {
  blazify: Blazify,
  fitevo: Fitevo,
  nexterm: NexTerm,
  jarvis: Jarvis,
  tally: Tally,
  "r-ai": RAi,
  vocabu: Vocabu,
};
