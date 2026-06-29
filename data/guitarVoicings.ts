export type GuitarVoicingTag =
  | "easy"
  | "open"
  | "barre"
  | "upper"
  | "neo"
  | "jazz"
  | "cutting";

export type GuitarVoicing = {
  name: string;
  frets: string;
  fingering?: string;
  rootHint?: string;
  guideToneHint?: string;
  rootString?: number;
  rootFret?: number;
  rootNote?: string;
  guideTones?: string[];
  chordTones?: string[];
  intervalHint?: string;
  tags?: GuitarVoicingTag[];
  note: string;
  difficulty: "쉬움" | "중간" | "어려움";
};

type VoicingTheoryDefaults = Pick<
  GuitarVoicing,
  "rootNote" | "guideTones" | "guideToneHint" | "chordTones" | "intervalHint"
>;

const noteIndexes: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  "E#": 5,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
  Cb: 11,
  "B#": 0,
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

const standardTuningNotes = ["E", "A", "D", "G", "B", "E"];

const voicingTheoryDefaults: Record<string, VoicingTheoryDefaults> = {
  C: {
    rootNote: "C",
    guideTones: ["E"],
    guideToneHint: "3도 E",
    chordTones: ["C", "E", "G"],
    intervalHint: "C 루트, E 장3도, G 완전5도",
  },
  Cm: {
    rootNote: "C",
    guideTones: ["Eb"],
    guideToneHint: "b3도 Eb",
    chordTones: ["C", "Eb", "G"],
    intervalHint: "C 루트, Eb 단3도, G 완전5도",
  },
  Cmaj7: {
    rootNote: "C",
    guideTones: ["E", "B"],
    guideToneHint: "3도 E, 7도 B",
    chordTones: ["C", "E", "G", "B"],
    intervalHint: "C 루트, E 장3도, G 완전5도, B 장7도",
  },
  C7: {
    rootNote: "C",
    guideTones: ["E", "Bb"],
    guideToneHint: "3도 E, b7도 Bb",
    chordTones: ["C", "E", "G", "Bb"],
    intervalHint: "C 루트, E 장3도, G 완전5도, Bb 단7도",
  },
  D: {
    rootNote: "D",
    guideTones: ["F#"],
    guideToneHint: "3도 F#",
    chordTones: ["D", "F#", "A"],
    intervalHint: "D 루트, F# 장3도, A 완전5도",
  },
  Dm: {
    rootNote: "D",
    guideTones: ["F"],
    guideToneHint: "b3도 F",
    chordTones: ["D", "F", "A"],
    intervalHint: "D 루트, F 단3도, A 완전5도",
  },
  Dm7: {
    rootNote: "D",
    guideTones: ["F", "C"],
    guideToneHint: "b3도 F, b7도 C",
    chordTones: ["D", "F", "A", "C"],
    intervalHint: "D 루트, F 단3도, A 완전5도, C 단7도",
  },
  D7: {
    rootNote: "D",
    guideTones: ["F#", "C"],
    guideToneHint: "3도 F#, b7도 C",
    chordTones: ["D", "F#", "A", "C"],
    intervalHint: "D 루트, F# 장3도, A 완전5도, C 단7도",
  },
  E: {
    rootNote: "E",
    guideTones: ["G#"],
    guideToneHint: "3도 G#",
    chordTones: ["E", "G#", "B"],
    intervalHint: "E 루트, G# 장3도, B 완전5도",
  },
  Em: {
    rootNote: "E",
    guideTones: ["G"],
    guideToneHint: "b3도 G",
    chordTones: ["E", "G", "B"],
    intervalHint: "E 루트, G 단3도, B 완전5도",
  },
  Em7: {
    rootNote: "E",
    guideTones: ["G", "D"],
    guideToneHint: "b3도 G, b7도 D",
    chordTones: ["E", "G", "B", "D"],
    intervalHint: "E 루트, G 단3도, B 완전5도, D 단7도",
  },
  E7: {
    rootNote: "E",
    guideTones: ["G#", "D"],
    guideToneHint: "3도 G#, b7도 D",
    chordTones: ["E", "G#", "B", "D"],
    intervalHint: "E 루트, G# 장3도, B 완전5도, D 단7도",
  },
  F: {
    rootNote: "F",
    guideTones: ["A"],
    guideToneHint: "3도 A",
    chordTones: ["F", "A", "C"],
    intervalHint: "F 루트, A 장3도, C 완전5도",
  },
  Fm: {
    rootNote: "F",
    guideTones: ["Ab"],
    guideToneHint: "b3도 Ab",
    chordTones: ["F", "Ab", "C"],
    intervalHint: "F 루트, Ab 단3도, C 완전5도",
  },
  Fmaj7: {
    rootNote: "F",
    guideTones: ["A", "E"],
    guideToneHint: "3도 A, 7도 E",
    chordTones: ["F", "A", "C", "E"],
    intervalHint: "F 루트, A 장3도, C 완전5도, E 장7도",
  },
  G: {
    rootNote: "G",
    guideTones: ["B"],
    guideToneHint: "3도 B",
    chordTones: ["G", "B", "D"],
    intervalHint: "G 루트, B 장3도, D 완전5도",
  },
  G7: {
    rootNote: "G",
    guideTones: ["B", "F"],
    guideToneHint: "3도 B, b7도 F",
    chordTones: ["G", "B", "D", "F"],
    intervalHint: "G 루트, B 장3도, D 완전5도, F 단7도",
  },
  Gm7: {
    rootNote: "G",
    guideTones: ["Bb", "F"],
    guideToneHint: "b3도 Bb, b7도 F",
    chordTones: ["G", "Bb", "D", "F"],
    intervalHint: "G 루트, Bb 단3도, D 완전5도, F 단7도",
  },
  A: {
    rootNote: "A",
    guideTones: ["C#"],
    guideToneHint: "3도 C#",
    chordTones: ["A", "C#", "E"],
    intervalHint: "A 루트, C# 장3도, E 완전5도",
  },
  Am: {
    rootNote: "A",
    guideTones: ["C"],
    guideToneHint: "b3도 C",
    chordTones: ["A", "C", "E"],
    intervalHint: "A 루트, C 단3도, E 완전5도",
  },
  Am7: {
    rootNote: "A",
    guideTones: ["C", "G"],
    guideToneHint: "b3도 C, b7도 G",
    chordTones: ["A", "C", "E", "G"],
    intervalHint: "A 루트, C 단3도, E 완전5도, G 단7도",
  },
  A7: {
    rootNote: "A",
    guideTones: ["C#", "G"],
    guideToneHint: "3도 C#, b7도 G",
    chordTones: ["A", "C#", "E", "G"],
    intervalHint: "A 루트, C# 장3도, E 완전5도, G 단7도",
  },
  Amaj7: {
    rootNote: "A",
    guideTones: ["C#", "G#"],
    guideToneHint: "3도 C#, 7도 G#",
    chordTones: ["A", "C#", "E", "G#"],
    intervalHint: "A 루트, C# 장3도, E 완전5도, G# 장7도",
  },
  Bb: {
    rootNote: "Bb",
    guideTones: ["D"],
    guideToneHint: "3도 D",
    chordTones: ["Bb", "D", "F"],
    intervalHint: "Bb 루트, D 장3도, F 완전5도",
  },
  Ab: {
    rootNote: "Ab",
    guideTones: ["C"],
    guideToneHint: "3도 C",
    chordTones: ["Ab", "C", "Eb"],
    intervalHint: "Ab 루트, C 장3도, Eb 완전5도",
  },
  Eb: {
    rootNote: "Eb",
    guideTones: ["G"],
    guideToneHint: "3도 G",
    chordTones: ["Eb", "G", "Bb"],
    intervalHint: "Eb 루트, G 장3도, Bb 완전5도",
  },
  B: {
    rootNote: "B",
    guideTones: ["D#"],
    guideToneHint: "3도 D#",
    chordTones: ["B", "D#", "F#"],
    intervalHint: "B 루트, D# 장3도, F# 완전5도",
  },
  "F#m": {
    rootNote: "F#",
    guideTones: ["A"],
    guideToneHint: "b3도 A",
    chordTones: ["F#", "A", "C#"],
    intervalHint: "F# 루트, A 단3도, C# 완전5도",
  },
  "F#m7": {
    rootNote: "F#",
    guideTones: ["A", "E"],
    guideToneHint: "b3도 A, b7도 E",
    chordTones: ["F#", "A", "C#", "E"],
    intervalHint: "F# 루트, A 단3도, C# 완전5도, E 단7도",
  },
  Bm: {
    rootNote: "B",
    guideTones: ["D"],
    guideToneHint: "b3도 D",
    chordTones: ["B", "D", "F#"],
    intervalHint: "B 루트, D 단3도, F# 완전5도",
  },
  Bm7b5: {
    rootNote: "B",
    guideTones: ["D", "A"],
    guideToneHint: "b3도 D, b7도 A",
    chordTones: ["B", "D", "F", "A"],
    intervalHint: "B 루트, D 단3도, F 감5도, A 단7도",
  },
  B7: {
    rootNote: "B",
    guideTones: ["D#", "A"],
    guideToneHint: "3도 D#, b7도 A",
    chordTones: ["B", "D#", "F#", "A"],
    intervalHint: "B 루트, D# 장3도, F# 완전5도, A 단7도",
  },
  "C#7": {
    rootNote: "C#",
    guideTones: ["F", "B"],
    guideToneHint: "3도 F, b7도 B",
    chordTones: ["C#", "F", "G#", "B"],
    intervalHint: "C# 루트, F 장3도, G# 완전5도, B 단7도",
  },
  Dmaj7: {
    rootNote: "D",
    guideTones: ["F#", "C#"],
    guideToneHint: "3도 F#, 7도 C#",
    chordTones: ["D", "F#", "A", "C#"],
    intervalHint: "D 루트, F# 장3도, A 완전5도, C# 장7도",
  },
  Emaj7: {
    rootNote: "E",
    guideTones: ["G#", "D#"],
    guideToneHint: "3도 G#, 7도 D#",
    chordTones: ["E", "G#", "B", "D#"],
    intervalHint: "E 루트, G# 장3도, B 완전5도, D# 장7도",
  },
};

