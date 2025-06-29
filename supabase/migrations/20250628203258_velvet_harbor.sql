/*
  # 회원가입 및 인증 시스템 설정 (수정된 버전)

  1. 인증 설정
    - 이메일/비밀번호 회원가입 활성화
    - 이메일 확인 비활성화 (간편 가입)
    
  2. 사용자 프로필 테이블
    - `profiles` 테이블 생성
    - 사용자 기본 정보 저장
    
  3. 보안 정책
    - RLS 활성화
    - 사용자별 데이터 접근 제어
    
  4. 페르소나 요청 권한
    - 로그인한 사용자만 요청 생성 가능
    - 모든 사용자가 요청 조회 가능
*/

-- 기존 정책들 먼저 삭제
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can create persona requests" ON persona_requests;
DROP POLICY IF EXISTS "Anyone can read persona requests" ON persona_requests;
DROP POLICY IF EXISTS "Users can update own requests" ON persona_requests;
DROP POLICY IF EXISTS "Anyone can create persona requests" ON persona_requests;

-- 기존 트리거와 함수 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 사용자 프로필 테이블 생성
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 프로필 정책 생성
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 새 사용자 등록 시 프로필 자동 생성 함수
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 새 사용자 등록 트리거
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 페르소나 요청 테이블에 user_id 컬럼 추가 (이미 존재하면 무시)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'persona_requests' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE persona_requests 
    ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- author 컬럼을 display_name으로 변경 (이미 변경되었으면 무시)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'persona_requests' AND column_name = 'author'
  ) THEN
    ALTER TABLE persona_requests 
    RENAME COLUMN author TO display_name;
  END IF;
END $$;

-- 페르소나 요청 정책 생성
CREATE POLICY "Authenticated users can create persona requests"
  ON persona_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read persona requests"
  ON persona_requests
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update own requests"
  ON persona_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);