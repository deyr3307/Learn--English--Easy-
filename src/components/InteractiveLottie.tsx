import React, { useState, useEffect, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Volume2, 
  Mic, 
  Check, 
  Award,
  Smile, 
  Frown, 
  Zap, 
  Brain,
  Flame,
  BookOpen
} from "lucide-react";

// Lazy-load the Lottie component to optimize bundle size and start-up performance
const Lottie = lazy(() => import("lottie-react"));

/**
 * ----------------------------------------------------------------------
 * 1. LOTTIE FILE CONFIGURATION & CONTEXT MAPPING
 * ----------------------------------------------------------------------
 * Explain to the user how to structure their public directory:
 * Put the following JSON assets in your public folder:
 * - public/lottie/mood_positive.json (Joy, success, accomplishments)
 * - public/lottie/mood_negative.json (Tired, heavy, sadness, struggling)
 * - public/lottie/mood_action.json   (Active verb, physical action, energy)
 * - public/lottie/mood_state.json    (Intellectual, thinking, state of mind, nouns)
 * - public/lottie/ui_audio_wave.json (Rippling soundwave for speaker)
 * - public/lottie/ui_mic_pulse.json  (Pulsing concentric voice recorder waves)
 * - public/lottie/ui_celebration.json (Confetti explosion or glowing mark)
 */
export const LOTTIE_ASSET_PATHS = {
  positive: "/lottie/mood_positive.json",
  negative: "/lottie/mood_negative.json",
  action: "/lottie/mood_action.json",
  state: "/lottie/mood_state.json",
  audioWave: "/lottie/ui_audio_wave.json",
  micPulse: "/lottie/ui_mic_pulse.json",
  celebration: "/lottie/ui_celebration.json",
};

/**
 * Maps any vocabulary word's metadata (word, part of speech, meaning, definition)
 * to a semantic emotion/context category.
 */
export function determineWordContext(
  word: string,
  partOfSpeech: string = "",
  definition: string = ""
): "positive" | "negative" | "action" | "state" {
  const w = word.toLowerCase();
  const def = definition.toLowerCase();
  const pos = partOfSpeech.toLowerCase();

  // Positive / Joy / Success triggers
  const positiveWords = [
    "accomplish", "resilience", "happy", "joy", "success", "achieve", 
    "excel", "triumph", "smile", "great", "excellent", "beautiful", 
    "harmony", "inspire", "wealth", "smart", "love", "friend"
  ];
  if (positiveWords.some(x => w.includes(x) || def.includes(x))) {
    return "positive";
  }

  // Negative / Tired / Heavy triggers
  const negativeWords = [
    "tired", "exhausted", "sleepy", "sad", "unfortunate", "struggle", 
    "difficult", "bad", "ambiguous", "dark", "pain", "grief", "fail", 
    "hazard", "risk", "fear", "anxious", "depressed", "heavy", "gloom"
  ];
  if (negativeWords.some(x => w.includes(x) || def.includes(x))) {
    return "negative";
  }

  // Action / Verb triggers
  if (pos.includes("verb") || pos.includes("action") || w.endsWith("ing")) {
    return "action";
  }

  // Default to state of mind / intellectual learning
  return "state";
}

/**
 * Maps specific API emotiveContext descriptions directly to local Lottie paths,
 * with a reliable fallback path.
 */
export function getLottiePathFromContext(emotiveContext: string): string {
  const ctx = (emotiveContext || "").toLowerCase();
  if (ctx.includes("thinking") || ctx.includes("exploration") || ctx.includes("state")) {
    return "/lottie/thinking.json";
  }
  if (ctx.includes("tired") || ctx.includes("negative") || ctx.includes("exhausted") || ctx.includes("sad")) {
    return "/lottie/tired.json";
  }
  if (ctx.includes("happy") || ctx.includes("positive") || ctx.includes("joy") || ctx.includes("accomplish")) {
    return "/lottie/happy.json";
  }
  return "/lottie/default_mood.json";
}

