export const stats = {
  customers: 248,
  projects: 156,
  activeProjects: 42,
  revenue: 4850000,
  expenses: 1240000,
  profit: 3610000,
  employees: 68,
  inventory: 1240,
}

export const revenueData = [
  { month: 'يناير', revenue: 320000, expenses: 98000 },
  { month: 'فبراير', revenue: 380000, expenses: 105000 },
  { month: 'مارس', revenue: 420000, expenses: 112000 },
  { month: 'أبريل', revenue: 390000, expenses: 108000 },
  { month: 'مايو', revenue: 450000, expenses: 115000 },
  { month: 'يونيو', revenue: 480000, expenses: 120000 },
  { month: 'يوليو', revenue: 520000, expenses: 125000 },
  { month: 'أغسطس', revenue: 490000, expenses: 118000 },
  { month: 'سبتمبر', revenue: 550000, expenses: 130000 },
  { month: 'أكتوبر', revenue: 580000, expenses: 135000 },
  { month: 'نوفمبر', revenue: 610000, expenses: 140000 },
  { month: 'ديسمبر', revenue: 640000, expenses: 145000 },
]

export const salesData = [
  { month: 'يناير', sales: 12 },
  { month: 'فبراير', sales: 15 },
  { month: 'مارس', sales: 18 },
  { month: 'أبريل', sales: 14 },
  { month: 'مايو', sales: 20 },
  { month: 'مايو', sales: 22 },
  { month: 'يوليو', sales: 25 },
  { month: 'أغسطس', sales: 23 },
  { month: 'سبتمبر', sales: 28 },
  { month: 'أكتوبر', sales: 30 },
  { month: 'نوفمبر', sales: 32 },
  { month: 'ديسمبر', sales: 35 },
]

export const projectStatusData = [
  { name: 'مكتمل', value: 45, color: 'var(--color-chart-2)' },
  { name: 'جاري', value: 30, color: 'var(--color-chart-1)' },
  { name: 'معلق', value: 15, color: 'var(--color-chart-3)' },
  { name: 'متأخر', value: 10, color: 'var(--color-chart-4)' },
]

export const employeePerformance = [
  { name: 'أحمد', completed: 28, rating: 95 },
  { name: 'محمد', completed: 24, rating: 88 },
  { name: 'خالد', completed: 22, rating: 92 },
  { name: 'سعود', completed: 20, rating: 85 },
  { name: 'فهد', completed: 18, rating: 90 },
  { name: 'عبدالله', completed: 16, rating: 82 },
]

export const latestProjects = [
  { id: 'PRJ-001', name: 'برج المملكة - طابق 45', client: 'شركة المملكة القابضة', status: 'جاري', progress: 75, deadline: '2026-08-15', value: 850000 },
  { id: 'PRJ-002', name: 'مجمع النخيل السكني', client: 'مؤسسة النخيل', status: 'جاري', progress: 45, deadline: '2026-10-20', value: 620000 },
  { id: 'PRJ-003', name: 'مستشفى الملك فيصل', client: 'وزارة الصحة', status: 'مكتمل', progress: 100, deadline: '2026-06-01', value: 1200000 },
  { id: 'PRJ-004', name: 'فندق الريتز كارلton', client: 'مجموعة فنادق الريتز', status: 'معلق', progress: 10, deadline: '2026-12-01', value: 980000 },
  { id: 'PRJ-005', name: 'مركز التسوق الحديث', client: 'شركة التسوق المتحدة', status: 'جاري', progress: 60, deadline: '2026-09-30', value: 750000 },
]

export const recentActivities = [
  { id: 1, action: 'تم إكمال مشروع', target: 'مستشفى الملك فيصل', user: 'أحمد محمد', time: 'منذ 5 دقائق', type: 'success' },
  { id: 2, action: 'فاتورة جديدة', target: 'INV-2026-089', user: 'سارة العتيبي', time: 'منذ 15 دقيقة', type: 'info' },
  { id: 3, action: 'طلب صيانة', target: 'برج الفaisaliah', user: 'خالد السالم', time: 'منذ 30 دقيقة', type: 'warning' },
  { id: 4, action: 'عميل جديد', target: 'شركة التقنية المتقدمة', user: 'فهد الدوسري', time: 'منذ ساعة', type: 'info' },
  { id: 5, action: 'تنبيه مخزون', target: 'كables كهربائية', user: 'النظام', time: 'منذ ساعتين', type: 'destructive' },
]

