import { sql } from './db'
import type { DateFilter } from './date-filters'

export interface Stats {
  customers: number
  projects: number
  activeProjects: number
  revenue: number
  salesRevenue: number
  maintenanceRevenue: number
  projectRevenue: number
  expenses: number
  profit: number
  employees: number
  inventory: number
  unpaidTotal: number
}

export interface Project {
  id: string
  name: string
  client: string
  status: string
  progress: number
  deadline: string
  value: number
  team: string[]
  paid: boolean
}

export interface MaintenanceTask {
  id: string
  title: string
  location: string
  status: string
  date: string
  technician: string
  amount: number
  paid: boolean
  description: string
}

export interface NewMaintenanceTask {
  title: string
  location: string
  status: string
  date: string
  technician: string
  amount: number
  paid: boolean
  description: string
}

export async function createMaintenanceTask(task: NewMaintenanceTask): Promise<MaintenanceTask> {
  const [inserted] = await sql`
    INSERT INTO maintenance_tasks (title, location, status, date, technician, amount, paid, description)
    VALUES (${task.title}, ${task.location}, ${task.status}, ${task.date}, ${task.technician}, ${task.amount}, ${task.paid}, ${task.description})
    RETURNING id, title, location, status, date, technician, amount, paid, description
  `

  return {
    id: String(inserted.id),
    title: inserted.title ?? '',
    location: inserted.location ?? '',
    status: inserted.status ?? '',
    date: inserted.date ? (inserted.date instanceof Date ? inserted.date.toISOString().slice(0, 10) : String(inserted.date).slice(0, 10)) : '',
    technician: inserted.technician ?? '',
    amount: Number(inserted.amount ?? 0),
    paid: Boolean(inserted.paid),
    description: inserted.description ?? '',
  }
}

export interface UpdateMaintenanceTask {
  id: string
  title: string
  location: string
  status: string
  date: string
  technician: string
  amount: number
  paid: boolean
  description: string
}

export async function updateMaintenanceTask(task: UpdateMaintenanceTask): Promise<MaintenanceTask> {
  const [updated] = await sql`
    UPDATE maintenance_tasks
    SET title = ${task.title}, location = ${task.location}, status = ${task.status}, date = ${task.date}, technician = ${task.technician}, amount = ${task.amount}, paid = ${task.paid}, description = ${task.description}
    WHERE id = ${task.id}
    RETURNING id, title, location, status, date, technician, amount, paid, description
  `

  return {
    id: String(updated.id),
    title: updated.title ?? '',
    location: updated.location ?? '',
    status: updated.status ?? '',
    date: updated.date ? (updated.date instanceof Date ? updated.date.toISOString().slice(0, 10) : String(updated.date).slice(0, 10)) : '',
    technician: updated.technician ?? '',
    amount: Number(updated.amount ?? 0),
    paid: Boolean(updated.paid),
    description: updated.description ?? '',
  }
}

export async function deleteMaintenanceTask(id: string): Promise<void> {
  await sql`
    DELETE FROM maintenance_tasks
    WHERE id = ${id}
  `
}

export interface Customer {
  id: number
  name: string
  company: string
  address: string
  phone: string
}

export interface Invoice {
  id: string
  client: string
  item: string
  quantity: number
  amount: number
  date: string
  status: string
}

export interface ExpenseItem {
  id: string
  title: string
  category: string
  amount: number
  date: string
}

export interface InventoryItem {
  id: number
  name: string
  code: string
  quantity: number
  purchasePrice: number
  sellingPrice: number
  status: string
  image?: string
  minStock: number
  maxStock?: number
}

export interface NewInventoryItem {
  name: string
  code: string
  quantity: number
  purchasePrice: number
  sellingPrice: number
  status: string
}

export interface CalendarEvent {
  id: number
  title: string
  date: string
  type: string
}

export interface Contract {
  id: string
  client: string
  type: string
  value: number
  startDate: string
  endDate: string
  status: string
}

export interface RevenuePoint {
  month: string
  revenue?: number
  salesRevenue?: number
  maintenanceRevenue?: number
  projectRevenue?: number
  expenses?: number
}

export interface SalesPoint {
  month: string
  sales: number
}

const monthNames = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
]

function parseTeam(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean)
  return []
}

function buildDateFilter(month: string, year: string, column: 'date' | 'deadline') {
  const col = column === 'deadline' ? sql`deadline` : sql`date`

  if (year !== 'all' && month !== 'all') {
    return sql`AND EXTRACT(YEAR FROM ${col}) = ${Number(year)} AND EXTRACT(MONTH FROM ${col}) = ${Number(month)}`
  }
  if (year !== 'all') {
    return sql`AND EXTRACT(YEAR FROM ${col}) = ${Number(year)}`
  }
  if (month !== 'all') {
    return sql`AND EXTRACT(MONTH FROM ${col}) = ${Number(month)}`
  }
  return sql``
}