/**
 * Robust fetch helper to load a local JSON animation.
 * If the file is missing or offline, it yields null to trigger the high-fidelity CSS fallback.
 */
function useLottieData(path: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    fetch(path)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Asset not found: ${path}`);
        }
        return res.json();
      })
      .then((json) => {
        if (active) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.warn(`[Lottie Loader] Note: Lottie file '${path}' is not yet in public folder. Using high-fidelity animated CSS fallback.`);
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [path]);

  return { data, loading, error };
}

/**
 * ----------------------------------------------------------------------
 * 2. CONTEXT-AWARE DYNAMIC COMPANION ANIMATION PLAYER
 * ----------------------------------------------------------------------
 * Displays a beautiful character/theme representing the word's emotion.
 * Fully responsive, optimized for both light and dark modes.
 */
interface ContextLottiePlayerProps {
  word: string;
  partOfSpeech?: string;
  definition?: string;
  isDarkMode: boolean;
  emotiveContext?: string; // From API or parent component
}

export function ContextLottiePlayer({
  word,
  partOfSpeech = "",
  definition = "",
  isDarkMode,
  emotiveContext,
}: ContextLottiePlayerProps) {
  // If emotiveContext is provided explicitly, map to custom paths, otherwise infer from definition
  const context = determineWordContext(word, partOfSpeech, definition);
  const assetPath = emotiveContext 
    ? getLottiePathFromContext(emotiveContext)
    : LOTTIE_ASSET_PATHS[context];

  const { data, loading, error } = useLottieData(assetPath);

  // High-fidelity fallback styling configurations
  const fallbackStyles = {
    positive: {
      bg: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/60",
      text: "text-emerald-600 dark:text-emerald-400",
      label: "Accomplishment & Joy",
      icon: <Smile className="w-12 h-12" />,
      bounceClass: "animate-bounce",
    },
    negative: {
      bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60",
      text: "text-amber-600 dark:text-amber-400",
      label: "Tiredness / Challenge",
      icon: <Frown className="w-12 h-12 animate-pulse" />,
      bounceClass: "animate-pulse",
    },
    action: {
      bg: "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-900/60",
      text: "text-indigo-600 dark:text-indigo-400",
      label: "Active Motion & Practice",
      icon: <Zap className="w-12 h-12" />,
      bounceClass: "animate-pulse",
    },
    state: {
      bg: "bg-purple-50 dark:bg-purple-950/20 border-purple-300 dark:border-purple-900/60",
      text: "text-purple-600 dark:text-purple-400",
      label: "Thinking & Exploration",
      icon: <Brain className="w-12 h-12" />,
      bounceClass: "animate-pulse",
    },
  }[emotiveContext ? (emotiveContext.toLowerCase().includes("thinking") ? "state" : emotiveContext.toLowerCase().includes("tired") ? "negative" : emotiveContext.toLowerCase().includes("happy") ? "positive" : "state") : context];

  return (
    <div className={`rounded-3xl border-2 border-slate-900 p-5 text-center flex flex-col items-center justify-center min-h-[220px] transition-all relative overflow-hidden bubbly-card-shadow ${
      isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
    }`}>
      {/* Absolute Decorative Background Accent */}
      <div className={`absolute -right-10 -bottom-10 w-28 h-28 rounded-full blur-2xl opacity-10 ${
        context === "positive" ? "bg-emerald-500" : context === "negative" ? "bg-amber-500" : "bg-indigo-500"
      }`} />

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center space-y-2.5"
          >
            <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-emerald-500 animate-spin" />
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              Linguistic Magic Loaded...
            </p>
          </motion.div>
        ) : error || !data ? (
          /* High-Fidelity UI/UX Fallback Card if JSON file doesn't exist yet */
          <motion.div
            key="fallback"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center space-y-3"
          >
            <div className={`p-4 rounded-full border-2 border-slate-900 flex items-center justify-center ${fallbackStyles.bg} ${fallbackStyles.text} ${fallbackStyles.bounceClass}`}>
              {fallbackStyles.icon}
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black font-display text-slate-400 uppercase tracking-widest block">
                WORD EMOTIVE CONTEXT
              </span>
              <h4 className="text-sm font-black uppercase font-display tracking-tight text-slate-900 dark:text-white">
                {word} ({fallbackStyles.label})
              </h4>
              <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto">
                Contextual companion animation is active. Put a Lottie JSON in <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[9px]">{assetPath}</code> to instantly unlock cinematic vector animation!
              </p>
            </div>
          </motion.div>
        ) : (
          /* Live Lottie Character Animation Player */
          <motion.div
            key="lottie"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-40 h-40 flex items-center justify-center"
          >
            <Suspense fallback={<div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />}>
              <Lottie
                animationData={data}
                loop={true}
                autoplay={true}
                style={{ width: "100%", height: "100%" }}
              />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * ----------------------------------------------------------------------
 * 3. INTERACTIVE AUDIO WAVE LOTTIE COMPONENT
 * ----------------------------------------------------------------------
 * Animates a dynamic visual equalizer/soundwave when audio is active.
 */
interface LottieAudioWaveProps {
  isPlaying: boolean;
  onToggle: () => void;
  isDarkMode: boolean;
  label?: string;
}

export function LottieAudioWave({
  isPlaying,
  onToggle,
  isDarkMode,
  label = "LISTEN PRONUNCIATION",
}: LottieAudioWaveProps) {
  const { data, error } = useLottieData(LOTTIE_ASSET_PATHS.audioWave);

  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={`relative px-5 py-3 rounded-2xl text-xs font-bold font-display border-2 border-slate-900 bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center justify-center gap-2 shadow-sm overflow-hidden min-w-[190px] cursor-pointer`}
    >
      {/* Subtle shine effect */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />

      {isPlaying && !error && data ? (
        <div className="w-5 h-5 flex items-center justify-center">
          <Suspense fallback={<Volume2 className="w-4.5 h-4.5 animate-pulse" />}>
            <Lottie
              animationData={data}
              loop={true}
              autoplay={true}
              style={{ width: "100%", height: "100%" }}
            />
          </Suspense>
        </div>
      ) : isPlaying ? (
        /* High-fidelity CSS wave ripples fallback */
        <div className="flex items-end justify-center gap-0.5 h-4 w-5">
          {[...Array(4)].map((_, i) => (
            <motion.span
              key={i}
              className="w-1 bg-white rounded-full"
              animate={{ height: [4, 16, 4] }}
              transition={{
                repeat: Infinity,
                duration: 0.6,
                delay: i * 0.15,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      ) : (
        <Volume2 className="w-4.5 h-4.5" />
      )}

      <span className="uppercase tracking-tight font-black">{label}</span>
    </motion.button>
  );
}

/**
 * ----------------------------------------------------------------------
 * 4. DYNAMIC MICROPHONE PULSER LOTTIE COMPONENT
 * ----------------------------------------------------------------------
 * Converted from a static icon to a pulsating voice coach mic helper.
 */
interface LottieMicPulseProps {
  isRecording: boolean;
  onClick: () => void;
  label?: string;
  isDarkMode: boolean;
}

export function LottieMicPulse({
  isRecording,
  onClick,
  label = "SPEAK NOW",
  isDarkMode,
}: LottieMicPulseProps) {
  const { data, error } = useLottieData(LOTTIE_ASSET_PATHS.micPulse);

  return (
    <motion.button
      onClick={onClick}
      disabled={isRecording}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={`px-5 py-3 rounded-2xl text-xs font-bold font-display border-2 border-slate-900 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-950 dark:text-white disabled:opacity-50 transition-all cursor-pointer shadow-sm relative overflow-hidden`}
    >
      {isRecording && !error && data ? (
        <div className="w-5 h-5 flex items-center justify-center shrink-0">
          <Suspense fallback={<Mic className="w-4.5 h-4.5 text-emerald-500 animate-pulse" />}>
            <Lottie
              animationData={data}
              loop={true}
              autoplay={true}
              style={{ width: "100%", height: "100%" }}
            />
          </Suspense>
        </div>
      ) : isRecording ? (
        /* Dynamic SVG pulse circle when speaking fallback */
        <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <Mic className="relative w-4 h-4 text-emerald-500" />
        </div>
      ) : (
        <Mic className="w-4.5 h-4.5 text-emerald-500" />
      )}

      <span className="uppercase tracking-tight font-black">
        {isRecording ? "ANALYZING SPEECH..." : label}
      </span>
    </motion.button>
  );
}

/**
 * ----------------------------------------------------------------------
 * 5. CELEBRATORY SUCCESS & SRS REVIEW LOTTIE TRACKER
 * ----------------------------------------------------------------------
 * Confetti pop trigger or a shiny checkmark when saving an SRS state.
 */
interface LottieSuccessCelebrationProps {
  trigger: boolean;
  onComplete?: () => void;
  isDarkMode: boolean;
}

export function LottieSuccessCelebration({
  trigger,
  onComplete,
  isDarkMode,
}: LottieSuccessCelebrationProps) {
  const { data, error } = useLottieData(LOTTIE_ASSET_PATHS.celebration);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        if (onComplete) onComplete();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
        >
          {/* Ambient overlay bloom */}
          <div className="absolute inset-0 bg-black/10 dark:bg-black/30 backdrop-blur-[1px]" />

          <div className="relative bg-white dark:bg-slate-900 border-3 border-slate-900 rounded-3xl p-6 flex flex-col items-center text-center space-y-3 shadow-2xl max-w-xs mx-auto animate-bounce pointer-events-auto">
            {!error && data ? (
              <div className="w-24 h-24 flex items-center justify-center">
                <Suspense fallback={<Award className="w-12 h-12 text-amber-500 animate-spin" />}>
                  <Lottie
                    animationData={data}
                    loop={false}
                    autoplay={true}
                    style={{ width: "100%", height: "100%" }}
                  />
                </Suspense>
              </div>
            ) : (
              /* Beautiful design fallback celebration with SVG bursts */
              <div className="relative w-20 h-20 bg-emerald-100 dark:bg-emerald-950/40 rounded-full border-2 border-slate-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <Check className="w-10 h-10 stroke-[3]" />
                </motion.div>
                {/* Floating particle stars */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full"
                    animate={{
                      y: [0, Math.sin(i) * 35],
                      x: [0, Math.cos(i) * 35],
                      opacity: [1, 0]
                    }}
                    transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                  />
                ))}
              </div>
            )}

            <div className="space-y-1">
              <h4 className="font-display font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">
                SRS Milestone Recalled!
              </h4>
              <p className="text-[10px] leading-relaxed text-slate-500 font-bold uppercase tracking-wider">
                Memory Intervals Updated Automatically
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * ----------------------------------------------------------------------
 * 6. PREMIUM CONTEXTUAL FEATURE ANIMATED LOTTIE ICONS
 * ----------------------------------------------------------------------
 * Provides premium, custom-themed interactive visual elements for the
 * app's features with beautiful, seamless animated fallbacks.
 */
export const FEATURE_LOTTIE_PATHS = {
  bengaliMeanings: "/lottie/feature_bengali_meanings.json",
  voicePronunciation: "/lottie/feature_voice_pronunciation.json",
  speakingTips: "/lottie/feature_speaking_tips.json",
  saveVocabulary: "/lottie/feature_save_vocabulary.json",
  realExamples: "/lottie/feature_real_examples.json",
  languageTranslator: "/lottie/feature_language_translator.json",
  vocabularyQuiz: "/lottie/feature_vocabulary_quiz.json",
  dailyTrending: "/lottie/feature_daily_trending.json",
};

export type FeatureTheme = keyof typeof FEATURE_LOTTIE_PATHS;

interface LottieFeatureIconProps {
  theme: FeatureTheme;
  isDarkMode?: boolean;
}

export function LottieFeatureIcon({ theme, isDarkMode = false }: LottieFeatureIconProps) {
  const path = FEATURE_LOTTIE_PATHS[theme];
  const { data, loading, error } = useLottieData(path);

  const renderFallback = () => {
    switch (theme) {
      case "bengaliMeanings":
        return (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-950/40 dark:to-violet-950/40" style={{ perspective: "600px" }}>
            <motion.div
              className="relative w-[34px] h-[34px]"
              style={{ transformStyle: "preserve-3d" }}
              animate={{ rotateY: [0, 180, 180, 360, 360] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              {/* Front Side: "A" */}
              <div 
                className="absolute inset-0 bg-white dark:bg-slate-900 border-2 border-slate-950 rounded-lg shadow-[1.5px_1.5px_0_0_rgba(15,23,42,1)] flex items-center justify-center font-display font-black text-emerald-600 dark:text-emerald-400 select-none text-base"
                style={{ backfaceVisibility: "hidden" }}
              >
                A
              </div>
              {/* Back Side: "অ" */}
              <div 
                className="absolute inset-0 bg-white dark:bg-slate-900 border-2 border-slate-950 rounded-lg shadow-[1.5px_1.5px_0_0_rgba(15,23,42,1)] flex items-center justify-center font-display font-black text-indigo-600 dark:text-indigo-400 select-none text-base"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                অ
              </div>
            </motion.div>
          </div>
        );

      case "voicePronunciation":
        return (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40">
            {/* Premium Multi-Bar Voice Waveform Equalizer */}
            <div className="flex items-end justify-center gap-[3px] h-[22px]">
              {[1.2, 0.8, 1.5, 0.9, 1.3].map((duration, index) => (
                <motion.div
                  key={index}
                  className="w-[3px] rounded-full bg-gradient-to-t from-orange-600 to-amber-500 dark:from-orange-500 dark:to-amber-400"
                  animate={{ 
                    height: ["4px", "20px", "4px"] 
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: duration, 
                    ease: "easeInOut",
                    delay: index * 0.15
                  }}
                />
              ))}
            </div>
            {/* Subtle speaker decoration */}
            <div className="absolute bottom-1 right-1 opacity-25">
              <Volume2 className="w-3 h-3 text-slate-950 dark:text-white" />
            </div>
          </div>
        );

      case "speakingTips":
        return (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 to-blue-100 dark:from-slate-900 dark:to-slate-950">
            {/* Animated speech ripple circles in the background */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[0, 1].map((index) => (
                <motion.div
                  key={index}
                  className="absolute w-12 h-12 rounded-full border-2 border-sky-400/20 dark:border-sky-500/15"
                  animate={{
                    scale: [0.8, 1.8],
                    opacity: [0.6, 0]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.2,
                    delay: index * 1.1,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>

            <div className="relative flex items-center justify-center gap-1">
              {/* Silhouette side profile head speaking (solid, highly polished 🗣️ style) */}
              <motion.div
                animate={{ 
                  scale: [0.95, 1.05, 0.95],
                  y: [0, -1, 0]
                }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                className="relative z-10 text-sky-600 dark:text-sky-400 shrink-0"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-[28px] h-[28px] filter drop-shadow-[1.5px_1.5px_0px_rgba(15,23,42,0.15)]"
                >
                  {/* Beautiful high-end right-facing head silhouette with parted lips */}
                  <path d="M4 20c0-2 1.5-3.5 3-4 .2-.5.5-1.2.5-2 0-3.5 2.5-6 5.5-6s4.5 1.5 4.8 3.2c.6.2 1 .7 1 1.3 0 .4-.2.8-.5 1 .3.3.4.7.3 1.1-.1.4-.5.7-1 .8-.2.8-.8 1.6-1.6 2.1-.5.8-1.5 1.5-3 1.5-1 0-1.5 0-2 .5s-.5 1-1 1H4z" />
                </svg>
              </motion.div>

              {/* High-fidelity 3-bar Sound Wave arcs exactly like the speaking head emoji */}
              <div className="relative flex items-center w-5 h-6 shrink-0">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute left-[1px] border-r-[2.5px] border-t-[2.5px] border-b-[2.5px] border-sky-600 dark:border-sky-400 rounded-r-full"
                    style={{
                      width: 5 + i * 5,
                      height: 8 + i * 6,
                      transformOrigin: "left center",
                    }}
                    animate={{
                      scale: [0.8, 1.3, 0.8],
                      opacity: [0.2, 1, 0.2],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                      delay: i * 0.18,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case "saveVocabulary":
        return (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-950/40 dark:to-rose-950/40">
            {/* Premium Facebook-Style Saved ribbon flag */}
            <motion.div 
              className="relative w-[18px] h-[28px] bg-gradient-to-b from-pink-500 to-rose-500 border-2 border-slate-950 shadow-[1.5px_1.5px_0_0_rgba(15,23,42,1)]"
              style={{
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 50% 78%, 0% 100%)"
              }}
              animate={{ 
                y: [0, -3, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2, 
                ease: "easeInOut" 
              }}
            >
              {/* Star symbol inside */}
              <div className="absolute top-[3px] left-0 right-0 flex justify-center">
                <span className="text-[9px] text-white font-black select-none">★</span>
              </div>
            </motion.div>
          </div>
        );

      case "realExamples":
        return (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-100 to-sky-100 dark:from-blue-950/40 dark:to-sky-950/40">
            {/* Open notebook paper sheet */}
            <motion.div
              className="relative w-[34px] h-[28px] bg-white dark:bg-slate-900 border-2 border-slate-955 rounded shadow-[1.5px_1.5px_0_0_rgba(15,23,42,1)] p-1 flex flex-col justify-between"
              animate={{ rotate: [-1.5, 1.5, -1.5] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
            >
              {/* Spiral binder rings at left edge */}
              <div className="absolute left-[3px] top-[4px] bottom-[4px] flex flex-col justify-between h-[16px] w-[3px]">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-[3px] h-[2px] bg-slate-950 dark:bg-slate-400 rounded-full" />
                ))}
              </div>

              {/* Text structure */}
              <div className="space-y-[3px] pl-2">
                <div className="h-[2px] w-full bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="relative h-[6px] w-[90%] bg-yellow-100 dark:bg-yellow-950/30 rounded overflow-hidden">
                  {/* Highlighter swipe animation */}
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-yellow-400 dark:bg-yellow-500 rounded"
                    animate={{ width: ["0%", "100%", "100%", "0%"] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", repeatDelay: 0.6 }}
                  />
                  <div className="absolute top-[2px] left-[2px] h-[1px] w-4 bg-slate-400 rounded" />
                </div>
                <div className="h-[2px] w-[70%] bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
              
              {/* Mini quotation bubble in bottom right */}
              <span className="absolute bottom-[-3px] right-1 text-[10px] font-black font-display text-blue-500 select-none">“</span>
            </motion.div>
          </div>
        );

      case "languageTranslator":
        return (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-950/40 dark:to-indigo-950/40">
            {/* Left speech bubble (EN) */}
            <motion.div
              className="absolute left-[4px] top-[4px] w-[24px] h-[18px] bg-indigo-500 text-white border-2 border-slate-955 rounded flex items-center justify-center font-display font-black text-[8px] shadow-[1.5px_1.5px_0_0_rgba(15,23,42,1)]"
              animate={{ x: [-1, 1, -1], y: [-0.5, 0.5, -0.5] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              EN
              <div className="absolute -bottom-[3px] right-[4px] w-1 h-1 bg-indigo-500 border-r-2 border-b-2 border-slate-955 rotate-45" />
            </motion.div>

            {/* Right speech bubble (BN) */}
            <motion.div
              className="absolute right-[4px] bottom-[4px] w-[24px] h-[18px] bg-emerald-500 text-white border-2 border-slate-955 rounded flex items-center justify-center font-display font-black text-[8px] shadow-[1.5px_1.5px_0_0_rgba(15,23,42,1)] animate-pulse"
              animate={{ x: [1, -1, 1], y: [0.5, -0.5, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              বাং
              <div className="absolute -top-[3px] left-[4px] w-1 h-1 bg-emerald-500 border-l-2 border-t-2 border-slate-955 rotate-45" />
            </motion.div>
          </div>
        );

      case "vocabularyQuiz":
        return (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-950/40 dark:to-green-950/40">
            {/* Elegant Quiz Card */}
            <motion.div
              className="relative w-[34px] h-[30px] bg-white dark:bg-slate-900 border-2 border-slate-950 rounded-lg shadow-[1.5px_1.5px_0_0_rgba(15,23,42,1)] p-1 flex flex-col justify-between"
              animate={{ y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            >
              {/* Quiz Header: Mini question mark */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-0.5">
                <div className="w-3 h-1 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                <span className="text-[7px] font-black text-amber-500 font-display">?</span>
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-[2px] mt-0.5 flex-1 flex flex-col justify-center">
                {/* Option 1: Incorrect */}
                <div className="flex items-center gap-1">
                  <div className="w-[5px] h-[5px] rounded-sm bg-rose-500 flex items-center justify-center">
                    <span className="text-[4px] text-white font-black leading-none">×</span>
                  </div>
                  <div className="w-4 h-[2px] bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
                {/* Option 2: Correct & Selected */}
                <motion.div 
                  className="flex items-center gap-1"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1 }}
                >
                  <motion.div 
                    className="w-[5px] h-[5px] rounded-sm bg-emerald-500 flex items-center justify-center"
                    animate={{ backgroundColor: ["#cbd5e1", "#10b981", "#10b981"] }}
                    transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1 }}
                  >
                    <span className="text-[4px] text-white font-black leading-none">✓</span>
                  </motion.div>
                  <motion.div 
                    className="w-3 h-[2px] bg-slate-300 dark:bg-slate-700 rounded"
                    animate={{ backgroundColor: ["#cbd5e1", "#10b981", "#cbd5e1"] }}
                    transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1 }}
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Little floating question mark and checkmark */}
            <motion.span
              className="absolute text-[8px] font-black text-amber-500"
              style={{ top: 2, right: 3 }}
              animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              ?
            </motion.span>
            <motion.span
              className="absolute text-[8px] font-black text-emerald-500"
              style={{ bottom: 2, left: 3 }}
              animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.8, ease: "easeInOut" }}
            >
              ✓
            </motion.span>
          </div>
        );

      case "dailyTrending":
        return (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-100 to-red-100 dark:from-amber-950/40 dark:to-red-950/40">
            {/* Glowing Backdrop */}
            <div className="absolute w-6 h-6 bg-orange-400/20 rounded-full filter blur-md" />
            
            {/* Flame container */}
            <motion.div
              className="relative z-10"
              animate={{ 
                scaleY: [1, 1.15, 0.95, 1.1, 1],
                rotate: [-2, 2, -2]
              }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            >
              <Flame className="w-6 h-6 text-orange-500 fill-amber-500 stroke-slate-955 stroke-[2.5]" />
            </motion.div>

            {/* Tiny rising hot embers */}
            <motion.div
              className="absolute w-[3px] h-[3px] rounded-full bg-yellow-300 z-20"
              style={{ bottom: 8, left: 8 }}
              animate={{ y: [0, -16], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeOut" }}
            />
            <motion.div
              className="absolute w-[3px] h-[3px] rounded-full bg-amber-400 z-20"
              style={{ bottom: 10, right: 8 }}
              animate={{ y: [0, -20], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.4, delay: 0.5, ease: "easeOut" }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-900 flex items-center justify-center shrink-0 relative overflow-hidden shadow-sm">
      {loading ? (
        <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      ) : error || !data ? (
        renderFallback()
      ) : (
        <Suspense fallback={renderFallback()}>
          <Lottie
            animationData={data}
            loop={true}
            autoplay={true}
            style={{ width: "100%", height: "100%" }}
          />
        </Suspense>
      )}
    </div>
  );
}
