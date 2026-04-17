// Mock data for Elevator Company Admin Dashboard

export const employees = [
  { id: 1, name: "أحمد محمد", role: "فني تركيب", baseSalary: 4500, phone: "0501234567", joinDate: "2022-01-15" },
  { id: 2, name: "خالد العلي", role: "فني صيانة", baseSalary: 4800, phone: "0502345678", joinDate: "2022-03-20" },
  { id: 3, name: "محمد حسن", role: "مهندس", baseSalary: 8500, phone: "0503456789", joinDate: "2021-06-10" },
  { id: 4, name: "عبدالله سعيد", role: "فني تركيب", baseSalary: 4200, phone: "0504567890", joinDate: "2023-01-05" },
  { id: 5, name: "فهد الزهراني", role: "مشرف", baseSalary: 6500, phone: "0505678901", joinDate: "2021-11-15" },
  { id: 6, name: "سلطان الغامدي", role: "فني صيانة", baseSalary: 4600, phone: "0506789012", joinDate: "2022-08-12" },
];

export const salaryAdjustments = [
  { id: 1, employeeId: 1, month: "2024-01", type: "bonus", amount: 500, reason: "أداء متميز" },
  { id: 2, employeeId: 1, month: "2024-01", type: "deduction", amount: 200, reason: "تأخير" },
  { id: 3, employeeId: 2, month: "2024-01", type: "bonus", amount: 300, reason: "عمل إضافي" },
  { id: 4, employeeId: 3, month: "2024-01", type: "bonus", amount: 1000, reason: "إنجاز مشروع" },
  { id: 5, employeeId: 4, month: "2024-01", type: "deduction", amount: 150, reason: "غياب" },
];

export const spareParts = [
  { id: 1, name: "سلك كهربائي 10مم", category: "كهربائية", wholesalePrice: 35, retailPrice: 45, quantity: 150, minStock: 20, supplier: "شركة الكهرباء" },
  { id: 2, name: "محرك مصعد 5 حصان", category: "محركات", wholesalePrice: 2800, retailPrice: 3500, quantity: 12, minStock: 3, supplier: "مصاعد عالمية" },
  { id: 3, name: "بطارية طوارئ 12V", category: "كهربائية", wholesalePrice: 220, retailPrice: 280, quantity: 45, minStock: 10, supplier: "بطاريات القمة" },
  { id: 4, name: "قاعدة مقصورة", category: "هيكل", wholesalePrice: 950, retailPrice: 1200, quantity: 8, minStock: 5, supplier: "مصاعد عالمية" },
  { id: 5, name: "أزرار تحكم داخلية", category: "تحكم", wholesalePrice: 140, retailPrice: 180, quantity: 60, minStock: 15, supplier: "تك كنترول" },
  { id: 6, name: "لوحة تحكم رئيسية", category: "تحكم", wholesalePrice: 1800, retailPrice: 2200, quantity: 6, minStock: 2, supplier: "تك كنترول" },
  { id: 7, name: "كابلات تحكم 20م", category: "كهربائية", wholesalePrice: 250, retailPrice: 320, quantity: 25, minStock: 8, supplier: "شركة الكهرباء" },
  { id: 8, name: "باب مصرف داخلي", category: "هيكل", wholesalePrice: 680, retailPrice: 850, quantity: 18, minStock: 5, supplier: "مصاعد عالمية" },
];

export const clients = [
  { id: 1, name: "شركة الأمل العقارية", phone: "0112345678", email: "info@alamal.com", address: "الرياض، حي العليا" },
  { id: 2, name: "مجمع النخبة الطبية", phone: "0113456789", email: "contact@nabha.com", address: "جدة، حي الروضة" },
  { id: 3, name: "فندق النجم الذهبي", phone: "0114567890", email: "reservations@goldstar.com", address: "الدمام، الخليج" },
  { id: 4, name: "مؤسسة التعليم العالي", phone: "0115678901", email: "admin@eduinst.edu", address: "الرياض، حي الورود" },
  { id: 5, name: "مول السلام التجاري", phone: "0116789012", email: "info@salammall.com", address: "مكة، العزيزية" },
];

