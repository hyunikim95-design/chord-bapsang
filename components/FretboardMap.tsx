"use client";

import React, { useState } from "react";
import {
  CHORD_TONE_COLOR,
  DISABLED_NOTE_COLOR,
  FretRole,
  FretboardDisplayMode,
  GUIDE_TONE_COLOR,
  OPEN_TARGET_NOTE_COLOR,
  RESOLVE_NOTE_COLOR,
  ROOT_NOTE_ACTIVE_COLOR,
  ROOT_NOTE_COLOR,
  ROOT_NOTE_DARK,
  SCALE_TONE_COLOR,
  TARGET_NOTE_COLOR,
  formatNoteForKey,
  getChordRootSymbol,
  getGuitarStringNumber,
  getStringNoteAtFret,
  getTuningNotes,
  sameNotePitch,
  type InstrumentMode,
} from "../lib/guitarFretboard";

type FretboardMapProps = {
  keyRoot: string;
  currentChordSymbol: string;
  currentChordNotes: string[];
  scaleNotes: string[];
  targetNotes?: string[];
  resolveNotes?: string[];
  mode: "chord" | "solo";
  instrumentMode?: InstrumentMode;
};

type RoleStyle = React.CSSProperties;
type GetFretRole = (note: string) => FretRole;
type GetRoleStyle = (role: FretRole) => RoleStyle;
type GetRoleLabel = (role: FretRole, note: string) => string;
type GetOpenLaneStyle = (role: FretRole) => string;
type GetOpenDotStyle = (role: FretRole) => RoleStyle;
type GetOpenAriaLabel = (role: FretRole, note: string) => string;
type FretboardLabelMode = "note" | "role";
type FretboardPositionMode =
  | "all"
  | "open"
  | "low"
  | "middle"
  | "upper"
  | "high";

const displayModeLabels: Record<FretboardDisplayMode, string> = {
  all: "전체",
  scale: "스케일",
  chord: "코드톤",
  target: "타겟 노트",
  guide: "가이드톤",
};

const positionModeLabels: Record<FretboardPositionMode, string> = {
  all: "전체",
  open: "오픈",
  low: "3-5",
  middle: "5-8",
  upper: "7-10",
  high: "9-12",
};

const positionFrets: Record<FretboardPositionMode, number[]> = {
  all: Array.from({ length: 12 }, (_, index) => index + 1),
  open: [1, 2, 3, 4],
  low: [3, 4, 5],
  middle: [5, 6, 7, 8],
  upper: [7, 8, 9, 10],
  high: [9, 10, 11, 12],
};

const labelModeLabels: Record<FretboardLabelMode, string> = {
  note: "음이름",
  role: "역할",
};

function getDisplayStringIndexes(instrumentMode: InstrumentMode) {
  return getTuningNotes(instrumentMode)
    .map((_, index) => index)
    .reverse();
}

function getVisibleRole({
  role,
  note,
  displayMode,
  scaleNotes,
}: {
  role: FretRole;
  note: string;
  displayMode: FretboardDisplayMode;
  scaleNotes: string[];
}) {
  if (displayMode === "all") return role;
  if (role === "root") return role;

  if (displayMode === "target") {
    return role === "target" || role === "resolve" ? role : "inactive";
  }

  if (displayMode === "scale") {
    if (role === "target" || role === "resolve") return role;
    return scaleNotes.some((scaleNote) => sameNotePitch(scaleNote, note))
      ? "scale"
      : "inactive";
  }

  if (displayMode === "chord") {
    return role === "target" ||
      role === "resolve" ||
      role === "third" ||
      role === "seventh" ||
      role === "chord"
      ? role
      : "inactive";
  }

  if (displayMode === "guide") {
    return role === "target" ||
      role === "resolve" ||
      role === "third" ||
      role === "seventh"
      ? role
      : "inactive";
  }

  return role;
}

export function FretboardToggleBar({
  displayMode,
  onChange,
}: {
  displayMode: FretboardDisplayMode;
  onChange: (displayMode: FretboardDisplayMode) => void;
}) {
  return (
    <div className="inline-flex max-w-full flex-wrap gap-1 rounded-lg border border-blue-900/30 bg-[#02040A] p-1">
      {(Object.keys(displayModeLabels) as FretboardDisplayMode[]).map((item) => {
        const isActive = displayMode === item;

        return (
          <button
            key={item}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(item)}
            className={`rounded-md px-2.5 py-1.5 text-xs font-black transition focus:outline-none focus:ring-2 focus:ring-blue-700/70 ${
              isActive
                ? "bg-[#1E40AF] text-white shadow-sm shadow-black/30"
                : "bg-[#07111F] text-[#94A3B8] hover:bg-[#0B1730] hover:text-[#E5E7EB]"
            }`}
          >
            {displayModeLabels[item]}
          </button>
        );
      })}
    </div>
  );
}

