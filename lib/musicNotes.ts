export type NoteNamePreference = "sharp" | "flat";

export const sharpNoteNames = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export const flatNoteNames = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

const naturalPitchClasses: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const flatKeyRoots = new Set(["F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"]);

export function getPitchClass(note: string) {
  const trimmed = note.trim();
  const match = trimmed.match(/^([A-Ga-g])([#b]*)/);

  if (!match) return 0;

  const letter = match[1].toUpperCase();
  const accidentals = match[2] ?? "";
  const basePitch = naturalPitchClasses[letter] ?? 0;
  const accidentalOffset = accidentals.split("").reduce((offset, mark) => {
    if (mark === "#") return offset + 1;
    if (mark === "b") return offset - 1;
    return offset;
  }, 0);

  return (basePitch + accidentalOffset + 120) % 12;
}

export function areSamePitch(noteA?: string, noteB?: string) {
  if (!noteA || !noteB) return false;
  return getPitchClass(noteA) === getPitchClass(noteB);
}

export function getNoteNamePreference(keyRoot: string): NoteNamePreference {
  return flatKeyRoots.has(keyRoot.trim()) ? "flat" : "sharp";
}

export function getPreferredNoteName(
  pitchClass: number,
  preference: NoteNamePreference
) {
  const normalizedPitch = (pitchClass + 120) % 12;
  return preference === "flat"
    ? flatNoteNames[normalizedPitch]
    : sharpNoteNames[normalizedPitch];
}

export function getNoteNameAtFret(
  openNote: string,
  fret: number,
  preference: NoteNamePreference
) {
  return getPreferredNoteName(getPitchClass(openNote) + fret, preference);
}
