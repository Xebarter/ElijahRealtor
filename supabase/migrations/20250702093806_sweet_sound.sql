/*
  # Create demo admin user

  1. New Users
    - Creates a demo admin user with email 'admin@elijahrealtor.com'
    - Password: 'admin123'
    - Role: admin
  
  2. Security
    - User will be able to authenticate and access admin features
    - Identity record created for email provider
  
  3. Notes
    - Only creates user if it doesn't already exist
    - Uses proper Supabase auth schema structure
*/

-- Create demo admin user only if it doesn't exist
DO $$
DECLARE
    user_uuid uuid;
    existing_user_id uuid;
BEGIN
    -- Check if user already exists
    SELECT id INTO existing_user_id 
    FROM auth.users 
    WHERE email = 'admin@elijahrealtor.com';
    
    -- Only create if user doesn't exist
    IF existing_user_id IS NULL THEN
        -- Generate a new UUID for the user
        user_uuid := gen_random_uuid();
        
        -- Insert the user
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            user_uuid,
            'authenticated',
            'authenticated',
            'admin@elijahrealtor.com',
            crypt('admin123', gen_salt('bf')),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Elijah Admin", "role": "admin"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
        
        -- Insert corresponding identity record with provider_id
        INSERT INTO auth.identities (
            provider_id,
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            'admin@elijahrealtor.com',
            user_uuid,
            format('{"sub": "%s", "email": "%s"}', user_uuid::text, 'admin@elijahrealtor.com')::jsonb,
            'email',
            NOW(),
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Demo admin user created successfully';
    ELSE
        RAISE NOTICE 'Demo admin user already exists, skipping creation';
    END IF;
END $$;