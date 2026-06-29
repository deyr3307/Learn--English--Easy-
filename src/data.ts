import { WordProfile, CuratedCategory } from "./types";

export const PRELOADED_WORDS: Record<string, WordProfile> = {
  accomplish: {
    word: "accomplish",
    difficultyLevel: "Intermediate",
    partOfSpeech: "Verb",
    phonetic: "/əˈkʌm.plɪʃ/ (আ-কাম-প্লীশ)",
    bengaliMeaning: "অর্জন করা, সফলভাবে সম্পন্ন করা, সাধন করা",
    englishDefinition: "To succeed in doing something, especially after a lot of work or effort.",
    relatedWords: ["accomplishment", "accomplished"],
    variations: ["accomplish", "accomplishes", "accomplished", "accomplishing"],
    examples: [
      {
        english: "If you work hard, you can accomplish your goals easily.",
        bengali: "তুমি যদি কঠোর পরিশ্রম করো, তবে সহজেই তোমার লক্ষ্যগুলো অর্জন করতে পারবে।",
        howToUse: "কাউকে মোটিভেট করার জন্য বা নিজের লক্ষ্য অর্জনের গল্প বলার সময় এটি ব্যবহার করুন।",
        context: "Daily Motivation / Friends"
      },
      {
        english: "We managed to accomplish the entire project ahead of schedule.",
        bengali: "আমরা নির্ধারিত সময়ের আগেই পুরো প্রকল্পটি সফলভাবে সম্পন্ন করতে পেরেছি।",
        howToUse: "অফিসের কোনো প্রোজেক্ট বা কাজ সফলভাবে সময় মতো শেষ করার কথা উল্লেখ করতে এটি দারুণ মানানসই।",
        context: "Office / Work"
      },
      {
        english: "She felt she had accomplished nothing all day.",
        bengali: "তার মনে হচ্ছিল সে সারাদিনে কিছুই সম্পন্ন করতে পারেনি।",
        howToUse: "সারাদিন অনেক ব্যস্ত থেকেও যদি কোনো ফলপ্রসূ কাজ না করা হয়ে থাকে, তখন নিজের হতাশা প্রকাশের জন্য এটি বলতে পারেন।",
        context: "Casual Conversation"
      }
    ],
    speakingTips: [
      {
        english: "When saying 'accomplish', stress the second syllable '-com-' (like 'kum'), keeping the initial 'a-' very light.",
        bengali: "উচ্চারণ করার সময় 'ac-' অংশটিকে জোর না দিয়ে হালকাভাবে 'আ' উচ্চারণ করুন। প্রধান জোর বা stress থাকবে 'com' (কাম) অংশের ওপর।"
      },
      {
        english: "Ensure the final '-sh' sound is clear and prolonged, not a soft 's' sound.",
        bengali: "শেষের '-plish' অংশটি উচ্চারণ করার সময় 'শ' (sh) উচ্চারণটি স্পষ্ট ও দীর্ঘ রাখুন, বাংলায় 'স' (s) উচ্চারণ করবেন না।"
      },
      {
        english: "Release a puff of air when pronouncing the 'p' in '-plish' to sound natural.",
        bengali: "বাঙালিদের জন্য 'p' ও 'f' অনেক সময় গুলিয়ে যায়। মনে রাখবেন এটি 'প্লীশ', 'ফ্লিশ' নয়। দুই ঠোঁট চেপে বাতাস ছাড়ুন।"
      },
      {
        english: "Break it down into three clean segments: ac-com-plish.",
        bengali: "শব্দটিকে ৩টি ভাগে ভেঙ্গে বলুন: ac-com-plish। দ্রুত বলার আগে প্রতি অংশ স্পষ্ট করে বলুন।"
      },
      {
        english: "Keep your breath flow steady as you transition from 'm' to 'pl'.",
        bengali: "ইংরেজি বলার সময় গলার স্বর কিছুটা নিচু রেখে 'plish' অংশে হালকা একটু শ্বাস ছেড়ে বলুন।"
      }
    ],
    practicalSpeakingTips: [
      {
        english: "Use 'accomplish' instead of 'succeed' to sound more professional in interviews and emails.",
        bengali: "কথোপকথনে 'I succeeded' বলার চেয়ে 'I accomplished my task' বলাটা অনেক বেশি স্মার্ট ও প্রফেশনাল শোনায়।"
      },
      {
        english: "Use it to talk about significant milestones rather than daily trivial actions.",
        bengali: "চাকরির ইন্টারভিউতে আপনার অতীত সাফল্য নিয়ে কথা বলার সময় এই শব্দটি ব্যবহার করতে পারেন (যেমন: 'I accomplished the sales target')."
      },
      {
        english: "Limit 'accomplish' to complex or challenging tasks; use 'finish' or 'do' for simpler daily work.",
        bengali: "এটি কোনো বড় বা কষ্টসাধ্য অর্জন বোঝাতে বেশি ব্যবহৃত হয়, খুব ছোট সাধারণ কাজের ক্ষেত্রে 'do' বা 'finish' ব্যবহার করাই ভালো।"
      },
      {
        english: "Encourage others using phrases like 'You can accomplish anything with focus'.",
        bengali: "অন্য কাউকে উৎসাহিত করতে আপনি বলতে পারেন: 'You can accomplish anything you set your mind to!'"
      },
      {
        english: "Incorporate 'can accomplish' or 'will accomplish' into your active speaking habits.",
        bengali: "শব্দটিকে 'can/will accomplish' ফ্রেজ হিসেবে মনের ভাব প্রকাশ করার জন্য অনুশীলন করুন।"
      }
    ],
    dailySpeakingTip: {
      english: "Tell yourself: 'Today, I will accomplish at least one productive task!'",
      bengali: "আজকে আপনার ডায়েরিতে বা মনে মনে অন্তত ১টি কাজের কথা ইংরেজিতে বলুন যা আপনি আজ সম্পন্ন করেছেন: 'Today, I accomplished...'"
    }
  },
  resilience: {
    word: "resilience",
    difficultyLevel: "Advanced",
    partOfSpeech: "Noun",
    phonetic: "/rɪˈzɪl.jəns/ (রি-জিল-ইয়ান্স)",
    bengaliMeaning: "স্থিতিস্থাপকতা, বিপর্যয় কাটিয়ে ওঠার ক্ষমতা, সহনশীলতা",
    englishDefinition: "The ability to be happy, successful, or strong again after something difficult or bad has happened.",
    relatedWords: ["resilient", "resiliently"],
    variations: ["resilience"],
    examples: [
      {
        english: "The local community showed great resilience after the flood.",
        bengali: "বন্যার পর স্থানীয় সম্প্রদায়টি ঘুরে দাঁড়ানোর এক দুর্দান্ত ক্ষমতা দেখিয়েছিল।",
        howToUse: "কোনো প্রাকৃতিক দুর্যোগ বা বড় বিপদের পরে মানুষ বা সমাজের ঘুরে দাঁড়ানোর শক্তির প্রশংসা করতে এটি ব্যবহার করুন।",
        context: "News / Community Talk"
      },
      {
        english: "Daily meditation can help build emotional resilience.",
        bengali: "প্রতিদিনের ধ্যান মানসিক সহনশীলতা ও শক্তি বৃদ্ধিতে সাহায্য করতে পারে।",
        howToUse: "মানসিক স্বাস্থ্য নিয়ে আলোচনা করার সময় বা কাউকে মানসিকভাবে সবল থাকার পরামর্শ দিতে এটি ব্যবহার করুন।",
        context: "Mental Health / Advisory"
      },
      {
        english: "Her resilience is truly inspiring to everyone in the office.",
        bengali: "অফিসের সবার কাছে তার বাধা কাটিয়ে ওঠার এই ক্ষমতা সত্যিই অনুপ্রেরণাদায়ক।",
        howToUse: "অফিসে বা কর্মক্ষেত্রে কঠিন পরিস্থিতির মুখোমুখি হয়েও সফলভাবে টিকে থাকার ক্ষমতা সম্পন্ন সহকর্মীর প্রশংসা করতে এই বাক্যটি বলুন।",
        context: "Office Environment"
      }
    ],
    speakingTips: [
      {
        english: "Be careful not to pronounce the 's' as 'sh'. Pronounce 'sil' like a soft, vibrating 'z' sound (/zɪl/).",
        bengali: "বাঙালিদের সাধারণ ভুল হলো 's' কে 'sh' (শ) উচ্চারণ করা। এখানে 'si' অংশটিকে 'জি' বা 'z' এর মতো মিষ্টি মোলায়েমভাবে উচ্চারণ করতে হবে: /zɪ/ (জিল)।"
      },
      {
        english: "Keep the starting syllable 're-' short, and stress the second syllable 'sil'.",
        bengali: "প্রথম সিলেবল 're-' কে খুব বেশি টানবেন না, এটি হবে সংক্ষেপিত 'রি'। প্রধান জোর দিন 'sil' (জিল) অংশের ওপরে।"
      },
      {
        english: "The ending '-ce' must be pronounced as a clean, soft 's' sound with exhaled air.",
        bengali: "শেষের 'ce' অংশটি হবে পরিষ্কার 'স' (s) এর মতো, বাতাস ছেড়ে নরমভাবে বলুন।"
      },
      {
        english: "Position the tip of your tongue near the upper gums to generate the buzz for 'z'.",
        bengali: "এটিকে উচ্চারণ করার সময় জিবের ডগা উপরের দাঁতের মাড়ির কাছে নিয়ে যান এবং জিব কাঁপিয়ে 'z' ধ্বনি দিন।"
      },
      {
        english: "Practice saying 're-sil-i-ence' in segments before merging them smoothly.",
        bengali: "৪টি সিলেবলকে একবারে না বলে ভেঙ্গে re-sil-i-ence এভাবে ৩-৪ বার বলুন।"
      }
    ],
    practicalSpeakingTips: [
      {
        english: "Instead of simply telling someone to 'be strong', say 'This situation requires resilience'.",
        bengali: "কঠিন পরিস্থিতিতে কেউ ভেঙে পড়লে তাকে সান্ত্বনা দিতে 'Be strong' না বলে বলতে পারেন, 'This is a test of your resilience.'"
      },
      {
        english: "Use this word during motivational speaking, self-reflection, or professional appraisals.",
        bengali: "ব্যক্তিগত উন্নতি বা মোটিভেশনাল আলোচনায় এই শব্দটি আজকাল অত্যন্ত জনপ্রিয় ও আধুনিক শব্দ হিসেবে ব্যবহৃত হয়।"
      },
      {
        english: "Use it to describe team adaptability in a corporate crisis scenario.",
        bengali: "অফিসে বা প্রফেশনাল লাইফে মানিয়ে নেওয়ার ক্ষমতা বোঝাতে এটি ব্যবহার করুন: 'We need resilience to handle this crisis.'"
      },
      {
        english: "Utilize the adjective 'resilient' to define yourself: 'I am resilient'.",
        bengali: "এই শব্দটির বিশেষণ রূপ 'resilient' অত্যন্ত জনপ্রিয়। নিজের জন্য বলুন: 'I am resilient' (আমি বাধার মুখেও ঘুরে দাঁড়াতে পারি)।"
      },
      {
        english: "Associate resilience with learning from failure, which makes it easier to use in casual conversations.",
        bengali: "ব্যর্থতা নিয়ে কথা বলার সময় শব্দটিকে ইতিবাচক হিসেবে ব্যবহার করতে শিখুন।"
      }
    ],
    dailySpeakingTip: {
      english: "Affirm out loud: 'I have the resilience to overcome any obstacle today.'",
      bengali: "আজ কোনো সমস্যার সম্মুখীন হলে নিজেকে ইংরেজিতে জোর দিয়ে বলুন: 'I have the resilience to overcome this challenge!'"
    }
  },
  ambiguous: {
    word: "ambiguous",
    difficultyLevel: "Intermediate",
    partOfSpeech: "Adjective",
    phonetic: "/æmˈbɪɡ.ju.əs/ (অ্যাম-বিগ-ইউ-আস)",
    bengaliMeaning: "দ্ব্যর্থক, অস্পষ্ট, সন্দেহজনক, যার একাধিক অর্থ হতে পারে",
    englishDefinition: "Having or expressing more than one possible meaning, sometimes intentionally, or being difficult to understand.",
    relatedWords: ["ambiguity", "ambiguously"],
    variations: ["ambiguous"],
    examples: [
      {
        english: "His instructions were extremely ambiguous, and nobody knew what to do.",
        bengali: "তার নির্দেশনাবলী অত্যন্ত অস্পষ্ট ছিল, এবং কেউই বুঝতে পারছিল না কী করতে হবে।",
        howToUse: "অফিস বা ক্লাসে যখন কোনো কাজের বিবরণ বা গাইডলাইন খুব গোলমেলে ও বিভ্রান্তিকর হয়, তখন এই বাক্যটি ব্যবহার করুন।",
        context: "Office Instructions"
      },
      {
        english: "She gave an ambiguous answer, leaving us completely confused.",
        bengali: "সে একটি দ্ব্যর্থক উত্তর দিয়েছিল, যা আমাদের সম্পূর্ণ বিভ্রান্ত করে ফেলেছিল।",
        howToUse: "কেউ যখন হ্যাঁ অথবা না সরাসরি না বলে কোনো ঘোরানো বা অস্পষ্ট উত্তর দেয়, তখন আপনার বিভ্রান্তি বুঝাতে এটি ব্যবহার করুন।",
        context: "Casual Conversation"
      },
      {
        english: "The ending of the movie was ambiguous but thought-provoking.",
        bengali: "সিনেমার শেষটা অস্পষ্ট ছিল কিন্তু চিন্তা জাগানোর মতো ছিল।",
        howToUse: "কোনো বই, নাটক বা চলচ্চিত্রের শেষ দৃশ্য বা পরিণতি যখন একাধিক ব্যাখ্যাযোগ্য ও রহস্যময় হয়, তখন সেটির গঠনমূলক সমালোচনা করতে এটি বলুন।",
        context: "Reviewing a Movie"
      }
    ],
    speakingTips: [
      {
        english: "Pronounce the initial 'am-' like the short 'a' in 'apple', not like 'aaum'.",
        bengali: "শুরুর 'am-' অংশটি হবে 'অ্যাম' (যেমন: 'Apple' এর 'A' এর মতো), 'এম' বা 'আম' বলবেন না।"
      },
      {
        english: "Place the main emphasis and voice power on the middle syllable '-big-'.",
        bengali: "মাঝের '-big-' (বিগ) অংশটিতে মূল স্ট্রেস বা জোর থাকবে।"
      },
      {
        english: "Say the ending '-uous' gently as 'yu-uhs', rather than a rushed 'was'.",
        bengali: "'-uous' অংশটিকে তাড়াহুড়ো করে 'উয়াস' না বলে নরমভাবে 'ইউ-আস' বলুন।"
      },
      {
        english: "Produce a clean, crisp 'g' sound from the back of your throat for 'big'.",
        bengali: "জিবের গোড়ার দিক দিয়ে কণ্ঠনালী থেকে 'g' ধ্বনিটি স্পষ্ট করুন যাতে 'বিগ' চমৎকার শোনায়।"
      },
      {
        english: "Speak clearly so the listener doesn't confuse 'ambiguous' with 'ambitious'.",
        bengali: "আপনার স্বরভঙ্গি স্পষ্ট রাখুন যাতে শ্রোতা বুঝতে পারে আপনি 'ambiguous' বলছেন, 'ambitious' নয়।"
      }
    ],
    practicalSpeakingTips: [
      {
        english: "Politely request clarity by saying: 'Your instructions are a bit ambiguous, could you please clarify?'",
        bengali: "যদি কেউ এমন কথা বলে যা পরিষ্কার নয়, তাকে ভদ্রভাবে বলতে পারেন: 'Your statement is a bit ambiguous, could you please clarify?'"
      },
      {
        english: "Apply this term when discussing contracts, examination questions, or legal documents.",
        bengali: "চুক্তিপত্র, পরীক্ষা বা আইনি বিষয়ের জটিল ভাষা বোঝাতে এই শব্দটি দারুণ মানানসই।"
      },
      {
        english: "Instead of calling a statement 'vague' or 'confusing', use 'ambiguous' to sound more articulate.",
        bengali: "বাংলায় 'ধোঁয়াশাপূর্ণ' বা 'দ্বিমুখী' কোনো মন্তব্যকে সরাসরি ইংরেজিতে 'ambiguous comment' বলুন।"
      },
      {
        english: "Express polite uncertainty in business meetings: 'This section is somewhat ambiguous.'",
        bengali: "সরাসরি 'I don't understand' বলার চেয়ে 'This is somewhat ambiguous' বলা প্রফেশনাল ও মার্জিত শোনায়।"
      },
      {
        english: "Advise colleagues: 'We need to make sure our wording isn't ambiguous.'",
        bengali: "ব্যবসায়িক মিটিংয়ে কোনো বিষয়ের একাধিক ব্যাখ্যা থাকলে বলুন: 'We must avoid ambiguous terms in our contract.'"
      }
    ],
    dailySpeakingTip: {
      english: "When you hear something unclear, practice whispering: 'That seems ambiguous.'",
      bengali: "কাউকে কোনো অস্পষ্ট কথা বলতে শুনলে মনে মনে বাক্যটি তৈরি করুন: 'That's ambiguous!'"
    }
  }
};

