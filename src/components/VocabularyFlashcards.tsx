import React, { useState, useEffect } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  Volume2, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Shuffle, 
  Sparkles, 
  Award, 
  ThumbsUp, 
  BookMarked,
  ArrowLeft
} from "lucide-react";
import { WordProfile } from "../types";

interface VocabularyFlashcardsProps {
  savedWords: string[];
  PRELOADED_WORDS: Record<string, WordProfile>;
  preferredLanguage: "EN" | "BN";
  isDarkMode: boolean;
  onClose: () => void;
  onTriggerNotification?: (title: string, body: string) => void;
}

interface FlashcardState {
  word: string;
  isPreloaded: boolean;
  profile?: WordProfile;
  status: "unseen" | "learned" | "learning";
}

export default function VocabularyFlashcards({
  savedWords,
  PRELOADED_WORDS,
  preferredLanguage,
  isDarkMode,
  onClose,
  onTriggerNotification
}: VocabularyFlashcardsProps) {
  const [deck, setDeck] = useState<FlashcardState[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Initialize deck from savedWords
  useEffect(() => {
    if (savedWords.length > 0) {
      const initialDeck: FlashcardState[] = savedWords.map(word => {
        const lower = word.toLowerCase();
        const profile = PRELOADED_WORDS[lower];
        return {
          word,
          isPreloaded: !!profile,
          profile: profile,
          status: "unseen"
        };
      });
      setDeck(initialDeck);
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsCompleted(false);
    }
  }, [savedWords, PRELOADED_WORDS]);

  // Handle Text-to-Speech
  const handleSpeak = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // prevent card flipping when clicking speaker
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.82;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  // Shuffle Deck
  const handleShuffle = () => {
    if (deck.length <= 1) return;
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // reset states
    setDeck(shuffled.map(card => ({ ...card, status: "unseen" })));
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);

    if (onTriggerNotification) {
      onTriggerNotification(
        preferredLanguage === "EN" ? "Deck Shuffled! 🎴" : "কার্ড নতুনভাবে সাজানো হয়েছে! 🎴",
        preferredLanguage === "EN" 
          ? "Let's test your memory with a random order." 
          : "এলোমেলো ক্রমে আপনার স্মৃতিশক্তি পরীক্ষা করা যাক।"
      );
    }
  };

  // Reset current deck study progress
  const handleReset = () => {
    setDeck(prev => prev.map(card => ({ ...card, status: "unseen" })));
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
  };

  // Mark word as Got It / Learned
  const handleMarkLearned = () => {
    const updated = [...deck];
    updated[currentIndex].status = "learned";
    setDeck(updated);
    advanceDeck();
  };

  // Mark word as Still Learning
  const handleMarkLearning = () => {
    const updated = [...deck];
    updated[currentIndex].status = "learning";
    setDeck(updated);
    advanceDeck();
  };

  // Go to next card or finish
  const advanceDeck = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < deck.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Deck finished!
        setIsCompleted(true);
        saveStudySession();
      }
    }, 150);
  };

  // Go to previous card
  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
      }, 150);
    }
  };

  // Record completed flashcard deck to study history
  const saveStudySession = () => {
    try {
      const duration = Math.max(2, Math.round(deck.length * 1.2)); // ~1.2 minutes per card, min 2 mins
      
      const historyStored = localStorage.getItem("learn_english_easy_study_history");
      const currentHistory = historyStored ? JSON.parse(historyStored) : [];
      
      const newSession = {
        id: `session-flashcards-${Date.now()}`,
        timestamp: new Date().toISOString(),
        durationMinutes: duration,
        activityType: "category_review"
      };

      localStorage.setItem("learn_english_easy_study_history", JSON.stringify([...currentHistory, newSession]));
      
      if (onTriggerNotification) {
        onTriggerNotification(
          preferredLanguage === "EN" ? "🎉 Flashcard Deck Completed!" : "🎉 ফ্ল্যাশকার্ড সেশন সম্পন্ন!",
          preferredLanguage === "EN"
            ? `Fantastic effort! We've logged ${duration} mins of active vocabulary review to your study tracker.`
            : `অসাধারণ কাজ! আপনার স্টাডি ট্র্যাকারে ${duration} মিনিটের ফ্ল্যাশকার্ড সেশন যোগ করা হয়েছে।`
        );
      }
    } catch (e) {
      console.warn("Failed to automatically record study session for flashcards completion:", e);
    }
  };

  if (deck.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
        <p className="text-slate-500 font-bold">Loading card deck...</p>
      </div>
    );
  }

  // Statistics
  const learnedCount = deck.filter(c => c.status === "learned").length;
  const learningCount = deck.filter(c => c.status === "learning").length;
  const progressPercent = Math.round((currentIndex / deck.length) * 100);

  const currentCard = deck[currentIndex];
  const profile = currentCard?.profile;

  // Render Completion Card View
  if (isCompleted) {
    const accuracy = deck.length > 0 ? Math.round((learnedCount / deck.length) * 100) : 0;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl border-2 border-slate-900 p-6 sm:p-8 space-y-6 text-center bubbly-card-shadow ${
          isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
        }`}
      >
        <div className="flex items-center justify-start">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-slate-600 rounded-xl font-display text-[10px] font-extrabold uppercase tracking-wide cursor-pointer flex items-center gap-1 transition-transform active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{preferredLanguage === "EN" ? "Back to Vault" : "ভল্টে ফিরে যান"}</span>
          </button>
        </div>

        <div className="space-y-3">
          <div className="inline-flex p-4 bg-amber-50 dark:bg-amber-950/30 rounded-full border border-amber-300 dark:border-amber-900 animate-bounce">
            <Award className="w-10 h-10 text-amber-500 fill-amber-400" />
          </div>
          <h3 className="font-display font-black text-2xl uppercase tracking-tight">
            {preferredLanguage === "EN" ? "Deck Fully Reviewed!" : "সবগুলো কার্ড রিভিশন শেষ!"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {preferredLanguage === "EN" 
              ? "Awesome memory workout! Consistent flashcard study helps lock difficult vocabulary into permanent memory storage." 
              : "আপনার স্মৃতির চমৎকার অনুশীলন হয়েছে! নিয়মিত ফ্ল্যাশকার্ড রিভিশন কঠিন শব্দগুলোকে স্থায়ীভাবে মনে রাখতে সাহায্য করে।"}
          </p>
        </div>

        {/* Scoring Grid */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          <div className="bg-[#ecf9f4] dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-900/60 p-3 rounded-xl text-center">
            <span className="text-[9px] font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
              {preferredLanguage === "EN" ? "KNEW IT" : "পারফেক্ট"}
            </span>
            <span className="font-display font-black text-xl text-emerald-700 dark:text-emerald-300">{learnedCount}</span>
          </div>

          <div className="bg-[#fff1f2] dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/60 p-3 rounded-xl text-center">
            <span className="text-[9px] font-extrabold text-rose-800 dark:text-rose-400 uppercase tracking-wider block">
              {preferredLanguage === "EN" ? "REVIEW NEXT" : "বাকি আছে"}
            </span>
            <span className="font-display font-black text-xl text-rose-700 dark:text-rose-300">{learningCount}</span>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-900/60 p-3 rounded-xl text-center">
            <span className="text-[9px] font-extrabold text-indigo-800 dark:text-indigo-400 uppercase tracking-wider block">
              {preferredLanguage === "EN" ? "MASTERY" : "দক্ষতা"}
            </span>
            <span className="font-display font-black text-xl text-indigo-700 dark:text-indigo-300">{accuracy}%</span>
          </div>
        </div>

        {/* Action button row */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <button
            onClick={handleReset}
            className="px-5 py-3 border-2 border-slate-900 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-display text-xs font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{preferredLanguage === "EN" ? "Restart Study Session" : "সেশনটি পুনরায় শুরু করুন"}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-3 border-2 border-slate-900 bg-emerald-600 hover:bg-emerald-700 text-white font-display text-xs font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{preferredLanguage === "EN" ? "Return to Word Vault" : "ওয়ার্ড ভল্টে ফিরে যান"}</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={`rounded-3xl border-2 border-slate-900 p-6 space-y-6 transition-all bubbly-card-shadow ${
      isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
    }`}>
      
      {/* CARD VIEWER HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
            title={preferredLanguage === "EN" ? "Back to Saved Word list" : "সংরক্ষিত শব্দ তালিকায় ফিরে যান"}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-display font-black text-base uppercase tracking-tight flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-amber-500 fill-amber-400" />
              <span>{preferredLanguage === "EN" ? "Active Memory Flashcards" : "স্মৃতিশক্তি পরীক্ষা ফ্ল্যাশকার্ডস"}</span>
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {preferredLanguage === "EN" 
                ? "Tap cards to flip. Mark if you correctly remembered or need revision" 
                : "কার্ডে ট্যাপ করে উল্টান। সঠিক মনে থাকলে টিক দিন, নতুবা রিভিশন দিন"}
            </p>
          </div>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleShuffle}
            className="px-3 py-2 border border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-slate-600 rounded-xl font-display text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300"
            title={preferredLanguage === "EN" ? "Shuffle card sequence" : "এলোমেলোভাবে সাজান"}
          >
            <Shuffle className="w-3.5 h-3.5 text-indigo-500" />
            <span>{preferredLanguage === "EN" ? "Shuffle" : "এলোমেলো"}</span>
          </button>

          <button
            onClick={handleReset}
            className="px-3 py-2 border border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-slate-600 rounded-xl font-display text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300"
            title={preferredLanguage === "EN" ? "Reset current scores" : "পুনরায় শুরু করুন"}
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
            <span>{preferredLanguage === "EN" ? "Reset" : "রিসেট"}</span>
          </button>
        </div>
      </div>

      {/* DECK METRICS & PROGRESS BAR */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wide">
          <span>{preferredLanguage === "EN" ? `Card ${currentIndex + 1} of ${deck.length}` : `কার্ড: ${currentIndex + 1} / ${deck.length}`}</span>
          <div className="flex items-center gap-3">
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>{learnedCount} {preferredLanguage === "EN" ? "Mastered" : "সম্পন্ন"}</span>
            </span>
            <span className="text-rose-500 flex items-center gap-1">
              <X className="w-3 h-3" />
              <span>{learningCount} {preferredLanguage === "EN" ? "Review" : "রিভিশন"}</span>
            </span>
          </div>
        </div>

        {/* Progress rail */}
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/60">
          <motion.div 
            className="h-full bg-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      {/* 3D ROTATABLE FLIP CARD WINDOW */}
      <div className="flex items-center justify-center py-4">
        <motion.div 
          onClick={() => setIsFlipped(!isFlipped)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative w-full max-w-md h-72 cursor-pointer [perspective:1000px] select-none"
        >
          {/* Card container with preserve-3d styling */}
          <motion.div 
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 12, mass: 1 }}
            className="relative w-full h-full [transform-style:preserve-3d]"
          >
            
            {/* FRONT SIDE (English Word) */}
            <div className={`absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-3xl border-3 border-slate-900 p-6 flex flex-col justify-between bubbly-card-shadow ${
              isDarkMode ? "bg-slate-800 text-white" : "bg-[#fbfbfd] text-slate-900"
            }`}>
              
              {/* Card top banner */}
              <div className="flex justify-between items-start">
                <span className="text-[8px] font-black font-display px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-full uppercase tracking-widest border border-indigo-200 dark:border-indigo-900">
                  {profile?.partOfSpeech || (preferredLanguage === "EN" ? "Vocabulary Card" : "শব্দ কার্ড")}
                </span>

                {profile?.difficultyLevel && (
                  <span className="text-[8px] font-black font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-500 rounded border border-slate-200 dark:border-slate-800 uppercase">
                    {profile.difficultyLevel}
                  </span>
                )}
              </div>

              {/* Main Content (Front) */}
              <div className="text-center space-y-3">
                <h1 className="font-display font-black text-3xl uppercase tracking-tight break-words px-2 text-indigo-600 dark:text-indigo-400">
                  {currentCard.word}
                </h1>

                {profile?.phonetic && (
                  <p className="text-xs font-mono font-bold text-slate-400 break-words max-w-xs mx-auto">
                    {profile.phonetic}
                  </p>
                )}

                <button
                  onClick={(e) => handleSpeak(currentCard.word, e)}
                  disabled={isPlayingAudio}
                  className={`mx-auto p-2 rounded-full border-2 border-slate-900 text-slate-800 dark:text-white transition-all transform active:scale-90 flex items-center justify-center cursor-pointer ${
                    isPlayingAudio 
                      ? "bg-indigo-100 animate-pulse border-indigo-500" 
                      : "bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900"
                  }`}
                  title="উচ্চারণ শুনুন"
                >
                  <Volume2 className={`w-4 h-4 ${isPlayingAudio ? "text-indigo-600" : ""}`} />
                </button>
              </div>

              {/* Tap prompt */}
              <div className="text-center">
                <span className="text-[9px] font-extrabold font-display uppercase tracking-widest text-slate-400 animate-pulse">
                  {preferredLanguage === "EN" ? "⚡ TAP TO FLIP CARD" : "⚡ কার্ডটি উল্টাতে ট্যাপ করুন"}
                </span>
              </div>
            </div>

            {/* BACK SIDE (Bengali meaning & details) */}
            <div className={`absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl border-3 border-slate-900 p-6 flex flex-col justify-between bubbly-card-shadow ${
              isDarkMode ? "bg-slate-900 text-white" : "bg-[#f4fcf9] text-slate-900"
            }`}>
              
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-[8px] font-black font-display px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-full uppercase tracking-widest border border-emerald-200 dark:border-emerald-900">
                  {preferredLanguage === "EN" ? "DEFINITION & MEANING" : "অর্থ ও ব্যাখ্যা"}
                </span>
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                  {currentCard.word}
                </span>
              </div>

              {/* Main Content (Back) */}
              <div className="space-y-2.5 py-2 overflow-y-auto max-h-[160px] scrollbar-thin">
                {/* Bengali Meaning */}
                <div className="text-center">
                  <span className="text-[8px] font-extrabold font-display text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-0.5">
                    {preferredLanguage === "EN" ? "BENGALI MEANING" : "বাংলা অর্থ"}
                  </span>
                  <h2 className="font-display font-black text-xl text-emerald-700 dark:text-emerald-300">
                    {profile?.bengaliMeaning || (preferredLanguage === "EN" ? "Saved word profile" : "সংরক্ষিত শব্দ")}
                  </h2>
                </div>

                {/* English Definition */}
                {profile?.englishDefinition && (
                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2">
                    <span className="text-[8px] font-extrabold font-display text-slate-400 uppercase tracking-widest block mb-0.5">
                      {preferredLanguage === "EN" ? "ENGLISH DEFINITION" : "ইংরেজি সংজ্ঞা"}
                    </span>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-normal text-center italic">
                      "{profile.englishDefinition}"
                    </p>
                  </div>
                )}

                {/* Example sentence */}
                {profile?.examples && profile.examples.length > 0 && (
                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2 space-y-1">
                    <span className="text-[8px] font-extrabold font-display text-slate-400 uppercase tracking-widest block text-center">
                      {preferredLanguage === "EN" ? "EXAMPLE SENTENCE" : "উদাহরণ বাক্য"}
                    </span>
                    <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 leading-normal text-center">
                      {profile.examples[0].english}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 leading-normal text-center">
                      {profile.examples[0].bengali}
                    </p>
                  </div>
                )}
              </div>

              {/* Tap to flip prompt */}
              <div className="text-center pt-2">
                <span className="text-[9px] font-extrabold font-display uppercase tracking-widest text-emerald-500 animate-pulse">
                  {preferredLanguage === "EN" ? "🔄 TAP TO SEE FRONT" : "🔄 সামনে দেখতে পুনরায় ট্যাপ করুন"}
                </span>
              </div>
            </div>

          </motion.div>
        </motion.div>
      </div>

      {/* MEMORY REVIEW ACTIONS - "Got It" vs "Still Learning" */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        
        {/* Navigation back and forth */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevCard}
            disabled={currentIndex === 0}
            className={`p-2 border border-slate-200 dark:border-slate-800 rounded-xl transition-all ${
              currentIndex === 0 
                ? "opacity-40 cursor-not-allowed" 
                : "hover:border-slate-900 dark:hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
            title={preferredLanguage === "EN" ? "Previous Card" : "পূর্ববর্তী কার্ড"}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="font-mono font-extrabold text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700/60">
            {currentIndex + 1} / {deck.length}
          </span>

          <button
            onClick={() => {
              setIsFlipped(false);
              if (currentIndex < deck.length - 1) {
                setCurrentIndex(prev => prev + 1);
              }
            }}
            disabled={currentIndex === deck.length - 1}
            className={`p-2 border border-slate-200 dark:border-slate-800 rounded-xl transition-all ${
              currentIndex === deck.length - 1 
                ? "opacity-40 cursor-not-allowed" 
                : "hover:border-slate-900 dark:hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
            title={preferredLanguage === "EN" ? "Next Card" : "পরবর্তী কার্ড"}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Got It vs Review buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={handleMarkLearning}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border-2 border-slate-900 bg-rose-50 hover:bg-rose-100 text-rose-700 font-display text-[10px] font-black uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-95"
          >
            <X className="w-4 h-4" />
            <span>{preferredLanguage === "EN" ? "Still Learning" : "রিভিশন লাগবে"}</span>
          </button>

          <button
            onClick={handleMarkLearned}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border-2 border-slate-900 bg-emerald-600 hover:bg-emerald-700 text-white font-display text-[10px] font-black uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-95 shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>{preferredLanguage === "EN" ? "Got It!" : "পেরেছি!"}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
