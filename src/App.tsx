import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  BookOpen,
  Sparkles,
  Check,
  Volume2,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Languages,
  BookOpenCheck,
  Info,
  Award,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  VolumeX,
  Mic,
  MessageCircle,
  Briefcase,
  GraduationCap,
  Heart,
  ExternalLink,
  BookMarked,
  Leaf,
  Gamepad2,
  Menu,
  X,
  Sun,
  Moon,
  Trophy,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  Lock,
  Flame,
  BellRing
} from "lucide-react";
import { WordProfile, TranslationResponse, CuratedCategory } from "./types";
import { PRELOADED_WORDS, CURATED_CATEGORIES, CONVERSATION_TEMPLATES } from "./data";
import WordStudyPage from "./components/WordStudyPage";
import DictionaryResult from "./components/DictionaryResult";
import DailyReminderPanel from "./components/DailyReminderPanel";
import StudyHabitVisualizer from "./components/StudyHabitVisualizer";
import VocabularyFlashcards from "./components/VocabularyFlashcards";
import { LottieFeatureIcon, LottieSuccessCelebration } from "./components/InteractiveLottie";
import { getSpellingSuggestions } from "./utils";
import Achievement from "./components/Achievement";


const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case "MessageCircle":
      return <MessageCircle className="w-5 h-5" />;
    case "Briefcase":
      return <Briefcase className="w-5 h-5" />;
    case "GraduationCap":
      return <GraduationCap className="w-5 h-5" />;
    case "Heart":
      return <Heart className="w-5 h-5" />;
    default:
      return <BookOpen className="w-5 h-5" />;
  }
};


const getFluencyRank = (totalCorrect: number, streak: number) => {
  if (totalCorrect >= 30 && streak >= 5) {
    return {
      titleEN: "Expert",
      titleBN: "ইংলিশ এক্সপার্ট",
      color: "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-orange-600",
      icon: "Trophy",
      descEN: "Top tier fluency with high quiz score and active streak!",
      descBN: "উচ্চ কুইজ স্কোর এবং সক্রিয় ধারাবাহিকতার সাথে সর্বোচ্চ স্তরের দক্ষতা!",
      nextLevel: null
    };
  } else if (totalCorrect >= 10 || streak >= 2) {
    return {
      titleEN: "Scholar",
      titleBN: "ইংলিশ স্কলার",
      color: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-purple-700",
      icon: "Award",
      descEN: "Excellent vocabulary builder with solid study habits.",
      descBN: "দৃঢ় অধ্যয়নের অভ্যাসের সাথে চমৎকার শব্দভাণ্ডার নির্মাতা।",
      nextLevel: {
        reqEN: "Reach 30+ correct quiz answers & 5+ day streak to become an Expert",
        reqBN: "এক্সপার্ট হতে ৩০+ কুইজের সঠিক উত্তর এবং ৫+ দিনের ধারাবাহিকতা অর্জন করুন"
      }
    };
  } else {
    return {
      titleEN: "Novice",
      titleBN: "ইংলিশ নোবিস",
      color: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
      icon: "Award",
      descEN: "Just started learning. Take quizzes and keep a streak to unlock higher ranks!",
      descBN: "শিক্ষা শুরু হয়েছে। উচ্চতর র‍্যাঙ্ক আনলক করতে কুইজ নিন এবং ধারাবাহিকতা বজায় রাখুন!",
      nextLevel: {
        reqEN: "Get 10+ correct answers or a 2-day streak to become a Scholar",
        reqBN: "স্কলার হতে ১০+ কুইজের সঠিক উত্তর অথবা ২ দিনের ধারাবাহিকতা অর্জন করুন"
      }
    };
  }
};


