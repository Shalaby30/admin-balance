-- ========================================
-- Lift Master - Elevator Management System
-- Supabase Database Schema
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- Users Table
-- ========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'employee')),
    email VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- Employees Table
-- ========================================
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL, -- فني تركيب، فني صيانة، مهندس، مشرف
    base_salary DECIMAL(10,2) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    join_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- Salary Adjustments Table
-- ========================================
CREATE TABLE salary_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL, -- YYYY-MM format
    type VARCHAR(20) NOT NULL CHECK (type IN ('bonus', 'deduction')),
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- ========================================
-- Clients Table
-- ========================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    contact_person VARCHAR(100),
    tax_number VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- Buildings Table
-- ========================================
CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- سكني، تجاري، طبي، فندقي، تعليمي
    floors_count INTEGER,
    elevators_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- Elevators Table
-- ========================================
CREATE TABLE elevators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    model VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL, -- عدد الأشخاص
    floors INTEGER NOT NULL,
    install_date DATE,
    last_maintenance DATE,
    next_maintenance DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'out_of_service')),
    serial_number VARCHAR(50),
    warranty_expiry DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- Spare Parts Categories
-- ========================================
CREATE TABLE spare_parts_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- Spare Parts Table
-- ========================================
CREATE TABLE spare_parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    category_id UUID REFERENCES spare_parts_categories(id),
    wholesale_price DECIMAL(10,2) NOT NULL,
    retail_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 1,
    supplier VARCHAR(100),
    part_number VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- Jobs Table
-- ========================================
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('installation', 'maintenance', 'repair', 'modernization')),
    client_id UUID NOT NULL REFERENCES clients(id),
    building_id UUID NOT NULL REFERENCES buildings(id),
    elevator_id UUID REFERENCES elevators(id),
    description TEXT NOT NULL,
    cost DECIMAL(12,2) NOT NULL,
    date DATE NOT NULL,
    completion_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- ========================================
-- Job Employees Assignment
-- ========================================
CREATE TABLE job_employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    role VARCHAR(50), -- دور الموظف في العمل
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, employee_id)
);

-- ========================================
-- Transactions Table
-- ========================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    job_id UUID REFERENCES jobs(id),
    client_id UUID REFERENCES clients(id),
    amount DECIMAL(12,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50), -- تصنيف المعاملة
    payment_method VARCHAR(50), -- طريقة الدفع
    reference_number VARCHAR(100), -- رقم المرجع
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- ========================================
-- Inventory Transactions
-- ========================================
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    spare_part_id UUID NOT NULL REFERENCES spare_parts(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('in', 'out')),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(12,2),
    reason TEXT,
    job_id UUID REFERENCES jobs(id),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- ========================================
-- Maintenance Records
-- ========================================
CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    elevator_id UUID NOT NULL REFERENCES elevators(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id),
    type VARCHAR(50) NOT NULL, -- دورية، طارئة، وقائية
    description TEXT,
    parts_used TEXT[], -- قطع الغيار المستخدمة
    next_maintenance_date DATE,
    technician_notes TEXT,
    client_signature BOOLEAN DEFAULT false,
    cost DECIMAL(10,2),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- ========================================
