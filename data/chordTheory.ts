export type ChordTheoryProfile = {
  quality: string;
  koreanName: string;
  intervals: string[];
  mood: string;
  usage: string;
  guideToneRule?: string;
  commonProgressionUse?: string;
};

export const chordTheoryProfiles: Record<string, ChordTheoryProfile> = {
  major: {
    quality: "major",
    koreanName: "메이저",
    intervals: ["1", "3", "5"],
    mood: "밝고 안정적인 기본 색채",
    usage: "팝, 록, 포크 진행의 중심 코드로 사용",
    guideToneRule: "3도를 들으면 메이저와 마이너의 차이가 바로 드러남",
    commonProgressionUse: "I, IV, V에서 가장 자주 사용",
  },
  minor: {
    quality: "minor",
    koreanName: "마이너",
    intervals: ["1", "b3", "5"],
    mood: "어둡고 부드러운 감정",
    usage: "발라드, 팝, 록에서 감정적인 중심을 만들 때 사용",
    guideToneRule: "b3가 마이너 색을 결정함",
    commonProgressionUse: "ii, iii, vi 또는 i에서 자주 사용",
  },
  diminished: {
    quality: "diminished",
    koreanName: "디미니시드",
    intervals: ["1", "b3", "b5"],
    mood: "불안하고 긴장된 연결감",
    usage: "도미넌트로 가기 전 지나가는 코드나 리딩톤 코드로 사용",
    guideToneRule: "b3와 b5의 좁은 긴장을 확인",
    commonProgressionUse: "vii°, passing diminished",
  },
  augmented: {
    quality: "augmented",
    koreanName: "어그먼티드",
    intervals: ["1", "3", "#5"],
    mood: "떠 있는 듯한 불안정한 색채",
    usage: "반음 진행, 크로매틱 연결, 전조 직전에 사용",
    guideToneRule: "3도와 #5가 색을 만듦",
    commonProgressionUse: "Iaug, Vaug",
  },
  sus2: {
    quality: "sus2",
    koreanName: "서스2",
    intervals: ["1", "2", "5"],
    mood: "밝고 열린 느낌",
    usage: "메이저/마이너를 잠시 흐리게 만들 때 사용",
    commonProgressionUse: "Isus2, Vsus2",
  },
  sus4: {
    quality: "sus4",
    koreanName: "서스4",
    intervals: ["1", "4", "5"],
    mood: "해결을 기다리는 열린 긴장",
    usage: "V에서 I로 해결하기 전 긴장을 만들 때 사용",
    commonProgressionUse: "Vsus4 - V - I",
  },
  add9: {
    quality: "add9",
    koreanName: "애드9",
    intervals: ["1", "3", "5", "9"],
    mood: "맑고 넓은 팝 색채",
    usage: "기본 메이저/마이너 코드에 넓은 울림을 더할 때 사용",
    guideToneRule: "3도는 유지하고 9도로 공간감을 더함",
  },
  "6": {
    quality: "6",
    koreanName: "식스",
    intervals: ["1", "3", "5", "6"],
    mood: "부드럽고 빈티지한 안정감",
    usage: "재즈 팝, 보사노바, 엔딩 코드에 자주 사용",
  },
  m6: {
    quality: "m6",
    koreanName: "마이너6",
    intervals: ["1", "b3", "5", "6"],
    mood: "어둡지만 세련된 재즈 색채",
    usage: "마이너 토닉, 재즈 팝 진행에서 사용",
  },
  maj7: {
    quality: "maj7",
    koreanName: "메이저7",
    intervals: ["1", "3", "5", "7"],
    mood: "밝지만 부드럽고 세련된 색채",
    usage: "시티팝, 네오소울, 재즈 팝에서 자주 사용",
    guideToneRule: "3도와 7도를 들으면 maj7의 색이 가장 잘 드러남",
    commonProgressionUse: "Imaj7, IVmaj7에서 자주 사용",
  },
  m7: {
    quality: "m7",
    koreanName: "마이너7",
    intervals: ["1", "b3", "5", "b7"],
    mood: "부드럽고 약간 어두운 그루브",
    usage: "ii-V-I, 네오소울, 펑크 리듬 기타에 자주 사용",
    guideToneRule: "b3와 b7을 잡으면 m7의 색이 선명함",
    commonProgressionUse: "iim7, vim7, ii-V-I",
  },
  dominant7: {
    quality: "dominant7",
    koreanName: "도미넌트7",
    intervals: ["1", "3", "5", "b7"],
    mood: "해결을 요구하는 강한 긴장",
    usage: "다음 코드로 밀어주는 기능, 블루스와 재즈에서 핵심",
    guideToneRule: "3도와 b7이 도미넌트의 방향감을 만듦",
    commonProgressionUse: "V7-I, secondary dominant",
  },
  m7b5: {
    quality: "m7b5",
    koreanName: "하프 디미니시드",
    intervals: ["1", "b3", "b5", "b7"],
    mood: "어둡고 긴장된 재즈 색채",
    usage: "마이너 ii-V-i 또는 리딩 코드로 사용",
    guideToneRule: "b3, b5, b7을 확인",
    commonProgressionUse: "iim7b5 - V7 - i",
  },
  dim7: {
    quality: "dim7",
    koreanName: "디미니시드7",
    intervals: ["1", "b3", "b5", "bb7"],
    mood: "강한 대칭 긴장",
    usage: "패싱 코드, 도미넌트 대리, 크로매틱 연결에 사용",
  },
  maj9: {
    quality: "maj9",
    koreanName: "메이저9",
    intervals: ["1", "3", "5", "7", "9"],
    mood: "넓고 고급스러운 네오소울 색채",
    usage: "Imaj9, IVmaj9, 루트리스 보이싱에 사용",
    guideToneRule: "3도/7도 위에 9도를 얹으면 색이 살아남",
  },
  m9: {
    quality: "m9",
    koreanName: "마이너9",
    intervals: ["1", "b3", "5", "b7", "9"],
    mood: "깊고 부드러운 마이너 색채",
    usage: "네오소울, 재즈 발라드, 루프 진행에 사용",
  },
  "9": {
    quality: "9",
    koreanName: "도미넌트9",
    intervals: ["1", "3", "5", "b7", "9"],
    mood: "블루지하고 펑키한 긴장",
    usage: "펑크 커팅, 블루스, 재즈 도미넌트에 사용",
  },
  "7sus4": {
    quality: "7sus4",
    koreanName: "세븐서스4",
    intervals: ["1", "4", "5", "b7"],
    mood: "열린 도미넌트 긴장",
    usage: "도미넌트의 3도를 잠시 숨기고 해결을 미룰 때 사용",
  },
  "13": {
    quality: "13",
    koreanName: "도미넌트13",
    intervals: ["1", "3", "5", "b7", "9", "13"],
    mood: "화려하고 넓은 재즈/펑크 색채",
    usage: "V13, 펑크 리듬, 재즈 엔딩에 사용",
    guideToneRule: "3도/b7을 유지하고 13도로 색을 더함",
  },
};

