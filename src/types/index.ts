// Shared type definitions
// Consolidates types used across multiple components

import type { PersonaId } from '../lib/personas';
import type { AudioType } from '../lib/audioTypes';

/**
 * Language options
 */
export type Language = 'ko' | 'en' | 'zh';

/**
 * Audio configuration
 */
export interface AudioConfig {
  type: AudioType;
  duration: number;
  url: string;
  blob?: Blob;
}

/**
 * Analysis data structure
 */
export interface AnalysisData {
  imageUrl: string;
  imageData?: string;
  script: string;
  audioUrl?: string;
  audioBlob?: Blob;
  persona: PersonaId | string; // string for debate mode like "persona1-vs-persona2"
  timestamp: number;
}

/**
 * Photo analysis result
 */
export interface PhotoAnalysisResult {
  script: string;
  audioUrl: string;
  audioBlob?: Blob;
  persona: PersonaId;
}

/**
 * Debate analysis result
 */
export interface DebateResult {
  script: string;
  audioUrl: string;
  audioBlob?: Blob;
  personas: [PersonaId, PersonaId];
}

/**
 * Shared analysis data for public sharing
 */
export interface SharedAnalysisData {
  id: string;
  image_url: string;
  audio_url: string;
  script: string;
  persona: string;
  created_at: string;
}

/**
 * Guest usage tracking
 */
export interface GuestUsage {
  count: number;
  lastReset: number;
}

/**
 * Persona request status
 */
export type PersonaRequestStatus =
  | 'pending'
  | 'in-review'
  | 'approved'
  | 'rejected';

/**
 * Persona request category
 */
export type PersonaRequestCategory =
  | 'character'
  | 'profession'
  | 'celebrity'
  | 'other';

/**
 * Persona request data
 */
export interface PersonaRequest {
  id: string;
  name: string;
  description: string;
  category: PersonaRequestCategory;
  status: PersonaRequestStatus;
  likes: number;
  created_at: string;
  user_id?: string;
}

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast notification
 */
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

/**
 * Supabase content data for sharing
 */
export interface ContentData {
  image_url: string;
  audio_url: string;
  script: string;
  persona: string;
}

/**
 * Camera dimensions
 */
export interface CameraDimensions {
  width: number;
  height: number;
}

/**
 * Image dimensions
 */
export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Upload progress
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
