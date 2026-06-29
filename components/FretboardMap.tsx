"use client";

import React, { useState } from "react";
import {
  CHORD_TONE_COLOR,
  DISABLED_NOTE_COLOR,
  FretRole,
  FretboardDisplayMode,
  GUIDE_TONE_COLOR,
  OPEN_TARGET_NOTE_COLOR,
  ROOT_NOTE_ACTIVE_COLOR,
  ROOT_NOTE_COLOR,
  ROOT_NOTE_DARK,
  SCALE_TONE_COLOR,
  TARGET_NOTE_COLOR,
  formatNoteForKey,
  getChordRootSymbol,
  getGuitarStringNumber,
  getStringNoteAtFret,
  sameNotePitch,
  standardTuningNotes,
} from "../lib/guitarFretboard";

type FretboardMapProps = {
  keyRoot: string;
  currentChordSymbol: string;
  currentChordNotes: string[];
  scaleNotes: string[];
  targetNotes?: string[];
  mode: "chord" | "solo";
};

type RoleStyle = React.CSSProperties;
type GetFretRole = (note: string) => FretRole;
type GetRoleStyle = (role: FretRole) => RoleStyle;
type GetRoleLabel = (role: FretRole, note: string) => string;
type GetOpenLaneStyle = (role: FretRole) => string;
type GetOpenDotStyle = (role: FretRole) => RoleStyle;
type GetOpenAriaLabel = (role: FretRole, note: string) => string;

const displayModeLabels: Record<FretboardDisplayMode, string> = {
  all: "전체",
  scale: "스케일",
  chord: "코드톤",
  target: "타겟 노트",
  guide: "가이드톤",
};

