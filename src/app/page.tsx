/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LogIn,
  BookOpen,
  Clock
} from 'lucide-react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import Image from 'next/image';



const testimonials = [
  {
    id: 1,
    name: "David",
    title: "Technician",
    image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600",
    quote: "Thanks to this platform, I finally received certification for my 10 years of electrical work."
  },
  {
    id: 2,
    name: "Amina",
    title: "Tailor",
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600",
    quote: "I had no documents, but the AI test evaluated my skills and I got certified!"
  }
];

const faqItems = [
  {
    question: "What is RPL?",
    answer: "Recognition of Prior Learning (RPL) is a formal process that evaluates your existing skills, knowledge, and experience—whether gained through work, informal learning, or life situations—and matches them to a national qualification. It allows you to gain certification without repeating what you already know."
  },
  {
    question: "Who is this platform for?",
    answer: "This platform is built for self-taught professionals, artisans, and experienced individuals who lack formal documentation but possess real-world experience. Whether you’re a tailor, plumber, or IT technician, this system helps get your skills officially recognized."
  },
  {
    question: "Is AI used in the evaluation?",
    answer: "Yes. Our platform uses AI to understand your uploaded documents and assessment responses. It compares your inputs to national competency benchmarks and provides fair, personalized, and fast evaluations."
  },
  {
    question: "How do I start?",
    answer: "You can either upload documents (certificates, portfolios, etc.) or take a 3-phase AI-driven assessment. The assessment includes a knowledge quiz, scenario-based evaluation, and a practical upload step."
  }
];

export default function Page() {
  const { data: session } = useSession();
  const router = useRouter();

  // Redirect unauthenticated users from protected pages
  const handleProtectedRedirect = (path: string) => {
    if (!session?.user) {
      router.push("/api/auth/signin");
    } else {
      router.push(path);
    }
  };

  const [openItems, setOpenItems] = useState<number[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideInterval = useRef<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenItems((current) =>
      current.includes(index) ? current.filter((i) => i !== index) : [...current, index]
    );
  };

  const nextSlide = () => {
    setActiveIndex((current) => (current + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setActiveIndex((current) => (current === 0 ? testimonials.length - 1 : current - 1));
  };

  useEffect(() => {
    slideInterval.current = window.setInterval(() => {
      if (!isPaused) nextSlide();
    }, 6000);
    return () => {
      if (slideInterval.current !== null) clearInterval(slideInterval.current);
    };
  }, [isPaused]);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <section className="relative h-[600px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-purple-900/70"></div>

        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight max-w-3xl">
            Recognize Your Skills with <span className="text-purple-300">AI-Powered RPL</span>
          </h1>
          <p className="text-gray-100 max-w-xl text-lg mb-8">
            Get certified for your real-world skills. Upload documents or take our AI-driven assessment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleProtectedRedirect("/upload-documents")}
              className="bg-white text-purple-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-100"
            >
              I Have Documents
            </button>
            <button
              onClick={() => handleProtectedRedirect("/assessment/phase-1")}
              className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700"
            >
              I Don’t Have Documents
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 flex justify-between items-center text-left font-medium"
                >
                  <span>{item.question}</span>
                  {openItems.includes(index) ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                {openItems.includes(index) && (
                  <div className="px-6 pb-4 text-gray-700">{item.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-purple-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">What Our Users Say</h2>
          <div className="flex gap-6 flex-wrap justify-center">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-white rounded-lg shadow p-6 max-w-sm">
                <div className="flex items-center gap-4 mb-4">
                  <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-purple-600">{t.title}</p>
                  </div>
                </div>
                <p className="italic text-gray-700">&quot;{t.quote}&quot;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth Area */}
      <section className="py-12 bg-white text-center">
        <div className="max-w-md mx-auto">
          {session?.user ? (
            <>
              <p className="text-xl mb-4">Signed in as <strong>{session.user.name}</strong></p>
              <button
                 onClick={() => signOut({ callbackUrl: "/api/auth/signin" })}
                  className="flex items-center gap-2 bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition-colors"
>
                 <LogOut className="w-4 h-4" />
                      Sign out
                    </button>

                <LogOut className="w-5 h-5" />
                Sign out
            
            </>
          ) : (
            <>
              <p className="text-lg mb-4">Sign in to begin your RPL journey</p>
             <button
               onClick={() => signIn("discord")}
                 className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition-colors">
              <LogIn className="w-4 h-4" />
              Sign in
             </button>

            </>
          )}
        </div>
      </section>
    </main>
  );
}
