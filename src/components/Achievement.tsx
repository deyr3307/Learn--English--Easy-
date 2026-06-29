import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, 
  Flame, 
  BookOpen, 
  Search, 
  Bookmark, 
  Award, 
  Sparkles, 
  Star, 
  Zap, 
  CheckCircle2, 
  Crown, 
  BrainCircuit, 
  Activity,
  Lock,
  Compass,
  Smile
} from "lucide-react";

interface AchievementProps {
  preferredLanguage: "EN" | "BN";
  isDarkMode: boolean;
  totalSearches: number;
  streak: number;
  totalQuizzes: number;
  totalCorrect: number;
  savedWordsCount: number;
}

interface AchievementItem {
  id: string;
  titleEN: string;
  titleBN: string;
  descEN: string;
  descBN: string;
  iconType: any;
  themeColor: string; // Tailwind color name like "emerald", "amber"
  targetValue: number;
  type: "searches" | "streak" | "quizzes" | "correct" | "saved";
}

const ACHIEVEMENTS_DATA: AchievementItem[] = [
  {
    id: "first_search",
    titleEN: "First Steps",
    titleBN: "প্রথম পদক্ষেপ",
    descEN: "Search your first word to kickstart your journey.",
    descBN: "শেখার যাত্রা শুরু করতে ডিকশনারিতে প্রথম শব্দটি খুঁজুন।",
    iconType: Search,
    themeColor: "emerald",
    targetValue: 1,
    type: "searches",
  },
  {
    id: "word_collector",
    titleEN: "Word Collector",
    titleBN: "শব্দ সংগ্রাহক",
    descEN: "Search 10 words in the dictionary.",
    descBN: "ডিকশনারিতে অন্তত ১০টি শব্দ খুঁজুন।",
    iconType: BookOpen,
    themeColor: "sky",
    targetValue: 10,
    type: "searches",
  },
  {
    id: "lexicon_master",
    titleEN: "Lexicon Master",
    titleBN: "অভিধান বিজয়ী",
    descEN: "Search 50 words to unlock deep insights.",
    descBN: "আপনার শব্দভাণ্ডার সমৃদ্ধ করতে ৫০টি শব্দ খুঁজুন।",
    iconType: BrainCircuit,
    themeColor: "violet",
    targetValue: 50,
    type: "searches",
  },
  {
    id: "vocab_legend",
    titleEN: "Vocab Legend",
    titleBN: "শব্দকোষ কিংবদন্তি",
    descEN: "Search 100 words in the dictionary!",
    descBN: "অভিজ্ঞতায় পৌঁছাতে ডিকশনারিতে ১০০টি শব্দ খুঁজুন!",
    iconType: Crown,
    themeColor: "amber",
    targetValue: 100,
    type: "searches",
  },
  {
    id: "streak_starter",
    titleEN: "Streak Starter",
    titleBN: "ধারাবাহিকতার শুরু",
    descEN: "Maintain a study streak of 2 days.",
    descBN: "টানা ২ দিন পড়ার ধারাবাহিকতা বজায় রাখুন।",
    iconType: Flame,
    themeColor: "orange",
    targetValue: 2,
    type: "streak",
  },
  {
    id: "habit_builder",
    titleEN: "Habit Builder",
    titleBN: "অভ্যাস গঠনকারী",
    descEN: "Reach a 5-day study streak!",
    descBN: "টানা ৫ দিন পড়ার চমৎকার মাইলস্টোনে পৌঁছান!",
    iconType: Flame,
    themeColor: "fuchsia",
    targetValue: 5,
    type: "streak",
  },
  {
    id: "weekly_warrior",
    titleEN: "Weekly Warrior",
    titleBN: "সাপ্তাহিক যোদ্ধা",
    descEN: "Maintain a perfect 7-day study streak.",
    descBN: "টানা ৭ দিন পড়ার একটি নিখুঁত রেকর্ড বজায় রাখুন।",
    iconType: Trophy,
    themeColor: "red",
    targetValue: 7,
    type: "streak",
  },
  {
    id: "quiz_initiate",
    titleEN: "Quiz Enthusiast",
    titleBN: "কুইজ কৌতূহলী",
    descEN: "Attempt your first vocabulary challenge quiz.",
    descBN: "আপনার প্রথম ভোকাবুলারি চ্যালেঞ্জ কুইজটি খেলুন।",
    iconType: CheckCircle2,
    themeColor: "indigo",
    targetValue: 1,
    type: "quizzes",
  },
  {
    id: "quiz_champion",
    titleEN: "Quiz Champion",
    titleBN: "কুইজ বিজয়ী",
    descEN: "Get 15 correct answers total in quizzes.",
    descBN: "কুইজে মোট ১৫টি সঠিক উত্তর দিন।",
    iconType: Sparkles,
    themeColor: "teal",
    targetValue: 15,
    type: "correct",
  },
  {
    id: "word_curator",
    titleEN: "Word Curator",
    titleBN: "শব্দ সংরক্ষক",
    descEN: "Save 5 words to your custom bookmark list.",
    descBN: "আপনার বুকমার্ক তালিকায় অন্তত ৫টি শব্দ সংরক্ষণ করুন।",
    iconType: Bookmark,
    themeColor: "rose",
    targetValue: 5,
    type: "saved",
  },
];

