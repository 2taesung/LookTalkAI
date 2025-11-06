// src/lib/supabaseActions.ts

import { supabase } from './supabaseClient';

// DB에 저장할 데이터 타입 정의
interface ContentData {
  image_url: string;
  audio_url: string;
  script: string;
  persona: string; // persona 추가
}

/**
 * 콘텐츠 데이터를 Supabase DB에 저장하고 고유 ID를 반환하는 함수
 */
export async function createShareableContent(data: ContentData): Promise<string> {
  try {
    const { data: insertedData, error } = await supabase
      .from('contents')
      .insert(data) // 전달받은 data 객체를 그대로 사용
      .select('id')
      .single();

    if (error) {
      console.error('Supabase INSERT 상세 오류:', error);
      throw error;
    }

    if (!insertedData) {
      throw new Error("DB에 데이터 저장 후 ID를 받지 못했습니다.");
    }

    if (!insertedData.id) {
      console.error('응답 데이터 구조 오류:', insertedData);
      throw new Error("DB 응답 형식이 올바르지 않습니다. ID 필드가 없습니다.");
    }

    return insertedData.id.toString();

  } catch (error) {
    console.error('createShareableContent 함수 전체 오류:', error);
    throw error;
  }
}