export async function getStats(filter: DateFilter = {}): Promise<Stats> {
  const month = filter.month ?? 'all'
  const year = filter.year ?? 'all'
  const invoiceDateFilter = buildDateFilter(month, year, 'date')
  const maintenanceDateFilter = buildDateFilter(month, year, 'date')
  const projectDateFilter = buildDateFilter(month, year, 'deadline')
  const expenseDateFilter = buildDateFilter(month, year, 'date')

  const [row] = await sql`
    SELECT
      (SELECT COALESCE(COUNT(*), 0) FROM customers) AS customers,
      (SELECT COALESCE(COUNT(*), 0) FROM projects) AS projects,
      (SELECT COALESCE(COUNT(*), 0) FROM projects WHERE status IN ('جاري', 'active', 'in_progress')) AS activeProjects,
      (SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE (status = 'مدفوعة' OR status = 'paid' OR status = 'مكتمل') ${invoiceDateFilter}) AS salesRevenue,
      (SELECT COALESCE(SUM(amount), 0) FROM maintenance_tasks WHERE (paid = true OR paid = 'true' OR paid = '1') ${maintenanceDateFilter}) AS maintenanceRevenue,
      (SELECT COALESCE(SUM(value), 0) FROM projects WHERE (paid = true OR paid = 'true' OR paid = '1') ${projectDateFilter}) AS projectRevenue,
      (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE TRUE ${expenseDateFilter}) AS expenses,
      (SELECT COALESCE(COUNT(*), 0) FROM employees) AS employees,
      (SELECT COALESCE(SUM(quantity), 0) FROM inventory) AS inventory,
      (SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE NOT (status = 'مدفوعة' OR status = 'paid' OR status = 'مكتمل') ${invoiceDateFilter}) AS unpaidInvoices,
      (SELECT COALESCE(SUM(amount), 0) FROM maintenance_tasks WHERE NOT (paid = true OR paid = 'true' OR paid = '1') ${maintenanceDateFilter}) AS unpaidMaintenance,
      (SELECT COALESCE(SUM(value), 0) FROM projects WHERE NOT (paid = true OR paid = 'true' OR paid = '1') ${projectDateFilter}) AS unpaidProjects
  `

  const salesRevenue = Number(row?.salesrevenue ?? row?.salesRevenue ?? 0)
  const maintenanceRevenue = Number(row?.maintenancerevenue ?? row?.maintenanceRevenue ?? 0)
  const projectRevenue = Number(row?.projectrevenue ?? row?.projectRevenue ?? 0)
  const revenue = salesRevenue + maintenanceRevenue + projectRevenue
  const unpaidInvoices = Number(row?.unpaidinvoices ?? row?.unpaidInvoices ?? 0)
  const unpaidMaintenance = Number(row?.unpaidmaintenance ?? row?.unpaidMaintenance ?? 0)
  const unpaidProjects = Number(row?.unpaidprojects ?? row?.unpaidProjects ?? 0)
  const unpaidTotal = unpaidInvoices + unpaidMaintenance + unpaidProjects
  const expenses = Number(row?.expenses ?? 0)

  return {
    customers: Number(row?.customers ?? 0),
    projects: Number(row?.projects ?? 0),
    activeProjects: Number(row?.activeprojects ?? row?.activeProjects ?? 0),
    revenue,
    salesRevenue,
    maintenanceRevenue,
    projectRevenue,
    expenses,
    profit: revenue - expenses,
    employees: Number(row?.employees ?? 0),
    inventory: Number(row?.inventory ?? 0),
    unpaidTotal,
  }
}

export async function getLatestProjects(): Promise<Project[]> {
  const rows = await sql`
    SELECT id, name, client, status, progress, deadline, value, team
    FROM projects
    ORDER BY deadline ASC
    LIMIT 5
  `

  return rows.map((row: any) => ({
    id: String(row.id),
    name: row.name ?? '',
    client: row.client ?? '',
    status: row.status ?? '',
    progress: Number(row.progress ?? 0),
    deadline: row.deadline ? String(row.deadline).slice(0, 10) : '',
    value: Number(row.value ?? 0),
    team: parseTeam(row.team),
  }))
}

function mapMaintenanceRow(row: any): MaintenanceTask {
  return {
    id: String(row.id),
    title: row.title ?? '',
    location: row.location ?? '',
    status: row.status ?? '',
    date: row.date ? (row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date).slice(0, 10)) : '',
    technician: row.technician ?? '',
    amount: Number(row.amount ?? 0),
    paid: Boolean(row.paid),
    description: row.description ?? '',
  }
}

