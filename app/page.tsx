"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  analyzeProgression,
  getChordInfo,
  majorKeys,
} from "../lib/harmony";
import {
  getChordQualityKey,
  getChordTheoryProfile,
} from "../data/chordTheory";
import { chordDescriptions } from "../data/chordDescriptions";
import { getGuitarVoicings, type GuitarVoicing } from "../data/guitarVoicings";
import { practicePresets, type PracticePreset } from "../data/practicePresets";
import { getRecommendedScaleProfilesForChord } from "../data/scaleTheory";

type VoicingMode = "all" | "easy" | "open" | "barre" | "upper" | "neo";

const voicingModeLabels: Record<VoicingMode, string> = {
  all: "전체",
  easy: "쉬운 보이싱",
  open: "오픈코드",
  barre: "바레코드",
  upper: "상단현/커팅",
  neo: "네오소울/색채",
};
const voicingModeOrder: VoicingMode[] = [
  "all",
  "easy",
  "open",
  "barre",
  "upper",
  "neo",
];
type PresetCategory =
  | "all"
  | "기초"
  | "차용화음"
  | "세컨더리"
  | "재즈"
  | "커팅"
  | "네오소울"
  | "록";

const presetCategories: PresetCategory[] = [
  "all",
  "기초",
  "차용화음",
  "세컨더리",
  "재즈",
  "커팅",
  "네오소울",
  "록",
];

function getPresetCategoryLabel(category: PresetCategory) {
  if (category === "all") return "전체";
  return category;
}
type RandomFlavor =
  | "basic"
  | "borrowed"
  | "secondary"
  | "jazz"
  | "rock"
  | "neo";

const randomFlavorLabels: Record<RandomFlavor, string> = {
  basic: "기본 팝",
  borrowed: "차용화음",
  secondary: "세컨더리 도미넌트",
  jazz: "2-5-1 / 재즈",
  rock: "록/모달",
  neo: "네오소울",
};
const randomFlavorBriefs: Record<
  RandomFlavor,
  {
    focus: string;
    tension: string;
    guitarTip: string;
    listeningPoint: string;
  }
> = {
  basic: {
    focus: "I, vi, IV, V 중심의 기본 팝 진행. 안정적인 토닉과 익숙한 해결감을 익히기 좋음.",
    tension: "대부분 강한 긴장보다는 자연스러운 흐름이 핵심. V에서 I로 돌아오는 순간을 들어봐.",
    guitarTip: "오픈코드나 쉬운 보이싱으로 박자 안정, 코드 전환 속도, 스트로크 균일성을 먼저 잡으면 좋음.",
    listeningPoint: "각 코드가 튀기보다 하나의 루프로 부드럽게 이어지는지 확인.",
  },
  borrowed: {
    focus: "장조 안에 단조에서 빌려온 코드가 들어가는 차용화음 연습. 갑자기 색이 어두워지는 순간이 핵심.",
    tension: "iv, bVI, bVII, bIII 같은 코드에서 정서적 꺾임이 생김. 특히 IV에서 iv로 내려갈 때 아련함이 강함.",
    guitarTip: "상단현/커팅 보이싱으로 얇게 잡으면 차용화음의 색채 변화가 더 잘 들림.",
    listeningPoint: "밝은 장조 분위기에서 갑자기 그늘이 생기는 지점을 귀로 잡아봐.",
  },
  secondary: {
    focus: "원래 조성 밖의 도미넌트7을 써서 다음 코드를 강하게 끌어당기는 연습.",
    tension: "E7→Am, A7→Dm, D7→G7 같은 순간이 핵심. 해결 직전의 강한 방향감을 들어야 함.",
    guitarTip: "7화음의 3도와 b7음을 의식하면서 잡으면 도미넌트의 맛이 선명해짐.",
    listeningPoint: "도미넌트7이 나올 때 다음 코드가 거의 예고되는 느낌이 드는지 확인.",
  },
  jazz: {
    focus: "ii-V-I와 순환 진행 중심. 재즈/실용화성에서 가장 기본적인 중력 구조.",
    tension: "V7에서 긴장이 가장 강하고, Imaj7에서 풀림. ii는 V로 가기 위한 준비 역할.",
    guitarTip: "바레나 4현 중심 보이싱으로 루트 이동을 줄이고, 3도/7도 연결을 부드럽게 만드는 게 좋음.",
    listeningPoint: "Dm7→G7→Cmaj7처럼 서브도미넌트-도미넌트-토닉의 방향감을 들어봐.",
  },
  rock: {
    focus: "bVII, bIII, bVI 같은 모달 코드로 록/브릿팝식 넓은 진행감을 만드는 연습.",
    tension: "전통적인 도미넌트 해결보다 코드 자체의 질감과 루트 움직임이 긴장을 만듦.",
    guitarTip: "바레코드나 파워코드식으로 강하게 잡아도 좋고, 상단현만 잘라서 커팅해도 좋음.",
    listeningPoint: "정석 장조보다 더 거칠고 넓게 열리는 느낌이 나는지 확인.",
  },
  neo: {
    focus: "maj7, m7, secondary dominant를 섞어서 부드럽고 세련된 색채를 만드는 연습.",
    tension: "강한 해결보다 미묘한 색채 변화가 핵심. maj7과 m7의 부드러운 밀도를 들어야 함.",
    guitarTip: "상단현, 루트리스, 작은 폼을 쓰면 네오소울 느낌이 훨씬 잘 살아남.",
    listeningPoint: "코드가 바뀌어도 손이 크게 움직이지 않고, 색만 은근히 변하는 느낌을 들어봐.",
  },
};

type RandomProgressionTemplate = {
  progression: string;
  length: number;
};

const randomProgressionTemplates: Record<
  RandomFlavor,
  RandomProgressionTemplate[]
> = {
  basic: [
    { progression: "C - Am - F - G", length: 4 },
    { progression: "C - G - Am - F", length: 4 },
    { progression: "C - F - G - C", length: 4 },
    { progression: "C - Em - Am - F", length: 4 },
  ],
  borrowed: [
    { progression: "C - F - Fm - C", length: 4 },
    { progression: "C - Ab - Bb - C", length: 4 },
    { progression: "C - Eb - F - C", length: 4 },
    { progression: "C - Am - F - Fm - C", length: 5 },
    { progression: "C - F - Fm - C - G - C", length: 6 },
  ],
  secondary: [
    { progression: "C - E7 - Am - F", length: 4 },
    { progression: "C - A7 - Dm - G7", length: 4 },
    { progression: "C - E7 - Am - D7 - G7 - C", length: 6 },
    { progression: "C - C7 - F - D7 - G7 - C", length: 6 },
  ],
  jazz: [
    { progression: "Dm7 - G7 - Cmaj7", length: 3 },
    { progression: "Cmaj7 - Am7 - Dm7 - G7", length: 4 },
    { progression: "Em7 - A7 - Dm7 - G7 - Cmaj7", length: 5 },
    { progression: "Cmaj7 - A7 - Dm7 - G7 - Cmaj7", length: 5 },
  ],
  rock: [
    { progression: "C - Bb - F - C", length: 4 },
    { progression: "C - Eb - Bb - F", length: 4 },
    { progression: "C - G - Bb - F", length: 4 },
    { progression: "C - Bb - Ab - Bb - C", length: 5 },
  ],
  neo: [
    { progression: "Cmaj7 - Am7 - Dm7 - G7", length: 4 },
    { progression: "Cmaj7 - E7 - Am7 - D7 - G7 - Cmaj7", length: 6 },
    { progression: "Cmaj7 - Bm7b5 - E7 - Am7", length: 4 },
    { progression: "Cmaj7 - Gm7 - C7 - Fmaj7", length: 4 },
  ],
};

