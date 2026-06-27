"use client";

import React, { useEffect, useState } from "react";
import {
  analyzeProgression,
  getChordInfo,
  majorKeys,
} from "../lib/harmony";
import { chordDescriptions } from "../data/chordDescriptions";
import { getGuitarVoicings } from "../data/guitarVoicings";

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

function filterVoicingsByMode(voicings: any[], mode: VoicingMode) {
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

function getBestVoicingPair(currentVoicings: any[], nextVoicings: any[]) {
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

export default function Home() {
  const [input, setInput] = useState("A");
  const [showAdvanced, setShowAdvanced] = useState(true);

  const [progressionInput, setProgressionInput] = useState("A - F#m - D - E");
  const [analysisKey, setAnalysisKey] = useState("auto");

  const [practiceMode, setPracticeMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [bpm, setBpm] = useState(80);
  const [beatsPerChord, setBeatsPerChord] = useState(4);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [beatInChord, setBeatInChord] = useState(1);
  const [voicingMode, setVoicingMode] = useState<VoicingMode>("all");
  const [focusMode, setFocusMode] = useState(false);

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

  const safeBpm = Math.min(240, Math.max(30, bpm || 80));
  const safeBeatsPerChord = Math.min(16, Math.max(1, beatsPerChord || 4));
  const beatMs = (60 / safeBpm) * 1000;

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
    if (!practiceMode) {
      setPracticeMode(true);
    }

    setIsAutoPlaying((prev) => !prev);
  }
  function cycleVoicingMode() {
  setVoicingMode((prev) => {
    const currentModeIndex = voicingModeOrder.indexOf(prev);
    const nextModeIndex = (currentModeIndex + 1) % voicingModeOrder.length;

    return voicingModeOrder[nextModeIndex];
  });
}

function resetPracticePosition() {
  setCurrentIndex(0);
  setBeatInChord(1);
}

  useEffect(() => {
    setCurrentIndex(0);
    setBeatInChord(1);
    setIsAutoPlaying(false);
  }, [progressionInput, analysisKey]);

  useEffect(() => {
    if (!practiceMode) {
      setIsAutoPlaying(false);
      setBeatInChord(1);
    }
  }, [practiceMode]);

  useEffect(() => {
    if (!practiceMode || !isAutoPlaying) return;
    if (progressionAnalysis.items.length === 0) return;

    const timer = window.setInterval(() => {
      setBeatInChord((prevBeat) => {
        if (prevBeat >= safeBeatsPerChord) {
          setCurrentIndex((prevIndex) =>
            (prevIndex + 1) % progressionAnalysis.items.length
          );
          return 1;
        }

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
    safeBeatsPerChord,
    progressionAnalysis.items.length,
  ]);

  useEffect(() => {
  function handleKeyDown(event: KeyboardEvent) {
    if (!practiceMode) return;

    const target = event.target as HTMLElement | null;
    const tagName = target?.tagName?.toLowerCase();

    const isTyping =
      tagName === "input" || tagName === "textarea" || tagName === "select";

    if (isTyping) return;

    if (event.code === "Space" || event.key === "ArrowRight") {
      event.preventDefault();
      goNextChord();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrevChord();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      toggleAutoPlay();
      return;
    }

    if (event.key.toLowerCase() === "f") {
      event.preventDefault();
      setFocusMode((prev) => !prev);
      return;
    }

    if (event.key.toLowerCase() === "m") {
      event.preventDefault();
      cycleVoicingMode();
      return;
    }

    if (event.key.toLowerCase() === "r") {
      event.preventDefault();
      resetPracticePosition();
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
      return;
    }
  }

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [practiceMode, progressionAnalysis.items.length]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.28),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(37,99,235,0.22),_transparent_30%),linear-gradient(135deg,_#020617,_#0f172a_52%,_#020617)]" />

      <section className="mx-auto max-w-6xl space-y-6 p-6">
        <header className="overflow-hidden rounded-[2rem] border border-sky-400/20 bg-slate-900/70 p-7 shadow-2xl shadow-sky-950/40 backdrop-blur">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.32em] text-cyan-300">
                Harmony Training Dashboard
              </p>
              <h1 className="mt-2 text-5xl font-black tracking-tight md:text-6xl">
                코드밥상
              </h1>
              <p className="mt-3 max-w-2xl text-slate-300">
                코드와 진행을 분석하고, 기타 들고 바로 연습할 수 있게 정리하는
                화성학 트레이닝 패널.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">
                Current Mode
              </p>
              <p className="mt-1 text-2xl font-black">
                {practiceMode ? "Practice" : "Analyze"}
              </p>
            </div>
          </div>
        </header>

        <Panel>
          <SectionTitle
            eyebrow="Chord Lookup"
            title="코드 단일 분석"
            description="코드 하나를 입력하면 구성음, 도수, 조성별 역할, 관련 스케일까지 보여줌."
          />

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="A, Am, A7, Amaj7, F#m7b5..."
            className="mt-5 w-full rounded-2xl border border-sky-400/20 bg-slate-950/80 px-5 py-4 text-2xl font-bold outline-none ring-0 transition focus:border-cyan-300 focus:shadow-lg focus:shadow-cyan-950"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {["A", "Am", "A7", "Amaj7", "C", "Cmaj7", "G7", "F#m7b5"].map(
              (chord) => (
                <button
                  key={chord}
                  onClick={() => setInput(chord)}
                  className="rounded-full border border-sky-400/20 bg-slate-950/70 px-4 py-2 text-sm font-bold text-slate-200 transition hover:border-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-200"
                >
                  {chord}
                </button>
              )
            )}
          </div>
        </Panel>

        <Panel>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionTitle
              eyebrow="Progression Analyzer"
              title="코드 진행 분석기"
              description="진행을 넣으면 조성을 추정하고 로마숫자, 기능, 세컨더리 도미넌트, 차용화음까지 분석."
            />

            <button
              onClick={() => setPracticeMode(!practiceMode)}
              className="rounded-full border border-cyan-300 bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-950 transition hover:bg-cyan-300"
            >
              {practiceMode ? "연습모드 끄기" : "연습모드 켜기"}
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_220px]">
            <div>
              <label className="block text-sm font-bold text-slate-400">
                코드 진행 입력
              </label>
              <input
                value={progressionInput}
                onChange={(e) => setProgressionInput(e.target.value)}
                placeholder="A - F#m - D - E"
                className="mt-2 w-full rounded-2xl border border-sky-400/20 bg-slate-950/80 px-5 py-4 text-xl font-bold outline-none transition focus:border-cyan-300 focus:shadow-lg focus:shadow-cyan-950"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-400">
                분석 기준 조성
              </label>
              <select
                value={analysisKey}
                onChange={(e) => setAnalysisKey(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-sky-400/20 bg-slate-950/80 px-5 py-4 text-xl font-bold outline-none transition focus:border-cyan-300"
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

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Info title="추정/선택 조성" value={progressionAnalysis.selectedKey} />
            <Info title="코드 진행" value={progressionAnalysis.chordLine || "-"} />
            <Info title="로마숫자" value={progressionAnalysis.romanLine || "-"} />
          </div>

          <section className="mt-5 rounded-3xl border border-sky-400/20 bg-slate-950/70 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <SectionTitle
                eyebrow="Practice Control"
                title="연습모드 설정"
                description="BPM, 박자, 보이싱 모드를 설정하고 자동으로 넘기면서 연습."
              />

              <button
                onClick={toggleAutoPlay}
                className="rounded-full bg-blue-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-950 transition hover:bg-blue-400"
              >
                {isAutoPlaying ? "자동재생 일시정지" : "자동재생 시작"}
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-4">
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
                  className="mt-2 w-full rounded-2xl border border-sky-400/20 bg-slate-900/80 px-5 py-4 text-xl font-black outline-none transition focus:border-cyan-300"
                >
                  <option value="all">전체</option>
                  <option value="easy">쉬운 보이싱</option>
                  <option value="open">오픈코드</option>
                  <option value="barre">바레코드</option>
                  <option value="upper">상단현/커팅</option>
                  <option value="neo">네오소울/색채</option>
                </select>
              </div>

              <div className="rounded-2xl border border-sky-400/20 bg-slate-900/80 p-4">
                <p className="text-sm font-bold text-slate-400">현재 설정</p>
                <p className="mt-1 text-xl font-black text-cyan-200">
                  {safeBpm} BPM / {safeBeatsPerChord}박
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {voicingModeLabels[voicingMode]}
                </p>
              </div>
            </div>
          </section>

          {practiceMode && currentPracticeItem && (
            <PracticePanel
              currentPracticeItem={currentPracticeItem}
              nextPracticeItem={nextPracticeItem}
              currentIndex={currentIndex}
              totalCount={progressionAnalysis.items.length}
              selectedKey={progressionAnalysis.selectedKey}
              beatInChord={beatInChord}
              safeBeatsPerChord={safeBeatsPerChord}
              isAutoPlaying={isAutoPlaying}
              currentVoicings={currentVoicings}
              nextVoicings={nextVoicings}
              voicingModeLabel={voicingModeLabels[voicingMode]}
              bestVoicingPair={bestVoicingPair}
              focusMode={focusMode}
              onToggleFocusMode={() => setFocusMode((prev) => !prev)}
              onPrev={goPrevChord}
              onNext={goNextChord}
              onTogglePlay={toggleAutoPlay}
              onClose={() => {
                setPracticeMode(false);
                setIsAutoPlaying(false);
              }}
            />
          )}

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
    <section className="rounded-[2rem] border border-sky-400/20 bg-slate-900/70 p-6 shadow-xl shadow-sky-950/30 backdrop-blur">
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
      <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-3xl font-black tracking-tight">{title}</h2>
      <p className="mt-2 text-slate-400">{description}</p>
    </div>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-sky-400/20 bg-slate-950/70 p-4">
      <p className="text-sm font-bold text-slate-500">{title}</p>
      <p className="mt-1 text-lg font-black text-slate-100">{value || "-"}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-cyan-300/60 bg-cyan-400/10 px-3 py-1 text-sm font-black text-cyan-200">
      {children}
    </span>
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
        className="mt-2 w-full rounded-2xl border border-sky-400/20 bg-slate-900/80 px-5 py-4 text-xl font-black outline-none transition focus:border-cyan-300"
      />
    </div>
  );
}

function PracticePanel({
  currentPracticeItem,
  nextPracticeItem,
  currentIndex,
  totalCount,
  selectedKey,
  beatInChord,
  safeBeatsPerChord,
  isAutoPlaying,
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
  currentPracticeItem: any;
  nextPracticeItem: any;
  currentIndex: number;
  totalCount: number;
  selectedKey: string;
  beatInChord: number;
  safeBeatsPerChord: number;
  isAutoPlaying: boolean;
  currentVoicings: any[];
  nextVoicings: any[];
  voicingModeLabel: string;
  bestVoicingPair: any;
  focusMode: boolean;
  onToggleFocusMode: () => void;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onClose: () => void;
}) {
    if (focusMode) {
    return (
      <section className="mt-5 overflow-hidden rounded-[2rem] border border-cyan-300/50 bg-gradient-to-br from-cyan-400 via-blue-600 to-slate-950 p-1 shadow-2xl shadow-blue-950">
        <div className="rounded-[1.8rem] bg-slate-950/90 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-200">
                Focus Practice Mode
              </p>
              <h2 className="text-6xl font-black tracking-tight text-white md:text-8xl">
                {currentPracticeItem.symbol}
              </h2>
              <p className="mt-2 text-xl font-black text-cyan-200">
                {currentPracticeItem.roman} / {selectedKey}
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-300/20 bg-slate-950/80 p-4 text-left md:text-right">
              <p className="text-sm font-bold text-slate-400">박자</p>
              <p className="text-4xl font-black text-cyan-100">
                {beatInChord} / {safeBeatsPerChord}
              </p>
              <p className="mt-1 text-sm font-black text-cyan-200">
                {isAutoPlaying ? "재생 중" : "정지"}
              </p>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            {Array.from({ length: safeBeatsPerChord }).map((_, index) => (
              <div
                key={index}
                className={`h-5 flex-1 rounded-full transition ${
                  index + 1 <= beatInChord ? "bg-cyan-300" : "bg-slate-700"
                }`}
              />
            ))}
          </div>

          {bestVoicingPair ? (
            <section className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div className="rounded-3xl border border-cyan-300/20 bg-slate-950/80 p-5">
                <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-300">
                  지금 잡을 코드
                </p>
                <h3 className="mt-2 text-3xl font-black text-white">
                  {currentPracticeItem.symbol}
                </h3>
                <p className="mt-1 text-lg font-bold text-slate-300">
                  {bestVoicingPair.currentVoicing.name}
                </p>
                <p className="mt-3 font-mono text-6xl font-black text-cyan-200">
                  {bestVoicingPair.currentVoicing.frets}
                </p>
                {bestVoicingPair.currentVoicing.fingering && (
                  <p className="mt-2 font-mono text-lg text-slate-500">
                    {bestVoicingPair.currentVoicing.fingering}
                  </p>
                )}
              </div>

              <div className="text-center text-5xl font-black text-cyan-200">
                →
              </div>

              <div className="rounded-3xl border border-cyan-300/20 bg-slate-950/80 p-5">
                <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-300">
                  다음 잡을 코드
                </p>
                <h3 className="mt-2 text-3xl font-black text-white">
                  {nextPracticeItem?.symbol ?? "-"}
                </h3>
                <p className="mt-1 text-lg font-bold text-slate-300">
                  {bestVoicingPair.nextVoicing.name}
                </p>
                <p className="mt-3 font-mono text-6xl font-black text-cyan-200">
                  {bestVoicingPair.nextVoicing.frets}
                </p>
                {bestVoicingPair.nextVoicing.fingering && (
                  <p className="mt-2 font-mono text-lg text-slate-500">
                    {bestVoicingPair.nextVoicing.fingering}
                  </p>
                )}
              </div>
            </section>
          ) : (
            <section className="mt-6 rounded-3xl border border-cyan-300/20 bg-slate-950/80 p-5">
              <p className="text-xl font-black text-white">
                이 보이싱 모드에서는 추천 연결을 만들 수 없음.
              </p>
              <p className="mt-2 text-slate-400">
                보이싱 모드를 전체, 바레코드, 상단현/커팅 등으로 바꿔봐.
              </p>
            </section>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <ControlButton onClick={onPrev}>← 이전</ControlButton>
            <ControlButton onClick={onNext}>다음 →</ControlButton>
            <ControlButton onClick={onTogglePlay}>
              {isAutoPlaying ? "일시정지" : "재생"}
            </ControlButton>

            <button
              onClick={onToggleFocusMode}
              className="rounded-full border border-cyan-200/60 px-6 py-3 font-black text-cyan-100 transition hover:bg-cyan-200 hover:text-slate-950"
            >
              일반모드
            </button>

            <button
              onClick={onClose}
              className="rounded-full border border-cyan-200/60 px-6 py-3 font-black text-cyan-100 transition hover:bg-cyan-200 hover:text-slate-950"
            >
              종료
            </button>
          </div>

          <p className="mt-4 text-sm font-bold text-cyan-100/80">
            단축키: Enter 재생 / Space·→ 다음 / ← 이전 / F 집중모드 / M 보이싱 변경 / R 리셋 / 1~6 보이싱 선택 / Esc 종료
          </p>
        </div>
      </section>
    );
  }
  return (
    <section className="mt-5 overflow-hidden rounded-[2rem] border border-cyan-300/40 bg-gradient-to-br from-sky-500 via-blue-600 to-slate-950 p-1 shadow-2xl shadow-blue-950">
      <div className="rounded-[1.8rem] bg-slate-950/80 p-6 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-200">
              Guitar Practice Mode
            </p>
            <h2 className="text-6xl font-black tracking-tight text-white md:text-8xl">
              {currentPracticeItem.symbol}
            </h2>
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm font-black text-cyan-200">
              {currentIndex + 1} / {totalCount}
            </p>
            <p className="text-4xl font-black text-cyan-100">
              {currentPracticeItem.roman}
            </p>
            <p className="font-bold text-slate-300">{selectedKey}</p>
            <p className="mt-1 text-sm font-black text-cyan-200">
              보이싱 모드: {voicingModeLabel}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-slate-950/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-400">박자</p>
              <p className="text-3xl font-black text-cyan-100">
                {beatInChord} / {safeBeatsPerChord}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-bold text-slate-400">자동재생</p>
              <p className="text-xl font-black text-white">
                {isAutoPlaying ? "재생 중" : "정지"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            {Array.from({ length: safeBeatsPerChord }).map((_, index) => (
              <div
                key={index}
                className={`h-4 flex-1 rounded-full transition ${
                  index + 1 <= beatInChord ? "bg-cyan-300" : "bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <PracticeMiniCard
            title="기능"
            value={currentPracticeItem.functionName}
          />
          <PracticeMiniCard
            title="구성음"
            value={
              currentPracticeItem.notes.length > 0
                ? currentPracticeItem.notes.join(", ")
                : "-"
            }
          />
          <PracticeMiniCard
            title="다음 코드"
            value={nextPracticeItem?.symbol ?? "-"}
          />
        </div>

        {bestVoicingPair && (
          <section className="mt-6 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-200">
                  Recommended Move
                </p>
                <h3 className="mt-1 text-2xl font-black text-white">
                  최소 이동 추천 연결
                </h3>
              </div>

              <span className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950">
                {getMovementLabel(bestVoicingPair.distance)}
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div className="rounded-2xl border border-sky-400/20 bg-slate-950/80 p-4">
                <p className="text-sm font-bold text-slate-400">
                  현재 코드 추천
                </p>
                <p className="mt-1 text-lg font-black text-white">
                  {bestVoicingPair.currentVoicing.name}
                </p>
                <p className="mt-2 font-mono text-4xl font-black text-cyan-200">
                  {bestVoicingPair.currentVoicing.frets}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {bestVoicingPair.currentVoicing.note}
                </p>
              </div>

              <div className="text-center text-3xl font-black text-cyan-200">
                →
              </div>

              <div className="rounded-2xl border border-sky-400/20 bg-slate-950/80 p-4">
                <p className="text-sm font-bold text-slate-400">
                  다음 코드 추천
                </p>
                <p className="mt-1 text-lg font-black text-white">
                  {bestVoicingPair.nextVoicing.name}
                </p>
                <p className="mt-2 font-mono text-4xl font-black text-cyan-200">
                  {bestVoicingPair.nextVoicing.frets}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {bestVoicingPair.nextVoicing.note}
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm font-bold text-slate-400">
              이동량 점수: {bestVoicingPair.distance} / 낮을수록 손 이동이 적음
            </p>
          </section>
        )}

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <VoicingBox
            title="현재 코드 보이싱"
            symbol={currentPracticeItem.symbol}
            voicings={currentVoicings}
            limit={3}
          />

          <VoicingBox
            title="다음 코드 미리보기"
            symbol={nextPracticeItem?.symbol ?? "-"}
            voicings={nextVoicings}
            limit={2}
          />
        </section>

        <p className="mt-5 text-lg font-bold leading-7 text-slate-200">
          {currentPracticeItem.functionDescription}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <ControlButton onClick={onPrev}>← 이전</ControlButton>
          <ControlButton onClick={onNext}>다음 →</ControlButton>
          <ControlButton onClick={onTogglePlay}>
            {isAutoPlaying ? "일시정지" : "재생"}
          </ControlButton>
          <button
  onClick={onToggleFocusMode}
  className="rounded-full border border-cyan-200/60 px-6 py-3 font-black text-cyan-100 transition hover:bg-cyan-200 hover:text-slate-950"
>
  집중모드
</button>
          <button
            onClick={onClose}
            className="rounded-full border border-cyan-200/60 px-6 py-3 font-black text-cyan-100 transition hover:bg-cyan-200 hover:text-slate-950"
          >
            종료
          </button>
        </div>

        <p className="mt-4 text-sm font-bold text-cyan-100/80">
          단축키: Enter 재생 / Space·→ 다음 / ← 이전 / F 집중모드 / M 보이싱 변경 / R 리셋 / 1~6 보이싱 선택 / Esc 종료
        </p>
      </div>
    </section>
  );
}

function PracticeMiniCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-cyan-300/20 bg-slate-950/80 p-4">
      <p className="text-sm font-bold text-slate-400">{title}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function VoicingBox({
  title,
  symbol,
  voicings,
  limit,
}: {
  title: string;
  symbol: string;
  voicings: any[];
  limit: number;
}) {
  return (
    <div className="rounded-2xl border border-cyan-300/20 bg-slate-950/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-400">{title}</p>
          <h3 className="text-2xl font-black text-white">{symbol}</h3>
        </div>

        <span className="rounded-full bg-cyan-300 px-3 py-1 text-sm font-black text-slate-950">
          {voicings.length}개
        </span>
      </div>

      {voicings.length > 0 ? (
        <div className="mt-4 space-y-3">
          {voicings.slice(0, limit).map((voicing) => (
            <div
              key={`${voicing.name}-${voicing.frets}`}
              className="rounded-xl border border-sky-400/20 bg-slate-900/90 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-black text-slate-100">{voicing.name}</p>
                <span className="rounded-full border border-sky-300/30 px-2 py-1 text-xs font-bold text-slate-300">
                  {voicing.difficulty}
                </span>
              </div>

              <p className="mt-2 font-mono text-3xl font-black text-cyan-200">
                {voicing.frets}
              </p>

              {voicing.fingering && (
                <p className="mt-1 font-mono text-sm text-slate-500">
                  {voicing.fingering}
                </p>
              )}

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {voicing.note}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-slate-400">아직 등록된 기타 보이싱이 없음.</p>
      )}
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
      className="rounded-full bg-cyan-300 px-6 py-3 font-black text-slate-950 shadow-lg shadow-cyan-950 transition hover:bg-cyan-200"
    >
      {children}
    </button>
  );
}