/*
  # 페르소나 요청 게시판 실제 데이터 업데이트

  1. 기존 샘플 데이터 삭제
  2. 실제 상태에 맞는 새로운 샘플 데이터 추가
  3. 기본 상태를 '검토 대기'로 설정
  4. 구현된 페르소나는 실제 존재하는 페르소나로 설정
*/

-- 기존 샘플 데이터 삭제
DELETE FROM persona_requests;
DELETE FROM persona_request_likes;

-- 새로운 샘플 데이터 삽입 (다양한 상태로)
INSERT INTO persona_requests (title, description, display_name, category, status, likes_count, created_at) VALUES
-- 구현됨 (실제 페르소나 중 하나)
('따뜻한 심리학자', '사진을 보고 감정과 내면의 상태를 공감적으로 해석해주는 따뜻한 심리학자 페르소나입니다. 표정, 분위기, 말하지 않은 감정들을 부드럽게 읽어주고 따뜻하고 이해심 있는 톤으로 분석해줍니다.', '감정분석러버', 'character', 'implemented', 156, now() - interval '15 days'),

-- 승인됨
('로맨틱한 시인', '사진을 보고 아름다운 시를 지어주는 로맨틱한 시인 페르소나가 있으면 좋겠어요. 감성적이고 서정적인 언어로 사진의 감정과 분위기를 시로 표현해주는 페르소나입니다.', '시인의마음', 'character', 'approved', 89, now() - interval '8 days'),

('요리 전문가 셰프', '음식 사진을 보고 레시피나 요리 팁을 알려주는 전문 셰프 페르소나를 추가해주세요. 재료 분석부터 조리법, 플레이팅 팁까지 전문적인 요리 조언을 해주면 좋겠습니다.', '요리왕김셰프', 'profession', 'approved', 72, now() - interval '12 days'),

-- 검토 중
('운동 코치', '운동하는 사진이나 몸매 사진을 보고 운동 조언을 해주는 피트니스 코치 페르소나가 필요해요! 자세 교정부터 운동 계획까지 전문적인 조언을 해주면 좋겠습니다.', '헬스매니아', 'profession', 'in-review', 45, now() - interval '5 days'),

('철학자', '사진을 보고 깊이 있는 철학적 사색을 해주는 현명한 철학자 페르소나를 원합니다. 일상의 순간에서 삶의 의미를 찾아주는 깊이 있는 해석을 해주면 좋겠어요.', '사색가', 'character', 'in-review', 38, now() - interval '3 days'),

-- 검토 대기 (기본 상태)
('패션 스타일리스트', '옷차림이나 스타일링 사진을 보고 패션 조언을 해주는 스타일리스트 페르소나가 있으면 좋겠어요. 색상 매칭부터 스타일 개선 팁까지 전문적인 패션 조언을 해주세요.', '패션피플', 'profession', 'pending', 23, now() - interval '2 days'),

('귀여운 아기', '아기처럼 순수하고 귀여운 말투로 사진을 해석해주는 페르소나가 있으면 재미있을 것 같아요! 모든 것을 신기해하고 순수한 시각으로 바라보는 아기의 관점이면 좋겠어요.', '귀요미맘', 'personality', 'pending', 67, now() - interval '1 day'),

('여행 가이드', '여행지나 풍경 사진을 보고 그 장소에 대한 정보와 여행 팁을 알려주는 여행 가이드 페르소나를 추가해주세요. 숨겨진 명소나 현지 문화까지 알려주면 좋겠어요.', '세계여행러', 'profession', 'pending', 31, now() - interval '6 hours'),

('동물 행동학자', '반려동물 사진을 보고 동물의 행동과 심리를 분석해주는 동물 행동학자 페르소나가 있으면 좋겠어요. 우리 강아지나 고양이가 무슨 생각을 하는지 알고 싶어요!', '펫러버', 'profession', 'pending', 19, now() - interval '3 hours'),

('음악 평론가', '콘서트나 음악 관련 사진을 보고 음악적 해석을 해주는 음악 평론가 페르소나를 원합니다. 장르 분석부터 감정적 해석까지 음악적 관점에서 분석해주세요.', '음악매니아', 'character', 'pending', 14, now() - interval '1 hour');

-- 좋아요 데이터도 일부 추가 (실제 사용자 지문 시뮬레이션)
INSERT INTO persona_request_likes (request_id, user_fingerprint) 
SELECT id, 'user_' || (random() * 1000)::int 
FROM persona_requests 
WHERE likes_count > 0
LIMIT 50;