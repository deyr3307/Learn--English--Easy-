import React, { useState, useEffect } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  Bell, 
  BellRing, 
  BellOff, 
  Clock, 
  Check, 
  Sparkles, 
  AlertTriangle, 
  Volume2, 
  Compass, 
  Send,
  MessageSquare,
  HelpCircle
} from "lucide-react";

interface DailyReminderPanelProps {
  preferredLanguage: "EN" | "BN";
  savedWords: string[];
  isDarkMode: boolean;
  onShowInAppNotification: (title: string, body: string) => void;
  dailyGoal: number;
  onDailyGoalChange: (newGoal: number) => void;
}

export default function DailyReminderPanel({
  preferredLanguage,
  savedWords,
  isDarkMode,
  onShowInAppNotification,
  dailyGoal,
  onDailyGoalChange
}: DailyReminderPanelProps) {
  // Core states for notification scheduling
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [reminderTime, setReminderTime] = useState<string>("09:00");
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number>(0);
  const [testCountdown, setTestCountdown] = useState<number | null>(null);

  // Sound cue state
  const [playSound, setPlaySound] = useState<boolean>(true);

  // List of professional pre-coded motivational study reminder messages
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

  // Quick time presets for instant study scheduling
  const presets = [
    { label: "Morning (8:00 AM)", value: "08:00", labelBN: "সকাল (৮:০০ টা)" },
    { label: "Lunch Break (12:30 PM)", value: "12:30", labelBN: "দুপুর (১২:৩০ টা)" },
    { label: "Evening (6:00 PM)", value: "18:00", labelBN: "সন্ধ্যা (৬:০০ টা)" },
    { label: "Night Study (9:00 PM)", value: "21:00", labelBN: "রাত (৯:০০ টা)" }
  ];

  // Initialize reminder parameters from localStorage
  useEffect(() => {
    // Check support
    const supported = "Notification" in window;
    setIsSupported(supported);

    if (supported) {
      setPermissionStatus(Notification.permission);
    }

    const savedEnabled = localStorage.getItem("vocab_reminder_enabled");
    const savedTime = localStorage.getItem("vocab_reminder_time");
    const savedMsgIdx = localStorage.getItem("vocab_reminder_msg_index");
    const savedSound = localStorage.getItem("vocab_reminder_sound");

    if (savedEnabled !== null) {
      setIsEnabled(savedEnabled === "true");
    }
    if (savedTime) {
      setReminderTime(savedTime);
    }
    if (savedMsgIdx) {
      setSelectedMessageIndex(parseInt(savedMsgIdx, 10));
    }
    if (savedSound !== null) {
      setPlaySound(savedSound === "true");
    }
  }, []);

  // Request browser permission for system notifications
  const requestNotificationPermission = async () => {
    if (!isSupported) return;

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === "granted") {
        // Trigger a tiny introductory greeting notification
        new Notification("🔔 Reminders Activated!", {
          body: preferredLanguage === "EN" 
            ? "Awesome! We will remind you daily at your scheduled study time."
            : "চমৎকার! আপনার নির্ধারিত সময়ে আমরা প্রতিদিন আপনাকে পড়াশোনার নোটিফিকেশন পাঠাবো।",
          icon: "/favicon.ico"
        });
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  // Update schedule status and persist configurations
  const handleToggleReminder = (checked: boolean) => {
    setIsEnabled(checked);
    localStorage.setItem("vocab_reminder_enabled", checked ? "true" : "false");
    
    if (checked && permissionStatus === "default") {
      requestNotificationPermission();
    }
  };

  const handleTimeChange = (time: string) => {
    setReminderTime(time);
    localStorage.setItem("vocab_reminder_time", time);
  };

  const handlePresetSelect = (time: string) => {
    setReminderTime(time);
    localStorage.setItem("vocab_reminder_time", time);
  };

  const handleMessageSelect = (index: number) => {
    setSelectedMessageIndex(index);
    localStorage.setItem("vocab_reminder_msg_index", index.toString());
  };

  const handleSoundToggle = () => {
    const newVal = !playSound;
    setPlaySound(newVal);
    localStorage.setItem("vocab_reminder_sound", newVal ? "true" : "false");
  };

  // Play a beautiful modern soft chime to confirm notification audio functionality
  const triggerAudioChime = () => {
    if (!playSound) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Simple chime: Two high notes
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
      
      const now = audioCtx.currentTime;
      playNote(880, now, 0.4); // A5
      playNote(1318.51, now + 0.12, 0.6); // E6
    } catch (e) {
      console.warn("Audio Context not allowed or failed", e);
    }
  };

  // Trigger a trial notification instantly to verify the flow
  const handleTriggerTestNotification = () => {
    // Request permission if not already handled
    if (isSupported && permissionStatus === "default") {
      requestNotificationPermission();
      return;
    }

    // Set a 3 second countdown animation for an organic preview feel
    setTestCountdown(3);
    
    const interval = setInterval(() => {
      setTestCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          
          // Trigger the final notification!
          const targetMsg = reminderMessages[selectedMessageIndex];
          const actualBody = preferredLanguage === "EN" ? targetMsg.body : targetMsg.bodyBN;
          
          // 1. Play audio chime if enabled
          if (playSound) {
            triggerAudioChime();
          }

          // 2. Launch Browser System notification if supported and granted
          if (isSupported && permissionStatus === "granted") {
            try {
              new Notification(targetMsg.title, {
                body: actualBody,
                icon: "/favicon.ico",
                tag: "vocab-study-reminder"
              });
            } catch (err) {
              console.warn("Failed to trigger native Notification in standard container, showing fallback:", err);
            }
          }

          // 3. Trigger app-level custom layout toast so they always see the outcome perfectly!
          onShowInAppNotification(targetMsg.title, actualBody);

          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div id="vocab-reminder-panel" className={`rounded-3xl border-2 border-slate-900 p-6 space-y-6 transition-all ${
      isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
    } bubbly-card-shadow`}>
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl border-2 border-slate-900 flex items-center justify-center shrink-0 transition-colors ${
            isEnabled ? "bg-emerald-100 dark:bg-emerald-950/40" : "bg-slate-100 dark:bg-slate-800"
          }`}>
            {isEnabled ? (
              <BellRing className="w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-swing" />
            ) : (
              <BellOff className="w-6 h-6 text-slate-500" />
            )}
          </div>
          <div>
            <h3 className="font-display font-black text-base uppercase tracking-tight">
              {preferredLanguage === "EN" ? "DAILY STUDY REMINDERS" : "দৈনিক অধ্যয়নের তাগিদ"}
            </h3>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
              {preferredLanguage === "EN" 
                ? "Schedule daily notification triggers to review your vocabulary vault" 
                : "আপনার সংরক্ষিত শব্দগুলো রিভিশন করার জন্য নোটিফিকেশন সিডিউল করুন"}
            </p>
          </div>
        </div>

        {/* REMINDER ENABLE SLIDER TOGGLE */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <span className="text-xs font-black font-display tracking-wide uppercase text-slate-500">
            {isEnabled 
              ? (preferredLanguage === "EN" ? "Reminders: Active" : "রিমাইন্ডার: চালু") 
              : (preferredLanguage === "EN" ? "Reminders: Inactive" : "রিমাইন্ডার: বন্ধ")}
          </span>
          <button
            onClick={() => handleToggleReminder(!isEnabled)}
            className={`w-14 h-8 rounded-full p-1 border-2 border-slate-900 transition-colors focus:outline-hidden ${
              isEnabled ? "bg-[#10b981]" : "bg-slate-200 dark:bg-slate-800"
            }`}
            aria-label="Toggle Daily Reminders"
          >
            <div className={`bg-white w-5 h-5 rounded-full border border-slate-900 transition-transform ${
              isEnabled ? "translate-x-6" : "translate-x-0"
            }`} />
          </button>
        </div>
      </div>

      {/* SYSTEM PERMISSION BADGE STATUS */}
      <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="space-y-0.5">
          <span className="text-[9px] font-black font-display text-slate-400 uppercase tracking-widest block">
            BROWSER PERMISSION STATUS
          </span>
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {!isSupported ? (
              <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-extrabold font-display">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>NOT FULLY SUPPORTED (USING IN-APP FLOATING ALERTS)</span>
              </span>
            ) : permissionStatus === "granted" ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold font-display">
                <Check className="w-4 h-4 bg-emerald-100 rounded-full p-0.5" />
                <span>SYSTEM NOTIFICATIONS: ALLOWED</span>
              </span>
            ) : permissionStatus === "denied" ? (
              <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs font-extrabold font-display">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>BLOCKED BY BROWSER (TAP ADRESS BAR TO RESET)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold font-display">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>PERMISSION REQUIRED FOR DESKTOP ALERTS</span>
              </span>
            )}
          </div>
        </div>

        {isSupported && permissionStatus !== "granted" && (
          <button
            onClick={requestNotificationPermission}
            className="px-4 py-2 bg-slate-900 dark:bg-emerald-600 text-white border-2 border-slate-900 rounded-xl font-display text-[10px] font-extrabold uppercase tracking-wide cursor-pointer hover:bg-slate-800 transition-colors"
          >
            {preferredLanguage === "EN" ? "Request Permission" : "অনুমতি দিন"}
          </button>
        )}
      </div>

      {/* DAILY LEARNING GOAL SETTING (ALWAYS ACTIVE) */}
      <div className="p-5 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border-2 border-slate-900 space-y-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 border-2 border-slate-900 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h4 className="font-display font-black text-xs uppercase tracking-tight">
                {preferredLanguage === "EN" ? "DAILY LEARNING GOAL" : "দৈনিক শব্দ শেখার লক্ষ্য"}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                {preferredLanguage === "EN" 
                  ? "Define how many vocabulary lookups or pronunciations you target daily" 
                  : "প্রতিদিন কতগুলো নতুন শব্দ পড়া বা উচ্চারণ অনুশীলন করতে চান তা সিলেক্ট করুন"}
              </p>
            </div>
          </div>

          {/* Interactive Custom Counter Input */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => onDailyGoalChange(Math.max(1, dailyGoal - 1))}
              className="w-8 h-8 rounded-lg border-2 border-slate-900 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 font-black flex items-center justify-center text-sm cursor-pointer select-none"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max="100"
              value={dailyGoal}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val > 0) {
                  onDailyGoalChange(val);
                }
              }}
              className="w-12 text-center font-mono font-black text-sm bg-white dark:bg-slate-900 border-2 border-slate-900 py-1 rounded-lg focus:outline-hidden text-slate-900 dark:text-white"
            />
            <button
              onClick={() => onDailyGoalChange(Math.min(100, dailyGoal + 1))}
              className="w-8 h-8 rounded-lg border-2 border-slate-900 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 font-black flex items-center justify-center text-sm cursor-pointer select-none"
            >
              +
            </button>
          </div>
        </div>

        {/* Goal Preset Options */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { label: "Casual (3)", labelBN: "সাধারণ (৩)", value: 3 },
            { label: "Regular (5)", labelBN: "নিয়মিত (৫)", value: 5 },
            { label: "Serious (10)", labelBN: "গুরুত্বপূর্ণ (১০)", value: 10 },
            { label: "Intensive (15)", labelBN: "নিবিড় (১৫)", value: 15 }
          ].map((preset) => {
            const isSelected = dailyGoal === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => onDailyGoalChange(preset.value)}
                className={`px-3 py-2 rounded-xl text-[10px] font-bold font-display border transition-all text-center uppercase tracking-wide cursor-pointer ${
                  isSelected
                    ? "bg-emerald-500 text-white border-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]"
                    : "bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                }`}
              >
                {preferredLanguage === "EN" ? preset.label : preset.labelBN}
              </button>
            );
          })}
        </div>
      </div>

      {/* SCHEDULER CONTROLS ROW */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${isEnabled ? "opacity-100" : "opacity-45 pointer-events-none transition-opacity"}`}>
        
        {/* TIME PICKER AND PRESETS (COLUMN 1) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black font-display text-slate-400 uppercase tracking-widest block">
              {preferredLanguage === "EN" ? "CHOOSE REMINDER TIME" : "নোটিফিকেশনের সময় সিলেক্ট করুন"}
            </label>
            <div className="flex items-center gap-3">
              <div className="relative w-full">
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full text-center px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-900 rounded-2xl font-mono font-black text-lg tracking-wider focus:outline-hidden text-slate-900 dark:text-white"
                />
              </div>

              {/* Toggle Audio Sound chime switch */}
              <button
                onClick={handleSoundToggle}
                className={`p-3 rounded-2xl border-2 border-slate-900 transition-all cursor-pointer ${
                  playSound 
                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200" 
                    : "bg-slate-100 text-slate-400"
                }`}
                title={preferredLanguage === "EN" ? "Toggle Alert Sound" : "নোটিফিকেশন শব্দ পরিবর্তন"}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick presets list */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black font-display text-slate-400 uppercase tracking-widest block">
              QUICK STUDY PRESETS
            </span>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => {
                const isActive = reminderTime === preset.value;
                return (
                  <button
                    key={preset.value}
                    onClick={() => handlePresetSelect(preset.value)}
                    className={`px-2.5 py-2 rounded-xl text-[10px] font-bold font-display border transition-all text-center uppercase tracking-wide cursor-pointer ${
                      isActive
                        ? "bg-slate-900 text-white border-slate-900 dark:bg-emerald-600 dark:border-emerald-600"
                        : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <span>{preferredLanguage === "EN" ? preset.label : preset.labelBN}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* MOTIVATIONAL MESSAGE CHANGER (COLUMN 2) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black font-display text-slate-400 uppercase tracking-widest block flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{preferredLanguage === "EN" ? "CHOOSE MOTIVATIONAL NOTIFICATION STYLE" : "মেসেজের ধরন বাছাই করুন"}</span>
            </label>
            
            <div className="space-y-2 max-h-[194px] overflow-y-auto pr-1 border border-slate-100 dark:border-slate-800 rounded-2xl p-2 bg-slate-50/40 dark:bg-slate-950/20">
              {reminderMessages.map((msg, index) => {
                const isSelected = selectedMessageIndex === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleMessageSelect(index)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? "bg-white text-slate-900 border-slate-900 dark:bg-slate-800 dark:text-white bubbly-card-shadow-sm"
                        : "bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? "border-[#10b981] bg-[#10b981] text-white" : "border-slate-300"
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-black uppercase tracking-tight">
                        {msg.title}
                      </p>
                      <p className="text-[10px] font-medium leading-tight">
                        {preferredLanguage === "EN" ? msg.body : msg.bodyBN}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* LIVE INTERACTIVE VERIFICATION ZONE */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-2 max-w-lg">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide leading-relaxed">
            {preferredLanguage === "EN" 
              ? "Tip: Keep this tab open in your browser background. Our high-precision client-side alarm triggers reminders instantly even if you're browsing other tabs!" 
              : "টিপস: ব্রাউজারের ব্যাকগ্রাউন্ডে এই ট্যাবটি খোলা রাখুন। অন্য ট্যাবে স্ক্রোল করলেও আমাদের নিখুঁত ক্লায়েন্ট-সাইড অ্যালার্ম ইঞ্জিন ঠিক সময়ে নোটিফিকেশন পৌঁছে দেবে!"}
          </p>
        </div>

        <button
          onClick={handleTriggerTestNotification}
          disabled={testCountdown !== null}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl border-2 border-slate-900 bg-amber-400 hover:bg-amber-500 text-slate-950 font-display font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 shadow-sm shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>
            {testCountdown !== null 
              ? (preferredLanguage === "EN" ? `Triggering in ${testCountdown}s...` : `নোটিফিকেশন আসছে ${testCountdown} সেকেন্ডে...`)
              : (preferredLanguage === "EN" ? "Test Daily Alert Now" : "তাত্ক্ষণিক নোটিফিকেশন টেস্ট")}
          </span>
        </button>
      </div>

    </div>
  );
}
