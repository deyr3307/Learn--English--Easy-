import React, { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  Flame, 
  Calendar, 
  TrendingUp, 
  Award, 
  Play, 
  Sparkles, 
  Clock, 
  BookOpen, 
  PlusCircle, 
  CheckCircle2,
  Trash2,
  HelpCircle
} from "lucide-react";

interface StudySession {
  id: string;
  timestamp: string; // ISO string
  durationMinutes: number;
  activityType: "vocabulary_lookup" | "pronunciation_practice" | "quiz" | "category_review";
}

interface QuizStats {
  totalQuizzes: number;
  totalQuestions: number;
  totalCorrect: number;
  history: { 
    date: string; 
    timestamp?: string; 
    score: number; 
    total: number; 
  }[];
}

interface StudyHabitVisualizerProps {
  preferredLanguage: "EN" | "BN";
  isDarkMode: boolean;
  onTriggerNotification?: (title: string, body: string) => void;
}

export default function StudyHabitVisualizer({
  preferredLanguage,
  isDarkMode,
  onTriggerNotification
}: StudyHabitVisualizerProps) {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<"30day" | "7day">("7day");
  const [streak, setStreak] = useState<number>(0);
  const [activeDaysCount, setActiveDaysCount] = useState<number>(0);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [customMinutes, setCustomMinutes] = useState<number>(10);
  const [customType, setCustomType] = useState<StudySession["activityType"]>("vocabulary_lookup");

  // Helper to format ISO to date string (YYYY-MM-DD)
  const getLocalDateString = (date: Date): string => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split("T")[0];
  };

  // Helper to check if two Date objects represent the same calendar day
  const isSameDay = (d1: Date, d2: Date): boolean => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Seed data function to populate last 30 days realistically
  const getSeededHistory = (): StudySession[] => {
    const seeded: StudySession[] = [];
    const now = new Date();
    
    // Activity types
    const types: StudySession["activityType"][] = [
      "vocabulary_lookup",
      "pronunciation_practice",
      "quiz",
      "category_review"
    ];

    // Seed about 16 days out of the last 30 days with study sessions
    // Ensure we seed today and yesterday to show a nice streak!
    const streakDays = [0, 1, 3, 4, 5, 8, 9, 11, 14, 15, 18, 20, 21, 22, 25, 28];
    
    streakDays.forEach((daysAgo) => {
      const sessionDate = new Date();
      sessionDate.setDate(now.getDate() - daysAgo);
      // Give it random hours
      sessionDate.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0);
      
      const numSessions = 1 + Math.floor(Math.random() * 2); // 1 to 2 sessions
      for (let i = 0; i < numSessions; i++) {
        seeded.push({
          id: `seed-${daysAgo}-${i}`,
          timestamp: sessionDate.toISOString(),
          durationMinutes: 5 + Math.floor(Math.random() * 15), // 5 to 20 mins
          activityType: types[Math.floor(Math.random() * types.length)]
        });
      }
    });

    return seeded.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  // Seed data function for quiz history over the last 7 days to make the trends graph look gorgeous
  const getSeededQuizHistory = (): QuizStats => {
    const now = new Date();
    const history = [];
    
    // Seed 3 quizzes taken at 1, 3, and 5 days ago
    const daysAgo = [1, 3, 5];
    const scores = [
      { score: 4, total: 5 }, // 80%
      { score: 5, total: 5 }, // 100%
      { score: 3, total: 5 }, // 60%
    ];

    daysAgo.forEach((days, idx) => {
      const qDate = new Date();
      qDate.setDate(now.getDate() - days);
      qDate.setHours(10 + idx, 15 * idx, 0, 0);

      history.push({
        date: qDate.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        timestamp: qDate.toISOString(),
        score: scores[idx].score,
        total: scores[idx].total
      });
    });

    const totalQuestions = scores.reduce((sum, s) => sum + s.total, 0);
    const totalCorrect = scores.reduce((sum, s) => sum + s.score, 0);

    return {
      totalQuizzes: daysAgo.length,
      totalQuestions,
      totalCorrect,
      history
    };
  };

  // Synchronized polling of localStorage to ensure instantaneous update across panels
  useEffect(() => {
    const loadAllStats = () => {
      // 1. Study history
      const storedHistory = localStorage.getItem("learn_english_easy_study_history");
      if (storedHistory) {
        try {
          const parsed = JSON.parse(storedHistory);
          setSessions((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(parsed)) {
              return parsed;
            }
            return prev;
          });
        } catch (e) {
          console.error("Error parsing study history:", e);
        }
      } else {
        const seed = getSeededHistory();
        setSessions(seed);
        localStorage.setItem("learn_english_easy_study_history", JSON.stringify(seed));
      }

      // 2. Quiz stats
      const storedQuiz = localStorage.getItem("learn_english_easy_quiz_stats");
      if (storedQuiz) {
        try {
          const parsed = JSON.parse(storedQuiz);
          setQuizStats((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(parsed)) {
              return parsed;
            }
            return prev;
          });
        } catch (e) {
          console.error("Error parsing quiz stats:", e);
        }
      } else {
        const seedQuiz = getSeededQuizHistory();
        setQuizStats(seedQuiz);
        localStorage.setItem("learn_english_easy_quiz_stats", JSON.stringify(seedQuiz));
      }
    };

    loadAllStats();
    const interval = setInterval(loadAllStats, 1500);
    return () => clearInterval(interval);
  }, []);

  // Calculate Streak & Active Days
  useEffect(() => {
    if (sessions.length === 0) {
      setStreak(0);
      setActiveDaysCount(0);
      return;
    }

    // Get unique dates sorted in descending order
    const uniqueDates: string[] = Array.from(
      new Set(
        sessions.map(s => getLocalDateString(new Date(s.timestamp)))
      )
    ) as string[];
    uniqueDates.sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());

    setActiveDaysCount(uniqueDates.length);

    // Calculate daily streak
    let currentStreak = 0;
    const todayStr = getLocalDateString(new Date());
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterdayDate);

    // Check if user studied today or yesterday to continue streak
    let hasStudiedRecent = uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr);
    
    if (hasStudiedRecent) {
      let checkDate = uniqueDates.includes(todayStr) ? new Date() : yesterdayDate;
      
      while (true) {
        const checkStr = getLocalDateString(checkDate);
        if (uniqueDates.includes(checkStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1); // Go to previous day
        } else {
          break;
        }
      }
    }

    setStreak(currentStreak);
  }, [sessions]);

  // Log a new study session helper
  const logStudySession = (duration: number, type: StudySession["activityType"]) => {
    const newSession: StudySession = {
      id: `session-${Date.now()}`,
      timestamp: new Date().toISOString(),
      durationMinutes: duration,
      activityType: type
    };

    const updated = [...sessions, newSession];
    setSessions(updated);
    localStorage.setItem("learn_english_easy_study_history", JSON.stringify(updated));

    // Show app alert
    if (onTriggerNotification) {
      const activityLabels = {
        vocabulary_lookup: preferredLanguage === "EN" ? "Word lookup" : "শব্দ খোঁজা",
        pronunciation_practice: preferredLanguage === "EN" ? "Pronunciation coach" : "উচ্চারণ অনুশীলন",
        quiz: preferredLanguage === "EN" ? "Vocabulary Quiz" : "ভোকাবুলারি কুইজ",
        category_review: preferredLanguage === "EN" ? "Category review" : "ক্যাটাগরি রিভিশন"
      };

      onTriggerNotification(
        preferredLanguage === "EN" ? "🎯 Study Session Recorded!" : "🎯 অধ্যয়নের সেশন নথিভুক্ত হয়েছে!",
        preferredLanguage === "EN" 
          ? `Logged ${duration} mins of ${activityLabels[type]}. Keep up the daily momentum!` 
          : `${activityLabels[type]}-এর ${duration} মিনিট প্র্যাকটিস যোগ হয়েছে। গতি বজায় রাখুন!`
      );
    }
  };

  // Clear study logs (for testing / reset)
  const handleClearHistory = () => {
    if (confirm(preferredLanguage === "EN" ? "Reset your 30-day study frequency data?" : "আপনি কি ৩০ দিনের স্টাডি ডাটা রিসেট করতে চান?")) {
      setSessions([]);
      localStorage.setItem("learn_english_easy_study_history", JSON.stringify([]));
    }
  };

  // Prepare chart data for the last 30 days
  const getChartData = () => {
    const dataList = [];
    const now = new Date();

    // Map sessions to a quick date-frequency map
    const frequencyMap: Record<string, { count: number; duration: number }> = {};
    sessions.forEach((s) => {
      const dateStr = getLocalDateString(new Date(s.timestamp));
      if (!frequencyMap[dateStr]) {
        frequencyMap[dateStr] = { count: 0, duration: 0 };
      }
      frequencyMap[dateStr].count += 1;
      frequencyMap[dateStr].duration += s.durationMinutes;
    });

    // Populate last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = getLocalDateString(d);
      
      // Short human display date e.g. "Jun 24"
      const label = d.toLocaleDateString(preferredLanguage === "EN" ? "en-US" : "bn-BD", {
        month: "short",
        day: "numeric"
      });

      const dayData = frequencyMap[dateStr] || { count: 0, duration: 0 };

      dataList.push({
        date: dateStr,
        label,
        "Sessions": dayData.count,
        "Minutes": dayData.duration
      });
    }

    return dataList;
  };

  // Prepare data for 7-day trend line chart combining study duration & quiz accuracy
  const getSevenDayTrendData = () => {
    const trendList = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() - i);
      
      const dateStr = getLocalDateString(targetDate);
      const label = targetDate.toLocaleDateString(preferredLanguage === "EN" ? "en-US" : "bn-BD", {
        month: "short",
        day: "numeric"
      });

      // 1. Calculate study duration for targetDate
      const daysSessions = sessions.filter(s => {
        const sDate = new Date(s.timestamp);
        return isSameDay(sDate, targetDate);
      });
      const studyDuration = daysSessions.reduce((sum, s) => sum + s.durationMinutes, 0);

      // 2. Calculate average quiz accuracy for targetDate
      let dayQuizzes: { score: number; total: number }[] = [];
      if (quizStats && quizStats.history) {
        dayQuizzes = quizStats.history.filter(h => {
          const qDate = h.timestamp ? new Date(h.timestamp) : new Date(h.date);
          return isSameDay(qDate, targetDate);
        });
      }

      let quizAccuracy: number | null = null;
      if (dayQuizzes.length > 0) {
        const totalScore = dayQuizzes.reduce((sum, q) => sum + q.score, 0);
        const totalQuestions = dayQuizzes.reduce((sum, q) => sum + q.total, 0);
        quizAccuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
      }

      trendList.push({
        date: dateStr,
        label,
        duration: studyDuration,
        accuracy: quizAccuracy,
        hasQuiz: dayQuizzes.length > 0
      });
    }

    return trendList;
  };

  const chartData = getChartData();
  const trendData = getSevenDayTrendData();
  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  // Consistency percentage (Active days out of 30)
  const consistencyPercent = Math.round((activeDaysCount / 30) * 100);

  return (
    <div id="study-habit-visualizer" className={`rounded-3xl border-2 border-slate-900 p-6 space-y-6 transition-all ${
      isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
    } bubbly-card-shadow`}>
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-5.5 h-5.5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="font-display font-black text-base uppercase tracking-tight">
              {preferredLanguage === "EN" ? "HABIT BUILDER & STUDY TRACKER" : "স্টাডি হ্যাবিট ট্র্যাকার ও গ্রাফ"}
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {preferredLanguage === "EN" 
                ? "30-Day visualization of your vocabulary study frequency" 
                : "আপনার বিগত ৩০ দিনের পড়াশোনার ফ্রিকোয়েন্সি গ্রাফ ও পরিসংখ্যান"}
            </p>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLogModal(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-slate-900 rounded-xl font-display text-[10px] font-extrabold uppercase tracking-wide cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95 shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{preferredLanguage === "EN" ? "Log Study Session" : "অধ্যয়ন সেশন যোগ করুন"}</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="p-2 border border-slate-200 dark:border-slate-800 hover:border-red-500 hover:text-red-500 rounded-xl transition-all"
            title={preferredLanguage === "EN" ? "Reset History" : "ইতিহাস মুছুন"}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* QUICK STATS METRIC GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Metric 1: Streak */}
        <div className="bg-[#fffbeb] dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-900/60 p-4 rounded-2xl text-center space-y-1 relative overflow-hidden">
          <span className="text-[9px] font-extrabold font-display text-amber-800 dark:text-amber-400 uppercase tracking-widest block">
            {preferredLanguage === "EN" ? "STREAK ACTIVE" : "টানা সক্রিয় দিন"}
          </span>
          <div className="flex items-center justify-center gap-1">
            <Flame className="w-6 h-6 text-amber-500 fill-amber-400 animate-pulse" />
            <p className="font-display font-black text-2xl text-amber-700 dark:text-amber-300">{streak} {preferredLanguage === "EN" ? "Days" : "দিন"}</p>
          </div>
          <span className="text-[9px] text-slate-400 font-bold block uppercase">
            {preferredLanguage === "EN" ? "Consecutive Study" : "টানা অনুশীলন"}
          </span>
        </div>

        {/* Metric 2: Active Days */}
        <div className="bg-[#ecf9f4] dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-900/60 p-4 rounded-2xl text-center space-y-1">
          <span className="text-[9px] font-extrabold font-display text-emerald-800 dark:text-emerald-400 uppercase tracking-widest block">
            {preferredLanguage === "EN" ? "ACTIVE DAYS" : "মোট সক্রিয় দিন"}
          </span>
          <p className="font-display font-black text-2xl text-emerald-700 dark:text-emerald-300">{activeDaysCount} / 30</p>
          <span className="text-[9px] text-slate-400 font-bold block uppercase">
            {preferredLanguage === "EN" ? "In Last 30 Days" : "বিগত ৩০ দিনে"}
          </span>
        </div>

        {/* Metric 3: Consistency Score */}
        <div className="bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-900/60 p-4 rounded-2xl text-center space-y-1">
          <span className="text-[9px] font-extrabold font-display text-indigo-800 dark:text-indigo-400 uppercase tracking-widest block">
            {preferredLanguage === "EN" ? "CONSISTENCY" : "ধারাবাহিকতা"}
          </span>
          <p className="font-display font-black text-2xl text-indigo-700 dark:text-indigo-300">{consistencyPercent}%</p>
          <span className="text-[9px] text-slate-400 font-bold block uppercase">
            {preferredLanguage === "EN" ? "Study Frequency Score" : "নিয়মিত অধ্যয়নের হার"}
          </span>
        </div>

        {/* Metric 4: Total Study Time */}
        <div className="bg-slate-50 dark:bg-slate-950/40 border-2 border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-center space-y-1">
          <span className="text-[9px] font-extrabold font-display text-slate-500 uppercase tracking-widest block">
            {preferredLanguage === "EN" ? "EST. STUDY TIME" : "আনুমানিক পড়াশোনার সময়"}
          </span>
          <div className="flex items-center justify-center gap-1">
            <Clock className="w-4 h-4 text-slate-500" />
            <p className="font-display font-black text-2xl text-slate-700 dark:text-slate-300">
              {totalMinutes} <span className="text-xs font-bold font-sans">{preferredLanguage === "EN" ? "mins" : "মিনিট"}</span>
            </p>
          </div>
          <span className="text-[9px] text-slate-400 font-bold block uppercase">
            {preferredLanguage === "EN" ? "Across 30 days" : "৩০ দিনে সর্বমোট"}
          </span>
        </div>

      </div>

      {/* CHART CONTAINER WITH RESPONSIVE CONTAINER */}
      <div className="bg-slate-50/50 dark:bg-slate-950/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
        
        {/* CHART CONTROLS & HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-black font-display text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {activeChartTab === "7day" 
                ? (preferredLanguage === "EN" ? "7-DAY STUDY & PERFORMANCE TRENDS" : "৭ দিনের পড়াশোনা ও কুইজ অগ্রগতি ট্রেন্ড")
                : (preferredLanguage === "EN" ? "30-DAY DAILY FREQUENCY" : "৩০ দিনের দৈনিক পড়াশোনার ফ্রিকোয়েন্সি")}
            </span>
          </div>
          
          {/* TAB SWITCHER */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto shadow-inner">
            <button
              onClick={() => setActiveChartTab("7day")}
              className={`px-3 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                activeChartTab === "7day"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-800"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {preferredLanguage === "EN" ? "7-Day Trends" : "৭ দিনের ট্রেন্ড"}
            </button>
            <button
              onClick={() => setActiveChartTab("30day")}
              className={`px-3 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                activeChartTab === "30day"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-800"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {preferredLanguage === "EN" ? "30-Day Activity" : "৩০ দিনের বিবরণ"}
            </button>
          </div>
        </div>

        {/* CHART CONTENT */}
        <div className="w-full h-56 mt-2">
          {sessions.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center space-y-1.5 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <BookOpen className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-semibold text-slate-400">
                {preferredLanguage === "EN" ? "No study history yet. Click 'Log Study Session' to add one!" : "কোনো স্টাডি লগ নেই। উপরে সেশন যোগ করুন বাটনে ক্লিক করুন!"}
              </p>
            </div>
          ) : activeChartTab === "7day" ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 15, right: -15, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
                <XAxis 
                  dataKey="label" 
                  stroke={isDarkMode ? "#94a3b8" : "#64748b"} 
                  fontSize={8}
                  fontFamily="JetBrains Mono"
                  tickLine={false}
                />
                
                {/* Left Y-axis for Study Minutes */}
                <YAxis 
                  yAxisId="left"
                  stroke="#10b981" 
                  fontSize={8}
                  fontFamily="JetBrains Mono"
                  tickLine={false}
                  allowDecimals={false}
                  label={{ 
                    value: preferredLanguage === "EN" ? "Mins" : "মিনিট", 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { fontSize: 8, fontFamily: 'JetBrains Mono', fill: '#10b981', fontWeight: 'bold' } 
                  }}
                />
                
                {/* Right Y-axis for Quiz Accuracy % */}
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#6366f1" 
                  fontSize={8}
                  fontFamily="JetBrains Mono"
                  tickLine={false}
                  domain={[0, 100]}
                  allowDecimals={false}
                  label={{ 
                    value: preferredLanguage === "EN" ? "Accuracy %" : "কুইজ %", 
                    angle: 90, 
                    position: 'insideRight', 
                    style: { fontSize: 8, fontFamily: 'JetBrains Mono', fill: '#6366f1', fontWeight: 'bold' } 
                  }}
                />
                
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-lg border border-slate-950 font-sans text-[10px] space-y-1.5 shadow-md">
                          <p className="font-bold border-b border-white/10 pb-1 text-slate-300">{data.label}</p>
                          <p className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                            <span>{preferredLanguage === "EN" ? "Study Time" : "পড়াশোনার সময়"}: {data.duration} {preferredLanguage === "EN" ? "mins" : "মিনিট"}</span>
                          </p>
                          <p className="font-extrabold text-indigo-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
                            <span>
                              {preferredLanguage === "EN" ? "Quiz Accuracy" : "কুইজ নির্ভুলতা"}:{" "}
                              {data.hasQuiz 
                                ? `${data.accuracy}%` 
                                : (preferredLanguage === "EN" ? "No Quiz Taken" : "কোনো কুইজ নেওয়া হয়নি")}
                            </span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                
                <Legend 
                  wrapperStyle={{ fontSize: 9, fontFamily: 'JetBrains Mono', paddingTop: 10 }}
                />

                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="duration" 
                  name={preferredLanguage === "EN" ? "Study Minutes" : "পড়াশোনার সময় (মিনিট)"}
                  stroke="#10b981" 
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  dot={{ stroke: '#0f172a', strokeWidth: 1.5, r: 3 }}
                />
                
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="accuracy" 
                  name={preferredLanguage === "EN" ? "Quiz Accuracy (%)" : "কুইজ নির্ভুলতা (%)"}
                  stroke="#6366f1" 
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  dot={{ stroke: '#0f172a', strokeWidth: 1.5, r: 3 }}
                  connectNulls={true}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="sessionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
                <XAxis 
                  dataKey="label" 
                  stroke={isDarkMode ? "#94a3b8" : "#64748b"} 
                  fontSize={8}
                  fontFamily="JetBrains Mono"
                  tickLine={false}
                />
                <YAxis 
                  stroke={isDarkMode ? "#94a3b8" : "#64748b"} 
                  fontSize={8}
                  fontFamily="JetBrains Mono"
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-lg border border-slate-950 font-sans text-[10px] space-y-1 shadow-md">
                          <p className="font-bold border-b border-white/10 pb-1 text-slate-300">{data.label}</p>
                          <p className="font-extrabold text-emerald-400 flex items-center gap-1">
                            <span>●</span>
                            <span>{preferredLanguage === "EN" ? "Sessions" : "সেশন"}: {data.Sessions}</span>
                          </p>
                          <p className="font-bold text-slate-400 flex items-center gap-1">
                            <span>●</span>
                            <span>{preferredLanguage === "EN" ? "Study Time" : "সময়"}: {data.Minutes} {preferredLanguage === "EN" ? "mins" : "মিনিট"}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="Sessions" 
                  fill="url(#sessionGrad)" 
                  radius={[4, 4, 0, 0]}
                  stroke="#0f172a"
                  strokeWidth={1.5}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.Sessions > 0 ? "url(#sessionGrad)" : (isDarkMode ? "#1e293b" : "#f8fafc")} 
                      stroke={entry.Sessions > 0 ? "#0f172a" : "transparent"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* MODAL FOR MANUAL LOGGING PRESETS AND TEST */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" 
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`relative z-10 w-full max-w-md p-6 rounded-3xl border-2 border-slate-900 bubbly-card-shadow ${
                isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
              }`}
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowLogModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>

              <h4 className="font-display font-black text-base uppercase tracking-tight mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>{preferredLanguage === "EN" ? "LOG COMPLETED PRACTICE" : "নতুন প্র্যাকটিস রেকর্ড যোগ"}</span>
              </h4>

              <div className="space-y-4">
                
                {/* Practice type */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black font-display text-slate-400 uppercase tracking-widest block">
                    {preferredLanguage === "EN" ? "CHOOSE ACTIVITY TYPE" : "প্র্যাকটিসের ধরন"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: "vocabulary_lookup", label: "Word Lookup", bn: "শব্দ খোঁজা" },
                      { type: "pronunciation_practice", label: "Speaking Coach", bn: "ভয়েস কোচ" },
                      { type: "quiz", label: "Vocabulary Quiz", bn: "কুইজ সেশন" },
                      { type: "category_review", label: "Category Review", bn: "ক্যাটাগরি রিভিশন" }
                    ].map((item) => {
                      const isActive = customType === item.type;
                      return (
                        <button
                          key={item.type}
                          onClick={() => setCustomType(item.type as any)}
                          className={`p-2.5 rounded-xl border text-[10px] font-bold font-display text-center transition-all cursor-pointer ${
                            isActive 
                              ? "bg-slate-900 text-white border-slate-900 dark:bg-emerald-600 dark:border-emerald-600" 
                              : "bg-slate-50 hover:bg-slate-150 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800"
                          }`}
                        >
                          {preferredLanguage === "EN" ? item.label : item.bn}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black font-display text-slate-400 uppercase tracking-widest">
                      {preferredLanguage === "EN" ? "DURATION (MINUTES)" : "অনুশীলনের সময়কাল (মিনিট)"}
                    </label>
                    <span className="font-mono font-black text-sm text-emerald-600">{customMinutes} Mins</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="60"
                    step="1"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-600 bg-slate-100 dark:bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-slate-400">
                    <span>2M</span>
                    <span>30M</span>
                    <span>60M</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  onClick={() => {
                    logStudySession(customMinutes, customType);
                    setShowLogModal(false);
                  }}
                  className="w-full py-3 rounded-2xl border-2 border-slate-900 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{preferredLanguage === "EN" ? "Save Practice Session" : "সেশন সেভ করুন"}</span>
                </button>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