export function FretboardPositionBar({
  positionMode,
  onChange,
}: {
  positionMode: FretboardPositionMode;
  onChange: (positionMode: FretboardPositionMode) => void;
}) {
  return (
    <div className="inline-flex max-w-full flex-wrap gap-1 rounded-lg border border-blue-900/30 bg-[#02040A] p-1">
      {(Object.keys(positionModeLabels) as FretboardPositionMode[]).map(
        (item) => {
          const isActive = positionMode === item;

          return (
            <button
              key={item}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(item)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-black transition focus:outline-none focus:ring-2 focus:ring-blue-700/70 ${
                isActive
                  ? "bg-[#0B1730] text-[#FBBF24] ring-1 ring-amber-400/30"
                  : "bg-[#07111F] text-[#94A3B8] hover:bg-[#0B1730] hover:text-[#E5E7EB]"
              }`}
            >
              {positionModeLabels[item]}
            </button>
          );
        }
      )}
    </div>
  );
}

export function FretboardLabelModeBar({
  labelMode,
  onChange,
}: {
  labelMode: FretboardLabelMode;
  onChange: (labelMode: FretboardLabelMode) => void;
}) {
  return (
    <div className="inline-flex max-w-full flex-wrap gap-1 rounded-lg border border-blue-900/30 bg-[#02040A] p-1">
      {(Object.keys(labelModeLabels) as FretboardLabelMode[]).map((item) => {
        const isActive = labelMode === item;

        return (
          <button
            key={item}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(item)}
            className={`rounded-md px-2.5 py-1.5 text-xs font-black transition focus:outline-none focus:ring-2 focus:ring-blue-700/70 ${
              isActive
                ? "bg-[#1E40AF] text-white shadow-sm shadow-black/30"
                : "bg-[#07111F] text-[#94A3B8] hover:bg-[#0B1730] hover:text-[#E5E7EB]"
            }`}
          >
            {labelModeLabels[item]}
          </button>
        );
      })}
    </div>
  );
}

export function FretboardStringLane({
  stringNote,
  stringIndex,
  keyRoot,
  getFretRole,
  getRoleLabel,
  getOpenLaneStyle,
  getOpenDotStyle,
  getOpenAriaLabel,
  instrumentMode,
}: {
  stringNote: string;
  stringIndex: number;
  keyRoot: string;
  getFretRole: GetFretRole;
  getRoleLabel: GetRoleLabel;
  getOpenLaneStyle: GetOpenLaneStyle;
  getOpenDotStyle: GetOpenDotStyle;
  getOpenAriaLabel: GetOpenAriaLabel;
  instrumentMode: InstrumentMode;
}) {
  const openNote = getStringNoteAtFret(stringIndex, 0, keyRoot, instrumentMode);
  const openRole = getFretRole(openNote);
  const ariaLabel = getOpenAriaLabel(openRole, openNote);
  const isOpenNoteFeatured = openRole !== "inactive";

  return (
    <div
      className={`flex h-10 min-w-0 items-center justify-between gap-1.5 border-r border-blue-900/40 px-1.5 text-xs font-black ${getOpenLaneStyle(
        openRole
      )}`}
      title={ariaLabel}
    >
      <span className="whitespace-nowrap">
        {getGuitarStringNumber(stringIndex, instrumentMode)} {stringNote}
      </span>
      {isOpenNoteFeatured ? (
        <span
          aria-label={ariaLabel}
          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-black leading-none ${
            openRole === "root"
              ? "shadow-[0_0_14px_rgba(245,158,11,0.34)]"
              : openRole === "target"
                ? "shadow-[0_0_14px_rgba(96,165,250,0.26)]"
                : ""
          }`}
          style={getOpenDotStyle(openRole)}
        >
          {getRoleLabel(openRole, openNote)}
        </span>
      ) : (
        <span
          aria-label={ariaLabel}
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={getOpenDotStyle(openRole)}
        />
      )}
    </div>
  );
}

export function FretGrid({
  frets,
  keyRoot,
  mode,
  getFretRole,
  getRoleStyle,
  getRoleLabel,
  getOpenLaneStyle,
  getOpenDotStyle,
  getOpenAriaLabel,
  instrumentMode,
}: {
  frets: number[];
  keyRoot: string;
  mode: "chord" | "solo";
  getFretRole: GetFretRole;
  getRoleStyle: GetRoleStyle;
  getRoleLabel: GetRoleLabel;
  getOpenLaneStyle: GetOpenLaneStyle;
  getOpenDotStyle: GetOpenDotStyle;
  getOpenAriaLabel: GetOpenAriaLabel;
  instrumentMode: InstrumentMode;
}) {
  const gridTemplateColumns = `64px repeat(${frets.length}, minmax(52px, 1fr))`;
  const tuningNotes = getTuningNotes(instrumentMode);
  const displayStringIndexes = getDisplayStringIndexes(instrumentMode);

  function getNoteDotClass(role: FretRole) {
    if (role === "root") return "h-8 w-8 text-sm";
    if (role === "target" || role === "resolve") return "h-7 w-7 text-xs";
    if (role === "third" || role === "seventh") return "h-6 w-6 text-[11px]";
    if (role === "chord") return "h-6 w-6 text-[11px]";
    if (role === "scale") return "h-5 w-5 text-[10px] opacity-80";
    return "h-0 w-0";
  }

  function getStringLineClass(stringIndex: number) {
    if (instrumentMode === "bass") {
      if (stringIndex === 0) return "h-[3px] bg-slate-200/65 shadow-[0_0_6px_rgba(226,232,240,0.22)]";
      if (stringIndex === 1) return "h-[2px] bg-slate-200/58 shadow-[0_0_5px_rgba(226,232,240,0.18)]";
      if (stringIndex === 2) return "h-[2px] bg-slate-300/48";
      return "h-px bg-slate-300/42";
    }

    if (stringIndex <= 1) return "h-[2px] bg-slate-200/58 shadow-[0_0_5px_rgba(226,232,240,0.18)]";
    if (stringIndex <= 3) return "h-px bg-slate-300/48";
    return "h-px bg-slate-300/38";
  }

  return (
    <div className="rounded-xl border border-blue-900/30 bg-gradient-to-br from-[#07111F] via-[#050B16] to-[#02040A] p-2 shadow-inner shadow-black/40">
      <div
        className="grid min-w-0 gap-0 text-center text-xs font-black text-[#64748B]"
        style={{ gridTemplateColumns }}
      >
        <span className="px-1 py-1 text-left">String</span>
        {frets.map((fret) => (
          <span
            key={`fret-label-${fret}`}
            className="border-l border-slate-500/32 py-1 text-slate-400/85"
          >
            {fret}
          </span>
        ))}
      </div>

      <div className="mt-1.5 min-w-0 overflow-hidden rounded-lg border border-blue-950/40">
        {displayStringIndexes.map((stringIndex) => {
          const stringNote = tuningNotes[stringIndex] ?? "E";

          return (
            <div
              key={`${mode}-${stringNote}-${stringIndex}`}
              className="grid min-w-0 gap-0 border-b border-blue-950/20 last:border-b-0"
              style={{ gridTemplateColumns }}
            >
              <FretboardStringLane
                stringNote={stringNote}
                stringIndex={stringIndex}
                keyRoot={keyRoot}
                getFretRole={getFretRole}
                getRoleLabel={getRoleLabel}
                getOpenLaneStyle={getOpenLaneStyle}
                getOpenDotStyle={getOpenDotStyle}
                getOpenAriaLabel={getOpenAriaLabel}
                instrumentMode={instrumentMode}
              />
              {frets.map((fret) => {
                const note = getStringNoteAtFret(
                  stringIndex,
                  fret,
                  keyRoot,
                  instrumentMode
                );
                const role = getFretRole(note);
                const style = getRoleStyle(role);
                const isInactive = role === "inactive";
                const isFirstFret = fret === frets[0];
                const isLastFret = fret === frets[frets.length - 1];

                return (
                  <div
                    key={`${stringIndex}-${fret}`}
                    className={`relative flex h-10 items-center justify-center border-l border-slate-500/28 bg-[#02040A]/25 ${
                      isFirstFret ? "border-l-2 border-l-slate-400/45" : ""
                    } ${isLastFret ? "border-r border-r-slate-500/28" : ""}`}
                    title={`${getGuitarStringNumber(
                      stringIndex,
                      instrumentMode
                    )} string ${fret} fret: ${note}`}
                  >
                    <span
                      className={`absolute inset-y-1 left-0 w-px bg-gradient-to-b from-transparent via-slate-300/42 to-transparent ${
                        isFirstFret ? "via-slate-200/55" : ""
                      }`}
                    />
                    <span
                      className={`absolute inset-x-0 top-1/2 -translate-y-1/2 ${getStringLineClass(
                        stringIndex
                      )}`}
                    />
                    {!isInactive && (
                      <span
                        className={`relative z-10 flex shrink-0 items-center justify-center rounded-full border font-black leading-none ${getNoteDotClass(
                          role
                        )}`}
                        style={style}
                      >
                        {getRoleLabel(role, note)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FretboardLegend({
  rootNote,
  targetNotes,
  resolveNotes,
  guideToneNotes,
  currentChordNotes,
  scaleNotes,
  displayMode,
}: {
  rootNote: string;
  targetNotes: string[];
  resolveNotes: string[];
  guideToneNotes: string[];
  currentChordNotes: string[];
  scaleNotes: string[];
  displayMode: FretboardDisplayMode;
}) {
  return (
    <div className="mt-4 grid min-w-0 gap-2 rounded-lg border border-blue-950/40 bg-[#02040A] p-3 text-xs font-bold text-[#94A3B8] sm:grid-cols-2 lg:grid-cols-7">
      <div className="min-w-0 break-words">
        <span className="text-[#64748B]">Root</span>{" "}
        <span className="font-black text-[#FBBF24]">{rootNote}</span>
      </div>
      <div className="min-w-0 break-words">
        <span className="text-[#64748B]">Target</span>{" "}
        <span className="font-black text-[#DBEAFE]">
          {targetNotes.length > 0 ? targetNotes.join(", ") : "-"}
        </span>
      </div>
      <div className="min-w-0 break-words">
        <span className="text-[#64748B]">Resolve</span>{" "}
        <span className="font-black text-[#A7F3D0]">
          {resolveNotes.length > 0 ? resolveNotes.join(", ") : "-"}
        </span>
      </div>
      <div className="min-w-0 break-words">
        <span className="text-[#64748B]">Guide</span>{" "}
        <span className="font-black text-[#CBD5E1]">
          {guideToneNotes.length > 0 ? guideToneNotes.join(", ") : "-"}
        </span>
      </div>
      <div className="min-w-0 break-words">
        <span className="text-[#64748B]">Chord</span>{" "}
        <span className="font-black text-[#CBD5E1]">
          {currentChordNotes.length > 0 ? currentChordNotes.join(", ") : "-"}
        </span>
      </div>
      <div className="min-w-0 break-words">
        <span className="text-[#64748B]">Scale</span>{" "}
        <span className="font-black text-[#CBD5E1]">
          {scaleNotes.length > 0 ? scaleNotes.join(", ") : "-"}
        </span>
      </div>
      <div className="min-w-0 break-words">
        <span className="text-[#64748B]">View</span>{" "}
        <span className="font-black text-[#CBD5E1]">
          {displayModeLabels[displayMode]}
        </span>
      </div>
    </div>
  );
}

export function FretboardMap({
  keyRoot,
  currentChordSymbol,
  currentChordNotes,
  scaleNotes,
  targetNotes = [],
  resolveNotes = [],
  mode,
  instrumentMode = "guitar",
}: FretboardMapProps) {
  const [displayMode, setDisplayMode] =
    useState<FretboardDisplayMode>(() => (mode === "solo" ? "target" : "all"));
  const [labelMode, setLabelMode] = useState<FretboardLabelMode>(() =>
    mode === "solo" ? "role" : "note"
  );
  const [positionMode, setPositionMode] = useState<FretboardPositionMode>(() =>
    mode === "solo" ? "middle" : "all"
  );
  const rootNote = currentChordNotes[0] ?? getChordRootSymbol(currentChordSymbol);
  const thirdNote = currentChordNotes[1];
  const fifthNote = currentChordNotes[2];
  const seventhNote = currentChordNotes[3];
  const frets = positionFrets[positionMode];
  const mapMinWidth = Math.max(
    instrumentMode === "bass" ? 320 : 360,
    64 + frets.length * 54
  );
  const guideToneNotes = [thirdNote, seventhNote].filter(Boolean);
  const displayedRootNote = formatNoteForKey(rootNote, keyRoot);
  const displayedTargetNotes = targetNotes.map((note) =>
    formatNoteForKey(note, keyRoot)
  );
  const displayedResolveNotes = resolveNotes.map((note) =>
    formatNoteForKey(note, keyRoot)
  );
  const displayedGuideToneNotes = guideToneNotes.map((note) =>
    formatNoteForKey(note, keyRoot)
  );
  const displayedChordNotes = currentChordNotes.map((note) =>
    formatNoteForKey(note, keyRoot)
  );
  const displayedScaleNotes = scaleNotes.map((note) =>
    formatNoteForKey(note, keyRoot)
  );

  function getRawFretRole(note: string): FretRole {
    if (sameNotePitch(note, rootNote)) return "root";
    if (targetNotes.some((targetNote) => sameNotePitch(note, targetNote))) {
      return "target";
    }
    if (resolveNotes.some((resolveNote) => sameNotePitch(note, resolveNote))) {
      return "resolve";
    }
    if (sameNotePitch(note, thirdNote)) return "third";
    if (sameNotePitch(note, seventhNote)) return "seventh";
    if (sameNotePitch(note, fifthNote)) return "chord";
    if (currentChordNotes.some((chordNote) => sameNotePitch(note, chordNote))) {
      return "chord";
    }
    if (scaleNotes.some((scaleNote) => sameNotePitch(note, scaleNote))) {
      return "scale";
    }
    return "inactive";
  }

  function getFretRole(note: string): FretRole {
    return getVisibleRole({
      role: getRawFretRole(note),
      note,
      displayMode,
      scaleNotes,
    });
  }

  function getRoleStyle(role: FretRole) {
    if (role === "root") {
      return {
        backgroundColor: ROOT_NOTE_COLOR,
        borderColor: "rgba(251, 191, 36, 0.58)",
        color: ROOT_NOTE_DARK,
        boxShadow: "0 0 18px rgba(245,158,11,0.28)",
      };
    }

    if (role === "target") {
      return {
        backgroundColor: TARGET_NOTE_COLOR,
        borderColor: "rgba(96, 165, 250, 0.48)",
        color: "#E5E7EB",
        boxShadow: "0 0 12px rgba(59,130,246,0.18)",
      };
    }

    if (role === "resolve") {
      return {
        backgroundColor: "rgba(16, 185, 129, 0.16)",
        borderColor: "rgba(52, 211, 153, 0.62)",
        color: "#A7F3D0",
        boxShadow: "inset 0 0 0 1px rgba(52,211,153,0.22)",
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

  function getRoleLabel(role: FretRole, note: string) {
    if (role === "inactive") return "";

    if (labelMode === "role") {
      if (role === "root") return "R";
      if (role === "target") return "T";
      if (role === "resolve") return "→";
      if (role === "third") return "3";
      if (role === "seventh") return "7";
      if (role === "chord") return sameNotePitch(note, fifthNote) ? "5" : "C";
      if (role === "scale") return "S";
    }

    return formatNoteForKey(note, keyRoot);
  }

  function getOpenLaneStyle(role: FretRole) {
    if (role === "root") {
      return "border-amber-300/60 bg-amber-500/15 text-[#FBBF24] shadow-[0_0_14px_rgba(245,158,11,0.18)]";
    }

    if (role === "target") {
      return "border-blue-300/50 bg-blue-500/20 text-[#DBEAFE] shadow-[0_0_14px_rgba(96,165,250,0.2)]";
    }

    if (role === "resolve") {
      return "border-emerald-300/50 bg-emerald-500/15 text-[#A7F3D0] shadow-[0_0_12px_rgba(16,185,129,0.16)]";
    }

    if (role === "third" || role === "seventh") {
      return "border-blue-700/45 bg-blue-900/30 text-[#CBD5E1]";
    }

    if (role === "chord") {
      return "border-slate-600/35 bg-slate-700/15 text-[#CBD5E1]";
    }

    if (role === "scale") {
      return "border-blue-950/50 bg-[#081426] text-[#94A3B8]";
    }

    return "border-blue-950/30 bg-[#02040A] text-[#64748B]";
  }

  function getOpenDotStyle(role: FretRole) {
    if (role === "root") {
      return { backgroundColor: ROOT_NOTE_ACTIVE_COLOR, color: ROOT_NOTE_DARK };
    }
    if (role === "target") {
      return { backgroundColor: OPEN_TARGET_NOTE_COLOR, color: "#02040A" };
    }
    if (role === "resolve") {
      return {
        backgroundColor: RESOLVE_NOTE_COLOR,
        color: "#022C22",
        borderColor: "rgba(52, 211, 153, 0.45)",
      };
    }
    if (role === "third" || role === "seventh") {
      return { backgroundColor: GUIDE_TONE_COLOR, color: "#E5E7EB" };
    }
    if (role === "chord") {
      return { backgroundColor: CHORD_TONE_COLOR, color: "#E5E7EB" };
    }
    if (role === "scale") {
      return { backgroundColor: SCALE_TONE_COLOR, color: "#94A3B8" };
    }
    return { backgroundColor: "#1E293B" };
  }

  function getOpenAriaLabel(role: FretRole, note: string) {
    if (role === "root") return `${note} open root`;
    if (role === "target") return `${note} open target`;
    if (role === "resolve") return `${note} open resolve candidate`;
    if (role === "third" || role === "seventh") return `${note} open guide tone`;
    if (role === "chord") return `${note} open chord tone`;
    if (role === "scale") return `${note} open scale tone`;
    return `${note} open string`;
  }

  return (
    <section className="mt-4 min-w-0 overflow-hidden rounded-lg border border-blue-900/30 bg-[#050B16] p-4 sm:p-5">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-[#64748B]">
            {instrumentMode === "bass" ? "Bass Fretboard" : "Fretboard Map"}
          </p>
          <h4 className="mt-1 max-w-full break-words text-lg font-black text-[#E5E7EB] md:text-xl">
            {instrumentMode === "bass" ? "4-string" : "6-string"} / {keyRoot} major / {currentChordSymbol}
          </h4>
          {mode === "solo" && (
            <p className="mt-1 break-words text-xs font-bold text-[#94A3B8]">
              기본은 타겟/해결음만 표시하고, 스케일 버튼을 누르면 전체 음계를 펼칩니다.
            </p>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <FretboardToggleBar
            displayMode={displayMode}
            onChange={setDisplayMode}
          />
          <FretboardLabelModeBar
            labelMode={labelMode}
            onChange={setLabelMode}
          />
          <FretboardPositionBar
            positionMode={positionMode}
            onChange={setPositionMode}
          />
          <div className="flex min-w-0 flex-wrap gap-2 text-xs font-bold">
            <span
              className="rounded-md px-2 py-1"
              style={{
                backgroundColor: ROOT_NOTE_COLOR,
                color: ROOT_NOTE_DARK,
              }}
            >
              Root
            </span>
            <span className="rounded-md bg-[#3B82F6] px-2 py-1 text-white">
              Target
            </span>
            <span className="rounded-md border border-emerald-300/40 bg-emerald-500/15 px-2 py-1 text-[#A7F3D0]">
              Resolve
            </span>
            <span className="rounded-md bg-[#1E40AF] px-2 py-1 text-white">
              3 / 7
            </span>
            <span className="rounded-md bg-[#334155] px-2 py-1 text-white">
              5
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 w-full min-w-0 overflow-x-auto pb-2 xl:overflow-x-visible">
        <div
          className="max-w-none xl:min-w-0 xl:w-full"
          style={{ minWidth: mapMinWidth }}
        >
          <FretGrid
            frets={frets}
            keyRoot={keyRoot}
            mode={mode}
            getFretRole={getFretRole}
            getRoleStyle={getRoleStyle}
            getRoleLabel={getRoleLabel}
            getOpenLaneStyle={getOpenLaneStyle}
            getOpenDotStyle={getOpenDotStyle}
            getOpenAriaLabel={getOpenAriaLabel}
            instrumentMode={instrumentMode}
          />

          {mode !== "solo" && (
            <FretboardLegend
              rootNote={displayedRootNote}
              targetNotes={displayedTargetNotes}
              resolveNotes={displayedResolveNotes}
              guideToneNotes={displayedGuideToneNotes}
              currentChordNotes={displayedChordNotes}
              scaleNotes={displayedScaleNotes}
              displayMode={displayMode}
            />
          )}
        </div>
      </div>
    </section>
  );
}
