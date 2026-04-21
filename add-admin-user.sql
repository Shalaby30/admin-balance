-- Add admin user to users table
INSERT INTO users (id, username, password, role, is_active, created_at, updated_at) 
VALUES (
  1, 
  'admin', 
  'admin123', 
  'admin', 
  true, 
  NOW(), 
  NOW()
);

-- Check if user was added successfully
SELECT * FROM users WHERE username = 'admin';
