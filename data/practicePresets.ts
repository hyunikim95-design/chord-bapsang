export type PracticePreset = {
  id: string;
  title: string;
  subtitle: string;
  progression: string;
  key: string;
  bpm: number;
  beatsPerChord: number;
  voicingMode: "all" | "easy" | "open" | "barre" | "upper" | "neo";
  tags: string[];
};

export const practicePresets: PracticePreset[] = [
  {
    id: "basic-pop-a",
    title: "A 메이저 팝 진행",
    subtitle: "I - vi - IV - V 기본 감각",
    progression: "A - F#m - D - E",
    key: "A",
    bpm: 82,
    beatsPerChord: 4,
    voicingMode: "open",
    tags: ["기초", "팝", "오픈코드"],
  },
  {
    id: "borrowed-iv-c",
    title: "차용화음 iv",
    subtitle: "C major에서 Fm으로 아련해지는 맛",
    progression: "C - F - Fm - C",
    key: "C",
    bpm: 76,
    beatsPerChord: 4,
    voicingMode: "upper",
    tags: ["차용화음", "아련함", "상단현"],
  },
  {
    id: "modal-rock-c",
    title: "bVII 록 진행",
    subtitle: "I - bVII - IV - I 모달/브릿팝 느낌",
    progression: "C - Bb - F - C",
    key: "C",
    bpm: 92,
    beatsPerChord: 4,
    voicingMode: "barre",
    tags: ["록", "bVII", "바레"],
  },
  {
    id: "cinematic-borrowed",
    title: "영화음악식 bVI-bVII",
    subtitle: "I - bVI - bVII - I 웅장한 진행",
    progression: "C - Ab - Bb - C",
    key: "C",
    bpm: 70,
    beatsPerChord: 4,
    voicingMode: "barre",
    tags: ["차용화음", "시네마틱", "웅장함"],
  },
  {
    id: "secondary-dominant-c",
    title: "세컨더리 도미넌트",
    subtitle: "V7/vi, V7/V 흐름 익히기",
    progression: "C - E7 - Am - D7 - G7 - C",
    key: "C",
    bpm: 78,
    beatsPerChord: 4,
    voicingMode: "all",
    tags: ["입시", "세컨더리", "도미넌트"],
  },
  {
    id: "two-five-one-c",
    title: "2-5-1 기본",
    subtitle: "재즈/실용화성 기본 골격",
    progression: "Dm7 - G7 - Cmaj7",
    key: "C",
    bpm: 72,
    beatsPerChord: 4,
    voicingMode: "barre",
    tags: ["재즈", "2-5-1", "7화음"],
  },
  {
    id: "neo-soul-a",
    title: "Amaj7 색채 연습",
    subtitle: "메이저7, 세컨더리, 부드러운 연결",
    progression: "Amaj7 - C#7 - F#m7 - B7 - E7 - Amaj7",
    key: "A",
    bpm: 68,
    beatsPerChord: 4,
    voicingMode: "neo",
    tags: ["네오소울", "메이저7", "색채"],
  },
  {
    id: "upper-string-cutting",
    title: "상단현 커팅 루틴",
    subtitle: "얇고 타이트하게 코드 찍는 연습",
    progression: "A - G - D - A",
    key: "A",
    bpm: 96,
    beatsPerChord: 2,
    voicingMode: "upper",
    tags: ["커팅", "상단현", "록"],
  },
];