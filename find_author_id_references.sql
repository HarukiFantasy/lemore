-- 1. local_tip_post_likes 테이블의 외래키 제약조건 확인
SELECT 
    tc.constraint_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    pg_get_constraintdef(pgc.oid) as constraint_definition
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    JOIN pg_constraint pgc ON pgc.conname = tc.constraint_name
WHERE tc.table_name = 'local_tip_post_likes' AND tc.constraint_type = 'FOREIGN KEY';

-- 2. 모든 제약조건에서 author_id 검색
SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE pg_get_constraintdef(oid) LIKE '%author_id%';

-- 3. 트리거 함수에서 author_id 검색
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_definition LIKE '%author_id%';

-- 4. 모든 뷰에서 author_id 검색
SELECT 
    table_name,
    view_definition
FROM information_schema.views 
WHERE table_schema = 'public' 
AND view_definition LIKE '%author_id%';

-- 5. local_tip_post_likes 테이블 정의 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'local_tip_post_likes' 
AND table_schema = 'public'
ORDER BY ordinal_position; 