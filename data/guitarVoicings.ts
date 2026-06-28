export type GuitarVoicing = {
  name: string;
  frets: string;
  fingering?: string;
  rootHint?: string;
  guideToneHint?: string;
  note: string;
  difficulty: "쉬움" | "중간" | "어려움";
};

const guitarVoicingMap: Record<string, GuitarVoicing[]> = {
  C: [
    {
      name: "오픈 C",
      frets: "x32010",
      fingering: "x 3 2 0 1 0",
      note: "가장 기본적인 C. 코드 진행 연습용으로 안정적.",
      difficulty: "쉬움",
    },
    {
      name: "A폼 바레",
      frets: "x35553",
      fingering: "x 1 3 3 3 1",
      note: "3프렛 근처에서 잡는 C. 록/펑크 커팅에 좋음.",
      difficulty: "중간",
    },
    {
      name: "상단현 C",
      frets: "xx5553",
      fingering: "x x 3 3 3 1",
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

  E: [
    {
      name: "오픈 E",
      frets: "022100",
      fingering: "0 2 3 1 0 0",
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

  Em: [
    {
      name: "오픈 Em",
      frets: "022000",
      fingering: "0 2 3 0 0 0",
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

  E7: [
    {
      name: "오픈 E7",
      frets: "020100",
      fingering: "0 2 0 1 0 0",
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
      note: "바레가 부담될 때 쓰기 좋은 작은 F.",
      difficulty: "쉬움",
    },
    {
      name: "E폼 바레 F",
      frets: "133211",
      fingering: "1 3 4 2 1 1",
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

  G: [
    {
      name: "오픈 G",
      frets: "320003",
      fingering: "3 2 0 0 0 4",
      note: "기본 G. 밝고 넓게 울림.",
      difficulty: "쉬움",
    },
    {
      name: "E폼 바레 G",
      frets: "355433",
      fingering: "1 3 4 2 1 1",
      note: "3프렛 바레. 안정적인 폐쇄형.",
      difficulty: "중간",
    },
  ],

  G7: [
    {
      name: "오픈 G7",
      frets: "320001",
      fingering: "3 2 0 0 0 1",
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

  A: [
    {
      name: "오픈 A",
      frets: "x02220",
      fingering: "x 0 2 3 4 0",
      note: "기본 A. 팝/록 진행에서 매우 자주 사용.",
      difficulty: "쉬움",
    },
    {
      name: "E폼 바레 A",
      frets: "577655",
      fingering: "1 3 4 2 1 1",
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
      note: "기본 A minor. 가장 자주 쓰는 마이너 코드.",
      difficulty: "쉬움",
    },
    {
      name: "E폼 바레 Am",
      frets: "577555",
      fingering: "1 3 4 1 1 1",
      note: "5프렛 루트 마이너 바레.",
      difficulty: "중간",
    },
  ],

  A7: [
    {
      name: "오픈 A7",
      frets: "x02020",
      fingering: "x 0 2 0 3 0",
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
      note: "부드럽고 세련된 기본 Amaj7.",
      difficulty: "쉬움",
    },
    {
      name: "E폼 Amaj7",
      frets: "576655",
      fingering: "1 3 2 4 1 1",
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

  "F#m": [
    {
      name: "E폼 바레 F#m",
      frets: "244222",
      fingering: "1 3 4 1 1 1",
      note: "A major에서 vi. 팝 진행에서 매우 자주 등장.",
      difficulty: "중간",
    },
    {
      name: "상단현 F#m",
      frets: "xx4222",
      fingering: "x x 3 1 1 1",
      note: "A - F#m - D - E 진행에서 가볍게 쓰기 좋음.",
      difficulty: "중간",
    },
  ],

  "F#m7": [
    {
      name: "E폼 F#m7",
      frets: "242222",
      fingering: "1 3 1 1 1 1",
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

  Bm: [
    {
      name: "A폼 바레 Bm",
      frets: "x24432",
      fingering: "x 1 3 4 2 1",
      note: "D major나 A major 진행에서 자주 쓰는 Bm.",
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

export function getGuitarVoicings(symbol: string) {
  const normalized = normalizeChordSymbol(symbol);

  return guitarVoicingMap[normalized] ?? [];
}
