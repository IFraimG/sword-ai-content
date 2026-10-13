/**
 * Types for LLaVA 1.5 7B Atmosphere Vision Chat Feature
 */
export interface AtmosphereScores {
  ambient: number;
  dreamcore: number;
  coldcore: number;
}

export interface AtmosphereDetails {
  primaryMood: string;
  visualAesthetic: string;
  soundscapeMatch: string;
  bestFor: string;
  scores?: AtmosphereScores;
}

export interface AtmosphereChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  atmosphere?: AtmosphereDetails | null;
  suggestedFollowUps?: string[];
  isTyping?: boolean;
}

export interface AtmosphereAnalysisResponse {
  model: string;
  prompt: string;
  reply: string;
  atmosphere?: AtmosphereDetails | null;
  suggestedFollowUps?: string[];
  error?: string;
}

export interface QuickPromptOption {
  id: string;
  label: string;
  prompt: string;
  icon: string;
  category: 'mood' | 'style' | 'sound' | 'usage';
}
