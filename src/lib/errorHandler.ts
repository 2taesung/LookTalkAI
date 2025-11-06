// Error handling utilities
// Provides consistent error handling across the application

/**
 * Custom application error class with error codes
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Error codes for different error scenarios
 */
export const ERROR_CODES = {
  // API Errors
  GEMINI_API_ERROR: 'GEMINI_API_ERROR',
  ELEVENLABS_API_ERROR: 'ELEVENLABS_API_ERROR',
  SUPABASE_ERROR: 'SUPABASE_ERROR',

  // Analysis Errors
  PHOTO_ANALYSIS_FAILED: 'PHOTO_ANALYSIS_FAILED',
  DEBATE_ANALYSIS_FAILED: 'DEBATE_ANALYSIS_FAILED',
  AUDIO_SYNTHESIS_FAILED: 'AUDIO_SYNTHESIS_FAILED',

  // Upload Errors
  IMAGE_UPLOAD_FAILED: 'IMAGE_UPLOAD_FAILED',
  AUDIO_UPLOAD_FAILED: 'AUDIO_UPLOAD_FAILED',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',

  // Network Errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',

  // Validation Errors
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Unknown
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * Safely extracts an error message from various error types
 * @param error - Error of unknown type
 * @returns Human-readable error message
 *
 * @example
 * try {
 *   await someAsyncOperation();
 * } catch (error) {
 *   const message = getErrorMessage(error);
 *   console.error(message);
 * }
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return '알 수 없는 오류가 발생했습니다.';
}

/**
 * Gets localized error message based on error code
 * @param code - Error code
 * @param language - Current language
 * @returns Localized error message
 */
export function getLocalizedErrorMessage(
  code: string,
  language: string = 'ko'
): string {
  const messages: Record<string, Record<string, string>> = {
    [ERROR_CODES.GEMINI_API_ERROR]: {
      ko: 'Gemini API 오류가 발생했습니다',
      en: 'Gemini API error occurred',
      zh: 'Gemini API 错误',
    },
    [ERROR_CODES.ELEVENLABS_API_ERROR]: {
      ko: 'ElevenLabs API 오류가 발생했습니다',
      en: 'ElevenLabs API error occurred',
      zh: 'ElevenLabs API 错误',
    },
    [ERROR_CODES.SUPABASE_ERROR]: {
      ko: '데이터베이스 오류가 발생했습니다',
      en: 'Database error occurred',
      zh: '数据库错误',
    },
    [ERROR_CODES.PHOTO_ANALYSIS_FAILED]: {
      ko: '사진 분석에 실패했습니다',
      en: 'Photo analysis failed',
      zh: '照片分析失败',
    },
    [ERROR_CODES.DEBATE_ANALYSIS_FAILED]: {
      ko: '토론 분석에 실패했습니다',
      en: 'Debate analysis failed',
      zh: '辩论分析失败',
    },
    [ERROR_CODES.AUDIO_SYNTHESIS_FAILED]: {
      ko: '음성 합성에 실패했습니다',
      en: 'Audio synthesis failed',
      zh: '语音合成失败',
    },
    [ERROR_CODES.FILE_TOO_LARGE]: {
      ko: '파일 크기가 너무 큽니다',
      en: 'File size is too large',
      zh: '文件太大',
    },
    [ERROR_CODES.INVALID_FILE_TYPE]: {
      ko: '지원하지 않는 파일 형식입니다',
      en: 'Unsupported file type',
      zh: '不支持的文件类型',
    },
    [ERROR_CODES.NETWORK_ERROR]: {
      ko: '네트워크 오류가 발생했습니다',
      en: 'Network error occurred',
      zh: '网络错误',
    },
    [ERROR_CODES.TIMEOUT_ERROR]: {
      ko: '요청 시간이 초과되었습니다',
      en: 'Request timeout',
      zh: '请求超时',
    },
    [ERROR_CODES.UNKNOWN_ERROR]: {
      ko: '알 수 없는 오류가 발생했습니다',
      en: 'Unknown error occurred',
      zh: '未知错误',
    },
  };

  const errorMessages = messages[code];
  if (!errorMessages) {
    return messages[ERROR_CODES.UNKNOWN_ERROR][language] || messages[ERROR_CODES.UNKNOWN_ERROR]['en'];
  }

  return errorMessages[language] || errorMessages['en'];
}

/**
 * Logs error with context information
 * @param error - Error to log
 * @param context - Additional context information
 */
export function logError(error: unknown, context?: Record<string, any>): void {
  const message = getErrorMessage(error);

  console.error('❌ Error:', message);

  if (context) {
    console.error('Context:', context);
  }

  if (error instanceof Error) {
    console.error('Stack:', error.stack);
  }
}

/**
 * Wraps an async function with error handling
 * @param fn - Async function to wrap
 * @param errorCode - Error code to use if function fails
 * @returns Wrapped function
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorCode: string
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      const message = getErrorMessage(error);
      throw new AppError(errorCode, message);
    }
  }) as T;
}
