import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "@docusaurus/Link";

export type DeepDive = {
  title: string;
  kicker: string;
  content: React.ReactNode;
  source?: [string, string];
};

export type LessonSlide<P extends string> = {
  phase: P;
  eyebrow: string;
  content: React.ReactNode;
  /** Design principle introduced on this slide, tracked in the rail. */
  principle?: number;
};

export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export function LectureScene({
  number,
  title,
  intro,
  points,
  takeaway,
  children,
  principle,
  wide = false,
}: {
  number: string;
  title: React.ReactNode;
  intro: string;
  points: string[];
  takeaway: string;
  children: React.ReactNode;
  principle?: number;
  wide?: boolean;
}) {
  return (
    <div className={`lecture-scene ${wide ? "is-wide" : ""}`}>
      <header className="lecture-heading">
        <span className="lesson-index">{number}</span>
        <div>
          {principle !== undefined && (
            <span className="lesson-principle-badge">Design principle {ROMAN[principle - 1]}</span>
          )}
          <h2>{title}</h2>
          <p>{intro}</p>
        </div>
      </header>
      <div className="lecture-body">
        <div className="lecture-visual">{children}</div>
        <aside className="lecture-notes">
          <span className="lesson-label">What to understand</span>
          <ul>
            {points.map((point) => <li key={point}>{point}</li>)}
          </ul>
          <div><span>Key idea</span><strong>{takeaway}</strong></div>
        </aside>
      </div>
    </div>
  );
}

