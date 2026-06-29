export interface ExampleSentence {
  english: string;
  bengali: string;
  howToUse?: string;
  context?: string;
}

export interface BilingualTip {
  english: string;
  bengali: string;
}

export interface WordProfile {
  word: string;
  phonetic: string;
  bengaliMeaning: string;
  englishDefinition: string;
  partOfSpeech: string;
  relatedWords?: string[];
  variations?: string[];
  examples: ExampleSentence[];
  speakingTips: BilingualTip[];
  practicalSpeakingTips: BilingualTip[];
  dailySpeakingTip: BilingualTip;
  difficultyLevel?: string;
}

export interface TranslationAlternative {
  english: string;
  bengaliExplanation: string;
  style: string;
  difficulty: string;
}

export interface VocabularyItem {
  english: string;
  partOfSpeech: string;
  bengaliMeaning: string;
}

export interface TranslationResponse {
  inputSentence: string;
  detectedLanguage: string;
  directTranslation: string;
  alternatives: TranslationAlternative[];
  vocabulary: VocabularyItem[];
  speakingPracticeTip: string;
}

export interface CuratedCategory {
  id: string;
  title: string;
  bengaliTitle: string;
  description: string;
  iconName: string;
  words: string[];
}

export interface EtymologyTimelineStep {
  era: string;
  form: string;
  meaning: string;
}

export interface EtymologyProfile {
  word: string;
  origin: string;
  period: string;
  history: string;
  bengaliExplanation: string;
  timeline: EtymologyTimelineStep[];
  funFact: {
    english: string;
    bengali: string;
  };
}

export interface ContextualScenario {
  title: string;
  description: string;
  englishSentence: string;
  bengaliSentence: string;
  usageTip: string;
}

export interface ContextualUsageProfile {
  word: string;
  scenarios: ContextualScenario[];
}
