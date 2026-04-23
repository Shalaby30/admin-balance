import { supabase } from './supabase'

// ========================================
// USERS
// ========================================
export async function getUsers() {
  const { data, error } = await supabase.from('users').select('*')
  return { data, error }
}

export async function getUserById(id) {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single()
  return { data, error }
}

export async function getUserByUsername(username) {
  const { data, error } = await supabase.from('users').select('*').eq('username', username).single()
  return { data, error }
}

export async function createUser(user) {
  const { data, error } = await supabase.from('users').insert(user).select()
  return { data, error }
}

// ========================================
// EMPLOYEES
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

// ========================================
// CLIENTS
// ========================================
export async function getClients() {
  const { data, error } = await supabase.from('clients').select('*').eq('is_active', true).order('name')
  return { data, error }
}

export async function createClient(client) {
  const { data, error } = await supabase.from('clients').insert(client).select()
  return { data, error }
}

export async function updateClient(id, updates) {
  const { data, error } = await supabase.from('clients').update(updates).eq('id', id).select()
  return { data, error }
}

// ========================================
// BUILDINGS & ELEVATORS
// ========================================
export async function getBuildings() {
  const { data, error } = await supabase.from('buildings').select(`*, clients(name, phone)`).order('name')
  return { data, error }
}

export async function getElevators() {
  const { data, error } = await supabase.from('elevators').select(`*, buildings(name, address, clients(name))`).order('buildings(name), model')
  return { data, error }
}

// ========================================
// JOBS (تم توحيدها وحذف التكرار)
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
// SPARE PARTS & SALES
// ========================================
export async function getSpareParts() {
  const { data, error } = await supabase.from('spare_parts').select(`*, spare_parts_categories(name)`).eq('is_active', true).order('name')
  return { data, error }
}

export async function updateSparePart(id, updates) {
  const { data, error } = await supabase.from('spare_parts').update(updates).eq('id', id).select()
  return { data, error }
}

export async function getSales() {
  const { data, error } = await supabase.from('sales').select('*').order('date', { ascending: false });
  return { data, error };
}

export async function createSale(saleData) {
  const { data, error } = await supabase.from('sales').insert([saleData]).select();
  return { data, error };
}

export async function deleteSale(id) {
  const { data, error } = await supabase.from('sales').delete().eq('id', id);
  return { data, error };
}

// ========================================
// FINANCIALS & MAINTENANCE
// ========================================
export async function getFinancialSummary() {
  const { data, error } = await supabase.from('financial_summary_view').select('*').single()
  return { data: data || { total_revenue: 0, total_expenses: 0 }, error }
}

export async function getMaintenanceRecords() {
  const { data, error } = await supabase.from('maintenance_records').select(`*, elevators(model, buildings(name))`).order('date', { ascending: false })
  return { data, error }
}

export async function getTransactions() {
  const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false })
  return { data, error }
}
