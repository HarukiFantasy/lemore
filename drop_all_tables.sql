-- 모든 public 테이블 삭제 스크립트
-- 주의: 이 스크립트는 모든 데이터를 영구적으로 삭제합니다!

-- CASCADE 옵션으로 모든 의존성도 함께 삭제
DROP SCHEMA public CASCADE;

CREATE SCHEMA public;

-- 기본 권한 복원
GRANT ALL ON SCHEMA public TO postgres;

GRANT ALL ON SCHEMA public TO public;

-- 또는 개별 테이블 삭제 (더 안전한 방법)
-- 아래 쿼리로 모든 테이블 목록 확인 후 개별 삭제 가능

-- 모든 테이블 목록 조회
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- 개별 테이블 삭제 예시:
-- DROP TABLE IF EXISTS give_and_glow_reviews CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS local_tip_posts CASCADE;
-- DROP TABLE IF EXISTS local_tip_comments CASCADE;
-- DROP TABLE IF EXISTS user_messages CASCADE;
-- DROP TABLE IF EXISTS user_conversations CASCADE;
-- DROP TABLE IF EXISTS product_likes CASCADE;
-- DROP TABLE IF EXISTS product_views CASCADE;
-- DROP TABLE IF EXISTS user_notifications CASCADE;
-- DROP TABLE IF EXISTS let_go_buddy_sessions CASCADE;
-- DROP TABLE IF EXISTS item_analyses CASCADE;
-- DROP TABLE IF EXISTS local_businesses CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS message_participants CASCADE;
-- DROP TABLE IF EXISTS product_images CASCADE;
-- DROP TABLE IF EXISTS user_reviews CASCADE;