const guitarVoicingMap: Record<string, GuitarVoicing[]> = {
  C: [
    {
      name: "오픈 C",
      frets: "x32010",
      fingering: "x 3 2 0 1 0",
      rootHint: "5번줄 3프렛 C",
      guideToneHint: "3도 E",
      rootString: 5,
      rootFret: 3,
      rootNote: "C",
      guideTones: ["E"],
      note: "가장 기본적인 C. 코드 진행 연습용으로 안정적.",
      difficulty: "쉬움",
    },
    {
      name: "A폼 바레",
      frets: "x35553",
      fingering: "x 1 3 3 3 1",
      rootHint: "5번줄 3프렛 C",
      guideToneHint: "3도 E",
      rootString: 5,
      rootFret: 3,
      rootNote: "C",
      guideTones: ["E"],
      note: "3프렛 근처에서 잡는 C. 록/펑크 커팅에 좋음.",
      difficulty: "중간",
    },
    {
      name: "상단현 C",
      frets: "xx5553",
      fingering: "x x 3 3 3 1",
      rootHint: "3번줄 5프렛 C",
      guideToneHint: "3도 E",
      rootString: 3,
      rootFret: 5,
      rootNote: "C",
      guideTones: ["E"],
      note: "상단현 중심. 밴드 안에서 과하게 두껍지 않게 쓰기 좋음.",
      difficulty: "중간",
    },
  ],

  Cm: [
    {
      name: "A폼 바레 Cm",
      frets: "x35543",
      fingering: "x 1 3 3 2 1",
      note: "기본적인 C minor 바레 보이싱.",
      difficulty: "중간",
    },
    {
      name: "상단현 Cm",
      frets: "xx5543",
      fingering: "x x 3 3 2 1",
      note: "짧고 어둡게 찍기 좋은 보이싱.",
      difficulty: "중간",
    },
  ],

  Cmaj7: [
    {
      name: "오픈 Cmaj7",
      frets: "x32000",
      fingering: "x 3 2 0 0 0",
      rootHint: "5번줄 3프렛 C",
      guideToneHint: "3도 E, 7도 B",
      rootString: 5,
      rootFret: 3,
      rootNote: "C",
      guideTones: ["E", "B"],
      note: "밝고 부드러운 기본 Cmaj7.",
      difficulty: "쉬움",
    },
    {
      name: "A폼 Cmaj7",
      frets: "x35453",
      fingering: "x 1 3 2 4 1",
      note: "재즈/시티팝 느낌에 좋은 폐쇄형 보이싱.",
      difficulty: "중간",
    },
    {
      name: "상단현 Cmaj7",
      frets: "xx5557",
      fingering: "x x 1 1 1 3",
      note: "가볍게 색채만 얹는 느낌.",
      difficulty: "중간",
    },
  ],

  C7: [
    {
      name: "오픈 C7",
      frets: "x32310",
      fingering: "x 3 2 4 1 0",
      note: "블루스/도미넌트 느낌의 기본 C7.",
      difficulty: "쉬움",
    },
    {
      name: "A폼 C7",
      frets: "x35353",
      fingering: "x 1 3 1 3 1",
      note: "커팅과 블루스에 쓰기 좋은 바레형.",
      difficulty: "중간",
    },
  ],

  D: [
    {
      name: "오픈 D",
      frets: "xx0232",
      fingering: "x x 0 1 3 2",
      rootHint: "4번줄 개방현 D",
      guideToneHint: "3도 F#",
      rootString: 4,
      rootFret: 0,
      rootNote: "D",
      guideTones: ["F#"],
      note: "가장 기본적인 D. 밝고 선명함.",
      difficulty: "쉬움",
    },
    {
      name: "C폼 이동 D",
      frets: "x54232",
      fingering: "x 4 3 1 2 1",
      note: "중음역에서 부드럽게 연결하기 좋음.",
      difficulty: "중간",
    },
    {
      name: "상단현 D",
      frets: "xx7775",
      fingering: "x x 3 3 3 1",
      note: "밴드 안에서 짧게 찍기 좋은 D.",
      difficulty: "중간",
    },
  ],

  Dm: [
    {
      name: "오픈 Dm",
      frets: "xx0231",
      fingering: "x x 0 2 3 1",
      rootHint: "4번줄 개방현 D",
      guideToneHint: "단3도 F",
      rootString: 4,
      rootFret: 0,
      rootNote: "D",
      guideTones: ["F"],
      note: "기본 D minor. 쓸쓸한 색이 바로 남.",
      difficulty: "쉬움",
    },
    {
      name: "A폼 Dm",
      frets: "x57765",
      fingering: "x 1 3 3 2 1",
      note: "5프렛 근처 기본 마이너 바레.",
      difficulty: "중간",
    },
  ],

  Dm7: [
    {
      name: "오픈 Dm7",
      frets: "xx0211",
      fingering: "x x 0 2 1 1",
      rootHint: "4번줄 개방현 D",
      guideToneHint: "단3도 F, 7도 C",
      rootString: 4,
      rootFret: 0,
      rootNote: "D",
      guideTones: ["F", "C"],
      note: "부드러운 Dm7. ii-V-I 연습에 좋음.",
      difficulty: "쉬움",
    },
    {
      name: "A폼 Dm7",
      frets: "x57565",
      fingering: "x 1 3 1 2 1",
      note: "재즈/펑크에서 많이 쓰는 Dm7.",
      difficulty: "중간",
    },
  ],

  D7: [
    {
      name: "오픈 D7",
      frets: "xx0212",
      fingering: "x x 0 2 1 3",
      note: "G로 해결되는 기본 도미넌트7. 블루스와 포크 진행에 좋음.",
      difficulty: "쉬움",
    },
    {
      name: "A폼 D7",
      frets: "x57575",
      fingering: "x 1 3 1 4 1",
      note: "C - E7 - Am - D7 - G7 - C 같은 세컨더리 진행에 쓰기 좋음.",
      difficulty: "중간",
    },
  ],

  Dmaj7: [
    {
      name: "오픈 Dmaj7",
      frets: "xx0222",
      fingering: "x x 0 1 1 1",
      rootHint: "4번줄 개방현 D",
      guideToneHint: "3도 F#, 7도 C#",
      rootString: 4,
      rootFret: 0,
      rootNote: "D",
      guideTones: ["F#", "C#"],
      note: "밝고 부드러운 Dmaj7 오픈 보이싱.",
      difficulty: "쉬움",
      tags: ["easy", "open", "neo"],
    },
    {
      name: "A폼 Dmaj7",
      frets: "x57675",
      fingering: "x 1 3 2 4 1",
      note: "5프렛 근처에서 잡는 컬러감 있는 Dmaj7.",
      difficulty: "중간",
      tags: ["barre", "neo", "jazz"],
    },
  ],

  E: [
    {
      name: "오픈 E",
      frets: "022100",
      fingering: "0 2 3 1 0 0",
      rootHint: "6번줄 개방현 E",
      guideToneHint: "3도 G#",
      rootString: 6,
      rootFret: 0,
      rootNote: "E",
      guideTones: ["G#"],
      note: "기본 E. 강하고 시원함.",
      difficulty: "쉬움",
    },
    {
      name: "상단현 E",
      frets: "xx9997",
      fingering: "x x 3 3 3 1",
      note: "고음역에서 밝게 찍기 좋음.",
      difficulty: "중간",
    },
  ],

  Emaj7: [
    {
      name: "오픈 Emaj7",
      frets: "021100",
      fingering: "0 2 1 1 0 0",
      rootHint: "6번줄 개방현 E",
      guideToneHint: "3도 G#, 7도 D#",
      rootString: 6,
      rootFret: 0,
      rootNote: "E",
      guideTones: ["G#", "D#"],
      note: "오픈현이 살아 있는 부드러운 Emaj7.",
      difficulty: "쉬움",
      tags: ["easy", "open", "neo"],
    },
    {
      name: "A폼 Emaj7",
      frets: "x79897",
      fingering: "x 1 3 2 4 1",
      note: "네오소울/시티팝 연결에 쓰기 좋은 Emaj7.",
      difficulty: "중간",
      tags: ["barre", "neo", "jazz"],
    },
  ],

  Em: [
    {
      name: "오픈 Em",
      frets: "022000",
      fingering: "0 2 3 0 0 0",
      rootHint: "6번줄 개방현 E",
      guideToneHint: "단3도 G",
      rootString: 6,
      rootFret: 0,
      rootNote: "E",
      guideTones: ["G"],
      note: "가장 쉬운 마이너 코드 중 하나.",
      difficulty: "쉬움",
    },
    {
      name: "상단현 Em",
      frets: "xx9987",
      fingering: "x x 3 3 2 1",
      note: "상단현에서 어둡게 찍는 보이싱.",
      difficulty: "중간",
    },
  ],

  Em7: [
    {
      name: "오픈 Em7",
      frets: "022030",
      fingering: "0 2 3 0 4 0",
      note: "부드럽고 열린 Em7. 팝 진행과 ii-V 연결 전 연습에 좋음.",
      difficulty: "쉬움",
    },
    {
      name: "E폼 Em7",
      frets: "075787",
      fingering: "0 1 3 1 4 2",
      note: "중음역에서 재즈/네오소울 연결감을 만들기 좋은 Em7.",
      difficulty: "중간",
    },
  ],

  E7: [
    {
      name: "오픈 E7",
      frets: "020100",
      fingering: "0 2 0 1 0 0",
      rootHint: "6번줄 개방현 E",
      guideToneHint: "3도 G#, 7도 D",
      rootString: 6,
      rootFret: 0,
      rootNote: "E",
      guideTones: ["G#", "D"],
      note: "A로 해결하기 좋은 기본 도미넌트.",
      difficulty: "쉬움",
    },
    {
      name: "E7 변형",
      frets: "076750",
      fingering: "0 1 2 1 3 0",
      note: "블루스/펑크에서 색채 있게 쓰기 좋음.",
      difficulty: "중간",
    },
  ],

  F: [
    {
      name: "미니 F",
      frets: "xx3211",
      fingering: "x x 3 2 1 1",
      rootHint: "4번줄 3프렛 F",
      guideToneHint: "3도 A",
      rootString: 4,
      rootFret: 3,
      rootNote: "F",
      guideTones: ["A"],
      note: "바레가 부담될 때 쓰기 좋은 작은 F.",
      difficulty: "쉬움",
    },
    {
      name: "E폼 바레 F",
      frets: "133211",
      fingering: "1 3 4 2 1 1",
      rootHint: "6번줄 1프렛 F",
      guideToneHint: "3도 A",
      rootString: 6,
      rootFret: 1,
      rootNote: "F",
      guideTones: ["A"],
      note: "가장 표준적인 F 바레.",
      difficulty: "중간",
    },
    {
      name: "상단현 F",
      frets: "xx7565",
      fingering: "x x 3 4 2 1",
      note: "CAGED 연결 연습에 좋음.",
      difficulty: "중간",
    },
  ],

  Fm: [
    {
      name: "E폼 바레 Fm",
      frets: "133111",
      fingering: "1 3 4 1 1 1",
      note: "C major에서 iv로 쓰면 바로 아련해짐.",
      difficulty: "중간",
    },
    {
      name: "상단현 Fm",
      frets: "xx7564",
      fingering: "x x 3 4 2 1",
      note: "C - F - Fm - C 진행에서 부드럽게 연결하기 좋음.",
      difficulty: "중간",
    },
  ],

  Fmaj7: [
    {
      name: "오픈 Fmaj7",
      frets: "xx3210",
      fingering: "x x 3 2 1 0",
      note: "C 키에서 IVmaj7로 쓰기 좋은 밝고 부드러운 폼.",
      difficulty: "쉬움",
    },
    {
      name: "상단현 Fmaj7",
      frets: "xx3555",
      fingering: "x x 1 3 4 4",
      note: "Cmaj7 - Gm7 - C7 - Fmaj7 진행에서 상단현 연결에 좋음.",
      difficulty: "중간",
    },
  ],

  G: [
    {
      name: "오픈 G",
      frets: "320003",
      fingering: "3 2 0 0 0 4",
      rootHint: "6번줄 3프렛 G",
      guideToneHint: "3도 B",
      rootString: 6,
      rootFret: 3,
      rootNote: "G",
      guideTones: ["B"],
      note: "기본 G. 밝고 넓게 울림.",
      difficulty: "쉬움",
    },
    {
      name: "E폼 바레 G",
      frets: "355433",
      fingering: "1 3 4 2 1 1",
      rootHint: "6번줄 3프렛 G",
      guideToneHint: "3도 B",
      rootString: 6,
      rootFret: 3,
      rootNote: "G",
      guideTones: ["B"],
      note: "3프렛 바레. 안정적인 폐쇄형.",
      difficulty: "중간",
    },
  ],

  G7: [
    {
      name: "오픈 G7",
      frets: "320001",
      fingering: "3 2 0 0 0 1",
      rootHint: "6번줄 3프렛 G",
      guideToneHint: "3도 B, 7도 F",
      rootString: 6,
      rootFret: 3,
      rootNote: "G",
      guideTones: ["B", "F"],
      note: "C로 해결하기 좋은 기본 G7.",
      difficulty: "쉬움",
    },
    {
      name: "E폼 G7",
      frets: "353433",
      fingering: "1 3 1 2 1 1",
      note: "블루스/재즈에서 기본적인 G7 바레.",
      difficulty: "중간",
    },
  ],

  Gm7: [
    {
      name: "E폼 Gm7",
      frets: "353333",
      fingering: "1 3 1 1 1 1",
      note: "Cmaj7 - Gm7 - C7 - Fmaj7에서 ii/IV 느낌을 만드는 폼.",
      difficulty: "중간",
    },
    {
      name: "상단현 Gm7",
      frets: "xx3333",
      fingering: "x x 1 1 1 1",
      note: "상단현에서 짧게 커팅하기 좋은 Gm7.",
      difficulty: "쉬움",
    },
  ],

  A: [
    {
      name: "오픈 A",
      frets: "x02220",
      fingering: "x 0 2 3 4 0",
      rootHint: "5번줄 개방현 A",
      guideToneHint: "3도 C#",
      rootString: 5,
      rootFret: 0,
      rootNote: "A",
      guideTones: ["C#"],
      note: "기본 A. 팝/록 진행에서 매우 자주 사용.",
      difficulty: "쉬움",
    },
    {
      name: "E폼 바레 A",
      frets: "577655",
      fingering: "1 3 4 2 1 1",
      rootHint: "6번줄 5프렛 A",
      guideToneHint: "3도 C#",
      rootString: 6,
      rootFret: 5,
      rootNote: "A",
      guideTones: ["C#"],
      note: "5프렛 루트. 안정적인 록/펑크용.",
      difficulty: "중간",
    },
    {
      name: "상단현 A",
      frets: "xx7655",
      fingering: "x x 3 4 1 1",
      note: "상단현에서 가볍게 찍는 A.",
      difficulty: "중간",
    },
  ],

  Am: [
    {
      name: "오픈 Am",
      frets: "x02210",
      fingering: "x 0 2 3 1 0",
      rootHint: "5번줄 개방현 A",
      guideToneHint: "단3도 C",
      rootString: 5,
      rootFret: 0,
      rootNote: "A",
      guideTones: ["C"],
      note: "기본 A minor. 가장 자주 쓰는 마이너 코드.",
      difficulty: "쉬움",
    },
    {
      name: "E폼 바레 Am",
      frets: "577555",
      fingering: "1 3 4 1 1 1",
      rootHint: "6번줄 5프렛 A",
      guideToneHint: "단3도 C",
      rootString: 6,
      rootFret: 5,
      rootNote: "A",
      guideTones: ["C"],
      note: "5프렛 루트 마이너 바레.",
      difficulty: "중간",
    },
  ],

  Am7: [
    {
      name: "오픈 Am7",
      frets: "x02010",
      fingering: "x 0 2 0 1 0",
      note: "Cmaj7 - Bm7b5 - E7 - Am7에서 안정 착지로 쓰기 좋음.",
      difficulty: "쉬움",
    },
    {
      name: "E폼 Am7",
      frets: "575555",
      fingering: "1 3 1 1 1 1",
      note: "5프렛 중심의 기본 Am7 바레.",
      difficulty: "중간",
    },
  ],

  A7: [
    {
      name: "오픈 A7",
      frets: "x02020",
      fingering: "x 0 2 0 3 0",
      rootHint: "5번줄 개방현 A",
      guideToneHint: "3도 C#, 7도 G",
      rootString: 5,
      rootFret: 0,
      rootNote: "A",
      guideTones: ["C#", "G"],
      note: "D로 해결하기 좋은 기본 A7.",
      difficulty: "쉬움",
    },
    {
      name: "E폼 A7",
      frets: "575655",
      fingering: "1 3 1 2 1 1",
      note: "블루스/펑크용 A7 바레.",
      difficulty: "중간",
    },
  ],

  Amaj7: [
    {
      name: "오픈 Amaj7",
      frets: "x02120",
      fingering: "x 0 2 1 3 0",
      rootHint: "5번줄 개방현 A",
      guideToneHint: "3도 C#, 7도 G#",
      rootString: 5,
      rootFret: 0,
      rootNote: "A",
      guideTones: ["C#", "G#"],
      note: "부드럽고 세련된 기본 Amaj7.",
      difficulty: "쉬움",
    },
    {
      name: "E폼 Amaj7",
      frets: "576655",
      fingering: "1 3 2 4 1 1",
      rootHint: "6번줄 5프렛 A",
      guideToneHint: "3도 C#, 7도 G#",
      rootString: 6,
      rootFret: 5,
      rootNote: "A",
      guideTones: ["C#", "G#"],
      note: "5프렛 루트의 폐쇄형 메이저7.",
      difficulty: "중간",
    },
    {
      name: "네오소울 Amaj7",
      frets: "x06654",
      fingering: "x 0 2 3 4 1",
      note: "상단현 색채가 예쁜 보이싱. 네오소울/시티팝에 좋음.",
      difficulty: "중간",
    },
  ],

  Bb: [
    {
      name: "A폼 바레 Bb",
      frets: "x13331",
      fingering: "x 1 3 3 3 1",
      note: "C major에서 bVII로 쓰면 록/모달 느낌이 남.",
      difficulty: "중간",
    },
    {
      name: "상단현 Bb",
      frets: "xx3331",
      fingering: "x x 3 3 3 1",
      note: "짧게 찍는 bVII 보이싱.",
      difficulty: "중간",
    },
  ],

  Ab: [
    {
      name: "E폼 바레 Ab",
      frets: "466544",
      fingering: "1 3 4 2 1 1",
      note: "C major에서 bVI로 쓰면 드라마틱한 색이 강함.",
      difficulty: "중간",
    },
    {
      name: "상단현 Ab",
      frets: "xx6544",
      fingering: "x x 3 4 1 1",
      note: "C - Ab - Bb - C 진행에서 연결하기 좋음.",
      difficulty: "중간",
    },
  ],

  Eb: [
    {
      name: "A폼 바레 Eb",
      frets: "x68886",
      fingering: "x 1 3 3 3 1",
      note: "C - Eb - F - C 또는 록 모달 진행에서 쓰기 좋은 bIII.",
      difficulty: "중간",
    },
    {
      name: "상단현 Eb",
      frets: "xx5343",
      fingering: "x x 3 1 4 2",
      note: "밴드 안에서 짧게 찍기 좋은 Eb 상단현 보이싱.",
      difficulty: "중간",
    },
  ],

  "F#m": [
    {
      name: "E폼 바레 F#m",
      frets: "244222",
      fingering: "1 3 4 1 1 1",
      rootHint: "6번줄 2프렛 F#",
      guideToneHint: "단3도 A",
      rootString: 6,
      rootFret: 2,
      rootNote: "F#",
      guideTones: ["A"],
      note: "A major에서 vi. 팝 진행에서 매우 자주 등장.",
      difficulty: "중간",
    },
    {
      name: "상단현 F#m",
      frets: "xx4222",
      fingering: "x x 3 1 1 1",
      rootHint: "4번줄 4프렛 F#",
      guideToneHint: "단3도 A",
      rootString: 4,
      rootFret: 4,
      rootNote: "F#",
      guideTones: ["A"],
      note: "A - F#m - D - E 진행에서 가볍게 쓰기 좋음.",
      difficulty: "중간",
    },
  ],

  "F#m7": [
    {
      name: "E폼 F#m7",
      frets: "242222",
      fingering: "1 3 1 1 1 1",
      rootHint: "6번줄 2프렛 F#",
      guideToneHint: "단3도 A, 7도 E",
      rootString: 6,
      rootFret: 2,
      rootNote: "F#",
      guideTones: ["A", "E"],
      note: "A major에서 vim7. 부드러운 팝/시티팝 색.",
      difficulty: "중간",
    },
    {
      name: "상단현 F#m7",
      frets: "xx2222",
      fingering: "x x 1 1 1 1",
      note: "쉬운 상단현 F#m7. 연결 연습에 좋음.",
      difficulty: "쉬움",
    },
  ],

  "F#m7b5": [
    {
      name: "기본 F#m7b5",
      frets: "2x221x",
      fingering: "1 x 3 4 2 x",
      note: "하프디미니시드 색채. 재즈 iiø-V-i에서 자주 사용.",
      difficulty: "중간",
    },
    {
      name: "상단현 F#m7b5",
      frets: "xx4555",
      fingering: "x x 1 2 3 4",
      note: "상단현으로 색채만 잡는 형태.",
      difficulty: "중간",
    },
  ],

  B: [
    {
      name: "A폼 바레 B",
      frets: "x24442",
      fingering: "x 1 3 3 3 1",
      rootHint: "5번줄 2프렛 B",
      guideToneHint: "3도 D#",
      rootString: 5,
      rootFret: 2,
      rootNote: "B",
      guideTones: ["D#"],
      note: "A폼에서 올린 기본 B 메이저 바레.",
      difficulty: "중간",
      tags: ["barre"],
    },
    {
      name: "상단현 B",
      frets: "xx4442",
      fingering: "x x 3 4 4 1",
      note: "상단현 위주로 짧게 잡는 B 메이저.",
      difficulty: "중간",
      tags: ["upper"],
    },
  ],

  Bm: [
    {
      name: "A폼 바레 Bm",
      frets: "x24432",
      fingering: "x 1 3 4 2 1",
      rootHint: "5번줄 2프렛 B",
      guideToneHint: "단3도 D",
      rootString: 5,
      rootFret: 2,
      rootNote: "B",
      guideTones: ["D"],
      note: "D major나 A major 진행에서 자주 쓰는 Bm.",
      difficulty: "중간",
    },
  ],

  Bm7b5: [
    {
      name: "기본 Bm7b5",
      frets: "x2323x",
      fingering: "x 1 2 3 4 x",
      note: "Cmaj7 - Bm7b5 - E7 - Am7에서 긴장을 만드는 핵심 폼.",
      difficulty: "중간",
    },
    {
      name: "상단현 Bm7b5",
      frets: "xx4435",
      fingering: "x x 2 3 1 4",
      note: "상단현에서 반음 해결을 보기 좋은 Bm7b5.",
      difficulty: "중간",
    },
  ],

  B7: [
    {
      name: "오픈 B7",
      frets: "x21202",
      fingering: "x 2 1 3 0 4",
      note: "E로 해결하는 대표적인 B7.",
      difficulty: "쉬움",
    },
    {
      name: "A폼 B7",
      frets: "x24242",
      fingering: "x 1 3 1 4 1",
      note: "펑크/재즈에서 짧게 쓰기 좋음.",
      difficulty: "중간",
    },
  ],

  "C#7": [
    {
      name: "A폼 C#7",
      frets: "x46464",
      fingering: "x 1 3 1 4 1",
      note: "A major에서 V7/vi. F#m으로 강하게 끌림.",
      difficulty: "중간",
    },
    {
      name: "상단현 C#7",
      frets: "xx3424",
      fingering: "x x 2 3 1 4",
      note: "상단현에서 세컨더리 도미넌트 색을 내기 좋음.",
      difficulty: "중간",
    },
  ],
};