export default function LessonPlayer<P extends string>({
  ariaLabel,
  course,
  railTitle,
  phaseLabels,
  buildSlides,
  deepDives,
  railActions = [],
  nextLesson,
}: {
  ariaLabel: string;
  course: string;
  railTitle: React.ReactNode;
  phaseLabels: Record<P, string>;
  buildSlides: (openDetail: (id: string) => void) => LessonSlide<P>[];
  deepDives: Record<string, DeepDive>;
  railActions?: { label: string; detail: string }[];
  nextLesson?: { label: string; to: string };
}) {
  const [current, setCurrent] = useState(0);
  const [detail, setDetail] = useState<string | null>(null);
  const [isPresenting, setIsPresenting] = useState(false);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const deckRef = useRef<HTMLElement>(null);

  const slides = useMemo(() => buildSlides(setDetail), [buildSlides]);
  const active = slides[current];
  const firstByPhase = useMemo(() => {
    const map = {} as Record<P, number>;
    slides.forEach((slide, index) => { if (map[slide.phase] === undefined) map[slide.phase] = index; });
    return map;
  }, [slides]);
  const principles = useMemo(
    () => slides.flatMap((slide, index) => (slide.principle ? [{ number: slide.principle, index }] : []))
      .sort((a, b) => a.number - b.number),
    [slides],
  );

  const show = (index: number) => setCurrent(Math.max(0, Math.min(slides.length - 1, index)));

  useEffect(() => {
    setVisited((previous) => (previous.has(current) ? previous : new Set(previous).add(current)));
  }, [current]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (detail) { if (event.key === "Escape") setDetail(null); return; }
      if (event.key === "Escape" && isPresenting) {
        if (document.fullscreenElement) void document.exitFullscreen?.();
        setIsPresenting(false);
        return;
      }
      // Sliders and text fields inside a scene keep their own arrow-key behaviour.
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select")) return;
      if (["ArrowRight", "PageDown"].includes(event.key) || (event.key === " " && event.target === document.body)) {
        event.preventDefault(); show(current + 1);
      }
      if (["ArrowLeft", "PageUp"].includes(event.key)) { event.preventDefault(); show(current - 1); }
      if (event.key === "Home") show(0);
      if (event.key === "End") show(slides.length - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, detail, isPresenting, slides.length]);

  useEffect(() => {
    const syncPresentationMode = () => setIsPresenting(document.fullscreenElement === deckRef.current);
    document.addEventListener("fullscreenchange", syncPresentationMode);
    return () => document.removeEventListener("fullscreenchange", syncPresentationMode);
  }, []);

  useEffect(() => {
    deckRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [current]);

  useEffect(() => {
    if (!detail) return;
    const previous = document.activeElement as HTMLElement | null;
    document.querySelector<HTMLButtonElement>(".lesson-modal-close")?.focus();
    return () => previous?.focus();
  }, [detail]);

  const modal = detail ? deepDives[detail] : null;
  const togglePresentation = async () => {
    if (isPresenting) {
      if (document.fullscreenElement) {
        try { await document.exitFullscreen?.(); } catch { /* state still exits below */ }
      }
      setIsPresenting(false);
      return;
    }
    setIsPresenting(true);
    try {
      await deckRef.current?.requestFullscreen?.();
    } catch {
      // The expanded player still works when native fullscreen is unavailable.
    }
  };

  return (
    <section className={`lesson-shell ${isPresenting ? "is-presenting" : ""}`} ref={deckRef} aria-label={ariaLabel}>
      <aside className="lesson-rail">
        <Link to="/ai-fundamentals" className="lesson-rail-back">← Course index</Link>
        <div className="lesson-rail-title"><span>{course}</span><strong>{railTitle}</strong></div>
        <nav aria-label="Lesson chapters">
          {(Object.keys(phaseLabels) as P[]).map((phase) => (
            <button key={phase} aria-label={phaseLabels[phase]} aria-current={active.phase === phase ? "step" : undefined} onClick={() => show(firstByPhase[phase])}><span>{String(firstByPhase[phase] + 1).padStart(2, "0")}</span>{phaseLabels[phase]}</button>
          ))}
        </nav>
        {principles.length > 0 && (
          <div className="lesson-rail-principles">
            <span>Design principles · {principles.filter((p) => visited.has(p.index)).length}/{principles.length}</span>
            <div>
              {principles.map(({ number, index }) => (
                <button
                  key={number}
                  className={`${visited.has(index) ? "is-found" : ""} ${current === index ? "is-current" : ""}`}
                  onClick={() => show(index)}
                  aria-label={`Go to design principle ${ROMAN[number - 1]}`}
                  title={`Principle ${ROMAN[number - 1]}`}
                >
                  {ROMAN[number - 1]}
                </button>
              ))}
            </div>
          </div>
        )}
        {railActions.length > 0 && (
          <div className="lesson-rail-actions">
            {railActions.map((action) => (
              <button key={action.detail} onClick={() => setDetail(action.detail)}>{action.label} <span aria-hidden="true">↗</span></button>
            ))}
          </div>
        )}
        <div className="lesson-rail-footer"><span>Scene</span><strong>{String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</strong><small>← → to navigate</small></div>
      </aside>

      <div className="lesson-player">
        <div className="lesson-stage" key={current}>
          <div className="lesson-stage-meta"><span>{active.eyebrow}</span><span>{String(current + 1).padStart(2, "0")} / {slides.length}</span></div>
          <div className="lesson-stage-content">{active.content}</div>
        </div>

        <div className="lesson-controls">
          <button onClick={() => show(current - 1)} disabled={current === 0} aria-label="Previous slide">←</button>
          <div className="lesson-progress" aria-label={`${current + 1} of ${slides.length} slides`}><i style={{ width: `${((current + 1) / slides.length) * 100}%` }} /></div>
          {nextLesson && current === slides.length - 1
            ? <Link className="lesson-next-lesson" to={nextLesson.to}>{nextLesson.label} <span aria-hidden="true">→</span></Link>
            : <button onClick={() => show(current + 1)} disabled={current === slides.length - 1} aria-label="Next slide">→</button>}
          <button className="lesson-fullscreen" onClick={togglePresentation} aria-label={isPresenting ? "Exit presentation" : "Enter presentation"} aria-pressed={isPresenting}>
            {isPresenting ? "×" : "↗"} <span>{isPresenting ? "Exit presentation" : "Present"}</span>
          </button>
        </div>
      </div>

      {modal && (
        <div className="lesson-modal" role="dialog" aria-modal="true" aria-labelledby="lesson-modal-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetail(null); }}>
          <div className="lesson-modal-panel">
            <button className="lesson-modal-close" onClick={() => setDetail(null)} aria-label="Close deep dive">×</button>
            <span className="lesson-label">{modal.kicker}</span>
            <h2 id="lesson-modal-title">{modal.title}</h2>
            <div className="lesson-modal-content">{modal.content}</div>
            {modal.source && <a className="lesson-source" href={modal.source[1]} target="_blank" rel="noreferrer">{modal.source[0]} <span>↗</span></a>}
          </div>
        </div>
      )}
    </section>
  );
}
