import { Chord, Scale } from "tonal";

export function getChordInfo(symbol: string) {
  const chord = Chord.get(symbol);

  if (!chord.name && chord.notes.length === 0) {
    return null;
  }

  const root = chord.tonic ?? "";

  const relatedScales = root
    ? [
        {
          name: `${root} major`,
          notes: Scale.get(`${root} major`).notes,
          description: "기본 장음계. 밝고 안정적인 팝/록/발라드 문맥에서 사용.",
        },
        {
          name: `${root} major pentatonic`,
          notes: Scale.get(`${root} major pentatonic`).notes,
          description: "메이저 펜타토닉. 기타 솔로에서 안전하고 멜로딕하게 쓰기 좋음.",
        },
        {
          name: `${root} minor pentatonic`,
          notes: Scale.get(`${root} minor pentatonic`).notes,
          description: "마이너 펜타토닉. 블루스, 록, 펑크에서 거친 색채를 만들기 좋음.",
        },
        {
          name: `${root} mixolydian`,
          notes: Scale.get(`${root} mixolydian`).notes,
          description: "도미넌트/블루지한 색채. 7th 코드 위에서 특히 자주 사용.",
        },
        {
          name: `${root} lydian`,
          notes: Scale.get(`${root} lydian`).notes,
          description: "#4/#11이 들어간 맑고 떠 있는 느낌의 스케일.",
        },
      ].filter((scale) => scale.notes.length > 0)
    : [];

  return {
    symbol,
    name: chord.name || symbol,
    aliases: chord.aliases,
    tonic: chord.tonic,
    type: chord.type,
    notes: chord.notes,
    intervals: chord.intervals,
    relatedScales,
  };
}