export async function getMaintenanceTasks(filter: DateFilter = {}): Promise<MaintenanceTask[]> {
  const month = filter.month ?? 'all'
  const year = filter.year ?? 'all'
  const dateFilter = buildDateFilter(month, year, 'date')

  const rows = await sql`
    SELECT id, title, location, status, date, technician, amount, paid, description
    FROM maintenance_tasks
    WHERE TRUE ${dateFilter}
    ORDER BY date DESC
  `

  return rows.map(mapMaintenanceRow)
}

export async function getUpcomingMaintenance(): Promise<MaintenanceTask[]> {
  const rows = await sql`
    SELECT id, title, location, status, date, technician, amount, paid, description
    FROM maintenance_tasks
    WHERE date >= CURRENT_DATE
    ORDER BY date ASC
    LIMIT 5
  `

  return rows.map(mapMaintenanceRow)
}

export async function getLowStockParts(): Promise<InventoryItem[]> {
  const rows = await sql`
    SELECT id, name, code, quantity, purchase_price AS purchasePrice, selling_price AS sellingPrice, status, image, min_stock AS minStock, max_stock AS maxStock
    FROM inventory
    WHERE quantity < COALESCE(min_stock, 0)
    ORDER BY quantity ASC
    LIMIT 8
  `

  return rows.map((row: any) => ({
    id: Number(row.id),
    name: String(row.name ?? ''),
    code: String(row.code ?? ''),
    quantity: Number(row.quantity ?? 0),
    purchasePrice: Number(row.purchaseprice ?? row.purchasePrice ?? 0),
    sellingPrice: Number(row.sellingprice ?? row.sellingPrice ?? 0),
    status: String(row.status ?? ''),
    image: row.image ? String(row.image) : undefined,
    minStock: Number(row.minstock ?? row.minStock ?? 0),
    maxStock: Number(row.maxstock ?? row.maxStock ?? 0),
  }))
}

export async function getRevenueData(filter: DateFilter = {}): Promise<RevenuePoint[]> {
  const month = filter.month ?? 'all'
  const year = filter.year ?? 'all'
  const invoiceDateFilter = buildDateFilter(month, year, 'date')
  const maintenanceDateFilter = buildDateFilter(month, year, 'date')
  const projectDateFilter = buildDateFilter(month, year, 'deadline')
  const expenseDateFilter = buildDateFilter(month, year, 'date')

  const revenueRows = await sql`
    SELECT
      month,
      SUM(sales_revenue) AS salesRevenue,
      SUM(maintenance_revenue) AS maintenanceRevenue,
      SUM(project_revenue) AS projectRevenue,
      SUM(expenses) AS expenses
    FROM (
      SELECT EXTRACT(MONTH FROM date) AS month, amount AS sales_revenue, 0 AS maintenance_revenue, 0 AS project_revenue, 0 AS expenses
      FROM invoices
      WHERE (status = 'مدفوعة' OR status = 'paid' OR status = 'مكتمل') ${invoiceDateFilter}
      UNION ALL
      SELECT EXTRACT(MONTH FROM date) AS month, 0 AS sales_revenue, amount AS maintenance_revenue, 0 AS project_revenue, 0 AS expenses
      FROM maintenance_tasks
      WHERE (paid = true OR paid = 'true' OR paid = '1') ${maintenanceDateFilter}
      UNION ALL
      SELECT EXTRACT(MONTH FROM deadline) AS month, 0 AS sales_revenue, 0 AS maintenance_revenue, value AS project_revenue, 0 AS expenses
      FROM projects
      WHERE (paid = true OR paid = 'true' OR paid = '1') ${projectDateFilter}
      UNION ALL
      SELECT EXTRACT(MONTH FROM date) AS month, 0 AS sales_revenue, 0 AS maintenance_revenue, 0 AS project_revenue, amount AS expenses
      FROM expenses
      WHERE TRUE ${expenseDateFilter}
    ) AS combined
    GROUP BY month
    ORDER BY month
  `

  const dataMap = new Map<number, RevenuePoint>()

  for (const row of revenueRows as any[]) {
    const monthIndex = Number(row.month) - 1
    dataMap.set(monthIndex, {
      month: monthNames[monthIndex] ?? String(row.month),
      revenue: Number(row.salesrevenue ?? row.salesRevenue ?? 0) + Number(row.maintenancerevenue ?? row.maintenanceRevenue ?? 0) + Number(row.projectrevenue ?? row.projectRevenue ?? 0),
      salesRevenue: Number(row.salesrevenue ?? row.salesRevenue ?? 0),
      maintenanceRevenue: Number(row.maintenancerevenue ?? row.maintenanceRevenue ?? 0),
      projectRevenue: Number(row.projectrevenue ?? row.projectRevenue ?? 0),
      expenses: Number(row.expenses ?? 0),
    })
  }

  if (month !== 'all') {
    const monthIndex = Number(month) - 1
    const point = dataMap.get(monthIndex)
    return point ? [point] : [{
      month: monthNames[monthIndex] ?? month,
      revenue: 0,
      salesRevenue: 0,
      maintenanceRevenue: 0,
      projectRevenue: 0,
      expenses: 0,
    }]
  }

  return monthNames.map((name, index) => dataMap.get(index) ?? {
    month: name,
    revenue: 0,
    salesRevenue: 0,
    maintenanceRevenue: 0,
    projectRevenue: 0,
    expenses: 0,
  })
}

