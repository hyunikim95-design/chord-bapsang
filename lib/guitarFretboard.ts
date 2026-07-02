import {
  areSamePitch as areSamePitchClass,
  getNoteNameAtFret,
  getNoteNamePreference,
  getPitchClass,
  getPreferredNoteName,
} from "./musicNotes";

export const ROOT_NOTE_COLOR = "#F59E0B";
export const ROOT_NOTE_ACTIVE_COLOR = "#FBBF24";
export const ROOT_NOTE_DARK = "#02040A";
export const TARGET_NOTE_COLOR = "#3B82F6";
export const OPEN_TARGET_NOTE_COLOR = "#60A5FA";
export const RESOLVE_NOTE_COLOR = "#10B981";
export const GUIDE_TONE_COLOR = "#1E40AF";
export const CHORD_TONE_COLOR = "#334155";
export const SCALE_TONE_COLOR = "#1E293B";
export const DISABLED_NOTE_COLOR = "#0F172A";

export type InstrumentMode = "guitar" | "bass";

export const standardTuningNotes = ["E", "A", "D", "G", "B", "E"];
export const bassTuningNotes = ["E", "A", "D", "G"];

export function getTuningNotes(instrumentMode: InstrumentMode = "guitar") {
  return instrumentMode === "bass" ? bassTuningNotes : standardTuningNotes;
}

export type FretRole =
  | "root"
  | "target"
  | "resolve"
  | "third"
  | "seventh"
  | "chord"
  | "scale"
  | "inactive";

export type FretboardDisplayMode =
  | "all"
  | "scale"
  | "chord"
  | "target"
  | "guide";

export function getChordRootSymbol(symbol: string) {
  const match = symbol.split("/")[0].trim().match(/^([A-G](?:#|b)?)/);
  return match?.[1] ?? "";
}

export function sameNotePitch(noteA?: string, noteB?: string) {
  return areSamePitchClass(noteA, noteB);
}

export function getStringNoteAtFret(
  stringIndex: number,
  fret: number,
  keyRoot = "C",
  instrumentMode: InstrumentMode = "guitar"
) {
  const openNote = getTuningNotes(instrumentMode)[stringIndex] ?? "E";
  return getNoteNameAtFret(openNote, fret, getNoteNamePreference(keyRoot));
}

export function formatNoteForKey(note: string, keyRoot: string) {
  return getPreferredNoteName(getPitchClass(note), getNoteNamePreference(keyRoot));
}

export function getGuitarStringNumber(
  stringIndex: number,
  instrumentMode: InstrumentMode = "guitar"
) {
  return getTuningNotes(instrumentMode).length - stringIndex;
}
