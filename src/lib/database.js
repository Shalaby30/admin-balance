import { supabase } from './supabase'

// ========================================
// USERS
// ========================================
export async function getUsers() {
  const { data, error } = await supabase.from('users').select('*')
  return { data, error }
}

export async function createUser(user) {
  const { data, error } = await supabase.from('users').insert(user).select()
  return { data, error }
}

// ========================================
// EMPLOYEES & ADJUSTMENTS
// ========================================
export async function getEmployees() {
  const { data, error } = await supabase.from('employees').select('*').eq('is_active', true).order('name')
  return { data, error }
}

export async function createEmployee(employee) {
  const { data, error } = await supabase.from('employees').insert(employee).select()
  return { data, error }
}

export async function updateEmployee(id, updates) {
  const { data, error } = await supabase.from('employees').update(updates).eq('id', id).select()
  return { data, error }
}

export async function deleteEmployee(id) {
  const { data, error } = await supabase.from('employees').update({ is_active: false }).eq('id', id)
  return { data, error }
}

// الدالة اللي كانت ناقصة ومسببة خطأ صفحة الموظفين
export async function createEmployeeAdjustment(adjustment) {
  const { data, error } = await supabase.from('employee_adjustments').insert(adjustment).select()
  return { data, error }
}

// ========================================
// CLIENTS
// ========================================
export async function getClients() {
  const { data, error } = await supabase.from('clients').select('*').eq('is_active', true).order('name')
  return { data, error }
}

// ========================================
// JOBS
// ========================================
export async function getJobs() {
  const { data, error } = await supabase.from('jobs').select('*').order('date', { ascending: false });
  return { data, error };
}

export async function createJob(jobData) {
  const { data, error } = await supabase.from('jobs').insert([jobData]).select();
  return { data, error };
}

export async function updateJob(id, updates) {
  const { data, error } = await supabase.from('jobs').update(updates).eq('id', id).select();
  return { data, error };
}

export async function deleteJob(id) {
  const { data, error } = await supabase.from('jobs').delete().eq('id', id);
  return { data, error };
}

// ========================================
// SPARE PARTS & INVENTORY
// ========================================
export async function getSpareParts() {
  const { data, error } = await supabase.from('spare_parts').select(`*, spare_parts_categories(name)`).eq('is_active', true).order('name')
  return { data, error }
}

// الدالة اللي كانت ناقصة ومسببة خطأ صفحة المخزن
export async function createSparePart(part) {
  const { data, error } = await supabase.from('spare_parts').insert(part).select()
  return { data, error }
}

export async function updateSparePart(id, updates) {
  const { data, error } = await supabase.from('spare_parts').update(updates).eq('id', id).select()
  return { data, error }
}

// الدالة اللي كانت ناقصة ومسببة خطأ الداشبورد
export async function getLowStockItems() {
  const { data, error } = await supabase.from('spare_parts').select('*').filter('quantity', 'lte', 'min_stock')
  return { data, error }
}

// ========================================
// SALES
// ========================================
export async function getSales() {
  const { data, error } = await supabase.from('sales').select('*').order('date', { ascending: false });
  return { data, error };
}

export async function createSale(saleData) {
  const { data, error } = await supabase.from('sales').insert([saleData]).select();
  return { data, error };
}

// الدالة اللي كانت ناقصة ومسببة خطأ صفحة المبيعات
export async function updateSale(id, updates) {
  const { data, error } = await supabase.from('sales').update(updates).eq('id', id).select();
  return { data, error };
}

export async function deleteSale(id) {
  const { data, error } = await supabase.from('sales').delete().eq('id', id);
  return { data, error };
}

// ========================================
// FINANCIALS & CHARTS
// ========================================
export async function getFinancialSummary() {
  const { data, error } = await supabase.from('financial_summary_view').select('*').single()
  return { data: data || { total_revenue: 0, total_expenses: 0 }, error }
}

// الدالة اللي كانت ناقصة ومسببة خطأ الداشبورد
export async function getMonthlyData() {
  const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: true })
  if (error) return []
  // تبسيط للبيانات المطلوبة للرسم البياني
  return data.slice(-6) 
}

export async function getTransactions() {
  const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false })
  return { data, error }
}

export async function getMaintenanceRecords() {
  const { data, error } = await supabase.from('maintenance_records').select(`*, elevators(model)`).order('date', { ascending: false })
  return { data, error }
}
