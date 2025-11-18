// src/lib/supabaseActions.ts

import { supabase } from './supabaseClient';
import { getCurrentUser } from './auth';

// DB에 저장할 데이터 타입 정의
interface ContentData {
  image_url: string;
  audio_url: string;
  script: string;
  persona: string;
  user_id?: string; // 선택적 사용자 ID
}

/**
 * 콘텐츠 데이터를 Supabase DB에 저장하고 고유 ID를 반환하는 함수
 */
export async function createShareableContent(data: Omit<ContentData, 'user_id'>): Promise<string> {
  try {
    console.log('💾 Supabase에 공유 데이터 저장 시작...');
    
    // 현재 로그인된 사용자 확인 (선택적)
    let currentUser = null;
    try {
      currentUser = await getCurrentUser();
    } catch (error) {
      // 로그인하지 않은 사용자는 무시
      console.log('게스트 사용자로 콘텐츠 생성');
    }

    // 저장할 데이터 준비
    const contentData: ContentData = {
      ...data,
      ...(currentUser && { user_id: currentUser.id }) // 로그인한 사용자만 user_id 추가
    };

    console.log('저장할 데이터:', {
      image_url: contentData.image_url ? contentData.image_url.substring(0, 50) + '...' : 'undefined',
      audio_url: contentData.audio_url ? contentData.audio_url.substring(0, 50) + '...' : 'undefined',
      script_length: contentData.script ? contentData.script.length : 0,
      persona: contentData.persona,
      user_id: contentData.user_id ? 'logged_in_user' : 'guest_user'
    });

    // 데이터 유효성 검사
    if (!contentData.image_url) {
      throw new Error('이미지 URL이 없습니다');
    }
    
    if (!contentData.audio_url) {
      throw new Error('오디오 URL이 없습니다');
    }
    
    if (!contentData.script || contentData.script.length < 10) {
      throw new Error('스크립트가 너무 짧거나 없습니다');
    }

    const { data: insertedData, error } = await supabase
      .from('contents')
      .insert(contentData)
      .select('id')
      .single();

    if (error) {
      console.error('Supabase INSERT 상세 오류:', error);
      throw error;
    }

    if (!insertedData) {
      throw new Error("DB에 데이터 저장 후 ID를 받지 못했습니다.");
    }

    console.log('✅ Supabase 데이터 저장 성공! ID:', insertedData.id);
    return insertedData.id.toString();

  } catch (error) {
    console.error('createShareableContent 함수 전체 오류:', error);
    throw error;
  }
}

/**
 * 사용자의 콘텐츠 목록 조회 (로그인한 사용자용)
 */
export async function getUserContents(limit: number = 20): Promise<any[]> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return [];
    }

    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('사용자 콘텐츠 조회 실패:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('getUserContents 오류:', error);
    return [];
  }
}