export async function getSalesData(): Promise<SalesPoint[]> {
  const rows = await sql`
    SELECT EXTRACT(MONTH FROM date) AS month, COUNT(*) AS sales
    FROM invoices
    GROUP BY month
    ORDER BY month
  `

  return (rows as any[]).map((row) => ({
    month: monthNames[Number(row.month) - 1] ?? String(row.month),
    sales: Number(row.sales ?? 0),
  }))
}


export interface NewCustomer {
  name: string
  company: string
  address: string
  phone: string
}

export async function getCustomers(): Promise<Customer[]> {
  const rows = await sql`
    SELECT id, name, company, address, phone
    FROM customers
    ORDER BY name
  `
  return rows.map((row: any) => ({
    id: Number(row.id),
    name: String(row.name ?? ''),
    company: String(row.company ?? ''),
    address: String(row.address ?? ''),
    phone: String(row.phone ?? ''),
  }))
}

export async function createCustomer(customer: NewCustomer): Promise<Customer> {
  const [inserted] = await sql`
    INSERT INTO customers (name, company, address, phone)
    VALUES (${customer.name}, ${customer.company}, ${customer.address}, ${customer.phone})
    RETURNING id, name, company, address, phone
  `

  return {
    id: Number(inserted.id),
    name: String(inserted.name ?? ''),
    company: String(inserted.company ?? ''),
    address: String(inserted.address ?? ''),
    phone: String(inserted.phone ?? ''),
  }
}

export async function updateCustomer(customer: Customer): Promise<Customer> {
  const [updated] = await sql`
    UPDATE customers
    SET name = ${customer.name}, company = ${customer.company}, address = ${customer.address}, phone = ${customer.phone}
    WHERE id = ${customer.id}
    RETURNING id, name, company, address, phone
  `

  return {
    id: Number(updated.id),
    name: String(updated.name ?? ''),
    company: String(updated.company ?? ''),
    address: String(updated.address ?? ''),
    phone: String(updated.phone ?? ''),
  }
}

export async function getContracts(): Promise<Contract[]> {
  const rows = await sql`
    SELECT id, client, type, value, start_date AS startDate, end_date AS endDate, status
    FROM contracts
    ORDER BY start_date DESC
  `

  return rows.map((row: any) => ({
    id: String(row.id),
    client: String(row.client ?? ''),
    type: String(row.type ?? ''),
    value: Number(row.value ?? 0),
    startDate: row.startdate ?? row.startDate ? String(row.startdate ?? row.startDate).slice(0, 10) : '',
    endDate: row.enddate ?? row.endDate ? String(row.enddate ?? row.endDate).slice(0, 10) : '',
    status: String(row.status ?? ''),
  }))
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const rows = await sql`
    SELECT id, title, date, type
    FROM calendar_events
    ORDER BY date ASC
    LIMIT 10
  `

  return rows.map((row: any) => ({
    id: Number(row.id),
    title: String(row.title ?? ''),
    date: row.date ? String(row.date).slice(0, 10) : '',
    type: String(row.type ?? ''),
  }))
}

export interface Employee {
  id: number
  name: string
  role: string
  salary: number
  phone: string
  status: string
  avatar: string
}

export interface NewEmployee {
  name: string
  role: string
  salary: number
  phone: string
  status: string
  avatar: string
}

export async function getEmployees(): Promise<Employee[]> {
  const rows = await sql`
    SELECT id, name, role, salary, phone, status, avatar
    FROM employees
    ORDER BY name
  `

  return rows.map((row: any) => ({
    id: Number(row.id),
    name: String(row.name ?? ''),
    role: String(row.role ?? ''),
    salary: Number(row.salary ?? 0),
    phone: String(row.phone ?? ''),
    status: String(row.status ?? ''),
    avatar: String(row.avatar ?? ''),
  }))
}

export async function createEmployee(employee: NewEmployee): Promise<Employee> {
  const [inserted] = await sql`
    INSERT INTO employees (name, role, salary, phone, status, avatar)
    VALUES (${employee.name}, ${employee.role}, ${employee.salary}, ${employee.phone}, ${employee.status}, ${employee.avatar})
    RETURNING id, name, role, salary, phone, status, avatar
  `

  return {
    id: Number(inserted.id),
    name: String(inserted.name ?? ''),
    role: String(inserted.role ?? ''),
    salary: Number(inserted.salary ?? 0),
    phone: String(inserted.phone ?? ''),
    status: String(inserted.status ?? ''),
    avatar: String(inserted.avatar ?? ''),
  }
}

