-- 1. 현재 local_tip_post_likes 테이블의 제약조건 확인
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'local_tip_post_likes';

-- 2. 잘못된 외래키 제약조건들 삭제 (이름은 실제 확인 후 수정 필요)
-- 일반적인 이름들로 시도
ALTER TABLE local_tip_post_likes DROP CONSTRAINT IF EXISTS local_tip_post_likes_user_id_fkey;
ALTER TABLE local_tip_post_likes DROP CONSTRAINT IF EXISTS local_tip_post_likes_post_id_fkey;
ALTER TABLE local_tip_post_likes DROP CONSTRAINT IF EXISTS local_tip_post_likes_author_id_fkey;

-- 3. 올바른 외래키 제약조건 다시 생성
ALTER TABLE local_tip_post_likes 
ADD CONSTRAINT local_tip_post_likes_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES local_tip_posts(id) ON DELETE CASCADE;

ALTER TABLE local_tip_post_likes 
ADD CONSTRAINT local_tip_post_likes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(profile_id) ON DELETE CASCADE;

-- 4. 제약조건이 올바르게 생성되었는지 확인
SELECT 
    tc.constraint_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'local_tip_post_likes' AND tc.constraint_type = 'FOREIGN KEY'; 