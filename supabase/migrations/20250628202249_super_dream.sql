/*
  # 페르소나 요청 게시판 테이블 생성

  1. 새 테이블
    - `persona_requests` - 페르소나 요청 저장
    - `persona_request_likes` - 좋아요 기록 (중복 방지)
    
  2. 보안
    - RLS 활성화
    - 공개 읽기/쓰기 정책 추가
    - 좋아요 중복 방지 정책
*/

-- 페르소나 요청 테이블
CREATE TABLE IF NOT EXISTS persona_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  author text NOT NULL,
  category text NOT NULL CHECK (category IN ('character', 'profession', 'personality', 'other')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-review', 'approved', 'implemented')),
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 좋아요 기록 테이블 (중복 방지용)
CREATE TABLE IF NOT EXISTS persona_request_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES persona_requests(id) ON DELETE CASCADE,
  user_fingerprint text NOT NULL, -- 브라우저 지문 또는 IP 기반 식별
  created_at timestamptz DEFAULT now(),
  UNIQUE(request_id, user_fingerprint) -- 같은 요청에 같은 사용자가 중복 좋아요 방지
);

-- RLS 활성화
ALTER TABLE persona_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_request_likes ENABLE ROW LEVEL SECURITY;

-- 페르소나 요청 정책
CREATE POLICY "Anyone can read persona requests"
  ON persona_requests
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create persona requests"
  ON persona_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 좋아요 정책
CREATE POLICY "Anyone can read likes"
  ON persona_request_likes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create likes"
  ON persona_request_likes
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 좋아요 수 업데이트 함수
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE persona_requests 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.request_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE persona_requests 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.request_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_likes_count_trigger
  AFTER INSERT OR DELETE ON persona_request_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_likes_count();

-- 샘플 데이터 삽입
INSERT INTO persona_requests (title, description, author, category, status, likes_count) VALUES
('로맨틱한 시인', '사진을 보고 아름다운 시를 지어주는 로맨틱한 시인 페르소나가 있으면 좋겠어요. 감성적이고 서정적인 언어로 사진의 감정을 표현해주는...', '감성러버', 'character', 'pending', 24),
('요리 전문가 셰프', '음식 사진을 보고 레시피나 요리 팁을 알려주는 전문 셰프 페르소나를 추가해주세요. 재료 분석부터 조리법까지...', '요리왕', 'profession', 'in-review', 18),
('운동 코치', '운동하는 사진이나 몸매 사진을 보고 운동 조언을 해주는 피트니스 코치 페르소나가 필요해요!', '헬스매니아', 'profession', 'approved', 31),
('귀여운 아기', '아기처럼 순수하고 귀여운 말투로 사진을 해석해주는 페르소나가 있으면 재미있을 것 같아요!', '귀요미', 'personality', 'implemented', 42),
('철학자', '사진을 보고 깊이 있는 철학적 사색을 해주는 현명한 철학자 페르소나를 원합니다.', '사색가', 'character', 'pending', 15);