// Audio type detection utilities
// Consolidates repeated audio URL type checking logic

import { AUDIO_TYPE_PREFIXES, AUDIO_FORMATS } from '../constants/audioConfig';

export type AudioType =
  | 'reaction-voice'
  | 'speech'
  | 'photo-analysis'
  | 'debate'
  | 'demo'
  | 'recorded'
  | 'real'
  | 'none';

export interface AudioTypeInfo {
  type: AudioType;
  isReactionVoice: boolean;
  isSpeechPlaying: boolean;
  isPhotoAnalysisAudio: boolean;
  isDebateAudio: boolean;
  isDemoAudio: boolean;
  isRecordedAudio: boolean;
  isRealAudio: boolean;
}

/**
 * Detects the type of audio based on the URL
 * @param audioUrl - Audio URL to analyze
 * @returns Object with audio type information
 *
 * @example
 * const info = detectAudioType('reaction-voice-playing:12345');
 * if (info.isReactionVoice) {
 *   // Handle reaction voice
 * }
 */
export function detectAudioType(audioUrl?: string): AudioTypeInfo {
  if (!audioUrl) {
    return {
      type: 'none',
      isReactionVoice: false,
      isSpeechPlaying: false,
      isPhotoAnalysisAudio: false,
      isDebateAudio: false,
      isDemoAudio: false,
      isRecordedAudio: false,
      isRealAudio: false,
    };
  }

  const isReactionVoice = audioUrl.startsWith(AUDIO_TYPE_PREFIXES.REACTION_VOICE);
  const isSpeechPlaying = audioUrl.startsWith(AUDIO_TYPE_PREFIXES.SPEECH_PLAYING);
  const isDemoAudio = audioUrl.startsWith(AUDIO_TYPE_PREFIXES.DEMO_AUDIO);
  const isPhotoAnalysisAudio = audioUrl.startsWith(AUDIO_TYPE_PREFIXES.PHOTO_ANALYSIS);
  const isDebateAudio = audioUrl.startsWith(AUDIO_TYPE_PREFIXES.DEBATE_AUDIO);

  const isRecordedAudio =
    audioUrl.includes(AUDIO_FORMATS.BLOB) ||
    audioUrl.includes(AUDIO_FORMATS.WEBM) ||
    audioUrl.includes(AUDIO_FORMATS.WAV);

  const isRealAudio =
    !isReactionVoice &&
    !isSpeechPlaying &&
    !isDemoAudio &&
    !isPhotoAnalysisAudio &&
    !isDebateAudio;

  let type: AudioType;
  if (isReactionVoice) type = 'reaction-voice';
  else if (isSpeechPlaying) type = 'speech';
  else if (isPhotoAnalysisAudio) type = 'photo-analysis';
  else if (isDebateAudio) type = 'debate';
  else if (isDemoAudio) type = 'demo';
  else if (isRecordedAudio) type = 'recorded';
  else if (isRealAudio) type = 'real';
  else type = 'none';

  return {
    type,
    isReactionVoice,
    isSpeechPlaying,
    isPhotoAnalysisAudio,
    isDebateAudio,
    isDemoAudio,
    isRecordedAudio,
    isRealAudio,
  };
}

/**
 * Gets the duration for a specific audio type
 * @param audioType - Type of audio
 * @returns Duration in milliseconds
 */
export function getAudioDuration(audioType: AudioType): number {
  // Import here to avoid circular dependency
  const { AUDIO_DURATIONS } = require('../constants/audioConfig');

  switch (audioType) {
    case 'reaction-voice':
      return AUDIO_DURATIONS.REACTION_VOICE;
    case 'speech':
      return AUDIO_DURATIONS.SPEECH_PLAYING;
    case 'photo-analysis':
      return AUDIO_DURATIONS.PHOTO_ANALYSIS;
    case 'debate':
      return AUDIO_DURATIONS.DEBATE_AUDIO;
    case 'demo':
      return AUDIO_DURATIONS.DEMO_AUDIO;
    default:
      return 0;
  }
}

/**
 * Gets styling classes based on audio type
 * @param audioType - Type of audio
 * @returns Tailwind CSS classes for styling
 */
export function getAudioTypeStyles(audioType: AudioType): string {
  switch (audioType) {
    case 'reaction-voice':
      return 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200';
    case 'speech':
      return 'bg-blue-50 border-blue-200';
    case 'photo-analysis':
      return 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200';
    case 'debate':
      return 'bg-gradient-to-r from-red-50 to-purple-50 border-red-200';
    case 'demo':
      return 'bg-green-50 border-green-200';
    default:
      return 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200';
  }
}
