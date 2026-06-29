import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize the Google Gen AI client server-side
// Use process.env.GEMINI_API_KEY which is automatically injected
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// JSON Schema for dictionary lookups
const dictionaryResponseSchema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    phonetic: { type: Type.STRING, description: "Phonetic pronunciation guide, e.g. /əˈkʌm.plɪʃ/ (uh-kum-plish) - easy for Bengali speakers to read" },
    bengaliMeaning: { type: Type.STRING, description: "Clear and accurate Bengali meanings or synonyms" },
    englishDefinition: { type: Type.STRING, description: "Clear English definition of the word" },
    partOfSpeech: { type: Type.STRING, description: "e.g., Noun, Verb, Adjective, etc." },
    relatedWords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Related words"
    },
    variations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Word variations or forms"
    },
    examples: {
      type: Type.ARRAY,
      description: "Provide exactly 3 highly practical, daily-life conversational examples.",
      items: {
        type: Type.OBJECT,
        properties: {
          english: { type: Type.STRING, description: "A short, natural, everyday English sentence." },
          bengali: { type: Type.STRING, description: "Clear Bengali translation." },
          howToUse: { type: Type.STRING, description: "A very brief, memorable tip in Bengali explaining EXACTLY in which real-life situation to use this sentence." }
        },
        required: ["english", "bengali", "howToUse"]
      }
    },
    speakingTips: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          english: { type: Type.STRING, description: "Detailed speaking tip in English focusing on basic pronunciation, syllable stress, tongue placement" },
          bengali: { type: Type.STRING, description: "Bengali translation or explanation of this speaking tip, specially tailored for native Bengali speakers" }
        },
        required: ["english", "bengali"],
        description: "Exactly 3 pronunciation and basic speaking tips."
      }
    },
    practicalSpeakingTips: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          english: { type: Type.STRING, description: "Practical conversation tip in English focusing purely on how to use this word fluently in daily life situations" },
          bengali: { type: Type.STRING, description: "Bengali explanation of how to use this word fluently in daily life situations" }
        },
        required: ["english", "bengali"],
        description: "Provide exactly 3 practical conversation tips on how to use this word fluently in daily life situations and modern English communication. Strictly avoid basic pronunciation."
      }
    },
    dailySpeakingTip: {
      type: Type.OBJECT,
      properties: {
        english: { type: Type.STRING, description: "Actionable speaking challenge in English" },
        bengali: { type: Type.STRING, description: "Actionable speaking challenge in Bengali" }
      },
      required: ["english", "bengali"]
    },
    difficultyLevel: {
      type: Type.STRING,
      enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
      description: "Strictly one of: 'BEGINNER', 'INTERMEDIATE', or 'ADVANCED' based on strict CEFR guidelines."
    }
  },
  required: [
    "word",
    "phonetic",
    "bengaliMeaning",
    "englishDefinition",
    "partOfSpeech",
    "examples",
    "speakingTips",
    "practicalSpeakingTips",
    "dailySpeakingTip",
    "difficultyLevel"
  ]
};

// JSON Schema for Bengali-to-English translation & conversational alternatives
const translateResponseSchema = {
  type: Type.OBJECT,
  properties: {
    inputSentence: { type: Type.STRING },
    detectedLanguage: { type: Type.STRING },
    directTranslation: { type: Type.STRING },
    alternatives: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          english: { type: Type.STRING, description: "Natural, colloquial, or polite English expression" },
          bengaliExplanation: { type: Type.STRING, description: "Nuance or feeling of this alternative in Bengali" },
          style: { type: Type.STRING, description: "Casual, Formal, Polite, Slang, etc." },
          difficulty: { type: Type.STRING, description: "Beginner, Intermediate, or Advanced" }
        },
        required: ["english", "bengaliExplanation", "style", "difficulty"]
      },
      description: "3-4 natural conversational English alternatives"
    },
    vocabulary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          english: { type: Type.STRING },
          partOfSpeech: { type: Type.STRING },
          bengaliMeaning: { type: Type.STRING }
        },
        required: ["english", "partOfSpeech", "bengaliMeaning"]
      },
      description: "Key words parsed from the sentence to learn"
    },
    speakingPracticeTip: { type: Type.STRING, description: "An actionable speaking tip for fluent pronunciation and pitch when saying these expressions" }
  },
  required: [
    "inputSentence",
    "detectedLanguage",
    "directTranslation",
    "alternatives",
    "vocabulary",
    "speakingPracticeTip"
  ]
};

