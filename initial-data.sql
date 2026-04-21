-- ========================================
-- Initial Data for Lift Master System
-- ========================================

-- Add admin user (password: admin123)
INSERT INTO users (username, password_hash, name, role, email) VALUES 
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5e', 'Admin User', 'admin', 'admin@liftmaster.com');

-- Add spare parts categories
INSERT INTO spare_parts_categories (name, description) VALUES 
('Electrical', 'Electrical and electronic components'),
('Motors', 'Elevator motors and auxiliary motors'),
('Structure', 'Doors, frames and structural components'),
('Control', 'Control panels and operating systems'),
('Cables', 'Cables and wiring'),
('Safety', 'Safety and emergency systems');

-- Add sample employees
INSERT INTO employees (name, role, base_salary, phone, join_date) VALUES 
('Ahmed Mohamed', 'Installation Technician', 4500, '0501234567', '2022-01-15'),
('Khaled Al Ali', 'Maintenance Technician', 4800, '0502345678', '2022-03-20'),
('Mohamed Hassan', 'Engineer', 8500, '0503456789', '2021-06-10');

-- Add sample clients
INSERT INTO clients (name, phone, email, address) VALUES 
('Al-Amal Real Estate', '0112345678', 'info@alamal.com', 'Riyadh, Olaya District'),
('Nabha Medical Complex', '0113456789', 'contact@nabha.com', 'Jeddah, Rawda District');

-- Add sample buildings
INSERT INTO buildings (client_id, name, address, type, floors_count) VALUES 
(1, 'Al-Amal Tower 1', 'Riyadh, Olaya, King Abdulaziz Street', 'Residential', 15),
(2, 'Nabha Clinics', 'Jeddah, Rawda, Palestine Street', 'Medical', 4);

-- Add sample elevators
INSERT INTO elevators (building_id, model, capacity, floors, install_date, status) VALUES 
(1, 'KONE MonoSpace', 8, 15, '2023-06-15', 'active'),
(2, 'Otis Gen2', 6, 4, '2022-12-10', 'active');

-- Add sample spare parts
INSERT INTO spare_parts (name, category_id, wholesale_price, retail_price, quantity, min_stock, supplier) VALUES 
('Electrical Cable 10mm', 1, 35, 45, 150, 20, 'Electrical Company'),
('Elevator Motor 5HP', 2, 2800, 3500, 12, 3, 'Global Elevators'),
('Emergency Battery 12V', 1, 220, 280, 45, 10, 'Top Batteries');

-- Add sample jobs
INSERT INTO jobs (type, client_id, building_id, description, cost, date, status, payment_status) VALUES 
('installation', 1, 1, 'Install 2 elevators in Al-Amal Tower 1', 85000, '2023-05-10', 'completed', 'paid'),
('maintenance', 2, 2, 'Regular maintenance for Nabha Clinics', 8500, '2024-01-15', 'pending', 'unpaid');

-- Add sample transactions
INSERT INTO transactions (type, job_id, client_id, amount, date, description) VALUES 
('income', 1, 1, 85000, '2023-06-20', 'Final payment - Al-Amal Tower 1'),
('expense', NULL, NULL, 32000, '2024-01-05', 'Purchase elevator motors');

-- Add sample maintenance records
INSERT INTO maintenance_records (elevator_id, description, date, cost) VALUES 
(1, 'Quarterly maintenance check', '2024-01-10', 1200),
(2, 'Emergency repair - door mechanism', '2024-01-08', 800);

-- Update building elevators count (should be handled by trigger, but let's ensure it's correct)
UPDATE buildings SET elevators_count = (
    SELECT COUNT(*) FROM elevators WHERE elevators.building_id = buildings.id
);

-- Verify data insertion
SELECT 'Users: ' || COUNT(*) FROM users
UNION ALL
SELECT 'Employees: ' || COUNT(*) FROM employees
UNION ALL
SELECT 'Clients: ' || COUNT(*) FROM clients
UNION ALL
SELECT 'Buildings: ' || COUNT(*) FROM buildings
UNION ALL
SELECT 'Elevators: ' || COUNT(*) FROM elevators
UNION ALL
SELECT 'Jobs: ' || COUNT(*) FROM jobs
UNION ALL
SELECT 'Transactions: ' || COUNT(*) FROM transactions;
