-- Create a test user
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'test@example.com',
    crypt('testpassword', gen_salt('bf')),
    now(),
    now(),
    now()
);

-- Check if profile was created
SELECT * FROM profiles WHERE id = '00000000-0000-0000-0000-000000000000';

-- Clean up test user
DELETE FROM profiles WHERE id = '00000000-0000-0000-0000-000000000000';
DELETE FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000000'; 