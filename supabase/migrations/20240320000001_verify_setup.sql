-- Check if tables exist and their structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('profiles', 'game_history', 'transactions')
ORDER BY table_name, ordinal_position;

-- Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    hasrules,
    hasindexes,
    hastriggers
FROM pg_tables
WHERE tablename IN ('profiles', 'game_history', 'transactions');

-- Check existing policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('profiles', 'game_history', 'transactions')
ORDER BY tablename, policyname;

-- Check if trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'auth.users';

-- Check if function exists
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user'; 