export const buildings = [
  { id: 1, clientId: 1, name: "برج الأمل 1", address: "الرياض، العليا، شارع العروبة", type: "سكني" },
  { id: 2, clientId: 1, name: "برج الأمل 2", address: "الرياض، العليا، شارع عمر بن الخطاب", type: "تجاري" },
  { id: 3, clientId: 2, name: "عيادات النخبة", address: "جدة، الروضة، شارارع فلسطين", type: "طبي" },
  { id: 4, clientId: 3, name: "فندق النجم الذهبي", address: "الدمام، الخليج، شارع الملك فهد", type: "فندقي" },
  { id: 5, clientId: 4, name: "مبنى كلية الهندسة", address: "الرياض، الورود، شارع الجامعة", type: "تعليمي" },
  { id: 6, clientId: 4, name: "مبنى الإدارة", address: "الرياض، الورود، شارع الجامعة", type: "تعليمي" },
  { id: 7, clientId: 5, name: "مول السلام", address: "مكة، العزيزية، طريق مكة جدة", type: "تجاري" },
];

export const elevators = [
  { id: 1, buildingId: 1, model: "KONE MonoSpace", capacity: 8, floors: 15, installDate: "2023-06-15", lastMaintenance: "2024-01-10", status: "active" },
  { id: 2, buildingId: 1, model: "KONE MonoSpace", capacity: 8, floors: 15, installDate: "2023-06-15", lastMaintenance: "2024-01-12", status: "active" },
  { id: 3, buildingId: 2, model: "Otis Gen2", capacity: 10, floors: 20, installDate: "2023-08-20", lastMaintenance: "2024-01-15", status: "active" },
  { id: 4, buildingId: 3, model: "Schindler 3300", capacity: 6, floors: 4, installDate: "2022-12-10", lastMaintenance: "2024-01-08", status: "maintenance" },
  { id: 5, buildingId: 4, model: "KONE MiniSpace", capacity: 15, floors: 25, installDate: "2021-05-20", lastMaintenance: "2024-01-20", status: "active" },
  { id: 6, buildingId: 5, model: "Otis Gen2", capacity: 12, floors: 8, installDate: "2022-09-01", lastMaintenance: "2024-01-18", status: "active" },
  { id: 7, buildingId: 6, model: "Schindler 5500", capacity: 8, floors: 5, installDate: "2022-09-01", lastMaintenance: "2024-01-18", status: "active" },
  { id: 8, buildingId: 7, model: "KONE EcoSpace", capacity: 20, floors: 3, installDate: "2023-02-15", lastMaintenance: "2024-01-22", status: "active" },
];

export const jobs = [
  { id: 1, type: "installation", clientId: 1, buildingId: 1, description: "تركيب 2 مصعد في برج الأمل 1", cost: 85000, date: "2023-05-10", completionDate: "2023-06-15", status: "completed", paymentStatus: "paid", assignedEmployees: [1, 4] },
  { id: 2, type: "installation", clientId: 2, buildingId: 3, description: "تركيب مصعد في عيادات النخبة", cost: 45000, date: "2023-11-01", completionDate: "2023-12-10", status: "completed", paymentStatus: "paid", assignedEmployees: [2, 6] },
  { id: 3, type: "maintenance", clientId: 3, buildingId: 4, description: "صيانة دورية لفندق النجم الذهبي", cost: 8500, date: "2024-01-15", completionDate: null, status: "pending", paymentStatus: "unpaid", assignedEmployees: [2, 5] },
  { id: 4, type: "repair", clientId: 2, buildingId: 3, description: "إصلاح عطل مفاجئ في المصعد", cost: 3500, date: "2024-01-18", completionDate: "2024-01-19", status: "completed", paymentStatus: "unpaid", assignedEmployees: [2] },
  { id: 5, type: "installation", clientId: 4, buildingId: 5, description: "تركيب مصعد في مبنى كلية الهندسة", cost: 65000, date: "2024-02-01", completionDate: null, status: "pending", paymentStatus: "unpaid", assignedEmployees: [1, 3, 4] },
  { id: 6, type: "maintenance", clientId: 1, buildingId: 2, description: "صيانة دورية لبرج الأمل 2", cost: 5000, date: "2024-01-20", completionDate: "2024-01-22", status: "completed", paymentStatus: "paid", assignedEmployees: [5, 6] },
  { id: 7, type: "modernization", clientId: 5, buildingId: 7, description: "تحديث نظام التحكم في مول السلام", cost: 25000, date: "2024-02-15", completionDate: null, status: "pending", paymentStatus: "partial", assignedEmployees: [3, 5] },
];