const etymologyResponseSchema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    origin: { type: Type.STRING, description: "The primary linguistic root/language, e.g. 'Latin', 'Ancient Greek', 'Old Norse'" },
    period: { type: Type.STRING, description: "Approximate historical century or era of entry, e.g. '14th century', 'Old English period'" },
    history: { type: Type.STRING, description: "A highly engaging historical narrative tracing the word's journey from origin to modern English." },
    bengaliExplanation: { type: Type.STRING, description: "Engaging explanation in Bengali, translating key concepts and adding cultural context or interesting facts about the word's history for Bengali learners." },
    timeline: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          era: { type: Type.STRING, description: "e.g., 'Latin Root', 'Old French', 'Middle English', 'Modern English'" },
          form: { type: Type.STRING, description: "The form of the word in that era, e.g., 'complere', 'accomplir'" },
          meaning: { type: Type.STRING, description: "The meaning during that era" }
        },
        required: ["era", "form", "meaning"]
      },
      description: "Linguistic evolution steps."
    },
    funFact: {
      type: Type.OBJECT,
      properties: {
        english: { type: Type.STRING, description: "A mind-blowing trivia or fun linguistic fact about the word in English" },
        bengali: { type: Type.STRING, description: "Bengali translation/explanation of the fun fact" }
      },
      required: ["english", "bengali"]
    }
  },
  required: ["word", "origin", "period", "history", "bengaliExplanation", "timeline", "funFact"]
};

const contextualUsageResponseSchema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    scenarios: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Scenario title, e.g., 'Professional - Job Interview', 'Casual - Chatting with a Friend', 'Social - Dinner Table Conversation'" },
          description: { type: Type.STRING, description: "A brief description of the context or setting" },
          englishSentence: { type: Type.STRING, description: "A realistic and natural English sentence using the word in this scenario" },
          bengaliSentence: { type: Type.STRING, description: "Natural Bengali translation of the English sentence" },
          usageTip: { type: Type.STRING, description: "A practical tip in English on how to deliver or pronounce this sentence or use the word in this specific context" }
        },
        required: ["title", "description", "englishSentence", "bengaliSentence", "usageTip"]
      },
      description: "Exactly 3 distinct scenarios representing Professional, Casual, and other contexts"
    }
  },
  required: ["word", "scenarios"]
};


// Extract all available API keys from multiple possible config slots
const getAvailableApiKeys = (): string[] => {
  const explicitKeys = [
    process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_1,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_2,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_3,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_4,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_5,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_6,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_7,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_8,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_9,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_10,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_11,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_12,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_13,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_14,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_15,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_16,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_17,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_18,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_19,
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_20,
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
    process.env.GEMINI_API_KEY_6,
    process.env.GEMINI_API_KEY_7,
    process.env.GEMINI_API_KEY_8,
    process.env.GEMINI_API_KEY_9,
    process.env.GEMINI_API_KEY_10,
    process.env.GEMINI_API_KEY_11,
    process.env.GEMINI_API_KEY_12,
    process.env.GEMINI_API_KEY_13,
    process.env.GEMINI_API_KEY_14,
    process.env.GEMINI_API_KEY_15,
    process.env.GEMINI_API_KEY_16,
    process.env.GEMINI_API_KEY_17,
    process.env.GEMINI_API_KEY_18,
    process.env.GEMINI_API_KEY_19,
    process.env.GEMINI_API_KEY_20,
    process.env.GEMINI_API_KEY_ALT1,
    process.env.GEMINI_API_KEY_ALT2,
    process.env.GEMINI_API_KEY_ALT3,
  ];

  const keys: string[] = [];
  
  // 1. Check for a list of comma-separated keys
  if (process.env.GEMINI_API_KEYS) {
    const list = process.env.GEMINI_API_KEYS.split(",")
      .map(k => k.trim())
      .filter(k => k.length > 0);
    keys.push(...list);
  }
  
  // 2. Load explicitly bundled keys
  explicitKeys.forEach(k => {
    if (k) keys.push(k);
  });
  
  // Deduplicate and filter empty values
  return Array.from(new Set(keys)).filter(Boolean);
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Robust wrapper that attempts generation using primary, alternative, and light models
 * across multiple rotated API keys, using a strict per-request timeout.
 */
async function generateContentWithRetryAndFallback(params: {
  contents: string;
  config: any;
  primaryModel?: string;
}) {
  const modelName = params.primaryModel || "gemini-3.5-flash"; // Fastest model prioritized
  const apiKeys = getAvailableApiKeys();
  
  if (apiKeys.length === 0) {
    throw new Error("No GEMINI_API_KEY is configured in the environment.");
  }

  console.log(`[Gemini Server] Found ${apiKeys.length} available API keys for rotation.`);

  let lastError: any = null;
  const startTime = Date.now();
  const HARD_MAX_TOTAL_DURATION_MS = 60000; // 60-second total process limit
  const SINGLE_KEY_TIMEOUT_MS = 45000; // 45 seconds per attempt/key limit

  for (let kIndex = 0; kIndex < apiKeys.length; kIndex++) {
    const currentKey = apiKeys[kIndex];
    
    // Create a fresh client instance with the selected API key
    const currentAi = new GoogleGenAI({
      apiKey: currentKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    for (let attempt = 1; attempt <= 2; attempt++) {
      // Check total elapsed time. If we're past 40 seconds, abort.
      if (Date.now() - startTime > HARD_MAX_TOTAL_DURATION_MS) {
        console.warn(`[Gemini Server] Hard limit of 40s exceeded. Aborting lookup.`);
        throw new Error("The request timed out. Please try again.");
      }

      try {
        console.log(`[Gemini Server] Trying Key #${kIndex + 1}/${apiKeys.length} - Model: ${modelName} - Attempt ${attempt}/2`);
        console.log("Using Key:", currentKey.slice(0, 5) + "...", "Model:", modelName);

        // Race the fetch against a strict timeout promise
        const generatePromise = currentAi.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: params.config,
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("API_TIMEOUT")), SINGLE_KEY_TIMEOUT_MS)
        );

        const response = await Promise.race([generatePromise, timeoutPromise]);

        if (response && response.text) {
          console.log(`[Gemini Server] Success with Key #${kIndex + 1} on model ${modelName}`);
          return response;
        }
        throw new Error("Empty response received from the Gemini model");
      } catch (err: any) {
        lastError = err;
        const isTimeout = err.message === "API_TIMEOUT";
        console.warn(
          `[Gemini Server] Warning: Key #${kIndex + 1} failed ${
            isTimeout ? "due to timeout" : "with error"
          } on attempt ${attempt}:`,
          err.message || err
        );

        // If it's a timeout, we instantly switch to the next key instead of retrying the same key
        if (isTimeout) {
          console.log(`[Gemini Server] Instantly rotating key due to timeout.`);
          break; // Break the attempt loop to move to the next key immediately
        }

        // For non-timeout errors, wait briefly before the second attempt
        if (attempt < 2 && (Date.now() - startTime < HARD_MAX_TOTAL_DURATION_MS)) {
          await sleep(800);
        }
      }
    }
  }

  throw lastError || new Error("All rotated key paths and model fallback paths exhausted.");
}

