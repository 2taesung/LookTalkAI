// Audio configuration constants
// Consolidates all magic numbers related to audio playback and analysis

export const AUDIO_DURATIONS = {
  REACTION_VOICE: 15000,      // 15 seconds for reaction voice playback
  SPEECH_PLAYING: 5000,       // 5 seconds for speech synthesis
  PHOTO_ANALYSIS: 8000,       // 8 seconds for photo analysis audio
  DEBATE_AUDIO: 20000,        // 20 seconds for debate audio
  DEMO_AUDIO: 3000,           // 3 seconds for demo audio
} as const;

export const AUDIO_TYPE_PREFIXES = {
  REACTION_VOICE: 'reaction-voice-playing:',
  SPEECH_PLAYING: 'speech-playing:',
  DEMO_AUDIO: 'data:audio/demo',
  PHOTO_ANALYSIS: 'photo-analysis-audio:',
  DEBATE_AUDIO: 'debate-playing:',
} as const;

export const AUDIO_FORMATS = {
  BLOB: 'blob:',
  WEBM: 'data:audio/webm',
  WAV: 'data:audio/wav',
  MP3: 'audio/mpeg',
} as const;

export const ANALYSIS_LIMITS = {
  FREE_DAILY_COUNT: 20,       // Free analyses per day
  WORD_COUNT_MIN: 100,        // Minimum words in analysis
  WORD_COUNT_MAX: 150,        // Maximum words in analysis
  FILE_SIZE_MAX: 10 * 1024 * 1024,  // 10MB max file size
} as const;

export const DEBATE_CONFIG = {
  ROUNDS: 3,                  // Number of debate rounds
  STEP_DURATION: 2000,        // Duration of each progress step in ms
  SILENCE_DURATION: 800,      // Silence between audio segments in ms
  MIN_WORDS_PER_TURN: 60,     // Minimum words per persona turn
  MAX_WORDS_PER_TURN: 90,     // Maximum words per persona turn
} as const;

export const API_TIMEOUTS = {
  GEMINI_API: 30000,          // 30 seconds for Gemini API
  ELEVENLABS_API: 60000,      // 60 seconds for ElevenLabs API
  SUPABASE_UPLOAD: 120000,    // 2 minutes for file uploads
} as const;

export const RESPONSIVE_BREAKPOINTS = {
  MOBILE: 768,                // Mobile breakpoint in pixels
  TABLET: 1024,               // Tablet breakpoint in pixels
  DESKTOP: 1280,              // Desktop breakpoint in pixels
} as const;

export const CAMERA_DIMENSIONS = {
  MOBILE: {
    WIDTH: 720,
    HEIGHT: 1280,
  },
  DESKTOP: {
    WIDTH: 1920,
    HEIGHT: 1080,
  },
} as const;
