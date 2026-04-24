import { supabase } from './supabase'

// ========================================
// 1. العملاء (Clients)
// ========================================
export async function getClients() {
  return await supabase.from('clients').select('*').eq('is_active', true).order('name');
}
export async function createClient(client) {
  return await supabase.from('clients').insert([client]);
}
export async function updateClient(id, updates) {
  return await supabase.from('clients').update(updates).eq('id', id);
}

// ========================================
// 2. الوظائف (Jobs)
// ========================================
export async function getJobs() {
  return await supabase.from('jobs').select('*, clients(name)').order('date', { ascending: false });
}
export async function createJob(job) {
  return await supabase.from('jobs').insert([job]);
}
export async function updateJob(id, updates) {
  return await supabase.from('jobs').update(updates).eq('id', id);
}
export async function deleteJob(id) {
  return await supabase.from('jobs').delete().eq('id', id);
}

// ========================================
// 3. الموظفين والرواتب (Employees)
// ========================================
export async function getEmployees() {
  return await supabase.from('employees').select('*').order('name');
}
export async function createEmployee(emp) {
  return await supabase.from('employees').insert([emp]);
}
export async function updateEmployee(id, updates) {
  return await supabase.from('employees').update(updates).eq('id', id);
}
export async function deleteEmployee(id) {
  return await supabase.from('employees').delete().eq('id', id);
}
export async function createEmployeeAdjustment(adj) {
  return await supabase.from('employee_adjustments').insert([adj]);
}

// ========================================
// 4. المخزن وقطع الغيار (Inventory/Spare Parts)
// ========================================
export async function getSpareParts() {
  return await supabase.from('spare_parts').select('*').order('name');
}
export async function updateSparePart(id, updates) {
  return await supabase.from('spare_parts').update(updates).eq('id', id);
}
export async function getLowStockItems() {
  return await supabase.from('spare_parts').select('*').lt('quantity', 5);
}

// ========================================
// 5. المبيعات (Sales)
// ========================================
export async function getSales() {
  return await supabase.from('sales').select('*, spare_parts(name)').order('date', { ascending: false });
}
export async function createSale(sale) {
  return await supabase.from('sales').insert([sale]);
}
export async function updateSale(id, updates) {
  return await supabase.from('sales').update(updates).eq('id', id);
}
export async function deleteSale(id) {
  return await supabase.from('sales').delete().eq('id', id);
}

// ========================================
// 6. المالية (Transactions)
// ========================================
export async function getTransactions() {
  return await supabase.from('transactions').select('*, clients(name)').order('date', { ascending: false });
}
export async function createTransaction(t) {
  return await supabase.from('transactions').insert([t]);
}
export async function updateTransaction(id, updates) {
  return await supabase.from('transactions').update(updates).eq('id', id);
}
export async function deleteTransaction(id) {
  return await supabase.from('transactions').delete().eq('id', id);
}

// ========================================
// 7. إحصائيات الداشبورد (Dashboard Stats)
// ========================================
export async function getFinancialSummary() {
  const { data, error } = await supabase.from('financial_summary_view').select('*').single();
  const formattedData = data ? {
    totalRevenue: data.total_revenue || 0,
    totalExpenses: data.total_expenses || 0,
    netProfit: (data.total_revenue || 0) - (data.total_expenses || 0),
    unpaidRevenue: data.unpaid_revenue || 0,
    totalSalaries: data.total_salaries || 0,
    inventoryValue: data.inventory_value || 0
  } : { totalRevenue: 0, totalExpenses: 0, netProfit: 0, unpaidRevenue: 0, totalSalaries: 0, inventoryValue: 0 };
  return { data: formattedData, error };
}

export async function getMonthlyData() {
  const { data } = await supabase.from('monthly_stats_view').select('*');
  return data || [];
                             }