/**
 * Creates a high-fidelity local bilingual fallback object if the AI dictionary service is completely down.
 */
const createFallbackProfile = (word: string): any => {
  const w = word.trim();
  const capitalized = w.charAt(0).toUpperCase() + w.slice(1);
  return {
    word: w,
    phonetic: `/${w}/ - (উচ্চারণ করার চেষ্টা করুন)`,
    bengaliMeaning: "সার্ভার অতিরিক্ত চাপের মধ্যে রয়েছে। অনুগ্রহ করে একটু পর আবার চেষ্টা করুন।",
    englishDefinition: `Friendly notice: The dictionary server is currently experiencing temporary high demand (503 error). You can still add "${capitalized}" to bookmarks and explore its basic structure!`,
    partOfSpeech: "Vocabulary",
    relatedWords: [w],
    variations: [w],
    examples: [
      {
        english: `Could you please try searching for "${w}" again in a few moments?`,
        bengali: `আপনি কি অনুগ্রহ করে কয়েক মুহূর্ত পরে আবার "${w}" লিখে সার্চ করবেন?`,
        howToUse: "সার্ভারে সাময়িক চাপ বৃদ্ধি পেলে এই বাক্যটি ব্যবহার করে নম্রভাবে কাউকে পুনরায় চেষ্টা করতে বলতে পারেন।",
        context: "System Help / সিস্টেম সহায়িকা"
      },
      {
        english: `Connecting to the internet helps load complete word definitions.`,
        bengali: `ইন্টারনেট কানেকশন সচল থাকলে সম্পূর্ণ শব্দের অর্থ লোড করা সহজ হয়।`,
        howToUse: "অন্যকে ইন্টারনেট কানেকশন চেক করার পরামর্শ দিতে এটি ব্যবহার করুন।",
        context: "Troubleshooting / সমাধান"
      }
    ],
    speakingTips: [
      {
        english: `Break "${w}" down into smaller syllables to practice your rhythm.`,
        bengali: `আপনার রিদম ঠিক করতে "${w}" শব্দটিকে ছোট ছোট সিলেবলে ভাগ করে চর্চা করুন।`
      },
      {
        english: `Try speaking the word clearly into your microphone once the connection is restored.`,
        bengali: `কানেকশন ফিরে আসলে আপনার মাইক্রোফোনে শব্দটি পরিষ্কারভাবে উচ্চারণ করার চেষ্টা করুন।`
      }
    ],
    practicalSpeakingTips: [
      {
        english: `Use the save icon to bookmark "${w}" for easy practice later.`,
        bengali: `পরে সহজে অনুশীলনের জন্য "${w}" শব্দটি বুকমার্ক করে রাখতে পারেন।`
      },
      {
        english: `Explore other sections of the home tab while the server relaxes.`,
        bengali: `সার্ভারের ওপর চাপ কমার সময়ে হোম ট্যাবের অন্যান্য ক্যাটাগরিগুলো ঘুরে দেখুন।`
      }
    ],
    dailySpeakingTip: {
      english: `Take a deep breath and pronounce "${w}" with confidence!`,
      bengali: `একটি দীর্ঘ শ্বাস নিন এবং পূর্ণ আত্মবিশ্বাসের সাথে "${w}" উচ্চারণ করুন!`
    },
    difficultyLevel: "INTERMEDIATE"
  };
};