export const transactions = [
  { id: 1, type: "income", jobId: 1, clientId: 1, amount: 85000, date: "2023-06-20", description: "دفعة نهائية - تركيب برج الأمل 1" },
  { id: 2, type: "income", jobId: 2, clientId: 2, amount: 22500, date: "2023-11-15", description: "دفعة أولى - تركيب عيادات النخبة" },
  { id: 3, type: "income", jobId: 2, clientId: 2, amount: 22500, date: "2023-12-15", description: "دفعة نهائية - تركيب عيادات النخبة" },
  { id: 4, type: "income", jobId: 6, clientId: 1, amount: 5000, date: "2024-01-22", description: "صيانة برج الأمل 2" },
  { id: 5, type: "expense", jobId: null, clientId: null, amount: 32000, date: "2024-01-05", description: "شراء محركات مصاعد" },
  { id: 6, type: "expense", jobId: null, clientId: null, amount: 15000, date: "2024-01-10", description: "رواتب موظفين - يناير" },
  { id: 7, type: "expense", jobId: null, clientId: null, amount: 8500, date: "2024-01-12", description: "فاتورة كهرباء" },
  { id: 8, type: "expense", jobId: null, clientId: null, amount: 5000, date: "2024-01-15", description: "إيجار مستودع" },
];

export const users = [
  { id: 1, username: "admin", password: "admin123", name: "المشرف", role: "admin" },
];

// Helper functions
export function getEmployeeSalaries(month = "2024-01") {
  return employees.map(emp => {
    const adjustments = salaryAdjustments.filter(a => a.employeeId === emp.id && a.month === month);
    const bonuses = adjustments.filter(a => a.type === "bonus").reduce((sum, a) => sum + a.amount, 0);
    const deductions = adjustments.filter(a => a.type === "deduction").reduce((sum, a) => sum + a.amount, 0);
    const finalSalary = emp.baseSalary + bonuses - deductions;
    return { ...emp, bonuses, deductions, finalSalary };
  });
}

export function getInventoryValue() {
  return spareParts.reduce((sum, part) => sum + ((part.wholesalePrice || part.price || 0) * part.quantity), 0);
}

export function getLowStockItems() {
  return spareParts.filter(part => part.quantity <= part.minStock);
}

export function getBuildingElevators(buildingId) {
  return elevators.filter(e => e.buildingId === buildingId);
}

export function getClientBuildings(clientId) {
  return buildings.filter(b => b.clientId === clientId);
}

export function getJobDetails(jobId) {
  const job = jobs.find(j => j.id === jobId);
  if (!job) return null;
  
  const client = clients.find(c => c.id === job.clientId);
  const building = buildings.find(b => b.id === job.buildingId);
  const assignedEmps = employees.filter(e => job.assignedEmployees.includes(e.id));
  
  return { ...job, client, building, assignedEmps };
}

export function getFinancialSummary() {
  const totalRevenue = jobs.filter(j => j.paymentStatus === "paid").reduce((sum, j) => sum + j.cost, 0);
  const unpaidRevenue = jobs.filter(j => j.paymentStatus === "unpaid" || j.paymentStatus === "partial").reduce((sum, j) => {
    const paid = transactions.filter(t => t.jobId === j.id && t.type === "income").reduce((s, t) => s + t.amount, 0);
    return sum + (j.cost - paid);
  }, 0);
  const totalSalaries = employees.reduce((sum, e) => sum + e.baseSalary, 0);
  const inventoryValue = getInventoryValue();
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0) + totalSalaries;
  const netProfit = totalRevenue - totalExpenses;
  
  return {
    totalRevenue,
    unpaidRevenue,
    totalSalaries,
    inventoryValue,
    totalExpenses,
    netProfit,
  };
}

export function getMonthlyData() {
  const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  return months.map((month, index) => {
    const revenue = Math.floor(Math.random() * 50000) + 30000;
    const expenses = Math.floor(Math.random() * 30000) + 20000;
    return { month, revenue, expenses, profit: revenue - expenses };
  });
}