export const CURATED_CATEGORIES: CuratedCategory[] = [
  {
    id: "daily",
    title: "Daily Conversation Essentials",
    bengaliTitle: "প্রতিদিনের প্রয়োজনীয় কথোপকথন",
    description: "খুব সাধারণ অথচ মার্জিত ইংরেজি শব্দ যা প্রতিদিনের আড্ডায়, কেনাকাটায় বা বন্ধুদের সাথে ব্যবহার করা হয়।",
    iconName: "MessageCircle",
    words: ["Accomplish", "Reluctant", "Frequent", "Sustain", "Inquire", "Hesitate"]
  },
  {
    id: "office",
    title: "Corporate & Job Interview Words",
    bengaliTitle: "অফিস ও ইন্টারভিউ উপযোগী শব্দ",
    description: "অফিসের মিটিং, সিভি রাইটিং, এবং চাকরির ইন্টারভিউতে আত্মবিশ্বাসের সাথে ইংরেজি বলতে এই শব্দগুলো শিখুন।",
    iconName: "Briefcase",
    words: ["Resilience", "Ambiguous", "Collaborate", "Leverage", "Feasible", "Prioritize"]
  },
  {
    id: "academic",
    title: "Academic & Smart Vocabulary",
    bengaliTitle: "শিক্ষা ও বুদ্ধিদীপ্ত শব্দভাণ্ডার",
    description: "আইইএলটিএস (IELTS), প্রেজেন্টেশন বা যেকোনো স্মার্ট আড্ডায় আপনার ইংরেজির গভীরতা বাড়াতে সহায়ক শব্দমালা।",
    iconName: "GraduationCap",
    words: ["Apathy", "Sustenance", "Aesthetic", "Elaborate", "Cognitive", "Hypothesis"]
  },
  {
    id: "emotions",
    title: "Expressing Emotions & Feelings",
    bengaliTitle: "অনুভূতি প্রকাশের ভাষা",
    description: "রাগ, ক্ষোভ, আনন্দ বা সহমর্মিতা সুন্দর ও চমৎকার ইংরেজি শব্দের মাধ্যমে ফুটিয়ে তোলার কৌশল।",
    iconName: "Heart",
    words: ["Empathy", "Anxious", "Compassion", "Grateful", "Exuberant", "Sullen"]
  }
];

