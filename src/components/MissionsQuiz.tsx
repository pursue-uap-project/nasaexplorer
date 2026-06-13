"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Question = {
  id: number;
  question_es: string;
  question_en: string;
  options_es: string[];
  options_en: string[];
  answer: number;
  explanation_es: string;
  explanation_en: string;
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    question_es: "¿Quién fue el primer astronauta estadounidense en realizar un vuelo espacial (Freedom 7)?",
    question_en: "Who was the first American astronaut to make a spaceflight (Freedom 7)?",
    options_es: ["John Glenn", "Alan Shepard", "Buzz Aldrin", "Neil Armstrong"],
    options_en: ["John Glenn", "Alan Shepard", "Buzz Aldrin", "Neil Armstrong"],
    answer: 1,
    explanation_es: "Alan Shepard pilotó el Freedom 7 el 5 de mayo de 1961, convirtiéndose en el primer estadounidense en el espacio.",
    explanation_en: "Alan Shepard piloted Freedom 7 on May 5, 1961, becoming the first American in space."
  },
  {
    id: 2,
    question_es: "¿Qué misión de la NASA es conocida como 'un fracaso exitoso' tras la explosión de un tanque de oxígeno?",
    question_en: "Which NASA mission is known as a 'successful failure' after an oxygen tank exploded?",
    options_es: ["Apolo 11", "Apolo 13", "Gemini XII", "STS-1"],
    options_en: ["Apollo 11", "Apollo 13", "Gemini XII", "STS-1"],
    answer: 1,
    explanation_es: "El Apolo 13 abortó el alunizaje pero trajo a toda la tripulación de vuelta a salvo en una hazaña de supervivencia histórica.",
    explanation_en: "Apollo 13 aborted its Moon landing but successfully returned all crew members safely in a historic survival feat."
  },
  {
    id: 3,
    question_es: "¿Cuál es el objeto fabricado por el hombre más distante de la Tierra en el espacio interestelar?",
    question_en: "What is the most distant human-made object from Earth in interstellar space?",
    options_es: ["Voyager 2", "Hubble", "New Horizons", "Voyager 1"],
    options_en: ["Voyager 2", "Hubble", "New Horizons", "Voyager 1"],
    answer: 3,
    explanation_es: "Voyager 1 fue lanzada en 1977 y cruzó al espacio interestelar en 2012. Se encuentra a más de 160 UA de distancia.",
    explanation_en: "Voyager 1 was launched in 1977 and entered interstellar space in 2012, now over 160 AU away."
  },
  {
    id: 4,
    question_es: "¿Qué telescopio espacial se lanzó el día de Navidad de 2021 para observar en el espectro infrarrojo?",
    question_en: "Which space telescope was launched on Christmas Day 2021 to observe in the infrared spectrum?",
    options_es: ["Telescopio Hubble", "Kepler", "James Webb (JWST)", "Spitzer"],
    options_en: ["Hubble Space Telescope", "Kepler", "James Webb (JWST)", "Spitzer"],
    answer: 2,
    explanation_es: "El James Webb se lanzó el 25 de diciembre de 2021 y opera en el punto de Lagrange L2 para ver el universo primitivo.",
    explanation_en: "The James Webb Space Telescope launched on December 25, 2021 and operates at the L2 Lagrange point to view the early universe."
  },
  {
    id: 5,
    question_es: "¿Cuál es el cohete de la NASA diseñado para llevar humanos de vuelta a la Luna en el programa Artemis?",
    question_en: "What is the NASA rocket designed to carry humans back to the Moon in the Artemis program?",
    options_es: ["Saturn V", "Space Launch System (SLS)", "Falcon Heavy", "Titan IIIE"],
    options_en: ["Saturn V", "Space Launch System (SLS)", "Falcon Heavy", "Titan IIIE"],
    answer: 1,
    explanation_es: "El Space Launch System (SLS) es el supercohete lanzador principal de la NASA para las misiones tripuladas Artemis.",
    explanation_en: "The Space Launch System (SLS) is NASA's premier heavy-lift rocket for the crewed Artemis Moon missions."
  }
];

