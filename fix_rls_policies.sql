-- 1. 기존 잘못된 RLS 정책들 삭제
DROP POLICY IF EXISTS "local_tip_post_likes_select_policy" ON local_tip_post_likes;
DROP POLICY IF EXISTS "local_tip_post_likes_insert_policy" ON local_tip_post_likes;
DROP POLICY IF EXISTS "local_tip_post_likes_delete_policy" ON local_tip_post_likes;

-- 2. 올바른 RLS 정책들 재생성
-- SELECT 정책: 모든 사람이 좋아요 목록을 볼 수 있음
CREATE POLICY "local_tip_post_likes_select_policy" ON local_tip_post_likes
FOR SELECT TO public
USING (true);

-- INSERT 정책: 로그인한 사용자만 자신의 좋아요를 추가할 수 있음
CREATE POLICY "local_tip_post_likes_insert_policy" ON local_tip_post_likes
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- DELETE 정책: 로그인한 사용자만 자신의 좋아요를 삭제할 수 있음
CREATE POLICY "local_tip_post_likes_delete_policy" ON local_tip_post_likes
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- 3. RLS가 활성화되어 있는지 확인
ALTER TABLE local_tip_post_likes ENABLE ROW LEVEL SECURITY;

-- 4. 현재 정책 상태 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'local_tip_post_likes'; 