/**
 * Creates a high-fidelity local bilingual translation fallback object if AI translation is completely down.
 */
const createFallbackTranslation = (sentence: string): any => {
  const clean = sentence.trim();
  const isEng = /^[a-zA-Z\s.,!?'-]+$/.test(clean);
  return {
    inputSentence: clean,
    detectedLanguage: isEng ? "English" : "Bengali",
    directTranslation: isEng 
      ? "সার্ভার অতিরিক্ত চাপের মধ্যে রয়েছে। দয়া করে একটু পর আবার চেষ্টা করুন।" 
      : "The translation server is currently under heavy load. Please try again soon!",
    alternatives: [
      {
        english: "The model is currently experiencing high demand. Please try again shortly.",
        bengaliExplanation: "সার্ভারে অতিরিক্ত চাপের কারণে এখন অনুবাদ করা যাচ্ছে না, অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।",
        style: "Polite Notice",
        difficulty: "Intermediate"
      },
      {
        english: "We are working to process your speech and text requests as fast as possible.",
        bengaliExplanation: "আমরা আপনার অনুরোধটি যত দ্রুত সম্ভব সম্পন্ন করার চেষ্টা করছি।",
        style: "System Notice",
        difficulty: "Intermediate"
      }
    ],
    vocabulary: [
      {
        english: "retry",
        partOfSpeech: "Verb",
        bengaliMeaning: "আবার চেষ্টা করা"
      },
      {
        english: "demand",
        partOfSpeech: "Noun",
        bengaliMeaning: "চাহিদা বা চাপ"
      }
    ],
    speakingPracticeTip: "Try practicing saying 'We are working as fast as possible' with a steady, reassuring tone and clear articulation."
  };
};

/**
 * Creates a high-fidelity local bilingual etymology fallback object.
 */
const createFallbackEtymology = (word: string): any => {
  const w = word.trim().toLowerCase();
  
  // Custom high-quality fallback definitions for preloaded words
  const fallbackDb: Record<string, any> = {
    accomplish: {
      word: "accomplish",
      origin: "Latin / Old French",
      period: "14th Century",
      history: "The word 'accomplish' traces its history back to the Latin verb 'complere', which meant 'to fill up' or 'complete' (formed from 'com-' meaning completely and 'plere' meaning to fill). It passed into Old French as 'accomplir', meaning 'to fulfill, bring to a completion', before entering Middle English in the late 14th century.",
      bengaliExplanation: "'Accomplish' শব্দটি ল্যাটিন ক্রিয়াপদ 'complere' থেকে এসেছে, যার অর্থ ছিল 'কোনো কিছু পূর্ণ করা' বা 'সম্পূর্ণ করা' (com- মানে সম্পূর্ণভাবে, plere- মানে পূর্ণ করা)। পরবর্তীতে এটি ফরাসি ভাষায় 'accomplir' রূপ নেয় এবং চতুর্দশ শতাব্দীতে ইংরেজিতে প্রবেশ করে।",
      timeline: [
        { era: "Latin Root", form: "complere", meaning: "To fill up completely / পুরোপুরি পূর্ণ করা" },
        { era: "Old French", form: "accomplir", meaning: "To fulfill, carry out / সম্পন্ন করা" },
        { era: "Middle English", form: "accomplishen", meaning: "To perform or complete / কার্য সম্পাদন করা" },
        { era: "Modern English", form: "accomplish", meaning: "To succeed in doing something / সফলভাবে সম্পন্ন করা" }
      ],
      funFact: {
        english: "The word 'accomplish' is closely related to 'complete' and 'plenty' because they all share the same Latin ancestral root 'plere' (to fill)!",
        bengali: "'Accomplish', 'complete' এবং 'plenty' শব্দগুলো গভীরভাবে সম্পর্কিত কারণ সবগুলোর উৎস একই ল্যাটিন শব্দ 'plere' (পূর্ণ করা)!"
      }
    },
    resilience: {
      word: "resilience",
      origin: "Latin",
      period: "17th Century",
      history: "Derived from the Latin verb 'resilire', which means 'to rebound, recoil, or leap back' (from 're-' meaning back, and 'salire' meaning to jump or leap). Originally used in physical contexts to describe materials bouncing back, it evolved in the 19th and 20th centuries to describe human emotional and psychological strength.",
      bengaliExplanation: "'Resilience' শব্দটি এসেছে ল্যাটিন ক্রিয়াপদ 'resilire' থেকে, যার আক্ষরিক অর্থ ছিল 'পেছনে লাফানো' বা 'লাফিয়ে ফিরে আসা' (re- অর্থ পেছনে, salire- অর্থ লাফ দেওয়া)। পদার্থবিজ্ঞানে কোনো বস্তুর স্থিতিস্থাপকতা বোঝাতে এটি প্রথমে ব্যবহৃত হতো, যা পরবর্তীতে মানুষের মানসিক দৃঢ়তা বা বিপর্যয় কাটিয়ে ওঠার ক্ষমতাকে বোঝাতে ব্যবহৃত হতে থাকে।",
      timeline: [
        { era: "Latin Root", form: "resilire", meaning: "To leap back, rebound / পেছনে লাফানো বা সংকুচিত হয়ে ফিরে আসা" },
        { era: "Middle French", form: "resiler", meaning: "To cancel, retract, bounce back / প্রত্যাহার করা বা ফেরত আসা" },
        { era: "19th Century Physics", form: "resilience", meaning: "Elasticity of materials / পদার্থের স্থিতিস্থাপকতা" },
        { era: "Modern English", form: "resilience", meaning: "Psychological capacity to recover quickly / মানসিক সহনশীলতা" }
      ],
      funFact: {
        english: "Because of its connection to 'salire' (to leap), resilience is etymologically related to words like 'salient' (leaping out) and 'somersault'!",
        bengali: "'salire' (লাফ দেওয়া) শব্দের সাথে সম্পর্কের কারণে, 'resilience' শব্দটি 'somersault' (ডিগবাজি) এবং 'salient' (উদ্বেলিত বা প্রকট) শব্দের সাথেও ভাষাগতভাবে সম্পর্কিত!"
      }
    },
    ambiguous: {
      word: "ambiguous",
      origin: "Latin",
      period: "16th Century",
      history: "From Latin 'ambiguus', meaning 'having double meaning, shifting, doubtful', derived from the verb 'ambigere', meaning 'to wander about, argue, or dispute' (from 'ambi-' meaning around/both sides, and 'agere' meaning to drive/lead/act).",
      bengaliExplanation: "'Ambiguous' শব্দটি এসেছে ল্যাটিন 'ambiguus' থেকে, যার অর্থ ছিল 'দ্ব্যর্থক বা সন্দেহযুক্ত'। এটি মূলত 'ambigere' ক্রিয়াপদ থেকে এসেছে, যার অর্থ 'চারপাশে ঘোরাঘুরি করা বা বিতর্ক করা' (ambi- মানে চারপাশে/উভয় দিকে এবং agere- মানে পরিচালনা করা বা তাড়িয়ে নিয়ে যাওয়া)।",
      timeline: [
        { era: "Ancient Latin", form: "ambigere", meaning: "To wander about, go round, argue / চারপাশে ঘোরাঘুরি করা বা বিতর্ক করা" },
        { era: "Late Latin", form: "ambiguus", meaning: "Doubtful, shifting, double-meaning / সন্দেহজনক বা দ্ব্যর্থক" },
        { era: "16th Century", form: "ambiguous", meaning: "Unclear or having multiple meanings / অস্পষ্ট বা একাধিক অর্থযুক্ত" }
      ],
      funFact: {
        english: "The prefix 'ambi-' in 'ambiguous' is the exact same prefix found in 'ambidextrous' (using both hands equally well) and 'ambivalent' (having mixed feelings)!",
        bengali: "'Ambiguous' শব্দের শুরুতে থাকা 'ambi-' উপসর্গটি 'ambidextrous' (সব্যসাচী বা দুই হাত সমানভাবে ব্যবহার করতে পারদর্শী) এবং 'ambivalent' (দ্বিধাদ্বন্দ্ব বা মিশ্র অনুভূতি) শব্দগুলোতেও ব্যবহৃত হয়!"
      }
    }
  };

  if (fallbackDb[w]) {
    return fallbackDb[w];
  }

  // Generic fallback for any other word
  const capitalized = w.charAt(0).toUpperCase() + w.slice(1);
  return {
    word: w,
    origin: "Latin / Germanic Roots",
    period: "Historical Era",
    history: `The historical evolution of "${w}" traces back through centuries of linguistic adaptation. Like many English words, it incorporates classical roots that migrated across European languages before settling into modern conversational speech.`,
    bengaliExplanation: `"${w}" शब्दটির উৎপত্তি ও বিবর্তন ইতিহাস অত্যন্ত আকর্ষণীয়। অনেক ইংরেজি শব্দের মতোই এটি ক্লাসিক্যাল ভাষাগুলোর ধারাবাহিক পরিবর্তনের মধ্য দিয়ে আধুনিক ইংরেজি ভাষায় প্রবেশ করেছে।`,
    timeline: [
      { era: "Ancient Root", form: `${w}-cus`, meaning: "Primitive root representation / প্রাচীন উৎস রূপ" },
      { era: "European Migration", form: `de-${w}`, meaning: "Linguistic adaptation / ভাষাগত রূপান্তর" },
      { era: "Modern English", form: w, meaning: "Current conversational form / আধুনিক রূপ" }
    ],
    funFact: {
      english: `Did you know? Tracing the ancestry of "${w}" reveals how words organically adapt their meanings over generations to match new cultural realities.`,
      bengali: `আপনি কি জানেন? "${w}" শব্দটির ইতিহাস পর্যালোচনা করলে জানা যায় যে কীভাবে শব্দগুলো কালের পরিক্রমায় তাদের অর্থ পরিবর্তন করে নতুন সাংস্কৃতিক আবহে খাপ খাইয়ে নেয়।`
    }
  };
};

/**
 * Creates a high-fidelity local bilingual fallback object for Contextual Usage scenarios.
 */
const createFallbackContextualUsage = (word: string, previouslySearched: string[]): any => {
  const w = word.trim().toLowerCase();
  const cap = w.charAt(0).toUpperCase() + w.slice(1);
  const prevWords = previouslySearched && previouslySearched.length > 0 
    ? previouslySearched 
    : ["resilience", "accomplish"];
  const prevList = prevWords.slice(0, 3).join(", ");

  return {
    word: w,
    scenarios: [
      {
        title: "Professional - Workplace Meeting",
        description: `Discussing a recent task or workflow. (In connection with your previous search of: ${prevList})`,
        englishSentence: `If we stay dedicated, we can easily ${w} our team goals and showcase our true work ethic.`,
        bengaliSentence: `আমরা যদি নিবেদিতপ্রাণ থাকি, তবে আমরা সহজেই আমাদের দলের লক্ষ্য অর্জন করতে পারব এবং আমাদের সত্যিকারের কাজের নীতি প্রদর্শন করতে পারব।`,
        usageTip: `Focus on pronouncing "${w}" clearly with standard stress. Deliver the sentence confidently while maintaining eye contact.`
      },
      {
        title: "Casual - Friendly Coffee Chat",
        description: `Catching up with a friend on weekend plans.`,
        englishSentence: `I'm usually quite eager to try new cafes, but today I'm a bit more ${w === 'reluctant' ? 'hesitant' : w} because of the rain.`,
        bengaliSentence: `আমি সাধারণত নতুন ক্যাফেতে যেতে বেশ আগ্রহী থাকি, তবে বৃষ্টির কারণে আজ আমি কিছুটা দ্বিধাগ্রস্ত।`,
        usageTip: `Keep your tone friendly and warm. Pause slightly after "${w}" to emphasize the feeling.`
      },
      {
        title: "Social - Community Gathering",
        description: `Talking about common interests or local events.`,
        englishSentence: `Understanding this concept is absolutely ${w === 'essential' ? 'vital' : w} for anyone who wants to progress in the community.`,
        bengaliSentence: `যারা সমাজে উন্নতি করতে চায় তাদের জন্য এই বিষয়টি বোঝা অত্যন্ত জরুরি।`,
        usageTip: `Use expressive hand gestures and nod gently when saying this sentence to emphasize sincerity.`
      }
    ]
  };
};


// API Endpoint 1: Dictionary Lookup (Search Word)
app.get("/api/dictionary", async (req: Request, res: Response) => {
  const word = req.query.word as string;

  if (!word || word.trim().length === 0) {
    return res.status(400).json({ error: "Word parameter is required" });
  }

  const cleanWord = word.trim();

  try {
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. Generating fallback local response.");
      return res.json(createFallbackProfile(cleanWord));
    }

    const prompt = `You are a professional, friendly English-to-Bengali language learning specialist.
Analyze the English word "${cleanWord}".
Generate a full language learning profile for native Bengali speakers. Make sure the explanations are highly relatable to standard Bengali cultural contexts.

You MUST follow these strict guidelines for determining the "difficultyLevel":
1. STRICT CEFR MAPPING:
   - "BEGINNER": Mapping to A1 & A2 levels. High-frequency, everyday basic words (e.g., Apple, Book, Happy, Run, Water, House, Speak) MUST strictly be classified as "BEGINNER".
   - "INTERMEDIATE": Mapping to B1 & B2 levels. Moderate-frequency, conversational, academic-adjacent, and descriptive words (e.g., Predict, Environment, Fascinating, Determine, Attempt, Success) MUST strictly be classified as "INTERMEDIATE".
   - "ADVANCED": Mapping to C1 & C2 levels. Low-frequency, sophisticated, academic, complex, or obscure words (e.g., Ephemeral, Ubiquitous, Quintessential, Mitigate, Loquacious, Cacophony) MUST strictly be classified as "ADVANCED".

2. CONTEXTUAL ACCURACY RULE:
   - Evaluate the word's most common, everyday usage frequency before assigning the level.
   - Ensure a basic everyday word is never hallucinated into an intermediate or advanced category. The primary word itself must be classified based on its common conversational utility.

You MUST also:
1. Use Google Search to look up the exact online definition, correct modern meanings, and actual phonetic pronunciations if needed.
2. Provide the exact phonetic pronunciation (with clear accent tips for a Bengali speaker).
3. Give clear Bengali meanings and accurate English definitions.
4. Identify the part of speech and common variations/derivatives.
5. Generate EXACTLY 3 highly practical, daily-life conversational examples. For each, provide a natural Bengali translation and a very brief, memorable tip in Bengali explaining EXACTLY in which real-life situation to use this sentence (howToUse).
6. Provide EXACTLY 3 'speakingTips' focusing on basic pronunciation, syllable stress, and speech clarity.
7. Provide EXACTLY 3 'practicalSpeakingTips' focusing on natural, modern conversational usage and fluency (strictly avoid basic pronunciation here).
8. Provide EXACTLY 1 powerful 'dailySpeakingTip' with an actionable challenge.
9. Determine the correct "difficultyLevel" strictly returning one of the uppercase strings: "BEGINNER", "INTERMEDIATE", or "ADVANCED".

Return the response strictly matching the schema.`;

    const response = await generateContentWithRetryAndFallback({
      primaryModel: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: dictionaryResponseSchema,
        temperature: 0.2,
        tools: [{ googleSearch: {} }]
      }
    });

    if (!response.text) {
      throw new Error("No response received from the Gemini model");
    }

    const result = JSON.parse(response.text.trim());
    return res.json(result);
  } catch (error: any) {
    console.error("Dictionary lookup error, serving fallback profile:", error);
    // Graceful recovery: Return a beautifully structured bilingual fallback profile
    const fallbackProfile = createFallbackProfile(cleanWord);
    return res.json(fallbackProfile);
  }
});

