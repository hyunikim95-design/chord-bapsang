"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  analyzeProgression,
  getChordInfo,
  majorKeys,
} from "../lib/harmony";
import { chordDescriptions } from "../data/chordDescriptions";
import { getGuitarVoicings, type GuitarVoicing } from "../data/guitarVoicings";
import { practicePresets, type PracticePreset } from "../data/practicePresets";

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

type ProgressionAnalysis = ReturnType<typeof analyzeProgression>;
type PracticeItem = ProgressionAnalysis["items"][number];
type VoicingPair = {
  currentVoicing: GuitarVoicing;
  nextVoicing: GuitarVoicing;
  distance: number;
};

const majorScaleSteps = [0, 2, 4, 5, 7, 9, 11];
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
  const [input, setInput] = useState("A");
  const [showAdvanced, setShowAdvanced] = useState(true);

  const [progressionInput, setProgressionInput] = useState("A - F#m - D - E");
  const [analysisKey, setAnalysisKey] = useState("auto");

  const [practiceMode, setPracticeMode] = useState(true);
  const [trainingMode, setTrainingMode] = useState<TrainingMode>("chords");
  const [currentIndex, setCurrentIndex] = useState(0);

  const [bpm, setBpm] = useState(80);
  const [beatsPerChord, setBeatsPerChord] = useState(4);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [metronomeEnabled, setMetronomeEnabled] = useState(true);
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
    <main className="min-h-screen bg-[#03050a] text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(145deg,_#03050a,_#07101c_52%,_#02040a)]" />

      <section className="mx-auto max-w-6xl space-y-5 px-4 py-5 md:px-6">
        <header className="border-b border-blue-200/10 pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8fb3d9]">
                Harmony Training Dashboard
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">
                코드밥상
              </h1>
              <p className="mt-1 max-w-xl text-sm text-slate-400">
                진행을 만들고 바로 연습하는 어두운 화성학 워크스페이스.
              </p>
            </div>

            <div className="rounded-lg border border-blue-200/10 bg-blue-100/5 px-4 py-3">
              <p className="text-xs font-bold uppercase text-[#8fb3d9]">
                Current
              </p>
              <p className="mt-1 text-xl font-black">
                {practiceMode ? "Practice" : "Analyze"}
              </p>
            </div>
          </div>
        </header>

        <Panel>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionTitle
              eyebrow="Practice First"
              title="연습모드"
              description="진행을 고르고 바로 넘기면서 연습. 자세한 분석은 아래에서 확인."
            />

            <button
              onClick={() => setPracticeModeEnabled(!practiceMode)}
              className="rounded-lg border border-blue-200/10 bg-[#5f88b6] px-5 py-3 text-sm font-black text-white shadow-lg shadow-black/20 transition hover:bg-[#739bc6]"
            >
              {practiceMode ? "연습모드 끄기" : "연습모드 켜기"}
            </button>
          </div>

          <div className="mt-4 inline-grid rounded-lg border border-blue-200/10 bg-black/25 p-1 sm:grid-cols-2">
            <button
              onClick={() => updateTrainingMode("chords")}
              className={`rounded-md px-4 py-2 text-sm font-black transition ${
                trainingMode === "chords"
                  ? "bg-[#5f88b6] text-white"
                  : "text-slate-400 hover:text-blue-100"
              }`}
            >
              코드 진행
            </button>
            <button
              onClick={() => updateTrainingMode("solo")}
              className={`rounded-md px-4 py-2 text-sm font-black transition ${
                trainingMode === "solo"
                  ? "bg-[#5f88b6] text-white"
                  : "text-slate-400 hover:text-blue-100"
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
              currentIndex={currentIndex}
              totalCount={progressionAnalysis.items.length}
              selectedKey={progressionAnalysis.selectedKey}
              selectedKeyRoot={selectedKeyRoot}
              soloScaleNotes={currentSoloScale}
              beatInChord={beatInChord}
              safeBeatsPerChord={safeBeatsPerChord}
              isAutoPlaying={isAutoPlaying}
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
            <section className="rounded-lg border border-blue-200/10 bg-black/20 p-4">
              <p className="text-xs font-black uppercase text-blue-200/80">
                Daily Loop
              </p>
              <h3 className="mt-1 text-lg font-black text-white">
                오늘의 추천 루프
              </h3>
              <p className="mt-1 text-sm font-bold text-slate-300">
                {dailyPracticePreset.title}
              </p>
              <p className="mt-2 font-mono text-sm font-black text-blue-100/90">
                {dailyPracticePreset.progression}
              </p>
              <button
                onClick={applyDailyPracticePreset}
                className="mt-3 rounded-lg bg-[#5f88b6] px-4 py-2 text-sm font-black text-white transition hover:bg-[#739bc6]"
              >
                오늘 루프 연습
              </button>
            </section>

            <section className="rounded-lg border border-blue-200/10 bg-black/20 p-4">
              <p className="text-xs font-black uppercase text-blue-200/80">
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
                      className="rounded-lg border border-blue-200/10 bg-[#070b12] p-3 text-left transition hover:border-blue-200/30"
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
                className="mt-2 w-full rounded-lg border border-blue-200/10 bg-[#050910] px-4 py-4 text-xl font-bold outline-none transition focus:border-[#8fb3d9]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-400">
                분석 기준 조성
              </label>
              <select
                value={analysisKey}
                onChange={(e) => updateAnalysisKey(e.target.value)}
                className="mt-2 w-full rounded-lg border border-blue-200/10 bg-[#050910] px-4 py-4 text-xl font-bold outline-none transition focus:border-[#8fb3d9]"
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
                className="mt-2 w-full rounded-lg border border-blue-200/10 bg-[#050910] px-4 py-3 text-lg font-black outline-none transition focus:border-[#8fb3d9]"
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
              className="mt-7 rounded-lg bg-[#5f88b6] px-4 py-3 text-base font-black text-white shadow-lg shadow-black/20 transition hover:bg-[#739bc6] md:mt-7"
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
              active={countInEnabled}
              label="4박 카운트인"
              onClick={() => setCountInEnabled((prev) => !prev)}
            />
          </div>

          <section className="mt-5 rounded-lg border border-blue-200/10 bg-black/20 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
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
                  className="mt-2 w-full rounded-lg border border-blue-200/10 bg-[#050910] px-4 py-3 text-lg font-black outline-none transition focus:border-[#8fb3d9]"
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
                  className="mt-2 w-full rounded-lg border border-blue-200/10 bg-[#050910] px-4 py-3 text-lg font-black outline-none transition focus:border-[#8fb3d9]"
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
                  className="mt-2 w-full rounded-lg border border-blue-200/10 bg-[#050910] px-4 py-3 text-lg font-black outline-none transition focus:border-[#8fb3d9]"
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
                  className="w-full rounded-lg bg-[#5f88b6] px-4 py-3 text-lg font-black text-white shadow-lg shadow-black/20 transition hover:bg-[#739bc6]"
                >
                  랜덤 생성
                </button>
              </div>
            </div>

                        {lastRandomProgression && (
              <div className="mt-4">
                <div className="rounded-lg border border-sky-300/15 bg-slate-950/60 p-4">
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-300">
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
  <span className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-black text-slate-950">
    {voicingModeLabels[voicingMode]}
  </span>
  <span className="rounded-full border border-sky-400/30 px-3 py-1 text-xs font-bold text-slate-300">
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
      className="mt-2 w-full rounded-lg border border-sky-300/15 bg-[#070d18] px-4 py-3 text-base font-bold outline-none transition focus:border-sky-300"
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
        ? "bg-cyan-300 text-slate-950"
        : "border border-sky-300/40 text-sky-200 hover:bg-sky-300 hover:text-slate-950"
    }`}
  >
    {lastRandomIsFavorite ? "즐겨찾기 저장됨" : "즐겨찾기 저장"}
  </button>
