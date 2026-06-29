import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Volume2,
  Mic,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Sparkles,
  Link,
  MessageCircle,
  HelpCircle,
  Clock,
  ArrowLeft,
  Search,
  BookOpenCheck
} from "lucide-react";
import { WordProfile } from "../types";
import { LottieFeatureIcon } from "./InteractiveLottie";

interface DictionaryResultProps {
  wordProfile: WordProfile;
  preferredLanguage: "EN" | "BN";
  onBack: () => void;
  onSpeak: (text: string, lang?: string) => void;
  isPlayingAudio: string | null;
  onSimulateSpeaking: (word: string) => void;
  isSimulatingMic: boolean;
  micFeedback: { score: number; text: string } | null;
  savedWords: string[];
  onToggleBookmark: (word: string) => void;
  isDarkMode: boolean;
}

export default function DictionaryResult({
  wordProfile,
  preferredLanguage,
  onBack,
  onSpeak,
  isPlayingAudio,
  onSimulateSpeaking,
  isSimulatingMic,
  micFeedback,
  savedWords,
  onToggleBookmark,
  isDarkMode
}: DictionaryResultProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [srsSchedule, setSrsSchedule] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSrsReview = (rating: "AGAIN" | "HARD" | "GOOD" | "EASY") => {
    let nextReviewTextEN = "";
    let nextReviewTextBN = "";

    switch (rating) {
      case "AGAIN":
        nextReviewTextEN = "Scheduled for review in 1 minute!";
        nextReviewTextBN = "১ মিনিট পর আবার রিভিউ করার জন্য নির্ধারণ করা হয়েছে!";
        break;
      case "HARD":
        nextReviewTextEN = "Scheduled for review in 12 hours!";
        nextReviewTextBN = "১২ ঘণ্টা পর রিভিউ করার জন্য নির্ধারণ করা হয়েছে!";
        break;
      case "GOOD":
        nextReviewTextEN = "Scheduled for review in 2 days!";
        nextReviewTextBN = "২ দিন পর রিভিউ করার জন্য নির্ধারণ করা হয়েছে!";
        break;
      case "EASY":
        nextReviewTextEN = "Scheduled for review in 4 days!";
        nextReviewTextBN = "৪ দিন পর রিভিউ করার জন্য নির্ধারণ করা হয়েছে!";
        break;
    }

    setSrsSchedule(preferredLanguage === "EN" ? nextReviewTextEN : nextReviewTextBN);
    
    // Save to localStorage for mock persistence of SRS schedule
    try {
      const scheduleMap = JSON.parse(localStorage.getItem("learn_english_easy_srs") || "{}");
      scheduleMap[wordProfile.word.toLowerCase()] = {
        rating,
        updatedAt: new Date().toISOString(),
        nextReviewTextEN,
        nextReviewTextBN
      };
      localStorage.setItem("learn_english_easy_srs", JSON.stringify(scheduleMap));
    } catch (e) {
      console.error(e);
    }
  };

  // Format today's date
  const getFormattedDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return today.toLocaleDateString("en-US", options).toUpperCase();
  };

  const isBookmarked = savedWords.includes(wordProfile.word.toLowerCase());

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* DICTIONARY RESULT BANNER AND BACK HEADER */}
      <div className="flex flex-col items-center justify-center space-y-3">
        {/* Banner with Icon */}
        <div className="flex items-center gap-2.5 pb-2 border-b-2 border-slate-900/10 w-full justify-center">
          <div className="w-9 h-9 rounded-2xl bg-emerald-100 border-2 border-slate-900 flex items-center justify-center text-emerald-800 shadow-[1.5px_1.5px_0px_0px_#0f172a]">
            <Search className="w-4 h-4 stroke-[3]" />
          </div>
          <h2 
            style={{ textShadow: "1.5px 1.5px 0px #1e293b, 3px 3px 0px #10b981" }}
            className="font-display font-black text-2xl sm:text-3xl tracking-wide text-slate-900 dark:text-white uppercase"
          >
            {preferredLanguage === "EN" ? "DICTIONARY RESULT" : "অভিধান ফলাফল"}
          </h2>
        </div>

        {/* Back Link */}
        <button
          onClick={onBack}
          className="text-xs font-display font-extrabold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 transition-colors uppercase py-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[3]" />
          <span>{preferredLanguage === "EN" ? "BACK TO SEARCH" : "সার্চে ফিরে যান"}</span>
        </button>
      </div>

      {/* CORE WORD DETAILS CONTAINER */}
      <div className={`rounded-[32px] border-2 border-slate-900 p-6 md:p-8 space-y-6 bubbly-card-shadow ${
        isDarkMode ? "bg-[#0b1311] text-[#e2f1ec] border-emerald-800" : "bg-white text-slate-900"
      }`}>
        
        {/* Date pill & Word & Pronunciation row */}
        <div className="space-y-4">
          <span className="inline-block bg-[#d1f2e5] text-[#0f9f6e] font-display font-black text-[10px] uppercase px-3.5 py-1 rounded-full border border-emerald-200">
            {getFormattedDate()}
          </span>

          <h1 
            style={{ textShadow: "2px 2px 0px #1e293b, 4px 4px 0px #fcd34d" }}
            className="font-display font-black text-4xl sm:text-6xl text-[#10b981] uppercase tracking-wide"
          >
            {wordProfile.word}
          </h1>

          {/* Phonetic key container */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSpeak(wordProfile.word)}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border-2 border-[#d1f2e5] text-xs font-mono font-bold text-[#0f9f6e] hover:bg-[#e6fcf5] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Volume2 className="w-4 h-4 text-[#0f9f6e]" />
              <span>{wordProfile.phonetic}</span>
            </button>
          </div>
        </div>

        {/* Word Variations Box */}
        {wordProfile.variations && wordProfile.variations.length > 0 && (
          <div className="bg-[#fefce8] dark:bg-amber-950/20 border-2 border-[#fef08a] dark:border-amber-900/40 rounded-2xl p-4 text-amber-900 dark:text-amber-200 font-display font-extrabold text-xs sm:text-sm tracking-wide uppercase leading-relaxed">
            <span className="text-amber-600 dark:text-amber-400 font-black mr-1">VARIATIONS:</span>
            <span>{wordProfile.variations.join(", ")}</span>
          </div>
        )}

        {/* Action button bar: Practice Pronunciation & Speaker icon */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => onSimulateSpeaking(wordProfile.word)}
            disabled={isSimulatingMic}
            className="px-5 py-3.5 rounded-2xl bg-[#fff1f2] dark:bg-rose-950/30 border-2 border-[#fecdd3] dark:border-rose-900/40 text-[#e11d48] dark:text-rose-400 font-display font-extrabold text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer active:scale-95 select-none"
          >
            <Mic className="w-4 h-4" />
            <span>{isSimulatingMic ? "ANALYZING..." : "PRACTICE PRONUNCIATION"}</span>
          </button>

          <button
            onClick={() => onSpeak(wordProfile.word)}
            className="p-3.5 rounded-2xl bg-[#ecfeff] dark:bg-cyan-950/30 border-2 border-[#cffafe] dark:border-cyan-900/40 text-[#0891b2] dark:text-cyan-400 transition-all cursor-pointer hover:bg-cyan-50 dark:hover:bg-cyan-900/20 active:scale-95"
            title="Listen Audio"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Coach simulator feedback */}
        {micFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 rounded-2xl space-y-2"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 font-display">PRONUNCIATION SCORE:</span>
              <span className="text-lg font-black text-emerald-600 font-display">{micFeedback.score}%</span>
            </div>
            <p className="text-xs font-semibold leading-relaxed text-slate-700 dark:text-slate-300">
              {micFeedback.text}
            </p>
          </motion.div>
        )}

        {/* Part-of-speech and level pills */}
        <div className="flex flex-wrap gap-2.5">
          <span className="bg-[#e0f2fe] dark:bg-sky-950/40 text-[#0284c7] dark:text-sky-300 font-display font-black text-xs uppercase px-4 py-1.5 rounded-full border border-sky-200 dark:border-sky-900/50">
            {wordProfile.partOfSpeech}
          </span>
          <span className="bg-[#fef9c3] dark:bg-yellow-950/40 text-[#ca8a04] dark:text-yellow-300 font-display font-black text-xs uppercase px-4 py-1.5 rounded-full border border-yellow-200 dark:border-yellow-900/50">
            {wordProfile.difficultyLevel || "Intermediate"}
          </span>
        </div>

        {/* BENGALI MEANING BLOCK */}
        <div className="space-y-2">
          <div className="bg-[#fff5f5] dark:bg-rose-950/10 border-2 border-slate-900 rounded-[28px] p-5 relative shadow-[2px_2px_0px_0px_#0f172a] md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-1 text-rose-500 font-display font-black text-xs uppercase tracking-wider">
                <span>অA</span>
                <span>BENGALI MEANING</span>
              </div>
              <p className="font-display font-black text-xl sm:text-3xl text-[#e11d48] dark:text-rose-400 tracking-wide leading-snug">
                {wordProfile.bengaliMeaning}
              </p>
            </div>
            
            <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-rose-100/50">
              <button
                onClick={() => handleCopy(wordProfile.bengaliMeaning, "bn_mean")}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-rose-300 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer active:scale-95 transition-all"
                title="Copy Meaning"
              >
                {copiedId === "bn_mean" ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => onSpeak(wordProfile.bengaliMeaning, "bn-BD")}
                className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 border-2 border-rose-200 text-rose-500 flex items-center justify-center shadow-xs hover:bg-rose-50 cursor-pointer active:scale-95 transition-all"
                title="Listen Bengali"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* SIMPLE ENGLISH MEANING BLOCK */}
        <div className="space-y-2">
          <div className="bg-[#f0f9ff] dark:bg-sky-950/10 border-2 border-slate-900 rounded-[28px] p-5 relative shadow-[2px_2px_0px_0px_#0f172a] md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-1.5 text-[#0284c7] font-display font-black text-xs uppercase tracking-wider">
                <BookOpen className="w-4 h-4 stroke-[2.5]" />
                <span>SIMPLE ENGLISH MEANING</span>
              </div>
              <p className="font-display font-black text-xs sm:text-sm text-[#0369a1] dark:text-sky-400 tracking-wide uppercase leading-relaxed">
                {wordProfile.englishDefinition}
              </p>
            </div>
            
            <div className="flex items-center justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-sky-100/50">
              <button
                onClick={() => onSpeak(wordProfile.englishDefinition)}
                className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 border-2 border-sky-200 text-sky-600 flex items-center justify-center shadow-xs hover:bg-sky-50 cursor-pointer active:scale-95 transition-all"
                title="Listen Definition"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* REAL-LIFE EXAMPLES BLOCK */}
        {wordProfile.examples && wordProfile.examples.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-[#10b981] font-display font-black text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>REAL-LIFE EXAMPLES</span>
            </div>
            
            <div className="bg-[#f0fdf4] dark:bg-emerald-950/10 border-2 border-slate-900 rounded-[28px] p-5 md:p-6 space-y-6 shadow-[2px_2px_0px_0px_#0f172a]">
              {wordProfile.examples.map((ex, idx) => (
                <div 
                  key={idx} 
                  className="space-y-3 pb-5 last:pb-0 border-b-2 border-dashed border-emerald-200/50 dark:border-emerald-900/30 last:border-0"
                >
                  {/* Example row header */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display font-black text-emerald-700 dark:text-emerald-400 text-sm">
                      {idx + 1}.
                    </span>
                    <span className="bg-[#e6fcf5] text-[#0f9f6e] border border-[#d1f2e5] font-display font-black text-[9px] uppercase px-2.5 py-0.5 rounded-full">
                      {ex.context || "CONVERSATIONAL USE"}
                    </span>
                  </div>
                  
                  {/* English statement and buttons row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <p className="font-display font-black text-[#065f46] dark:text-emerald-300 text-xs sm:text-sm tracking-wide uppercase leading-relaxed">
                        "{ex.english}"
                      </p>
                      {preferredLanguage !== "EN" && (
                        <p className="text-xs font-semibold text-slate-600 dark:text-emerald-400/80 leading-normal">
                          {ex.bengali}
                        </p>
                      )}
                      {(ex.howToUse || ex.context) && (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-100/30 rounded-lg px-2 py-0.5 w-fit mt-1">
                          <span>💡</span>
                          <span>{ex.howToUse || ex.context}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onSpeak(ex.english)}
                        className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 text-slate-500 hover:text-[#10b981] cursor-pointer active:scale-95 transition-all shadow-xs"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCopy(ex.english, `ex_${idx}`)}
                        className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 text-slate-500 hover:text-[#10b981] cursor-pointer active:scale-95 transition-all shadow-xs"
                      >
                        {copiedId === `ex_${idx}` ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SPEAKING TIPS BLOCK */}
        {wordProfile.speakingTips && wordProfile.speakingTips.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-600 font-display font-black text-xs uppercase tracking-wider">
              <div className="w-8 h-8 rounded-xl border-2 border-slate-900 overflow-hidden shrink-0 shadow-[1px_1px_0px_0px_#0f172a]">
                <LottieFeatureIcon theme="speakingTips" isDarkMode={isDarkMode} />
              </div>
              <span>SPEAKING TIPS</span>
            </div>
            
            <div className="bg-[#fffbeb] dark:bg-amber-950/10 border-2 border-slate-900 rounded-[28px] p-5 md:p-6 space-y-4 shadow-[2px_2px_0px_0px_#0f172a]">
              {wordProfile.speakingTips.map((tip, idx) => (
                <div 
                  key={idx} 
                  className="bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-2xl p-4 shadow-[1.5px_1.5px_0px_0px_#0f172a] flex gap-3.5 items-start"
                >
                  <span className="w-6 h-6 rounded-full bg-[#fef3c7] dark:bg-amber-950 text-[#d97706] dark:text-amber-300 flex items-center justify-center font-display font-black text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 space-y-1">
                    <p className="font-display font-black text-slate-800 dark:text-amber-200 text-xs sm:text-sm tracking-wide uppercase leading-snug">
                      {tip.english}
                    </p>
                    <p className="text-xs font-semibold text-[#b45309] dark:text-amber-400/80 leading-normal font-sans">
                      {tip.bengali}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RELATED WORDS BLOCK */}
        {wordProfile.relatedWords && wordProfile.relatedWords.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-display font-black text-xs uppercase tracking-wider">
              <Link className="w-4 h-4 stroke-[2.5]" />
              <span>RELATED WORDS</span>
            </div>
            
            <div className="bg-[#f5f3ff] dark:bg-indigo-950/10 border-2 border-slate-900 rounded-[28px] p-5 md:p-6 space-y-3.5 shadow-[2px_2px_0px_0px_#0f172a]">
              <p className="font-display font-black text-[10px] sm:text-xs text-[#6d28d9] dark:text-indigo-400 tracking-wide uppercase leading-normal">
                WORDS COMMONLY USED TOGETHER OR SEMANTICALLY RELATED TO {wordProfile.word}:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {wordProfile.relatedWords.map((r, idx) => (
                  <span
                    key={idx}
                    className="bg-white dark:bg-slate-900 border-2 border-slate-900 text-[#6d28d9] dark:text-indigo-300 font-display font-black text-xs uppercase px-4 py-2 rounded-2xl shadow-[1px_1px_0px_0px_#0f172a]"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM GLOSSARY AND SAVED BUTTONS */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onBack}
            className="flex-1 px-5 py-3.5 rounded-2xl bg-[#e6fcf5] dark:bg-emerald-950/20 border-2 border-slate-900 text-[#0f9f6e] dark:text-emerald-400 font-display font-black text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-emerald-50 active:scale-95 shadow-[1.5px_1.5px_0px_0px_#0f172a]"
          >
            <span>VIEW IN GLOSSARY</span>
            <span className="font-sans font-bold text-sm">→</span>
          </button>

          <button
            onClick={() => onToggleBookmark(wordProfile.word)}
            className={`p-3.5 rounded-2xl border-2 border-slate-900 transition-all cursor-pointer active:scale-95 flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_#0f172a] ${
              isBookmarked
                ? "bg-[#10b981] text-white"
                : "bg-white dark:bg-slate-900 text-[#10b981] hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
            title="Bookmark Word"
          >
            {isBookmarked ? <BookmarkCheck className="w-5 h-5 stroke-[2.5]" /> : <Bookmark className="w-5 h-5 stroke-[2.5]" />}
          </button>
        </div>

        {/* SPACED REPETITION / SRS REVIEW SCHEDULE SECTION */}
        <div className="border-t-2 border-dashed border-slate-900/10 dark:border-emerald-950/20 pt-5 space-y-3.5">
          <p className="text-[10px] font-display font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
            {preferredLanguage === "EN" 
              ? "REVIEW THIS WORD NOW TO UPDATE ITS SCHEDULE:" 
              : "শিডিউল আপডেট করার জন্য এখনই শব্দটি রিভিয়ু করুন:"}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => handleSrsReview("AGAIN")}
              className="px-3 py-2.5 rounded-xl bg-[#fff1f2] border-2 border-slate-900 text-[#e11d48] font-display font-black text-[11px] uppercase tracking-wider cursor-pointer active:scale-95 text-center shadow-[1px_1px_0px_0px_#0f172a]"
            >
              AGAIN
            </button>
            <button
              onClick={() => handleSrsReview("HARD")}
              className="px-3 py-2.5 rounded-xl bg-[#fffbeb] border-2 border-slate-900 text-[#d97706] font-display font-black text-[11px] uppercase tracking-wider cursor-pointer active:scale-95 text-center shadow-[1px_1px_0px_0px_#0f172a]"
            >
              HARD
            </button>
            <button
              onClick={() => handleSrsReview("GOOD")}
              className="px-3 py-2.5 rounded-xl bg-[#eff6ff] border-2 border-slate-900 text-[#2563eb] font-display font-black text-[11px] uppercase tracking-wider cursor-pointer active:scale-95 text-center shadow-[1px_1px_0px_0px_#0f172a]"
            >
              GOOD
            </button>
            <button
              onClick={() => handleSrsReview("EASY")}
              className="px-3 py-2.5 rounded-xl bg-[#f0fdf4] border-2 border-slate-900 text-[#16a34a] font-display font-black text-[11px] uppercase tracking-wider cursor-pointer active:scale-95 text-center shadow-[1px_1px_0px_0px_#0f172a]"
            >
              EASY
            </button>
          </div>

          {/* Toast/Alert for review schedule persistence */}
          {srsSchedule && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-[#e6fcf5] dark:bg-emerald-950/30 border-2 border-slate-900 text-emerald-800 dark:text-emerald-400 rounded-xl flex items-center justify-center gap-2 text-center text-xs font-display font-bold uppercase shadow-[1px_1px_0px_0px_#0f172a]"
            >
              <Clock className="w-4 h-4 animate-pulse shrink-0 text-emerald-600" />
              <span>{srsSchedule}</span>
            </motion.div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