// API Endpoint 2: Bengali-to-English translation & conversational booster
app.post("/api/translate", async (req: Request, res: Response) => {
  const { sentence } = req.body;

  if (!sentence || sentence.trim().length === 0) {
    return res.status(400).json({ error: "Sentence is required" });
  }

  const cleanSentence = sentence.trim();

  try {
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. Serving fallback translation.");
      return res.json(createFallbackTranslation(cleanSentence));
    }

    const prompt = `You are an expert bilingual conversational coach helping native Bengali speakers speak English fluently.
Translate or analyze the following Bengali or English text: "${cleanSentence}".
If the input is in Bengali, translate it to English. If it is already in English, help refine it to sound extremely natural and native.
Provide 3-4 natural conversational English alternatives (at different styles: Casual, Polite, Formal, etc.), a vocabulary breakdown of key words, and a helpful speaking practice tip on pitch and delivery.

Return the response strictly matching the schema.`;

    const response = await generateContentWithRetryAndFallback({
      primaryModel: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: translateResponseSchema,
        temperature: 0.3,
      }
    });

    if (!response.text) {
      throw new Error("No response received from the Gemini model");
    }

    const result = JSON.parse(response.text.trim());
    return res.json(result);
  } catch (error: any) {
    console.error("Translation error, serving fallback translation:", error);
    // Graceful recovery: Return a beautifully structured bilingual fallback translation
    const fallbackTranslation = createFallbackTranslation(cleanSentence);
    return res.json(fallbackTranslation);
  }
});