export function getChordQualityKey(symbol: string) {
  const quality = symbol
    .split("/")[0]
    .trim()
    .replace(/^[A-G](?:#|b)?/, "")
    .toLowerCase();

  if (quality.includes("m7b5") || quality.includes("ø")) return "m7b5";
  if (quality.includes("dim7")) return "dim7";
  if (quality.includes("maj9")) return "maj9";
  if (quality.includes("m9")) return "m9";
  if (quality === "9" || quality.includes("dom9")) return "9";
  if (quality.includes("13")) return "13";
  if (quality.includes("7sus4")) return "7sus4";
  if (quality.includes("maj7") || quality.includes("ma7")) return "maj7";
  if (quality === "m7" || quality.includes("min7")) return "m7";
  if (quality === "7") return "dominant7";
  if (quality.includes("sus2")) return "sus2";
  if (quality.includes("sus4") || quality === "sus") return "sus4";
  if (quality.includes("add9")) return "add9";
  if (quality === "m6") return "m6";
  if (quality === "6") return "6";
  if (quality.includes("aug") || quality.includes("+")) return "augmented";
  if (quality.includes("dim")) return "diminished";
  if (quality === "m" || quality.includes("min")) return "minor";

  return "major";
}

export function getChordTheoryProfile(symbol: string) {
  return chordTheoryProfiles[getChordQualityKey(symbol)];
}
