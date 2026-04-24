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
  // رجعنا للطريقة القديمة عشان نضمن إنها تشتغل 100%
  return await supabase.from('jobs').select('*').order('date', { ascending: false });
}

export async function createJob(job) {
  return await supabase.from('jobs').insert([job]);
}

export async function updateJob(id, updates) {
  const cleanUpdates = { ...updates };
  // بنشيل أي حقول غريبة ممكن تيجي من الـ UI وتسبب خطأ
  delete cleanUpdates.clients; 
  delete cleanUpdates.client_name;

  const { data, error } = await supabase.from('jobs').update(cleanUpdates).eq('id', id).select().single();
  
  if (!error && cleanUpdates.payment_status === 'paid' && data) {
    await createTransaction({
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      category: 'خدمات صيانة',
      amount: data.total_price || data.cost || 0,
      description: `تحصيل وظيفة: ${data.description || id.slice(0,5)}`,
      payment_method: 'نقدي',
      job_id: id,
      client_id: data.client_id
    });
  }
  return { data, error };
}

export async function deleteJob(id) {
  return await supabase.from('jobs').delete().eq('id', id);
}

// ========================================
// 3. الموظفين (Employees)
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
// 4. المخزن (Inventory)
// ========================================
export async function getSpareParts() {
  return await supabase.from('spare_parts').select('*').order('name');
}
export async function createSparePart(part) {
  return await supabase.from('spare_parts').insert([part]);
}
export async function updateSparePart(id, updates) {
  return await supabase.from('spare_parts').update(updates).eq('id', id);
}
export async function deleteSparePart(id) {
  return await supabase.from('spare_parts').delete().eq('id', id);
}
export async function getLowStockItems() {
  return await supabase.from('spare_parts').select('*').lt('quantity', 5);
}

// ========================================
// 5. المبيعات (Sales)
// ========================================
export async function getSales() {
  // بنجيب المبيعات بس، والربط مع اسم القطعة لو شغال تمام
  return await supabase.from('sales').select('*, spare_parts(name)').order('date', { ascending: false });
}

export async function createSale(sale) {
  const { data, error } = await supabase.from('sales').insert([sale]).select().single();
  if (!error && data) {
    await createTransaction({
      date: sale.date || new Date().toISOString().split('T')[0],
      type: 'income',
      category: 'مبيعات قطع غيار',
      amount: sale.total_price,
      description: `بيع قطعة غيار من المخزن`,
      payment_method: 'نقدي',
      client_id: sale.client_id
    });
  }
  return { data, error };
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
  return await supabase.from('transactions').select('*').order('date', { ascending: false });
}
export async function createTransaction(t) {
  return await supabase.from('transactions').insert([{
    date: t.date || new Date().toISOString().split('T')[0],
    type: t.type,
    amount: parseFloat(t.amount),
    description: t.description,
    category: t.category || 'عام',
    payment_method: t.payment_method || 'نقدي',
    job_id: t.job_id || null,
    client_id: t.client_id || null
  }]);
}
export async function updateTransaction(id, updates) {
  return await supabase.from('transactions').update(updates).eq('id', id);
}
export async function deleteTransaction(id) {
  return await supabase.from('transactions').delete().eq('id', id);
}

// ========================================
// 7. الداشبورد (Stats)
// ========================================
export async function getFinancialSummary() {
  const { data, error } = await supabase.from('transactions').select('amount, type');
  if (error) return { data: null, error };
  const summary = data.reduce((acc, curr) => {
    if (curr.type === 'income') acc.totalRevenue += curr.amount;
    else if (curr.type === 'expense') acc.totalExpenses += curr.amount;
    return acc;
  }, { totalRevenue: 0, totalExpenses: 0 });
  return { data: { ...summary, netProfit: summary.totalRevenue - summary.totalExpenses }, error: null };
}
export async function getMonthlyData() {
  const { data } = await supabase.from('monthly_stats_view').select('*');
  return data || [];
}