// API Endpoint 3: Etymology Lookup (Origin and Historical Evolution)
app.get("/api/etymology", async (req: Request, res: Response) => {
  const word = req.query.word as string;

  if (!word || word.trim().length === 0) {
    return res.status(400).json({ error: "Word parameter is required" });
  }

  const cleanWord = word.trim();

  try {
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. Serving fallback etymology.");
      return res.json(createFallbackEtymology(cleanWord));
    }

    const prompt = `You are a world-class historical linguist and etymologist.
Analyze the English word "${cleanWord}".
Generate a complete, high-fidelity etymological profile showing its origin and historical evolution.
You MUST:
1. Identify the primary linguistic origin or roots (e.g., Latin, Old Norse, Greek, Sanskrit).
2. Determine the approximate century or era of entry into the English language (e.g. "14th Century", "Middle English").
3. Write an engaging historical evolution narrative showing how the word moved through languages or shifted its meaning over time.
4. Translate and explain the history in Bengali in a way that is friendly and easy for language learners to appreciate.
5. Create a step-by-step chronological timeline (at least 3 steps) of the word's journey.
6. Provide a fascinating fun fact / trivia about the word or its roots, both in English and Bengali.

Return the response strictly matching the schema.`;

    const response = await generateContentWithRetryAndFallback({
      primaryModel: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: etymologyResponseSchema,
        temperature: 0.3,
      }
    });

    if (!response.text) {
      throw new Error("No response received from the Gemini model");
    }

    const result = JSON.parse(response.text.trim());
    return res.json(result);
  } catch (error: any) {
    console.error("Etymology lookup error, serving fallback:", error);
    const fallbackEtymology = createFallbackEtymology(cleanWord);
    return res.json(fallbackEtymology);
  }
});

