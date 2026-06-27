import { Chord, Scale } from "tonal";

type ChordCategory =
  | "majorTriad"
  | "minorTriad"
  | "diminishedTriad"
  | "augmentedTriad"
  | "major7"
  | "minor7"
  | "dominant7"
  | "halfDiminished7"
  | "diminished7";

export const majorKeys = [
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

const majorKeyDegrees = [
  {
    roman: "I",
    roman7: "Imaj7",
    triad: "majorTriad",
    seventh: "major7",
    functionName: "토닉 계열",
    functionDescription: "조성의 중심. 안정감과 도착감을 만든다.",
  },
  {
    roman: "ii",
    roman7: "iim7",
    triad: "minorTriad",
    seventh: "minor7",
    functionName: "서브도미넌트 계열",
    functionDescription: "도미넌트로 가기 전 공간을 열어주는 역할.",
  },
  {
    roman: "iii",
    roman7: "iiim7",
    triad: "minorTriad",
    seventh: "minor7",
    functionName: "토닉 계열",
    functionDescription: "토닉과 비슷하지만 더 흐릿하고 감정적인 완충재 역할.",
  },
  {
    roman: "IV",
    roman7: "IVmaj7",
    triad: "majorTriad",
    seventh: "major7",
    functionName: "서브도미넌트 계열",
    functionDescription: "안정에서 살짝 벗어나 장면을 넓히는 역할.",
  },
  {
    roman: "V",
    roman7: "V7",
    triad: "majorTriad",
    seventh: "dominant7",
    functionName: "도미넌트 계열",
    functionDescription: "I로 해결하려는 긴장과 추진력을 만든다.",
  },
  {
    roman: "vi",
    roman7: "vim7",
    triad: "minorTriad",
    seventh: "minor7",
    functionName: "토닉 계열",
    functionDescription: "토닉을 대신하는 감정적이고 부드러운 중심 역할.",
  },
  {
    roman: "vii°",
    roman7: "viiø7",
    triad: "diminishedTriad",
    seventh: "halfDiminished7",
    functionName: "도미넌트 계열",
    functionDescription: "V7처럼 I로 해결하려는 강한 불안정성을 가진다.",
  },
];

const romanOrder: Record<string, number> = {
  I: 1,
  Imaj7: 1,
  i: 1.5,
  im7: 1.5,
  IV: 2,
  IVmaj7: 2,
  iv: 2.2,
  ivm7: 2.2,
  V: 3,
  V7: 3,
  vi: 4,
  vim7: 4,
  ii: 5,
  iim7: 5,
  iii: 6,
  iiim7: 6,
  "vii°": 7,
  "viiø7": 7,
};

function noteToPitchClass(note: string) {
  const match = note.match(/^([A-G])([#b]*)/);

  if (!match) return null;

  const baseMap: Record<string, number> = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11,
  };

  const letter = match[1];
  const accidentals = match[2];

  let value = baseMap[letter];

  for (const accidental of accidentals) {
    if (accidental === "#") value += 1;
    if (accidental === "b") value -= 1;
  }

  return ((value % 12) + 12) % 12;
}

function samePitch(noteA: string, noteB: string) {
  return noteToPitchClass(noteA) === noteToPitchClass(noteB);
}

function sameIntervalSet(intervals: string[], target: string[]) {
  if (intervals.length !== target.length) return false;
  return target.every((interval) => intervals.includes(interval));
}

function getChordCategory(
  type: string,
  intervals: string[]
): ChordCategory | null {
  if (sameIntervalSet(intervals, ["1P", "3M", "5P"])) return "majorTriad";
  if (sameIntervalSet(intervals, ["1P", "3m", "5P"])) return "minorTriad";
  if (sameIntervalSet(intervals, ["1P", "3m", "5d"])) return "diminishedTriad";
  if (sameIntervalSet(intervals, ["1P", "3M", "5A"])) return "augmentedTriad";
  if (sameIntervalSet(intervals, ["1P", "3M", "5P", "7M"])) return "major7";
  if (sameIntervalSet(intervals, ["1P", "3m", "5P", "7m"])) return "minor7";
  if (sameIntervalSet(intervals, ["1P", "3M", "5P", "7m"])) return "dominant7";
  if (sameIntervalSet(intervals, ["1P", "3m", "5d", "7m"])) return "halfDiminished7";
  if (sameIntervalSet(intervals, ["1P", "3m", "5d", "7d"])) return "diminished7";

  const lower = type.toLowerCase();

  if (lower.includes("half-diminished")) return "halfDiminished7";
  if (lower.includes("minor seventh flat five")) return "halfDiminished7";
  if (lower.includes("diminished seventh")) return "diminished7";
  if (lower.includes("major seventh")) return "major7";
  if (lower.includes("minor seventh")) return "minor7";
  if (lower.includes("dominant seventh")) return "dominant7";
  if (lower.includes("diminished")) return "diminishedTriad";
  if (lower.includes("augmented")) return "augmentedTriad";
  if (lower.includes("minor")) return "minorTriad";
  if (lower.includes("major")) return "majorTriad";

  return null;
}

function removeSlashBass(symbol: string) {
  return symbol.split("/")[0].trim();
}

function getRoleInMajorKey(symbol: string, key: string) {
  const baseSymbol = removeSlashBass(symbol);
  const chord = Chord.get(baseSymbol);
  const root = chord.tonic;

  if (!root) return null;

  const category = getChordCategory(chord.type, chord.intervals);

  if (!category) return null;

  const scaleNotes = Scale.get(`${key} major`).notes;

  for (let i = 0; i < scaleNotes.length; i++) {
    const degree = majorKeyDegrees[i];
    const scaleNote = scaleNotes[i];

    const isSameRoot = samePitch(root, scaleNote);
    const isTriadMatch = category === degree.triad;
    const isSeventhMatch = category === degree.seventh;

    if (isSameRoot && (isTriadMatch || isSeventhMatch)) {
      const roman = isSeventhMatch ? degree.roman7 : degree.roman;

      return {
        key: `${key} major`,
        keyRoot: key,
        roman,
        degreeRoot: scaleNote,
        functionName: degree.functionName,
        functionDescription: degree.functionDescription,
        scaleNotes,
        explanation: `${key} major에서 ${symbol}는 ${roman} 코드로 볼 수 있다. ${degree.functionName}이며, ${degree.functionDescription}`,
      };
    }
  }

  return null;
}

function getSecondaryDominantRole(
  symbol: string,
  key: string,
  nextSymbol?: string
) {
  const baseSymbol = removeSlashBass(symbol);
  const chord = Chord.get(baseSymbol);
  const root = chord.tonic;

  if (!root) return null;

  const category = getChordCategory(chord.type, chord.intervals);

  const isDominantCandidate =
    category === "dominant7" || category === "majorTriad";

  if (!isDominantCandidate) return null;

  const rootPitch = noteToPitchClass(root);

  if (rootPitch === null) return null;

  const targetPitch = (rootPitch + 5) % 12;
  const scaleNotes = Scale.get(`${key} major`).notes;

  for (let i = 0; i < scaleNotes.length; i++) {
    const targetScaleNote = scaleNotes[i];
    const degree = majorKeyDegrees[i];

    if (noteToPitchClass(targetScaleNote) !== targetPitch) continue;
    if (degree.roman === "vii°") continue;

    const appliedRoman =
      category === "dominant7" ? `V7/${degree.roman}` : `V/${degree.roman}`;

    let resolvesToNext = false;

    if (nextSymbol) {
      const nextChord = Chord.get(removeSlashBass(nextSymbol));
      const nextRoot = nextChord.tonic;

      if (nextRoot && samePitch(nextRoot, targetScaleNote)) {
        resolvesToNext = true;
      }
    }

    const resolutionText = resolvesToNext
      ? ` 실제로 다음 코드가 ${nextSymbol}라서 ${targetScaleNote} 쪽으로 해결되는 흐름이 확인된다.`
      : ` 다음에 ${targetScaleNote} 계열 코드가 나오면 해결감이 더 강해진다.`;

    return {
      key: `${key} major`,
      keyRoot: key,
      roman: appliedRoman,
      targetRoman: degree.roman,
      targetRoot: targetScaleNote,
      functionName: "세컨더리 도미넌트",
      functionDescription:
        "현재 조성 밖의 도미넌트 코드를 잠깐 빌려와 특정 다이어토닉 코드로 강하게 끌어당기는 장치.",
      scaleNotes,
      explanation: `${key} major에서 ${symbol}는 ${degree.roman} 코드로 향하는 ${appliedRoman}로 볼 수 있다.${resolutionText}`,
      resolvesToNext,
    };
  }

  return null;
}

const borrowedMajorTemplates = [
  {
    offset: 0,
    triad: "minorTriad",
    seventh: "minor7",
    roman: "i",
    roman7: "im7",
    source: "병행단조의 i",
    color: "장조의 중심을 갑자기 단조로 바꾸는 어두운 색.",
  },
  {
    offset: 1,
    triad: "majorTriad",
    seventh: "major7",
    roman: "bII",
    roman7: "bIImaj7",
    source: "네아폴리탄 / 프리지안 계열 색채",
    color: "매우 강한 이질감, 클래식하고 극적인 긴장.",
  },
  {
    offset: 2,
    triad: "diminishedTriad",
    seventh: "halfDiminished7",
    roman: "ii°",
    roman7: "iiø7",
    source: "병행단조의 ii°",
    color: "불안하고 어두운 서브도미넌트 색.",
  },
  {
    offset: 3,
    triad: "majorTriad",
    seventh: "major7",
    roman: "bIII",
    roman7: "bIIImaj7",
    source: "병행단조의 bIII",
    color: "레트로하고 영화적인 단조 쪽 밝음.",
  },
  {
    offset: 5,
    triad: "minorTriad",
    seventh: "minor7",
    roman: "iv",
    roman7: "ivm7",
    source: "병행단조의 iv",
    color: "장조 안에서 가장 대표적인 아련함, 쓸쓸함.",
  },
  {
    offset: 7,
    triad: "minorTriad",
    seventh: "minor7",
    roman: "v",
    roman7: "vm7",
    source: "병행단조의 v",
    color: "도미넌트의 힘을 빼고 어둡게 흐르는 느낌.",
  },
  {
    offset: 8,
    triad: "majorTriad",
    seventh: "major7",
    roman: "bVI",
    roman7: "bVImaj7",
    source: "병행단조의 bVI",
    color: "드라마틱하고 웅장한 영화음악식 색채.",
  },
  {
    offset: 10,
    triad: "majorTriad",
    seventh: "dominant7",
    roman: "bVII",
    roman7: "bVII7",
    source: "병행단조 / 믹솔리디안 계열 bVII",
    color: "록, 브릿팝, 모달한 개방감.",
  },
];

function getBorrowedChordRole(symbol: string, key: string) {
  const baseSymbol = removeSlashBass(symbol);
  const chord = Chord.get(baseSymbol);
  const root = chord.tonic;

  if (!root) return null;

  const category = getChordCategory(chord.type, chord.intervals);

  if (!category) return null;

  const keyPitch = noteToPitchClass(key);
  const rootPitch = noteToPitchClass(root);

  if (keyPitch === null || rootPitch === null) return null;

  const offset = ((rootPitch - keyPitch) % 12 + 12) % 12;

  for (const template of borrowedMajorTemplates) {
    if (template.offset !== offset) continue;

    const isTriadMatch = category === template.triad;
    const isSeventhMatch = category === template.seventh;

    if (!isTriadMatch && !isSeventhMatch) continue;

    const roman = isSeventhMatch ? template.roman7 : template.roman;

    return {
      key: `${key} major`,
      keyRoot: key,
      roman,
      functionName: "차용화음 / 모달 인터체인지",
      functionDescription:
        "현재 장조와 같은 으뜸음을 가진 병행단조나 인접 모드에서 코드를 빌려와 색채를 바꾸는 장치.",
      explanation: `${key} major에서 ${symbol}는 ${template.source}로 볼 수 있다. ${template.color}`,
      source: template.source,
      color: template.color,
    };
  }

  return null;
}

function getKeyRoles(symbol: string) {
  const roles = [];

  for (const key of majorKeys) {
    const role = getRoleInMajorKey(symbol, key);

    if (role) {
      roles.push(role);
    }
  }

  return roles.sort((a, b) => {
    return (romanOrder[a.roman] ?? 99) - (romanOrder[b.roman] ?? 99);
  });
}

export function parseProgression(input: string) {
  return input
    .split(/\s*-\s*|\s*,\s*|\s*\|\s*/)
    .map((symbol) => symbol.trim())
    .filter(Boolean)
    .map((symbol) => ({
      symbol,
      baseSymbol: removeSlashBass(symbol),
    }));
}

export function analyzeProgression(input: string, selectedKey: string = "auto") {
  const chords = parseProgression(input);

  const firstChord = chords[0];
  const lastChord = chords[chords.length - 1];

  const firstChordData = firstChord ? Chord.get(firstChord.baseSymbol) : null;
  const lastChordData = lastChord ? Chord.get(lastChord.baseSymbol) : null;

  const firstRoot = firstChordData?.tonic;
  const lastRoot = lastChordData?.tonic;

  const startsAndEndsOnSameRoot =
    firstRoot && lastRoot ? samePitch(firstRoot, lastRoot) : false;

  const candidateKeys = majorKeys
    .map((key) => {
      let score = 0;
      let matchedCount = 0;

      chords.forEach((chord, index) => {
        const nextChord = chords[index + 1];
        const diatonicRole = getRoleInMajorKey(chord.baseSymbol, key);

        if (diatonicRole) {
          matchedCount += 1;
          score += 10;

          if (index === 0 && diatonicRole.roman === "I") {
            score += 10;
          }

          if (index === chords.length - 1 && diatonicRole.roman === "I") {
            score += 10;
          }

          if (
            startsAndEndsOnSameRoot &&
            (diatonicRole.roman === "I" || diatonicRole.roman === "Imaj7") &&
            (index === 0 || index === chords.length - 1)
          ) {
            score += 15;
          }

          if (diatonicRole.roman === "V" || diatonicRole.roman === "V7") {
            score += 1;
          }

          return;
        }

        const secondaryRole = getSecondaryDominantRole(
          chord.baseSymbol,
          key,
          nextChord?.baseSymbol
        );

        if (secondaryRole) {
          matchedCount += 1;
          score += secondaryRole.resolvesToNext ? 8 : 4;
          return;
        }

        const borrowedRole = getBorrowedChordRole(chord.baseSymbol, key);

        if (borrowedRole) {
          matchedCount += 1;
          score += 5;
        }
      });

      return {
        keyRoot: key,
        key: `${key} major`,
        score,
        matchedCount,
      };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score);

  const resolvedKey =
    selectedKey === "auto"
      ? candidateKeys[0]?.keyRoot ?? "C"
      : selectedKey.replace(" major", "");

  const items = chords.map((chord, index) => {
    const chordData = Chord.get(chord.baseSymbol);
    const nextChord = chords[index + 1];

    if (!chordData.name && chordData.notes.length === 0) {
      return {
        index,
        symbol: chord.symbol,
        baseSymbol: chord.baseSymbol,
        notes: [],
        roman: "?",
        functionName: "해석 실패",
        functionDescription: "코드 표기법을 다시 확인해야 한다.",
        explanation: "이 코드는 아직 분석하지 못했다.",
        status: "invalid",
      };
    }

    const diatonicRole = getRoleInMajorKey(chord.baseSymbol, resolvedKey);

    if (diatonicRole) {
      return {
        index,
        symbol: chord.symbol,
        baseSymbol: chord.baseSymbol,
        notes: chordData.notes,
        roman: diatonicRole.roman,
        functionName: diatonicRole.functionName,
        functionDescription: diatonicRole.functionDescription,
        explanation: diatonicRole.explanation,
        status: "diatonic",
      };
    }

    const secondaryRole = getSecondaryDominantRole(
      chord.baseSymbol,
      resolvedKey,
      nextChord?.baseSymbol
    );

    if (secondaryRole) {
      return {
        index,
        symbol: chord.symbol,
        baseSymbol: chord.baseSymbol,
        notes: chordData.notes,
        roman: secondaryRole.roman,
        functionName: secondaryRole.functionName,
        functionDescription: secondaryRole.functionDescription,
        explanation: secondaryRole.explanation,
        status: "secondaryDominant",
      };
    }

    const borrowedRole = getBorrowedChordRole(chord.baseSymbol, resolvedKey);

    if (borrowedRole) {
      return {
        index,
        symbol: chord.symbol,
        baseSymbol: chord.baseSymbol,
        notes: chordData.notes,
        roman: borrowedRole.roman,
        functionName: borrowedRole.functionName,
        functionDescription: borrowedRole.functionDescription,
        explanation: borrowedRole.explanation,
        status: "borrowed",
      };
    }

    return {
      index,
      symbol: chord.symbol,
      baseSymbol: chord.baseSymbol,
      notes: chordData.notes,
      roman: "?",
      functionName: "비다이어토닉 / 확장 분석 필요",
      functionDescription:
        "현재 선택한 장조 안의 기본 다이어토닉 코드, 세컨더리 도미넌트, 차용화음으로는 설명되지 않는다.",
      explanation:
        "전조, 크로매틱 미디언트, 증6화음, 리하모니제이션 가능성이 있다. 다음 버전에서 더 깊게 분석할 수 있다.",
      status: "outside",
    };
  });

  return {
    raw: input,
    selectedKey: `${resolvedKey} major`,
    selectedKeyRoot: resolvedKey,
    candidateKeys,
    items,
    romanLine: items.map((item) => item.roman).join(" - "),
    chordLine: items.map((item) => item.symbol).join(" - "),
  };
}

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
          description:
            "메이저 펜타토닉. 기타 솔로에서 안전하고 멜로딕하게 쓰기 좋음.",
        },
        {
          name: `${root} minor pentatonic`,
          notes: Scale.get(`${root} minor pentatonic`).notes,
          description:
            "마이너 펜타토닉. 블루스, 록, 펑크에서 거친 색채를 만들기 좋음.",
        },
        {
          name: `${root} mixolydian`,
          notes: Scale.get(`${root} mixolydian`).notes,
          description:
            "도미넌트/블루지한 색채. 7th 코드 위에서 특히 자주 사용.",
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
    keyRoles: getKeyRoles(symbol),
  };
}