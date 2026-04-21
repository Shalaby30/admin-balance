-- Update admin user with new email and simple password
UPDATE users 
SET 
  email = 'sayedifbb2@gmail.com',
  password_hash = 'admin123',
  name = 'Sayed Admin',
  is_active = true,
  updated_at = NOW()
WHERE username = 'admin';

-- Or insert new user if admin doesn't exist
INSERT INTO users (username, password_hash, name, email, role, is_active, created_at, updated_at) 
SELECT 
  'sayedifbb2@gmail.com',
  'admin123',
  'Sayed Admin',
  'sayedifbb2@gmail.com',
  'admin',
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'sayedifbb2@gmail.com');

-- Check users
SELECT * FROM users;