const sharpNotes = [
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

const flatNotes = [
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

function getNoteIndex(note: string) {
  const sharpIndex = sharpNotes.indexOf(note);
  if (sharpIndex !== -1) return sharpIndex;

  const flatIndex = flatNotes.indexOf(note);
  if (flatIndex !== -1) return flatIndex;

  return 0;
}

function getOutputNoteNames(key: string) {
  const flatKeyNames = ["F", "Bb", "Eb", "Ab", "Db", "Gb"];
  return flatKeyNames.includes(key) ? flatNotes : sharpNotes;
}

function transposeChordFromC(chord: string, targetKey: string) {
  const match = chord.match(/^([A-G](?:#|b)?)(.*)$/);

  if (!match) return chord;

  const root = match[1];
  const quality = match[2];

  const targetKeyIndex = getNoteIndex(targetKey);
  const rootIndex = getNoteIndex(root);
  const transposedIndex = (rootIndex + targetKeyIndex + 12) % 12;

  const outputNotes = getOutputNoteNames(targetKey);
  const transposedRoot = outputNotes[transposedIndex];

  return `${transposedRoot}${quality}`;
}

function transposeProgressionFromC(progression: string, targetKey: string) {
  return progression
    .split(" - ")
    .map((chord) => transposeChordFromC(chord.trim(), targetKey))
    .join(" - ");
}

function getRandomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}
type GeneratedProgressionHistoryItem = {
  id: string;
  progression: string;
  key: string;
  flavor: RandomFlavor;
  length: number;
  voicingMode: VoicingMode;
};
type FavoriteProgressionItem = {
  id: string;
  title: string;
  progression: string;
  key: string;
  flavor: RandomFlavor;
  length: number;
  voicingMode: VoicingMode;
  createdAt: number;
};
type TrainingMode = "chords" | "solo";
type ViewMode = "minimal" | "normal" | "study";
type TheorySectionId =
  | "summary"
  | "roman"
  | "function"
  | "borrowed"
  | "secondary"
  | "chordTheory"
  | "scales"
  | "voicing"
  | "solo";
type RecentPracticeSession = {
  id: string;
  title: string;
  progression: string;
  key: string;
  bpm: number;
  beatsPerChord: number;
  voicingMode: VoicingMode;
  trainingMode: TrainingMode;
  updatedAt: number;
};

const favoriteProgressionsStorageKey =
  "chord-bapsang-favorite-progressions-v1";
const recentPracticeSessionsStorageKey =
  "chord-bapsang-recent-practice-sessions-v1";
const viewModeLabels: Record<ViewMode, string> = {
  minimal: "Minimal",
  normal: "Normal",
  study: "Study",
};
const defaultOpenStudySections: TheorySectionId[] = ["summary", "roman"];
const ROOT_NOTE_COLOR = "#F59E0B";
const ROOT_NOTE_DARK = "#02040A";
const TARGET_NOTE_COLOR = "#2563EB";
const GUIDE_TONE_COLOR = "#1E40AF";
const CHORD_TONE_COLOR = "#334155";
const SCALE_TONE_COLOR = "#1E293B";
const DISABLED_NOTE_COLOR = "#0F172A";

type ProgressionAnalysis = ReturnType<typeof analyzeProgression>;
type PracticeItem = ProgressionAnalysis["items"][number];
type VoicingPair = {
  currentVoicing: GuitarVoicing;
  nextVoicing: GuitarVoicing;
  distance: number;
};

const majorScaleSteps = [0, 2, 4, 5, 7, 9, 11];
const standardTuningNotes = ["E", "A", "D", "G", "B", "E"];
const soloRhythmPrompts = [
  "한 마디는 쉬고, 다음 마디에 짧게 답하기",
  "8분음표 두 개와 긴 음 하나만 쓰기",
  "첫 박은 비우고 2박부터 들어가기",
  "코드가 바뀔 때 루트 대신 3도로 착지하기",
];
const soloConstraintPrompts = [
  "세 음만 골라서 반복",
  "벤딩 없이 슬라이드와 해머링만 사용",
  "높은 줄 두 줄에서만 연주",
  "다음 코드의 구성음 하나를 미리 겨냥",
];

function getVoicingModeForRandomFlavor(flavor: RandomFlavor): VoicingMode {
  if (flavor === "basic") return "open";
  if (flavor === "borrowed") return "upper";
  if (flavor === "secondary") return "all";
  if (flavor === "jazz") return "barre";
  if (flavor === "rock") return "barre";
  if (flavor === "neo") return "neo";

  return "all";
}
function getDefaultFavoriteTitle(flavor: RandomFlavor, progression: string) {
  const baseTitle =
    flavor === "basic"
      ? "기본 팝 루프"
      : flavor === "borrowed"
        ? "아련한 차용화음 루프"
        : flavor === "secondary"
          ? "세컨더리 도미넌트 연습"
          : flavor === "jazz"
            ? "2-5-1 재즈 루틴"
            : flavor === "rock"
              ? "록/모달 진행"
              : flavor === "neo"
                ? "네오소울 색채 진행"
                : "즐겨찾기 진행";

  return `${baseTitle} - ${progression}`;
}

function filterVoicingsByMode(voicings: GuitarVoicing[], mode: VoicingMode) {
  if (mode === "all") return voicings;

  return voicings.filter((voicing) => {
    const text = `${voicing.name} ${voicing.note} ${voicing.frets}`.toLowerCase();

    if (mode === "easy") {
      return voicing.difficulty === "쉬움";
    }

    if (mode === "open") {
      return text.includes("오픈") || text.includes("open");
    }

    if (mode === "barre") {
      return (
        text.includes("바레") ||
        text.includes("barre") ||
        text.includes("e폼") ||
        text.includes("a폼")
      );
    }

    if (mode === "upper") {
      return text.includes("상단현") || text.includes("커팅") || text.includes("xx");
    }

    if (mode === "neo") {
      return (
        text.includes("네오소울") ||
        text.includes("시티팝") ||
        text.includes("maj7") ||
        text.includes("메이저7") ||
        text.includes("색채")
      );
    }

    return true;
  });
}

function parseFretString(frets: string) {
  return frets.split("").map((char) => {
    if (char.toLowerCase() === "x") return null;

    const fret = Number(char);

    if (Number.isNaN(fret)) return null;

    return fret;
  });
}

function parseFingeringString(fingering?: string) {
  if (!fingering) return [];

  const tokens = fingering.includes(" ")
    ? fingering.trim().split(/\s+/)
    : fingering.trim().split("");

  return tokens.slice(0, 6).map((token) => {
    const normalized = token.toLowerCase();
    if (normalized === "x" || normalized === "0") return null;

    return /^[1-4]$/.test(normalized) ? normalized : null;
  });
}

function getChordRootSymbol(symbol: string) {
  const match = symbol.split("/")[0].trim().match(/^([A-G](?:#|b)?)/);
  return match?.[1] ?? "";
}

function sameNotePitch(noteA?: string, noteB?: string) {
  if (!noteA || !noteB) return false;
  return getNoteIndex(noteA) === getNoteIndex(noteB);
}

function getStringNoteAtFret(stringIndex: number, fret: number) {
  const openNote = standardTuningNotes[stringIndex] ?? "E";
  return sharpNotes[(getNoteIndex(openNote) + fret) % 12];
}

function getGuitarStringNumber(stringIndex: number) {
  return 6 - stringIndex;
}

function formatRootPosition(stringIndex: number, fret: number, note: string) {
  const stringNumber = getGuitarStringNumber(stringIndex);
  const fretLabel = fret === 0 ? "개방현" : `${fret}프렛`;
  return `${stringNumber}번줄 ${fretLabel} ${note}`;
}

function getGuideToneNotes(symbol: string, voicing?: GuitarVoicing) {
  if (voicing?.guideTones?.length) return voicing.guideTones;

  const chordInfo = getChordInfo(symbol);
  if (!chordInfo) return [];

  return [chordInfo.notes[1], chordInfo.notes[3]].filter(Boolean);
}

function getGuideToneHint(symbol: string, voicing: GuitarVoicing) {
  if (voicing.guideToneHint) return voicing.guideToneHint;

  const chordInfo = getChordInfo(symbol);
  if (!chordInfo || chordInfo.notes.length < 2) return "핵심음 미등록";

  const third = chordInfo.notes[1];
  const seventh = chordInfo.notes[3];

  return seventh ? `3도 ${third}, 7도 ${seventh}` : `3도 ${third}`;
}

function getVoicingRootPositions(
  voicing: GuitarVoicing,
  symbol: string
) {
  const frets = parseFretString(voicing.frets).slice(0, 6);
  const rootNote = voicing.rootNote ?? getChordRootSymbol(symbol);

  if (!rootNote) return [];

  if (
    typeof voicing.rootString === "number" &&
    typeof voicing.rootFret === "number"
  ) {
    const stringIndex = 6 - voicing.rootString;

    if (stringIndex >= 0 && stringIndex < 6) {
      return [
        {
          stringIndex,
          fret: voicing.rootFret,
          note: voicing.rootNote ?? getStringNoteAtFret(stringIndex, voicing.rootFret),
        },
      ];
    }
  }

  return frets
    .map((fret, stringIndex) => {
      if (fret === null) return null;

      const note = getStringNoteAtFret(stringIndex, fret);

      if (!sameNotePitch(note, rootNote)) return null;

      return { stringIndex, fret, note };
    })
    .filter(
      (position): position is { stringIndex: number; fret: number; note: string } =>
        position !== null
    );
}

function getRootHint(symbol: string, voicing: GuitarVoicing) {
  if (voicing.rootHint) return voicing.rootHint;

  const rootPosition = getVoicingRootPositions(voicing, symbol)[0];

  if (!rootPosition) return "루트 위치 미등록";

  return formatRootPosition(
    rootPosition.stringIndex,
    rootPosition.fret,
    rootPosition.note
  );
}

function getNoteFrequency(note: string, octave = 2) {
  const noteIndex = getNoteIndex(note);
  const midiNote = 12 * (octave + 1) + noteIndex;

  return 440 * 2 ** ((midiNote - 69) / 12);
}

function calculateVoicingDistance(currentFrets: string, nextFrets: string) {
  const current = parseFretString(currentFrets);
  const next = parseFretString(nextFrets);

  let distance = 0;
  let comparedStrings = 0;

  for (let i = 0; i < Math.min(current.length, next.length); i++) {
    const currentFret = current[i];
    const nextFret = next[i];

    if (currentFret === null || nextFret === null) {
      continue;
    }

    distance += Math.abs(currentFret - nextFret);
    comparedStrings += 1;
  }

  const mutedPenalty =
    Math.abs(
      current.filter((fret) => fret === null).length -
        next.filter((fret) => fret === null).length
    ) * 2;

  if (comparedStrings === 0) {
    return 999;
  }

  return distance + mutedPenalty;
}

function getBestVoicingPair(
  currentVoicings: GuitarVoicing[],
  nextVoicings: GuitarVoicing[]
): VoicingPair | null {
  if (currentVoicings.length === 0 || nextVoicings.length === 0) {
    return null;
  }

  const pairs = currentVoicings.flatMap((currentVoicing) =>
    nextVoicings.map((nextVoicing) => ({
      currentVoicing,
      nextVoicing,
      distance: calculateVoicingDistance(
        currentVoicing.frets,
        nextVoicing.frets
      ),
    }))
  );

  return pairs.sort((a, b) => a.distance - b.distance)[0];
}

function getMovementLabel(distance: number) {
  if (distance <= 4) return "매우 가까움";
  if (distance <= 8) return "가까움";
  if (distance <= 14) return "보통";
  return "이동 많음";
}

function formatFingerLabel(finger: string) {
  const labels: Record<string, string> = {
    "1": "1번 손가락",
    "2": "2번 손가락",
    "3": "3번 손가락",
    "4": "4번 손가락",
  };

  return labels[finger] ?? `${finger}번 손가락`;
}

function formatStringFret(stringIndex: number, fret: number) {
  const stringNumber = getGuitarStringNumber(stringIndex);
  const fretLabel = fret === 0 ? "개방현" : `${fret}프렛`;

  return `${stringNumber}번줄 ${fretLabel}`;
}

function getFocusMovementHint(
  currentSymbol: string,
  nextSymbol: string | undefined,
  pair: VoicingPair | null
) {
  if (!pair || !nextSymbol) {
    return "다음 이동: 루트 위치와 공통음을 확인";
  }

  const currentFrets = parseFretString(pair.currentVoicing.frets).slice(0, 6);
  const nextFrets = parseFretString(pair.nextVoicing.frets).slice(0, 6);
  const stableStrings = currentFrets
    .map((fret, stringIndex) => {
      if (fret === null || nextFrets[stringIndex] !== fret) return null;
      if (fret === 0) return `${getGuitarStringNumber(stringIndex)}번줄 개방현`;
      return `${getGuitarStringNumber(stringIndex)}번줄 ${fret}프렛`;
    })
    .filter((value): value is string => value !== null)
    .slice(0, 2);
  const nextRoot = getRootHint(nextSymbol, pair.nextVoicing);
  const moveLabel = getMovementLabel(pair.distance);

  if (stableStrings.length > 0) {
    return `다음 이동: ${stableStrings.join(", ")} 유지, 루트는 ${nextRoot} 확인`;
  }

  return `다음 이동: ${currentSymbol} → ${nextSymbol}, ${moveLabel} 연결. 루트 위치와 공통음을 확인`;
}

function getEnhancedFocusMovementHint(
  currentSymbol: string,
  nextSymbol: string | undefined,
  pair: VoicingPair | null
) {
  if (!pair || !nextSymbol) {
    return getFocusMovementHint(currentSymbol, nextSymbol, pair);
  }

  const currentFrets = parseFretString(pair.currentVoicing.frets).slice(0, 6);
  const nextFrets = parseFretString(pair.nextVoicing.frets).slice(0, 6);
  const currentFingers = parseFingeringString(pair.currentVoicing.fingering);
  const nextFingers = parseFingeringString(pair.nextVoicing.fingering);
  const fingerHints: string[] = [];
  const commonToneHints: string[] = [];

  for (let stringIndex = 0; stringIndex < 6; stringIndex += 1) {
    const currentFinger = currentFingers[stringIndex];
    const nextFinger = nextFingers[stringIndex];
    const currentFret = currentFrets[stringIndex];
    const nextFret = nextFrets[stringIndex];

    if (
      currentFinger &&
      nextFinger &&
      currentFinger === nextFinger &&
      typeof currentFret === "number" &&
      typeof nextFret === "number"
    ) {
      if (currentFret === nextFret) {
        fingerHints.push(
          `${formatFingerLabel(currentFinger)} ${formatStringFret(
            stringIndex,
            currentFret
          )} 유지`
        );
      } else {
        fingerHints.push(
          `${formatFingerLabel(currentFinger)} ${formatStringFret(
            stringIndex,
            currentFret
          )}에서 ${formatStringFret(stringIndex, nextFret)}로 이동`
        );
      }
    }

    if (
      typeof currentFret === "number" &&
      typeof nextFret === "number" &&
      currentFret === nextFret
    ) {
      commonToneHints.push(`${getStringNoteAtFret(stringIndex, currentFret)} 공통음 유지`);
    }
  }

  const currentRoot = getRootHint(currentSymbol, pair.currentVoicing);
  const nextRoot = getRootHint(nextSymbol, pair.nextVoicing);
  const mainHint =
    fingerHints[0] ??
    commonToneHints[0] ??
    `${currentSymbol}에서 ${nextSymbol}로 ${getMovementLabel(pair.distance)} 연결`;

  return `NEXT MOVE: ${mainHint}. 루트: ${currentRoot} → ${nextRoot}.`;
}

function getResolutionCandidates(nextItem: PracticeItem | undefined) {
  if (!nextItem || nextItem.notes.length === 0) return [];

  const quality = getChordQualityKey(nextItem.symbol);
  const root = nextItem.notes[0];
  const third = nextItem.notes[1];

  if (quality === "dominant7" || quality === "maj7" || quality === "major") {
    return [third, root].filter(Boolean);
  }

  if (quality === "m7" || quality === "minor" || quality === "m7b5") {
    return [third, root].filter(Boolean);
  }

  return [root, third].filter(Boolean);
}

function getSoloTargetRecommendation(
  currentItem: PracticeItem | undefined,
  nextItem: PracticeItem | undefined,
  rhythmPrompt: string,
  constraintPrompt: string
) {
  const symbol = currentItem?.symbol ?? "-";
  const notes = currentItem?.notes ?? [];
  const quality = getChordQualityKey(symbol);
  const root = notes[0] ?? getChordRootSymbol(symbol);
  const third = notes[1] ?? root;
  const fifth = notes[2] ?? root;
  const seventh = notes[3];
  const resolutionCandidates = getResolutionCandidates(nextItem);

  if (quality === "dominant7") {
    const targetNote = third;
    return {
      targetNote,
      alternateTargets: [third, seventh].filter(Boolean),
      reason: `${symbol}의 3도라서 도미넌트 긴장이 가장 선명하게 들립니다.`,
      resolution: resolutionCandidates.join(", ") || "다음 코드의 루트",
      exercise: `${constraintPrompt}. ${rhythmPrompt}`,
    };
  }

  if (quality === "maj7" || quality === "maj9") {
    const targetNote = third;
    return {
      targetNote,
      alternateTargets: [third, seventh].filter(Boolean),
      reason: `${symbol}의 3도/7도를 노리면 maj7의 세련된 색이 살아납니다.`,
      resolution: resolutionCandidates.join(", ") || root,
      exercise: rhythmPrompt,
    };
  }

  if (quality === "m7" || quality === "m9" || quality === "m7b5") {
    const targetNote = third;
    return {
      targetNote,
      alternateTargets: [third, seventh].filter(Boolean),
      reason: `${symbol}의 b3/b7을 노리면 마이너 계열 색이 바로 들립니다.`,
      resolution: resolutionCandidates.join(", ") || root,
      exercise: `${constraintPrompt}. ${rhythmPrompt}`,
    };
  }

  if (quality === "minor") {
    return {
      targetNote: third,
      alternateTargets: [third, root].filter(Boolean),
      reason: `${symbol}의 b3를 먼저 들으면 마이너 정서가 안정적으로 잡힙니다.`,
      resolution: resolutionCandidates.join(", ") || root,
      exercise: rhythmPrompt,
    };
  }

  return {
    targetNote: third,
    alternateTargets: [third, fifth, root].filter(Boolean),
    reason: `${symbol}의 3도를 먼저 노리면 코드 성격이 가장 빠르게 들립니다.`,
    resolution: resolutionCandidates.join(", ") || root,
    exercise: rhythmPrompt,
  };
}

function getMajorScaleNotes(key: string) {
  const keyIndex = getNoteIndex(key);
  const outputNotes = getOutputNoteNames(key);

  return majorScaleSteps.map((step) => outputNotes[(keyIndex + step) % 12]);
}

function getDailyPresetIndex(date = new Date()) {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (date.getTime() - startOfYear.getTime()) / 86_400_000
  );

  return dayOfYear % practicePresets.length;
}

function getRecentPracticeSessionId(
  progression: string,
  key: string,
  trainingMode: TrainingMode
) {
  return `${trainingMode}-${key}-${progression}`;
}

function migrateRecentPracticeSession(
  rawItem: unknown,
  index: number
): RecentPracticeSession | null {
  if (!rawItem || typeof rawItem !== "object") return null;

  const item = rawItem as Record<string, unknown>;
  const progression =
    typeof item.progression === "string" ? item.progression.trim() : "";

  if (!progression) return null;

  const key =
    typeof item.key === "string" && (item.key === "auto" || majorKeys.includes(item.key))
      ? item.key
      : "auto";
  const trainingMode =
    item.trainingMode === "solo" || item.trainingMode === "chords"
      ? item.trainingMode
      : "chords";
  const voicingMode = isVoicingMode(item.voicingMode)
    ? item.voicingMode
    : "all";
  const bpm =
    typeof item.bpm === "number" && Number.isFinite(item.bpm) ? item.bpm : 80;
  const beatsPerChord =
    typeof item.beatsPerChord === "number" && Number.isFinite(item.beatsPerChord)
      ? item.beatsPerChord
      : 4;
  const title =
    typeof item.title === "string" && item.title.trim()
      ? item.title.trim()
      : trainingMode === "solo"
        ? `솔로 연습 - ${progression}`
        : `코드 연습 - ${progression}`;
  const updatedAt =
    typeof item.updatedAt === "number" && Number.isFinite(item.updatedAt)
      ? item.updatedAt
      : Date.now() - index;

  return {
    id: getRecentPracticeSessionId(progression, key, trainingMode),
    title,
    progression,
    key,
    bpm,
    beatsPerChord,
    voicingMode,
    trainingMode,
    updatedAt,
  };
}

function migrateRecentPracticeSessions(rawSessions: unknown) {
  if (!Array.isArray(rawSessions)) return [];

  const seenIds = new Set<string>();
  const sessions: RecentPracticeSession[] = [];

  rawSessions.forEach((rawSession, index) => {
    const session = migrateRecentPracticeSession(rawSession, index);

    if (!session || seenIds.has(session.id)) return;

    seenIds.add(session.id);
    sessions.push(session);
  });

  return sessions.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 6);
}

function getFavoriteProgressionId(
  progression: string,
  key: string,
  flavor: RandomFlavor
) {
  return `${key}-${flavor}-${progression}`;
}

function isRandomFlavor(value: unknown): value is RandomFlavor {
  return typeof value === "string" && value in randomFlavorLabels;
}

function isVoicingMode(value: unknown): value is VoicingMode {
  return (
    typeof value === "string" &&
    voicingModeOrder.includes(value as VoicingMode)
  );
}

function getFavoriteDisplayTitle(item: FavoriteProgressionItem) {
  return (
    item.title.trim() || getDefaultFavoriteTitle(item.flavor, item.progression)
  );
}

function migrateFavoriteProgressionItem(
  rawItem: unknown,
  index: number
): FavoriteProgressionItem | null {
  if (!rawItem || typeof rawItem !== "object") return null;

  const item = rawItem as Record<string, unknown>;
  const progression =
    typeof item.progression === "string" ? item.progression.trim() : "";

  if (!progression) return null;

  const key =
    typeof item.key === "string" && majorKeys.includes(item.key)
      ? item.key
      : "C";
  const flavor = isRandomFlavor(item.flavor) ? item.flavor : "basic";
  const fallbackLength = progression
    .split(" - ")
    .map((chord) => chord.trim())
    .filter(Boolean).length;
  const length =
    typeof item.length === "number" && Number.isFinite(item.length)
      ? item.length
      : fallbackLength || 4;
  const voicingMode = isVoicingMode(item.voicingMode)
    ? item.voicingMode
    : getVoicingModeForRandomFlavor(flavor);
  const title =
    typeof item.title === "string" && item.title.trim()
      ? item.title.trim()
      : getDefaultFavoriteTitle(flavor, progression);
  const createdAt =
    typeof item.createdAt === "number" && Number.isFinite(item.createdAt)
      ? item.createdAt
      : Date.now() - index;

  return {
    id: getFavoriteProgressionId(progression, key, flavor),
    title,
    progression,
    key,
    flavor,
    length,
    voicingMode,
    createdAt,
  };
}

function migrateFavoriteProgressions(
  rawFavorites: unknown
): FavoriteProgressionItem[] {
  if (!Array.isArray(rawFavorites)) return [];

  const seenIds = new Set<string>();
  const migratedFavorites: FavoriteProgressionItem[] = [];

  rawFavorites.forEach((rawFavorite, index) => {
    const favorite = migrateFavoriteProgressionItem(rawFavorite, index);

    if (!favorite || seenIds.has(favorite.id)) return;

    seenIds.add(favorite.id);
    migratedFavorites.push(favorite);
  });

  return migratedFavorites;
}

export default function Home() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const droneOscillatorRef = useRef<OscillatorNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);
  const [input, setInput] = useState("A");
  const [showAdvanced, setShowAdvanced] = useState(true);

  const [progressionInput, setProgressionInput] = useState("A - F#m - D - E");
  const [analysisKey, setAnalysisKey] = useState("auto");

  const [practiceMode, setPracticeMode] = useState(true);
  const [trainingMode, setTrainingMode] = useState<TrainingMode>("chords");
  const [viewMode, setViewMode] = useState<ViewMode>("minimal");
  const [openStudySections, setOpenStudySections] = useState<TheorySectionId[]>(
    defaultOpenStudySections
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const [bpm, setBpm] = useState(80);
  const [beatsPerChord, setBeatsPerChord] = useState(4);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [metronomeEnabled, setMetronomeEnabled] = useState(true);
  const [rootDroneEnabled, setRootDroneEnabled] = useState(false);
  const [countInEnabled, setCountInEnabled] = useState(true);
  const [countInRemaining, setCountInRemaining] = useState<number | null>(null);
  const [beatInChord, setBeatInChord] = useState(1);
  const [voicingMode, setVoicingMode] = useState<VoicingMode>("all");
  const [focusMode, setFocusMode] = useState(false);
  const [selectedPresetCategory, setSelectedPresetCategory] =
  useState<PresetCategory>("all");
  const [randomKey, setRandomKey] = useState("C");
const [randomFlavor, setRandomFlavor] = useState<RandomFlavor>("borrowed");
const [randomLength, setRandomLength] = useState(4);
const [lastRandomProgression, setLastRandomProgression] = useState("");
const [generatedHistory, setGeneratedHistory] = useState<
  GeneratedProgressionHistoryItem[]
>([]);
const [favoriteProgressions, setFavoriteProgressions] = useState<
  FavoriteProgressionItem[]
>([]);
const [recentPracticeSessions, setRecentPracticeSessions] = useState<
  RecentPracticeSession[]
>([]);
const [hasLoadedFavorites, setHasLoadedFavorites] = useState(false);
const [hasLoadedPracticeSessions, setHasLoadedPracticeSessions] =
  useState(false);
const [favoriteTitleInput, setFavoriteTitleInput] = useState("");

  const cleanInput = input.trim();
  const chordInfo = getChordInfo(cleanInput);
  const description = chordDescriptions[cleanInput];

  const progressionAnalysis = analyzeProgression(progressionInput, analysisKey);
  const currentPracticeItem = progressionAnalysis.items[currentIndex];

  const nextPracticeItem =
    progressionAnalysis.items.length > 0
      ? progressionAnalysis.items[
          (currentIndex + 1) % progressionAnalysis.items.length
        ]
      : undefined;

  const rawCurrentVoicings = currentPracticeItem
    ? getGuitarVoicings(currentPracticeItem.symbol)
    : [];

  const rawNextVoicings = nextPracticeItem
    ? getGuitarVoicings(nextPracticeItem.symbol)
    : [];

  const currentVoicings = filterVoicingsByMode(rawCurrentVoicings, voicingMode);
  const nextVoicings = filterVoicingsByMode(rawNextVoicings, voicingMode);

  const bestVoicingPair = getBestVoicingPair(currentVoicings, nextVoicings);
  const selectedKeyRoot = progressionAnalysis.selectedKeyRoot;
  const currentDroneRoot = currentPracticeItem
    ? getChordRootSymbol(currentPracticeItem.symbol)
    : selectedKeyRoot;
  const currentSoloScale = getMajorScaleNotes(selectedKeyRoot);
  const dailyPracticePreset = practicePresets[getDailyPresetIndex()];
  const filteredPracticePresets =
  selectedPresetCategory === "all"
    ? practicePresets
    : practicePresets.filter((preset) =>
        preset.tags.includes(selectedPresetCategory)
      );
      const lastRandomIsFavorite = lastRandomProgression
  ? isFavoriteProgression(lastRandomProgression, randomKey, randomFlavor)
  : false;

  const safeBpm = Math.min(240, Math.max(30, bpm || 80));
  const safeBeatsPerChord = Math.min(16, Math.max(1, beatsPerChord || 4));
  const beatMs = (60 / safeBpm) * 1000;
  const countInBeats = 4;

  const playMetronomeClick = React.useCallback(
    (accent: boolean) => {
      if (!metronomeEnabled) return;
      if (typeof window === "undefined") return;

      const AudioContextClass =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextClass) return;

      const audioContext =
        audioContextRef.current ?? new AudioContextClass();
      audioContextRef.current = audioContext;

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const now = audioContext.currentTime;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(accent ? 920 : 620, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(accent ? 0.18 : 0.11, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.09);
    },
    [metronomeEnabled]
  );

  const stopRootDrone = React.useCallback(() => {
    const oscillator = droneOscillatorRef.current;
    const gain = droneGainRef.current;

    if (!oscillator || !gain) return;

    try {
      const now = gain.context.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      oscillator.stop(now + 0.22);
    } catch {
      oscillator.disconnect();
    } finally {
      droneOscillatorRef.current = null;
      droneGainRef.current = null;
    }
  }, []);

  const startRootDrone = React.useCallback(
    (rootNote: string) => {
      if (typeof window === "undefined") return;

      const AudioContextClass =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextClass) return;

      const audioContext =
        audioContextRef.current ?? new AudioContextClass();
      audioContextRef.current = audioContext;

      if (audioContext.state === "suspended") {
        void audioContext.resume();
      }

      stopRootDrone();

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const now = audioContext.currentTime;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(getNoteFrequency(rootNote, 2), now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.055, now + 0.24);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now);

      droneOscillatorRef.current = oscillator;
      droneGainRef.current = gain;
    },
    [stopRootDrone]
  );

  function resetBeat() {
    setBeatInChord(1);
  }

  function goNextChord() {
    if (progressionAnalysis.items.length === 0) return;

    setCurrentIndex((prev) => (prev + 1) % progressionAnalysis.items.length);
    resetBeat();
  }

  function goPrevChord() {
    if (progressionAnalysis.items.length === 0) return;

    setCurrentIndex((prev) =>
      prev === 0 ? progressionAnalysis.items.length - 1 : prev - 1
    );
    resetBeat();
  }

  function toggleAutoPlay() {
    if (isAutoPlaying || countInRemaining !== null) {
      setIsAutoPlaying(false);
      setCountInRemaining(null);
      return;
    }

    setPracticeMode(true);

    if (countInEnabled) {
      setCountInRemaining(countInBeats);
      return;
    }

    playMetronomeClick(true);
    setIsAutoPlaying(true);
  }
function resetPracticePlayback() {
  setCurrentIndex(0);
  setBeatInChord(1);
  setIsAutoPlaying(false);
  setCountInRemaining(null);
}

function updateProgressionInput(value: string) {
  setProgressionInput(value);
  resetPracticePlayback();
}

function updateAnalysisKey(value: string) {
  setAnalysisKey(value);
  resetPracticePlayback();
}

function setPracticeModeEnabled(nextPracticeMode: boolean) {
  setPracticeMode(nextPracticeMode);

  if (!nextPracticeMode) {
    setIsAutoPlaying(false);
    setCountInRemaining(null);
    setBeatInChord(1);
  }
}

function applyPracticePreset(preset: PracticePreset) {
  setProgressionInput(preset.progression);
  setAnalysisKey(preset.key);
  setBpm(preset.bpm);
  setBeatsPerChord(preset.beatsPerChord);
  setVoicingMode(preset.voicingMode);
  setCurrentIndex(0);
  setBeatInChord(1);
  setIsAutoPlaying(false);
  setPracticeMode(true);
  setFocusMode(false);
}
function generateRandomProgression() {
  const templates = randomProgressionTemplates[randomFlavor];

  const lengthMatchedTemplates = templates.filter(
    (template) => template.length === randomLength
  );

  const pool =
    lengthMatchedTemplates.length > 0 ? lengthMatchedTemplates : templates;

  const pickedTemplate = getRandomItem(pool);
  const generatedProgression = transposeProgressionFromC(
    pickedTemplate.progression,
    randomKey
  );

  const generatedVoicingMode = getVoicingModeForRandomFlavor(randomFlavor);

  setProgressionInput(generatedProgression);
  setAnalysisKey(randomKey);
  setCurrentIndex(0);
  setBeatInChord(1);
  setIsAutoPlaying(false);
  setPracticeMode(true);
  setFocusMode(false);
  setLastRandomProgression(generatedProgression);
  setRandomLength(pickedTemplate.length);
  setVoicingMode(generatedVoicingMode);
  setFavoriteTitleInput(
  getDefaultFavoriteTitle(randomFlavor, generatedProgression)
);

  const historyItem: GeneratedProgressionHistoryItem = {
    id: `${Date.now()}-${generatedProgression}`,
    progression: generatedProgression,
    key: randomKey,
    flavor: randomFlavor,
    length: pickedTemplate.length,
    voicingMode: generatedVoicingMode,
  };

  setGeneratedHistory((prev) => {
    const withoutDuplicate = prev.filter(
      (item) =>
        !(
          item.progression === historyItem.progression &&
          item.key === historyItem.key &&
          item.flavor === historyItem.flavor
        )
    );

    return [historyItem, ...withoutDuplicate].slice(0, 8);
  });
}
function applyGeneratedHistoryItem(item: GeneratedProgressionHistoryItem) {
  setProgressionInput(item.progression);
  setAnalysisKey(item.key);
  setRandomKey(item.key);
  setRandomFlavor(item.flavor);
  setRandomLength(item.length);
  setVoicingMode(item.voicingMode);
  setLastRandomProgression(item.progression);
  setFavoriteTitleInput(
  getDefaultFavoriteTitle(item.flavor, item.progression)
);

  setCurrentIndex(0);
  setBeatInChord(1);
  setIsAutoPlaying(false);
  setPracticeMode(true);
  setFocusMode(false);
}
function isFavoriteProgression(
  progression: string,
  key: string,
  flavor: RandomFlavor
) {
  const favoriteId = getFavoriteProgressionId(progression, key, flavor);

  return favoriteProgressions.some((item) => item.id === favoriteId);
}
function saveFavoriteProgression(item: {
  title: string;
  progression: string;
  key: string;
  flavor: RandomFlavor;
  length: number;
  voicingMode: VoicingMode;
}) {
  const favoriteId = getFavoriteProgressionId(
    item.progression,
    item.key,
    item.flavor
  );

  const cleanTitle =
    item.title.trim() || getDefaultFavoriteTitle(item.flavor, item.progression);

  setFavoriteProgressions((prev) => {
    const withoutSameFavorite = prev.filter(
      (favorite) => favorite.id !== favoriteId
    );

    const newFavorite: FavoriteProgressionItem = {
      id: favoriteId,
      title: cleanTitle,
      progression: item.progression,
      key: item.key,
      flavor: item.flavor,
      length: item.length,
      voicingMode: item.voicingMode,
      createdAt: Date.now(),
    };

    return [newFavorite, ...withoutSameFavorite];
  });
}

function applyFavoriteProgressionItem(item: FavoriteProgressionItem) {
  setProgressionInput(item.progression);
  setAnalysisKey(item.key);
  setRandomKey(item.key);
  setRandomFlavor(item.flavor);
  setRandomLength(item.length);
  setVoicingMode(item.voicingMode);
  setLastRandomProgression(item.progression);
  setFavoriteTitleInput(getFavoriteDisplayTitle(item));

  setCurrentIndex(0);
  setBeatInChord(1);
  setIsAutoPlaying(false);
  setPracticeMode(true);
  setFocusMode(false);
}

function applyRecentPracticeSession(item: RecentPracticeSession) {
  setProgressionInput(item.progression);
  setAnalysisKey(item.key);
  setBpm(item.bpm);
  setBeatsPerChord(item.beatsPerChord);
  setVoicingMode(item.voicingMode);
  setTrainingMode(item.trainingMode);
  setCurrentIndex(0);
  setBeatInChord(1);
  setIsAutoPlaying(false);
  setCountInRemaining(null);
  setPracticeMode(true);
  setFocusMode(false);
}

function applyDailyPracticePreset() {
  applyPracticePreset(dailyPracticePreset);
  setTrainingMode("chords");
}

function updateTrainingMode(nextTrainingMode: TrainingMode) {
  setTrainingMode(nextTrainingMode);
  setFocusMode(false);
  resetPracticePlayback();
}

function toggleStudySection(sectionId: TheorySectionId) {
  setOpenStudySections((prev) =>
    prev.includes(sectionId)
      ? prev.filter((id) => id !== sectionId)
      : [...prev, sectionId]
  );
}

function removeFavoriteProgression(id: string) {
  setFavoriteProgressions((prev) => prev.filter((item) => item.id !== id));
}

function updateFavoriteProgressionTitle(id: string, title: string) {
  setFavoriteProgressions((prev) =>
    prev.map((item) => (item.id === id ? { ...item, title } : item))
  );
}

function finishEditingFavoriteProgressionTitle(id: string) {
  setFavoriteProgressions((prev) =>
    prev.map((item) =>
      item.id === id && !item.title.trim()
        ? {
            ...item,
            title: getDefaultFavoriteTitle(item.flavor, item.progression),
          }
        : item
    )
  );
}

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedFavorites = window.localStorage.getItem(
          favoriteProgressionsStorageKey
        );

        if (savedFavorites) {
          const parsedFavorites = JSON.parse(savedFavorites);

          if (Array.isArray(parsedFavorites)) {
            setFavoriteProgressions(
              migrateFavoriteProgressions(parsedFavorites)
            );
          }
        }

        const savedSessions = window.localStorage.getItem(
          recentPracticeSessionsStorageKey
        );

        if (savedSessions) {
          const parsedSessions = JSON.parse(savedSessions);
          setRecentPracticeSessions(
            migrateRecentPracticeSessions(parsedSessions)
          );
        }
      } catch {
        setFavoriteProgressions([]);
        setRecentPracticeSessions([]);
      } finally {
        setHasLoadedFavorites(true);
        setHasLoadedPracticeSessions(true);
      }
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

useEffect(() => {
  if (!hasLoadedFavorites) return;

  window.localStorage.setItem(
    favoriteProgressionsStorageKey,
    JSON.stringify(favoriteProgressions)
  );
}, [favoriteProgressions, hasLoadedFavorites]);

useEffect(() => {
  if (!hasLoadedPracticeSessions) return;
  if (!progressionInput.trim()) return;

  const timer = window.setTimeout(() => {
    const session: RecentPracticeSession = {
      id: getRecentPracticeSessionId(
        progressionInput,
        analysisKey,
        trainingMode
      ),
      title:
        trainingMode === "solo"
          ? `솔로 연습 - ${progressionInput}`
          : `코드 연습 - ${progressionInput}`,
      progression: progressionInput,
      key: analysisKey,
      bpm: safeBpm,
      beatsPerChord: safeBeatsPerChord,
      voicingMode,
      trainingMode,
      updatedAt: Date.now(),
    };

    setRecentPracticeSessions((prev) => {
      const nextSessions = [
        session,
        ...prev.filter((item) => item.id !== session.id),
      ].slice(0, 6);

      window.localStorage.setItem(
        recentPracticeSessionsStorageKey,
        JSON.stringify(nextSessions)
      );

      return nextSessions;
    });
  }, 300);

  return () => {
    window.clearTimeout(timer);
  };
}, [
  analysisKey,
  hasLoadedPracticeSessions,
  progressionInput,
  safeBeatsPerChord,
  safeBpm,
  trainingMode,
  voicingMode,
]);

useEffect(() => {
  if (!rootDroneEnabled || !practiceMode || !currentDroneRoot) {
    stopRootDrone();
    return;
  }

  startRootDrone(currentDroneRoot);

  return () => {
    stopRootDrone();
  };
}, [
  currentDroneRoot,
  practiceMode,
  rootDroneEnabled,
  startRootDrone,
  stopRootDrone,
]);

  useEffect(() => {
    if (countInRemaining === null) return;

    playMetronomeClick(countInRemaining === countInBeats);

    const timer = window.setInterval(() => {
      setCountInRemaining((prev) => {
        if (prev === null) return null;

        if (prev <= 1) {
          setBeatInChord(1);
          setIsAutoPlaying(true);
          playMetronomeClick(true);
          return null;
        }

        playMetronomeClick(false);
        return prev - 1;
      });
    }, beatMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [beatMs, countInBeats, countInRemaining, playMetronomeClick]);

  useEffect(() => {
    if (!practiceMode || !isAutoPlaying) return;
    if (countInRemaining !== null) return;
    if (progressionAnalysis.items.length === 0) return;

    const timer = window.setInterval(() => {
      setBeatInChord((prevBeat) => {
        if (prevBeat >= safeBeatsPerChord) {
          playMetronomeClick(true);
          setCurrentIndex((prevIndex) =>
            (prevIndex + 1) % progressionAnalysis.items.length
          );
          return 1;
        }

        playMetronomeClick(false);
        return prevBeat + 1;
      });
    }, beatMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    practiceMode,
    isAutoPlaying,
    beatMs,
    countInRemaining,
    playMetronomeClick,
    safeBeatsPerChord,
    progressionAnalysis.items.length,
  ]);

  useEffect(() => {
  function handleKeyDown(event: KeyboardEvent) {
    if (!practiceMode) return;
    const itemCount = progressionAnalysis.items.length;

    const target = event.target as HTMLElement | null;
    const tagName = target?.tagName?.toLowerCase();

    const isTyping =
      tagName === "input" || tagName === "textarea" || tagName === "select";

    if (isTyping) return;

    if (event.code === "Space" || event.key === "ArrowRight") {
      event.preventDefault();
      if (itemCount > 0) {
        setCurrentIndex((prev) => (prev + 1) % itemCount);
        setBeatInChord(1);
      }
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (itemCount > 0) {
        setCurrentIndex((prev) => (prev === 0 ? itemCount - 1 : prev - 1));
        setBeatInChord(1);
      }
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (isAutoPlaying || countInRemaining !== null) {
        setIsAutoPlaying(false);
        setCountInRemaining(null);
        return;
      }

      if (countInEnabled) {
        setCountInRemaining(countInBeats);
      } else {
        playMetronomeClick(true);
        setIsAutoPlaying(true);
      }

      return;
    }

    if (event.key.toLowerCase() === "f") {
      event.preventDefault();
      setFocusMode((prev) => !prev);
      return;
    }

    if (event.key.toLowerCase() === "m") {
      event.preventDefault();
      setVoicingMode((prev) => {
        const currentModeIndex = voicingModeOrder.indexOf(prev);
        const nextModeIndex = (currentModeIndex + 1) % voicingModeOrder.length;

        return voicingModeOrder[nextModeIndex];
      });
      return;
    }

    if (event.key.toLowerCase() === "r") {
      event.preventDefault();
      setCurrentIndex(0);
      setBeatInChord(1);
      return;
    }

    if (["1", "2", "3", "4", "5", "6"].includes(event.key)) {
      event.preventDefault();

      const modeIndex = Number(event.key) - 1;
      const selectedMode = voicingModeOrder[modeIndex];

      if (selectedMode) {
        setVoicingMode(selectedMode);
      }

      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setPracticeMode(false);
      setIsAutoPlaying(false);
      setCountInRemaining(null);
      return;
    }
  }

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [
  countInBeats,
  countInEnabled,
  countInRemaining,
  isAutoPlaying,
  playMetronomeClick,
  practiceMode,
  progressionAnalysis.items.length,
]);

  return (
    <main className="min-h-screen bg-[#02040A] text-[#E5E7EB]">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(145deg,_#02040A,_#030712_46%,_#081426)]" />

      <section className="mx-auto max-w-6xl space-y-5 px-4 py-5 md:px-6">
        <header className="border-b border-blue-900/30 pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#64748B]">
                Deep Blue Studio
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">
                코드밥상
              </h1>
              <p className="mt-1 max-w-xl text-sm text-[#94A3B8]">
                기타 연습, 화성학 분석, 진행 생성을 분리한 다크 뮤직 워크스테이션.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 md:items-end">
              <div className="rounded-lg border border-blue-900/30 bg-[#050B16] px-4 py-3">
                <p className="text-xs font-bold uppercase text-[#64748B]">
                  Current
                </p>
                <p className="mt-1 text-xl font-black text-[#E5E7EB]">
                  {practiceMode ? "Practice Console" : "Theory Lab"}
                </p>
              </div>
              <ViewModeTabs viewMode={viewMode} onChange={setViewMode} />
            </div>
          </div>
        </header>

        <Panel>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionTitle
              eyebrow="Practice Console"
              title="연습 콘솔"
              description="기타 들고 보는 최소 정보 중심 화면. 긴 화성학 설명은 아래 Theory Lab에서 확인."
            />

            <button
              onClick={() => setPracticeModeEnabled(!practiceMode)}
              className="rounded-lg border border-blue-900/30 bg-[#1E40AF] px-5 py-3 text-sm font-black text-white shadow-lg shadow-black/20 transition hover:bg-[#2563EB]"
            >
              {practiceMode ? "연습모드 끄기" : "연습모드 켜기"}
            </button>
          </div>

          <div className="mt-4 inline-grid rounded-lg border border-blue-900/30 bg-black/25 p-1 sm:grid-cols-2">
            <button
              onClick={() => updateTrainingMode("chords")}
              className={`rounded-md px-4 py-2 text-sm font-black transition ${
                trainingMode === "chords"
                  ? "bg-[#1E40AF] text-white"
                  : "text-slate-400 hover:text-[#CBD5E1]"
              }`}
            >
              코드 진행
            </button>
            <button
              onClick={() => updateTrainingMode("solo")}
              className={`rounded-md px-4 py-2 text-sm font-black transition ${
                trainingMode === "solo"
                  ? "bg-[#1E40AF] text-white"
                  : "text-slate-400 hover:text-[#CBD5E1]"
              }`}
            >
              즉흥 솔로
            </button>
          </div>

          {practiceMode && currentPracticeItem && (
            <PracticePanel
              currentPracticeItem={currentPracticeItem}
              nextPracticeItem={nextPracticeItem}
              trainingMode={trainingMode}
              viewMode={viewMode}
              currentIndex={currentIndex}
              totalCount={progressionAnalysis.items.length}
              selectedKey={progressionAnalysis.selectedKey}
              selectedKeyRoot={selectedKeyRoot}
              soloScaleNotes={currentSoloScale}
              beatInChord={beatInChord}
              safeBpm={safeBpm}
              safeBeatsPerChord={safeBeatsPerChord}
              isAutoPlaying={isAutoPlaying}
              metronomeEnabled={metronomeEnabled}
              rootDroneEnabled={rootDroneEnabled}
              countInEnabled={countInEnabled}
              countInRemaining={countInRemaining}
              currentVoicings={currentVoicings}
              nextVoicings={nextVoicings}
              voicingModeLabel={voicingModeLabels[voicingMode]}
              bestVoicingPair={bestVoicingPair}
              focusMode={focusMode}
              onToggleFocusMode={() => setFocusMode((prev) => !prev)}
              onPrev={goPrevChord}
              onNext={goNextChord}
              onTogglePlay={toggleAutoPlay}
              onClose={() => setPracticeModeEnabled(false)}
            />
          )}

          <div className="mt-4 grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-lg border border-blue-900/30 bg-black/20 p-4">
              <p className="text-xs font-black uppercase text-[#64748B]">
                Daily Loop
              </p>
              <h3 className="mt-1 text-lg font-black text-white">
                오늘의 추천 루프
              </h3>
              <p className="mt-1 text-sm font-bold text-slate-300">
                {dailyPracticePreset.title}
              </p>
              <p className="mt-2 font-mono text-sm font-black text-[#CBD5E1]/90">
                {dailyPracticePreset.progression}
              </p>
              <button
                onClick={applyDailyPracticePreset}
                className="mt-3 rounded-lg bg-[#1E40AF] px-4 py-2 text-sm font-black text-white transition hover:bg-[#2563EB]"
              >
                오늘 루프 연습
              </button>
            </section>

            <section className="rounded-lg border border-blue-900/30 bg-black/20 p-4">
              <p className="text-xs font-black uppercase text-[#64748B]">
                Resume
              </p>
              <h3 className="mt-1 text-lg font-black text-white">
                최근 연습 이어하기
              </h3>
              {recentPracticeSessions.length > 0 ? (
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {recentPracticeSessions.slice(0, 4).map((session) => (
                    <button
                      key={session.id}
                      onClick={() => applyRecentPracticeSession(session)}
                      className="rounded-lg border border-blue-900/30 bg-[#07111F] p-3 text-left transition hover:border-blue-900/40"
                    >
                      <p className="text-sm font-black text-slate-100">
                        {session.trainingMode === "solo" ? "솔로" : "코드"} /{" "}
                        {session.key === "auto" ? "자동" : `${session.key} major`}
                      </p>
                      <p className="mt-1 truncate font-mono text-xs font-bold text-slate-400">
                        {session.progression}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  연습을 시작하면 자동으로 여기에 남음.
                </p>
              )}
            </section>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <label className="block text-sm font-bold text-slate-400">
                코드 진행 입력
              </label>
              <input
                value={progressionInput}
                onChange={(e) => updateProgressionInput(e.target.value)}
                placeholder="A - F#m - D - E"
                className="mt-2 w-full rounded-lg border border-blue-900/30 bg-[#050B16] px-4 py-4 text-xl font-bold outline-none transition focus:border-[#64748B]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-400">
                분석 기준 조성
              </label>
              <select
                value={analysisKey}
                onChange={(e) => updateAnalysisKey(e.target.value)}
                className="mt-2 w-full rounded-lg border border-blue-900/30 bg-[#050B16] px-4 py-4 text-xl font-bold outline-none transition focus:border-[#64748B]"
              >
                <option value="auto">자동 추정</option>
                {majorKeys.map((key) => (
                  <option key={key} value={key}>
                    {key} major
                  </option>
                ))}
              </select>
            </div>
          </div>

          <section className="mt-4 grid gap-3 md:grid-cols-4">
            <NumberInput
              label="BPM"
              value={bpm}
              min={30}
              max={240}
              onChange={setBpm}
            />

            <NumberInput
              label="코드당 박자"
              value={beatsPerChord}
              min={1}
              max={16}
              onChange={setBeatsPerChord}
            />

            <div>
              <label className="block text-sm font-bold text-slate-400">
                보이싱 모드
              </label>
              <select
                value={voicingMode}
                onChange={(e) => setVoicingMode(e.target.value as VoicingMode)}
                className="mt-2 w-full rounded-lg border border-blue-900/30 bg-[#050B16] px-4 py-3 text-lg font-black outline-none transition focus:border-[#64748B]"
              >
                <option value="all">전체</option>
                <option value="easy">쉬운 보이싱</option>
                <option value="open">오픈코드</option>
                <option value="barre">바레코드</option>
                <option value="upper">상단현/커팅</option>
                <option value="neo">네오소울/색채</option>
              </select>
            </div>

            <button
              onClick={toggleAutoPlay}
              className="mt-7 rounded-lg bg-[#1E40AF] px-4 py-3 text-base font-black text-white shadow-lg shadow-black/20 transition hover:bg-[#2563EB] md:mt-7"
            >
              {isAutoPlaying || countInRemaining !== null
                ? "일시정지"
                : "자동재생 시작"}
            </button>
          </section>

          <div className="mt-3 flex flex-wrap gap-2">
            <TogglePill
              active={metronomeEnabled}
              label="메트로놈"
              onClick={() => setMetronomeEnabled((prev) => !prev)}
            />
            <TogglePill
              active={rootDroneEnabled}
              label="루트 드론"
              onClick={() => setRootDroneEnabled((prev) => !prev)}
            />
            <TogglePill
              active={countInEnabled}
              label="4박 카운트인"
              onClick={() => setCountInEnabled((prev) => !prev)}
            />
          </div>
        </Panel>

        <Panel>
          <SectionTitle
            eyebrow="Idea Generator"
            title="진행 생성과 저장"
            description="랜덤 진행, Practice Brief, 최근 기록, 즐겨찾기, 프리셋을 한 곳에서 관리."
          />

          <section className="mt-5 rounded-lg border border-blue-900/30 bg-black/20 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#64748B]">
                  Random Progression Generator
                </p>
                <h3 className="mt-1 text-2xl font-black">랜덤 진행 생성기</h3>
                <p className="mt-1 text-slate-400">
                  조성, 타입, 길이를 고르면 연습용 코드 진행을 바로 생성.
                </p>
              </div>

              <p className="text-sm font-bold text-slate-500">
                생성하면 바로 연습모드 ON
              </p>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <div>
                <label className="block text-sm font-bold text-slate-400">
                  Key
                </label>
                <select
                  value={randomKey}
                  onChange={(e) => setRandomKey(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-blue-900/30 bg-[#050B16] px-4 py-3 text-lg font-black outline-none transition focus:border-[#64748B]"
                >
                  {majorKeys.map((key) => (
                    <option key={key} value={key}>
                      {key} major
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400">
                  타입
                </label>
                <select
                  value={randomFlavor}
                  onChange={(e) =>
                    setRandomFlavor(e.target.value as RandomFlavor)
                  }
                  className="mt-2 w-full rounded-lg border border-blue-900/30 bg-[#050B16] px-4 py-3 text-lg font-black outline-none transition focus:border-[#64748B]"
                >
                  {Object.entries(randomFlavorLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400">
                  코드 개수
                </label>
                <select
                  value={randomLength}
                  onChange={(e) => setRandomLength(Number(e.target.value))}
                  className="mt-2 w-full rounded-lg border border-blue-900/30 bg-[#050B16] px-4 py-3 text-lg font-black outline-none transition focus:border-[#64748B]"
                >
                  <option value={3}>3개</option>
                  <option value={4}>4개</option>
                  <option value={5}>5개</option>
                  <option value={6}>6개</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={generateRandomProgression}
                  className="w-full rounded-lg bg-[#1E40AF] px-4 py-3 text-lg font-black text-white shadow-lg shadow-black/20 transition hover:bg-[#2563EB]"
                >
                  랜덤 생성
                </button>
              </div>
            </div>

                        {lastRandomProgression && (
              <div className="mt-4">
                <div className="rounded-lg border border-blue-900/30 bg-[#0A1220] p-4">
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-[#64748B]">
                    Last Generated
                  </p>
                  <p className="mt-2 font-mono text-xl font-black text-white">
                    {lastRandomProgression}
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-400">
                    {randomKey} major / {randomFlavorLabels[randomFlavor]} /{" "}
                    {randomLength}코드
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
  <span className="rounded-full bg-[#1D4ED8] px-3 py-1 text-xs font-black text-slate-950">
    {voicingModeLabels[voicingMode]}
  </span>
  <span className="rounded-full border border-blue-900/30 px-3 py-1 text-xs font-bold text-slate-300">
    연습모드 ON
  </span>

  <div className="basis-full">
    <label className="block text-sm font-bold text-slate-400">
      저장 이름
    </label>
    <input
      value={favoriteTitleInput}
      onChange={(e) => setFavoriteTitleInput(e.target.value)}
      placeholder="예: 아련한 IV-iv 루프"
      className="mt-2 w-full rounded-lg border border-blue-900/30 bg-[#050B16] px-4 py-3 text-base font-bold outline-none transition focus:border-[#1D4ED8]"
    />
  </div>

  <button
    onClick={() =>
      saveFavoriteProgression({
  title: favoriteTitleInput,
  progression: lastRandomProgression,
  key: randomKey,
  flavor: randomFlavor,
  length: randomLength,
  voicingMode,
})
    }
    className={`rounded-lg px-3 py-2 text-xs font-black transition ${
      lastRandomIsFavorite
        ? "bg-[#1D4ED8] text-slate-950"
        : "border border-blue-900/40 text-[#CBD5E1] hover:bg-[#2563EB] hover:text-white"
    }`}
  >
    {lastRandomIsFavorite ? "즐겨찾기 저장됨" : "즐겨찾기 저장"}
  </button>
</div>
                </div>
              </div>
            )}
            {lastRandomProgression && (
              <section className="mt-4 rounded-lg border border-blue-900/30 bg-[#0A1220] p-4">
                <p className="text-xs font-black uppercase text-[#64748B]">
                  Practice Brief
                </p>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <BriefItem
                    title="핵심"
                    value={randomFlavorBriefs[randomFlavor].focus}
                  />
                  <BriefItem
                    title="긴장/해결"
                    value={randomFlavorBriefs[randomFlavor].tension}
                  />
                  <BriefItem
                    title="기타 팁"
                    value={randomFlavorBriefs[randomFlavor].guitarTip}
                  />
                  <BriefItem
                    title="듣는 포인트"
                    value={randomFlavorBriefs[randomFlavor].listeningPoint}
                  />
                </div>
              </section>
            )}
                        {generatedHistory.length > 0 && (
              <div className="mt-4 rounded-2xl border border-blue-900/30 bg-[#0B1730] p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.22em] text-[#64748B]">
                      Recent Generated
                    </p>
                    <h4 className="mt-1 text-xl font-black text-white">
                      최근 생성 기록
                    </h4>
                  </div>

                  <button
                    onClick={() => setGeneratedHistory([])}
                    className="rounded-full border border-blue-900/30 px-4 py-2 text-sm font-black text-slate-300 transition hover:border-blue-700 hover:text-[#CBD5E1]"
                  >
                    기록 비우기
                  </button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {generatedHistory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => applyGeneratedHistoryItem(item)}
                      className="rounded-2xl border border-blue-900/30 bg-[#050B16] p-4 text-left transition hover:border-blue-700 hover:bg-[#1D4ED8]/10"
                    >
                      <p className="font-mono text-lg font-black text-[#CBD5E1]">
                        {item.progression}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#1D4ED8] px-2 py-1 text-xs font-black text-slate-950">
                          {item.key} major
                        </span>

                        <span className="rounded-full border border-blue-900/30 px-2 py-1 text-xs font-bold text-slate-300">
                          {randomFlavorLabels[item.flavor]}
                        </span>

                        <span className="rounded-full border border-blue-900/30 px-2 py-1 text-xs font-bold text-slate-300">
                          {item.length}코드
                        </span>

                        <span className="rounded-full border border-blue-900/30 px-2 py-1 text-xs font-bold text-slate-300">
                          {voicingModeLabels[item.voicingMode]}
                        </span>
                      </div>

                      <p className="mt-3 text-sm font-bold text-slate-500">
                        클릭하면 이 진행으로 바로 연습모드 ON
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
                        {favoriteProgressions.length > 0 && (
              <div className="mt-4 rounded-2xl border border-blue-900/30 bg-[#1D4ED8]/10 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.22em] text-[#64748B]">
                      Favorites
                    </p>
                    <h4 className="mt-1 text-xl font-black text-white">
                      즐겨찾기 진행
                    </h4>
                  </div>

                  <p className="text-sm font-bold text-slate-400">
                    새로고침해도 유지됨 / {favoriteProgressions.length}개
                  </p>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {favoriteProgressions.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-blue-900/30 bg-[#050B16] p-4"
                    >
                      <div>
  <p className="text-lg font-black text-white">
    {getFavoriteDisplayTitle(item)}
  </p>
  <p className="mt-1 font-mono text-sm font-black text-[#CBD5E1]">
    {item.progression}
  </p>
</div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#1D4ED8] px-2 py-1 text-xs font-black text-slate-950">
                          {item.key} major
                        </span>

                        <span className="rounded-full border border-blue-900/30 px-2 py-1 text-xs font-bold text-slate-300">
                          {randomFlavorLabels[item.flavor]}
                        </span>

                        <span className="rounded-full border border-blue-900/30 px-2 py-1 text-xs font-bold text-slate-300">
                          {item.length}코드
                        </span>

                        <span className="rounded-full border border-blue-900/30 px-2 py-1 text-xs font-bold text-slate-300">
                          {voicingModeLabels[item.voicingMode]}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3">
  <div>
    <label className="block text-sm font-bold text-slate-400">
      즐겨찾기 이름
    </label>
    <input
      value={item.title}
      onChange={(e) => updateFavoriteProgressionTitle(item.id, e.target.value)}
      onBlur={() => finishEditingFavoriteProgressionTitle(item.id)}
      placeholder="예: 아련한 IV-iv 루프"
      className="mt-2 w-full rounded-2xl border border-blue-900/30 bg-[#050B16] px-4 py-3 text-base font-bold outline-none transition focus:border-[#1D4ED8]"
    />
  </div>

  <div className="flex flex-wrap gap-2">
    <button
      onClick={() => applyFavoriteProgressionItem(item)}
      className="rounded-full bg-[#1D4ED8] px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-[#2563EB]"
    >
      연습하기
    </button>

    <button
      onClick={() => removeFavoriteProgression(item.id)}
      className="rounded-full border border-red-300/40 px-4 py-2 text-sm font-black text-red-200 transition hover:bg-red-300 hover:text-slate-950"
    >
      삭제
    </button>
  </div>
</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </section>
          <section className="mt-5 rounded-3xl border border-blue-900/30 bg-[#0A1220] p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#64748B]">
                  
                  Practice Presets
                </p>
                <h3 className="mt-1 text-2xl font-black">연습 프리셋</h3>
                <p className="mt-1 text-slate-400">
                  버튼 하나로 진행, 조성, BPM, 보이싱 모드를 한 번에 세팅.
                </p>
              </div>

              <p className="text-sm font-bold text-slate-500">
  {getPresetCategoryLabel(selectedPresetCategory)} /{" "}
  {filteredPracticePresets.length}개
</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {presetCategories.map((category) => {
                const isActive = selectedPresetCategory === category;

                return (
                  <button
                    key={category}
                    onClick={() => setSelectedPresetCategory(category)}
                    className={`rounded-full px-4 py-2 text-sm font-black transition ${
                      isActive
                        ? "bg-[#1D4ED8] text-slate-950 shadow-lg shadow-black/30"
                        : "border border-blue-900/30 bg-[#0B1730] text-slate-300 hover:border-blue-700 hover:text-[#CBD5E1]"
                    }`}
                  >
                    {getPresetCategoryLabel(category)}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {filteredPracticePresets.map((preset) => (
                
                <button
                  key={preset.id}
                  onClick={() => applyPracticePreset(preset)}
                  className="group rounded-2xl border border-blue-900/30 bg-[#0B1730] p-4 text-left transition hover:border-blue-700 hover:bg-[#1E40AF]/10 hover:shadow-lg hover:shadow-black/30"
                >
                  <p className="text-lg font-black text-[#CBD5E1] group-hover:text-[#CBD5E1]">
                    {preset.title}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-400">
                    {preset.subtitle}
                  </p>

                  <p className="mt-3 font-mono text-sm font-black text-slate-200">
                    {preset.progression}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#1D4ED8] px-2 py-1 text-xs font-black text-slate-950">
                      {preset.key} major
                    </span>
                    <span className="rounded-full border border-blue-900/30 px-2 py-1 text-xs font-bold text-slate-300">
                      {preset.bpm} BPM
                    </span>
                    <span className="rounded-full border border-blue-900/30 px-2 py-1 text-xs font-bold text-slate-300">
                      {voicingModeLabels[preset.voicingMode]}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {preset.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-950 px-2 py-1 text-xs font-bold text-slate-500"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </Panel>

        <Panel>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionTitle
              eyebrow="Theory Lab"
              title="진행 분석과 화성학"
              description="로마숫자, 기능, 구성음, 차용화음과 세컨더리 도미넌트 해석을 표시 모드에 맞춰 확인."
            />
            <ViewModeTabs viewMode={viewMode} onChange={setViewMode} />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Info title="추정/선택 조성" value={progressionAnalysis.selectedKey} />
            <Info title="코드 진행" value={progressionAnalysis.chordLine || "-"} />
            <Info title="로마숫자" value={progressionAnalysis.romanLine || "-"} />
          </div>

          {viewMode === "study" ? (
            <TheoryAccordion
              progressionAnalysis={progressionAnalysis}
              currentSoloScale={currentSoloScale}
              currentPracticeItem={currentPracticeItem}
              nextPracticeItem={nextPracticeItem}
              bestVoicingPair={bestVoicingPair}
              openSections={openStudySections}
              onToggle={toggleStudySection}
            />
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {progressionAnalysis.items.map((item) => (
                <article
                  key={`${item.index}-${item.symbol}`}
                  className="rounded-lg border border-blue-900/30 bg-[#0A1220] p-4 transition hover:border-blue-700/60"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-2xl font-black text-[#E5E7EB]">
                      {item.symbol}
                    </h3>
                    <Badge>{item.roman}</Badge>
                  </div>

                  <p className="mt-2 text-sm font-bold text-[#94A3B8]">
                    {item.functionName}
                  </p>

                  {viewMode === "normal" && (
                    <p className="mt-3 leading-6 text-[#CBD5E1]">
                      {item.explanation}
                    </p>
                  )}

                  {viewMode === "normal" && item.notes.length > 0 && (
                    <p className="mt-3 text-sm text-slate-500">
                      구성음: {item.notes.join(", ")}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}

        </Panel>

        <Panel>
          <SectionTitle
            eyebrow="Chord Lookup"
            title="코드 단일 분석"
            description="코드 하나의 구성음, 도수, 조성별 역할, 관련 스케일을 아래에서 확인."
          />

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="A, Am, A7, Amaj7, F#m7b5..."
            className="mt-5 w-full rounded-lg border border-blue-900/30 bg-[#050B16] px-4 py-4 text-xl font-bold outline-none transition focus:border-[#1D4ED8]"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {["A", "Am", "A7", "Amaj7", "C", "Cmaj7", "G7", "F#m7b5"].map(
              (chord) => (
                <button
                  key={chord}
                  onClick={() => setInput(chord)}
                  className="rounded-lg border border-blue-900/30 bg-[#0A1220] px-3 py-2 text-sm font-bold text-slate-300 transition hover:border-blue-700 hover:text-[#CBD5E1]"
                >
                  {chord}
                </button>
              )
            )}
          </div>
        </Panel>

        {!chordInfo ? (
          <section className="rounded-3xl border border-red-400/30 bg-red-950/40 p-5">
            <h2 className="text-xl font-black text-red-200">해석 실패</h2>
            <p className="mt-2 text-red-200">
              이 코드는 아직 해석을 못 함. 표기법을 다시 확인해봐.
            </p>
          </section>
        ) : (
          <section className="grid gap-5">
            <Panel>
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">
                    Current Chord
                  </p>
                  <h2 className="text-4xl font-black text-[#CBD5E1]">
                    {cleanInput}
                  </h2>
                  <p className="text-slate-400">{chordInfo.name}</p>
                </div>

                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="rounded-full border border-blue-900/40 px-4 py-2 text-sm font-bold text-[#CBD5E1] transition hover:bg-[#2563EB] hover:text-slate-950"
                >
                  {showAdvanced ? "심화 설명 끄기" : "심화 설명 켜기"}
                </button>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <Info title="구성음" value={chordInfo.notes.join(", ")} />
                <Info title="도수" value={chordInfo.intervals.join(", ")} />
                <Info title="루트" value={chordInfo.tonic ?? "-"} />
                <Info title="타입" value={chordInfo.type || "-"} />
              </div>
            </Panel>

            <Panel>
              <SectionTitle
                eyebrow="Key Roles"
                title="조성별 역할"
                description="이 코드가 장조 안에서 어떤 도수와 기능으로 쓰일 수 있는지 보여줌."
              />

              {chordInfo.keyRoles.length > 0 ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {chordInfo.keyRoles.map((role) => (
                    <article
                      key={`${role.key}-${role.roman}`}
                      className="rounded-2xl border border-blue-900/30 bg-[#0A1220] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-black text-[#CBD5E1]">
                          {role.key}
                        </h3>
                        <Badge>{role.roman}</Badge>
                      </div>

                      <p className="mt-2 text-sm font-bold text-[#64748B]">
                        {role.functionName}
                      </p>

                      <p className="mt-3 leading-6 text-slate-300">
                        {role.explanation}
                      </p>

                      <p className="mt-3 text-sm text-slate-500">
                        음계: {role.scaleNotes.join(", ")}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-slate-400">
                  아직 이 코드의 조성별 역할을 자동 분석하지 못함.
                </p>
              )}
            </Panel>

            <section className="grid gap-5 md:grid-cols-2">
              <Panel>
                <SectionTitle
                  eyebrow="Description"
                  title="코드 설명"
                  description="기초 설명과 심화 설명을 나눠서 확인."
                />

                {description ? (
                  <div className="mt-4 space-y-5">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.18em] text-[#64748B]">
                        Basic
                      </p>
                      <p className="mt-1 leading-7">{description.basic}</p>
                    </div>

                    {showAdvanced && (
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#64748B]">
                          Advanced
                        </p>
                        <p className="mt-1 leading-7 text-slate-300">
                          {description.advanced}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.18em] text-[#64748B]">
                        Mood Tags
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {description.mood.map((mood) => (
                          <span
                            key={mood}
                            className="rounded-full border border-blue-900/30 bg-slate-950 px-3 py-1 text-sm font-bold"
                          >
                            {mood}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 leading-7 text-slate-400">
                    계산은 됐지만, 아직 직접 작성한 설명 데이터는 없음.
                    <br />
                    이 코드를 코드밥상 데이터에 추가하면 더 풍성하게 보여줄 수 있음.
                  </p>
                )}
              </Panel>

              <Panel>
                <SectionTitle
                  eyebrow="Progression Examples"
                  title="진행 예시"
                  description="이 코드가 들어간 기본 진행."
                />

                {description?.commonProgressions ? (
                  <div className="mt-4 space-y-3">
                    {description.commonProgressions.map((progression) => (
                      <div
                        key={progression}
                        className="rounded-2xl border border-blue-900/30 bg-[#0A1220] p-4"
                      >
                        <p className="text-lg font-black text-[#CBD5E1]">
                          {progression}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-slate-400">
                    아직 등록된 진행 예시가 없음.
                  </p>
                )}
              </Panel>
            </section>

            <Panel>
              <SectionTitle
                eyebrow="Related Scales"
                title="관련 스케일"
                description="현재 루트 기준으로 연주에 바로 참고할 수 있는 스케일."
              />

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {chordInfo.relatedScales.map((scale) => (
                  <article
                    key={scale.name}
                    className="rounded-2xl border border-blue-900/30 bg-[#0A1220] p-4"
                  >
                    <h3 className="text-lg font-black text-[#CBD5E1]">
                      {scale.name}
                    </h3>
                    <p className="mt-1 text-slate-300">
                      {scale.notes.join(", ")}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {scale.description}
                    </p>
                  </article>
                ))}
              </div>
            </Panel>
          </section>
        )}
      </section>
    </main>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-blue-900/30 bg-[#07111F]/95 p-5 shadow-xl shadow-black/25 backdrop-blur">
      {children}
    </section>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase text-[#64748B]">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-2xl font-black tracking-tight text-[#E5E7EB]">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#94A3B8]">
        {description}
      </p>
    </div>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-blue-900/30 bg-[#0A1220] p-4">
      <p className="text-sm font-bold text-[#64748B]">{title}</p>
      <p className="mt-1 break-words text-lg font-black text-[#E5E7EB]">
        {value || "-"}
      </p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg border border-blue-900/30 bg-[#0B1730] px-3 py-1 text-sm font-black text-[#CBD5E1]">
      {children}
    </span>
  );
}

function ViewModeTabs({
  viewMode,
  onChange,
}: {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="inline-grid rounded-lg border border-blue-900/30 bg-[#02040A] p-1 sm:grid-cols-3">
      {(Object.keys(viewModeLabels) as ViewMode[]).map((mode) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={`rounded-md px-3 py-2 text-xs font-black transition ${
            viewMode === mode
              ? "bg-[#1D4ED8] text-white"
              : "text-[#64748B] hover:text-[#E5E7EB]"
          }`}
        >
          {viewModeLabels[mode]}
        </button>
      ))}
    </div>
  );
}

function TheoryAccordion({
  progressionAnalysis,
  currentSoloScale,
  currentPracticeItem,
  nextPracticeItem,
  bestVoicingPair,
  openSections,
  onToggle,
}: {
  progressionAnalysis: ProgressionAnalysis;
  currentSoloScale: string[];
  currentPracticeItem: PracticeItem | undefined;
  nextPracticeItem: PracticeItem | undefined;
  bestVoicingPair: VoicingPair | null;
  openSections: TheorySectionId[];
  onToggle: (sectionId: TheorySectionId) => void;
}) {
  const borrowedItems = progressionAnalysis.items.filter(
    (item) => item.status === "borrowed"
  );
  const secondaryItems = progressionAnalysis.items.filter(
    (item) => item.status === "secondaryDominant"
  );
  const chordTheoryProfile = currentPracticeItem
    ? getChordTheoryProfile(currentPracticeItem.symbol)
    : null;
  const recommendedScales = currentPracticeItem
    ? getRecommendedScaleProfilesForChord(currentPracticeItem.symbol)
    : [];
  const rhythmPrompt = soloRhythmPrompts[
    (currentPracticeItem?.index ?? 0) % soloRhythmPrompts.length
  ];
  const constraintPrompt = soloConstraintPrompts[
    (currentPracticeItem?.index ?? 0) % soloConstraintPrompts.length
  ];
  const soloRecommendation = getSoloTargetRecommendation(
    currentPracticeItem,
    nextPracticeItem,
    rhythmPrompt,
    constraintPrompt
  );
  const sections: {
    id: TheorySectionId;
    title: string;
    summary: string;
    content: React.ReactNode;
  }[] = [
    {
      id: "summary",
      title: "진행 한 줄 요약",
      summary: progressionAnalysis.chordLine || "-",
      content: (
        <div className="grid gap-3 md:grid-cols-3">
          <Info title="조성" value={progressionAnalysis.selectedKey} />
          <Info title="진행" value={progressionAnalysis.chordLine || "-"} />
          <Info title="로마숫자" value={progressionAnalysis.romanLine || "-"} />
        </div>
      ),
    },
    {
      id: "roman",
      title: "로마숫자 분석",
      summary: progressionAnalysis.romanLine || "-",
      content: (
        <div className="grid gap-2 md:grid-cols-2">
          {progressionAnalysis.items.map((item) => (
            <TheoryMiniRow
              key={`roman-${item.index}-${item.symbol}`}
              title={`${item.symbol} / ${item.roman}`}
              value={item.explanation}
            />
          ))}
        </div>
      ),
    },
    {
      id: "function",
      title: "기능 분석",
      summary: "토닉, 서브도미넌트, 도미넌트 흐름",
      content: (
        <div className="grid gap-2 md:grid-cols-2">
          {progressionAnalysis.items.map((item) => (
            <TheoryMiniRow
              key={`function-${item.index}-${item.symbol}`}
              title={`${item.symbol} / ${item.functionName}`}
              value={item.functionDescription}
            />
          ))}
        </div>
      ),
    },
    {
      id: "borrowed",
      title: "차용화음 / 모달 인터체인지",
      summary:
        borrowedItems.length > 0
          ? `${borrowedItems.length}개 감지`
          : "감지된 차용화음 없음",
      content:
        borrowedItems.length > 0 ? (
          <div className="grid gap-2">
            {borrowedItems.map((item) => (
              <TheoryMiniRow
                key={`borrowed-${item.index}-${item.symbol}`}
                title={`${item.symbol} / ${item.roman}`}
                value={item.explanation}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-[#94A3B8]">
            현재 진행에서는 차용화음으로 분류된 코드가 없습니다.
          </p>
        ),
    },
    {
      id: "secondary",
      title: "세컨더리 도미넌트",
      summary:
        secondaryItems.length > 0
          ? `${secondaryItems.length}개 감지`
          : "감지된 세컨더리 도미넌트 없음",
      content:
        secondaryItems.length > 0 ? (
          <div className="grid gap-2">
            {secondaryItems.map((item) => (
              <TheoryMiniRow
                key={`secondary-${item.index}-${item.symbol}`}
                title={`${item.symbol} / ${item.roman}`}
                value={item.explanation}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-[#94A3B8]">
            현재 진행에서는 세컨더리 도미넌트로 분류된 코드가 없습니다.
          </p>
        ),
    },
    {
      id: "chordTheory",
      title: "코드 타입 / 핵심음",
      summary: chordTheoryProfile
        ? `${currentPracticeItem?.symbol ?? "-"} / ${chordTheoryProfile.koreanName}`
        : "현재 코드 타입 정보 없음",
      content: chordTheoryProfile ? (
        <div className="grid gap-3 md:grid-cols-2">
          <TheoryMiniRow
            title="코드 타입"
            value={`${chordTheoryProfile.koreanName} (${chordTheoryProfile.quality})`}
          />
          <TheoryMiniRow
            title="구성 간격"
            value={chordTheoryProfile.intervals.join(", ")}
          />
          <TheoryMiniRow title="무드" value={chordTheoryProfile.mood} />
          <TheoryMiniRow title="사용처" value={chordTheoryProfile.usage} />
          {chordTheoryProfile.guideToneRule && (
            <TheoryMiniRow
              title="핵심음 규칙"
              value={chordTheoryProfile.guideToneRule}
            />
          )}
          {chordTheoryProfile.commonProgressionUse && (
            <TheoryMiniRow
              title="진행 안에서"
              value={chordTheoryProfile.commonProgressionUse}
            />
          )}
        </div>
      ) : (
        <p className="text-sm leading-6 text-[#94A3B8]">
          현재 코드에 매칭되는 코드 타입 설명이 아직 없습니다.
        </p>
      ),
    },
    {
      id: "scales",
      title: "관련 스케일",
      summary:
        recommendedScales.length > 0
          ? recommendedScales.map((scale) => scale.name).join(", ")
          : `${progressionAnalysis.selectedKeyRoot} major`,
      content: (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {currentSoloScale.map((note) => (
              <span
                key={`scale-${note}`}
                className="rounded-md border border-blue-900/30 bg-[#0B1730] px-3 py-2 text-sm font-black text-[#CBD5E1]"
              >
                {note}
              </span>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {recommendedScales.map((scale) => (
              <TheoryMiniRow
                key={scale.name}
                title={`${currentPracticeItem?.notes[0] ?? progressionAnalysis.selectedKeyRoot} ${scale.name}`}
                value={`${scale.koreanName}: ${scale.usage} 타겟 ${scale.targetNotes?.join(", ") ?? "-"}`}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "voicing",
      title: "보이싱 연결 해설",
      summary: bestVoicingPair
        ? getMovementLabel(bestVoicingPair.distance)
        : "추천 연결 없음",
      content: bestVoicingPair ? (
        <div className="grid gap-3 md:grid-cols-2">
          <TheoryMiniRow
            title={bestVoicingPair.currentVoicing.name}
            value={`루트: ${getRootHint(
              currentPracticeItem?.symbol ?? "",
              bestVoicingPair.currentVoicing
            )}`}
          />
          <TheoryMiniRow
            title={bestVoicingPair.nextVoicing.name}
            value={`루트: ${getRootHint(
              nextPracticeItem?.symbol ?? "",
              bestVoicingPair.nextVoicing
            )}`}
          />
        </div>
      ) : (
        <p className="text-sm leading-6 text-[#94A3B8]">
          현재/다음 코드의 보이싱 후보가 부족해 연결 해설을 만들 수 없습니다.
        </p>
      ),
    },
    {
      id: "solo",
      title: "솔로 타겟 노트 해설",
      summary: `타겟 ${soloRecommendation.targetNote} / 해결 ${soloRecommendation.resolution}`,
      content: (
        <div className="grid gap-3 md:grid-cols-3">
          <Info title="현재 코드" value={currentPracticeItem?.symbol ?? "-"} />
          <Info title="타겟 노트" value={soloRecommendation.targetNote} />
          <Info
            title="대체 타겟"
            value={soloRecommendation.alternateTargets.join(", ")}
          />
          <Info title="추천 이유" value={soloRecommendation.reason} />
          <Info title="해결 후보" value={soloRecommendation.resolution} />
          <Info title="연습 과제" value={soloRecommendation.exercise} />
        </div>
      ),
    },
  ];

  return (
    <div className="mt-5 space-y-3">
      {sections.map((section) => {
        const isOpen = openSections.includes(section.id);

        return (
          <section
            key={section.id}
            className={`rounded-lg border ${
              isOpen
                ? "border-blue-800/40 bg-[#0A1220]"
                : "border-blue-900/30 bg-[#050B16]"
            }`}
          >
            <button
              onClick={() => onToggle(section.id)}
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
            >
              <div>
                <h3 className="text-base font-black text-[#E5E7EB]">
                  {section.title}
                </h3>
                <p className="mt-1 text-sm text-[#94A3B8]">{section.summary}</p>
              </div>
              <span className="rounded-md border border-blue-900/30 bg-[#02040A] px-2 py-1 text-xs font-black text-[#94A3B8]">
                {isOpen ? "접기" : "열기"}
              </span>
            </button>

            {isOpen && (
              <div className="border-t border-blue-900/30 px-4 py-4">
                {section.content}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function TheoryMiniRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-blue-900/30 bg-[#07111F] p-3">
      <p className="font-black text-[#E5E7EB]">{title}</p>
      <p className="mt-1 text-sm leading-6 text-[#94A3B8]">{value}</p>
    </div>
  );
}

function BriefItem({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-black text-[#E5E7EB]">{title}</p>
      <p className="mt-1 text-sm leading-6 text-[#94A3B8]">{value}</p>
    </div>
  );
}

function NumberInput({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-400">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const nextValue = Number(e.target.value);
          if (!Number.isNaN(nextValue)) {
            onChange(nextValue);
          }
        }}
        className="mt-2 w-full rounded-lg border border-blue-900/30 bg-[#050B16] px-4 py-3 text-lg font-black outline-none transition focus:border-[#1D4ED8]"
      />
    </div>
  );
}

function PracticePanel({
  currentPracticeItem,
  nextPracticeItem,
  trainingMode,
  viewMode,
  currentIndex,
  totalCount,
  selectedKey,
  selectedKeyRoot,
  soloScaleNotes,
  beatInChord,
  safeBpm,
  safeBeatsPerChord,
  isAutoPlaying,
  metronomeEnabled,
  rootDroneEnabled,
  countInEnabled,
  countInRemaining,
  currentVoicings,
  nextVoicings,
  voicingModeLabel,
  bestVoicingPair,
  focusMode,
  onToggleFocusMode,
  onPrev,
  onNext,
  onTogglePlay,
  onClose,
}: {
  currentPracticeItem: PracticeItem;
  nextPracticeItem: PracticeItem | undefined;
  trainingMode: TrainingMode;
  viewMode: ViewMode;
  currentIndex: number;
  totalCount: number;
  selectedKey: string;
  selectedKeyRoot: string;
  soloScaleNotes: string[];
  beatInChord: number;
  safeBpm: number;
  safeBeatsPerChord: number;
  isAutoPlaying: boolean;
  metronomeEnabled: boolean;
  rootDroneEnabled: boolean;
  countInEnabled: boolean;
  countInRemaining: number | null;
  currentVoicings: GuitarVoicing[];
  nextVoicings: GuitarVoicing[];
  voicingModeLabel: string;
  bestVoicingPair: VoicingPair | null;
  focusMode: boolean;
  onToggleFocusMode: () => void;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onClose: () => void;
}) {
  const focusMovementHint = getEnhancedFocusMovementHint(
    currentPracticeItem.symbol,
    nextPracticeItem?.symbol,
    bestVoicingPair
  );

  if (focusMode) {
    return (
      <section className="mt-5 rounded-lg border border-blue-900/30 bg-[#050B16] p-5 shadow-2xl shadow-black/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-[#64748B]">
              {trainingMode === "solo" ? "Focus Solo" : "Focus Practice"}
            </p>
            <h2 className="text-6xl font-black tracking-tight text-white md:text-8xl">
              {currentPracticeItem.symbol}
            </h2>
            <p className="mt-1 text-xl font-black text-[#94A3B8]">
              {selectedKey} / {safeBpm} BPM
            </p>
          </div>

          <div className="rounded-lg border border-blue-900/30 bg-[#0A1220] p-4 text-left md:text-right">
            <p className="text-sm font-bold text-slate-400">박자</p>
            <p className="text-4xl font-black text-[#E5E7EB]">
              {beatInChord} / {safeBeatsPerChord}
            </p>
            <p className="mt-1 text-sm font-black text-[#94A3B8]">
              {countInRemaining !== null
                ? `카운트인 ${countInRemaining}`
                : isAutoPlaying
                  ? "재생 중"
                  : "정지"}
            </p>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          {Array.from({ length: safeBeatsPerChord }).map((_, index) => (
            <div
              key={index}
              className={`h-3 flex-1 rounded-lg transition ${
                index + 1 <= beatInChord ? "bg-[#1D4ED8]" : "bg-[#0B1730]"
              }`}
            />
          ))}
        </div>

        {trainingMode === "solo" ? (
          <SoloPracticePanel
            currentPracticeItem={currentPracticeItem}
            nextPracticeItem={nextPracticeItem}
            selectedKeyRoot={selectedKeyRoot}
            soloScaleNotes={soloScaleNotes}
            currentIndex={currentIndex}
            compact
          />
        ) : bestVoicingPair ? (
          <section className="mt-5">
            <div className="mx-auto grid max-w-[760px] gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <PracticeVoicingCard
                label="지금"
                symbol={currentPracticeItem.symbol}
                voicing={bestVoicingPair.currentVoicing}
                compact
              />
              <div className="text-center text-2xl font-black text-[#64748B]">→</div>
              <PracticeVoicingCard
                label="다음"
                symbol={nextPracticeItem?.symbol ?? "-"}
                voicing={bestVoicingPair.nextVoicing}
                compact
              />
            </div>
          </section>
        ) : null}

        {trainingMode === "chords" && bestVoicingPair && (
          <p className="mx-auto mt-3 max-w-[760px] rounded-lg border border-blue-900/30 bg-[#0A1220] p-3 text-sm font-black leading-6 text-[#CBD5E1]">
            {focusMovementHint}
          </p>
        )}

        <PracticeControls
          isAutoPlaying={isAutoPlaying}
          focusMode={focusMode}
          onPrev={onPrev}
          onNext={onNext}
          onTogglePlay={onTogglePlay}
          onToggleFocusMode={onToggleFocusMode}
          onClose={onClose}
        />
      </section>
    );
  }

  return (
    <section className="mt-5 rounded-lg border border-blue-900/30 bg-[#050B16] p-4 shadow-2xl shadow-black/25">
      <div className="grid gap-4 lg:grid-cols-[0.78fr_1.22fr] lg:items-stretch">
        <div className="rounded-lg border border-blue-900/30 bg-[#0A1220] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-[#64748B]">
                {trainingMode === "solo" ? "Solo Practice" : "Now Playing"}
              </p>
              <h2 className="mt-1 text-5xl font-black tracking-tight text-white md:text-6xl">
                {currentPracticeItem.symbol}
              </h2>
              <p className="mt-1 text-lg font-black text-[#94A3B8]">
                {selectedKey} / {safeBpm} BPM
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-black text-[#94A3B8]">
                {currentIndex + 1} / {totalCount}
              </p>
              <p className="mt-1 text-sm font-bold text-slate-400">
                {countInRemaining !== null
                  ? `카운트인 ${countInRemaining}`
                  : isAutoPlaying
                    ? "재생 중"
                    : "정지"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            {Array.from({ length: safeBeatsPerChord }).map((_, index) => (
              <div
                key={index}
                className={`h-3 flex-1 rounded-lg transition ${
                  index + 1 <= beatInChord ? "bg-[#1D4ED8]" : "bg-[#0B1730]"
                }`}
              />
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <PracticeMiniCard title="BPM / 박자" value={`${safeBpm} / ${safeBeatsPerChord}`} />
            <PracticeMiniCard title="다음 코드" value={nextPracticeItem?.symbol ?? "-"} />
            <PracticeMiniCard
              title="모드"
              value={trainingMode === "solo" ? "즉흥 솔로" : voicingModeLabel}
            />
            <PracticeMiniCard
              title="클릭"
              value={`${metronomeEnabled ? "메트로놈 ON" : "메트로놈 OFF"} / ${
                rootDroneEnabled ? "드론 ON" : "드론 OFF"
              } / ${countInEnabled ? "카운트인 ON" : "카운트인 OFF"}`}
            />
            {viewMode !== "minimal" && (
              <PracticeMiniCard title="기능" value={currentPracticeItem.functionName} />
            )}
          </div>

          {viewMode !== "minimal" && (
            <p className="mt-4 text-sm leading-6 text-[#94A3B8]">
              {trainingMode === "solo"
                ? `${selectedKeyRoot} major 위에서 현재 코드톤에 착지.`
                : `현재 ${currentVoicings.length}개, 다음 ${nextVoicings.length}개 보이싱 후보.`}
            </p>
          )}
        </div>

        {trainingMode === "solo" ? (
          <SoloPracticePanel
            currentPracticeItem={currentPracticeItem}
            nextPracticeItem={nextPracticeItem}
            selectedKeyRoot={selectedKeyRoot}
            soloScaleNotes={soloScaleNotes}
            currentIndex={currentIndex}
          />
        ) : bestVoicingPair ? (
          <section className="rounded-lg border border-blue-900/30 bg-[#0A1220] p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-[#64748B]">
                  Best Move
                </p>
                <h3 className="mt-1 text-xl font-black text-white">
                  최소 이동 추천 연결
                </h3>
              </div>

              <span className="rounded-lg bg-[#1E40AF] px-3 py-2 text-sm font-black text-white">
                {getMovementLabel(bestVoicingPair.distance)}
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <PracticeVoicingCard
                label="현재"
                symbol={currentPracticeItem.symbol}
                voicing={bestVoicingPair.currentVoicing}
              />
              <div className="text-center text-2xl font-black text-[#64748B]">→</div>
              <PracticeVoicingCard
                label="다음"
                symbol={nextPracticeItem?.symbol ?? "-"}
                voicing={bestVoicingPair.nextVoicing}
              />
            </div>

            {viewMode !== "minimal" && (
              <p className="mt-3 text-sm font-bold text-[#94A3B8]">
                이동량 점수: {bestVoicingPair.distance} / 낮을수록 손 이동이 적음
              </p>
            )}
          </section>
        ) : null}
      </div>

      <PracticeControls
        isAutoPlaying={isAutoPlaying}
        focusMode={focusMode}
        onPrev={onPrev}
        onNext={onNext}
        onTogglePlay={onTogglePlay}
        onToggleFocusMode={onToggleFocusMode}
        onClose={onClose}
      />

      <p className="mt-3 text-xs font-bold text-slate-500">
        Enter 재생 / Space·→ 다음 / ← 이전 / F 집중모드 / M 보이싱 변경 / Esc 종료
      </p>
    </section>
  );
}

function PracticeMiniCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-blue-900/30 bg-[#050B16] p-3">
      <p className="text-sm font-bold text-slate-400">{title}</p>
      <p className="mt-1 break-words text-base font-black text-white">
        {value}
      </p>
    </div>
  );
}

function SoloPracticePanel({
  currentPracticeItem,
  nextPracticeItem,
  selectedKeyRoot,
  soloScaleNotes,
  currentIndex,
  compact = false,
}: {
  currentPracticeItem: PracticeItem;
  nextPracticeItem: PracticeItem | undefined;
  selectedKeyRoot: string;
  soloScaleNotes: string[];
  currentIndex: number;
  compact?: boolean;
}) {
  const chordTones =
    currentPracticeItem.notes.length > 0
      ? currentPracticeItem.notes
      : soloScaleNotes.slice(0, 4);
  const rhythmPrompt =
    soloRhythmPrompts[currentIndex % soloRhythmPrompts.length];
  const constraintPrompt =
    soloConstraintPrompts[currentIndex % soloConstraintPrompts.length];
  const soloRecommendation = getSoloTargetRecommendation(
    currentPracticeItem,
    nextPracticeItem,
    rhythmPrompt,
    constraintPrompt
  );
  const soloQuality = getChordQualityKey(currentPracticeItem.symbol);
  const soloApproach =
    soloQuality === "dominant7"
      ? `접근: 아래 반음에서 ${soloRecommendation.targetNote}으로 접근`
      : soloQuality === "maj7" || soloQuality === "maj9"
        ? `접근: 루트보다 ${soloRecommendation.targetNote}을 먼저 노리기`
        : soloQuality === "m7" || soloQuality === "m9" || soloQuality === "m7b5"
          ? `접근: b3/b7 후보 ${soloRecommendation.alternateTargets.join(", ")} 확인`
          : `접근: 3도 ${soloRecommendation.targetNote}을 중심으로 시작`;
  const soloResolution = `해결: 다음 코드에서 ${soloRecommendation.resolution} 착지`;
  const soloMission = `${soloApproach}. ${soloResolution}. ${soloRecommendation.exercise}`;
  const targetNotes = soloRecommendation.alternateTargets.length
    ? soloRecommendation.alternateTargets
    : [soloRecommendation.targetNote];

  return (
    <section className="rounded-lg border border-blue-900/30 bg-black/25 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-[#64748B]">
            Solo Map
          </p>
          <h3 className="mt-1 text-xl font-black text-white">
            {selectedKeyRoot} major 즉흥 솔로
          </h3>
        </div>
        <span className="rounded-lg bg-[#1E40AF] px-3 py-2 text-sm font-black text-white">
          목표음 {soloRecommendation.targetNote}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <SoloInfoBlock title="스케일" notes={soloScaleNotes} />
        <SoloInfoBlock title="현재 코드톤" notes={chordTones} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <PracticeMiniCard title="현재 코드" value={currentPracticeItem.symbol} />
        <PracticeMiniCard title="타겟 노트" value={soloRecommendation.targetNote} />
        <PracticeMiniCard title="해결 후보" value={soloRecommendation.resolution} />
        <PracticeMiniCard title="추천 이유" value={soloRecommendation.reason} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <PracticeMiniCard title="리듬 제한" value={rhythmPrompt} />
        <PracticeMiniCard title="연습 과제" value={soloRecommendation.exercise} />
      </div>

      <div className="mt-4 rounded-lg border border-blue-900/30 bg-[#0A1220] p-3">
        <p className="text-xs font-black uppercase text-[#64748B]">
          Solo Mission
        </p>
        <p className="mt-2 text-sm font-black leading-6 text-[#CBD5E1]">
          {soloMission}
        </p>
      </div>

      {compact ? (
        <p className="mt-4 rounded-lg border border-blue-900/30 bg-[#050B16] p-3 text-sm font-bold leading-6 text-[#94A3B8]">
          집중모드에서는 큰 프렛보드 맵을 접고 타겟 노트와 해결 후보만
          빠르게 확인합니다.
        </p>
      ) : (
        <FretboardMap
          keyRoot={selectedKeyRoot}
          currentChordSymbol={currentPracticeItem.symbol}
          currentChordNotes={chordTones}
          scaleNotes={soloScaleNotes}
          targetNotes={targetNotes}
          mode="solo"
        />
      )}
    </section>
  );
}

function SoloInfoBlock({ title, notes }: { title: string; notes: string[] }) {
  return (
    <div className="rounded-lg border border-blue-900/30 bg-[#07111F] p-3">
      <p className="text-sm font-bold text-slate-400">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {notes.map((note) => (
          <span
            key={`${title}-${note}`}
            className="rounded-md border border-blue-900/30 bg-[#0B1730] px-2 py-1 text-sm font-black text-[#CBD5E1]"
          >
            {note}
          </span>
        ))}
      </div>
    </div>
  );
}

type FretboardMapProps = {
  keyRoot: string;
  currentChordSymbol: string;
  currentChordNotes: string[];
  scaleNotes: string[];
  targetNotes?: string[];
  mode: "chord" | "solo";
};

function FretboardMap({
  keyRoot,
  currentChordSymbol,
  currentChordNotes,
  scaleNotes,
  targetNotes = [],
  mode,
}: FretboardMapProps) {
  const rootNote = currentChordNotes[0] ?? getChordRootSymbol(currentChordSymbol);
  const thirdNote = currentChordNotes[1];
  const fifthNote = currentChordNotes[2];
  const seventhNote = currentChordNotes[3];
  const frets = Array.from({ length: 13 }, (_, index) => index);

  function getFretRole(note: string) {
    if (sameNotePitch(note, rootNote)) return "root";
    if (targetNotes.some((targetNote) => sameNotePitch(note, targetNote))) {
      return "target";
    }
    if (sameNotePitch(note, thirdNote)) return "third";
    if (sameNotePitch(note, fifthNote)) return "chord";
    if (sameNotePitch(note, seventhNote)) return "seventh";
    if (currentChordNotes.some((chordNote) => sameNotePitch(note, chordNote))) {
      return "chord";
    }
    if (scaleNotes.some((scaleNote) => sameNotePitch(note, scaleNote))) {
      return "scale";
    }
    return "inactive";
  }

  function getRoleStyle(role: string) {
    if (role === "root") {
      return {
        backgroundColor: ROOT_NOTE_COLOR,
        borderColor: "rgba(251, 191, 36, 0.45)",
        color: ROOT_NOTE_DARK,
        boxShadow: "0 0 16px rgba(245,158,11,0.24)",
      };
    }

    if (role === "target") {
      return {
        backgroundColor: TARGET_NOTE_COLOR,
        borderColor: "rgba(37, 99, 235, 0.5)",
        color: "#E5E7EB",
      };
    }

    if (role === "third" || role === "seventh") {
      return {
        backgroundColor: GUIDE_TONE_COLOR,
        borderColor: "rgba(30, 64, 175, 0.5)",
        color: "#E5E7EB",
      };
    }

    if (role === "chord") {
      return {
        backgroundColor: CHORD_TONE_COLOR,
        borderColor: "rgba(71, 85, 105, 0.7)",
        color: "#E5E7EB",
      };
    }

    if (role === "scale") {
      return {
        backgroundColor: SCALE_TONE_COLOR,
        borderColor: "rgba(30, 64, 175, 0.22)",
        color: "#94A3B8",
      };
    }

    return {
      backgroundColor: DISABLED_NOTE_COLOR,
      borderColor: "rgba(15, 23, 42, 0.9)",
      color: "#334155",
    };
  }

  function getRoleLabel(role: string, note: string) {
    if (role === "root") return "R";
    if (role === "target") return "T";
    if (role === "third") return "3";
    if (role === "chord" && sameNotePitch(note, fifthNote)) return "5";
    if (role === "seventh") return "7";
    if (role === "chord") return note;
    if (role === "scale") return note;
    return "";
  }

  return (
    <section className="mt-4 rounded-lg border border-blue-900/30 bg-[#050B16] p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-[#64748B]">
            Fretboard Map
          </p>
          <h4 className="mt-1 text-lg font-black text-[#E5E7EB]">
            {keyRoot} major / {currentChordSymbol}
          </h4>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-md px-2 py-1" style={{ backgroundColor: ROOT_NOTE_COLOR, color: ROOT_NOTE_DARK }}>
            Root
          </span>
          <span className="rounded-md bg-[#2563EB] px-2 py-1 text-white">
            Target
          </span>
          <span className="rounded-md bg-[#1E40AF] px-2 py-1 text-white">
            3도/7도
          </span>
          <span className="rounded-md bg-[#334155] px-2 py-1 text-white">
            5도
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto pb-1">
        <div className="min-w-[840px]">
          <div className="grid grid-cols-[36px_repeat(13,_1fr)] gap-1 text-center text-xs font-black text-[#64748B]">
            <span />
            {frets.map((fret) => (
              <span key={`fret-label-${fret}`}>{fret}</span>
            ))}
          </div>

          <div className="mt-2 space-y-1">
            {standardTuningNotes.map((stringNote, stringIndex) => (
              <div
                key={`${mode}-${stringNote}-${stringIndex}`}
                className="grid grid-cols-[36px_repeat(13,_1fr)] gap-1"
              >
                <div className="flex items-center justify-end pr-2 text-xs font-black text-[#64748B]">
                  {stringNote}
                </div>
                {frets.map((fret) => {
                  const note = getStringNoteAtFret(stringIndex, fret);
                  const role = getFretRole(note);
                  const style = getRoleStyle(role);

                  return (
                    <div
                      key={`${stringIndex}-${fret}`}
                      className="flex h-8 items-center justify-center rounded-md border text-xs font-black"
                      style={style}
                      title={`${stringNote} string ${fret} fret: ${note}`}
                    >
                      <span className="leading-none">
                        {getRoleLabel(role, note)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PracticeVoicingCard({
  label,
  symbol,
  voicing,
  compact = false,
}: {
  label: string;
  symbol: string;
  voicing: GuitarVoicing;
  compact?: boolean;
}) {
  const rootHint = getRootHint(symbol, voicing);
  const guideToneHint = getGuideToneHint(symbol, voicing);
  const hasFingering = parseFingeringString(voicing.fingering).some(Boolean);

  return (
    <div
      className={`rounded-lg border border-blue-900/30 bg-[#050B16] p-4 ${
        compact ? "mx-auto w-full max-w-[360px]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-[#64748B]">{label}</p>
          <h4 className="mt-1 text-xl font-black text-white">{symbol}</h4>
        </div>
        <span className="rounded-lg border border-blue-900/30 px-2 py-1 text-xs font-bold text-[#94A3B8]">
          {voicing.difficulty}
        </span>
      </div>

      <p className="mt-2 text-sm font-bold text-[#CBD5E1]">{voicing.name}</p>
      <ChordDiagram symbol={symbol} voicing={voicing} compact={compact} />
      <div className="mt-3 rounded-lg border border-blue-900/30 bg-[#0A1220] p-3 text-sm leading-6">
        <p className="font-black" style={{ color: ROOT_NOTE_COLOR }}>
          루트: {rootHint}
        </p>
        <p className="text-[#94A3B8]">핵심음: {guideToneHint}</p>
        <p className="mt-1 text-xs font-bold text-[#64748B]">
          {hasFingering
            ? "운지: 1 검지 · 2 중지 · 3 약지 · 4 새끼"
            : "운지 정보 미등록"}
        </p>
      </div>
      {!compact && (
        <p className="mt-2 text-sm leading-6 text-[#64748B]">{voicing.note}</p>
      )}
    </div>
  );
}

function ChordDiagram({
  symbol,
  voicing,
  compact = false,
}: {
  symbol: string;
  voicing: GuitarVoicing;
  compact?: boolean;
}) {
  const frets = parseFretString(voicing.frets).slice(0, 6);
  const pressedFrets = frets.filter(
    (fret): fret is number => typeof fret === "number" && fret > 0
  );
  const minPressedFret =
    pressedFrets.length > 0 ? Math.min(...pressedFrets) : 1;
  const baseFret = minPressedFret > 4 ? minPressedFret : 1;
  const visibleFrets = Array.from({ length: 5 }, (_, index) => baseFret + index);
  const stringNames = ["E", "A", "D", "G", "B", "E"];
  const rootPositions = getVoicingRootPositions(voicing, symbol);
  const guideToneNotes = getGuideToneNotes(symbol, voicing);
  const fingerings = parseFingeringString(voicing.fingering);
  const boardHeightClass = compact ? "h-44" : "h-36";
  const dotSizeClass = compact ? "h-7 w-7 text-xs" : "h-5 w-5 text-[10px]";
  const topMarkerSizeClass = compact ? "h-7 w-7" : "h-5 w-5";
  const stringRailInset = `${100 / 12}%`;

  function getStringCenter(stringIndex: number) {
    return `${((stringIndex + 0.5) / 6) * 100}%`;
  }

  function getMarkerRole(stringIndex: number, fret: number) {
    const note = getStringNoteAtFret(stringIndex, fret);
    const isRoot = rootPositions.some(
      (position) =>
        position.stringIndex === stringIndex && position.fret === fret
    );
    const isGuideTone = guideToneNotes.some((guideTone) =>
      sameNotePitch(guideTone, note)
    );

    if (isRoot) return "root";
    if (isGuideTone) return "guide";
    return "chord";
  }

  return (
    <div
      className={`mx-auto mt-3 w-full rounded-lg border border-blue-900/30 bg-[#02040A] p-3 ${
        compact ? "max-w-[320px]" : "max-w-[280px]"
      }`}
      aria-label={`${voicing.name} 기타 코드 다이어그램`}
    >
      <div className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3">
        <span />
        <div className="grid grid-cols-6 text-center text-xs font-black text-[#64748B]">
          {frets.map((fret, index) => {
            const role = fret === 0 ? getMarkerRole(index, 0) : "inactive";

            return (
              <span
                key={`${voicing.name}-status-${index}`}
                className={`mx-auto flex ${topMarkerSizeClass} items-center justify-center rounded-full ${
                  role === "root"
                    ? "text-[#02040A] shadow-[0_0_16px_rgba(245,158,11,0.24)]"
                    : role === "guide"
                      ? "bg-[#1E40AF] text-white"
                      : ""
                }`}
                style={role === "root" ? { backgroundColor: ROOT_NOTE_COLOR } : undefined}
              >
                {fret === null ? "x" : fret === 0 ? (role === "root" ? "R" : "o") : ""}
              </span>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex gap-3">
        <div className="w-6 pt-2 text-right text-xs font-bold text-[#64748B]">
          {baseFret > 1 ? `${baseFret}fr` : ""}
        </div>
        <div className={`relative ${boardHeightClass} flex-1`}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`${voicing.name}-string-${index}`}
              className="absolute top-0 bottom-0 w-px bg-[#334155]/70"
              style={{ left: getStringCenter(index) }}
            />
          ))}

          {visibleFrets.map((fret, index) => (
            <div
              key={`${voicing.name}-fret-${fret}`}
              className={`absolute h-px ${
                index === 0 && baseFret === 1
                  ? "bg-[#94A3B8]"
                  : "bg-[#1E293B]"
              }`}
              style={{
                left: stringRailInset,
                right: stringRailInset,
                top: `${(index / 5) * 100}%`,
              }}
            />
          ))}

          <div
            className="absolute bottom-0 h-px bg-[#1E293B]"
            style={{ left: stringRailInset, right: stringRailInset }}
          />

          {frets.map((fret, stringIndex) => {
            if (!fret || fret < baseFret || fret > baseFret + 4) return null;
            const markerRole = getMarkerRole(stringIndex, fret);
            const markerColor =
              markerRole === "root"
                ? ROOT_NOTE_COLOR
                : markerRole === "guide"
                  ? GUIDE_TONE_COLOR
                  : CHORD_TONE_COLOR;
            const fingerNumber = fingerings[stringIndex];
            const markerLabel =
              fingerNumber ?? (markerRole === "root" ? "R" : "");

            return (
              <span
                key={`${voicing.name}-marker-${stringIndex}-${fret}`}
                className={`absolute flex ${dotSizeClass} -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-black shadow-sm shadow-black/40 ${
                  markerRole === "root"
                    ? "text-[#02040A] shadow-[0_0_16px_rgba(245,158,11,0.24)]"
                    : "text-white"
                }`}
                title={`${getStringNoteAtFret(stringIndex, fret)} ${
                  markerRole === "root" ? "루트음" : ""
                }`}
                style={{
                  left: getStringCenter(stringIndex),
                  top: `${((fret - baseFret + 0.5) / 5) * 100}%`,
                  backgroundColor: markerColor,
                  border:
                    markerRole === "root"
                      ? "1px solid rgba(251, 191, 36, 0.45)"
                      : "1px solid rgba(30, 64, 175, 0.28)",
                }}
              >
                {markerLabel}
              </span>
            );
          })}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3">
        <span />
        <div className="grid grid-cols-6 text-center text-xs font-bold text-[#64748B]">
          {stringNames.map((stringName, index) => (
            <span key={`${voicing.name}-string-name-${index}`}>{stringName}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TogglePill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-sm font-black transition ${
        active
          ? "border-blue-900/30 bg-[#16283c] text-[#CBD5E1]"
          : "border-slate-700/60 bg-black/20 text-slate-500 hover:text-slate-300"
      }`}
    >
      {label}
    </button>
  );
}

function PracticeControls({
  isAutoPlaying,
  focusMode,
  onPrev,
  onNext,
  onTogglePlay,
  onToggleFocusMode,
  onClose,
}: {
  isAutoPlaying: boolean;
  focusMode: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onToggleFocusMode: () => void;
  onClose: () => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <ControlButton onClick={onPrev}>← 이전</ControlButton>
      <ControlButton onClick={onNext}>다음 →</ControlButton>
      <ControlButton onClick={onTogglePlay}>
        {isAutoPlaying ? "일시정지" : "재생"}
      </ControlButton>
      <button
        onClick={onToggleFocusMode}
        className="rounded-lg border border-blue-900/30 px-4 py-2 text-sm font-black text-[#CBD5E1] transition hover:bg-[#1E40AF] hover:text-white"
      >
        {focusMode ? "일반모드" : "집중모드"}
      </button>
      <button
        onClick={onClose}
        className="rounded-lg border border-blue-900/30 px-4 py-2 text-sm font-black text-slate-300 transition hover:border-blue-900/40 hover:text-[#CBD5E1]"
      >
        종료
      </button>
    </div>
  );
}

function ControlButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg bg-[#1E40AF] px-4 py-2 text-sm font-black text-white shadow-lg shadow-black/20 transition hover:bg-[#2563EB]"
    >
      {children}
    </button>
  );
}