export async function updateEmployee(id: number, employee: NewEmployee): Promise<Employee> {
  const [updated] = await sql`
    UPDATE employees
    SET name = ${employee.name}, role = ${employee.role}, salary = ${employee.salary}, phone = ${employee.phone}, status = ${employee.status}, avatar = ${employee.avatar}
    WHERE id = ${id}
    RETURNING id, name, role, salary, phone, status, avatar
  `

  return {
    id: Number(updated.id),
    name: String(updated.name ?? ''),
    role: String(updated.role ?? ''),
    salary: Number(updated.salary ?? 0),
    phone: String(updated.phone ?? ''),
    status: String(updated.status ?? ''),
    avatar: String(updated.avatar ?? ''),
  }
}

export async function deleteEmployee(id: number): Promise<void> {
  await sql`
    DELETE FROM employees
    WHERE id = ${id}
  `
}

export async function getInventory(): Promise<InventoryItem[]> {
  const rows = await sql`
    SELECT id, name, code, quantity, purchase_price AS purchasePrice, selling_price AS sellingPrice, status, image, min_stock AS minStock, max_stock AS maxStock
    FROM inventory
    ORDER BY name
  `

  return rows.map((row: any) => ({
    id: Number(row.id),
    name: String(row.name ?? ''),
    code: String(row.code ?? ''),
    quantity: Number(row.quantity ?? 0),
    purchasePrice: Number(row.purchaseprice ?? row.purchasePrice ?? 0),
    sellingPrice: Number(row.sellingprice ?? row.sellingPrice ?? 0),
    status: String(row.status ?? ''),
    image: row.image ? String(row.image) : undefined,
    minStock: Number(row.minstock ?? row.minStock ?? 0),
    maxStock: Number(row.maxstock ?? row.maxStock ?? 0),
  }))
}

export async function createInventory(item: NewInventoryItem): Promise<InventoryItem> {
  const [inserted] = await sql`
    INSERT INTO inventory (name, code, quantity, purchase_price, selling_price, status)
    VALUES (${item.name}, ${item.code}, ${item.quantity}, ${item.purchasePrice}, ${item.sellingPrice}, ${item.status})
    RETURNING id, name, code, quantity, purchase_price AS purchasePrice, selling_price AS sellingPrice, status, image, min_stock AS minStock, max_stock AS maxStock
  `

  return {
    id: Number(inserted.id),
    name: String(inserted.name ?? ''),
    code: String(inserted.code ?? ''),
    quantity: Number(inserted.quantity ?? 0),
    purchasePrice: Number(inserted.purchaseprice ?? inserted.purchasePrice ?? 0),
    sellingPrice: Number(inserted.sellingprice ?? inserted.sellingPrice ?? 0),
    status: String(inserted.status ?? ''),
    image: inserted.image ? String(inserted.image) : undefined,
    minStock: Number(inserted.minstock ?? inserted.minStock ?? 0),
    maxStock: Number(inserted.maxstock ?? inserted.maxStock ?? 0),
  }
}

export async function updateInventory(id: number, item: NewInventoryItem): Promise<InventoryItem> {
  const [updated] = await sql`
    UPDATE inventory
    SET name = ${item.name}, code = ${item.code}, quantity = ${item.quantity}, purchase_price = ${item.purchasePrice}, selling_price = ${item.sellingPrice}, status = ${item.status}
    WHERE id = ${id}
    RETURNING id, name, code, quantity, purchase_price AS purchasePrice, selling_price AS sellingPrice, status, image, min_stock AS minStock, max_stock AS maxStock
  `

  return {
    id: Number(updated.id),
    name: String(updated.name ?? ''),
    code: String(updated.code ?? ''),
    quantity: Number(updated.quantity ?? 0),
    purchasePrice: Number(updated.purchaseprice ?? updated.purchasePrice ?? 0),
    sellingPrice: Number(updated.sellingprice ?? updated.sellingPrice ?? 0),
    status: String(updated.status ?? ''),
    image: updated.image ? String(updated.image) : undefined,
    minStock: Number(updated.minstock ?? updated.minStock ?? 0),
    maxStock: Number(updated.maxstock ?? updated.maxStock ?? 0),
  }
}

export async function deleteInventory(id: number): Promise<void> {
  await sql`
    DELETE FROM inventory
    WHERE id = ${id}
  `
}

export interface NewProject {
  name: string
  client: string
  status: string
  progress: number
  deadline: string
  value: number
  team: string[]
  paid: boolean
}

