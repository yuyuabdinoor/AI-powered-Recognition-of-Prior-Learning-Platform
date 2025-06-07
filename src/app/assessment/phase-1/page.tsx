/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  ArrowRight,
  UserCircle as LoaderCircle,
  CheckCircle,
} from "lucide-react";

interface Question {
  question: string;
  competencyId: string;
}

const NITA_FIELDS = [
  "Tailoring and Dressmaking",
  "Plumbing and Pipefitting",
  "Electrical Installation",
  "Motor Vehicle Mechanics",
  "ICT (Computer Operator/Web Design)",
  "Welding and Fabrication",
  "Hairdressing and Beauty Therapy",
];

export default function Phase1() {
  const [field, setField] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasUserSelectedField, setHasUserSelectedField] = useState(false);

  useEffect(() => {
    const savedField = localStorage.getItem("phase-1_field");
    const savedAnswers = localStorage.getItem("phase-1_answers");
    if (savedField) setField(savedField);
    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
  }, []);

  const generateQuestions = useCallback(async () => {
    if (!field) return;
    setLoading(true);
    try {
      const response = await fetch("/api/generate_questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field }),
      });
      const data = await response.json();
      setQuestions(data.questions);
      setAnswers(Array(data.questions.length).fill(""));
    } catch (error) {
      console.error("Failed to generate questions:", error);
      alert("Something went wrong while fetching questions.");
    } finally {
      setLoading(false);
    }
  }, [field]);

  const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setField(e.target.value);
    setHasUserSelectedField(true);
  };

  useEffect(() => {
    if (hasUserSelectedField && field) {
      void generateQuestions();
    }
  }, [hasUserSelectedField, field, generateQuestions]);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answers.some((answer) => !answer.trim()) || answers.length !== questions.length) {
      alert("Please answer all questions before proceeding.");
      return;
    }
    setSaving(true);
    try {
      localStorage.setItem("phase-1_field", field);
      localStorage.setItem("phase-1_answers", JSON.stringify(answers));
      setSaved(true);
      await fetch("/api/score_answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        field,
        questions: questions.map((q) => q.question),
        answers,
      }),
    });
      setTimeout(() => {
        window.location.href = "/assessment/phase-2";
      }, 1500);
    } catch (error) {
      console.error("Error saving answers:", error);
      alert("There was an error saving your answers. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
              style={{ width: "33%" }}
              role="progressbar"
              aria-valuenow={33}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between">
              {[{ number: 1, label: "Knowledge" }, { number: 2, label: "Scenario" }, { number: 3, label: "Practical" }].map((step, index) => {
                const isCompleted = step.number < 1;
                const isActive = step.number === 1;
                return (
                  <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full ${isCompleted ? "bg-green-100" : isActive ? "bg-blue-100" : "bg-gray-100"} transition-all duration-300 mb-2`}
                      >
                        {isCompleted ? <CheckCircle className="w-6 h-6 text-green-600" /> : <div className={`flex items-center justify-center w-6 h-6 rounded-full ${isActive ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"} font-medium text-sm`}>{step.number}</div>}
                      </div>
                      <span className={`text-sm font-medium ${isCompleted ? "text-green-600" : isActive ? "text-blue-600" : "text-gray-500"}`}>{step.label}</span>
                    </div>
                    {index < 2 && <div className={`flex-1 h-1 mx-2 bg-gray-300`} />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Knowledge Assessment</h1>
          <p className="text-gray-600">Please select your field of expertise and answer the questions to evaluate your knowledge.</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8 transition-all">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-2 rounded-full mt-1">
              <BookOpen className="text-blue-600 w-5 h-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Your Field</h2>
              <select
                value={field}
                onChange={handleFieldChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                disabled={loading}
              >
                <option value="">-- Select a NITA-aligned field --</option>
                {NITA_FIELDS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <LoaderCircle className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Generating questions based on your field...</p>
          </div>
        )}

        {!loading && questions.length > 0 && (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 mb-8">
              {questions.map((question, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md transition hover:shadow-lg">
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-50 text-blue-600 font-bold rounded-full w-8 h-8 flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-1">{question.question}</h3>
                        <p className="text-sm text-gray-500">Competency: {question.competencyId}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 bg-gray-50">
                    <textarea
                      value={answers[index] ?? ""}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      placeholder="Type your answer here..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all resize-none"
                      required
                    />
                    <div className="mt-3 text-right">
                      <span className="text-sm text-gray-500">{(answers[index] ?? "").length} characters</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving || saved}
                className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium text-white ${saved ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"} transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {saving ? (
                  <>
                    <LoaderCircle className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Saved! Proceeding...
                  </>
                ) : (
                  <>
                    Continue to Phase 2
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