export const upcomingMaintenance = [
  { id: 'MNT-001', location: 'برج المملكة - B2', type: 'صيانة دورية', date: '2026-07-05', technician: 'محمد العنzi', priority: 'عادي' },
  { id: 'MNT-002', location: 'مجمع النخيل - برج A', type: 'فحص سلامة', date: '2026-07-06', technician: 'خالد المطيري', priority: 'عاجل' },
  { id: 'MNT-003', location: 'فندق الريتز - الطابق 12', type: 'إصلاح طارئ', date: '2026-07-07', technician: 'سعود الحربي', priority: 'حرج' },
  { id: 'MNT-004', location: 'مركز التسوق - المدخل 3', type: 'صيانة دورية', date: '2026-07-08', technician: 'عبدالله القحطاني', priority: 'عادي' },
]

export const lowStockParts = [
  { id: 'PRT-001', name: 'كابل تحكم 12mm', code: 'CBL-12-001', quantity: 8, minStock: 20, price: 450 },
  { id: 'PRT-002', name: 'محرك رئيسي 15HP', code: 'MTR-15-002', quantity: 3, minStock: 10, price: 12500 },
  { id: 'PRT-003', name: 'لوحة تحكم رقمية', code: 'PNL-DG-003', quantity: 5, minStock: 15, price: 8900 },
  { id: 'PRT-004', name: 'بكرة توتر 800mm', code: 'SHV-800-004', quantity: 6, minStock: 12, price: 3200 },
]

export const employees = [
  { id: 1, name: 'أحمد محمد العتيبي', role: 'مهندس مصاعد', salary: 15000, phone: '0501234567', status: 'نشط', avatar: 'https://i.pravatar.cc/150?img=12' },
  { id: 2, name: 'محمد خالد السالم', role: 'فني صيانة', salary: 8500, phone: '0502345678', status: 'نشط', avatar: 'https://i.pravatar.cc/150?img=33' },
  { id: 3, name: 'خالد عبدالله المطيري', role: 'مشرف مشاريع', salary: 12000, phone: '0503456789', status: 'نشط', avatar: 'https://i.pravatar.cc/150?img=52' },
  { id: 4, name: 'سعود فهد الحربي', role: 'فني تركيب', salary: 7500, phone: '0504567890', status: 'إجازة', avatar: 'https://i.pravatar.cc/150?img=68' },
  { id: 5, name: 'فهد عبدالرحمن الدوسري', role: 'مهندس مبيعات', salary: 11000, phone: '0505678901', status: 'نشط', avatar: 'https://i.pravatar.cc/150?img=15' },
  { id: 6, name: 'عبدالله سعد القحطاني', role: 'فني صيانة', salary: 8000, phone: '0506789012', status: 'نشط', avatar: 'https://i.pravatar.cc/150?img=22' },
  { id: 7, name: 'سارة نasser العمري', role: 'محاسبة', salary: 9500, phone: '0507890123', status: 'نشط', avatar: 'https://i.pravatar.cc/150?img=47' },
  { id: 8, name: 'نورة محمد الشمري', role: 'خدمة عملاء', salary: 7000, phone: '0508901234', status: 'نشط', avatar: 'https://i.pravatar.cc/150?img=44' },
]