export async function getProjects(filter: DateFilter = {}): Promise<Project[]> {
  const month = filter.month ?? 'all'
  const year = filter.year ?? 'all'
  const deadlineFilter = buildDateFilter(month, year, 'deadline')

  const rows = await sql`
    SELECT id, name, client, status, progress, deadline, value, team, paid
    FROM projects
    WHERE TRUE ${deadlineFilter}
    ORDER BY deadline ASC
  `

  return rows.map((row: any) => ({
    id: String(row.id),
    name: String(row.name ?? ''),
    client: String(row.client ?? ''),
    status: String(row.status ?? ''),
    progress: Number(row.progress ?? 0),
    deadline: row.deadline ? (row.deadline instanceof Date ? row.deadline.toISOString().slice(0, 10) : String(row.deadline).slice(0, 10)) : '',
    value: Number(row.value ?? 0),
    team: parseTeam(row.team),
    paid: Boolean(row.paid ?? false),
  }))
}

export async function createProject(project: NewProject): Promise<Project> {
  const generatedId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `proj-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

  const [inserted] = await sql`
    INSERT INTO projects (id, name, client, status, progress, deadline, value, team, paid)
    VALUES (${generatedId}, ${project.name}, ${project.client}, ${project.status}, ${project.progress}, ${project.deadline}, ${project.value}, ${project.team}, ${project.paid})
    RETURNING id, name, client, status, progress, deadline, value, team, paid
  `

  return {
    id: String(inserted.id),
    name: String(inserted.name ?? ''),
    client: String(inserted.client ?? ''),
    status: String(inserted.status ?? ''),
    progress: Number(inserted.progress ?? 0),
    deadline: inserted.deadline ? (inserted.deadline instanceof Date ? inserted.deadline.toISOString().slice(0, 10) : String(inserted.deadline).slice(0, 10)) : '',
    value: Number(inserted.value ?? 0),
    team: parseTeam(inserted.team),
    paid: Boolean(inserted.paid ?? false),
  }
}

export async function updateProject(project: Project): Promise<Project> {
  const [updated] = await sql`
    UPDATE projects
    SET name = ${project.name}, client = ${project.client}, status = ${project.status}, progress = ${project.progress}, deadline = ${project.deadline}, value = ${project.value}, team = ${project.team}, paid = ${project.paid}
    WHERE id = ${project.id}
    RETURNING id, name, client, status, progress, deadline, value, team, paid
  `

  return {
    id: String(updated.id),
    name: String(updated.name ?? ''),
    client: String(updated.client ?? ''),
    status: String(updated.status ?? ''),
    progress: Number(updated.progress ?? 0),
    deadline: updated.deadline ? (updated.deadline instanceof Date ? updated.deadline.toISOString().slice(0, 10) : String(updated.deadline).slice(0, 10)) : '',
    value: Number(updated.value ?? 0),
    team: parseTeam(updated.team),
    paid: Boolean(updated.paid ?? false),
  }
}

export async function deleteProject(id: string): Promise<void> {
  await sql`
    DELETE FROM projects
    WHERE id = ${id}
  `
}

export async function getExpenses(filter: DateFilter = {}): Promise<ExpenseItem[]> {
  const month = filter.month ?? 'all'
  const year = filter.year ?? 'all'
  const dateFilter = buildDateFilter(month, year, 'date')

  const rows = await sql`
    SELECT id, title, category, amount, date
    FROM expenses
    WHERE TRUE ${dateFilter}
    ORDER BY date DESC
  `

  return rows.map((row: any) => ({
    id: String(row.id),
    title: String(row.title ?? ''),
    category: String(row.category ?? ''),
    amount: Number(row.amount ?? 0),
    date: row.date ? (row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date).slice(0, 10)) : '',
  }))
}

export interface NewExpense {
  title: string
  category: string
  amount: number
  date: string
}

export async function createExpense(expense: NewExpense): Promise<ExpenseItem> {
  const id = `EXP-${Date.now()}`

  const [inserted] = await sql`
    INSERT INTO expenses (id, title, category, amount, date)
    VALUES (${id}, ${expense.title}, ${expense.category}, ${expense.amount}, ${expense.date})
    RETURNING id, title, category, amount, date
  `

  return {
    id: String(inserted.id),
    title: String(inserted.title ?? ''),
    category: String(inserted.category ?? ''),
    amount: Number(inserted.amount ?? 0),
    date: inserted.date ? String(inserted.date).slice(0, 10) : '',
  }
}

export async function updateExpense(expense: ExpenseItem): Promise<ExpenseItem> {
  const [updated] = await sql`
    UPDATE expenses
    SET title = ${expense.title}, category = ${expense.category}, amount = ${expense.amount}, date = ${expense.date}
    WHERE id = ${expense.id}
    RETURNING id, title, category, amount, date
  `

  return {
    id: String(updated.id),
    title: String(updated.title ?? ''),
    category: String(updated.category ?? ''),
    amount: Number(updated.amount ?? 0),
    date: updated.date ? String(updated.date).slice(0, 10) : '',
  }
}

export async function deleteExpense(id: string): Promise<void> {
  await sql`
    DELETE FROM expenses
    WHERE id = ${id}
  `
}

export interface ConsolidatedInput {
  id: string
  title: string
  category: string
  amount: number
  date: string
  source: 'sales' | 'maintenance' | 'project'
  sourceLabel: string
  paid: boolean
}

export async function getAllInputs(filter: DateFilter = {}): Promise<ConsolidatedInput[]> {
  const month = filter.month ?? 'all'
  const year = filter.year ?? 'all'
  const invoiceDateFilter = buildDateFilter(month, year, 'date')
  const maintenanceDateFilter = buildDateFilter(month, year, 'date')
  const projectDateFilter = buildDateFilter(month, year, 'deadline')

  const invoiceRows = await sql`
    SELECT id, client as title, item as category, amount, date, 'sales' as source, CASE WHEN status = 'مدفوعة' THEN true ELSE false END as paid
    FROM invoices
    WHERE TRUE ${invoiceDateFilter}
    ORDER BY date DESC
  `

  const maintenanceRows = await sql`
    SELECT CAST(id AS TEXT) as id, title, location as category, amount, date, 'maintenance' as source, paid
    FROM maintenance_tasks
    WHERE TRUE ${maintenanceDateFilter}
    ORDER BY date DESC
  `

  const projectRows = await sql`
    SELECT id, name as title, client as category, value as amount, deadline as date, 'project' as source, paid
    FROM projects
    WHERE TRUE ${projectDateFilter}
    ORDER BY deadline DESC
  `

  const allInputs: ConsolidatedInput[] = []

  for (const row of invoiceRows as any[]) {
    allInputs.push({
      id: String(row.id),
      title: String(row.title ?? ''),
      category: String(row.category ?? ''),
      amount: Number(row.amount ?? 0),
      date: row.date ? (row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date).slice(0, 10)) : '',
      source: 'sales',
      sourceLabel: 'مبيعات',
      paid: Boolean(row.paid ?? false),
    })
  }

  for (const row of maintenanceRows as any[]) {
    allInputs.push({
      id: String(row.id),
      title: String(row.title ?? ''),
      category: String(row.category ?? ''),
      amount: Number(row.amount ?? 0),
      date: row.date ? (row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date).slice(0, 10)) : '',
      source: 'maintenance',
      sourceLabel: 'صيانة',
      paid: Boolean(row.paid ?? false),
    })
  }

  for (const row of projectRows as any[]) {
    allInputs.push({
      id: String(row.id),
      title: String(row.title ?? ''),
      category: String(row.category ?? ''),
      amount: Number(row.amount ?? 0),
      date: row.date ? (row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date).slice(0, 10)) : '',
      source: 'project',
      sourceLabel: 'تركيب',
      paid: Boolean(row.paid ?? false),
    })
  }

  allInputs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return allInputs
}

export interface NewInvoice {
  client: string
  item: string
  quantity: number
  amount: number
  date: string
  status: string
}

export async function getSalesInvoices(filter: DateFilter = {}): Promise<Invoice[]> {
  const month = filter.month ?? 'all'
  const year = filter.year ?? 'all'
  const dateFilter = buildDateFilter(month, year, 'date')

  const rows = await sql`
    SELECT id, client, item, quantity, amount, date, status
    FROM invoices
    WHERE TRUE ${dateFilter}
    ORDER BY date DESC
  `

  return rows.map((row: any) => ({
    id: String(row.id),
    client: String(row.client ?? ''),
    item: String(row.item ?? ''),
    quantity: Number(row.quantity ?? 0),
    amount: Number(row.amount ?? 0),
    date: row.date ? (row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date).slice(0, 10)) : '',
    status: String(row.status ?? ''),
  }))
}

export async function createInvoice(invoice: NewInvoice): Promise<Invoice> {
  const generatedId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `inv-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

  const inputId = `INP-${Date.now()}`

  const inputStatus = invoice.status === 'مدفوعة' ? 'مكتمل' : 'قيد الانتظار'

  const results = await sql.transaction((sqlTx: any) => [
    sqlTx`
      INSERT INTO invoices (id, client, item, quantity, amount, date, status)
      VALUES (${generatedId}, ${invoice.client}, ${invoice.item}, ${invoice.quantity}, ${invoice.amount}, ${invoice.date}, ${invoice.status})
      RETURNING id, client, item, quantity, amount, date, status
    `,
    sqlTx`
      UPDATE inventory
      SET quantity = GREATEST(quantity - ${invoice.quantity}, 0)
      WHERE name = ${invoice.item}
    `,
    sqlTx`
      INSERT INTO inputs (id, title, type, category, amount, date, description, status)
      VALUES (${inputId}, ${invoice.client}, 'sales', ${invoice.item}, ${invoice.amount}, ${invoice.date}, ${`${invoice.quantity} x ${invoice.item}`}, ${inputStatus})
      RETURNING id, title, type, category, amount, date
    `,
  ])

  const inserted = results[0]?.[0]

  return {
    id: String(inserted?.id ?? generatedId),
    client: String(inserted?.client ?? invoice.client),
    item: String(inserted?.item ?? invoice.item),
    quantity: Number(inserted?.quantity ?? invoice.quantity),
    amount: Number(inserted?.amount ?? invoice.amount),
    date: inserted?.date ? (inserted.date instanceof Date ? inserted.date.toISOString().slice(0, 10) : String(inserted.date).slice(0, 10)) : invoice.date,
    status: String(inserted?.status ?? invoice.status),
  }
}