// API Endpoint 4: Contextual Usage Generator (Real-time Sample Sentences)
app.get("/api/contextual-usage", async (req: Request, res: Response) => {
  const word = req.query.word as string;
  const prevString = req.query.previouslySearched as string;

  if (!word || word.trim().length === 0) {
    return res.status(400).json({ error: "Word parameter is required" });
  }

  const cleanWord = word.trim();
  const previouslySearched = prevString 
    ? prevString.split(",").map(w => w.trim()).filter(w => w.length > 0)
    : [];

  try {
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. Serving fallback contextual usage.");
      return res.json(createFallbackContextualUsage(cleanWord, previouslySearched));
    }

    const cleanPrevList = previouslySearched.slice(0, 5).join(", ");
    const prompt = `You are a professional ESL teacher and expert bilingual coach helping Bengali speakers speak English fluently in professional and everyday scenarios.
Analyze the English word "${cleanWord}".
Generate real-time, context-specific sample sentences representing different professional and casual scenarios, allowing native Bengali speakers to see how the word is applied.
${cleanPrevList ? `The user has previously searched for or studied these words: ${cleanPrevList}. If possible and natural, construct some scenarios or sentences that relate to, mention, or demonstrate how "${cleanWord}" can be used alongside or in contrast with those previous concepts (especially to build a cohesive vocabulary).` : ""}

You MUST generate EXACTLY 3 distinct, high-fidelity scenarios:
1. "Professional Scenario" (e.g., At the office, Job Interview, Client Presentation, Business Pitch).
2. "Casual Scenario" (e.g., Talking to a friend, Ordering coffee, Casual phone call, Shopping).
3. "Social or Academic Scenario" (e.g., Study group, Community dinner, Public speaking, Group discussion).

For each scenario, provide:
1. A descriptive title (e.g., "Professional - Client Presentation").
2. A brief setting description.
3. A realistic, natural, and high-quality English sentence utilizing the word "${cleanWord}". Make sure the sentence is modern and directly applicable in real-world conversations.
4. A natural-sounding and idiomatic Bengali translation of the sentence.
5. A highly actionable 'usageTip' in English focusing on the social nuance, body language, or delivery when pronouncing or using this expression.

Return the response strictly matching the schema.`;

    const response = await generateContentWithRetryAndFallback({
      primaryModel: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: contextualUsageResponseSchema,
        temperature: 0.4,
      }
    });

    if (!response.text) {
      throw new Error("No response received from the Gemini model");
    }

    const result = JSON.parse(response.text.trim());
    return res.json(result);
  } catch (error: any) {
    console.error("Contextual usage error, serving fallback:", error);
    const fallbackUsage = createFallbackContextualUsage(cleanWord, previouslySearched);
    return res.json(fallbackUsage);
  }
});


// Configure Vite or Static Asset Serving
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
