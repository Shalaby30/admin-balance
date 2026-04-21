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
  const { data, error } = await supabase
    .from('job_details_view')
    .select('*')
    .order('date', { ascending: false })
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

// ========================================
// FINANCIAL SUMMARY
// ========================================
export async function getFinancialSummary() {
  const { data, error } = await supabase
    .from('financial_summary_view')
    .select('*')
    .single()
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
  // This would need to be implemented based on your specific requirements
  // For now, return mock data
  const months = ["January", "February", "March", "April", "May", "June"]
  return months.map((month, index) => ({
    month,
    revenue: Math.floor(Math.random() * 50000) + 30000,
    expenses: Math.floor(Math.random() * 30000) + 20000,
    profit: 0
  }))
}