export async function updateInvoice(id: string, invoice: NewInvoice): Promise<Invoice> {
  const [updated] = await sql`
    UPDATE invoices
    SET client = ${invoice.client}, item = ${invoice.item}, quantity = ${invoice.quantity}, amount = ${invoice.amount}, date = ${invoice.date}, status = ${invoice.status}
    WHERE id = ${id}
    RETURNING id, client, item, quantity, amount, date, status
  `

  return {
    id: String(updated.id),
    client: String(updated.client ?? ''),
    item: String(updated.item ?? ''),
    quantity: Number(updated.quantity ?? 0),
    amount: Number(updated.amount ?? 0),
    date: updated.date ? (updated.date instanceof Date ? updated.date.toISOString().slice(0, 10) : String(updated.date).slice(0, 10)) : '',
    status: String(updated.status ?? ''),
  }
}

export async function deleteInvoice(id: string): Promise<void> {
  await sql`
    DELETE FROM invoices
    WHERE id = ${id}
  `
}

export async function deleteCustomer(id: number): Promise<void> {
  await sql`
    DELETE FROM customers
    WHERE id = ${id}
  `
}

export interface InputItem {
  id: string
  title: string
  type: 'sales' | 'installation' | 'maintenance'
  category: string
  amount: number
  date: string
  description?: string
  status: string
}

