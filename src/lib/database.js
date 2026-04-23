import { supabase } from './supabase'

// ========================================
// العملاء (Clients)
// ========================================
export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('is_active', true)
    .order('name');
  return { data, error };
}

export async function createClient(client) {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select();
  return { data, error };
}

export async function updateClient(id, updates) {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select();
  return { data, error };
}

// ========================================
// الوظائف / الأعطال (Jobs)
// ========================================
export async function getJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('date', { ascending: false });
  return { data, error };
}

export async function createJob(jobData) {
  const { data, error } = await supabase
    .from('jobs')
    .insert([jobData])
    .select();
  return { data, error };
}

// حل مشكلة التكرار اللي ظهرت في الـ Build (Error: updateJob is defined multiple times)
export async function updateJob(id, updates) {
  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', id)
    .select();
  return { data, error };
}

export async function deleteJob(id) {
  const { data, error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id);
  return { data, error };
}

// ========================================
// الموظفين والرواتب (Employees)
// ========================================
export async function getEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('is_active', true)
    .order('name');
  return { data, error };
}

export async function createEmployee(employee) {
  const { data, error } = await supabase.from('employees').insert(employee).select();
  return { data, error };
}

export async function updateEmployee(id, updates) {
  const { data, error } = await supabase.from('employees').update(updates).eq('id', id).select();
  return { data, error };
}

export async function deleteEmployee(id) {
  const { data, error } = await supabase.from('employees').update({ is_active: false }).eq('id', id);
  return { data, error };
}

// الدالة اللي كانت ناقصة في Build صفحة الموظفين
export async function createEmployeeAdjustment(adjustment) {
  const { data, error } = await supabase.from('employee_adjustments').insert(adjustment).select();
  return { data, error };
}

// ========================================
// المخزن وقطع الغيار (Spare Parts)
// ========================================
export async function getSpareParts() {
  const { data, error } = await supabase.from('spare_parts').select('*').eq('is_active', true).order('name');
  return { data, error };
}

export async function createSparePart(part) {
  const { data, error } = await supabase.from('spare_parts').insert(part).select();
  return { data, error };
}

export async function updateSparePart(id, updates) {
  const { data, error } = await supabase.from('spare_parts').update(updates).eq('id', id).select();
  return { data, error };
}

// الدالة المطلوبة للداشبورد لمعرفة النواقص
export async function getLowStockItems() {
  const { data, error } = await supabase.from('spare_parts').select('*').filter('quantity', 'lte', 'min_stock');
  return { data, error };
}

// ========================================
// المبيعات (Sales)
// ========================================
// ========================================
// المبيعات (Sales)
// ========================================
export async function getSales() {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('date', { ascending: false });
  return { data, error };
}

export async function createSale(saleData) {
  const { data, error } = await supabase
    .from('sales')
    .insert([saleData])
    .select();
  return { data, error };
}

export async function updateSale(id, updates) {
  const { data, error } = await supabase
    .from('sales')
    .update(updates)
    .eq('id', id)
    .select();
  return { data, error };
}

// هذه الدالة التي كانت تنقص وتسببت في فشل الـ Build
export async function deleteSale(id) {
  const { data, error } = await supabase
    .from('sales')
    .delete()
    .eq('id', id);
  return { data, error };
}


// ========================================
// الإحصائيات (Financials)
// ========================================
export async function getFinancialSummary() {
  const { data, error } = await supabase.from('financial_summary_view').select('*').single();
  return { data: data || { total_revenue: 0, total_expenses: 0 }, error };
}

export async function getMonthlyData() {
  const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: true });
  if (error) return { data: [], error };
  return { data: data.slice(-6), error: null }; // آخر 6 شهور للرسم البياني
}

export async function getTransactions() {
  const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
  return { data, error };
}
// معاملات مالية (Transactions)
export async function createTransaction(transaction) {
  return await supabase.from('transactions').insert([transaction]);
}

export async function updateTransaction(id, updates) {
  return await supabase.from('transactions').update(updates).eq('id', id);
}

export async function deleteTransaction(id) {
  return await supabase.from('transactions').delete().eq('id', id);
}