function normalizeChordSymbol(symbol: string) {
  return symbol.split("/")[0].trim();
}

function getNoteIndex(note: string) {
  return noteIndexes[note] ?? 0;
}

function samePitch(noteA?: string, noteB?: string) {
  if (!noteA || !noteB) return false;
  return getNoteIndex(noteA) === getNoteIndex(noteB);
}

function parseFretString(frets: string) {
  return frets.split("").map((char) => {
    if (char.toLowerCase() === "x") return null;

    const fret = Number(char);

    return Number.isNaN(fret) ? null : fret;
  });
}

function getStringNoteAtFret(stringIndex: number, fret: number) {
  const openNote = standardTuningNotes[stringIndex] ?? "E";
  return sharpNotes[(getNoteIndex(openNote) + fret) % 12];
}

function getGuitarStringNumber(stringIndex: number) {
  return 6 - stringIndex;
}

function formatRootHint(stringIndex: number, fret: number, note: string) {
  const stringNumber = getGuitarStringNumber(stringIndex);
  const fretLabel = fret === 0 ? "개방현" : `${fret}프렛`;

  return `${stringNumber}번줄 ${fretLabel} ${note}`;
}

function inferRootPosition(voicing: GuitarVoicing, rootNote?: string) {
  if (!rootNote) return null;

  const frets = parseFretString(voicing.frets).slice(0, 6);

  for (let stringIndex = 0; stringIndex < frets.length; stringIndex += 1) {
    const fret = frets[stringIndex];

    if (fret === null) continue;

    const note = getStringNoteAtFret(stringIndex, fret);

    if (samePitch(note, rootNote)) {
      return {
        rootString: getGuitarStringNumber(stringIndex),
        rootFret: fret,
        rootNote: note,
      };
    }
  }

  return null;
}

