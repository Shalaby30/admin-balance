import { supabase } from './supabase'

// ========================================
// 1. العملاء (Clients)
// ========================================
export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('is_active', true)
    .order('name');
  return { data, error };
}

// ========================================
// 2. الوظائف (Jobs)
// ========================================
export async function getJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*, clients(name)')
    .order('date', { ascending: false });
  return { data, error };
}

export async function updateJob(id, updates) {
  return await supabase.from('jobs').update(updates).eq('id', id);
}

// ========================================
// 3. المبيعات (Sales)
// ========================================
export async function deleteSale(id) {
  return await supabase.from('sales').delete().eq('id', id);
}

// ========================================
// 4. المالية (Transactions)
// ========================================
export async function getTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, clients(name)')
    .order('date', { ascending: false });
  return { data, error };
}

export async function createTransaction(transaction) {
  return await supabase.from('transactions').insert([transaction]);
}

export async function updateTransaction(id, updates) {
  return await supabase.from('transactions').update(updates).eq('id', id);
}

export async function deleteTransaction(id) {
  return await supabase.from('transactions').delete().eq('id', id);
}

// ========================================
// 5. إحصائيات لوحة التحكم (Dashboard Stats)
// ========================================
export async function getFinancialSummary() {
  const { data, error } = await supabase
    .from('financial_summary_view')
    .select('*')
    .single();
  
  // تحويل الأسماء لتطابق كود الـ Dashboard ومنع NaN
  const formattedData = data ? {
    totalRevenue: data.total_revenue || 0,
    totalExpenses: data.total_expenses || 0,
    netProfit: (data.total_revenue || 0) - (data.total_expenses || 0),
    unpaidRevenue: data.unpaid_revenue || 0,
    totalSalaries: data.total_salaries || 0,
    inventoryValue: data.inventory_value || 0
  } : {
    totalRevenue: 0, totalExpenses: 0, netProfit: 0, unpaidRevenue: 0, totalSalaries: 0, inventoryValue: 0
  };

  return { data: formattedData, error };
}

export async function getMonthlyData() {
  const { data, error } = await supabase
    .from('monthly_stats_view')
    .select('*');
  if (error) return [];
  return data || [];
}

export async function getLowStockItems() {
  return await supabase
    .from('spare_parts')
    .select('*')
    .lt('quantity', 5);
}
