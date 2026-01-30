import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, renderHook, act } from '@testing-library/react';
import { ImageProvider, useImage } from '../ImageContext';

describe('ImageContext', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  describe('ImageProvider', () => {
    it('should render children', () => {
      render(
        <ImageProvider>
          <div>Test Child</div>
        </ImageProvider>
      );

      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should initialize with null when sessionStorage is empty', () => {
      const { result } = renderHook(() => useImage(), {
        wrapper: ImageProvider,
      });

      expect(result.current.uploadedImage).toBeNull();
    });

    it('should initialize with saved image from sessionStorage', () => {
      const testImage = 'data:image/png;base64,test';
      sessionStorage.setItem('looktalkai-uploaded-image', testImage);

      const { result } = renderHook(() => useImage(), {
        wrapper: ImageProvider,
      });

      expect(result.current.uploadedImage).toBe(testImage);
    });

    it('should handle sessionStorage error during initialization', () => {
      const getItemSpy = vi.spyOn(sessionStorage, 'getItem').mockImplementation(() => {
        throw new Error('sessionStorage error');
      });

      const { result } = renderHook(() => useImage(), {
        wrapper: ImageProvider,
      });

      expect(result.current.uploadedImage).toBeNull();
      getItemSpy.mockRestore();
    });

    it('should set uploaded image and save to sessionStorage', () => {
      const { result } = renderHook(() => useImage(), {
        wrapper: ImageProvider,
      });

      const testImage = 'data:image/png;base64,test';

      act(() => {
        result.current.setUploadedImage(testImage);
      });

      expect(result.current.uploadedImage).toBe(testImage);
      expect(sessionStorage.getItem('looktalkai-uploaded-image')).toBe(testImage);
    });

    it('should clear uploaded image and remove from sessionStorage when setting to null', () => {
      const { result } = renderHook(() => useImage(), {
        wrapper: ImageProvider,
      });

      const testImage = 'data:image/png;base64,test';

      act(() => {
        result.current.setUploadedImage(testImage);
      });

      expect(sessionStorage.getItem('looktalkai-uploaded-image')).toBe(testImage);

      act(() => {
        result.current.setUploadedImage(null);
      });

      expect(result.current.uploadedImage).toBeNull();
      expect(sessionStorage.getItem('looktalkai-uploaded-image')).toBeNull();
    });

    it('should handle sessionStorage error during setUploadedImage', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(sessionStorage, 'setItem').mockImplementation(() => {
        throw new Error('sessionStorage error');
      });

      const { result } = renderHook(() => useImage(), {
        wrapper: ImageProvider,
      });

      const testImage = 'data:image/png;base64,test';

      act(() => {
        result.current.setUploadedImage(testImage);
      });

      expect(result.current.uploadedImage).toBe(testImage);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '이미지 저장 실패:',
        expect.any(Error)
      );

      setItemSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should clear uploaded image using clearUploadedImage', () => {
      const { result } = renderHook(() => useImage(), {
        wrapper: ImageProvider,
      });

      const testImage = 'data:image/png;base64,test';

      act(() => {
        result.current.setUploadedImage(testImage);
      });

      expect(result.current.uploadedImage).toBe(testImage);

      act(() => {
        result.current.clearUploadedImage();
      });

      expect(result.current.uploadedImage).toBeNull();
      expect(sessionStorage.getItem('looktalkai-uploaded-image')).toBeNull();
    });
  });

  describe('useImage', () => {
    it('should throw error when used outside ImageProvider', () => {
      expect(() => {
        renderHook(() => useImage());
      }).toThrow('useImage must be used within an ImageProvider');
    });

    it('should return context when used within ImageProvider', () => {
      const { result } = renderHook(() => useImage(), {
        wrapper: ImageProvider,
      });

      expect(result.current).toBeDefined();
      expect(result.current.uploadedImage).toBeDefined();
      expect(result.current.setUploadedImage).toBeInstanceOf(Function);
      expect(result.current.clearUploadedImage).toBeInstanceOf(Function);
    });
  });
});