-- Indexes for Performance
-- ========================================
CREATE INDEX idx_employees_active ON employees(is_active);
CREATE INDEX idx_clients_active ON clients(is_active);
CREATE INDEX idx_buildings_client ON buildings(client_id);
CREATE INDEX idx_elevators_building ON elevators(building_id);
CREATE INDEX idx_elevators_status ON elevators(status);
CREATE INDEX idx_jobs_client ON jobs(client_id);
CREATE INDEX idx_jobs_building ON jobs(building_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_date ON jobs(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_spare_parts_category ON spare_parts(category_id);
CREATE INDEX idx_spare_parts_low_stock ON spare_parts(quantity, min_stock);
CREATE INDEX idx_maintenance_elevator ON maintenance_records(elevator_id);
CREATE INDEX idx_maintenance_date ON maintenance_records(date);

-- ========================================
-- Row Level Security (RLS)
-- ========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE elevators ENABLE ROW LEVEL SECURITY;
ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- ========================================
-- Policies for RLS - DISABLED FOR NOW
-- ========================================
-- Note: RLS policies disabled temporarily. 
-- Enable after setting up authentication system.

/*
-- Helper function to get current user from session
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
BEGIN
    -- This will be implemented in your application layer
    -- For now, return NULL (no access)
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- This will check if current user has admin role
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table - only admins can manage users
CREATE POLICY "Admins can manage all users" ON users
    FOR ALL USING (is_admin());

-- Employees table - admins can manage, others can only view
CREATE POLICY "Admins full access to employees" ON employees
    FOR ALL USING (is_admin());

CREATE POLICY "All users can view employees" ON employees
    FOR SELECT USING (true);

-- Clients table - admins can manage, others can view
CREATE POLICY "Admins full access to clients" ON clients
    FOR ALL USING (is_admin());

CREATE POLICY "All users can view clients" ON clients
    FOR SELECT USING (true);

-- Buildings table - admins can manage, others can view
CREATE POLICY "Admins full access to buildings" ON buildings
    FOR ALL USING (is_admin());

CREATE POLICY "All users can view buildings" ON buildings
    FOR SELECT USING (true);

-- Elevators table - admins can manage, others can view
CREATE POLICY "Admins full access to elevators" ON elevators
    FOR ALL USING (is_admin());

CREATE POLICY "All users can view elevators" ON elevators
    FOR SELECT USING (true);

-- Spare parts - admins can manage, others can view
CREATE POLICY "Admins full access to spare parts" ON spare_parts
    FOR ALL USING (is_admin());

CREATE POLICY "All users can view spare parts" ON spare_parts
    FOR SELECT USING (true);

-- Jobs - admins can manage, others can view
CREATE POLICY "Admins full access to jobs" ON jobs
    FOR ALL USING (is_admin());

CREATE POLICY "All users can view jobs" ON jobs
    FOR SELECT USING (true);

-- Transactions - sensitive data - admins only
CREATE POLICY "Admins full access to transactions" ON transactions
    FOR ALL USING (is_admin());

-- Maintenance records - admins can manage, others can view
CREATE POLICY "Admins full access to maintenance records" ON maintenance_records
    FOR ALL USING (is_admin());

CREATE POLICY "All users can view maintenance records" ON maintenance_records
    FOR SELECT USING (true);

-- Salary adjustments - very sensitive - admins only
CREATE POLICY "Admins full access to salary_adjustments" ON salary_adjustments
    FOR ALL USING (is_admin());

-- Spare parts categories - read-only for most users
CREATE POLICY "Admins can manage categories" ON spare_parts_categories
    FOR ALL USING (is_admin());

CREATE POLICY "All users can view categories" ON spare_parts_categories
    FOR SELECT USING (true);

-- Job employees - admins can manage, others can view
CREATE POLICY "Admins full access to job_employees" ON job_employees
    FOR ALL USING (is_admin());

CREATE POLICY "All users can view job_employees" ON job_employees
    FOR SELECT USING (true);

-- Inventory transactions - admins can manage, others can view
CREATE POLICY "Admins full access to inventory_transactions" ON inventory_transactions
    FOR ALL USING (is_admin());

CREATE POLICY "All users can view inventory_transactions" ON inventory_transactions
    FOR SELECT USING (true);
*/

-- ========================================
-- Functions and Triggers
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_elevators_updated_at BEFORE UPDATE ON elevators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spare_parts_updated_at BEFORE UPDATE ON spare_parts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update elevators count in buildings
CREATE OR REPLACE FUNCTION update_building_elevators_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE buildings SET elevators_count = elevators_count + 1 WHERE id = NEW.building_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE buildings SET elevators_count = elevators_count - 1 WHERE id = OLD.building_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for elevators count
CREATE TRIGGER update_elevators_count_trigger
    AFTER INSERT OR DELETE ON elevators
    FOR EACH ROW EXECUTE FUNCTION update_building_elevators_count();

-- Function to update spare parts quantity
CREATE OR REPLACE FUNCTION update_spare_part_quantity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.type = 'in' THEN
            UPDATE spare_parts SET quantity = quantity + NEW.quantity WHERE id = NEW.spare_part_id;
        ELSIF NEW.type = 'out' THEN
            UPDATE spare_parts SET quantity = quantity - NEW.quantity WHERE id = NEW.spare_part_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for spare parts quantity
CREATE TRIGGER update_spare_parts_quantity_trigger
    AFTER INSERT ON inventory_transactions
    FOR EACH ROW EXECUTE FUNCTION update_spare_part_quantity();

-- ========================================
-- Initial Data
-- ========================================

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password_hash, name, role, email) VALUES 
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5e', 'المشرف الرئيسي', 'admin', 'admin@liftmaster.com');

-- Insert spare parts categories
INSERT INTO spare_parts_categories (name, description) VALUES 
('كهربائية', 'قطع كهربائية وإلكترونيات'),
('محركات', 'محركات المصاعد والمحركات المساعدة'),
('هيكل', 'أبواب وقواعد ومكونات الهيكل'),
('تحكم', 'لوحات تحكم وأزرار وأنظمة تشغيل'),
('كابلات', 'كابلات وأسلاك وتوصيلات'),
('سلامة', 'أنظمة سلامة وطوارئ');

-- ========================================
-- Views for Common Queries
-- ========================================

-- View for job details with related information
CREATE VIEW job_details_view AS
SELECT 
    j.*,
    c.name as client_name,
    c.phone as client_phone,
    b.name as building_name,
    b.address as building_address,
    e.model as elevator_model,
    array_agg(DISTINCT emp.name) as assigned_employees,
    t.total_paid,
    j.cost - COALESCE(t.total_paid, 0) as remaining_amount
FROM jobs j
LEFT JOIN clients c ON j.client_id = c.id
LEFT JOIN buildings b ON j.building_id = b.id
LEFT JOIN elevators e ON j.elevator_id = e.id
LEFT JOIN job_employees je ON j.id = je.job_id
LEFT JOIN employees emp ON je.employee_id = emp.id
LEFT JOIN (
    SELECT job_id, SUM(amount) as total_paid
    FROM transactions 
    WHERE type = 'income' AND job_id IS NOT NULL
    GROUP BY job_id
) t ON j.id = t.job_id
GROUP BY j.id, c.name, c.phone, b.name, b.address, e.model, t.total_paid;

-- View for low stock items
CREATE VIEW low_stock_view AS
SELECT 
    sp.*,
    c.name as category_name
FROM spare_parts sp
LEFT JOIN spare_parts_categories c ON sp.category_id = c.id
WHERE sp.quantity <= sp.min_stock AND sp.is_active = true;

-- View for financial summary
CREATE VIEW financial_summary_view AS
SELECT 
    (SELECT COALESCE(SUM(cost), 0) FROM jobs WHERE payment_status = 'paid') as total_revenue,
    (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'expense') as total_expenses,
    (SELECT COALESCE(SUM(base_salary), 0) FROM employees WHERE is_active = true) as total_salaries,
    (SELECT COALESCE(SUM(wholesale_price * quantity), 0) FROM spare_parts WHERE is_active = true) as inventory_value,
    (SELECT COALESCE(SUM(j.cost - COALESCE(p.paid_amount, 0)), 0) 
     FROM jobs j 
     LEFT JOIN (
         SELECT job_id, SUM(amount) as paid_amount
         FROM transactions WHERE type = 'income' AND job_id IS NOT NULL
         GROUP BY job_id
     ) p ON j.id = p.job_id 
     WHERE j.payment_status IN ('unpaid', 'partial')) as unpaid_revenue;