</div>
                </div>
              </div>
            )}
                        {generatedHistory.length > 0 && (
              <div className="mt-4 rounded-2xl border border-sky-400/20 bg-slate-900/70 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-300">
                      Recent Generated
                    </p>
                    <h4 className="mt-1 text-xl font-black text-white">
                      최근 생성 기록
                    </h4>
                  </div>

                  <button
                    onClick={() => setGeneratedHistory([])}
                    className="rounded-full border border-sky-400/30 px-4 py-2 text-sm font-black text-slate-300 transition hover:border-cyan-300 hover:text-cyan-200"
                  >
                    기록 비우기
                  </button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {generatedHistory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => applyGeneratedHistoryItem(item)}
                      className="rounded-2xl border border-sky-400/20 bg-slate-950/80 p-4 text-left transition hover:border-cyan-300 hover:bg-cyan-300/10"
                    >
                      <p className="font-mono text-lg font-black text-cyan-100">
                        {item.progression}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-cyan-300 px-2 py-1 text-xs font-black text-slate-950">
                          {item.key} major
                        </span>

                        <span className="rounded-full border border-sky-400/30 px-2 py-1 text-xs font-bold text-slate-300">
                          {randomFlavorLabels[item.flavor]}
                        </span>

                        <span className="rounded-full border border-sky-400/30 px-2 py-1 text-xs font-bold text-slate-300">
                          {item.length}코드
                        </span>

                        <span className="rounded-full border border-sky-400/30 px-2 py-1 text-xs font-bold text-slate-300">
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
              <div className="mt-4 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-300">
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
                      className="rounded-2xl border border-cyan-300/20 bg-slate-950/80 p-4"
                    >
                      <div>
  <p className="text-lg font-black text-white">
    {getFavoriteDisplayTitle(item)}
  </p>
  <p className="mt-1 font-mono text-sm font-black text-cyan-100">
    {item.progression}
  </p>
</div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-cyan-300 px-2 py-1 text-xs font-black text-slate-950">
                          {item.key} major
                        </span>

                        <span className="rounded-full border border-sky-400/30 px-2 py-1 text-xs font-bold text-slate-300">
                          {randomFlavorLabels[item.flavor]}
                        </span>

                        <span className="rounded-full border border-sky-400/30 px-2 py-1 text-xs font-bold text-slate-300">
                          {item.length}코드
                        </span>

                        <span className="rounded-full border border-sky-400/30 px-2 py-1 text-xs font-bold text-slate-300">
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
      className="mt-2 w-full rounded-2xl border border-sky-400/20 bg-slate-950/80 px-4 py-3 text-base font-bold outline-none transition focus:border-cyan-300"
    />
  </div>

  <div className="flex flex-wrap gap-2">
    <button
      onClick={() => applyFavoriteProgressionItem(item)}
      className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
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
          <section className="mt-5 rounded-3xl border border-sky-400/20 bg-slate-950/70 p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
                  
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
                        ? "bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-950"
                        : "border border-sky-400/20 bg-slate-900/80 text-slate-300 hover:border-cyan-300 hover:text-cyan-200"
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
                  className="group rounded-2xl border border-sky-400/20 bg-slate-900/80 p-4 text-left transition hover:border-cyan-300 hover:bg-cyan-400/10 hover:shadow-lg hover:shadow-cyan-950"
                >
                  <p className="text-lg font-black text-cyan-100 group-hover:text-cyan-200">
                    {preset.title}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-400">
                    {preset.subtitle}
                  </p>

                  <p className="mt-3 font-mono text-sm font-black text-slate-200">
                    {preset.progression}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-cyan-300 px-2 py-1 text-xs font-black text-slate-950">
                      {preset.key} major
                    </span>
                    <span className="rounded-full border border-sky-400/30 px-2 py-1 text-xs font-bold text-slate-300">
                      {preset.bpm} BPM
                    </span>
                    <span className="rounded-full border border-sky-400/30 px-2 py-1 text-xs font-bold text-slate-300">
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
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Info title="추정/선택 조성" value={progressionAnalysis.selectedKey} />
            <Info title="코드 진행" value={progressionAnalysis.chordLine || "-"} />
            <Info title="로마숫자" value={progressionAnalysis.romanLine || "-"} />
          </div>

          {analysisKey === "auto" &&
            progressionAnalysis.candidateKeys.length > 0 && (
              <div className="mt-5 rounded-2xl border border-sky-400/20 bg-slate-950/70 p-4">
                <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-300">
                  자동 추정 후보
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {progressionAnalysis.candidateKeys
                    .slice(0, 5)
                    .map((candidate) => (
                      <span
                        key={candidate.key}
                        className="rounded-full border border-sky-400/20 bg-slate-900 px-3 py-1 text-sm font-bold text-slate-300"
                      >
                        {candidate.key} / 매칭 {candidate.matchedCount}개
                      </span>
                    ))}
                </div>
              </div>
            )}

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {progressionAnalysis.items.map((item) => (
              <article
                key={`${item.index}-${item.symbol}`}
                className="rounded-2xl border border-sky-400/20 bg-slate-950/70 p-4 transition hover:border-cyan-300/60"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-2xl font-black text-cyan-200">
                    {item.symbol}
                  </h3>
                  <Badge>{item.roman}</Badge>
                </div>

                <p className="mt-2 text-sm font-bold text-sky-300">
                  {item.functionName}
                </p>

                <p className="mt-3 leading-6 text-slate-300">
                  {item.explanation}
                </p>

                {item.notes.length > 0 && (
                  <p className="mt-3 text-sm text-slate-500">
                    구성음: {item.notes.join(", ")}
                  </p>
                )}
              </article>
            ))}
          </div>

          {lastRandomProgression && (
            <section className="mt-5 rounded-lg border border-sky-300/15 bg-slate-950/50 p-4">
              <p className="text-xs font-black uppercase text-sky-300">
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
            className="mt-5 w-full rounded-lg border border-sky-300/15 bg-[#070d18] px-4 py-4 text-xl font-bold outline-none transition focus:border-sky-300"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {["A", "Am", "A7", "Amaj7", "C", "Cmaj7", "G7", "F#m7b5"].map(
              (chord) => (
                <button
                  key={chord}
                  onClick={() => setInput(chord)}
                  className="rounded-lg border border-sky-300/15 bg-slate-950/60 px-3 py-2 text-sm font-bold text-slate-300 transition hover:border-sky-300 hover:text-sky-200"
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
                  <h2 className="text-4xl font-black text-cyan-200">
                    {cleanInput}
                  </h2>
                  <p className="text-slate-400">{chordInfo.name}</p>
                </div>

                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="rounded-full border border-cyan-300/50 px-4 py-2 text-sm font-bold text-cyan-200 transition hover:bg-cyan-400 hover:text-slate-950"
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
                      className="rounded-2xl border border-sky-400/20 bg-slate-950/70 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-black text-cyan-200">
                          {role.key}
                        </h3>
                        <Badge>{role.roman}</Badge>
                      </div>

                      <p className="mt-2 text-sm font-bold text-sky-300">
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
                      <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">
                        Basic
                      </p>
                      <p className="mt-1 leading-7">{description.basic}</p>
                    </div>

                    {showAdvanced && (
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">
                          Advanced
                        </p>
                        <p className="mt-1 leading-7 text-slate-300">
                          {description.advanced}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">
                        Mood Tags
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {description.mood.map((mood) => (
                          <span
                            key={mood}
                            className="rounded-full border border-sky-400/20 bg-slate-950 px-3 py-1 text-sm font-bold"
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
                        className="rounded-2xl border border-sky-400/20 bg-slate-950/70 p-4"
                      >
                        <p className="text-lg font-black text-cyan-100">
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
                    className="rounded-2xl border border-sky-400/20 bg-slate-950/70 p-4"
                  >
                    <h3 className="text-lg font-black text-cyan-200">
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
    <section className="rounded-lg border border-blue-200/10 bg-[#080d16]/90 p-5 shadow-xl shadow-black/25 backdrop-blur">
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
      <p className="text-xs font-black uppercase text-[#8fb3d9]">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-2xl font-black tracking-tight">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-blue-200/10 bg-black/25 p-4">
      <p className="text-sm font-bold text-slate-500">{title}</p>
      <p className="mt-1 break-words text-lg font-black text-slate-100">
        {value || "-"}
      </p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg border border-blue-200/20 bg-blue-100/5 px-3 py-1 text-sm font-black text-blue-100">
      {children}
    </span>
  );
}

function BriefItem({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-black text-blue-100">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-400">{value}</p>
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
        className="mt-2 w-full rounded-lg border border-blue-200/10 bg-[#050910] px-4 py-3 text-lg font-black outline-none transition focus:border-[#8fb3d9]"
      />
    </div>
  );
}

function PracticePanel({
  currentPracticeItem,
  nextPracticeItem,
  trainingMode,
  currentIndex,
  totalCount,
  selectedKey,
  selectedKeyRoot,
  soloScaleNotes,
  beatInChord,
  safeBeatsPerChord,
  isAutoPlaying,
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
  currentIndex: number;
  totalCount: number;
  selectedKey: string;
  selectedKeyRoot: string;
  soloScaleNotes: string[];
  beatInChord: number;
  safeBeatsPerChord: number;
  isAutoPlaying: boolean;
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
  if (focusMode) {
    return (
      <section className="mt-5 rounded-lg border border-blue-200/10 bg-[#060b13] p-5 shadow-2xl shadow-black/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-[#8fb3d9]">
              {trainingMode === "solo" ? "Focus Solo" : "Focus Practice"}
            </p>
            <h2 className="text-6xl font-black tracking-tight text-white md:text-8xl">
              {currentPracticeItem.symbol}
            </h2>
            <p className="mt-1 text-xl font-black text-blue-100">
              {currentPracticeItem.roman} / {selectedKey}
            </p>
          </div>

          <div className="rounded-lg border border-blue-200/10 bg-black/25 p-4 text-left md:text-right">
            <p className="text-sm font-bold text-slate-400">박자</p>
            <p className="text-4xl font-black text-blue-100">
              {beatInChord} / {safeBeatsPerChord}
            </p>
            <p className="mt-1 text-sm font-black text-blue-100">
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
                index + 1 <= beatInChord ? "bg-[#8fb3d9]" : "bg-slate-800"
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
          />
        ) : bestVoicingPair ? (
          <section className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <PracticeVoicingCard
              label="지금"
              symbol={currentPracticeItem.symbol}
              voicing={bestVoicingPair.currentVoicing}
            />
            <div className="text-center text-2xl font-black text-[#8fb3d9]">→</div>
            <PracticeVoicingCard
              label="다음"
              symbol={nextPracticeItem?.symbol ?? "-"}
              voicing={bestVoicingPair.nextVoicing}
            />
          </section>
        ) : null}

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
    <section className="mt-5 rounded-lg border border-blue-200/10 bg-[#060b13] p-4 shadow-2xl shadow-black/25">
      <div className="grid gap-4 lg:grid-cols-[0.78fr_1.22fr] lg:items-stretch">
        <div className="rounded-lg border border-blue-200/10 bg-black/25 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-[#8fb3d9]">
                {trainingMode === "solo" ? "Solo Practice" : "Now Playing"}
              </p>
              <h2 className="mt-1 text-5xl font-black tracking-tight text-white md:text-6xl">
                {currentPracticeItem.symbol}
              </h2>
              <p className="mt-1 text-lg font-black text-blue-100">
                {currentPracticeItem.roman} / {selectedKey}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-black text-blue-100">
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
                  index + 1 <= beatInChord ? "bg-[#8fb3d9]" : "bg-slate-800"
                }`}
              />
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <PracticeMiniCard title="기능" value={currentPracticeItem.functionName} />
            <PracticeMiniCard title="다음 코드" value={nextPracticeItem?.symbol ?? "-"} />
            <PracticeMiniCard
              title="모드"
              value={trainingMode === "solo" ? "즉흥 솔로" : voicingModeLabel}
            />
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-400">
            {trainingMode === "solo"
              ? `${selectedKeyRoot} major 위에서 현재 코드톤에 착지.`
              : `현재 ${currentVoicings.length}개, 다음 ${nextVoicings.length}개 보이싱 후보.`}
          </p>
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
          <section className="rounded-lg border border-blue-200/10 bg-black/25 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-[#8fb3d9]">
                  Best Move
                </p>
                <h3 className="mt-1 text-xl font-black text-white">
                  최소 이동 추천 연결
                </h3>
              </div>

              <span className="rounded-lg bg-[#5f88b6] px-3 py-2 text-sm font-black text-white">
                {getMovementLabel(bestVoicingPair.distance)}
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <PracticeVoicingCard
                label="현재"
                symbol={currentPracticeItem.symbol}
                voicing={bestVoicingPair.currentVoicing}
              />
              <div className="text-center text-2xl font-black text-[#8fb3d9]">→</div>
              <PracticeVoicingCard
                label="다음"
                symbol={nextPracticeItem?.symbol ?? "-"}
                voicing={bestVoicingPair.nextVoicing}
              />
            </div>

            <p className="mt-3 text-sm font-bold text-slate-400">
              이동량 점수: {bestVoicingPair.distance} / 낮을수록 손 이동이 적음
            </p>
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
    <div className="rounded-lg border border-blue-200/10 bg-[#050910] p-3">
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
}: {
  currentPracticeItem: PracticeItem;
  nextPracticeItem: PracticeItem | undefined;
  selectedKeyRoot: string;
  soloScaleNotes: string[];
  currentIndex: number;
}) {
  const chordTones =
    currentPracticeItem.notes.length > 0
      ? currentPracticeItem.notes
      : soloScaleNotes.slice(0, 4);
  const targetNote = nextPracticeItem?.notes[0] ?? selectedKeyRoot;
  const rhythmPrompt =
    soloRhythmPrompts[currentIndex % soloRhythmPrompts.length];
  const constraintPrompt =
    soloConstraintPrompts[currentIndex % soloConstraintPrompts.length];

  return (
    <section className="rounded-lg border border-blue-200/10 bg-black/25 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-blue-200/80">
            Solo Map
          </p>
          <h3 className="mt-1 text-xl font-black text-white">
            {selectedKeyRoot} major 즉흥 솔로
          </h3>
        </div>
        <span className="rounded-lg bg-[#5f88b6] px-3 py-2 text-sm font-black text-white">
          목표음 {targetNote}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <SoloInfoBlock title="스케일" notes={soloScaleNotes} />
        <SoloInfoBlock title="현재 코드톤" notes={chordTones} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <PracticeMiniCard title="리듬 제한" value={rhythmPrompt} />
        <PracticeMiniCard title="프레이즈 제한" value={constraintPrompt} />
      </div>
    </section>
  );
}

function SoloInfoBlock({ title, notes }: { title: string; notes: string[] }) {
  return (
    <div className="rounded-lg border border-blue-200/10 bg-[#070b12] p-3">
      <p className="text-sm font-bold text-slate-400">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {notes.map((note) => (
          <span
            key={`${title}-${note}`}
            className="rounded-md border border-blue-200/10 bg-blue-100/5 px-2 py-1 text-sm font-black text-blue-100"
          >
            {note}
          </span>
        ))}
      </div>
    </div>
  );
}

function PracticeVoicingCard({
  label,
  symbol,
  voicing,
}: {
  label: string;
  symbol: string;
  voicing: GuitarVoicing;
}) {
  return (
    <div className="rounded-lg border border-blue-200/10 bg-[#050910] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-[#8fb3d9]">{label}</p>
          <h4 className="mt-1 text-xl font-black text-white">{symbol}</h4>
        </div>
        <span className="rounded-lg border border-blue-200/10 px-2 py-1 text-xs font-bold text-slate-300">
          {voicing.difficulty}
        </span>
      </div>

      <p className="mt-2 text-sm font-bold text-slate-300">{voicing.name}</p>
      <ChordDiagram voicing={voicing} />
      <p className="mt-2 text-sm leading-6 text-slate-500">{voicing.note}</p>
    </div>
  );
}

function ChordDiagram({ voicing }: { voicing: GuitarVoicing }) {
  const frets = parseFretString(voicing.frets).slice(0, 6);
  const pressedFrets = frets.filter(
    (fret): fret is number => typeof fret === "number" && fret > 0
  );
  const minPressedFret =
    pressedFrets.length > 0 ? Math.min(...pressedFrets) : 1;
  const baseFret = minPressedFret > 4 ? minPressedFret : 1;
  const visibleFrets = Array.from({ length: 5 }, (_, index) => baseFret + index);
  const stringNames = ["E", "A", "D", "G", "B", "E"];

  return (
    <div
      className="mt-3 rounded-lg border border-blue-200/10 bg-black/20 p-3"
      aria-label={`${voicing.name} 기타 코드 다이어그램`}
    >
      <div className="grid grid-cols-6 text-center text-xs font-black text-slate-500">
        {frets.map((fret, index) => (
          <span key={`${voicing.name}-status-${index}`}>
            {fret === null ? "x" : fret === 0 ? "o" : ""}
          </span>
        ))}
      </div>

      <div className="mt-2 flex gap-3">
        <div className="w-6 pt-2 text-right text-xs font-bold text-slate-500">
          {baseFret > 1 ? `${baseFret}fr` : ""}
        </div>
        <div className="relative h-36 flex-1">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`${voicing.name}-string-${index}`}
              className="absolute top-0 bottom-0 w-px bg-slate-600/70"
              style={{ left: `${(index / 5) * 100}%` }}
            />
          ))}

          {visibleFrets.map((fret, index) => (
            <div
              key={`${voicing.name}-fret-${fret}`}
              className={`absolute left-0 right-0 h-px ${
                index === 0 && baseFret === 1
                  ? "bg-slate-300"
                  : "bg-slate-700/80"
              }`}
              style={{ top: `${(index / 5) * 100}%` }}
            />
          ))}

          <div className="absolute left-0 right-0 bottom-0 h-px bg-slate-700/80" />

          {frets.map((fret, stringIndex) => {
            if (!fret || fret < baseFret || fret > baseFret + 4) return null;

            return (
              <span
                key={`${voicing.name}-marker-${stringIndex}-${fret}`}
                className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8fb3d9] shadow-sm shadow-black/40"
                style={{
                  left: `${(stringIndex / 5) * 100}%`,
                  top: `${((fret - baseFret + 0.5) / 5) * 100}%`,
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-6 pl-9 text-center text-xs font-bold text-slate-500">
        {stringNames.map((stringName, index) => (
          <span key={`${voicing.name}-string-name-${index}`}>{stringName}</span>
        ))}
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
          ? "border-blue-200/20 bg-[#16283c] text-blue-100"
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
        className="rounded-lg border border-blue-200/20 px-4 py-2 text-sm font-black text-blue-100 transition hover:bg-[#5f88b6] hover:text-white"
      >
        {focusMode ? "일반모드" : "집중모드"}
      </button>
      <button
        onClick={onClose}
        className="rounded-lg border border-blue-200/10 px-4 py-2 text-sm font-black text-slate-300 transition hover:border-blue-200/30 hover:text-blue-100"
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
      className="rounded-lg bg-[#5f88b6] px-4 py-2 text-sm font-black text-white shadow-lg shadow-black/20 transition hover:bg-[#739bc6]"
    >
      {children}
    </button>
  );
}