export default function Achievement({
  preferredLanguage,
  isDarkMode,
  totalSearches,
  streak,
  totalQuizzes,
  totalCorrect,
  savedWordsCount,
}: AchievementProps) {
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");

  const getCurrentValue = (type: AchievementItem["type"]) => {
    switch (type) {
      case "searches":
        return totalSearches;
      case "streak":
        return streak;
      case "quizzes":
        return totalQuizzes;
      case "correct":
        return totalCorrect;
      case "saved":
        return savedWordsCount;
      default:
        return 0;
    }
  };

  const getThemeStyles = (color: string, isUnlocked: boolean) => {
    if (!isUnlocked) {
      return {
        iconBg: "bg-slate-100 dark:bg-slate-800 text-slate-400",
        border: "border-slate-300 dark:border-slate-700",
        progressFill: "bg-slate-300 dark:bg-slate-600",
        badgeGlow: "",
      };
    }

    const styles: Record<string, any> = {
      emerald: {
        iconBg: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800",
        border: "border-emerald-500 dark:border-emerald-500",
        progressFill: "bg-emerald-500",
        badgeGlow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]",
      },
      sky: {
        iconBg: "bg-sky-100 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border-sky-300 dark:border-sky-800",
        border: "border-sky-500 dark:border-sky-500",
        progressFill: "bg-sky-500",
        badgeGlow: "shadow-[0_0_15px_rgba(14,165,233,0.3)]",
      },
      violet: {
        iconBg: "bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border-violet-300 dark:border-violet-800",
        border: "border-violet-500 dark:border-violet-500",
        progressFill: "bg-violet-500",
        badgeGlow: "shadow-[0_0_15px_rgba(139,92,246,0.3)]",
      },
      amber: {
        iconBg: "bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800",
        border: "border-amber-500 dark:border-amber-500",
        progressFill: "bg-amber-500",
        badgeGlow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]",
      },
      orange: {
        iconBg: "bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-800",
        border: "border-orange-500 dark:border-orange-500",
        progressFill: "bg-orange-500",
        badgeGlow: "shadow-[0_0_15px_rgba(249,115,22,0.3)]",
      },
      fuchsia: {
        iconBg: "bg-fuchsia-100 dark:bg-fuchsia-950/50 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-300 dark:border-fuchsia-800",
        border: "border-fuchsia-500 dark:border-fuchsia-500",
        progressFill: "bg-fuchsia-500",
        badgeGlow: "shadow-[0_0_15px_rgba(217,70,239,0.3)]",
      },
      red: {
        iconBg: "bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800",
        border: "border-red-500 dark:border-red-500",
        progressFill: "bg-red-500",
        badgeGlow: "shadow-[0_0_15px_rgba(239,68,68,0.3)]",
      },
      indigo: {
        iconBg: "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800",
        border: "border-indigo-500 dark:border-indigo-500",
        progressFill: "bg-indigo-500",
        badgeGlow: "shadow-[0_0_15px_rgba(79,70,229,0.3)]",
      },
      teal: {
        iconBg: "bg-teal-100 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border-teal-300 dark:border-teal-800",
        border: "border-teal-500 dark:border-teal-500",
        progressFill: "bg-teal-500",
        badgeGlow: "shadow-[0_0_15px_rgba(20,184,166,0.3)]",
      },
      rose: {
        iconBg: "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800",
        border: "border-rose-500 dark:border-rose-500",
        progressFill: "bg-rose-500",
        badgeGlow: "shadow-[0_0_15px_rgba(244,63,94,0.3)]",
      },
    };

    return styles[color] || styles.emerald;
  };

  const processedAchievements = ACHIEVEMENTS_DATA.map((ach) => {
    const currentValue = getCurrentValue(ach.type);
    const isUnlocked = currentValue >= ach.targetValue;
    const progressPercent = Math.min(100, (currentValue / ach.targetValue) * 100);
    return {
      ...ach,
      currentValue,
      isUnlocked,
      progressPercent,
    };
  });

  const totalBadges = ACHIEVEMENTS_DATA.length;
  const unlockedBadgesCount = processedAchievements.filter(a => a.isUnlocked).length;
  const overallProgressPercent = Math.min(100, (unlockedBadgesCount / totalBadges) * 100);

  const filteredAchievements = processedAchievements.filter((ach) => {
    if (filter === "unlocked") return ach.isUnlocked;
    if (filter === "locked") return !ach.isUnlocked;
    return true;
  });

  return (
    <div className={`rounded-3xl border-2 border-slate-900 p-6 space-y-6 bubbly-card-shadow text-left ${
      isDarkMode ? "bg-slate-900/60 text-white" : "bg-white text-slate-900"
    }`}>
      {/* Header and Progress section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 border-2 border-slate-900 flex items-center justify-center text-slate-950 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg uppercase tracking-tight">
                {preferredLanguage === "EN" ? "Learning Badges & Achievements" : "অর্জন ও সম্মানসূচক ব্যাজসমূহ"}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                {preferredLanguage === "EN" 
                  ? "Unlock dynamic achievements as you search, practice and study!" 
                  : "পড়ার ধারাবাহিকতা, শব্দ অনুসন্ধান ও কুইজ খেলে ব্যাজগুলো আনলক করুন!"}
              </p>
            </div>
          </div>
        </div>

        {/* Aggregate Progress */}
        <div className="flex flex-col justify-center gap-1.5 shrink-0 min-w-[180px]">
          <div className="flex items-center justify-between font-display text-xs font-black uppercase">
            <span>{preferredLanguage === "EN" ? "Unlocked" : "আনলকড"}</span>
            <span className="text-[#10b981]">
              {unlockedBadgesCount} / {totalBadges} {preferredLanguage === "EN" ? "Badges" : "ব্যাজ"}
            </span>
          </div>
          <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full border-2 border-slate-900 overflow-hidden p-[2px]">
            <motion.div 
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgressPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "unlocked", "locked"] as const).map((tab) => {
          const isActive = filter === tab;
          const getTabLabel = () => {
            if (tab === "all") return preferredLanguage === "EN" ? "All Badges" : "সব ব্যাজ";
            if (tab === "unlocked") return preferredLanguage === "EN" ? "Unlocked Only" : "আনলকড ব্যাজ";
            return preferredLanguage === "EN" ? "Locked Only" : "লকড ব্যাজ";
          };
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider transition-all border-2 cursor-pointer ${
                isActive 
                  ? "bg-[#10b981] border-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] scale-105" 
                  : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {getTabLabel()}
            </button>
          );
        })}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredAchievements.map((ach) => {
            const IconComponent = ach.iconType;
            const themeStyles = getThemeStyles(ach.themeColor, ach.isUnlocked);
            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                key={ach.id}
                className={`relative flex items-center gap-4 rounded-2xl border-2 p-4 transition-all hover:translate-y-[-2px] ${
                  ach.isUnlocked 
                    ? `border-slate-900 ${isDarkMode ? "bg-slate-900/80" : "bg-white"} ${themeStyles.badgeGlow} bubbly-card-shadow-sm` 
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20"
                }`}
              >
                {/* Badge Left Icon Graphic */}
                <div className={`relative w-14 h-14 rounded-xl border-2 flex items-center justify-center shrink-0 ${
                  ach.isUnlocked ? `border-slate-900 ${themeStyles.iconBg}` : `border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400`
                }`}>
                  <IconComponent className={`w-7 h-7 ${ach.isUnlocked ? "animate-pulse" : ""}`} />
                  {!ach.isUnlocked && (
                    <div className="absolute -bottom-1 -right-1 bg-slate-200 dark:bg-slate-700 text-slate-500 rounded-full p-0.5 border border-slate-300 dark:border-slate-600">
                      <Lock className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                {/* Badge Details */}
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className={`font-display font-black text-sm uppercase tracking-tight truncate ${
                      ach.isUnlocked ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-500"
                    }`}>
                      {preferredLanguage === "EN" ? ach.titleEN : ach.titleBN}
                    </h4>
                    {ach.isUnlocked && (
                      <span className="text-[9px] font-black tracking-widest uppercase bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-slate-950" />
                        {preferredLanguage === "EN" ? "UNLOCKED" : "অর্জিত"}
                      </span>
                    )}
                  </div>

                  <p className={`text-[11px] font-bold leading-tight ${
                    ach.isUnlocked ? "text-slate-600 dark:text-slate-300" : "text-slate-400 dark:text-slate-600"
                  }`}>
                    {preferredLanguage === "EN" ? ach.descEN : ach.descBN}
                  </p>

                  {/* Progress Indicator for locked badges */}
                  <div className="space-y-1 pt-1.5">
                    <div className="flex items-center justify-between text-[9px] font-mono font-black uppercase text-slate-400">
                      <span>{preferredLanguage === "EN" ? "Progress" : "অগ্রগতি"}</span>
                      <span>
                        {ach.currentValue} / {ach.targetValue}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-300 dark:border-slate-700 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${themeStyles.progressFill}`}
                        style={{ width: `${ach.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredAchievements.length === 0 && (
          <div className="col-span-full py-8 text-center space-y-2">
            <Smile className="w-10 h-10 text-slate-400 mx-auto animate-bounce" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {preferredLanguage === "EN" 
                ? "No badges fit this category yet." 
                : "এই ক্যাটাগরিতে কোনো ব্যাজ পাওয়া যায়নি।"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
