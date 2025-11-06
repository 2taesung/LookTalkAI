import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createShareableContent } from './supabaseActions';

// Mock the Supabase client
vi.mock('./supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}));

describe('createShareableContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully create shareable content and return ID', async () => {
    const { supabase } = await import('./supabaseClient');
    const mockData = { id: '123e4567-e89b-12d3-a456-426614174000' };

    // Mock successful insertion
    const singleMock = vi.fn().mockResolvedValue({
      data: mockData,
      error: null
    });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const insertMock = vi.fn().mockReturnValue({ select: selectMock });
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock });

    (supabase.from as any) = fromMock;

    const contentData = {
      image_url: 'https://example.com/image.png',
      audio_url: 'https://example.com/audio.mp3',
      script: 'Test script content',
      persona: 'witty-entertainer'
    };

    const result = await createShareableContent(contentData);

    expect(result).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(fromMock).toHaveBeenCalledWith('contents');
    expect(insertMock).toHaveBeenCalledWith(contentData);
  });

  it('should throw error when Supabase returns an error', async () => {
    const { supabase } = await import('./supabaseClient');
    const mockError = new Error('Database error');

    const singleMock = vi.fn().mockResolvedValue({
      data: null,
      error: mockError
    });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const insertMock = vi.fn().mockReturnValue({ select: selectMock });
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock });

    (supabase.from as any) = fromMock;

    const contentData = {
      image_url: 'https://example.com/image.png',
      audio_url: 'https://example.com/audio.mp3',
      script: 'Test script',
      persona: 'art-critic'
    };

    await expect(createShareableContent(contentData)).rejects.toThrow();
  });

  it('should throw error when no data is returned', async () => {
    const { supabase } = await import('./supabaseClient');

    const singleMock = vi.fn().mockResolvedValue({
      data: null,
      error: null
    });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const insertMock = vi.fn().mockReturnValue({ select: selectMock });
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock });

    (supabase.from as any) = fromMock;

    const contentData = {
      image_url: 'https://example.com/image.png',
      audio_url: 'https://example.com/audio.mp3',
      script: 'Test',
      persona: 'warm-psychologist'
    };

    await expect(createShareableContent(contentData)).rejects.toThrow(
      'DB에 데이터 저장 후 ID를 받지 못했습니다.'
    );
  });

  it('should throw error when data is returned but ID is missing', async () => {
    const { supabase } = await import('./supabaseClient');

    // Return data without id field
    const singleMock = vi.fn().mockResolvedValue({
      data: { some_field: 'value' },
      error: null
    });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const insertMock = vi.fn().mockReturnValue({ select: selectMock });
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock });

    (supabase.from as any) = fromMock;

    const contentData = {
      image_url: 'https://example.com/image.png',
      audio_url: 'https://example.com/audio.mp3',
      script: 'Test',
      persona: 'noir-detective'
    };

    await expect(createShareableContent(contentData)).rejects.toThrow(
      'DB 응답 형식이 올바르지 않습니다. ID 필드가 없습니다.'
    );
  });

  it('should handle different persona types', async () => {
    const { supabase } = await import('./supabaseClient');
    const mockData = { id: 'test-id-123' };

    const singleMock = vi.fn().mockResolvedValue({
      data: mockData,
      error: null
    });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const insertMock = vi.fn().mockReturnValue({ select: selectMock });
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock });

    (supabase.from as any) = fromMock;

    const personas = [
      'witty-entertainer',
      'art-critic',
      'warm-psychologist',
      'witty-entertainer-vs-art-critic'
    ];

    for (const persona of personas) {
      const contentData = {
        image_url: 'https://example.com/image.png',
        audio_url: 'https://example.com/audio.mp3',
        script: 'Test script',
        persona
      };

      const result = await createShareableContent(contentData);
      expect(result).toBe('test-id-123');
    }
  });
});
