import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ImageContextType {
  uploadedImage: string | null;
  setUploadedImage: (image: string | null) => void;
  clearUploadedImage: () => void;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export function ImageProvider({ children }: { children: ReactNode }) {
  const [uploadedImage, setUploadedImageState] = useState<string | null>(() => {
    // 페이지 새로고침 시에도 이미지 유지 (sessionStorage 사용)
    try {
      const saved = sessionStorage.getItem('looktalkai-uploaded-image');
      return saved || null;
    } catch {
      return null;
    }
  });

  const setUploadedImage = (image: string | null) => {
    setUploadedImageState(image);
    try {
      if (image) {
        sessionStorage.setItem('looktalkai-uploaded-image', image);
      } else {
        sessionStorage.removeItem('looktalkai-uploaded-image');
      }
    } catch (error) {
      console.warn('이미지 저장 실패:', error);
    }
  };

  const clearUploadedImage = () => {
    setUploadedImage(null);
  };

  return (
    <ImageContext.Provider value={{
      uploadedImage,
      setUploadedImage,
      clearUploadedImage
    }}>
      {children}
    </ImageContext.Provider>
  );
}

export function useImage() {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error('useImage must be used within an ImageProvider');
  }
  return context;
}