export default function App() {
  // Theme state (Light / Dark mode)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Fluency Rank Modal popup toggler state
  const [showFluencyRankModal, setShowFluencyRankModal] = useState<boolean>(false);

  // Preferred UI language is strictly "EN" (English)
  const [preferredLanguage, setPreferredLanguage] = useState<"EN" | "BN">("EN");

  const changePreferredLanguage = (lang: "EN" | "BN") => {
    setPreferredLanguage("EN");
    try {
      localStorage.setItem("learn_english_easy_pref_lang", "EN");
    } catch (e) {
      console.error(e);
    }
  };

  // Hamburger drawer menu state
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Toggle for English / Bengali input mode in the search bar
  const [searchLang, setSearchLang] = useState<"EN" | "BN">("EN");

  // State for search input
  const [searchWord, setSearchWord] = useState<string>("");
  const [currentWordProfile, setCurrentWordProfile] = useState<WordProfile | null>(null);
  const [featuredWordProfile, setFeaturedWordProfile] = useState<WordProfile | null>(null);
  const [isLoadingWord, setIsLoadingWord] = useState<boolean>(false);
  const [wordLoadingStatus, setWordLoadingStatus] = useState<string>("");
  const [wordError, setWordError] = useState<string | null>(null);

  // State for custom sentence translation/booster
  const [inputSentence, setInputSentence] = useState<string>("");
  const [translationResult, setTranslationResult] = useState<TranslationResponse | null>(null);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState<boolean>(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  // Bookmarked words (persisted in localStorage)
  const [savedWords, setSavedWords] = useState<string[]>([]);
  const [isFlashcardViewActive, setIsFlashcardViewActive] = useState<boolean>(false);

  // Trending category and search suggestions
  const [trendingCategoryIndex, setTrendingCategoryIndex] = useState<number>(() => {
    return new Date().getDate() % CURATED_CATEGORIES.length;
  });
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  // Quick-Peek Modal State and Long Press Refs
  const [peekWord, setPeekWord] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActive = useRef<boolean>(false);

  const startLongPress = (word: string) => {
    isLongPressActive.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPressActive.current = true;
      setPeekWord(word);
      if (navigator.vibrate) {
        try {
          navigator.vibrate(50);
        } catch (e) {}
      }
    }, 600); // Trigger quick peek after 600ms hold
  };

  const endLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };


  // Active Main tab: "home" | "dictionary" | "translator" | "quiz" | "saved" | "study"
  const [activeMainTab, setActiveMainTab] = useState<"home" | "dictionary" | "translator" | "quiz" | "saved" | "study">("home");

  // Active Profile Sub-Tab: "meanings" | "pronunciation" | "fluency" | "examples"
  const [activeSubTab, setActiveSubTab] = useState<"meanings" | "pronunciation" | "fluency" | "examples">("meanings");

  // Audio Playback State
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [ttsErrorMessage, setTtsErrorMessage] = useState<string | null>(null);

  // Pronunciation simulator feedback state
  const [isSimulatingMic, setIsSimulatingMic] = useState<boolean>(false);
  const [micFeedback, setMicFeedback] = useState<{ score: number; text: string } | null>(null);

  // Vocabulary Quiz State
  const [quizStatus, setQuizStatus] = useState<"idle" | "playing" | "ended">("idle");
  const [quizDifficulty, setQuizDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [quizMode, setQuizMode] = useState<"standard" | "synonym">("standard");
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [incorrectWordsInCurrentQuiz, setIncorrectWordsInCurrentQuiz] = useState<string[]>([]);

  // Quiz statistics state
  const [quizStats, setQuizStatsState] = useState<{
    totalQuizzes: number;
    totalQuestions: number;
    totalCorrect: number;
    history: { date: string; score: number; total: number }[];
    wordErrors?: Record<string, number>;
  }>({
    totalQuizzes: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    history: [],
    wordErrors: {}
  });

  // Learning Streak State and helper calculations
  const [streak, setStreak] = useState<number>(0);

  // Daily learning goal and study update states
  const [studyTriggerCount, setStudyTriggerCount] = useState<number>(0);
  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("learn_english_easy_daily_goal");
      return saved ? parseInt(saved, 10) : 5;
    } catch {
      return 5;
    }
  });
  const [triggerGoalCelebration, setTriggerGoalCelebration] = useState(false);
  const [hasCelebratedToday, setHasCelebratedToday] = useState(false);

  const handleDailyGoalChange = (newGoal: number) => {
    setDailyGoal(newGoal);
    try {
      localStorage.setItem("learn_english_easy_daily_goal", newGoal.toString());
    } catch (e) {}
  };

  const wordsLearnedToday = React.useMemo(() => {
    try {
      const storedHistory = localStorage.getItem("learn_english_easy_study_history");
      const sessionsList = storedHistory ? JSON.parse(storedHistory) : [];
      
      const getLocalDateString = (date: Date): string => {
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split("T")[0];
      };

      const todayStr = getLocalDateString(new Date());
      
      const todaySessions = sessionsList.filter((s: any) => {
        try {
          const sessionDate = new Date(s.timestamp);
          const sessionDateStr = getLocalDateString(sessionDate);
          return sessionDateStr === todayStr && (
            s.activityType === "vocabulary_lookup" || 
            s.activityType === "pronunciation_practice" ||
            s.activityType === "quiz"
          );
        } catch (e) {
          return false;
        }
      });
      
      return todaySessions.length;
    } catch (e) {
      return 0;
    }
  }, [studyTriggerCount]);

  useEffect(() => {
    if (wordsLearnedToday >= dailyGoal && dailyGoal > 0) {
      if (!hasCelebratedToday) {
        setTriggerGoalCelebration(true);
        setHasCelebratedToday(true);
      }
    } else {
      setHasCelebratedToday(false);
    }
  }, [wordsLearnedToday, dailyGoal, hasCelebratedToday]);

  // Recently searched words state
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [totalSearches, setTotalSearches] = useState<number>(0);

  // Derived state: Top 5 weakest words from quiz errors
  const weakestWords = Object.entries(quizStats.wordErrors || {})
    .map(([word, count]) => ({ word, count: count as number }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const fluencyRank = getFluencyRank(quizStats.totalCorrect, streak);

  const calculateStreakFromHistory = () => {
    try {
      const storedHistory = localStorage.getItem("learn_english_easy_study_history");
      if (!storedHistory) return 0;
      const parsedSessions = JSON.parse(storedHistory);
      if (!Array.isArray(parsedSessions) || parsedSessions.length === 0) return 0;

      const getLocalDateString = (date: Date): string => {
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split("T")[0];
      };

      const uniqueDates: string[] = Array.from(
        new Set(
          parsedSessions.map((s: any) => {
            try {
              return getLocalDateString(new Date(s.timestamp));
            } catch (e) {
              return "";
            }
          }).filter(Boolean)
        )
      ) as string[];
      uniqueDates.sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());

      let currentStreak = 0;
      const todayStr = getLocalDateString(new Date());
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterdayDate);

      const hasStudiedRecent = uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr);
      
      if (hasStudiedRecent) {
        let checkDate = uniqueDates.includes(todayStr) ? new Date() : yesterdayDate;
        
        while (true) {
          const checkStr = getLocalDateString(checkDate);
          if (uniqueDates.includes(checkStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
      return currentStreak;
    } catch (e) {
      console.error("Error calculating streak:", e);
      return 0;
    }
  };

  const getPast7DaysStreakStatus = () => {
    try {
      const storedHistory = localStorage.getItem("learn_english_easy_study_history");
      const sessionsList = storedHistory ? JSON.parse(storedHistory) : [];
      
      const getLocalDateString = (date: Date): string => {
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split("T")[0];
      };

      const studiedDates = new Set(
        sessionsList.map((s: any) => {
          try {
            return getLocalDateString(new Date(s.timestamp));
          } catch (e) {
            return "";
          }
        }).filter(Boolean)
      );

      const days = [];
      const daysOfWeekNamesEN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const daysOfWeekNamesBN = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = getLocalDateString(d);
        const dayIndex = d.getDay();
        
        days.push({
          dateStr,
          dayNameEN: daysOfWeekNamesEN[dayIndex],
          dayNameBN: daysOfWeekNamesBN[dayIndex],
          isToday: i === 0,
          hasStudied: studiedDates.has(dateStr),
        });
      }
      return days;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  useEffect(() => {
    const updateStreak = () => {
      const currentStreak = calculateStreakFromHistory();
      setStreak(currentStreak);
    };

    updateStreak();
    const interval = setInterval(updateStreak, 1500);
    return () => clearInterval(interval);
  }, []);

  // Dynamic Milestones calculation
  const getMilestones = () => {
    const accuracy = quizStats.totalQuestions > 0 ? (quizStats.totalCorrect / quizStats.totalQuestions) * 100 : 0;
    return [
      {
        id: "first_steps",
        titleEN: "First Steps",
        titleBN: "প্রথম পদক্ষেপ",
        descEN: "Complete your first vocabulary quiz.",
        descBN: "প্রথম কুইজ সম্পন্ন করুন।",
        icon: <BookOpenCheck className="w-5 h-5" />,
        condition: quizStats.totalQuizzes >= 1,
        progressText: `${Math.min(quizStats.totalQuizzes, 1)}/1 quiz`
      },
      {
        id: "fast_learner",
        titleEN: "Fast Learner",
        titleBN: "দ্রুত শিক্ষার্থী",
        descEN: "Complete 3 or more vocabulary quizzes.",
        descBN: "৩ বা তার বেশি কুইজ সম্পন্ন করুন।",
        icon: <Flame className="w-5 h-5" />,
        condition: quizStats.totalQuizzes >= 3,
        progressText: `${Math.min(quizStats.totalQuizzes, 3)}/3 quizzes`
      },
      {
        id: "quiz_master",
        titleEN: "Quiz Master",
        titleBN: "কুইজ মাস্টার",
        descEN: "Answer 15 or more questions correctly.",
        descBN: "১৫ বা তার বেশি প্রশ্নের সঠিক উত্তর দিন।",
        icon: <Trophy className="w-5 h-5" />,
        condition: quizStats.totalCorrect >= 15,
        progressText: `${Math.min(quizStats.totalCorrect, 15)}/15 correct`
      },
      {
        id: "accuracy_champion",
        titleEN: "Accuracy Champ",
        titleBN: "নির্ভুলতা চ্যাম্পিয়ন",
        descEN: "Achieve 80% or higher overall accuracy (min 1 quiz).",
        descBN: "৮০% বা তার বেশি নির্ভুলতা অর্জন করুন (কমপক্ষে ১ কুইজ)।",
        icon: <CheckCircle2 className="w-5 h-5" />,
        condition: quizStats.totalQuizzes >= 1 && accuracy >= 80,
        progressText: quizStats.totalQuizzes >= 1 ? `${accuracy.toFixed(0)}%/80% accuracy` : `0%/80% accuracy`
      }
    ];
  };

  // List of words to try from screenshot
  const TRY_WORDS = [
    "SERENDIPITY",
    "EPHEMERAL",
    "RESILIENCE",
    "ELOQUENT",
    "MELANCHOLY",
    "WISTFUL",
    "AMBIGUOUS",
    "TENACIOUS"
  ];

  // Floating in-app study reminder notification state
  const [inAppNotification, setInAppNotification] = useState<{ title: string; body: string } | null>(null);

  // Auto-dismiss the in-app notification after 6 seconds
  useEffect(() => {
    if (inAppNotification) {
      const timer = setTimeout(() => {
        setInAppNotification(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [inAppNotification]);

  // Periodic background check for daily study reminders (runs every 30 seconds)
  useEffect(() => {
    const checkReminder = () => {
      try {
        const enabled = localStorage.getItem("vocab_reminder_enabled") === "true";
        if (!enabled) return;

        const scheduledTime = localStorage.getItem("vocab_reminder_time") || "09:00";
        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTimeStr = `${currentHours}:${currentMinutes}`;

        if (currentTimeStr === scheduledTime) {
          const todayDateStr = now.toDateString(); // e.g. "Sat Jun 27 2026"
          const lastTriggeredDate = localStorage.getItem("vocab_reminder_last_date");

          if (lastTriggeredDate !== todayDateStr) {
            localStorage.setItem("vocab_reminder_last_date", todayDateStr);

            const savedMsgIdx = parseInt(localStorage.getItem("vocab_reminder_msg_index") || "0", 10);
            const playSound = localStorage.getItem("vocab_reminder_sound") !== "false";
            
            const reminderMessages = [
              {
                title: "🎯 Daily English Vocabulary Practice",
                body: `You have ${savedWords.length || 5} words waiting in your Vault. Spend 2 minutes to review them!`,
                bodyBN: `আপনার ভোকাবুলারি ভল্টে ${savedWords.length || 5}টি শব্দ অপেক্ষমান রয়েছে। ২ মিনিট সময় দিয়ে প্র্যাকটিস করে নিন!`
              },
              {
                title: "🔥 Keep Your Daily Learning Streak Alive!",
                body: "Don't let your streak slip away. Practice speaking and vocabulary now!",
                bodyBN: "আপনার প্রতিদিনের প্র্যাকটিস ধরে রাখুন। এখনই নতুন শব্দ ও সঠিক উচ্চারণ অনুশীলন করুন!"
              },
              {
                title: "🗣️ Master Your Accent Today",
                body: "Your AI Speaking Coach is ready. Let's record and score your pronunciation!",
                bodyBN: "ভয়েস কোচ প্রস্তুত আছে। চলুন আপনার ইংরেজি উচ্চারণ প্র্যাকটিস করে স্কোর দেখে নেই!"
              },
              {
                title: "💡 Expand Your Word Horizons",
                body: "A small effort every day leads to fluent English speaking. Open your study page!",
                bodyBN: "প্রতিদিনের ছোট চেষ্টা আপনাকে গড়বে অনর্গল ইংরেজি বলায় পারদর্শী। স্টাডি পেজটি খুলুন!"
              }
            ];

            const msg = reminderMessages[savedMsgIdx] || reminderMessages[0];
            const actualBody = preferredLanguage === "EN" ? msg.body : msg.bodyBN;

            // Trigger Chime
            if (playSound) {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const playNote = (freq: number, start: number, duration: number) => {
                const osc = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                osc.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                osc.frequency.value = freq;
                osc.type = "sine";
                gainNode.gain.setValueAtTime(0, start);
                gainNode.gain.linearRampToValueAtTime(0.15, start + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);
                osc.start(start);
                osc.stop(start + duration);
              };
              const nowAudio = audioCtx.currentTime;
              playNote(880, nowAudio, 0.4);
              playNote(1318.51, nowAudio + 0.12, 0.6);
            }

            // Browser Notification API
            if ("Notification" in window && Notification.permission === "granted") {
              try {
                new Notification(msg.title, {
                  body: actualBody,
                  icon: "/favicon.ico",
                  tag: "vocab-study-reminder"
                });
              } catch (e) {
                console.warn("Native Notification trigger failed inside iframe container, showing toast only:", e);
              }
            }

            // Fallback in-app banner alert
            setInAppNotification({
              title: msg.title,
              body: actualBody
            });
          }
        }
      } catch (err) {
        console.error("Failed to check or trigger study reminder alarm:", err);
      }
    };

    const intervalId = setInterval(checkReminder, 30000);
    return () => clearInterval(intervalId);
  }, [savedWords, preferredLanguage]);

  // Initialize
  useEffect(() => {
    // Default featured word load
    setCurrentWordProfile(PRELOADED_WORDS["accomplish"]);
    setFeaturedWordProfile(PRELOADED_WORDS["accomplish"]);

    // Load saved words from localStorage
    try {
      const stored = localStorage.getItem("learn_english_easy_saved");
      if (stored) {
        setSavedWords(JSON.parse(stored));
      } else {
        const initial = ["accomplish", "resilience", "ambiguous"];
        setSavedWords(initial);
        localStorage.setItem("learn_english_easy_saved", JSON.stringify(initial));
      }
    } catch (e) {
      console.error("Failed to load saved words", e);
    }

    // Load quiz stats from localStorage
    try {
      const storedStats = localStorage.getItem("learn_english_easy_quiz_stats");
      if (storedStats) {
        setQuizStatsState(JSON.parse(storedStats));
      }
    } catch (e) {
      console.error("Failed to load quiz stats", e);
    }

    // Load recent searches from localStorage
    try {
      const storedSearches = localStorage.getItem("learn_english_easy_recent_searches");
      if (storedSearches) {
        setRecentSearches(JSON.parse(storedSearches));
      } else {
        const initialSearches = ["accomplish", "resilience", "ambiguous"];
        setRecentSearches(initialSearches);
        localStorage.setItem("learn_english_easy_recent_searches", JSON.stringify(initialSearches));
      }
    } catch (e) {
      console.error("Failed to load recent searches", e);
    }

    // Load total searches from localStorage
    try {
      const storedTotalSearches = localStorage.getItem("learn_english_easy_total_searches");
      if (storedTotalSearches) {
        setTotalSearches(parseInt(storedTotalSearches, 10));
      } else {
        const storedSearches = localStorage.getItem("learn_english_easy_recent_searches");
        const initialCount = storedSearches ? JSON.parse(storedSearches).length : 3;
        setTotalSearches(initialCount);
        localStorage.setItem("learn_english_easy_total_searches", initialCount.toString());
      }
    } catch (e) {
      console.error("Failed to load total searches", e);
    }
  }, []);

  // Save/Unsave Bookmarked Words
  const toggleBookmark = (word: string) => {
    let updated: string[];
    const cleanWord = word.toLowerCase();
    if (savedWords.includes(cleanWord)) {
      updated = savedWords.filter((w) => w.toLowerCase() !== cleanWord);
    } else {
      updated = [...savedWords, cleanWord];
    }
    setSavedWords(updated);
    localStorage.setItem("learn_english_easy_saved", JSON.stringify(updated));
  };

  // Helper to add word to recently searched words list
  const addToRecentSearches = (word: string) => {
    const clean = word.trim().toLowerCase();
    if (!clean) return;

    setTotalSearches((prev) => {
      const updatedCount = prev + 1;
      try {
        localStorage.setItem("learn_english_easy_total_searches", updatedCount.toString());
      } catch (e) {
        console.error("Failed to save total searches count", e);
      }
      return updatedCount;
    });

    setRecentSearches((prev) => {
      const filtered = prev.filter((w) => w !== clean);
      const updated = [clean, ...filtered].slice(0, 10);
      try {
        localStorage.setItem("learn_english_easy_recent_searches", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save recent searches", e);
      }
      return updated;
    });
  };

  // Trigger search on server API or fall back to preloaded
  const handleSearch = async (wordToSearch: string) => {
    if (!wordToSearch || wordToSearch.trim() === "") return;
    const cleanWord = wordToSearch.trim().toLowerCase();

    setIsLoadingWord(true);
    setWordLoadingStatus("Analyzing word with primary translation channel...");
    setWordError(null);
    setSearchSuggestions([]);
    setTtsErrorMessage(null);
    setMicFeedback(null);
    setActiveMainTab("study");

    // If preloaded, load it immediately to keep it extremely snappy!
    if (PRELOADED_WORDS[cleanWord]) {
      setCurrentWordProfile(PRELOADED_WORDS[cleanWord]);
      setIsLoadingWord(false);
      setSearchWord(wordToSearch);
      setActiveSubTab("meanings");

      // Add to recent searches
      addToRecentSearches(cleanWord);

      // Log lookup study session
      try {
        const historyStored = localStorage.getItem("learn_english_easy_study_history");
        const currentHistory = historyStored ? JSON.parse(historyStored) : [];
        const newSession = {
          id: `session-lookup-${Date.now()}`,
          timestamp: new Date().toISOString(),
          durationMinutes: 1,
          activityType: "vocabulary_lookup"
        };
        localStorage.setItem("learn_english_easy_study_history", JSON.stringify([...currentHistory, newSession]));
        setStudyTriggerCount(prev => prev + 1);
      } catch (e) {}

      return;
    }

    // Set up client-side timers to update loading feedback during the 40-second window
    const timer1 = setTimeout(() => {
      setWordLoadingStatus("Taking longer than usual... (Switching servers)");
    }, 7000);

    const timer2 = setTimeout(() => {
      setWordLoadingStatus("Optimizing response channels... (Retrying lookup)");
    }, 15000);

    const timer3 = setTimeout(() => {
      setWordLoadingStatus("Connecting to auxiliary backup server...");
    }, 25000);

    try {
      const response = await fetch(`/api/dictionary?word=${encodeURIComponent(cleanWord)}`);
      if (!response.ok) {
        throw new Error("শব্দটি খোঁজা ব্যর্থ হয়েছে। অনুগ্রহ করে ইন্টারনেট কানেকশন বা বানান চেক করুন।");
      }
      const data: WordProfile = await response.json();
      if (data && data.word) {
        setCurrentWordProfile(data);
        setSearchWord(data.word);
        setActiveSubTab("meanings");

        // Add to recent searches
        addToRecentSearches(data.word);

        // Log lookup study session
        try {
          const historyStored = localStorage.getItem("learn_english_easy_study_history");
          const currentHistory = historyStored ? JSON.parse(historyStored) : [];
          const newSession = {
            id: `session-lookup-${Date.now()}`,
            timestamp: new Date().toISOString(),
            durationMinutes: 2,
            activityType: "vocabulary_lookup"
          };
          localStorage.setItem("learn_english_easy_study_history", JSON.stringify([...currentHistory, newSession]));
          setStudyTriggerCount(prev => prev + 1);
        } catch (e) {}
      } else {
        throw new Error("ভুল ডেটা ফরম্যাট পাওয়া গেছে। আবার চেষ্টা করুন।");
      }
    } catch (err: any) {
      console.error(err);
      const suggestions = getSpellingSuggestions(cleanWord, Object.keys(PRELOADED_WORDS));
      setSearchSuggestions(suggestions);
      setWordError(err.message || "কোনো সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsLoadingWord(false);
    }
  };

  // Translate or Boost Sentence
  const handleTranslateSentence = async (text: string) => {
    if (!text || text.trim() === "") return;
    setIsLoadingTranslation(true);
    setTranslationError(null);
    setActiveMainTab("translator");

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence: text.trim() }),
      });

      if (!response.ok) {
        throw new Error(preferredLanguage === "EN" ? "Failed to translate and analyze. Please try again." : "অনুবাদ ও বিশ্লেষণ করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
      }

      const data: TranslationResponse = await response.json();
      setTranslationResult(data);
    } catch (err: any) {
      console.error(err);
      setTranslationError(err.message || (preferredLanguage === "EN" ? "An internal error occurred. Please try again." : "কোনো অভ্যন্তরীণ সমস্যা হয়েছে। আবার চেষ্টা করুন।"));
    } finally {
      setIsLoadingTranslation(false);
    }
  };

  // Text-To-Speech Pronunciation helper
  const handleSpeak = (text: string, lang: string = "en-US") => {
    if (!window.speechSynthesis) {
      setTtsErrorMessage(preferredLanguage === "EN" ? "Your browser does not support speech synthesis." : "আপনার ব্রাউজারে স্পিচ সিন্থেসিস সাপোর্ট করে না।");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.82; // Slightly slower for language learners to catch clarity!

    utterance.onstart = () => {
      setIsPlayingAudio(text);
      setTtsErrorMessage(null);
    };

    utterance.onend = () => {
      setIsPlayingAudio(null);
    };

    utterance.onerror = (e) => {
      // Log as warning rather than error because speech synthesis is often blocked or restricted
      // by browser/iframe security policies or headless testing environments.
      console.warn("Speech synthesis error info:", e);
      setIsPlayingAudio(null);
      setTtsErrorMessage(preferredLanguage === "EN" ? "Audio may not work in this iframe environment due to browser security. Please open the app in a new tab." : "আইফ্রেম সিকিউরিটি পলিসির কারণে অডিও কাজ নাও করতে পারে। নতুন ট্যাবে অ্যাপটি খুলুন।");
    };

    window.speechSynthesis.speak(utterance);
  };

  // Simulate speaking feedback for practice
  const handleSimulateSpeaking = (targetWord: string) => {
    setIsSimulatingMic(true);
    setMicFeedback(null);

    // Simulate analysis of pronunciation with high-contrast playful feedback
    setTimeout(() => {
      setIsSimulatingMic(false);
      const scores = [85, 92, 78, 96, 88];
      const selectedScore = scores[Math.floor(Math.random() * scores.length)];

      let feedbackText = "";
      if (preferredLanguage === "EN") {
        if (selectedScore >= 90) {
          feedbackText = "Excellent! Your pronunciation is absolutely perfect. Syllables and stress were spot on.";
        } else if (selectedScore >= 80) {
          feedbackText = "Great job! Your tongue placement is correct, just release slightly more breath at the end.";
        } else {
          feedbackText = "Good effort! Try checking the phonetic guide and pronounce each syllable more clearly.";
        }
      } else {
        if (selectedScore >= 90) {
          feedbackText = "অসাধারণ! আপনার উচ্চারণ একেবারেই নিখুঁত হয়েছে। syllables ও স্ট্রেস চমৎকার ছিল।";
        } else if (selectedScore >= 80) {
          feedbackText = "খুব ভালো! আপনার জিবের পজিশন সঠিক আছে, শুধু শেষাংশের দিকে বাতাস আর একটু বেশি ছাড়ুন।";
        } else {
          feedbackText = "ভালো চেষ্টা! phonetic উচ্চারণ নির্দেশিকা দেখে সিলেবলগুলো আরেকটু স্পষ্ট করে বলুন।";
        }
      }

      setMicFeedback({
        score: selectedScore,
        text: feedbackText
      });

      // Log pronunciation practice study session
      try {
        const historyStored = localStorage.getItem("learn_english_easy_study_history");
        const currentHistory = historyStored ? JSON.parse(historyStored) : [];
        const newSession = {
          id: `session-speak-${Date.now()}`,
          timestamp: new Date().toISOString(),
          durationMinutes: 3,
          activityType: "pronunciation_practice"
        };
        localStorage.setItem("learn_english_easy_study_history", JSON.stringify([...currentHistory, newSession]));
        setStudyTriggerCount(prev => prev + 1);
      } catch (e) {}

      // Pronounce it out loud so the user gets the correction
      handleSpeak(targetWord);
    }, 1800);
  };

  // Generate Questions for Vocabulary Quiz
  const startNewQuiz = () => {
    setQuizStatus("playing");
    setCurrentQuestionIndex(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setIncorrectWordsInCurrentQuiz([]);

    // Build some engaging questions from the dataset + default set based on chosen difficulty
    let questionsList = [];

    if (quizMode === "synonym") {
      if (quizDifficulty === "Beginner") {
        questionsList = [
          {
            questionText: "Which word is a synonym (similar meaning) of the word 'frequent'?",
            options: [
              "Rare or uncommon",
              "Happening often",
              "Slow and steady",
              "Quiet and calm"
            ],
            correctAnswer: "Happening often",
            explanation: "'frequent' means occurring or done on many occasions, so 'happening often' is its direct synonym.",
            associatedWord: "frequent"
          },
          {
            questionText: "Which word is the best synonym for 'hesitate'?",
            options: ["Pause or delay", "Rush forward", "Speak loudly", "Decide instantly"],
            correctAnswer: "Pause or delay",
            explanation: "'hesitate' means to pause before saying or doing something, especially through uncertainty.",
            associatedWord: "hesitate"
          },
          {
            questionText: "Choose the antonym (opposite meaning) for 'reluctant'.",
            options: ["Hesitant", "Lazy", "Eager", "Doubtful"],
            correctAnswer: "Eager",
            explanation: "'reluctant' means unwilling or hesitant, so its direct antonym is 'eager'.",
            associatedWord: "reluctant"
          },
          {
            questionText: "What is a synonym for 'inquire'?",
            options: ["Answer", "Ask or investigate", "Ignore", "Deliver"],
            correctAnswer: "Ask or investigate",
            explanation: "'inquire' means to ask for information, investigate, or seek answers.",
            associatedWord: "inquire"
          },
          {
            questionText: "What is the antonym (opposite) of the word 'sustain'?",
            options: ["Maintain", "Support", "Weaken or abandon", "Prolong"],
            correctAnswer: "Weaken or abandon",
            explanation: "'sustain' means to strengthen, support, or keep something going. Its opposite is to weaken or abandon.",
            associatedWord: "sustain"
          }
        ];
      } else if (quizDifficulty === "Advanced") {
        questionsList = [
          {
            questionText: "What is the best synonym for the advanced word 'resilience'?",
            options: [
              "Fragility and weakness",
              "Adaptability and toughness",
              "Extreme lethargy",
              "Apathy and disinterest"
            ],
            correctAnswer: "Adaptability and toughness",
            explanation: "'resilience' is the capacity to recover quickly from difficulties, representing durability and adaptability.",
            associatedWord: "resilience"
          },
          {
            questionText: "Which of the following is a synonym of the academic word 'apathy'?",
            options: ["Enthusiasm", "Indifference or lack of interest", "Empathy", "Sympathy"],
            correctAnswer: "Indifference or lack of interest",
            explanation: "'apathy' represents a lack of interest, enthusiasm, or concern.",
            associatedWord: "apathy"
          },
          {
            questionText: "Choose the antonym (opposite meaning) of 'tenacious'.",
            options: ["Persistent", "Stubborn", "Irresolute or weak-willed", "Strong"],
            correctAnswer: "Irresolute or weak-willed",
            explanation: "'tenacious' means holding fast, persistent, and determined. Its antonym is irresolute, weak-willed, or yielding.",
            associatedWord: "tenacious"
          },
          {
            questionText: "What is the best synonym for 'eloquent'?",
            options: ["Silent and reserved", "Articulate or expressive", "Confused", "Hesitant"],
            correctAnswer: "Articulate or expressive",
            explanation: "'eloquent' means fluent or persuasive in speaking or writing, so 'articulate' is a perfect synonym.",
            associatedWord: "eloquent"
          },
          {
            questionText: "Which word is the opposite (antonym) of 'exuberant'?",
            options: ["Enthusiastic", "Depressed or sullen", "Energetic", "Cheerful"],
            correctAnswer: "Depressed or sullen",
            explanation: "'exuberant' means filled with energy and excitement, so its antonym is depressed, sullen, or gloomy.",
            associatedWord: "exuberant"
          }
        ];
      } else {
        // Default to Intermediate
        questionsList = [
          {
            questionText: "What is the best synonym for 'accomplish'?",
            options: ["Fail", "Achieve or complete", "Delay", "Overlook"],
            correctAnswer: "Achieve or complete",
            explanation: "'accomplish' means to achieve, complete, or execute successfully.",
            associatedWord: "accomplish"
          },
          {
            questionText: "Which of the following is a synonym for 'collaborate'?",
            options: ["Compete", "Work together", "Isolate", "Oppose"],
            correctAnswer: "Work together",
            explanation: "'collaborate' means to work jointly on an activity or project with others.",
            associatedWord: "collaborate"
          },
          {
            questionText: "Which word is the antonym (opposite) of 'feasible'?",
            options: ["Possible", "Practical", "Impossible", "Beneficial"],
            correctAnswer: "Impossible",
            explanation: "'feasible' means possible and practical to do easily, so its antonym is 'impossible'.",
            associatedWord: "feasible"
          },
          {
            questionText: "Which word is a synonym for 'ambiguous'?",
            options: ["Vague or unclear", "Certain", "Loud", "Short"],
            correctAnswer: "Vague or unclear",
            explanation: "'ambiguous' means having more than one interpretation; unclear or vague.",
            associatedWord: "ambiguous"
          },
          {
            questionText: "Choose the antonym (opposite meaning) for the word 'prioritize'.",
            options: ["Neglect or ignore", "Organize", "Prefer", "Highlight"],
            correctAnswer: "Neglect or ignore",
            explanation: "'prioritize' means to treat something as more important than other things. Its opposite is to neglect or ignore.",
            associatedWord: "prioritize"
          }
        ];
      }
    } else {
      if (quizDifficulty === "Beginner") {
        questionsList = [
          {
            questionText: "What does the word 'essential' mean?",
            options: [
              "Something optional or extra",
              "Extremely important or absolutely necessary",
              "Very noisy or loud",
              "Slow and sluggish to complete"
            ],
            correctAnswer: "Extremely important or absolutely necessary",
            explanation: "'essential' means absolutely necessary, indispensable, or of the utmost importance.",
            associatedWord: "essential"
          },
          {
            questionText: "Which word is the antonym (opposite) of 'reluctant'?",
            options: ["hesitant", "eager", "lazy", "doubtful"],
            correctAnswer: "eager",
            explanation: "'reluctant' means unwilling or hesitant, so its direct antonym is 'eager'.",
            associatedWord: "reluctant"
          },
          {
            questionText: "What is the part of speech of the word 'essential'?",
            options: ["Noun", "Verb", "Adjective", "Adverb"],
            correctAnswer: "Adjective",
            explanation: "'essential' describes a characteristic or quality of a noun (e.g., 'essential task'), so it is an Adjective.",
            associatedWord: "essential"
          },
          {
            questionText: "If two people 'collaborate', what are they doing?",
            options: [
              "Fighting over a personal problem",
              "Working together jointly to achieve something",
              "Ignoring each other's opinions entirely",
              "Speaking at the exact same time"
            ],
            correctAnswer: "Working together jointly to achieve something",
            explanation: "'collaborate' means to work jointly on an activity or project, especially to produce or create something.",
            associatedWord: "collaborate"
          },
          {
            questionText: "Choose the correct phonetic pronunciation guide for the word 'collaborate'.",
            options: [
              "/kəˈlæb.ə.reɪt/ (kuh-lab-uh-reyt)",
              "/əˈkʌm.plɪʃ/ (uh-kum-plish)",
              "/ɪˈsen.ʃəl/ (ih-sen-shuhl)",
              "/ˈe.lɪ.kwənt/ (el-uh-kwuhnt)"
            ],
            correctAnswer: "/kəˈlæb.ə.reɪt/ (kuh-lab-uh-reyt)",
            explanation: "'collaborate' is pronounced as /kəˈlæb.ə.reɪt/, placing the primary stress on the second syllable '-lab-'.",
            associatedWord: "collaborate"
          }
        ];
      } else if (quizDifficulty === "Advanced") {
        questionsList = [
          {
            questionText: "What does the word 'resilience' mean?",
            options: [
              "The ability to recover quickly from difficulties; toughness",
              "An extremely lazy feeling or reluctance to work",
              "A complete misunderstanding or suspicious error",
              "Achieving a simple task very quickly"
            ],
            correctAnswer: "The ability to recover quickly from difficulties; toughness",
            explanation: "'resilience' means the capacity to recover quickly from difficulties, adapt to adversity, or spring back into shape.",
            associatedWord: "resilience"
          },
          {
            questionText: "Which word means 'fluent, persuasive, or elegant in speaking or writing'?",
            options: ["eloquent", "redundant", "cognitive", "tenacious"],
            correctAnswer: "eloquent",
            explanation: "'eloquent' describes speech or writing that is fluent, expressive, and highly persuasive.",
            associatedWord: "eloquent"
          },
          {
            questionText: "If something is described as 'redundant', it is:",
            options: [
              "Extremely rare and highly valuable",
              "No longer needed or useful; superfluous",
              "Absolutely vital and mandatory for a process",
              "Extremely fast, automated, and streamlined"
            ],
            correctAnswer: "No longer needed or useful; superfluous",
            explanation: "'redundant' refers to something that is not or no longer needed, often because it is a duplicate or superfluous.",
            associatedWord: "redundant"
          },
          {
            questionText: "What is the part of speech of the word 'resilience'?",
            options: ["Noun", "Verb", "Adjective", "Adverb"],
            correctAnswer: "Noun",
            explanation: "'resilience' is a Noun describing the abstract quality or capacity of being resilient.",
            associatedWord: "resilience"
          },
          {
            questionText: "Which word describes a person who is extremely persistent, keeping a firm hold, and never giving up?",
            options: ["reluctant", "ambiguous", "tenacious", "eloquent"],
            correctAnswer: "tenacious",
            explanation: "'tenacious' means tending to keep a firm hold of something; clinging or adhering closely; extremely persistent and determined.",
            associatedWord: "tenacious"
          }
        ];
      } else {
        // Default to Intermediate
        questionsList = [
          {
            questionText: "What does the word 'resilience' mean?",
            options: [
              "The ability to recover quickly from difficulties; toughness",
              "An extremely lazy feeling or reluctance",
              "A misunderstanding or something suspicious",
              "Achieving a goal very quickly"
            ],
            correctAnswer: "The ability to recover quickly from difficulties; toughness",
            explanation: "'resilience' means the capacity to recover quickly from difficulties or adapt to adversity.",
            associatedWord: "resilience"
          },
          {
            questionText: "Which word means 'to succeed in doing something, especially after work'?",
            options: ["resilience", "accomplish", "ambiguous", "reluctant"],
            correctAnswer: "accomplish",
            explanation: "'accomplish' means to successfully complete or achieve a major goal.",
            associatedWord: "accomplish"
          },
          {
            questionText: "What is the part of speech of the word 'ambiguous'?",
            options: ["Noun", "Verb", "Adjective", "Preposition"],
            correctAnswer: "Adjective",
            explanation: "'ambiguous' is an Adjective used to describe something that is unclear or has double meaning.",
            associatedWord: "ambiguous"
          },
          {
            questionText: "If instructions are 'ambiguous', it means they are:",
            options: [
              "Very easy and crystal clear to understand",
              "Having more than one possible meaning, unclear",
              "Written in a foreign language",
              "Extremely loud and noisy"
            ],
            correctAnswer: "Having more than one possible meaning, unclear",
            explanation: "'ambiguous' means unclear, vague, or open to more than one interpretation.",
            associatedWord: "ambiguous"
          },
          {
            questionText: "Choose the correct phonetic pronunciation guide for 'accomplish'.",
            options: [
              "/æmˈbɪɡ.ju.əs/ (am-big-yoo-uhs)",
              "/rɪˈzɪl.jəns/ (ri-zil-yuhns)",
              "/əˈkʌm.plɪʃ/ (uh-kum-plish)",
              "/colˈlab.o.rate/ (koh-lab-uh-reyt)"
            ],
            correctAnswer: "/əˈkʌm.plɪʃ/ (uh-kum-plish)",
            explanation: "'accomplish' places the main stress on the second syllable '-com-', pronounced as /əˈkʌm.plɪʃ/.",
            associatedWord: "accomplish"
          }
        ];
      }
    }

    setQuizQuestions(questionsList);
  };

  // Submit Answer in Quiz
  const submitAnswer = (option: string) => {
    if (selectedAnswer !== null) return; // Prevent double answer
    setSelectedAnswer(option);
    const correct = option === quizQuestions[currentQuestionIndex].correctAnswer;
    setIsAnswerCorrect(correct);
    if (correct) {
      setQuizScore((prev) => prev + 1);
    } else {
      const currentWord = quizQuestions[currentQuestionIndex]?.associatedWord;
      if (currentWord) {
        setIncorrectWordsInCurrentQuiz((prev) => [...prev, currentWord]);
      }
    }
  };

  // Record quiz stats to state and localStorage
  const recordQuizResult = (finalScore: number, totalQuestions: number, errorsList: string[]) => {
    // 1. Log study session to habit tracker history
    try {
      const historyStored = localStorage.getItem("learn_english_easy_study_history");
      const currentHistory = historyStored ? JSON.parse(historyStored) : [];
      const newSession = {
        id: `session-quiz-${Date.now()}`,
        timestamp: new Date().toISOString(),
        durationMinutes: Math.max(5, Math.floor(totalQuestions * 1.5)),
        activityType: "quiz"
      };
      localStorage.setItem("learn_english_easy_study_history", JSON.stringify([...currentHistory, newSession]));
      setStudyTriggerCount(prev => prev + 1);
    } catch (e) {
      console.warn("Failed to record study session on quiz completion:", e);
    }

    setQuizStatsState((prev) => {
      const newHistoryItem = {
        date: new Date().toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        timestamp: new Date().toISOString(),
        score: finalScore,
        total: totalQuestions,
      };

      const updatedWordErrors = { ...(prev.wordErrors || {}) };
      errorsList.forEach((word) => {
        const cleanWord = word.trim().toLowerCase();
        if (cleanWord) {
          updatedWordErrors[cleanWord] = (updatedWordErrors[cleanWord] || 0) + 1;
        }
      });

      const updated = {
        totalQuizzes: prev.totalQuizzes + 1,
        totalQuestions: prev.totalQuestions + totalQuestions,
        totalCorrect: prev.totalCorrect + finalScore,
        history: [newHistoryItem, ...prev.history].slice(0, 20), // Keep last 20 attempts
        wordErrors: updatedWordErrors,
      };
      localStorage.setItem("learn_english_easy_quiz_stats", JSON.stringify(updated));
      return updated;
    });
  };

  // Next Question in Quiz
  const nextQuizQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    if (currentQuestionIndex + 1 < quizQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizStatus("ended");
      recordQuizResult(quizScore, quizQuestions.length, incorrectWordsInCurrentQuiz);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200";
      case "intermediate":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "advanced":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "MessageCircle":
        return <MessageCircle className="w-5 h-5 text-emerald-600" />;
      case "Briefcase":
        return <Briefcase className="w-5 h-5 text-indigo-600" />;
      case "GraduationCap":
        return <GraduationCap className="w-5 h-5 text-amber-600" />;
      case "Heart":
        return <Heart className="w-5 h-5 text-rose-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-blue-600" />;
    }
  };

  // Custom function to speak words from the quiz
  const playQuizAudio = (text: string) => {
    handleSpeak(text);
  };

  return (
    <div className={`min-h-screen text-slate-800 font-sans antialiased flex flex-col transition-colors duration-300 ${
      isDarkMode ? "bg-[#0b1311] text-[#e2f1ec]" : "bg-[#ecf9f4]"
    }`}>
      
      {/* DAILY GOAL COMPLETED CELEBRATION OVERLAY */}
      <LottieSuccessCelebration 
        trigger={triggerGoalCelebration} 
        onComplete={() => setTriggerGoalCelebration(false)} 
        isDarkMode={isDarkMode} 
      />
      
      {/* FLOATING IN-APP STUDY REMINDER TOAST BANNER */}
      <div className="fixed top-20 right-4 z-50 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {inAppNotification && (
          <div className="bg-emerald-600 text-white border-2 border-slate-900 rounded-2xl p-4 bubbly-card-shadow pointer-events-auto flex gap-3 select-none transition-all duration-300">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 border border-emerald-400 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-display font-black text-xs uppercase tracking-tight">
                {inAppNotification.title}
              </h4>
              <p className="text-[10px] font-bold leading-normal text-emerald-50">
                {inAppNotification.body}
              </p>
              <div className="flex gap-2 pt-1.5">
                <button
                  onClick={() => {
                    setActiveMainTab("saved");
                    setInAppNotification(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white text-emerald-800 text-[9px] font-black uppercase tracking-wider hover:bg-emerald-50 transition-colors cursor-pointer border border-slate-950"
                >
                  OPEN VAULT
                </button>
                <button
                  onClick={() => setInAppNotification(null)}
                  className="px-2.5 py-1 rounded-lg border border-white/40 hover:border-white text-[9px] font-black uppercase tracking-wider text-white transition-colors cursor-pointer"
                >
                  DISMISS
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* HEADER / NAVIGATION */}
      <header className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        isDarkMode ? "bg-[#0f1d19]/90 border-emerald-950/40" : "bg-[#ecf9f4]/90 border-emerald-100/60"
      } backdrop-blur-md px-4 py-3.5`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          
          {/* Logo Brand with Leaf and streak count */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveMainTab("home")}
              className="flex items-center gap-2.5 group transition-transform hover:scale-102 text-left"
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                isDarkMode ? "bg-emerald-950/80 border border-emerald-800" : "bg-white border-2 border-slate-900 bubbly-card-shadow-sm"
              }`}>
                <Leaf className={`w-6 h-6 ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`} />
              </div>
            </button>

            {/* Premium Interactive Header Streak Counter Pill */}
            <motion.button
              onClick={() => setActiveMainTab("home")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-slate-900 font-display font-extrabold text-[10px] sm:text-[11px] tracking-wider transition-all select-none cursor-pointer ${
                streak > 0
                  ? "bg-amber-400 text-slate-950 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                  : "bg-white text-slate-500 hover:text-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:border-emerald-800"
              }`}
              title={preferredLanguage === "EN" ? `Your daily learning streak: ${streak} days!` : `আপনার প্রতিদিনের পড়ার ধারাবাহিকতা: ${streak} দিন!`}
            >
              <Flame className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${streak > 0 ? "text-orange-600 fill-orange-600 animate-pulse" : "text-slate-400"}`} />
              <span className="font-extrabold">
                {streak} {preferredLanguage === "EN" ? "DAY STREAK" : "দিনের ধারাবাহিকতা"}
              </span>
            </motion.button>

            {/* Dynamic Fluency Rank Badge */}
            <div className="relative">
              <motion.button
                onClick={() => setShowFluencyRankModal(!showFluencyRankModal)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-slate-900 font-display font-black text-[10px] sm:text-[11px] tracking-wider transition-all select-none cursor-pointer ${fluencyRank.color} shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]`}
                title={preferredLanguage === "EN" ? "Your Fluency Rank. Click to see details!" : "আপনার ফ্লুয়েন্সি র‍্যাঙ্ক। বিস্তারিত দেখতে ক্লিক করুন!"}
              >
                {fluencyRank.icon === "Trophy" ? (
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300 animate-bounce" />
                ) : (
                  <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-100" />
                )}
                <span className="uppercase font-black text-[9px] sm:text-[10px]">
                  {preferredLanguage === "EN" ? fluencyRank.titleEN : fluencyRank.titleBN}
                </span>
              </motion.button>

              <AnimatePresence>
                {showFluencyRankModal && (
                  <>
                    {/* Backdrop to close popover */}
                    <div 
                      className="fixed inset-0 z-40 cursor-default" 
                      onClick={() => setShowFluencyRankModal(false)} 
                    />
                    
                    {/* Popover Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 mt-2.5 w-64 sm:w-72 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-2xl p-4 bubbly-card-shadow z-50 text-slate-950 dark:text-white"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-2.5">
                        <h4 className="font-display font-black text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {preferredLanguage === "EN" ? "Fluency Progress" : "দক্ষতার অগ্রগতি"}
                        </h4>
                        <button 
                          onClick={() => setShowFluencyRankModal(false)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3 text-left">
                        {/* Current Rank Badge */}
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-xl border-2 border-slate-900 ${fluencyRank.color}`}>
                            {fluencyRank.icon === "Trophy" ? (
                              <Trophy className="w-5 h-5" />
                            ) : (
                              <Award className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                              {preferredLanguage === "EN" ? "CURRENT RANK" : "বর্তমান র‍্যাঙ্ক"}
                            </div>
                            <h3 className="font-display font-black text-sm uppercase tracking-tight">
                              {preferredLanguage === "EN" ? fluencyRank.titleEN : fluencyRank.titleBN}
                            </h3>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                          {preferredLanguage === "EN" ? fluencyRank.descEN : fluencyRank.descBN}
                        </p>

                        {/* Stats Breakdown */}
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-150 dark:border-slate-800 space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-slate-400">
                              {preferredLanguage === "EN" ? "Quiz Score (Correct):" : "কুইজ স্কোর (সঠিক):"}
                            </span>
                            <span className="font-mono text-slate-900 dark:text-white font-black bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                              {quizStats.totalCorrect}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-slate-400">
                              {preferredLanguage === "EN" ? "Active Study Streak:" : "সক্রিয় ধারাবাহিকতা:"}
                            </span>
                            <span className="font-mono text-slate-900 dark:text-white font-black bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Flame className="w-3 h-3 text-orange-500 fill-orange-500 shrink-0" />
                              {streak} {preferredLanguage === "EN" ? "days" : "দিন"}
                            </span>
                          </div>
                        </div>

                        {/* Next Rank Goal */}
                        {fluencyRank.nextLevel ? (
                          <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-1">
                            <div className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest flex items-center gap-1">
                              <Sparkles className="w-3 h-3 animate-pulse" />
                              {preferredLanguage === "EN" ? "NEXT RANK GOAL" : "পরবর্তী র‍্যাঙ্ক লক্ষ্য"}
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-normal">
                              {preferredLanguage === "EN" ? fluencyRank.nextLevel.reqEN : fluencyRank.nextLevel.reqBN}
                            </p>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                            <div className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest flex items-center gap-1">
                              <Trophy className="w-3 h-3 text-yellow-500" />
                              {preferredLanguage === "EN" ? "MAX LEVEL ACHIEVED" : "সর্বোচ্চ স্তরে আছেন"}
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-normal">
                              {preferredLanguage === "EN" ? "You have reached the ultimate Fluency Rank! Keep practicing!" : "আপনি কুইজে সর্বোচ্চ স্তরের দক্ষতা অর্জন করেছেন! নিয়মিত চর্চা অব্যাহত রাখুন!"}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Header controls: Theme Toggle, Tabs, Hamburger */}
          <div className="flex items-center gap-3">
            
            {/* Desktop Tabs */}
            <nav className="hidden md:flex items-center gap-2 mr-2">
              <button
                onClick={() => { setActiveMainTab("home"); setSearchWord(""); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wide ${
                  activeMainTab === "home" 
                    ? "bg-slate-900 text-white border-2 border-slate-900" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveMainTab("dictionary")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wide ${
                  activeMainTab === "dictionary" 
                    ? "bg-slate-900 text-white border-2 border-slate-900" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                Dictionary
              </button>
              <button
                onClick={() => setActiveMainTab("translator")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wide ${
                  activeMainTab === "translator" 
                    ? "bg-slate-900 text-white border-2 border-slate-900" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                Translator
              </button>
              <button
                onClick={() => setActiveMainTab("quiz")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wide ${
                  activeMainTab === "quiz" 
                    ? "bg-slate-900 text-white border-2 border-slate-900" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                Quiz
              </button>
              <button
                onClick={() => setActiveMainTab("saved")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wide relative ${
                  activeMainTab === "saved" 
                    ? "bg-slate-900 text-white border-2 border-slate-900" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                Saved
                {savedWords.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                    {savedWords.length}
                  </span>
                )}
              </button>
            </nav>



            {/* Light/Dark Mode Switcher precisely styled like screenshot */}
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isDarkMode} 
                  onChange={() => setIsDarkMode(!isDarkMode)} 
                  className="sr-only peer" 
                />
                <div className={`w-14 h-7 rounded-full transition-all duration-300 relative ${
                  isDarkMode 
                    ? "bg-emerald-950 border border-emerald-800" 
                    : "bg-white border-2 border-slate-900 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1)]"
                }`}>
                  {/* Sliding Ball */}
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center ${
                    isDarkMode 
                      ? "left-8 bg-emerald-400" 
                      : "left-1 bg-amber-400 border border-slate-900"
                  }`}>
                    {isDarkMode ? <Moon className="w-3 h-3 text-emerald-950" /> : <Sun className="w-3 h-3 text-slate-900" />}
                  </div>
                </div>
              </label>
            </div>

            {/* Hamburger button */}
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className={`p-2 rounded-xl border-2 border-slate-900 bg-white hover:bg-slate-50 transition-all text-slate-950 ${
                isDarkMode ? "bg-emerald-900/10 text-emerald-400 border-emerald-700/80" : ""
              }`}
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Side Drawer Menu for Mobile/Navigation */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className={`w-80 h-full p-6 flex flex-col justify-between transition-transform ${
            isDarkMode ? "bg-[#0f1d19] text-[#e2f1ec] border-l border-emerald-900" : "bg-white border-l-2 border-slate-900"
          }`}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-display font-extrabold text-lg text-emerald-600 dark:text-emerald-400">NAVIGATION</span>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg border-2 border-slate-900 bg-slate-50 text-slate-950"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Drawer Menu List */}
              <div className="space-y-3">
                <button
                  onClick={() => { setActiveMainTab("home"); setIsDrawerOpen(false); }}
                  className="w-full text-left p-3.5 rounded-xl font-bold font-display text-sm border-2 border-slate-900 hover:bg-emerald-50 hover:-translate-y-0.5 transition-all text-slate-900 bg-white flex items-center gap-2"
                >
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <span>HOME DASHBOARD</span>
                </button>
                <button
                  onClick={() => { setActiveMainTab("dictionary"); setIsDrawerOpen(false); }}
                  className="w-full text-left p-3.5 rounded-xl font-bold font-display text-sm border-2 border-slate-900 hover:bg-emerald-50 hover:-translate-y-0.5 transition-all text-slate-900 bg-white flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>ENGLISH DICTIONARY</span>
                </button>
                <button
                  onClick={() => { setActiveMainTab("translator"); setIsDrawerOpen(false); }}
                  className="w-full text-left p-3.5 rounded-xl font-bold font-display text-sm border-2 border-slate-900 hover:bg-emerald-50 hover:-translate-y-0.5 transition-all text-slate-900 bg-white flex items-center gap-2"
                >
                  <Languages className="w-4 h-4 text-emerald-600" />
                  <span>AI TRANSLATOR</span>
                </button>
                <button
                  onClick={() => { setActiveMainTab("quiz"); setIsDrawerOpen(false); }}
                  className="w-full text-left p-3.5 rounded-xl font-bold font-display text-sm border-2 border-slate-900 hover:bg-emerald-50 hover:-translate-y-0.5 transition-all text-slate-900 bg-white flex items-center gap-2"
                >
                  <Gamepad2 className="w-4 h-4 text-emerald-600" />
                  <span>VOCABULARY QUIZ</span>
                </button>
                <button
                  onClick={() => { setActiveMainTab("saved"); setIsDrawerOpen(false); }}
                  className="w-full text-left p-3.5 rounded-xl font-bold font-display text-sm border-2 border-slate-900 hover:bg-emerald-50 hover:-translate-y-0.5 transition-all text-slate-900 bg-white flex items-center gap-2"
                >
                  <BookMarked className="w-4 h-4 text-emerald-600" />
                  <span>SAVED VOCABULARY ({savedWords.length})</span>
                </button>
              </div>


            </div>

            {/* Bottom drawer info */}
            <div className="p-4 rounded-xl border-2 border-slate-900 bg-emerald-50 text-slate-900 space-y-1.5">
              <span className="text-xs font-bold text-emerald-800">FLUENCY STATUS</span>
              <p className="text-[11px] leading-relaxed font-medium">
                Keep practicing 5 minutes every day! Try dictionary search, pronounce out loud, and check with voice coach.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CORE HERO BRAND SEGMENT FROM SCREENSHOTS */}
      {activeMainTab === "home" && (
        <section className="w-full max-w-4xl mx-auto px-4 pt-12 pb-6 text-center">
          
          {/* Playful Outlined title style matching the screenshot 100% */}
          <div className="inline-block relative select-none">
            <div className="flex flex-col items-center justify-center font-display font-extrabold text-[44px] sm:text-[68px] leading-[0.95] tracking-tighter">
              {/* Row 1: LEARN */}
              <span className="text-[#1e293b] dark:text-[#f3fbf9] uppercase block bubbly-text-shadow-large">
                LEARN <span className="text-[#10b981] bubbly-text-shadow-emerald">ENGLISH</span>
              </span>
              {/* Row 2: EASY */}
              <span className="text-[#1e293b] dark:text-[#f3fbf9] uppercase block mt-1.5 bubbly-text-shadow-large">
                EASY
              </span>
            </div>
          </div>

          {/* Dynamic sub-banner styled like screenshot */}
          <p className="mt-8 text-xs sm:text-sm font-display font-bold text-[#1e293b]/70 dark:text-[#c4ded4] tracking-wider uppercase max-w-xl mx-auto leading-relaxed">
            {preferredLanguage === "EN" ? (
              <span>SEARCH ANY WORD — GET <span className="text-[#10b981] font-extrabold">ENGLISH DEFINITION</span>, PRONUNCIATION, EXAMPLES, TIPS & MORE. 100% FREE.</span>
            ) : (
              <span>SEARCH ANY WORD — GET <span className="text-[#10b981] font-extrabold">BENGALI MEANING</span>, PRONUNCIATION, EXAMPLES, TIPS & MORE. 100% FREE.</span>
            )}
          </p>

          {/* THE PILL SEARCH INPUT CONTAINER */}
          <div className="max-w-xl mx-auto mt-8 relative">
            <div className={`rounded-full border-2 border-slate-900 p-2.5 bg-white flex items-center transition-all ${
              isDarkMode ? "shadow-[2px_2px_0px_0px_#10b981]" : "bubbly-card-shadow"
            }`}>
              
              {/* Language Selection badge slider inside input */}
              <div className="bg-slate-100 p-0.5 rounded-full border border-slate-200 flex items-center shrink-0">
                <button 
                  onClick={() => setSearchLang("EN")}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold font-display transition-all ${
                    searchLang === "EN" 
                      ? "bg-[#10b981] text-white" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  EN
                </button>
                <button 
                  onClick={() => setSearchLang("BN")}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold font-display transition-all ${
                    searchLang === "BN" 
                      ? "bg-[#10b981] text-white" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  BN
                </button>
              </div>

              {/* Input field */}
              <input 
                type="text" 
                placeholder={searchLang === "EN" ? "ENGLISH WORD..." : (preferredLanguage === "EN" ? "BENGALI WORD..." : "বাংলা শব্দ...")} 
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch(searchWord);
                }}
                className="w-full bg-transparent px-4 py-1 text-sm font-display font-extrabold tracking-wide uppercase text-slate-900 placeholder-slate-400 focus:outline-hidden"
              />

              {/* Microphone button inside input */}
              {searchWord && (
                <button
                  onClick={() => handleSimulateSpeaking(searchWord)}
                  className="p-1.5 rounded-full hover:bg-slate-100 transition-colors mr-1 text-slate-500 hover:text-slate-900"
                  title={preferredLanguage === "EN" ? "Practice Pronunciation" : "উচ্চারণ প্র্যাকটিস"}
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}

              {/* Circle Search button */}
              <button 
                onClick={() => handleSearch(searchWord)}
                disabled={isLoadingWord || !searchWord.trim()}
                className="w-10 h-10 rounded-full bg-[#10b981] hover:bg-[#0da471] text-white flex items-center justify-center shrink-0 transition-transform active:scale-95"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* TRY RECOMMENDED PILLS LIST */}
          <div className="max-w-2xl mx-auto mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-display font-extrabold text-slate-900/60 dark:text-[#c4ded4]/70 mr-1 uppercase">
              TRY:
            </span>
            {TRY_WORDS.map((word) => (
              <button
                key={word}
                onClick={() => {
                  setSearchWord(word);
                  handleSearch(word);
                }}
                className="px-4 py-2 rounded-full border-2 border-emerald-100 dark:border-emerald-950 hover:border-slate-900 bg-white dark:bg-slate-900 hover:bg-[#ecf9f4] dark:hover:bg-emerald-950/40 text-[#10b981] dark:text-emerald-400 font-display font-extrabold text-xs tracking-wider uppercase transition-all shadow-xs hover:-translate-y-0.5 active:translate-y-0"
              >
                {word}
              </button>
            ))}
          </div>

        </section>
      )}

      {/* DYNAMIC RESULTS OR ACTIVE SCREEN CHANGER */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 space-y-8">
        
        {/* HOMEPAGE DEFAULT MAIN SECTION (WHEN IN HOME TAB) */}
        {activeMainTab === "home" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-8"
          >

            {/* DYNAMIC LEARNING STREAK BANNER WITH 7-DAY VISUAL TRACKER */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-3xl border-2 border-slate-900 p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden bubbly-card-shadow ${
                isDarkMode ? "bg-slate-900/60 text-white" : "bg-white text-slate-900"
              }`}
            >
              {/* Decorative top-right corner background light bloom */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-2xl opacity-10 pointer-events-none" />

              <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left relative z-10">
                {/* Visual Streak Flame Badge */}
                <div className={`w-14 h-14 rounded-2xl border-2 border-slate-900 flex items-center justify-center shrink-0 ${
                  streak > 0 
                    ? "bg-amber-400 text-slate-950 animate-pulse shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}>
                  <Flame className={`w-8 h-8 ${streak > 0 ? "fill-orange-600 text-orange-600" : ""}`} />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className="text-[10px] font-black font-display tracking-widest uppercase bg-[#10b981] text-white px-2.5 py-0.5 rounded-full">
                      {preferredLanguage === "EN" ? "STUDY MILESTONE" : "স্টাডি মাইলস্টোন"}
                    </span>
                    {streak >= 3 && (
                      <span className="text-[10px] font-black font-display tracking-widest uppercase bg-indigo-600 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-amber-300" />
                        {preferredLanguage === "EN" ? "UNSTOPPABLE!" : "অদম্য!"}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-black text-xl tracking-tight uppercase">
                    {streak > 0 ? (
                      preferredLanguage === "EN" ? (
                        <span>YOU'RE ON A <span className="text-orange-500 font-black">{streak}-DAY</span> STREAK!</span>
                      ) : (
                        <span>আপনি <span className="text-orange-500 font-black">{streak} দিন</span> ধরে টানা শিখছেন!</span>
                      )
                    ) : (
                      preferredLanguage === "EN" ? "START YOUR DAILY PRACTICE!" : "আজকের অনুশীলন শুরু করুন!"
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold max-w-md">
                    {streak > 0 ? (
                      preferredLanguage === "EN" 
                        ? "Amazing commitment! Practice today to keep this flame burning bright." 
                        : "অসাধারণ চেষ্টা! এই ধারাবাহিকতা বজায় রাখতে আজ অন্তত একটি শব্দ বা কুইজ প্র্যাকটিস করুন।"
                    ) : (
                      preferredLanguage === "EN" 
                        ? "Complete a pronunciation task, review cards, or take a quiz to activate your streak!" 
                        : "ধারাবাহিকতা শুরু করতে একটি শব্দ খুজুন, ফ্ল্যাশকার্ড দেখুন বা একটি কুইজ দিন!"
                    )}
                  </p>
                </div>
              </div>

              {/* 7-DAY VISUAL DOTS/FLAMES TRACKER */}
              <div className="flex flex-col items-center md:items-end gap-2 shrink-0 relative z-10 w-full md:w-auto">
                <span className="text-[10px] font-black font-display text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {preferredLanguage === "EN" ? "PAST 7 DAYS ACTIVITY" : "গত ৭ দিনের রেকর্ড"}
                </span>
                
                <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto overflow-x-auto py-1">
                  {getPast7DaysStreakStatus().map((day) => (
                    <div 
                      key={day.dateStr} 
                      className="flex flex-col items-center gap-1.5 min-w-[40px]"
                      title={day.isToday ? (preferredLanguage === "EN" ? "Today" : "আজ") : day.dateStr}
                    >
                      {/* Day Pill/Circle */}
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                          day.hasStudied 
                            ? "bg-amber-400 border-slate-900 text-slate-950 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]" 
                            : day.isToday
                              ? "bg-white border-dashed border-emerald-500 dark:bg-slate-800 text-emerald-500"
                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600"
                        }`}
                      >
                        {day.hasStudied ? (
                          <Flame className="w-5 h-5 fill-orange-600 text-orange-600 animate-pulse" />
                        ) : (
                          <span className="text-[10px] font-black font-display">
                            {preferredLanguage === "EN" ? day.dayNameEN[0] : day.dayNameBN[0]}
                          </span>
                        )}
                      </motion.div>
                      
                      {/* Sub-label for day */}
                      <span className={`text-[9px] font-black font-display tracking-tight uppercase ${
                        day.isToday 
                          ? "text-emerald-500 font-extrabold" 
                          : "text-slate-400 dark:text-slate-500"
                      }`}>
                        {preferredLanguage === "EN" ? day.dayNameEN : day.dayNameBN}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
            
            {/* DAILY LEARNING GOAL PROGRESS BAR */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-3xl border-2 p-6 space-y-4 relative overflow-hidden transition-all duration-500 ${
                wordsLearnedToday >= dailyGoal 
                  ? "border-amber-500 celebration-pulse" 
                  : "border-slate-900 bubbly-card-shadow"
              } ${
                isDarkMode ? "bg-slate-900/60 text-white" : "bg-white text-slate-900"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 border-2 border-slate-900 flex items-center justify-center shrink-0">
                    <BookOpenCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm sm:text-base uppercase tracking-tight text-left">
                      {preferredLanguage === "EN" ? "Daily Study Goal" : "দৈনিক পড়ার লক্ষ্য"}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-left">
                      {preferredLanguage === "EN"
                        ? "Complete your daily target to solidify your English fluency"
                        : "আপনার দৈনিক পড়ার লক্ষ্য পূরণ করে দক্ষতা বাড়ান"}
                    </p>
                  </div>
                </div>

                <div className="text-left flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center gap-1 shrink-0 w-full sm:w-auto">
                  <div className="font-mono text-[10px] font-black uppercase text-slate-400">
                    {preferredLanguage === "EN" ? "Progress" : "অগ্রগতি"}
                  </div>
                  <div className="font-display font-black text-lg">
                    <span className="text-emerald-500 font-black">{wordsLearnedToday}</span>
                    <span className="text-slate-400"> / {dailyGoal}</span>
                    <span className="text-xs text-slate-400 font-bold ml-1">
                      {preferredLanguage === "EN" ? "words" : "টি শব্দ"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div 
                onClick={() => {
                  if (wordsLearnedToday >= dailyGoal) {
                    setTriggerGoalCelebration(false);
                    setTimeout(() => setTriggerGoalCelebration(true), 50);
                  }
                }}
                className={`relative w-full h-6 bg-slate-100 dark:bg-slate-800 rounded-full border-2 border-slate-900 overflow-hidden p-[2px] transition-all duration-300 ${
                  wordsLearnedToday >= dailyGoal 
                    ? "hover:scale-[1.015] border-amber-500 active:scale-[0.99] cursor-pointer" 
                    : ""
                }`}
                title={wordsLearnedToday >= dailyGoal ? (preferredLanguage === "EN" ? "Click to celebrate again! 🎉" : "আবার উদযাপন করতে ক্লিক করুন! 🎉") : ""}
              >
                <motion.div
                  className={`h-full rounded-full transition-all duration-300 ${
                    wordsLearnedToday >= dailyGoal 
                      ? "bg-gradient-to-r from-emerald-500 via-amber-400 to-[#10b981] animate-gradient-flow" 
                      : "bg-gradient-to-r from-emerald-400 to-[#10b981]"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (wordsLearnedToday / dailyGoal) * 100)}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
                
                {/* Celebratory Sparks / Sparkles Inside Progress Bar */}
                {wordsLearnedToday >= dailyGoal && (
                  <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none select-none">
                    <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                    <span className="text-[9px] font-display font-black tracking-widest text-white uppercase text-center flex-1 drop-shadow-md">
                      {preferredLanguage === "EN" ? "GOAL ACHIEVED! 🎉 CLICK TO CELEBRATE" : "লক্ষ্য অর্জিত! 🎉 উদযাপনে ক্লিক করুন"}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                  </div>
                )}
              </div>

              {/* Goal Message */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-bold">
                <div className="text-slate-500 dark:text-slate-400 text-left">
                  {wordsLearnedToday >= dailyGoal ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                      <span>
                        {preferredLanguage === "EN" 
                          ? "🎉 Amazing! You've crushed your daily goal!" 
                          : "🎉 অসাধারণ! আপনি আজকের পড়ার লক্ষ্য সম্পূর্ণ করেছেন!"}
                      </span>
                    </span>
                  ) : (
                    <span>
                      {preferredLanguage === "EN"
                        ? `Study ${dailyGoal - wordsLearnedToday} more word${dailyGoal - wordsLearnedToday === 1 ? "" : "s"} today to finish your daily goal!`
                        : `আজকের লক্ষ্য পূরণ করতে আরও ${dailyGoal - wordsLearnedToday}টি শব্দ পড়তে হবে!`}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    // Navigate to study tab where daily reminders panel is shown
                    setActiveMainTab("study");
                    setTimeout(() => {
                      const el = document.getElementById("vocab-reminder-panel");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center gap-0.5 group uppercase tracking-wider text-[10px] self-end sm:self-auto cursor-pointer"
                >
                  <span>{preferredLanguage === "EN" ? "Adjust Goal" : "লক্ষ্য পরিবর্তন"}</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </motion.div>

            {/* DYNAMIC ACHIEVEMENTS & LEARNING BADGES */}
            <Achievement
              preferredLanguage={preferredLanguage}
              isDarkMode={isDarkMode}
              totalSearches={totalSearches}
              streak={streak}
              totalQuizzes={quizStats.totalQuizzes}
              totalCorrect={quizStats.totalCorrect}
              savedWordsCount={savedWords.length}
            />
            
            {/* HERO CARDS COMPONENT GRID: LANGUAGE TRANSLATOR & QUIZ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: LANGUAGE TRANSLATOR */}
              <button 
                onClick={() => { setActiveMainTab("translator"); }}
                className={`w-full text-left rounded-3xl bg-white p-6 border-2 border-slate-900 hover:-translate-y-1 transition-all flex flex-col justify-between min-h-[160px] cursor-pointer bubbly-card-shadow text-slate-900`}
              >
                <div className="space-y-4">
                  <LottieFeatureIcon theme="languageTranslator" isDarkMode={isDarkMode} />
                  <div>
                    <h3 className="font-display font-extrabold text-lg tracking-tight text-slate-900 uppercase">
                      LANGUAGE TRANSLATOR
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-700 font-semibold mt-1 leading-normal uppercase tracking-wider">
                      TRANSLATE FULL SENTENCES BETWEEN ENGLISH AND BENGALI USING GOOGLE AI.
                    </p>
                  </div>
                </div>
              </button>

              {/* Card 2: VOCABULARY QUIZ */}
              <button 
                onClick={() => { setActiveMainTab("quiz"); startNewQuiz(); }}
                className={`w-full text-left rounded-3xl bg-white p-6 border-2 border-slate-900 hover:-translate-y-1 transition-all flex flex-col justify-between min-h-[160px] cursor-pointer bubbly-card-shadow text-slate-900`}
              >
                <div className="space-y-4">
                  <LottieFeatureIcon theme="vocabularyQuiz" isDarkMode={isDarkMode} />
                  <div>
                    <h3 className="font-display font-extrabold text-lg tracking-tight text-slate-900 uppercase">
                      VOCABULARY QUIZ
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-700 font-semibold mt-1 leading-normal uppercase tracking-wider">
                      TEST YOUR KNOWLEDGE AND PRACTICE YOUR SAVED WORDS WITH OUR INTERACTIVE QUIZ.
                    </p>
                  </div>
                </div>
              </button>

            </div>

            {/* DAILY TRENDING VOCABULARY CATEGORIES SECTOR */}
            <div className="bg-white text-slate-900 rounded-3xl p-6 border-2 border-slate-900 bubbly-card-shadow space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 text-left">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <LottieFeatureIcon theme="dailyTrending" isDarkMode={isDarkMode} />
                    <h3 className="font-display font-extrabold text-base uppercase tracking-tight text-slate-900">
                      {preferredLanguage === "EN" ? "DAILY TRENDING VOCABULARY" : "আজকের ট্রেন্ডিং শব্দভাণ্ডার"}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                    {preferredLanguage === "EN" 
                      ? "Smart word lists recommended daily to build your vocabulary fast." 
                      : "আপনার ভোকাবুলারি দ্রুত বাড়াতে প্রতিদিন ভিন্ন ভিন্ন ক্যাটাগরির শব্দ শেখানো হয়।"}
                  </p>
                </div>

                {/* Control buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => {
                      setTrendingCategoryIndex((prev) => 
                        prev === 0 ? CURATED_CATEGORIES.length - 1 : prev - 1
                      );
                    }}
                    className="p-2 hover:bg-slate-100 border-2 border-slate-900 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer text-xs bg-white text-slate-900"
                    title={preferredLanguage === "EN" ? "Previous Category" : "পূর্ববর্তী ক্যাটাগরি"}
                  >
                    ←
                  </button>
                  <button
                    onClick={() => {
                      setTrendingCategoryIndex((prev) => 
                        (prev + 1) % CURATED_CATEGORIES.length
                      );
                    }}
                    className="p-2 hover:bg-slate-100 border-2 border-slate-900 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer text-xs bg-white text-slate-900"
                    title={preferredLanguage === "EN" ? "Next Category" : "পরবর্তী ক্যাটাগরি"}
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Active Category Header Card */}
              {(() => {
                const activeCategory = CURATED_CATEGORIES[trendingCategoryIndex];
                if (!activeCategory) return null;
                const isDailyMatch = trendingCategoryIndex === (new Date().getDate() % CURATED_CATEGORIES.length);

                return (
                  <div className="space-y-4">
                    <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
                      <div className="flex items-start sm:items-center gap-3 text-left">
                        <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200">
                          {getCategoryIcon(activeCategory.iconName)}
                        </div>
                        <div className="text-left">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="text-[9px] font-black tracking-wider uppercase bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-md">
                              {preferredLanguage === "EN" ? "CATEGORY" : "শ্রেণী"}
                            </span>
                            {isDailyMatch && (
                              <span className="text-[9px] font-black tracking-wider uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md animate-bounce">
                                ⭐ {preferredLanguage === "EN" ? "TODAY'S SPECIAL" : "আজকের সেরা বাছাই"}
                              </span>
                            )}
                          </div>
                          <h4 className="font-display font-extrabold text-sm uppercase tracking-tight text-indigo-950">
                            {preferredLanguage === "EN" ? activeCategory.title : activeCategory.bengaliTitle}
                          </h4>
                          <p className="text-[11px] text-slate-600 font-semibold leading-normal mt-0.5 uppercase tracking-wide">
                            {preferredLanguage === "EN" ? activeCategory.description : activeCategory.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Word Pills grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {activeCategory.words.map((word) => {
                        const preloaded = PRELOADED_WORDS[word.toLowerCase()];
                        return (
                          <div
                            key={word}
                            onClick={() => {
                              setSearchWord(word);
                              handleSearch(word);
                            }}
                            className="group relative border-2 border-slate-200 hover:border-slate-900 rounded-2xl p-4 bg-slate-50 hover:bg-indigo-50/10 transition-all flex flex-col justify-between text-left cursor-pointer h-full hover:-translate-y-0.5"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <h5 className="font-display font-black text-sm uppercase tracking-tight text-indigo-900 group-hover:text-indigo-600 transition-colors">
                                  {word}
                                </h5>
                                {preloaded?.partOfSpeech && (
                                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 bg-white px-1.5 py-0.5 rounded-md border border-slate-200">
                                    {preloaded.partOfSpeech}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 font-semibold leading-relaxed line-clamp-2 uppercase tracking-wide">
                                {preloaded ? (preloaded.bengaliMeaning?.split(/[,;।]/)[0]?.trim() || preloaded.bengaliMeaning) : (preferredLanguage === "EN" ? "Curated word" : "বাছাইকৃত শব্দ")}
                              </p>
                            </div>

                            {/* Actions on card */}
                            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPeekWord(word);
                                }}
                                className="text-[9px] font-black text-slate-500 hover:text-indigo-600 uppercase flex items-center gap-1 transition-colors cursor-pointer"
                                title={preferredLanguage === "EN" ? "Quick Peek" : "একনজর দেখুন"}
                              >
                                <span>PEEK 🎴</span>
                              </button>
                              
                              <span className="text-[9px] font-black text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 uppercase">
                                {preferredLanguage === "EN" ? "STUDY" : "শেখা"} →
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* FEATURED WORD OF THE DAY HEADER */}
            <div className="pt-6 text-center">
              <div className="inline-flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <h2 className="font-display font-extrabold text-2xl uppercase tracking-tight text-slate-900 dark:text-emerald-400 bubbly-text-shadow">
                  WORD OF THE DAY
                </h2>
              </div>
            </div>

            {/* FEATURED WORD DETAIL PREVIEW */}
            {featuredWordProfile && (
              <div className={`rounded-3xl border-2 border-slate-900 p-6 space-y-6 ${
                isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
              } bubbly-card-shadow`}>
                
                {/* Header of Word profile */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-extrabold font-display px-2.5 py-0.5 rounded-full border border-slate-900 uppercase ${
                        getDifficultyColor(featuredWordProfile.difficultyLevel || "Intermediate")
                      }`}>
                        {featuredWordProfile.difficultyLevel || "Intermediate"}
                      </span>
                      <span className="text-[10px] font-extrabold font-display px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-900 uppercase">
                        {featuredWordProfile.partOfSpeech}
                      </span>
                    </div>
                    
                    <h3 className="font-display font-extrabold text-3xl uppercase tracking-tight">
                      {featuredWordProfile.word}
                    </h3>
                    
                    <p className="text-xs text-indigo-600 dark:text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                      <span>{featuredWordProfile.phonetic}</span>
                      <button 
                        onClick={() => handleSpeak(featuredWordProfile.word)}
                        className="p-1 rounded-full hover:bg-slate-100 text-slate-600"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => toggleBookmark(featuredWordProfile.word)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold font-display border-2 border-slate-900 transition-all flex items-center gap-1.5 ${
                        savedWords.includes(featuredWordProfile.word.toLowerCase())
                          ? "bg-amber-400 text-slate-950"
                          : "bg-white text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{savedWords.includes(featuredWordProfile.word.toLowerCase()) ? "SAVED" : "SAVE TO VAULT"}</span>
                    </button>

                    <button 
                      onClick={() => handleSearch(featuredWordProfile.word)}
                      className="px-4 py-2 rounded-xl text-xs font-bold font-display border-2 border-slate-900 bg-[#10b981] text-white hover:bg-[#0da471] transition-all flex items-center gap-1"
                    >
                      <span>SEE FULL STUDY PROFILE</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Meanings & Definition */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#ecf9f4]/60 border border-slate-200">
                    <span className="text-[10px] font-extrabold font-display text-emerald-800 uppercase tracking-widest block mb-1">
                      {preferredLanguage === "EN" ? "BENGALI MEANING & SYNONYMS" : "বাংলা অর্থ ও প্রতিশব্দ"}
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      {featuredWordProfile.bengaliMeaning}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900">
                    <span className="text-[10px] font-extrabold font-display text-slate-500 uppercase tracking-widest block mb-1">
                      ENGLISH DEFINITION
                    </span>
                    <p className="text-xs font-semibold leading-relaxed">
                      {featuredWordProfile.englishDefinition}
                    </p>
                  </div>
                </div>

                {/* Quick Interactive Speaking Tip Section */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900 space-y-3">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-[#10b981]" />
                    <span className="text-xs font-display font-extrabold uppercase text-slate-900">
                      QUICK SPEECH COACHING PRACTICE
                    </span>
                  </div>

                  <p className="text-xs font-semibold">
                    Speak the word <strong className="text-[#10b981] font-extrabold uppercase">{featuredWordProfile.word}</strong> out loud and see if the speech engine scores your accents!
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => handleSimulateSpeaking(featuredWordProfile.word)}
                      disabled={isSimulatingMic}
                      className="px-4 py-2 rounded-xl text-[11px] font-bold font-display border-2 border-slate-900 bg-white hover:bg-slate-100 flex items-center gap-1.5 text-slate-900 disabled:opacity-50"
                    >
                      {isSimulatingMic ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-emerald-600 rounded-full animate-spin"></div>
                          <span>RECORDING & ANALYZING...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5 text-emerald-600" />
                          <span>TAP TO SPEAK AND TEST</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleSpeak(featuredWordProfile.word)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100"
                      title={preferredLanguage === "EN" ? "Listen Pronunciation" : "উচ্চারণ শুনুন"}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Mic Feedback Simulator */}
                  {micFeedback && (
                    <div className="p-3 bg-emerald-50 text-slate-900 border border-emerald-200 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800 font-display">ACCURACY SCORE:</span>
                        <span className="text-sm font-black text-emerald-700 font-display">{micFeedback.score}%</span>
                      </div>
                      <p className="text-xs font-semibold leading-relaxed">
                        💡 {micFeedback.text}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* VALUE STATS CARDS GRID SECTION */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              
              {/* Words Searchable Card */}
              <div className="bg-white rounded-3xl border-2 border-slate-900 p-4 text-center space-y-1 bubbly-card-shadow text-slate-900">
                <span className="block text-4xl font-display font-black text-[#10b981] bubbly-text-shadow-emerald">
                  ∞
                </span>
                <span className="block text-[10px] font-display font-extrabold uppercase tracking-wider">
                  WORDS SEARCHABLE
                </span>
              </div>

              {/* Free Forever Card */}
              <div className="bg-white rounded-3xl border-2 border-slate-900 p-4 text-center space-y-1 bubbly-card-shadow text-slate-900">
                <span className="block text-4xl font-display font-black text-[#10b981] bubbly-text-shadow-emerald">
                  100%
                </span>
                <span className="block text-[10px] font-display font-extrabold uppercase tracking-wider">
                  FREE FOREVER
                </span>
              </div>

              {/* Daily Limits Card */}
              <div className="bg-white rounded-3xl border-2 border-slate-900 p-4 text-center space-y-1 bubbly-card-shadow text-slate-900">
                <span className="block text-4xl font-display font-black text-[#10b981] bubbly-text-shadow-emerald">
                  0
                </span>
                <span className="block text-[10px] font-display font-extrabold uppercase tracking-wider">
                  DAILY LIMITS
                </span>
              </div>

              {/* Goal Fluency Card */}
              <div className="bg-white rounded-3xl border-2 border-slate-900 p-4 text-center space-y-1 bubbly-card-shadow text-slate-900">
                <span className="block text-4xl font-display font-black text-[#10b981] bubbly-text-shadow-emerald">
                  1
                </span>
                <span className="block text-[10px] font-display font-extrabold uppercase tracking-wider">
                  GOAL: FLUENCY
                </span>
              </div>

            </div>

            {/* FEATURES SHOWCASE VERTICAL BOX STACK */}
            <div className="space-y-4 pt-4">
              
              {/* Feature 1: BENGALI MEANINGS */}
              <div className="bg-white rounded-3xl border-2 border-slate-900 p-5 flex items-start gap-4 bubbly-card-shadow text-slate-900">
                <LottieFeatureIcon theme="bengaliMeanings" isDarkMode={isDarkMode} />
                <div className="space-y-1">
                  <h4 className="font-display font-extrabold text-sm uppercase tracking-tight">
                    BENGALI MEANINGS
                  </h4>
                  <p className="text-xs text-slate-600 font-semibold leading-normal uppercase tracking-wider">
                    ⚡ GIVES YOU INSTANT BENGALI TRANSLATION.
                  </p>
                </div>
              </div>

              {/* Feature 2: VOICE PRONUNCIATION */}
              <div className="bg-white rounded-3xl border-2 border-slate-900 p-5 flex items-start gap-4 bubbly-card-shadow text-slate-900">
                <LottieFeatureIcon theme="voicePronunciation" isDarkMode={isDarkMode} />
                <div className="space-y-1">
                  <h4 className="font-display font-extrabold text-sm uppercase tracking-tight">
                    VOICE PRONUNCIATION
                  </h4>
                  <p className="text-xs text-slate-600 font-semibold leading-normal uppercase tracking-wider">
                    🎧 PLAYS CRYSTAL-CLEAR AUDIO OF THE WORD.
                  </p>
                </div>
              </div>

              {/* Feature 3: SPEAKING TIPS */}
              <div className="bg-white rounded-3xl border-2 border-slate-900 p-5 flex items-start gap-4 bubbly-card-shadow text-slate-900">
                <LottieFeatureIcon theme="speakingTips" isDarkMode={isDarkMode} />
                <div className="space-y-1">
                  <h4 className="font-display font-extrabold text-sm uppercase tracking-tight">
                    SPEAKING TIPS
                  </h4>
                  <p className="text-xs text-slate-600 font-semibold leading-normal uppercase tracking-wider">
                    📝 GENERATES PERSONALIZED SPEAKING ADVICE FOR EACH WORD.
                  </p>
                </div>
              </div>

              {/* Feature 4: SAVE VOCABULARY */}
              <div className="bg-white rounded-3xl border-2 border-slate-900 p-5 flex items-start gap-4 bubbly-card-shadow text-slate-900">
                <LottieFeatureIcon theme="saveVocabulary" isDarkMode={isDarkMode} />
                <div className="space-y-1">
                  <h4 className="font-display font-extrabold text-sm uppercase tracking-tight">
                    SAVE VOCABULARY
                  </h4>
                  <p className="text-xs text-slate-600 font-semibold leading-normal uppercase tracking-wider">
                    💾 SAVES YOUR FAVORITE WORDS LOCALLY ON YOUR DEVICE.
                  </p>
                </div>
              </div>

              {/* Feature 5: REAL EXAMPLES */}
              <div className="bg-white rounded-3xl border-2 border-slate-900 p-5 flex items-start gap-4 bubbly-card-shadow text-slate-900">
                <LottieFeatureIcon theme="realExamples" isDarkMode={isDarkMode} />
                <div className="space-y-1">
                  <h4 className="font-display font-extrabold text-sm uppercase tracking-tight">
                    REAL EXAMPLES
                  </h4>
                  <p className="text-xs text-slate-600 font-semibold leading-normal uppercase tracking-wider">
                    ✍️ PROVIDES PRACTICAL, REAL-LIFE SENTENCES FOR EVERY WORD.
                  </p>
                </div>
              </div>

            </div>

          </motion.div>
        )}

        {/* DICTIONARY TAB VIEW */}
        {activeMainTab === "dictionary" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6"
          >
            
            {/* COMPACT STUDY SEARCH BAR */}
            <div className="max-w-xl mx-auto w-full relative">
              <div className={`rounded-full border-2 border-slate-900 p-2 bg-white flex items-center transition-all ${
                isDarkMode ? "shadow-[2px_2px_0px_0px_#10b981]" : "bubbly-card-shadow-sm"
              }`}>
                {/* Language selection inside input */}
                <div className="bg-slate-100 p-0.5 rounded-full border border-slate-200 flex items-center shrink-0">
                  <button 
                    onClick={() => setSearchLang("EN")}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold font-display transition-all ${
                      searchLang === "EN" 
                        ? "bg-[#10b981] text-white" 
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    EN
                  </button>
                  <button 
                    onClick={() => setSearchLang("BN")}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold font-display transition-all ${
                      searchLang === "BN" 
                        ? "bg-[#10b981] text-white" 
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    BN
                  </button>
                </div>

                <input 
                  type="text" 
                  placeholder={searchLang === "EN" ? "SEARCH ANOTHER WORD..." : (preferredLanguage === "EN" ? "BENGALI WORD..." : "বাংলা শব্দ...")} 
                  value={searchWord}
                  onChange={(e) => setSearchWord(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch(searchWord);
                  }}
                  className="w-full bg-transparent px-3 py-1 text-xs font-display font-extrabold tracking-wide uppercase text-slate-900 placeholder-slate-400 focus:outline-hidden"
                />

                {searchWord && (
                  <button
                    onClick={() => handleSimulateSpeaking(searchWord)}
                    className="p-1 rounded-full hover:bg-slate-100 transition-colors mr-1 text-slate-500 hover:text-slate-900"
                    title={preferredLanguage === "EN" ? "Practice Pronunciation" : "উচ্চারণ প্র্যাকটিস"}
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                )}

                <button 
                  onClick={() => handleSearch(searchWord)}
                  disabled={isLoadingWord || !searchWord.trim()}
                  className="w-8 h-8 rounded-full bg-[#10b981] hover:bg-[#0da471] text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 border border-slate-900"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CURATED CATEGORIES SEARCH BROWSER IN DICTIONARY */}
            <div className={`rounded-3xl border-2 border-slate-900 p-6 space-y-6 ${
              isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
            } bubbly-card-shadow`}>
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-display font-black text-sm uppercase tracking-wider">
                    {preferredLanguage === "EN" ? "BROWSE STUDY COMPILATIONS" : "অনুশীলনের শব্দ সম্ভার"}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    Select a curated list to find target words to study
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {[
                  {
                    title: preferredLanguage === "EN" ? "🎓 Academic Vocabulary Booster" : "🎓 একাডেমিক ভোকাবুলারি বুস্টার",
                    description: preferredLanguage === "EN" ? "Essential verbs & connectors for IELTS, academic writing, and exams" : "আইইএলটিএস, একাডেমিক রাইটিং ও পরীক্ষার জন্য গুরুত্বপূর্ণ শব্দসমূহ",
                    words: ["Resilience", "Accomplish", "Perspective", "Diligent", "Empathetic"]
                  },
                  {
                    title: preferredLanguage === "EN" ? "💼 Business & Workplace English" : "💼 বিজনেস ও অফিসিয়াল ইংরেজি শব্দ",
                    description: preferredLanguage === "EN" ? "Key terms to master professional interviews, business pitches and calls" : "ইন্টারভিউ, প্রেজেন্টেশন ও কর্পোরেট যোগাযোগের জন্য সহায়ক শব্দাবলী",
                    words: ["Collaborate", "Innovative", "Articulate", "Pragmatic", "Strategic"]
                  },
                  {
                    title: preferredLanguage === "EN" ? "🗣️ Advanced Conversational Slang & Idioms" : "🗣️ উন্নত কথ্য ইংরেজি ও চমৎকার শব্দাবলী",
                    description: preferredLanguage === "EN" ? "Impress native speakers and expand your conversational capabilities" : "সাবলীল কথা বলার জন্য প্রয়োজনীয় উন্নত ভোকাবুলারি",
                    words: ["Eloquent", "Peculiar", "Inevitably", "Sophisticated", "Versatile"]
                  }
                ].map((category, index) => (
                  <div key={index} className="space-y-2.5 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                    <div>
                      <h4 className="font-display font-extrabold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                        {category.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                        {category.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {category.words.map((word) => (
                        <button
                          key={word}
                          onClick={() => {
                            setSearchWord(word);
                            handleSearch(word);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-900 hover:bg-[#ecf9f4] dark:hover:bg-emerald-950/20 text-slate-800 dark:text-slate-100 font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer hover:-translate-y-0.5"
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TIPS CARD FOR PRACTICE */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/40 flex items-start gap-3.5">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="font-display font-extrabold text-xs uppercase text-emerald-800 dark:text-emerald-400">
                  {preferredLanguage === "EN" ? "HOW STUDY WORKSPACE COOPERAETS WITH YOU" : "স্টাডি ওয়ার্কস্পেস যেভাবে আপনাকে সাহায্য করবে"}
                </h5>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 leading-relaxed">
                  {preferredLanguage === "EN" 
                    ? "Searching any word brings you into our distraction-free, study-focused console. There, you can flip flashcards, take mock comprehension quizzes, use our creative sentence sandbox with real-time word verification, and schedule spaced repetition review intervals."
                    : "যেকোনো শব্দ সার্চ করলে আপনি একটি মনযোগ-বান্ধব স্টাডি পেজে প্রবেশ করবেন। সেখানে ফ্ল্যাশকার্ড ফ্লিপ করা, তাৎক্ষণিক রিডিং কুইজ খেলা, রিয়েল-টাইম সেন্টেন্স ভেরিফায়ার ব্যবহার করে বাক্য তৈরি করা এবং স্পেসড রিপিটেশন ট্র্যাকার দিয়ে রিভিউ সেশন সিডিউল করার সুযোগ পাবেন।"}
                </p>
              </div>
            </div>

          </motion.div>
        )}

        {/* WORD STUDY PAGE VIEW */}
        {activeMainTab === "study" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6"
          >
            {isLoadingWord ? (
              <div className="bg-white text-slate-900 rounded-3xl p-12 border-2 border-slate-900 bubbly-card-shadow flex flex-col items-center justify-center text-center space-y-4 min-h-[350px]">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-emerald-600 animate-spin"></div>
                  <Sparkles className="w-6 h-6 text-emerald-600 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-lg uppercase tracking-tight">ANALYZING WORD WITH AI...</h3>
                  <div className="mt-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-4 py-2 rounded-2xl text-xs font-bold border-2 border-emerald-500 inline-block animate-pulse">
                    {wordLoadingStatus}
                  </div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-4">
                    Our language expert Gemini is breaking down pronunciation, finding Bengali synonyms, and preparing actionable speaking advice.
                  </p>
                </div>
              </div>
            ) : wordError ? (
              <div className="bg-white text-slate-900 rounded-3xl p-8 border-2 border-slate-900 bubbly-card-shadow text-center space-y-5 min-h-[250px] flex flex-col justify-center items-center">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 border border-red-200">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-extrabold text-lg uppercase tracking-tight">WORD NOT FOUND</h3>
                  <p className="text-xs text-slate-600 max-w-md">{wordError}</p>
                </div>

                {searchSuggestions.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 w-full max-w-md space-y-2.5">
                    <span className="text-[10px] font-extrabold font-display text-slate-500 uppercase tracking-wider block">
                      {preferredLanguage === "EN" ? "DID YOU MEAN?" : "আপনি কি নিচের শব্দগুলো খুঁজছিলেন?"}
                    </span>
                    <div className="flex flex-wrap justify-center gap-2">
                      {searchSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            setSearchWord(suggestion);
                            handleSearch(suggestion);
                          }}
                          className="px-3.5 py-1.5 bg-white hover:bg-emerald-50 border-2 border-slate-200 hover:border-slate-900 rounded-xl text-xs font-bold font-display text-[#10b981] transition-all cursor-pointer"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setActiveMainTab("dictionary")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-display text-xs font-bold px-5 py-2.5 rounded-xl border-2 border-slate-900 cursor-pointer"
                >
                  BACK TO SEARCH
                </button>
              </div>
            ) : currentWordProfile ? (
              <DictionaryResult
                wordProfile={currentWordProfile}
                preferredLanguage={preferredLanguage}
                onBack={() => setActiveMainTab("dictionary")}
                onSpeak={handleSpeak}
                isPlayingAudio={isPlayingAudio}
                onSimulateSpeaking={handleSimulateSpeaking}
                isSimulatingMic={isSimulatingMic}
                micFeedback={micFeedback}
                savedWords={savedWords}
                onToggleBookmark={toggleBookmark}
                isDarkMode={isDarkMode}
              />
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-slate-150 text-center space-y-3">
                <p className="text-slate-600 text-sm">
                  {preferredLanguage === "EN" 
                    ? "No profile loaded. Select a word from home or search to start studying." 
                    : "কোনো শব্দ লোড করা নেই। হোম বা সার্চ পেজ থেকে শব্দ সিলেক্ট করে পড়াশোনা শুরু করুন।"}
                </p>
                <button
                  onClick={() => setActiveMainTab("dictionary")}
                  className="bg-emerald-600 text-white font-display text-xs font-bold px-4 py-2 rounded-xl border-2 border-slate-900"
                >
                  GO TO DICTIONARY
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* TRANSLATOR TAB VIEW */}
        {activeMainTab === "translator" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6"
          >
            
            <div className={`rounded-3xl border-2 border-slate-900 p-6 space-y-5 bg-white text-slate-900 bubbly-card-shadow`}>
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border-2 border-slate-900 flex items-center justify-center">
                  <Languages className="w-5 h-5 text-indigo-700" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base uppercase tracking-tight">
                    {preferredLanguage === "EN" ? "BENGALI-TO-ENGLISH SPEAKING BOOSTER" : "বাংলা থেকে সাবলীল ইংরেজি স্পিকিং বুস্টার"}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                    Translate full sentences and get dynamic conversational alternatives with AI
                  </p>
                </div>
              </div>

              {/* Text input area */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold font-display uppercase text-slate-500 tracking-wider">
                  {preferredLanguage === "EN" ? "ENTER YOUR ENGLISH OR BENGALI SENTENCE" : "আপনার বাংলা বা ইংরেজি বাক্যটি লিখুন"}
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder={preferredLanguage === "EN" ? "E.g. I am very tired today, I don't feel like working." : "যেমন: আমি আজ খুব ক্লান্ত, কাজ করতে ইচ্ছা করছে না।"}
                    value={inputSentence}
                    onChange={(e) => setInputSentence(e.target.value)}
                    className="w-full p-4 border-2 border-slate-900 rounded-2xl text-sm font-semibold placeholder-slate-400 focus:outline-hidden text-slate-900 bg-slate-50/50 resize-none"
                  />
                  
                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <button
                      onClick={() => handleTranslateSentence(inputSentence)}
                      disabled={isLoadingTranslation || !inputSentence.trim()}
                      className="bg-[#10b981] hover:bg-[#0da471] text-white text-xs font-bold font-display px-5 py-2 rounded-xl border-2 border-slate-900 transition-colors disabled:opacity-50"
                    >
                      {isLoadingTranslation ? "ANALYZING..." : "CONVERT TO SMART ENGLISH"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick preloaded templates */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold font-display uppercase text-slate-500 tracking-wider block">
                  {preferredLanguage === "EN" ? "CLICK ANY EXAMPLE BELOW TO PRACTICE:" : "অনুশীলনের জন্য নিচের যেকোনো উদাহরণে ক্লিক করুন:"}
                </span>
                <div className="flex flex-wrap gap-2">
                  {CONVERSATION_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputSentence(tmpl.bengali);
                        handleTranslateSentence(tmpl.englishPrompt);
                      }}
                      className="text-xs bg-slate-50 hover:bg-emerald-50 text-slate-800 font-bold px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-900 text-left transition-colors"
                    >
                      {preferredLanguage === "EN" ? tmpl.englishPrompt : tmpl.bengali}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Translation Output Results */}
            {isLoadingTranslation ? (
              <div className="bg-white text-slate-900 rounded-3xl p-12 border-2 border-slate-900 bubbly-card-shadow text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-emerald-600 animate-spin mx-auto"></div>
                <div>
                  <h4 className="font-display font-extrabold text-base uppercase tracking-tight">
                    {preferredLanguage === "EN" ? "Gemini is translating & analyzing sentence..." : "Gemini বাক্যটি রূপান্তর ও বিশ্লেষণ করছে..."}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    {preferredLanguage === "EN" 
                      ? "Our speaking expert is generating 3-4 conversational variations and essential vocabulary terms." 
                      : "আমাদের স্পিকিং এক্সপার্ট পরিস্থিতি অনুযায়ী ৩-৪টি ভিন্ন ভিন্ন স্মার্ট ইংরেজি রূপ এবং প্রয়োজনীয় ভোকাবুলারি তৈরি করছে।"}
                  </p>
                </div>
              </div>
            ) : translationError ? (
              <div className="bg-white text-slate-900 rounded-3xl p-6 border-2 border-slate-900 bubbly-card-shadow text-center space-y-3">
                <p className="text-red-700 text-sm font-bold">{translationError}</p>
                <button
                  onClick={() => handleTranslateSentence(inputSentence)}
                  className="bg-emerald-600 text-white text-xs font-bold font-display px-4 py-2 rounded-xl"
                >
                  TRY AGAIN
                </button>
              </div>
            ) : translationResult ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-6"
              >
                
                {/* Direct Translation box */}
                <div className="bg-white text-slate-900 rounded-3xl p-5 border-2 border-slate-900 bubbly-card-shadow space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold font-display text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {preferredLanguage === "EN" ? "DIRECT TRANSLATION" : "সরাসরি অনুবাদ (Direct Translation)"}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">DETECTED: {translationResult.detectedLanguage || (preferredLanguage === "EN" ? "Bengali" : "বাংলা")}</span>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">YOUR INPUT:</p>
                    <p className="text-xs text-slate-800 font-semibold">"{translationResult.inputSentence}"</p>
                    <div className="h-2"></div>
                    <p className="text-[11px] font-bold text-emerald-700 uppercase">TRANSLATION:</p>
                    <p className="text-sm font-extrabold text-slate-950">
                      "{translationResult.directTranslation}"
                    </p>
                  </div>
                </div>

                {/* 3-4 High quality Conversational Alternatives styled beautifully */}
                <div className="bg-white text-slate-900 rounded-3xl p-6 border-2 border-slate-900 bubbly-card-shadow space-y-4">
                  <h4 className="font-display font-extrabold text-sm uppercase tracking-wide text-slate-600 flex items-center gap-1.5 pb-2 border-b">
                    <Sparkles className="w-4.5 h-4.5 text-[#10b981]" />
                    <span>
                      {preferredLanguage === "EN" ? "FLUENT CONVERSATIONAL ALTERNATIVES" : "পরিস্থিতি অনুযায়ী সাবলীল বিকল্পসমূহ (Speak Fluently)"}
                    </span>
                  </h4>

                  <div className="space-y-4">
                    {translationResult.alternatives?.map((alt, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-2xl p-4 hover:border-slate-900 transition-all bg-slate-50/50 flex justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold font-display px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {alt.style}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                              {alt.difficulty}
                            </span>
                          </div>
                          
                          <p className="text-slate-950 font-display font-black text-sm leading-relaxed">
                            "{alt.english}"
                          </p>
                          
                          <p className="text-xs text-slate-600 leading-normal font-semibold">
                            💡 <span className="font-extrabold text-slate-800">
                              {preferredLanguage === "EN" ? "Meaning:" : "ভাবার্থ:"}
                            </span> {alt.bengaliExplanation}
                          </p>
                        </div>

                        <button
                          onClick={() => handleSpeak(alt.english)}
                          className="p-2 bg-white border border-slate-200 hover:border-emerald-500 rounded-xl shrink-0 text-slate-600 hover:text-emerald-700 transition-all self-center"
                          title={preferredLanguage === "EN" ? "Listen" : "উচ্চারণ শুনুন"}
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vocabulary breakdown */}
                {translationResult.vocabulary && translationResult.vocabulary.length > 0 && (
                  <div className="bg-white text-slate-900 rounded-3xl p-6 border-2 border-slate-900 bubbly-card-shadow space-y-3">
                    <h4 className="font-display font-extrabold text-sm uppercase tracking-wide text-slate-600 pb-2 border-b">
                      {preferredLanguage === "EN" ? "VOCABULARY BUILDER" : "গুরুত্বপূর্ণ শব্দার্থ বিশ্লেষণ (Vocabulary Builder)"}
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold mb-2">
                      {preferredLanguage === "EN" ? "Key educational words used in these sentences:" : "এই বাক্যগুলোতে ব্যবহৃত গুরুত্বপূর্ন শিক্ষণীয় শব্দসমূহ:"}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {translationResult.vocabulary.map((vocab, index) => (
                        <div
                          key={index}
                          className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between hover:border-emerald-300 transition-all"
                        >
                          <div>
                            <span className="font-bold text-slate-950 text-sm">{vocab.english}</span>
                            <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold ml-1.5 px-1.5 py-0.5 rounded uppercase">
                              {vocab.partOfSpeech}
                            </span>
                          </div>
                          <span className="text-xs text-emerald-800 font-bold">{vocab.bengaliMeaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pitch and delivery speaking practice tip */}
                {translationResult.speakingPracticeTip && (
                  <div className="bg-slate-900 text-white rounded-3xl p-5 border-2 border-slate-900 bubbly-card-shadow">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-display font-extrabold text-xs text-emerald-400 uppercase tracking-wider mb-1">Smart Delivery & Pitch Tips (Speaking Practice Tip)</h5>
                        <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                          {translationResult.speakingPracticeTip}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Back to home */}
                <div className="text-center pt-2">
                  <button 
                    onClick={() => setActiveMainTab("home")}
                    className="px-5 py-2.5 rounded-full border-2 border-slate-900 bg-white hover:bg-slate-50 text-xs font-bold font-display uppercase tracking-wider"
                  >
                    BACK TO HOME DASHBOARD
                  </button>
                </div>

              </motion.div>
            ) : (
              <div className="bg-white text-slate-900 rounded-3xl p-12 border-2 border-slate-900 bubbly-card-shadow text-center space-y-3 flex flex-col justify-center items-center">
                <Languages className="w-12 h-12 text-slate-300" />
                <h4 className="font-display font-extrabold text-base uppercase">Type or Select a Sentence</h4>
                <p className="text-xs text-slate-500 max-w-sm font-semibold">
                  Type your sentence above or click any of the example templates below to instantly view translations and fluent alternatives.
                </p>
              </div>
            )}

          </motion.div>
        )}

        {/* VOCABULARY QUIZ VIEW */}
        {activeMainTab === "quiz" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6"
          >
            
            {/* Playful Game board card */}
            <div className="bg-white text-slate-900 rounded-3xl p-6 border-2 border-slate-900 bubbly-card-shadow space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-6 h-6 text-emerald-600" />
                  <h3 className="font-display font-extrabold text-lg uppercase tracking-tight">VOCABULARY CHALLENGE QUIZ</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-display bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    SCORE: <strong className="text-emerald-700">{quizScore}</strong> / {quizQuestions.length || 5}
                  </span>
                </div>
              </div>

              {quizStatus === "idle" && (
                <div className="text-center py-6 space-y-6">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-[#ecf9f4] border-2 border-slate-900 rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <Trophy className="w-8 h-8 text-amber-500" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-display font-extrabold text-lg uppercase tracking-tight">Refresh Your English Vocabulary!</h4>
                      <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">
                        Do you remember the key and challenging words from your dictionary list? Answer our 5 awesome questions to test yourself and boost your score!
                      </p>
                    </div>
                  </div>

                  {/* DIFFICULTY LEVEL FILTER */}
                  <div className="max-w-md mx-auto p-4 bg-slate-50 border-2 border-slate-900 rounded-2xl space-y-3">
                    <span className="text-[10px] font-black font-display text-slate-500 uppercase tracking-widest block">
                      CHOOSE DIFFICULTY LEVEL
                    </span>
                    <div className="grid grid-cols-3 gap-2.5">
                      {(["Beginner", "Intermediate", "Advanced"] as const).map((level) => {
                        const isSelected = quizDifficulty === level;
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setQuizDifficulty(level)}
                            className={`py-2 px-3 rounded-xl border-2 font-display font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                              isSelected
                                ? "bg-slate-900 text-white border-slate-900 scale-102 shadow-sm"
                                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            {level}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* QUIZ MODE FILTER */}
                  <div className="max-w-md mx-auto p-4 bg-slate-50 border-2 border-slate-900 rounded-2xl space-y-3">
                    <span className="text-[10px] font-black font-display text-slate-500 uppercase tracking-widest block">
                      CHOOSE QUIZ MODE
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { id: "standard", label: "Definition Match" },
                        { id: "synonym", label: "Synonym/Antonym" }
                      ].map((mode) => {
                        const isSelected = quizMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setQuizMode(mode.id as any)}
                            className={`py-2.5 px-3 rounded-xl border-2 font-display font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                              isSelected
                                ? "bg-slate-900 text-white border-slate-900 scale-102 shadow-sm"
                                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            {mode.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={startNewQuiz}
                    className="px-6 py-3 rounded-2xl bg-[#10b981] text-white font-display font-bold text-xs uppercase tracking-widest border-2 border-slate-900 shadow-sm hover:scale-102 active:scale-98 transition-all"
                  >
                    START PLAYING QUIZ
                  </button>
                </div>
              )}

              {quizStatus === "playing" && quizQuestions.length > 0 && (
                <div className="space-y-5">
                  
                  {/* Progress indicator */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="font-display text-slate-500 uppercase">QUESTION {currentQuestionIndex + 1} OF {quizQuestions.length}</span>
                      <span className="font-display text-emerald-700 uppercase">PROGRESS</span>
                    </div>
                    <div className="w-full h-3.5 bg-slate-100 rounded-full border-2 border-slate-900 overflow-hidden">
                      <div 
                        className="h-full bg-[#10b981] transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Question Box */}
                  <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-900 space-y-3">
                    <span className="text-[10px] font-extrabold font-display text-emerald-800 uppercase tracking-wider block">
                      CHALLENGE QUESTION
                    </span>
                    <h4 className="font-display font-black text-base text-slate-900">
                      {quizQuestions[currentQuestionIndex].questionText}
                    </h4>

                    {/* Speech assistant tool to read question if English */}
                    <button 
                      onClick={() => playQuizAudio(quizQuestions[currentQuestionIndex].questionText)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 mt-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Hear Pronunciation</span>
                    </button>
                  </div>

                  {/* Option Buttons */}
                  <div className="grid grid-cols-1 gap-3 pt-2">
                    {quizQuestions[currentQuestionIndex].options.map((option: string) => {
                      const isSelected = selectedAnswer === option;
                      const isCorrectAnswer = option === quizQuestions[currentQuestionIndex].correctAnswer;
                      
                      let btnStyle = "border-slate-200 bg-white text-slate-900 hover:border-slate-900";
                      if (selectedAnswer !== null) {
                        if (isCorrectAnswer) {
                          btnStyle = "border-emerald-600 bg-emerald-50 text-emerald-900 border-2";
                        } else if (isSelected) {
                          btnStyle = "border-red-600 bg-red-50 text-red-900 border-2";
                        } else {
                          btnStyle = "opacity-50 bg-slate-50 text-slate-400";
                        }
                      }

                      return (
                        <button
                          key={option}
                          disabled={selectedAnswer !== null}
                          onClick={() => submitAnswer(option)}
                          className={`w-full text-left p-4 rounded-2xl border-2 font-display font-extrabold text-xs tracking-wide uppercase transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{option}</span>
                          
                          {selectedAnswer !== null && isCorrectAnswer && (
                            <span className="text-emerald-700 font-bold text-[10px] bg-emerald-100 px-2 py-0.5 rounded">CORRECT</span>
                          )}
                          {selectedAnswer !== null && isSelected && !isCorrectAnswer && (
                            <span className="text-red-700 font-bold text-[10px] bg-red-100 px-2 py-0.5 rounded">WRONG</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback explanation block */}
                  {selectedAnswer !== null && (
                    <div className="p-4 rounded-2xl border-2 border-slate-900 bg-amber-50 text-slate-900 space-y-2.5 animate-fadeIn">
                      <div className="flex items-center gap-2">
                        {isAnswerCorrect ? (
                          <span className="text-xs font-bold text-emerald-800 uppercase bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">🎉 EXCELLENT! CORRECT ANSWER</span>
                        ) : (
                          <span className="text-xs font-bold text-red-800 uppercase bg-red-100 px-2 py-0.5 rounded border border-red-300">❌ INCORRECT</span>
                        )}
                      </div>
                      <p className="text-xs font-semibold leading-relaxed">
                        {quizQuestions[currentQuestionIndex].explanation}
                      </p>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={nextQuizQuestion}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-display text-xs font-bold px-5 py-2.5 rounded-xl border-2 border-slate-900 flex items-center gap-1.5"
                        >
                          <span>{currentQuestionIndex + 1 === quizQuestions.length ? "SEE RESULTS" : "NEXT QUESTION"}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {quizStatus === "ended" && (
                <div className="text-center py-8 space-y-5">
                  <div className="w-20 h-20 bg-amber-50 border-2 border-slate-900 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Trophy className="w-10 h-10 text-amber-500 animate-bounce" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-display font-black text-2xl uppercase tracking-tight">QUIZ COMPLETED!</h3>
                    <p className="text-sm font-semibold">
                      Your Final Score: <strong className="text-emerald-700 text-lg">{quizScore}</strong> / {quizQuestions.length}
                    </p>
                    <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto mt-2 leading-relaxed">
                      {quizScore === quizQuestions.length ? (
                        preferredLanguage === "EN" 
                          ? "Awesome! You answered all words correctly. Your English vocabulary is outstanding."
                          : "অসাধারণ! আপনি সবগুলো শব্দের সঠিক উত্তর দিয়েছেন। আপনার ইংরেজি ভোকাবুলারি চমৎকার।"
                      ) : (
                        preferredLanguage === "EN"
                          ? "Great effort! You can practice these words further in the dictionary and saved vault tabs."
                          : "খুব ভালো চেষ্টা! আপনি ভোকাবুলারিগুলো ডিকশনারি এবং সেভ করা ট্যাব থেকে আরেকটু ঝালিয়ে নিতে পারেন।"
                      )}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={startNewQuiz}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-display font-bold text-xs uppercase border-2 border-slate-900"
                    >
                      PLAY AGAIN
                    </button>
                    <button
                      onClick={() => setActiveMainTab("home")}
                      className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-display font-bold text-xs uppercase border-2 border-slate-900 hover:bg-slate-50"
                    >
                      BACK TO HOME
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* HISTORICAL PERFORMANCE DASHBOARD */}
            {(quizStatus === "idle" || quizStatus === "ended") && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white text-slate-900 rounded-3xl p-6 border-2 border-slate-900 bubbly-card-shadow space-y-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Award className="w-5.5 h-5.5 text-indigo-600" />
                    <h3 className="font-display font-extrabold text-base uppercase tracking-tight">
                      {preferredLanguage === "EN" ? "QUIZ STATISTICS & HISTORY" : "কুইজ পারফরম্যান্স ড্যাশবোর্ড"}
                    </h3>
                  </div>
                  {quizStats.totalQuizzes > 0 && (
                    <button
                      onClick={() => {
                        if (confirm(preferredLanguage === "EN" ? "Are you sure you want to reset all quiz stats?" : "আপনি কি নিশ্চিত যে আপনি সব কুইজ ডাটা মুছে ফেলতে চান?")) {
                          const resetStats = {
                            totalQuizzes: 0,
                            totalQuestions: 0,
                            totalCorrect: 0,
                            history: [],
                            wordErrors: {}
                          };
                          setQuizStatsState(resetStats);
                          localStorage.setItem("learn_english_easy_quiz_stats", JSON.stringify(resetStats));
                        }
                      }}
                      className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-wider flex items-center gap-1 bg-red-50 hover:bg-red-100/60 px-2.5 py-1 rounded-full border border-red-200 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{preferredLanguage === "EN" ? "RESET STATS" : "মুছে ফেলুন"}</span>
                    </button>
                  )}
                </div>

                {quizStats.totalQuizzes === 0 ? (
                  <div className="text-center py-6 space-y-2">
                    <p className="text-xs text-slate-500 font-semibold leading-normal">
                      {preferredLanguage === "EN" 
                        ? "You haven't completed any quizzes yet. Take your first quiz above to start tracking your progress!" 
                        : "আপনি এখনও কোনো কুইজ সম্পন্ন করেননি। কুইজ শেষ করার পর আপনার বিস্তারিত পারফরম্যান্স এখানে দেখতে পাবেন!"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Grid stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl text-center space-y-1">
                        <span className="text-[10px] font-extrabold font-display text-slate-400 uppercase tracking-widest block">
                          {preferredLanguage === "EN" ? "QUIZZES TAKEN" : "মোট কুইজ"}
                        </span>
                        <p className="font-display font-black text-2xl text-slate-900">{quizStats.totalQuizzes}</p>
                      </div>

                      <div className="bg-[#ecf9f4] border-2 border-emerald-200 p-4 rounded-2xl text-center space-y-1">
                        <span className="text-[10px] font-extrabold font-display text-emerald-800 uppercase tracking-widest block">
                          {preferredLanguage === "EN" ? "AVG ACCURACY" : "গড় নির্ভুলতা"}
                        </span>
                        <p className="font-display font-black text-2xl text-emerald-700">
                          {quizStats.totalQuestions > 0 ? ((quizStats.totalCorrect / quizStats.totalQuestions) * 100).toFixed(0) : 0}%
                        </p>
                      </div>

                      <div className="bg-indigo-50 border-2 border-indigo-200 p-4 rounded-2xl text-center space-y-1">
                        <span className="text-[10px] font-extrabold font-display text-indigo-800 uppercase tracking-widest block">
                          {preferredLanguage === "EN" ? "TOTAL CORRECT" : "সঠিক উত্তর"}
                        </span>
                        <p className="font-display font-black text-2xl text-indigo-700">
                          {quizStats.totalCorrect}
                        </p>
                      </div>

                      <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl text-center space-y-1">
                        <span className="text-[10px] font-extrabold font-display text-amber-800 uppercase tracking-widest block">
                          {preferredLanguage === "EN" ? "TOTAL ANSWERED" : "মোট প্রশ্ন"}
                        </span>
                        <p className="font-display font-black text-2xl text-amber-700">
                          {quizStats.totalQuestions}
                        </p>
                      </div>
                    </div>

                    {/* Progress feedback bar */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold font-display text-slate-700">
                        <span>{preferredLanguage === "EN" ? "OVERALL SCORE DISTRIBUTION" : "সামগ্রিক অর্জন অনুপাত"}</span>
                        <span>{quizStats.totalCorrect} / {quizStats.totalQuestions} ({quizStats.totalQuestions > 0 ? ((quizStats.totalCorrect / quizStats.totalQuestions) * 100).toFixed(0) : 0}%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                        <div 
                          className="h-full bg-indigo-600 rounded-full" 
                          style={{ width: `${quizStats.totalQuestions > 0 ? ((quizStats.totalCorrect / quizStats.totalQuestions) * 100) : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Milestones & Badges section */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-extrabold font-display text-slate-500 uppercase tracking-widest block">
                        {preferredLanguage === "EN" ? "ACHIEVED MILESTONES & BADGES" : "অর্জিত মাইলফলক ও ব্যাজসমূহ"}
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {getMilestones().map((m) => (
                          <div 
                            key={m.id}
                            className={`p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 relative overflow-hidden ${
                              m.condition 
                                ? "bg-gradient-to-br from-amber-50 to-amber-100/40 border-amber-400 text-slate-900 shadow-xs" 
                                : "bg-slate-50/60 border-slate-200 text-slate-400"
                            }`}
                          >
                            <div className={`p-2.5 rounded-xl border-2 shrink-0 ${
                              m.condition 
                                ? "bg-white border-amber-400 text-amber-600" 
                                : "bg-slate-100 border-slate-300 text-slate-300"
                            }`}>
                              {m.icon}
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className={`font-display font-extrabold text-xs uppercase tracking-tight ${
                                  m.condition ? "text-slate-900" : "text-slate-400"
                                }`}>
                                  {preferredLanguage === "EN" ? m.titleEN : m.titleBN}
                                </h4>
                                {m.condition ? (
                                  <span className="bg-amber-400 text-amber-950 text-[8px] font-black font-display px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                    {preferredLanguage === "EN" ? "UNLOCKED" : "অর্জিত"}
                                  </span>
                                ) : (
                                  <span className="bg-slate-200 text-slate-500 text-[8px] font-bold font-display px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5">
                                    <Lock className="w-2 h-2" />
                                    <span>{preferredLanguage === "EN" ? "LOCKED" : "লকড"}</span>
                                  </span>
                                )}
                              </div>
                              <p className={`text-[10px] leading-normal font-semibold ${
                                m.condition ? "text-slate-600" : "text-slate-400/80"
                              }`}>
                                {preferredLanguage === "EN" ? m.descEN : m.descBN}
                              </p>
                              
                              <div className="text-[8px] font-mono font-bold mt-1 uppercase tracking-wider">
                                <span className={m.condition ? "text-amber-700" : "text-slate-400"}>
                                  {preferredLanguage === "EN" ? "Progress: " : "অগ্রগতি: "}
                                </span>
                                <span className={m.condition ? "text-amber-900" : "text-slate-500"}>
                                  {m.progressText}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Weakest Words Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />
                        <span className="text-[10px] font-extrabold font-display text-slate-500 uppercase tracking-widest block">
                          {preferredLanguage === "EN" ? "WEAKEST WORDS (TOP 5)" : "সবচেয়ে দুর্বল শব্দসমূহ (শীর্ষ ৫)"}
                        </span>
                      </div>

                      {weakestWords.length === 0 ? (
                        <div className="p-4 rounded-2xl bg-emerald-50/50 border-2 border-emerald-150 text-center">
                          <p className="text-xs text-emerald-700 font-bold leading-normal">
                            {preferredLanguage === "EN" 
                              ? "Excellent! You haven't made any errors on any quiz words yet!" 
                              : "চমৎকার! আপনি এখনও কোনো কুইজে কোনো শব্দে ভুল করেননি!"}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {weakestWords.map((item) => (
                            <div 
                              key={item.word}
                              className="p-3.5 rounded-2xl border-2 border-rose-200 bg-rose-50/20 hover:bg-rose-50/50 transition-all flex items-center justify-between"
                            >
                              <div className="space-y-0.5">
                                <h4 className="font-display font-black text-sm text-slate-900 capitalize">
                                  {item.word}
                                </h4>
                                <p className="text-[10px] font-extrabold text-rose-600 flex items-center gap-1">
                                  <span>
                                    {preferredLanguage === "EN" 
                                      ? `Struggled ${item.count} ${item.count === 1 ? 'time' : 'times'}` 
                                      : `${item.count} বার ভুল করেছেন`}
                                  </span>
                                </p>
                              </div>
                              <button
                                onClick={() => handleSearch(item.word)}
                                className="px-3 py-1.5 bg-white border-2 border-slate-950 text-slate-950 text-[10px] font-black uppercase rounded-lg transition-all hover:bg-slate-50 active:translate-y-0.5 shadow-[1.5px_1.5px_0_0_rgba(15,23,42,1)]"
                              >
                                <span className="flex items-center gap-1">
                                  <span>{preferredLanguage === "EN" ? "STUDY NOW" : "অধ্যয়ন করুন"}</span>
                                  <ArrowRight className="w-3 h-3 stroke-[3]" />
                                </span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* History list */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-extrabold font-display text-slate-500 uppercase tracking-widest block">
                        {preferredLanguage === "EN" ? "RECENT QUIZ HISTORY" : "সাম্প্রতিক কুইজ ইতিহাস"}
                      </span>

                      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                        {quizStats.history.map((item, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-150 bg-white hover:border-slate-300 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-display font-bold ${
                                item.score === item.total 
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                                  : item.score >= item.total / 2 
                                    ? "bg-amber-50 border-amber-200 text-amber-700" 
                                    : "bg-red-50 border-red-200 text-red-700"
                              }`}>
                                {item.score}/{item.total}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-800">
                                  {preferredLanguage === "EN" 
                                    ? `Scored ${item.score} out of ${item.total}` 
                                    : `${item.total}-টির মধ্যে ${item.score}-টি সঠিক উত্তর`}
                                </p>
                                <span className="text-[10px] font-mono text-slate-400 block">{item.date}</span>
                              </div>
                            </div>

                            <span className={`text-[10px] font-extrabold font-display px-2 py-0.5 rounded-full uppercase border ${
                              item.score === item.total 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                : item.score >= item.total / 2 
                                  ? "bg-amber-50 text-amber-700 border-amber-200" 
                                  : "bg-red-50 text-red-700 border-red-200"
                            }`}>
                              {item.score === item.total 
                                ? (preferredLanguage === "EN" ? "PERFECT" : "নিখুঁত") 
                                : item.score >= item.total / 2 
                                  ? (preferredLanguage === "EN" ? "PASSED" : "পাস") 
                                  : (preferredLanguage === "EN" ? "FAIL" : "অনুত্তীর্ণ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

          </motion.div>
        )}

        {/* SAVED WORDS TAB VIEW */}
        {activeMainTab === "saved" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6"
          >
            
            {isFlashcardViewActive && savedWords.length > 0 ? (
              <VocabularyFlashcards
                savedWords={savedWords}
                PRELOADED_WORDS={PRELOADED_WORDS}
                preferredLanguage={preferredLanguage}
                isDarkMode={isDarkMode}
                onClose={() => setIsFlashcardViewActive(false)}
                onTriggerNotification={(title, body) => {
                  setInAppNotification({ title, body });
                }}
              />
            ) : (
              <div className="bg-white text-slate-900 rounded-3xl p-6 border-2 border-slate-900 bubbly-card-shadow space-y-4">
                <div className="flex items-center justify-between pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <BookMarked className="w-5 h-5 text-[#10b981]" />
                    <h3 className="font-display font-extrabold text-base uppercase tracking-tight">
                      {preferredLanguage === "EN" ? "MY VOCABULARY VAULT" : "আমার সংরক্ষিত শব্দভাণ্ডার (Vocabulary Vault)"}
                    </h3>
                  </div>
                  <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                    {preferredLanguage === "EN" ? `Total: ${savedWords.length} words` : `মোট শব্দ: ${savedWords.length} টি`}
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {preferredLanguage === "EN" 
                    ? "All your bookmarked difficult or important words are kept here. Click on words to see detail profiles, or press & hold any word for a Quick Peek!" 
                    : "আপনার বুকমার্ক করা সকল কঠিন বা গুরুত্বপূর্ণ শব্দ এখানে জমা থাকবে। শব্দে ক্লিক করে বিস্তারিত জানতে পারেন, অথবা দ্রুত একনজর দেখতে যেকোনো শব্দে চেপে ধরে রাখুন (লং-প্রেস করুন)!"}
                </p>

                {savedWords.length > 0 && (
                  <div className="bg-indigo-50/70 border-2 border-dashed border-indigo-300 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl border border-indigo-200">
                        <Sparkles className="w-5 h-5 fill-indigo-200" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-display font-extrabold text-xs uppercase tracking-tight text-indigo-900">
                          {preferredLanguage === "EN" ? "ACTIVE MEMORY FLASHCARDS" : "স্মৃতিশক্তি পরীক্ষা ফ্ল্যাশকার্ডস"}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-bold">
                          {preferredLanguage === "EN" 
                            ? "Test your recall by hiding word meanings until you flip the card!" 
                            : "শব্দের অর্থ লুকিয়ে রেখে নিজের রিভিশন ও মনে রাখার ক্ষমতা যাচাই করুন!"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsFlashcardViewActive(true)}
                      className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-display text-xs font-black uppercase tracking-wider rounded-xl border-2 border-slate-900 shadow-sm transition-transform active:scale-95 cursor-pointer"
                    >
                      {preferredLanguage === "EN" ? "Launch Flashcards 🎴" : "ফ্ল্যাশকার্ড শুরু করুন 🎴"}
                    </button>
                  </div>
                )}

                {savedWords.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
                    <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="font-display font-extrabold text-sm uppercase">
                      {preferredLanguage === "EN" ? "NO SAVED WORDS" : "কোনো শব্দ সংরক্ষিত নেই"}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      {preferredLanguage === "EN" 
                        ? "Search any word in the dictionary tab and click the bookmark icon to save it here." 
                        : "ডিকশনারি ট্যাবে যেকোনো শব্দ সার্চ করে বুকমার্ক আইকনে ক্লিক করুন, তখন তা এখানে চলে আসবে।"}
                    </p>
                    <button
                      onClick={() => {
                        setActiveMainTab("dictionary");
                        handleSearch("resilience");
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-display text-xs font-bold px-4 py-2 rounded-xl border-2 border-slate-900"
                    >
                      FIND A WORD
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedWords.map((word) => {
                      const isPreloaded = PRELOADED_WORDS[word.toLowerCase()];
                      
                      return (
                        <div
                          key={word}
                          onMouseDown={() => startLongPress(word)}
                          onMouseUp={endLongPress}
                          onMouseLeave={endLongPress}
                          onTouchStart={() => startLongPress(word)}
                          onTouchEnd={endLongPress}
                          onTouchMove={endLongPress}
                          onContextMenu={(e) => {
                            if (isLongPressActive.current) {
                              e.preventDefault();
                            }
                          }}
                          className="border-2 border-slate-200 rounded-2xl p-4 bg-slate-50 hover:bg-emerald-50/20 hover:border-slate-900 transition-all flex justify-between items-center text-slate-900 select-none cursor-pointer"
                          title={preferredLanguage === "EN" ? "Press & Hold for Quick Peek" : "দ্রুত দেখতে চেপে ধরে রাখুন"}
                        >
                          <div className="space-y-1">
                            <h4 className="font-display font-extrabold text-sm uppercase tracking-tight">{word}</h4>
                            <p className="text-xs text-slate-500 font-medium">
                              {isPreloaded ? (isPreloaded.bengaliMeaning?.split(/[,;।]/)[0]?.trim() || isPreloaded.bengaliMeaning) : (preferredLanguage === "EN" ? "Custom saved word" : "ব্যবহারকারী দ্বারা সংরক্ষিত শব্দ")}
                            </p>
                          </div>

                          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setSearchWord(word);
                                handleSearch(word);
                              }}
                              className="bg-white hover:bg-emerald-600 border border-slate-200 hover:border-slate-900 hover:text-white p-2 rounded-xl text-slate-600 transition-all text-xs font-bold flex items-center gap-1"
                              title={preferredLanguage === "EN" ? "Details" : "বিস্তারিত দেখুন"}
                            >
                              <span>DETAILS</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => toggleBookmark(word)}
                              className="p-2 bg-white hover:bg-red-50 text-red-500 hover:text-red-700 rounded-xl border border-slate-200 hover:border-slate-900 transition-all"
                              title="সংরক্ষণ বাতিল"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}


            {/* HABIT BUILDER & STUDY HISTORY CHART VISUALIZATION */}
            <StudyHabitVisualizer
              preferredLanguage={preferredLanguage}
              isDarkMode={isDarkMode}
              onTriggerNotification={(title, body) => {
                setInAppNotification({ title, body });
              }}
            />

            {/* DAILY REMINDERS CONFIGURATION SECTION */}
            <DailyReminderPanel
              preferredLanguage={preferredLanguage}
              savedWords={savedWords}
              isDarkMode={isDarkMode}
              onShowInAppNotification={(title, body) => {
                setInAppNotification({ title, body });
              }}
              dailyGoal={dailyGoal}
              onDailyGoalChange={handleDailyGoalChange}
            />

          </motion.div>
        )}

      </main>

      {/* FOOTER COPYRIGHT BAR WITH LEAF BRAND MATCHING SCREENSHOT */}
      <footer className={`border-t py-12 px-4 transition-colors duration-300 mt-16 ${
        isDarkMode ? "bg-[#0f1d19] border-emerald-950 text-[#e2f1ec]/70" : "bg-white border-slate-200 text-slate-500"
      }`}>
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-display font-extrabold text-base tracking-tight text-slate-900 dark:text-emerald-400 uppercase">
                LEARN ENGLISH EASY
              </span>
            </div>
            
            <p className="text-xs font-display font-bold tracking-wider text-slate-400 uppercase max-w-md mx-auto leading-relaxed">
              BUILT WITH LOVE FOR EVERY BENGALI SPEAKER STRIVING TO MASTER THE ENGLISH LANGUAGE.
            </p>
          </div>

          <div className="h-px bg-slate-100 max-w-xs mx-auto"></div>

          <div className="text-[10px] font-mono tracking-wider text-slate-400 uppercase space-y-1">
            <p>© 2026 AI-Powered English Pronunciation & Fluency Coach.</p>
            <p className="text-[#10b981] font-bold">POWERED BY GEMINI 3.5 FLASH & GOOGLE AI STUDIO</p>
          </div>
        </div>
      </footer>

      {/* QUICK-PEEK MODAL */}
      <AnimatePresence>
        {peekWord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPeekWord(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className={`relative w-full max-w-sm rounded-3xl border-3 border-slate-900 p-6 bubbly-card-shadow overflow-hidden z-10 ${
                isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
              }`}
            >
              {/* Nice top highlight strip */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-indigo-500" />

              {/* Header */}
              <div className="flex justify-between items-start pt-2">
                <span className="text-[10px] font-extrabold font-display px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-full uppercase tracking-wider border border-indigo-100 dark:border-indigo-900">
                  {preferredLanguage === "EN" ? "Quick Vocabulary Peek" : "একনজরে শব্দার্থ"}
                </span>
                <button
                  onClick={() => setPeekWord(null)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="mt-4 space-y-4">
                <div className="space-y-1.5 text-center">
                  <h3 className="font-display font-black text-3xl uppercase tracking-tight text-indigo-600 dark:text-indigo-400 break-words">
                    {peekWord}
                  </h3>
                  
                  {PRELOADED_WORDS[peekWord.toLowerCase()]?.phonetic && (
                    <div className="flex items-center justify-center gap-1.5">
                      <p className="text-xs font-mono font-bold text-slate-400">
                        {PRELOADED_WORDS[peekWord.toLowerCase()].phonetic}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpeak(peekWord);
                        }}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-950/30 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer"
                        title={preferredLanguage === "EN" ? "Listen" : "শুনুন"}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Details card */}
                <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-4 border border-slate-150 dark:border-slate-800/80 space-y-3.5">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-1.5">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">
                        {preferredLanguage === "EN" ? "PART OF SPEECH" : "পদ (Speech)"}
                      </span>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase">
                        {PRELOADED_WORDS[peekWord.toLowerCase()]?.partOfSpeech || "N/A"}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-1.5">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">
                        {preferredLanguage === "EN" ? "DIFFICULTY" : "কঠিনতার স্তর"}
                      </span>
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase">
                        {PRELOADED_WORDS[peekWord.toLowerCase()]?.difficultyLevel || "Custom"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">
                      {preferredLanguage === "EN" ? "PRIMARY BENGALI MEANING" : "প্রধান বাংলা অর্থ"}
                    </span>
                    <p className="text-base font-black text-emerald-600 dark:text-emerald-400 leading-normal">
                      {PRELOADED_WORDS[peekWord.toLowerCase()]?.bengaliMeaning || (preferredLanguage === "EN" ? "Custom saved word" : "ব্যবহারকারী দ্বারা সংরক্ষিত শব্দ")}
                    </p>
                  </div>

                  {PRELOADED_WORDS[peekWord.toLowerCase()]?.englishDefinition && (
                    <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/50 text-left">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">
                        {preferredLanguage === "EN" ? "ENGLISH DEFINITION" : "ইংরেজি সংজ্ঞা"}
                      </span>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300 italic leading-relaxed">
                        "{PRELOADED_WORDS[peekWord.toLowerCase()].englishDefinition}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setPeekWord(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-display text-[10px] font-black uppercase tracking-wider border border-slate-200 dark:border-slate-700 active:scale-95 transition-all cursor-pointer text-center"
                >
                  {preferredLanguage === "EN" ? "Dismiss" : "বন্ধ করুন"}
                </button>

                <button
                  onClick={() => {
                    const w = peekWord;
                    setPeekWord(null);
                    setSearchWord(w);
                    handleSearch(w);
                  }}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-display text-[10px] font-black uppercase tracking-wider border-2 border-slate-900 shadow-sm active:scale-95 transition-all cursor-pointer text-center"
                >
                  {preferredLanguage === "EN" ? "Full Profile" : "বিস্তারিত প্রোফাইল"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
