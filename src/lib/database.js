import { supabase } from './supabase'

// ========================================
// USERS
// ========================================
export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
  return { data, error }
}

export async function getUserById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

export async function getUserByUsername(username) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()
  return { data, error }
}

export async function createUser(user) {
  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .select()
  return { data, error }
}

// ========================================
// EMPLOYEES
// ========================================
export async function getEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('is_active', true)
    .order('name')
  return { data, error }
}

export async function createEmployee(employee) {
  const { data, error } = await supabase
    .from('employees')
    .insert(employee)
    .select()
  return { data, error }
}

export async function updateEmployee(id, updates) {
  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', id)
    .select()
  return { data, error }
}

export async function deleteEmployee(id) {
  const { data, error } = await supabase
    .from('employees')
    .update({ is_active: false })
    .eq('id', id)
  return { data, error }
}

// ========================================
// CLIENTS
// ========================================
export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('is_active', true)
    .order('name')
  return { data, error }
}

export async function createClient(client) {
  const { data, error } = await supabase
    .from('clients')
    .insert(client)
    .select()
  return { data, error }
}

export async function updateClient(id, updates) {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
  return { data, error }
}

// ========================================
// BUILDINGS
// ========================================
export async function getBuildings() {
  const { data, error } = await supabase
    .from('buildings')
    .select(`
      *,
      clients(name, phone)
    `)
    .order('name')
  return { data, error }
}

export async function getBuildingsByClient(clientId) {
  const { data, error } = await supabase
    .from('buildings')
    .select('*')
    .eq('client_id', clientId)
    .order('name')
  return { data, error }
}

// ========================================
// ELEVATORS
// ========================================
export async function getElevators() {
  const { data, error } = await supabase
    .from('elevators')
    .select(`
      *,
      buildings(name, address, clients(name))
    `)
    .order('buildings(name), model')
  return { data, error }
}

export async function getElevatorsByBuilding(buildingId) {
  const { data, error } = await supabase
    .from('elevators')
    .select('*')
    .eq('building_id', buildingId)
    .order('model')
  return { data, error }
}

// ========================================
// JOBS
// ========================================
export async function getJobs() {
  // Try to get from view first, fallback to table
  const { data, error } = await supabase
    .from('job_details_view')
    .select('*')
    .order('date', { ascending: false })
  
  if (error) {
    console.warn('View job_details_view not found, falling back to jobs table');
    return await supabase
      .from('jobs')
      .select('*, clients(name)')
      .order('date', { ascending: false })
  }
  return { data, error }
}

export async function createJob(job) {
  const { data, error } = await supabase
    .from('jobs')
    .insert(job)
    .select()
  return { data, error }
}

export async function updateJob(id, updates) {
  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', id)
    .select()
  return { data, error }
}

// ========================================
// TRANSACTIONS
// ========================================
export async function getTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
  return { data, error }
}

export async function createTransaction(transaction) {
  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
    .select()
  return { data, error }
}

// ========================================
// SPARE PARTS
// ========================================
export async function getSpareParts() {
  const { data, error } = await supabase
    .from('spare_parts')
    .select(`
      *,
      spare_parts_categories(name)
    `)
    .eq('is_active', true)
    .order('name')
  return { data, error }
}

export async function getLowStockItems() {
  const { data, error } = await supabase
    .from('low_stock_view')
    .select('*')
  
  if (error) {
    console.warn('View low_stock_view not found, falling back to spare_parts table');
    return await supabase
      .from('spare_parts')
      .select('*')
      .filter('quantity', 'lte', 'min_stock')
  }
  return { data, error }
}

export async function updateSparePart(id, updates) {
  const { data, error } = await supabase
    .from('spare_parts')
    .update(updates)
    .eq('id', id)
    .select()
  return { data, error }
}

export async function createSparePart(part) {
  const { data, error } = await supabase
    .from('spare_parts')
    .insert(part)
    .select()
  return { data, error }
}

// ========================================
// FINANCIAL SUMMARY
// ========================================
export async function getFinancialSummary() {
  const { data, error } = await supabase
    .from('financial_summary_view')
    .select('*')
    .single()
  
  if (error) {
    console.warn('View financial_summary_view not found, returning zeroed summary');
    return {
      data: {
        total_revenue: 0,
        total_expenses: 0,
        total_salaries: 0,
        inventory_value: 0,
        unpaid_revenue: 0,
        net_profit: 0
      },
      error: null
    }
  }
  
  // Calculate net profit if not in view
  if (data && data.net_profit === undefined) {
    data.net_profit = (data.total_revenue || 0) - (data.total_expenses || 0);
  }
  
  return { data, error }
}

// ========================================
// MAINTENANCE RECORDS
// ========================================
export async function getMaintenanceRecords() {
  const { data, error } = await supabase
    .from('maintenance_records')
    .select(`
      *,
      elevators(model, buildings(name, address))
    `)
    .order('date', { ascending: false })
  return { data, error }
}

export async function createMaintenanceRecord(record) {
  const { data, error } = await supabase
    .from('maintenance_records')
    .insert(record)
    .select()
  return { data, error }
}

// ========================================
// MONTHLY DATA (for charts)
// ========================================
export async function getMonthlyData() {
  // Get transactions grouped by month
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: true })
  
  if (error) {
    console.warn('Error fetching monthly data:', error);
    return [];
  }
  
  // Group transactions by month
  const monthlyMap = {};
  const monthNames = {
    "01": "يناير", "02": "فبراير", "03": "مارس", "04": "أبريل",
    "05": "مايو", "06": "يونيو", "07": "يوليو", "08": "أغسطس",
    "09": "سبتمبر", "10": "أكتوبر", "11": "نوفمبر", "12": "ديسمبر"
  };
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthNum = String(date.getMonth() + 1).padStart(2, '0');
    const monthName = monthNames[monthNum] || 'Unknown';
    
    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { month: monthName, revenue: 0, expenses: 0 };
    }
    
    if (transaction.type === 'income') {
      monthlyMap[monthKey].revenue += Number(transaction.amount) || 0;
    } else if (transaction.type === 'expense') {
      monthlyMap[monthKey].expenses += Number(transaction.amount) || 0;
    }
  });
  
  // Return last 6 months
  return Object.values(monthlyMap).slice(-6).map(m => ({
    ...m,
    profit: m.revenue - m.expenses
  }));
}

// ========================================
// EMPLOYEE SALARIES
// ========================================
export async function getEmployeeSalaries(month) {
  const { data, error } = await supabase
    .from('employee_salaries')
    .select(`
      *,
      employees(name, role)
    `)
    .eq('month', month)
  return { data, error }
}

export async function createEmployeeAdjustment(adjustment) {
  const { data, error } = await supabase
    .from('employee_adjustments')
    .insert(adjustment)
    .select()
  return { data, error }
}
// ========================================
// SALES (عمليات البيع)
// ========================================

// جلب كل عمليات البيع مع ترتيبها من الأحدث للأقدم
export async function getSales() {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('date', { ascending: false });
  return { data, error };
}

// إضافة عملية بيع جديدة
export async function createSale(saleData) {
  const { data, error } = await supabase
    .from('sales')
    .insert([saleData])
    .select();
  return { data, error };
}

// تحديث عملية بيع موجودة
export async function updateSale(id, updates) {
  const { data, error } = await supabase
    .from('sales')
    .update(updates)
    .eq('id', id)
    .select();
  return { data, error };
}

// حذف عملية بيع
export async function deleteSale(id) {
  const { data, error } = await supabase
    .from('sales')
    .delete()
    .eq('id', id);
  return { data, error };
}
