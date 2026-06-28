import { getChordQualityKey } from "./chordTheory";

export type ScaleTheoryProfile = {
  name: string;
  koreanName: string;
  intervals: string[];
  mood: string;
  usage: string;
  bestOver?: string[];
  avoidNotes?: string[];
  targetNotes?: string[];
};

export const scaleTheoryProfiles: ScaleTheoryProfile[] = [
  {
    name: "Major scale",
    koreanName: "메이저 스케일",
    intervals: ["1", "2", "3", "4", "5", "6", "7"],
    mood: "밝고 안정적인 기본 조성감",
    usage: "메이저 키의 멜로디, 코드 진행 분석, 기본 솔로 연습",
    bestOver: ["major", "maj7", "6", "add9", "maj9"],
    avoidNotes: ["4"],
    targetNotes: ["3", "7"],
  },
  {
    name: "Natural minor",
    koreanName: "내추럴 마이너",
    intervals: ["1", "2", "b3", "4", "5", "b6", "b7"],
    mood: "자연스럽고 어두운 마이너 색채",
    usage: "마이너 키 진행과 팝/록 멜로디",
    bestOver: ["minor", "m7", "m9"],
    targetNotes: ["b3", "b7"],
  },
  {
    name: "Harmonic minor",
    koreanName: "하모닉 마이너",
    intervals: ["1", "2", "b3", "4", "5", "b6", "7"],
    mood: "클래식하고 강한 해결감",
    usage: "마이너 키의 V7-i 해결, 긴장감 있는 솔로",
    bestOver: ["minor", "dominant7"],
    targetNotes: ["7", "b3"],
  },
  {
    name: "Melodic minor",
    koreanName: "멜로딕 마이너",
    intervals: ["1", "2", "b3", "4", "5", "6", "7"],
    mood: "세련되고 현대적인 마이너 색채",
    usage: "재즈 마이너 토닉, altered 계열 응용",
    bestOver: ["minor", "m6", "m9"],
    targetNotes: ["b3", "6", "7"],
  },
  {
    name: "Major pentatonic",
    koreanName: "메이저 펜타토닉",
    intervals: ["1", "2", "3", "5", "6"],
    mood: "밝고 안전한 팝/컨트리 색채",
    usage: "메이저 코드 위에서 안정적인 멜로디 만들기",
    bestOver: ["major", "6", "add9"],
    targetNotes: ["3", "6"],
  },
  {
    name: "Minor pentatonic",
    koreanName: "마이너 펜타토닉",
    intervals: ["1", "b3", "4", "5", "b7"],
    mood: "블루지하고 직관적인 록 색채",
    usage: "마이너 코드, 블루스, 록 솔로의 기본",
    bestOver: ["minor", "m7", "dominant7"],
    targetNotes: ["b3", "b7"],
  },
  {
    name: "Blues scale",
    koreanName: "블루스 스케일",
    intervals: ["1", "b3", "4", "b5", "5", "b7"],
    mood: "거칠고 끈적한 블루스 긴장",
    usage: "블루스, 록, 도미넌트 코드 위 솔로",
    bestOver: ["dominant7", "9", "13", "minor", "m7"],
    targetNotes: ["b3", "b5", "b7"],
  },
  {
    name: "Dorian",
    koreanName: "도리안",
    intervals: ["1", "2", "b3", "4", "5", "6", "b7"],
    mood: "어둡지만 펑키하고 열려 있는 마이너",
    usage: "m7 코드, 펑크/재즈/네오소울 솔로",
    bestOver: ["minor", "m7", "m9", "m6"],
    targetNotes: ["b3", "6", "b7"],
  },
  {
    name: "Mixolydian",
    koreanName: "믹솔리디안",
    intervals: ["1", "2", "3", "4", "5", "6", "b7"],
    mood: "밝지만 도미넌트 느낌이 있는 록/블루스 색채",
    usage: "7코드, 록/펑크/블루스 솔로에서 자주 사용",
    bestOver: ["dominant7", "9", "13", "7sus4"],
    avoidNotes: ["4"],
    targetNotes: ["3", "b7"],
  },
  {
    name: "Lydian",
    koreanName: "리디안",
    intervals: ["1", "2", "3", "#4", "5", "6", "7"],
    mood: "맑고 떠 있는 듯한 메이저 색채",
    usage: "maj7, maj9 위에 현대적인 밝은 색을 줄 때 사용",
    bestOver: ["maj7", "maj9", "major"],
    targetNotes: ["3", "#4", "7"],
  },
  {
    name: "Phrygian",
    koreanName: "프리지안",
    intervals: ["1", "b2", "b3", "4", "5", "b6", "b7"],
    mood: "어둡고 이국적인 긴장",
    usage: "마이너 코드 위 어두운 모달 사운드",
    bestOver: ["minor", "m7"],
    targetNotes: ["b2", "b3", "b7"],
  },
  {
    name: "Locrian",
    koreanName: "로크리안",
    intervals: ["1", "b2", "b3", "4", "b5", "b6", "b7"],
    mood: "불안하고 해결을 기다리는 색채",
    usage: "m7b5 코드 위에서 사용",
    bestOver: ["m7b5", "diminished"],
    targetNotes: ["b3", "b5", "b7"],
  },
  {
    name: "Altered scale",
    koreanName: "얼터드 스케일",
    intervals: ["1", "b9", "#9", "3", "b5", "#5", "b7"],
    mood: "강하고 재즈적인 도미넌트 긴장",
    usage: "V7alt에서 다음 코드로 강하게 해결할 때 사용",
    bestOver: ["dominant7", "9", "13"],
    targetNotes: ["3", "b7", "b9", "#9"],
  },
  {
    name: "Half-whole diminished",
    koreanName: "반음-온음 디미니시드",
    intervals: ["1", "b9", "#9", "3", "#4", "5", "6", "b7"],
    mood: "대칭적이고 날카로운 도미넌트 긴장",
    usage: "7b9, 13b9, diminished dominant 사운드",
    bestOver: ["dominant7", "dim7"],
    targetNotes: ["3", "b7", "b9"],
  },
  {
    name: "Whole tone",
    koreanName: "홀톤",
    intervals: ["1", "2", "3", "#4", "#5", "b7"],
    mood: "몽환적이고 방향감이 흐린 색채",
    usage: "aug, 7#5, 도미넌트 변형 사운드",
    bestOver: ["augmented", "dominant7"],
    targetNotes: ["3", "#5", "b7"],
  },
];

export function getRecommendedScaleProfilesForChord(symbol: string) {
  const quality = getChordQualityKey(symbol);
  const matches = scaleTheoryProfiles.filter((scale) =>
    scale.bestOver?.includes(quality)
  );

  return matches.length > 0 ? matches.slice(0, 3) : scaleTheoryProfiles.slice(0, 2);
}
