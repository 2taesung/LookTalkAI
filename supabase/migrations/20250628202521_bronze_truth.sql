/*
  # 회원가입 및 인증 시스템 설정

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

-- 프로필 정책
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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 페르소나 요청 테이블 수정 (작성자를 사용자 ID로 변경)
ALTER TABLE persona_requests 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 기존 author 컬럼을 display_name으로 변경
ALTER TABLE persona_requests 
RENAME COLUMN author TO display_name;

-- 페르소나 요청 정책 업데이트
DROP POLICY IF EXISTS "Anyone can create persona requests" ON persona_requests;
DROP POLICY IF EXISTS "Anyone can read persona requests" ON persona_requests;

-- 로그인한 사용자만 요청 생성 가능
CREATE POLICY "Authenticated users can create persona requests"
  ON persona_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 모든 사용자가 요청 조회 가능
CREATE POLICY "Anyone can read persona requests"
  ON persona_requests
  FOR SELECT
  TO public
  USING (true);

-- 작성자만 자신의 요청 수정 가능
CREATE POLICY "Users can update own requests"
  ON persona_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);