export default function MissionsQuiz() {
  const t = useTranslations("quiz");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const activeQuestion = QUESTIONS[currentIdx];

  const handleOptionClick = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOpt(idx);
  };

  const handleSubmit = () => {
    if (selectedOpt === null || isSubmitted) return;
    setIsSubmitted(true);
    if (selectedOpt === activeQuestion.answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setIsSubmitted(false);
    if (currentIdx + 1 < QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsSubmitted(false);
    setScore(0);
    setShowResult(false);
  };

  // Badge assignment based on score
  const getBadge = () => {
    if (score === 5) return { name: t("badge_director"), desc: t("badge_director_desc"), icon: "🚀" };
    if (score >= 3) return { name: t("badge_specialist"), desc: t("badge_specialist_desc"), icon: "🧑‍🚀" };
    return { name: t("badge_cadet"), desc: t("badge_cadet_desc"), icon: "🛰️" };
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-[#0b1428]/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-12 -left-12 w-24 h-24 rounded-full bg-blue-500/10 blur-xl pointer-events-none" />

        {!showResult ? (
          <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-white font-bold text-lg tracking-wide">{t("quiz_title")}</h3>
                <p className="text-white/40 text-xs mt-0.5">{t("quiz_subtitle")}</p>
              </div>
              <span className="text-xs font-mono font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-blue-400">
                {currentIdx + 1} / {QUESTIONS.length}
              </span>
            </div>

            {/* Question Text */}
            <h4 className="text-white text-base font-semibold mb-6">
              {t("locale") === "es" ? activeQuestion.question_es : activeQuestion.question_en}
            </h4>

            {/* Options list */}
            <div className="space-y-3 mb-6">
              {(t("locale") === "es" ? activeQuestion.options_es : activeQuestion.options_en).map((opt, optIdx) => {
                let btnStyle = "border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-white/80";
                
                if (selectedOpt === optIdx && !isSubmitted) {
                  btnStyle = "border-blue-500 bg-blue-500/10 text-white ring-1 ring-blue-500/50";
                } else if (isSubmitted) {
                  if (optIdx === activeQuestion.answer) {
                    btnStyle = "border-emerald-500 bg-emerald-500/10 text-white ring-1 ring-emerald-500/50";
                  } else if (selectedOpt === optIdx) {
                    btnStyle = "border-red-500 bg-red-500/10 text-white/70 ring-1 ring-red-500/50";
                  } else {
                    btnStyle = "border-white/5 bg-white/[0.01] text-white/30 cursor-not-allowed";
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleOptionClick(optIdx)}
                    disabled={isSubmitted}
                    className={`w-full text-left px-5 py-4 border rounded-2xl text-sm font-medium transition-all duration-200 flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isSubmitted && optIdx === activeQuestion.answer && (
                      <span className="text-emerald-400 text-base">✓</span>
                    )}
                    {isSubmitted && selectedOpt === optIdx && optIdx !== activeQuestion.answer && (
                      <span className="text-red-400 text-base">✗</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sighting explanation */}
            {isSubmitted && (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 mb-6 animate-fade-in">
                <p className="text-white/80 text-xs leading-relaxed">
                  💡 <span className="font-semibold text-white">{t("explanation_title")}:</span>{" "}
                  {t("locale") === "es" ? activeQuestion.explanation_es : activeQuestion.explanation_en}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              {!isSubmitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={selectedOpt === null}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                    selectedOpt !== null
                      ? "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-md"
                      : "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
                  }`}
                >
                  {t("submit")}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-white text-[#040d21] hover:bg-white/90 transition-all shadow-md"
                >
                  {currentIdx + 1 === QUESTIONS.length ? t("finish") : t("next")}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Results Screen */
          <div className="text-center py-6">
            <div className="text-5xl mb-4">{getBadge().icon}</div>
            <h3 className="text-2xl font-extrabold text-white mb-2">{t("results_title")}</h3>
            <p className="text-white/50 text-sm mb-6">
              {t("results_score", { score, total: QUESTIONS.length })}
            </p>

            {/* Badge card */}
            <div className="max-w-sm mx-auto bg-white/[0.02] border border-white/10 rounded-2xl p-5 mb-8">
              <span className="text-xs uppercase font-mono tracking-widest text-blue-400 font-bold block mb-1">
                {t("badge_unlocked")}
              </span>
              <h4 className="text-white font-bold text-lg">{getBadge().name}</h4>
              <p className="text-white/40 text-xs mt-2 leading-relaxed">{getBadge().desc}</p>
            </div>

            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-xl text-sm font-bold border border-white/20 text-white hover:bg-white/[0.07] transition-all"
            >
              {t("retry")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