function getVisibleRole(role: FretRole, displayMode: FretboardDisplayMode) {
  if (displayMode === "all") return role;
  if (role === "root") return role;

  if (displayMode === "target") {
    return role === "target" ? role : "inactive";
  }

  if (displayMode === "scale") {
    return role === "target" || role === "scale" ? role : "inactive";
  }

  if (displayMode === "chord") {
    return role === "target" ||
      role === "third" ||
      role === "seventh" ||
      role === "chord"
      ? role
      : "inactive";
  }

  if (displayMode === "guide") {
    return role === "target" || role === "third" || role === "seventh"
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

export function FretboardStringLane({
  stringNote,
  stringIndex,
  keyRoot,
  getFretRole,
  getOpenLaneStyle,
  getOpenDotStyle,
  getOpenAriaLabel,
}: {
  stringNote: string;
  stringIndex: number;
  keyRoot: string;
  getFretRole: GetFretRole;
  getOpenLaneStyle: GetOpenLaneStyle;
  getOpenDotStyle: GetOpenDotStyle;
  getOpenAriaLabel: GetOpenAriaLabel;
}) {
  const openNote = getStringNoteAtFret(stringIndex, 0, keyRoot);
  const openRole = getFretRole(openNote);
  const ariaLabel = getOpenAriaLabel(openRole, openNote);

  return (
    <div
      className={`flex h-8 min-w-0 items-center justify-between gap-1.5 rounded-md border px-1.5 text-xs font-black ${getOpenLaneStyle(
        openRole
      )}`}
      title={ariaLabel}
    >
      <span className="whitespace-nowrap">
        {getGuitarStringNumber(stringIndex)} {stringNote}
      </span>
      <span
        aria-label={ariaLabel}
        className={`shrink-0 rounded-full ${
          openRole === "root"
            ? "h-3.5 w-3.5 shadow-[0_0_14px_rgba(245,158,11,0.34)]"
            : openRole === "target"
              ? "h-3.5 w-3.5 shadow-[0_0_14px_rgba(96,165,250,0.26)]"
              : "h-2.5 w-2.5"
        }`}
        style={getOpenDotStyle(openRole)}
      />
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
}) {
  return (
    <>
      <div className="grid min-w-0 grid-cols-[64px_repeat(12,_minmax(44px,_1fr))] gap-1.5 text-center text-xs font-black text-[#64748B]">
        <span />
        {frets.map((fret) => (
          <span
            key={`fret-label-${fret}`}
            className="rounded-md border border-blue-950/35 bg-[#07111F] py-1.5"
          >
            {fret}
          </span>
        ))}
      </div>

      <div className="mt-1.5 min-w-0 space-y-1.5">
        {standardTuningNotes.map((stringNote, stringIndex) => (
          <div
            key={`${mode}-${stringNote}-${stringIndex}`}
            className="grid min-w-0 grid-cols-[64px_repeat(12,_minmax(44px,_1fr))] gap-1.5"
          >
            <FretboardStringLane
              stringNote={stringNote}
              stringIndex={stringIndex}
              keyRoot={keyRoot}
              getFretRole={getFretRole}
              getOpenLaneStyle={getOpenLaneStyle}
              getOpenDotStyle={getOpenDotStyle}
              getOpenAriaLabel={getOpenAriaLabel}
            />
            {frets.map((fret) => {
              const note = getStringNoteAtFret(stringIndex, fret, keyRoot);
              const role = getFretRole(note);
              const style = getRoleStyle(role);

              return (
                <div
                  key={`${stringIndex}-${fret}`}
                  className="flex h-8 items-center justify-center rounded-md border text-xs font-black"
                  style={style}
                  title={`${getGuitarStringNumber(
                    stringIndex
                  )} string ${fret} fret: ${note}`}
                >
                  <span className="leading-none">
                    {getRoleLabel(role, note)}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

export function FretboardLegend({
  rootNote,
  targetNotes,
  guideToneNotes,
  currentChordNotes,
  displayMode,
}: {
  rootNote: string;
  targetNotes: string[];
  guideToneNotes: string[];
  currentChordNotes: string[];
  displayMode: FretboardDisplayMode;
}) {
  return (
    <div className="mt-4 grid min-w-0 gap-2 rounded-lg border border-blue-950/40 bg-[#02040A] p-3 text-xs font-bold text-[#94A3B8] sm:grid-cols-2 lg:grid-cols-5">
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
  mode,
}: FretboardMapProps) {
  const [displayMode, setDisplayMode] =
    useState<FretboardDisplayMode>("all");
  const rootNote = currentChordNotes[0] ?? getChordRootSymbol(currentChordSymbol);
  const thirdNote = currentChordNotes[1];
  const fifthNote = currentChordNotes[2];
  const seventhNote = currentChordNotes[3];
  const frets = Array.from({ length: 12 }, (_, index) => index + 1);
  const guideToneNotes = [thirdNote, seventhNote].filter(Boolean);
  const displayedRootNote = formatNoteForKey(rootNote, keyRoot);
  const displayedTargetNotes = targetNotes.map((note) =>
    formatNoteForKey(note, keyRoot)
  );
  const displayedGuideToneNotes = guideToneNotes.map((note) =>
    formatNoteForKey(note, keyRoot)
  );
  const displayedChordNotes = currentChordNotes.map((note) =>
    formatNoteForKey(note, keyRoot)
  );

  function getRawFretRole(note: string): FretRole {
    if (sameNotePitch(note, rootNote)) return "root";
    if (targetNotes.some((targetNote) => sameNotePitch(note, targetNote))) {
      return "target";
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
    return getVisibleRole(getRawFretRole(note), displayMode);
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
    if (role === "root") return "R";
    if (role === "target") return "T";
    if (role === "third") return "3";
    if (role === "chord" && sameNotePitch(note, fifthNote)) return "5";
    if (role === "seventh") return "7";
    if (role === "chord") return "•";
    return "";
  }

  function getOpenLaneStyle(role: FretRole) {
    if (role === "root") {
      return "border-amber-300/60 bg-amber-500/15 text-[#FBBF24] shadow-[0_0_14px_rgba(245,158,11,0.18)]";
    }

    if (role === "target") {
      return "border-blue-300/50 bg-blue-500/20 text-[#DBEAFE] shadow-[0_0_14px_rgba(96,165,250,0.2)]";
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
    if (role === "root") return { backgroundColor: ROOT_NOTE_ACTIVE_COLOR };
    if (role === "target") return { backgroundColor: OPEN_TARGET_NOTE_COLOR };
    if (role === "third" || role === "seventh") {
      return { backgroundColor: GUIDE_TONE_COLOR };
    }
    if (role === "chord") return { backgroundColor: CHORD_TONE_COLOR };
    if (role === "scale") return { backgroundColor: SCALE_TONE_COLOR };
    return { backgroundColor: "#1E293B" };
  }

  function getOpenAriaLabel(role: FretRole, note: string) {
    if (role === "root") return `${note} open root`;
    if (role === "target") return `${note} open target`;
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
            Fretboard Map
          </p>
          <h4 className="mt-1 max-w-full break-words text-lg font-black text-[#E5E7EB] md:text-xl">
            {keyRoot} major / {currentChordSymbol}
          </h4>
        </div>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <FretboardToggleBar
            displayMode={displayMode}
            onChange={setDisplayMode}
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
        <div className="min-w-[720px] max-w-none xl:min-w-0 xl:w-full">
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
          />

          <FretboardLegend
            rootNote={displayedRootNote}
            targetNotes={displayedTargetNotes}
            guideToneNotes={displayedGuideToneNotes}
            currentChordNotes={displayedChordNotes}
            displayMode={displayMode}
          />
        </div>
      </div>
    </section>
  );
}