export interface NewInputItem {
  title: string
  type: 'sales' | 'installation' | 'maintenance'
  category: string
  amount: number
  date: string
  description?: string
  status: string
}

export async function getInputs(): Promise<InputItem[]> {
  const rows = await sql`
    SELECT id, title, type, category, amount, date, description, status
    FROM inputs
    ORDER BY date DESC
    LIMIT 50
  `

  return rows.map((row: any) => ({
    id: String(row.id),
    title: String(row.title ?? ''),
    type: String(row.type ?? 'sales') as 'sales' | 'installation' | 'maintenance',
    category: String(row.category ?? ''),
    amount: Number(row.amount ?? 0),
    date: row.date ? String(row.date).slice(0, 10) : '',
    description: row.description ? String(row.description) : undefined,
    status: String(row.status ?? ''),
  }))
}

export async function getInputsByType(type: 'sales' | 'installation' | 'maintenance'): Promise<InputItem[]> {
  const rows = await sql`
    SELECT id, title, type, category, amount, date, description, status
    FROM inputs
    WHERE type = ${type}
    ORDER BY date DESC
    LIMIT 50
  `

  return rows.map((row: any) => ({
    id: String(row.id),
    title: String(row.title ?? ''),
    type: String(row.type ?? 'sales') as 'sales' | 'installation' | 'maintenance',
    category: String(row.category ?? ''),
    amount: Number(row.amount ?? 0),
    date: row.date ? String(row.date).slice(0, 10) : '',
    description: row.description ? String(row.description) : undefined,
    status: String(row.status ?? ''),
  }))
}

export async function createInput(input: NewInputItem): Promise<InputItem> {
  const id = `INP-${Date.now()}`
  
  const [inserted] = await sql`
    INSERT INTO inputs (id, title, type, category, amount, date, description, status)
    VALUES (${id}, ${input.title}, ${input.type}, ${input.category}, ${input.amount}, ${input.date}, ${input.description || null}, ${input.status})
    RETURNING id, title, type, category, amount, date, description, status
  `

  return {
    id: String(inserted.id),
    title: String(inserted.title ?? ''),
    type: String(inserted.type ?? 'sales') as 'sales' | 'installation' | 'maintenance',
    category: String(inserted.category ?? ''),
    amount: Number(inserted.amount ?? 0),
    date: inserted.date ? String(inserted.date).slice(0, 10) : '',
    description: inserted.description ? String(inserted.description) : undefined,
    status: String(inserted.status ?? ''),
  }
}
