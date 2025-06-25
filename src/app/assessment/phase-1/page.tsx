/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  ArrowRight,
  Loader,
  CheckCircle,
  Scissors,
  Wrench,
  Zap,
  Car,
  Laptop,
  Flame,
  Sparkles,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Question {
  question: string;
  competencyId: string;
}

const NITA_FIELDS = [
  { name: "Tailoring and Dressmaking", icon: Scissors },
  { name: "Plumbing and Pipefitting", icon: Wrench },
  { name: "Electrical Installation", icon: Zap },
  { name: "Motor Vehicle Mechanics", icon: Car },
  { name: "ICT (Computer Operator/Web Design)", icon: Laptop },
  { name: "Welding and Fabrication", icon: Flame },
  { name: "Hairdressing and Beauty Therapy", icon: Sparkles },
];

export default function Phase1() {
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();

  const handleFieldSelect = async (fieldName: string) => {
    setSelectedField(fieldName);
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate_questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: fieldName }),
      });
      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setAnswers(Array(data.questions.length).fill(""));
      } else {
        throw new Error("No questions received from API.");
      }
    } catch (error) {
      console.error("Failed to generate questions:", error);
      alert("Something went wrong while fetching questions. Please try again.");
      setSelectedField(null); // Reset on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Final submission
      handleSubmit();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (answers.some((answer) => !answer.trim())) {
      alert("Please answer all questions before proceeding.");
      return;
    }
    setIsSaving(true);
    try {
      await fetch("/api/score_answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field: selectedField,
          questions: questions.map((q) => q.question),
          answers,
        }),
      });

      if (selectedField) {
        localStorage.setItem("phase-1_field", selectedField);
      }

      // Navigate to phase 2 on successful submission
      router.push("/assessment/phase-2");
    } catch (error) {
      console.error("Error saving answers:", error);
      alert("There was an error saving your answers. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const progress = selectedField ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  // UI for field selection
  const renderFieldSelection = () => (
    <>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Knowledge Assessment</h1>
        <p className="text-gray-600 mt-2">Please select your field of expertise to begin.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {NITA_FIELDS.map((field) => (
          <button
            key={field.name}
            onClick={() => handleFieldSelect(field.name)}
            className="group flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl hover:bg-blue-50 transition-all duration-300 border-2 border-transparent hover:border-blue-500"
          >
            <field.icon className="w-12 h-12 text-blue-600 mb-4 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-lg font-semibold text-center text-gray-700">{field.name}</span>
          </button>
        ))}
      </div>
    </>
  );

  // UI for answering questions
  const renderQuestionnaire = () => (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center">{selectedField} Assessment</h2>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg animate-fadeIn">
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Competency: {questions[currentQuestionIndex].competencyId}</p>
          <h3 className="text-xl font-semibold text-gray-800">{questions[currentQuestionIndex].question}</h3>
        </div>
        <textarea
          value={answers[currentQuestionIndex] ?? ""}
          onChange={(e) => handleAnswerChange(e.target.value)}
          placeholder="Type your detailed answer here..."
          rows={8}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-y"
          required
        />
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>
        <button
          onClick={handleNextQuestion}
          disabled={isSaving || !answers[currentQuestionIndex]?.trim()}
          className="flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {isSaving ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : currentQuestionIndex < questions.length - 1 ? (
            <>
              Next Question <ArrowRight className="w-5 h-5" />
            </>
          ) : (
            <>
              Submit Answers <CheckCircle className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full font-bold text-lg">1</div>
              <h1 className="text-xl font-bold text-gray-800">Knowledge</h1>
            </div>
            <div className="flex items-center text-sm font-medium text-gray-500">
              <span>Scenario</span>
              <ChevronRight className="w-5 h-5" />
              <span>Practical</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {!selectedField ? (
          renderFieldSelection()
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-lg text-gray-600">Preparing your assessment...</p>
          </div>
        ) : (
          renderQuestionnaire()
        )}
      </main>
    </div>
  );
}
