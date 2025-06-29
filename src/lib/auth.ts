import { supabase } from './supabaseClient'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  displayName: string
  avatarUrl?: string
}

export interface SignUpData {
  email: string
  password: string
  displayName: string
}

export interface SignInData {
  email: string
  password: string
}

// 회원가입
export async function signUp(data: SignUpData): Promise<{ user: User | null; error: string | null }> {
  try {
    console.log('회원가입 시작:', { email: data.email, displayName: data.displayName });
    
    // 현재 도메인을 기반으로 redirectTo URL 설정
    const redirectTo = `${window.location.origin}/auth/callback`
    
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          display_name: data.displayName
        },
        emailRedirectTo: redirectTo
      }
    })

    console.log('회원가입 응답:', { authData, error });

    if (error) {
      console.error('회원가입 에러:', error);
      return { user: null, error: error.message }
    }

    return { user: authData.user, error: null }
  } catch (error) {
    console.error('회원가입 예외:', error);
    return { user: null, error: error instanceof Error ? error.message : '회원가입 실패' }
  }
}

// 로그인
export async function signIn(data: SignInData): Promise<{ user: User | null; error: string | null }> {
  try {
    console.log('로그인 시작:', { email: data.email });
    
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    })

    console.log('로그인 응답:', { authData, error });

    if (error) {
      console.error('로그인 에러:', error);
      return { user: null, error: error.message }
    }

    return { user: authData.user, error: null }
  } catch (error) {
    console.error('로그인 예외:', error);
    return { user: null, error: error instanceof Error ? error.message : '로그인 실패' }
  }
}

// 로그아웃
export async function signOut(): Promise<{ error: string | null }> {
  try {
    console.log('로그아웃 시작');
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('로그아웃 에러:', error);
    } else {
      console.log('로그아웃 성공');
    }
    
    return { error: error ? error.message : null }
  } catch (error) {
    console.error('로그아웃 예외:', error);
    return { error: error instanceof Error ? error.message : '로그아웃 실패' }
  }
}

// 현재 사용자 정보 가져오기
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    console.log('현재 사용자 정보 조회 시작');
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      // Check if this is the expected "Auth session missing!" error for unauthenticated users
      if (error.message === 'Auth session missing!') {
        console.info('사용자 정보 조회:', error.message);
      } else {
        console.error('사용자 정보 조회 에러:', error);
      }
      return null;
    }
    
    if (!user) {
      console.log('로그인된 사용자 없음');
      return null;
    }

    console.log('사용자 정보 조회 성공:', user);

    // 프로필 정보 조회 시도
    let profile = null;
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.warn('프로필 정보 조회 실패:', profileError);
        // 프로필이 없으면 생성 시도
        if (profileError.code === 'PGRST116') { // No rows returned
          console.log('프로필이 없음, 생성 시도...');
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || '',
              avatar_url: user.user_metadata?.avatar_url
            });
          
          if (insertError) {
            console.error('프로필 생성 실패:', insertError);
          } else {
            console.log('프로필 생성 성공');
            profile = {
              display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || '',
              avatar_url: user.user_metadata?.avatar_url
            };
          }
        }
      } else {
        profile = profileData;
      }
    } catch (profileError) {
      console.warn('프로필 처리 중 오류:', profileError);
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email || '',
      displayName: profile?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0] || '',
      avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url
    };

    console.log('최종 사용자 정보:', authUser);
    return authUser;
  } catch (error) {
    console.error('사용자 정보 조회 예외:', error);
    return null
  }
}

// 인증 상태 변화 감지
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  console.log('인증 상태 변화 감지 시작');
  
  return supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('인증 상태 변화:', { event, session: !!session });
    
    if (session?.user) {
      console.log('세션 사용자 존재, 사용자 정보 조회 중...');
      // 약간의 지연을 두어 DB 동기화 대기
      setTimeout(async () => {
        const user = await getCurrentUser()
        callback(user)
      }, 500);
    } else {
      console.log('세션 없음, null 반환');
      callback(null)
    }
  })
}

// 사용자 프로필 업데이트
export async function updateProfile(updates: Partial<Pick<AuthUser, 'displayName' | 'avatarUrl'>>): Promise<{ error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: '로그인이 필요합니다' }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: updates.displayName,
        avatar_url: updates.avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    return { error: error ? error.message : null }
  } catch (error) {
    return { error: error instanceof Error ? error.message : '프로필 업데이트 실패' }
  }
}

// 이메일 재전송
export async function resendConfirmation(email: string): Promise<{ error: string | null }> {
  try {
    const redirectTo = `${window.location.origin}/auth/callback`
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: redirectTo
      }
    })

    return { error: error ? error.message : null }
  } catch (error) {
    return { error: error instanceof Error ? error.message : '이메일 재전송 실패' }
  }
}