function inferVoicingTags(voicing: GuitarVoicing) {
  const tags = new Set<GuitarVoicingTag>(voicing.tags ?? []);
  const text = `${voicing.name} ${voicing.note} ${voicing.frets}`.toLowerCase();

  if (voicing.difficulty === "쉬움") tags.add("easy");
  if (voicing.frets.includes("0") || text.includes("open") || text.includes("오픈")) {
    tags.add("open");
  }
  if (text.includes("barre") || text.includes("바레")) tags.add("barre");
  if (text.includes("상단") || text.includes("cutting") || voicing.frets.startsWith("xx")) {
    tags.add("upper");
  }
  if (
    text.includes("neo") ||
    text.includes("네오") ||
    text.includes("시티") ||
    text.includes("maj7") ||
    text.includes("컬러") ||
    text.includes("색채")
  ) {
    tags.add("neo");
  }
  if (text.includes("jazz") || text.includes("재즈") || text.includes("m7")) {
    tags.add("jazz");
  }
  if (text.includes("cutting") || text.includes("커팅")) tags.add("cutting");

  return [...tags];
}

function withVoicingMetadata(symbol: string, voicing: GuitarVoicing) {
  const defaults = voicingTheoryDefaults[symbol];
  const rootNote = voicing.rootNote ?? defaults?.rootNote;
  const inferredRoot = inferRootPosition(voicing, rootNote);
  const rootString = voicing.rootString ?? inferredRoot?.rootString;
  const rootFret = voicing.rootFret ?? inferredRoot?.rootFret;
  const displayedRootNote = voicing.rootNote ?? rootNote ?? inferredRoot?.rootNote;

  return {
    ...voicing,
    rootNote: displayedRootNote,
    rootString,
    rootFret,
    rootHint:
      voicing.rootHint ??
      (typeof rootString === "number" &&
      typeof rootFret === "number" &&
      displayedRootNote
        ? formatRootHint(6 - rootString, rootFret, displayedRootNote)
        : undefined),
    guideTones: voicing.guideTones ?? defaults?.guideTones,
    guideToneHint: voicing.guideToneHint ?? defaults?.guideToneHint,
    chordTones: voicing.chordTones ?? defaults?.chordTones,
    intervalHint: voicing.intervalHint ?? defaults?.intervalHint,
    tags: inferVoicingTags(voicing),
  };
}

export function getGuitarVoicings(symbol: string) {
  const normalized = normalizeChordSymbol(symbol);

  return (guitarVoicingMap[normalized] ?? []).map((voicing) =>
    withVoicingMetadata(normalized, voicing)
  );
}
