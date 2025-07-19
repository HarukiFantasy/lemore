-- 1. local_tip_post_likes 테이블의 실제 구조 확인
\d local_tip_post_likes;

-- 2. local_tip_posts 테이블의 실제 구조 확인
\d local_tip_posts;

-- 3. 실제 RLS 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'local_tip_post_likes';

-- 4. author_id를 참조하는 정책이나 제약조건 찾기
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE confrelid = (SELECT oid FROM pg_class WHERE relname = 'local_tip_post_likes')
   OR conrelid = (SELECT oid FROM pg_class WHERE relname = 'local_tip_post_likes');

-- 5. 모든 정책에서 author_id 검색
SELECT schemaname, tablename, policyname, qual, with_check
FROM pg_policies 
WHERE qual LIKE '%author_id%' OR with_check LIKE '%author_id%';

-- 6. 트리거 확인
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'local_tip_post_likes';

-- 7. 함수 정의에서 author_id 검색
SELECT routine_name, routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_definition LIKE '%author_id%';

-- 8. 간단한 테스트 쿼리
SELECT post_id, user_id, created_at 
FROM local_tip_post_likes 
LIMIT 5; 