export const inventory = [
  { id: 1, name: 'محرك رئيسي 15HP', code: 'MTR-15-002', quantity: 25, purchasePrice: 10000, sellingPrice: 12500, status: 'متوفر', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=200&h=200&fit=crop', maxStock: 50 },
  { id: 2, name: 'كابل تحكم 12mm', code: 'CBL-12-001', quantity: 8, purchasePrice: 350, sellingPrice: 450, status: 'منخفض', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', maxStock: 100 },
  { id: 3, name: 'لوحة تحكم رقمية', code: 'PNL-DG-003', quantity: 18, purchasePrice: 7000, sellingPrice: 8900, status: 'متوفر', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop', maxStock: 30 },
  { id: 4, name: 'بكرة توتر 800mm', code: 'SHV-800-004', quantity: 6, purchasePrice: 2500, sellingPrice: 3200, status: 'منخفض', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=200&h=200&fit=crop', maxStock: 24 },
  { id: 5, name: 'مكابح أمان', code: 'BRK-SF-005', quantity: 42, purchasePrice: 2200, sellingPrice: 2800, status: 'متوفر', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=200&h=200&fit=crop', maxStock: 60 },
  { id: 6, name: 'حبل فولاذي 12mm', code: 'CBL-ST-006', quantity: 35, purchasePrice: 1400, sellingPrice: 1800, status: 'متوفر', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', maxStock: 80 },
]

export const customers = [
  { id: 1, name: 'عبدالله الراشد', company: 'شركة المملكة القابضة', address: 'الرياض، حي العليا', phone: '0112345678' },
  { id: 2, name: 'محمد العنزي', company: 'مؤسسة النخيل', address: 'الرياض، حي النخيل', phone: '0113456789' },
  { id: 3, name: 'فهد السالم', company: 'وزارة الصحة', address: 'الرياض، حي الملز', phone: '0114567890' },
  { id: 4, name: 'سعود المطيري', company: 'مجموعة فنادق الريتز', address: 'جدة، حي الروضة', phone: '0115678901' },
  { id: 5, name: 'خالد الدوسري', company: 'شركة التسوق المتحدة', address: 'الدمام، حي الشاطئ', phone: '0116789012' },
  { id: 6, name: 'نورة الشمري', company: 'شركة التقنية المتقدمة', address: 'الخبر، حي العزيزية', phone: '0117890123' },
]

export const projects = [
  { id: 'PRJ-001', name: 'برج المملكة - طابق 45', client: 'شركة المملكة القابضة', progress: 75, status: 'جاري', team: ['أحمد', 'محمد', 'خالد'], deadline: '2026-08-15', value: 850000 },
  { id: 'PRJ-002', name: 'مجمع النخيل السكني', client: 'مؤسسة النخيل', progress: 45, status: 'جاري', team: ['سعود', 'فهد'], deadline: '2026-10-20', value: 620000 },
  { id: 'PRJ-003', name: 'مستشفى الملك فيصل', client: 'وزارة الصحة', progress: 100, status: 'مكتمل', team: ['أحمد', 'عبدالله', 'نورة'], deadline: '2026-06-01', value: 1200000 },
  { id: 'PRJ-004', name: 'فندق الريتز كارlton', client: 'مجموعة فنادق الريتز', progress: 10, status: 'معلق', team: ['خالد'], deadline: '2026-12-01', value: 980000 },
  { id: 'PRJ-005', name: 'مركز التسوق الحديث', client: 'شركة التسوق المتحدة', progress: 60, status: 'جاري', team: ['محمد', 'سعود', 'فهد'], deadline: '2026-09-30', value: 750000 },
  { id: 'PRJ-006', name: 'برج الأعمال - المرحلة 2', client: 'شركة التقنية المتقدمة', progress: 30, status: 'جاري', team: ['أحمد', 'خالد'], deadline: '2026-11-15', value: 540000 },
]

export const maintenanceTasks = [
  { id: 'MNT-001', title: 'صيانة دورية - برج المملكة', location: 'برج المملكة - B2', status: 'pending', date: '2026-07-05', technician: 'محمد العنzi', description: 'فحص شامل للمصعد رقم 3' },
  { id: 'MNT-002', title: 'فحص سلامة - مجمع النخيل', location: 'مجمع النخيل - برج A', status: 'in_progress', date: '2026-07-06', technician: 'خالد المطيري', description: 'فحص أنظمة الأمان والطوارئ' },
  { id: 'MNT-003', title: 'إصلاح طارئ - فندق الريتز', location: 'فندق الريتز - الطابق 12', status: 'in_progress', date: '2026-07-07', technician: 'سعود الحربي', description: 'إصلاح عطل في نظام التحكم' },
  { id: 'MNT-004', title: 'صيانة دورية - مركز التسوق', location: 'مركز التسوق - المدخل 3', status: 'completed', date: '2026-07-01', technician: 'عبدالله القحطاني', description: 'تم إكمال الصيانة بنجاح' },
  { id: 'MNT-005', title: 'تركيب قطع غيار - برج الفaisaliah', location: 'برج الفaisaliah', status: 'pending', date: '2026-07-10', technician: 'أحمد العتيبي', description: 'استبدال كables التحكم' },
  { id: 'MNT-006', title: 'معاينة ما قبل التسليم', location: 'مستشفى الملك فيصل', status: 'completed', date: '2026-06-28', technician: 'فهد الدوسري', description: 'معاينة نهائية قبل التسليم' },
]

export const invoices = [
  { id: 'INV-2026-089', client: 'شركة المملكة القابضة', item: 'محرك رئيسي 15HP', quantity: 2, amount: 25000, date: '2026-07-01', status: 'مدفوعة' },
  { id: 'INV-2026-088', client: 'مؤسسة النخيل', item: 'كابل تحكم 12mm', quantity: 50, amount: 22500, date: '2026-06-28', status: 'غير مدفوعة' },
  { id: 'INV-2026-087', client: 'وزارة الصحة', item: 'لوحة تحكم رقمية', quantity: 3, amount: 26700, date: '2026-06-25', status: 'مدفوعة' },
  { id: 'INV-2026-086', client: 'مجموعة فنادق الريتز', item: 'بكرة توتر 800mm', quantity: 5, amount: 16000, date: '2026-06-20', status: 'غير مدفوعة' },
  { id: 'INV-2026-085', client: 'شركة التسوق المتحدة', item: 'مكابح أمان', quantity: 10, amount: 28000, date: '2026-06-15', status: 'مدفوعة' },
  { id: 'INV-2026-084', client: 'شركة التقنية المتقدمة', item: 'حبل فولاذي 12mm', quantity: 15, amount: 27000, date: '2026-06-10', status: 'غير مدفوعة' },
  { id: 'INV-2026-083', client: 'شركة المملكة القابضة', item: 'محرك رئيسي 15HP', quantity: 1, amount: 12500, date: '2026-06-05', status: 'مدفوعة' },
]

export const expenses = [
  { id: 'EXP-001', title: 'رواتب الموظفين', category: 'رواتب', amount: 485000, date: '2026-07-01', icon: 'users' },
  { id: 'EXP-002', title: 'قطع غيار ومستلزمات', category: 'مشتريات', amount: 125000, date: '2026-06-28', icon: 'package' },
  { id: 'EXP-003', title: 'إيجار المستودع', category: 'إيجارات', amount: 45000, date: '2026-06-25', icon: 'building' },
  { id: 'EXP-004', title: 'وقود ومواصلات', category: 'تشغيل', amount: 18000, date: '2026-06-22', icon: 'fuel' },
  { id: 'EXP-005', title: 'تأمين المعدات', category: 'تأمين', amount: 32000, date: '2026-06-20', icon: 'shield' },
  { id: 'EXP-006', title: 'صيانة المركبات', category: 'صيانة', amount: 8500, date: '2026-06-18', icon: 'wrench' },
  { id: 'EXP-007', title: 'مصروفات الإنترنت', category: 'اتصالات', amount: 2500, date: '2026-06-15', icon: 'wifi' },
  { id: 'EXP-008', title: 'مشروبات ومأكولات', category: 'مشروبات', amount: 3200, date: '2026-06-12', icon: 'coffee' },
]

export const expenseChartData = [
  { category: 'رواتب', amount: 485000 },
  { category: 'مشتريات', amount: 125000 },
  { category: 'إيجارات', amount: 45000 },
  { category: 'تشغيل', amount: 18000 },
  { category: 'تأمين', amount: 32000 },
  { category: 'صيانة', amount: 8500 },
  { category: 'اتصالات', amount: 2500 },
  { category: 'مشروبات', amount: 3200 },
]

export const calendarEvents = [
  { id: 1, title: 'صيانة برج المملكة', date: '2026-07-05', type: 'maintenance' },
  { id: 2, title: 'اجتماع مع عميل', date: '2026-07-06', type: 'meeting' },
  { id: 3, title: 'تسليم مشروع', date: '2026-07-08', type: 'delivery' },
  { id: 4, title: 'تدريب فني', date: '2026-07-10', type: 'training' },
  { id: 5, title: 'فحص سلامة', date: '2026-07-12', type: 'inspection' },
]

export const contracts = [
  { id: 'CNT-001', client: 'شركة المملكة القابضة', type: 'تركيب', value: 850000, startDate: '2026-01-15', endDate: '2026-08-15', status: 'نشط' },
  { id: 'CNT-002', client: 'وزارة الصحة', type: 'صيانة سنوية', value: 240000, startDate: '2026-01-01', endDate: '2026-12-31', status: 'نشط' },
  { id: 'CNT-003', client: 'مجموعة فنادق الريتز', type: 'تركيب', value: 980000, startDate: '2026-03-01', endDate: '2026-12-01', status: 'معلق' },
]
