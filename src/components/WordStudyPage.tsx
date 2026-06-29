import React, { useState, useEffect } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  ArrowLeft, 
  Volume2, 
  Bookmark, 
  Check, 
  BookOpen, 
  Mic, 
  Sparkles, 
  Play, 
  Copy, 
  RotateCw, 
  CheckCircle, 
  FileText, 
  HelpCircle, 
  ChevronRight, 
  Lightbulb, 
  ExternalLink,
  History,
  Loader2
} from "lucide-react";
import { WordProfile, EtymologyProfile, ContextualUsageProfile } from "../types";
import { 
  ContextLottiePlayer, 
  LottieAudioWave, 
  LottieMicPulse, 
  LottieSuccessCelebration 
} from "./InteractiveLottie";

interface WordStudyPageProps {
  wordProfile: WordProfile;
  preferredLanguage: "EN" | "BN";
  onBack: () => void;
  onSpeak: (text: string) => void;
  isPlayingAudio: string | null;
  onSimulateSpeaking: (word: string) => void;
  isSimulatingMic: boolean;
  micFeedback: { score: number; text: string } | null;
  savedWords: string[];
  onToggleBookmark: (word: string) => void;
  isDarkMode: boolean;
  recentSearches?: string[];
}

export default function WordStudyPage({
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
  isDarkMode,
  recentSearches = []
}: WordStudyPageProps) {
  // State for interactive flashcard flip
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  
  // State for creative sentence builder
  const [userSentence, setUserSentence] = useState<string>("");
  const [isSentenceVerified, setIsSentenceVerified] = useState<boolean | null>(null);
  const [sentenceFeedback, setSentenceFeedback] = useState<string>("");

  // State for self-assessment quiz on this word
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [isQuizCorrect, setIsQuizCorrect] = useState<boolean | null>(null);

  // Spaced repetition state (local simulation of memory scheduling)
  const [srsInterval, setSrsInterval] = useState<string | null>(null);
  const [srsCelebrated, setSrsCelebrated] = useState<boolean>(false);

  // Etymology states and loading trigger
  const [etymology, setEtymology] = useState<EtymologyProfile | null>(null);
  const [isLoadingEtymology, setIsLoadingEtymology] = useState<boolean>(false);
  const [etymologyError, setEtymologyError] = useState<string | null>(null);
  const [etymologyTab, setEtymologyTab] = useState<"EN" | "BN">(preferredLanguage === "BN" ? "BN" : "EN");

  // Contextual Usage Generator states
  const [contextualUsage, setContextualUsage] = useState<ContextualUsageProfile | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState<boolean>(false);
  const [usageError, setUsageError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchEtymology = async () => {
      if (!wordProfile.word) return;
      setIsLoadingEtymology(true);
      setEtymologyError(null);
      setEtymology(null);
      try {
        const res = await fetch(`/api/etymology?word=${encodeURIComponent(wordProfile.word.toLowerCase())}`);
        if (!res.ok) {
          throw new Error("Could not fetch etymology.");
        }
        const data = await res.json();
        if (active) {
          setEtymology(data);
        }
      } catch (err: any) {
        if (active) {
          console.error("Failed to load etymology:", err);
          setEtymologyError(preferredLanguage === "EN" ? "Failed to load historical origin." : "শব্দের ইতিহাস লোড করা যায়নি।");
        }
      } finally {
        if (active) {
          setIsLoadingEtymology(false);
        }
      }
    };

    fetchEtymology();
    // Default the tab to match preferred language
    setEtymologyTab(preferredLanguage === "BN" ? "BN" : "EN");

    return () => {
      active = false;
    };
  }, [wordProfile.word, preferredLanguage]);

  // Contextual Usage real-time generator trigger
  useEffect(() => {
    let active = true;
    const fetchContextualUsage = async () => {
      if (!wordProfile.word) return;
      setIsLoadingUsage(true);
      setUsageError(null);
      setContextualUsage(null);
      try {
        const prevString = recentSearches ? recentSearches.filter(w => w !== wordProfile.word.toLowerCase()).join(",") : "";
        const res = await fetch(`/api/contextual-usage?word=${encodeURIComponent(wordProfile.word.toLowerCase())}&previouslySearched=${encodeURIComponent(prevString)}`);
        if (!res.ok) {
          throw new Error("Could not fetch contextual usage.");
        }
        const data = await res.json();
        if (active) {
          setContextualUsage(data);
        }
      } catch (err: any) {
        if (active) {
          console.error("Failed to load contextual usage:", err);
          setUsageError(preferredLanguage === "EN" ? "Failed to generate contextual usage." : "কনটেক্সচুয়াল ব্যবহার উদাহরণ তৈরি করা যায়নি।");
        }
      } finally {
        if (active) {
          setIsLoadingUsage(false);
        }
      }
    };

    fetchContextualUsage();
    return () => {
      active = false;
    };
  }, [wordProfile.word, recentSearches, preferredLanguage]);

  // Generate quiz options on word load
  useEffect(() => {
    // Generate a quick multiple choice quiz on the Bengali meaning of the word
    const correctMeaning = wordProfile.bengaliMeaning.split(/[,;।]/)[0].trim();
    const mockDistractors = [
      preferredLanguage === "EN" ? "অনুপ্রেরণা" : "অনুপ্রেরণা (Inspiration)",
      preferredLanguage === "EN" ? "ধৈর্য্য" : "ধৈর্য্য (Patience)",
      preferredLanguage === "EN" ? "সহযোগিতা" : "সহযোগিতা (Cooperation)",
      preferredLanguage === "EN" ? "সাফল্য" : "সাফল্য (Success)",
      preferredLanguage === "EN" ? "দায়িত্ব" : "দায়িত্ব (Responsibility)"
    ].filter(m => !m.includes(correctMeaning)).slice(0, 3);

    const options = [...mockDistractors, correctMeaning].sort(() => Math.random() - 0.5);
    setQuizOptions(options);
    setQuizAnswered(false);
    setSelectedQuizOption(null);
    setIsQuizCorrect(null);
    setUserSentence("");
    setIsSentenceVerified(null);
    setSentenceFeedback("");
    setIsFlipped(false);
    setSrsInterval(null);
  }, [wordProfile, preferredLanguage]);

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleVerifySentence = () => {
    if (!userSentence.trim()) return;
    const cleanInput = userSentence.toLowerCase();
    const targetWord = wordProfile.word.toLowerCase();
    
    // Check if the base word exists in the user sentence
    const wordRegex = new RegExp(`\\b${targetWord}\\w*\\b`, "i");
    const containsWord = wordRegex.test(cleanInput);

    if (containsWord) {
      setIsSentenceVerified(true);
      setSentenceFeedback(
        preferredLanguage === "EN"
          ? "🎉 Excellent! You used the word correctly in your sentence. Practice speaking this sentence out loud to build muscle memory."
          : "🎉 চমৎকার! আপনি বাক্যে সঠিক শব্দটি ব্যবহার করেছেন। মুখের জড়তা কাটাতে বাক্যটি জোরে জোরে পড়ার প্র্যাকটিস করুন।"
      );
    } else {
      setIsSentenceVerified(false);
      setSentenceFeedback(
        preferredLanguage === "EN"
          ? `❌ Opps! Make sure to write a sentence containing the exact word "${wordProfile.word}" or its variations.`
          : `❌ দুঃখিত! নিশ্চিত করুন যে আপনার বাক্যে "${wordProfile.word}" শব্দটি বা এর কোনো রূপ বিদ্যমান রয়েছে।`
      );
    }
  };

  const handleQuizSubmit = (option: string) => {
    setSelectedQuizOption(option);
    setQuizAnswered(true);
    const correctMeaning = wordProfile.bengaliMeaning.split(/[,;।]/)[0].trim();
    if (option === correctMeaning) {
      setIsQuizCorrect(true);
    } else {
      setIsQuizCorrect(false);
    }
  };

  const handleSrsSchedule = (level: string) => {
    setSrsInterval(level);
    setSrsCelebrated(true);
  };

  // Helper for color coding the level
  const getDifficultyBg = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-300 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800";
      case "intermediate":
        return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
      case "advanced":
        return "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  const isBookmarked = savedWords.includes(wordProfile.word.toLowerCase());

  return (
    <div id="word-study-workspace" className="space-y-8 animate-fadeIn">
      {/* HEADER SECTION FOR DISTRACTION FREE STUDY */}
      <div className={`rounded-3xl border-2 border-slate-900 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
        isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
      } bubbly-card-shadow`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-11 h-11 rounded-2xl border-2 border-slate-900 bg-emerald-50 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center shrink-0 transition-all active:scale-95"
            title={preferredLanguage === "EN" ? "Back to Workspace" : "পূর্ববর্তী স্ক্রিনে ফিরে যান"}
          >
            <ArrowLeft className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </button>
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-extrabold font-display px-2.5 py-0.5 rounded-full border border-slate-900 uppercase tracking-wider ${
                getDifficultyBg(wordProfile.difficultyLevel || "Intermediate")
              }`}>
                {wordProfile.difficultyLevel || "Intermediate"}
              </span>
              <span className="text-[10px] font-extrabold font-display px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-900 uppercase dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                {wordProfile.partOfSpeech}
              </span>
            </div>
            <h1 className="text-3xl font-display font-black uppercase tracking-tight">
              {wordProfile.word}
            </h1>
          </div>
        </div>

        {/* STUDY ACTIONS BAR */}
        <div className="flex items-center gap-2 w-full md:w-auto self-stretch md:self-auto justify-end">
          <LottieAudioWave
            isPlaying={isPlayingAudio === wordProfile.word}
            onToggle={() => onSpeak(wordProfile.word)}
            isDarkMode={isDarkMode}
            label={preferredLanguage === "EN" ? "LISTEN PRONUNCIATION" : "উচ্চারণ শুনুন"}
          />

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggleBookmark(wordProfile.word)}
            className={`p-2.5 rounded-2xl border-2 border-slate-900 transition-all flex items-center justify-center cursor-pointer ${
              isBookmarked 
                ? "bg-amber-400 text-slate-950" 
                : "bg-white text-slate-900 hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            }`}
            title={isBookmarked ? "Saved in Vault" : "Save to Vault"}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
          </motion.button>
        </div>
      </div>

      {/* TWO-COLUMN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPACT COLUMN: INTERACTIVE REINFORCEMENT & STUDY CARDS */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* WORD MOOD COMPANION AVATAR */}
          <div className="space-y-2 animate-fadeIn">
            <h3 className="text-xs font-black font-display text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>{preferredLanguage === "EN" ? "Semantic Mood Companion" : "শব্দের মুড কম্প্যানিয়ন"}</span>
            </h3>
            <ContextLottiePlayer 
              word={wordProfile.word}
              partOfSpeech={wordProfile.partOfSpeech}
              definition={wordProfile.englishDefinition}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* 1. INTERACTIVE 3D FLIP CARD */}
          <div className="space-y-2">
            <h3 className="text-xs font-black font-display text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>{preferredLanguage === "EN" ? "FLASHCARD STUDY TOOL" : "ফ্ল্যাশকার্ড স্টাডি টুল"}</span>
            </h3>

            <motion.div 
              onClick={() => setIsFlipped(!isFlipped)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full h-64 cursor-pointer [perspective:1000px] select-none"
            >
              <motion.div 
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 80, damping: 12, mass: 1 }}
                className="relative w-full h-full [transform-style:preserve-3d]"
              >
                {/* CARD FRONT: English Word Details */}
                <div className="absolute w-full h-full rounded-3xl border-2 border-slate-900 p-6 flex flex-col justify-between [backface-visibility:hidden] bg-white dark:bg-slate-900 text-slate-900 dark:text-white bubbly-card-shadow">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black font-display text-slate-400 uppercase tracking-widest block">
                      ENGLISH TERM
                    </span>
                    <h2 className="text-4xl font-display font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
                      {wordProfile.word}
                    </h2>
                    <p className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1">
                      <span>{wordProfile.phonetic}</span>
                    </p>
                  </div>

                  {wordProfile.variations && wordProfile.variations.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                      <span className="text-[9px] font-black font-display text-slate-400 uppercase tracking-widest block mb-1">
                        VARIATIONS
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {wordProfile.variations.map((v, i) => (
                          <span key={i} className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-extrabold text-[#10b981] font-display uppercase tracking-wider flex items-center gap-1 animate-pulse">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>TAP CARD TO FLIP</span>
                    </span>
                    <RotateCw className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* CARD BACK: Bengali Meaning and Phonetics */}
                <div className="absolute w-full h-full rounded-3xl border-2 border-slate-900 p-6 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] bg-slate-900 dark:bg-slate-950 text-white bubbly-card-shadow">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black font-display text-emerald-400 uppercase tracking-widest block">
                        BENGALI TRANSLATION
                      </span>
                      <p className="text-2xl font-black text-white">
                        {wordProfile.bengaliMeaning}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black font-display text-emerald-400 uppercase tracking-widest block">
                        ENGLISH FOCUS DEFINITION
                      </span>
                      <p className="text-xs font-medium leading-relaxed text-slate-300">
                        {wordProfile.englishDefinition}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-emerald-900">
                    <span className="text-[10px] font-extrabold text-amber-400 font-display uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>TAP CARD TO RESET</span>
                    </span>
                    <RotateCw className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* 2. MEMORY BOX (SRS MEMORY INTERVAL SCHEDULER) */}
          <div className={`rounded-3xl border-2 border-slate-900 p-5 space-y-4 transition-all ${
            isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
          } bubbly-card-shadow`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 border border-slate-300 flex items-center justify-center shrink-0">
                <CheckCircle className="w-4.5 h-4.5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-display font-extrabold text-sm uppercase tracking-tight">
                  {preferredLanguage === "EN" ? "SRS MEMORY TRACKER" : "মেমোরি ট্র্যাকার সিডিউল"}
                </h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  How well do you remember this word?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "AGAIN", level: "1m", desc: "Hardest", color: "bg-red-50 text-red-700 hover:bg-red-100 border-red-300 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900" },
                { label: "HARD", level: "12h", desc: "Struggling", color: "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-300 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900" },
                { label: "GOOD", level: "3d", desc: "Recalled", color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-300 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900" },
                { label: "EASY", level: "7d", desc: "Perfect", color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-300 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900" }
              ].map((srs) => (
                <button
                  key={srs.label}
                  onClick={() => handleSrsSchedule(srs.level)}
                  className={`border-2 rounded-xl p-2.5 flex flex-col items-center justify-center text-center transition-all cursor-pointer active:scale-95 ${
                    srsInterval === srs.level 
                      ? "bg-slate-900 text-white border-slate-900 dark:bg-emerald-600 dark:border-emerald-600"
                      : srs.color
                  }`}
                >
                  <span className="text-[10px] font-extrabold font-display block uppercase tracking-wider">
                    {srs.label}
                  </span>
                  <span className="text-[11px] font-black font-mono block mt-0.5">
                    {srs.level}
                  </span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {srsInterval && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60 p-3 rounded-2xl text-xs font-semibold text-purple-800 dark:text-purple-300 text-center"
                >
                  {preferredLanguage === "EN" 
                    ? `📅 Review scheduled for ${srsInterval} from now. Great work!` 
                    : `📅 পরবর্তী পড়াশোনা সেশন নির্ধারণ করা হয়েছে ${srsInterval} পর। ভালো প্র্যাকটিস!`}
                </motion.div>
              )}
            </AnimatePresence>

            <LottieSuccessCelebration 
              trigger={srsCelebrated} 
              onComplete={() => setSrsCelebrated(false)} 
              isDarkMode={isDarkMode} 
            />
          </div>

          {/* 3. ETYMOLOGY & HISTORICAL ORIGIN */}
          <div className={`rounded-3xl border-2 border-slate-900 p-5 space-y-4 transition-all ${
            isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
          } bubbly-card-shadow`}>
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800/80 flex items-center justify-center shrink-0">
                <History className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-extrabold text-xs uppercase tracking-tight truncate">
                  {preferredLanguage === "EN" ? "ORIGIN & ETYMOLOGY" : "শব্দের ইতিহাস ও উৎপত্তি"}
                </h4>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                  How this word traveled through history
                </p>
              </div>
            </div>

            {isLoadingEtymology ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                <p className="text-xs text-slate-500 font-mono text-center">
                  {preferredLanguage === "EN" ? "Unearthing linguistic roots..." : "ভাষাগত উৎস সন্ধান করা হচ্ছে..."}
                </p>
              </div>
            ) : etymologyError ? (
              <div className="py-4 text-center space-y-2">
                <p className="text-xs text-red-500 font-medium">{etymologyError}</p>
                <div className="text-xs text-slate-400 font-mono">
                  {preferredLanguage === "EN" ? "Retrying automatically..." : "পুনরায় চেষ্টা করা হচ্ছে..."}
                </div>
              </div>
            ) : etymology ? (
              <div className="space-y-4 text-slate-800 dark:text-slate-200">
                {/* Core Origin & Era Pills */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-2 border border-slate-200 dark:border-slate-800/80 rounded-xl text-center">
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-extrabold uppercase block tracking-wider">ROOT ORIGIN</span>
                    <span className="text-xs font-black font-display text-amber-700 dark:text-amber-400 mt-0.5 block truncate">{etymology.origin}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-2 border border-slate-200 dark:border-slate-800/80 rounded-xl text-center">
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-extrabold uppercase block tracking-wider">FIRST RECORDED</span>
                    <span className="text-xs font-black font-display text-amber-700 dark:text-amber-400 mt-0.5 block truncate">{etymology.period}</span>
                  </div>
                </div>

                {/* History Narration */}
                <div className="space-y-2">
                  <div className="flex gap-1 border-b border-slate-150 dark:border-slate-800 pb-1.5">
                    <button 
                      onClick={() => setEtymologyTab("EN")}
                      className={`px-2 py-0.5 text-[9px] font-black rounded-md tracking-wider transition-all uppercase cursor-pointer ${
                        etymologyTab === "EN" 
                          ? "bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950" 
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      ENGLISH
                    </button>
                    <button 
                      onClick={() => setEtymologyTab("BN")}
                      className={`px-2 py-0.5 text-[9px] font-black rounded-md tracking-wider transition-all uppercase cursor-pointer ${
                        etymologyTab === "BN" 
                          ? "bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950" 
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      BENGALI
                    </button>
                  </div>
                  <p className="text-[11px] leading-relaxed font-sans text-slate-600 dark:text-slate-300">
                    {etymologyTab === "EN" ? etymology.history : etymology.bengaliExplanation}
                  </p>
                </div>

                {/* Chronological Timeline */}
                <div className="space-y-2.5 pt-1">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider block">Linguistic Evolution Timeline:</span>
                  <div className="relative pl-3 border-l-2 border-amber-300/60 dark:border-amber-500/30 space-y-3.5 ml-1">
                    {etymology.timeline?.map((step, idx) => (
                      <div key={idx} className="relative">
                        {/* Timeline dot */}
                        <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-amber-500 border border-white dark:border-slate-950" />
                        
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wide block">
                            {step.era}
                          </span>
                          <span className="text-[11px] font-black font-mono text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded inline-block">
                            {step.form}
                          </span>
                          <span className="text-[10px] text-slate-600 dark:text-slate-400 block font-medium leading-normal">
                            {step.meaning}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fun Fact Box */}
                <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-900/40 p-2.5 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500 shrink-0 animate-pulse" />
                    <span className="text-[9px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                      {preferredLanguage === "EN" ? "DID YOU KNOW?" : "আপনি কি জানেন?"}
                    </span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                    {preferredLanguage === "EN" ? etymology.funFact?.english : etymology.funFact?.bengali}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* 4. CONTEXTUAL USAGE GENERATOR */}
          <div className={`rounded-3xl border-2 border-slate-900 p-5 space-y-4 transition-all ${
            isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
          } bubbly-card-shadow`}>
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-300 dark:border-indigo-800/80 flex items-center justify-center shrink-0">
                <Sparkles className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-extrabold text-xs uppercase tracking-tight truncate">
                  {preferredLanguage === "EN" ? "CONTEXTUAL USAGE GENERATOR" : "কনটেক্সচুয়াল ব্যবহার উদাহরণ"}
                </h4>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                  Real-time custom situational scenarios
                </p>
              </div>
            </div>

            {isLoadingUsage ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-xs text-slate-500 font-mono text-center">
                  {preferredLanguage === "EN" ? "Gemini is building custom scenarios..." : "জেমিলাই নতুন উদাহরণ তৈরি করছে..."}
                </p>
              </div>
            ) : usageError ? (
              <div className="py-4 text-center space-y-2">
                <p className="text-xs text-red-500 font-medium">{usageError}</p>
                <div className="text-xs text-slate-400 font-mono">
                  {preferredLanguage === "EN" ? "Retrying automatically..." : "পুনরায় চেষ্টা করা হচ্ছে..."}
                </div>
              </div>
            ) : contextualUsage ? (
              <div className="space-y-4">
                {/* Info about previous searches integrated */}
                {recentSearches && recentSearches.filter(w => w !== wordProfile.word.toLowerCase()).length > 0 && (
                  <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/40 rounded-xl">
                    <span className="text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                      💡 MULTI-WORD INTEGRATION ACTIVE
                    </span>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mt-0.5 leading-normal">
                      {preferredLanguage === "EN" 
                        ? `These scenarios are custom-tailored to reinforce your recently searched words: `
                        : `এই পরিস্থিতিগুলো আপনার সাম্প্রতিক সার্চকৃত শব্দের সমন্বয়ে ডিজাইন করা হয়েছে: `}
                      <strong className="text-indigo-700 dark:text-indigo-300 font-mono">
                        {recentSearches.filter(w => w !== wordProfile.word.toLowerCase()).slice(0, 3).join(", ")}
                      </strong>
                    </p>
                  </div>
                )}

                <div className="space-y-3.5">
                  {contextualUsage.scenarios?.map((scenario, idx) => (
                    <div 
                      key={idx} 
                      className="p-3.5 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl space-y-2.5 hover:border-indigo-300 dark:hover:border-indigo-900/60 transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="text-[10px] font-black font-display text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          {scenario.title}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded">
                          {idx === 0 ? "Professional" : idx === 1 ? "Casual" : "Social"}
                        </span>
                      </div>

                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-normal italic">
                        {scenario.description}
                      </p>

                      <div className="space-y-1 pl-2.5 border-l-2 border-indigo-500/40">
                        <p className="text-[11.5px] font-bold leading-normal text-slate-900 dark:text-white font-sans">
                          {scenario.englishSentence}
                        </p>
                        <p className="text-[11.5px] font-semibold leading-normal text-emerald-600 dark:text-emerald-400">
                          {scenario.bengaliSentence}
                        </p>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-2 border border-slate-150 dark:border-slate-800 rounded-xl">
                        <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                          SPEAKING TIP / NUANCE
                        </span>
                        <p className="text-[10.5px] text-slate-600 dark:text-slate-300 font-medium leading-normal mt-0.5">
                          {scenario.usageTip}
                        </p>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => onSpeak(scenario.englishSentence)}
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer text-[10px] font-bold flex items-center gap-1"
                          title="Listen Pronunciation"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>LISTEN</span>
                        </button>
                        <button
                          onClick={() => handleCopyText(scenario.englishSentence)}
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer text-[10px] font-bold flex items-center gap-1"
                          title="Copy Sentence"
                        >
                          <Copy className="w-3 h-3" />
                          <span>COPY</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

        </div>

        {/* RIGHT DEEPER COLUMN: AUDIO COACH, SENTENCE SANDBOX & COMPREHENSIVE STUDY CORE */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* A. ACCENT COACHING PANEL */}
          <div className={`rounded-3xl border-2 border-slate-900 p-6 space-y-5 transition-all ${
            isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
          } bubbly-card-shadow`}>
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
              <div className="w-10 h-10 rounded-2xl bg-[#ecf9f4] border-2 border-slate-900 flex items-center justify-center shrink-0">
                <Mic className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-display font-extrabold text-base uppercase tracking-tight">
                  {preferredLanguage === "EN" ? "AI VOICE ACCENT COACH" : "এআই ভয়েস অ্যাকসেন্ট কোচ"}
                </h4>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                  Pronounce the word and review accuracy score
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <p className="text-[10px] font-extrabold font-display text-slate-400 uppercase tracking-widest">
                  YOUR TASK
                </p>
                <p className="text-sm font-bold leading-normal">
                  Speak the word <span className="text-emerald-600 dark:text-emerald-400 font-black uppercase underline decoration-2">{wordProfile.word}</span> loudly into your mic.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <LottieMicPulse
                  isRecording={isSimulatingMic}
                  onClick={() => onSimulateSpeaking(wordProfile.word)}
                  isDarkMode={isDarkMode}
                  label={preferredLanguage === "EN" ? "SPEAK NOW" : "কথা বলুন"}
                />
              </div>
            </div>

            {/* Simulated sound waves when listening */}
            {isSimulatingMic && (
              <div className="flex items-center justify-center gap-1.5 py-4">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-emerald-500 rounded-full animate-pulse"
                    style={{
                      height: `${[16, 32, 48, 24, 60, 40, 28, 44, 16][i]}px`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: "0.8s"
                    }}
                  />
                ))}
              </div>
            )}

            {/* Vocal analyzer feedback */}
            <AnimatePresence mode="wait">
              {micFeedback && !isSimulatingMic && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-slate-900 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pb-2 border-b border-emerald-100 dark:border-emerald-900/60">
                    <span className="text-[11px] font-black font-display text-emerald-700 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
                      <span>PRONUNCIATION SCORE REPORT</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="text-right">
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          {micFeedback.score}%
                        </span>
                      </div>
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-600 text-white border border-slate-900">
                        {micFeedback.score >= 85 ? "EXCELLENT" : "GOOD"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-bold leading-relaxed text-slate-700 dark:text-slate-200">
                    {micFeedback.text}
                  </p>

                  {/* Adaptive feedback in user preferred language */}
                  {wordProfile.speakingTips && wordProfile.speakingTips.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[9px] font-black font-display text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                        COACHING STRATEGY
                      </span>
                      <p className="text-xs font-semibold leading-relaxed">
                        {preferredLanguage === "EN" ? wordProfile.speakingTips[0].english : wordProfile.speakingTips[0].bengali}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* B. CREATIVE SENTENCE SANDBOX */}
          <div className={`rounded-3xl border-2 border-slate-900 p-6 space-y-5 transition-all ${
            isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
          } bubbly-card-shadow`}>
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border-2 border-slate-900 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-display font-extrabold text-base uppercase tracking-tight">
                  {preferredLanguage === "EN" ? "CREATIVE SENTENCE SANDBOX" : "ক্রিয়েটিভ বাক্য গঠন কুঠির"}
                </h4>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                  Write your own sentence using this word and check spelling/context
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <textarea
                rows={3}
                placeholder={preferredLanguage === "EN" 
                  ? `Write a full sentence using the word "${wordProfile.word}"...` 
                  : `"${wordProfile.word}" শব্দটি ব্যবহার করে একটি পূর্ণাঙ্গ ইংরেজি বাক্য তৈরি করুন...`
                }
                value={userSentence}
                onChange={(e) => {
                  setUserSentence(e.target.value);
                  setIsSentenceVerified(null);
                }}
                className="w-full p-4 border-2 border-slate-900 rounded-2xl text-xs font-semibold placeholder-slate-400 focus:outline-hidden text-slate-900 bg-slate-50 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 resize-none"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-extrabold tracking-wide uppercase">
                    TRY CONJUGATING OR USING IN PRESENT/PAST TENSE
                  </span>
                </div>
                
                <motion.button
                  whileHover={userSentence.trim() ? { scale: 1.02 } : {}}
                  whileTap={userSentence.trim() ? { scale: 0.95 } : {}}
                  onClick={handleVerifySentence}
                  disabled={!userSentence.trim()}
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-black font-display px-4 py-2.5 rounded-xl border-2 border-slate-900 transition-all disabled:opacity-40 cursor-pointer shadow-sm"
                >
                  VERIFY SENTENCE
                </motion.button>
              </div>

              {/* Verified response */}
              <AnimatePresence mode="wait">
                {isSentenceVerified !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`border-2 border-slate-900 p-4 rounded-2xl text-xs font-bold leading-relaxed ${
                      isSentenceVerified 
                        ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300" 
                        : "bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-300"
                    }`}
                  >
                    {sentenceFeedback}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* C. MULTIPLE CHOICE FLASH QUIZ */}
          <div className={`rounded-3xl border-2 border-slate-900 p-6 space-y-5 transition-all ${
            isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
          } bubbly-card-shadow`}>
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border-2 border-slate-900 flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-display font-extrabold text-base uppercase tracking-tight">
                  {preferredLanguage === "EN" ? "FLASH SELF-ASSESSMENT" : "তাত্ক্ষণিক মূল্যায়ন কুইজ"}
                </h4>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                  Test your immediate comprehension of this word
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold leading-normal text-slate-600 dark:text-slate-300">
                {preferredLanguage === "EN"
                  ? `What is the correct primary Bengali meaning of the English word "${wordProfile.word}"?`
                  : `"${wordProfile.word}" শব্দটির সঠিক প্রধান বাংলা অর্থ কোনটি?`
                }
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quizOptions.map((option, idx) => {
                  const isSelected = selectedQuizOption === option;
                  const correctMeaning = wordProfile.bengaliMeaning.split(/[,;।]/)[0].trim();
                  const isCorrectOption = option === correctMeaning;
                  
                  let btnStyle = "bg-white text-slate-900 border-slate-300 hover:border-slate-900 dark:bg-slate-800 dark:text-white dark:border-slate-700";
                  if (quizAnswered) {
                    if (isCorrectOption) {
                      btnStyle = "bg-green-100 text-green-900 border-green-500 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800";
                    } else if (isSelected) {
                      btnStyle = "bg-red-100 text-red-900 border-red-500 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800";
                    } else {
                      btnStyle = "bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-900/40 dark:text-slate-600 dark:border-slate-800 opacity-60";
                    }
                  } else if (isSelected) {
                    btnStyle = "bg-slate-900 text-white border-slate-900";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={quizAnswered}
                      onClick={() => handleQuizSubmit(option)}
                      className={`border-2 rounded-2xl p-3 text-xs font-bold font-display text-left flex items-center justify-between transition-all cursor-pointer active:scale-98 ${btnStyle}`}
                    >
                      <span>{option}</span>
                      {quizAnswered && isCorrectOption && (
                        <Check className="w-4 h-4 text-green-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {quizAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-800"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black font-display text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                        EXPERT ANALYSIS
                      </span>
                      <p className="text-xs font-bold leading-normal">
                        {isQuizCorrect 
                          ? (preferredLanguage === "EN" 
                              ? "🎯 Bullseye! That's correct. You've unlocked the core semantic node." 
                              : "🎯 চমৎকার! সঠিক উত্তর দিয়েছেন। শব্দটির অর্থ আপনার স্মৃতিতে সফলভাবে গেঁথে গেছে।")
                          : (preferredLanguage === "EN"
                              ? `💡 Nice try! The correct meaning is "${wordProfile.bengaliMeaning.split(/[,;।]/)[0].trim()}".`
                              : `💡 চমৎকার চেষ্টা! সঠিক উত্তরটি হবে "${wordProfile.bengaliMeaning.split(/[,;।]/)[0].trim()}"।`)
                        }
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* D. DYNAMIC ENGLISH EXAMPLES LIST */}
          <div className={`rounded-3xl border-2 border-slate-900 p-6 sm:p-8 space-y-6 transition-all ${
            isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
          } bubbly-card-shadow`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black font-display text-[#10b981] dark:text-[#10b981] uppercase tracking-widest block">
                  Conversational Masterclass
                </span>
                <h3 className="font-display font-black text-base sm:text-lg uppercase tracking-tight">
                  {preferredLanguage === "EN" ? "5 Daily-Life Examples" : "দৈনন্দিন ৫টি বাস্তব উদাহরণ"}
                </h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>

            <div className="space-y-5">
              {wordProfile.examples && wordProfile.examples.length > 0 ? (
                wordProfile.examples.map((ex, idx) => (
                  <div 
                    key={idx}
                    className="border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 bg-white dark:bg-slate-950/25 shadow-xs hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 relative group"
                  >
                    {/* Scenario Counter Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/40">
                        EXAMPLE {idx + 1}
                      </span>
                    </div>

                    {/* Sentences & Translations */}
                    <div className="space-y-2.5">
                      <p className="text-lg sm:text-xl font-bold font-sans tracking-tight text-slate-900 dark:text-white leading-snug">
                        {ex.english}
                      </p>
                      <p className="text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 leading-relaxed pl-1">
                        {ex.bengali}
                      </p>
                    </div>

                    {/* How/When to Use Context Card */}
                    {(ex.howToUse || ex.context) && (
                      <div className="flex items-start gap-2.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100/70 dark:border-amber-900/30 rounded-2xl p-4 mt-1 transition-colors group-hover:bg-amber-50 dark:group-hover:bg-amber-950/30">
                        <span className="text-base shrink-0 select-none mt-0.5">💡</span>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 block font-display">
                            HOW TO USE / কখন বলবেন
                          </span>
                          <p className="text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-300 leading-relaxed">
                            {ex.howToUse || ex.context}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-900">
                      <button
                        onClick={() => onSpeak(ex.english)}
                        className="p-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all cursor-pointer text-[10px] font-extrabold flex items-center gap-1.5"
                        title="Listen Example"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>LISTEN SPEAKING</span>
                      </button>

                      <button
                        onClick={() => handleCopyText(ex.english)}
                        className="p-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all cursor-pointer text-[10px] font-extrabold flex items-center gap-1.5"
                        title="Copy Phrase"
                      >
                        <Copy className="w-3 h-3" />
                        <span>COPY TEXT</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  <p className="text-xs text-slate-500 italic">No conversational examples available.</p>
                </div>
              )}
            </div>
          </div>

          {/* E. RELATED WORDS & PRACTICAL SPEAKING DRILLS */}
          <div className={`rounded-3xl border-2 border-slate-900 p-6 space-y-5 transition-all ${
            isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
          } bubbly-card-shadow`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black font-display text-slate-400 uppercase tracking-widest block">
                  RELATED VOCABULARY
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {wordProfile.relatedWords && wordProfile.relatedWords.length > 0 ? (
                    wordProfile.relatedWords.map((word, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-display font-bold text-xs uppercase text-slate-800 dark:text-slate-200 hover:border-slate-900 transition-all"
                      >
                        {word}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No related vocabulary listed</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black font-display text-slate-400 uppercase tracking-widest block">
                  PRACTICAL SPEAKING DRILLS
                </span>
                <div className="space-y-2">
                  {wordProfile.practicalSpeakingTips && wordProfile.practicalSpeakingTips.length > 0 ? (
                    wordProfile.practicalSpeakingTips.slice(0, 2).map((tip, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                        <p className="text-xs font-bold leading-normal text-slate-800 dark:text-slate-200">
                          {tip.english}
                        </p>
                        <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                          {tip.bengali}
                        </p>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No drills listed</span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