export const CONVERSATION_TEMPLATES = [
  {
    bengali: "আমি আজ খুব ক্লান্ত, কাজ করতে ইচ্ছা করছে না।",
    englishPrompt: "আমি আজ খুব ক্লান্ত, কাজ করতে ইচ্ছা করছে না। - Please translate to natural English and give smart options."
  },
  {
    bengali: "দয়া করে আমাকে একটু বিস্তারিত বলুন, আমি বুঝতে পারছি না।",
    englishPrompt: "দয়া করে আমাকে একটু বিস্তারিত বলুন, আমি বুঝতে পারছি না। - Translate to professional and polite English."
  },
  {
    bengali: "দেরি করার জন্য আমি আন্তরিকভাবে দুঃখিত, রাস্তায় অনেক জ্যাম ছিল।",
    englishPrompt: "দেরি করার জন্য আমি আন্তরিকভাবে দুঃখিত, রাস্তায় অনেক জ্যাম ছিল। - Translate to a smart office excuse in English."
  },
  {
    bengali: "তোমার সাথে কথা বলে খুব ভালো লাগলো, আবার দেখা হবে।",
    englishPrompt: "তোমার সাথে কথা বলে খুব ভালো লাগলো, আবার দেখা হবে। - Show high-quality friendly alternatives in English."
  },
  {
    bengali: "এই শার্টটার দাম কত? আর কি কি কালার আছে?",
    englishPrompt: "এই শার্টটার দাম কত? আর কি কি কালার আছে? - Translate to shopping conversation in English."
  }
];
