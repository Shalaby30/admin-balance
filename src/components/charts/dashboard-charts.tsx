import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadialBarChart,
  RadialBar,
} from 'recharts'
import { GlassCard } from '@/components/shared/page-header'
import type {
  ExpenseItem,
  RevenuePoint,
  SalesPoint,
} from '@/lib/db-queries'

const tooltipStyle = {
  backgroundColor: 'var(--color-popover)',
  border: '1px solid var(--color-border)',
  borderRadius: '12px',
  fontSize: '12px',
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <GlassCard delay={0.2}>
      <h3 className="text-base font-semibold mb-4">تحليل المدخلات الشهرية</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [Number(v).toLocaleString('ar-SA'), '']} />
          <Legend />
          <Bar dataKey="salesRevenue" name="المبيعات" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="maintenanceRevenue" name="الصيانة" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="projectRevenue" name="التركيب" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expenses" name="المصروفات" fill="var(--color-chart-4)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}

export function PaidRevenueBarChart({ data }: { data: Array<{ name: string; value: number; color: string }> }) {
  return (
    <GlassCard delay={0.25}>
      <h3 className="text-base font-semibold mb-4">المدخلات المدفوعة vs المصروفات</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [Number(v).toLocaleString('ar-SA'), '']} />
          <Bar dataKey="value" name="القيمة" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`${entry.name}-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}

export function PaidRevenuePieChart({ data }: { data: Array<{ name: string; value: number; color: string }> }) {
  return (
    <GlassCard delay={0.3}>
      <h3 className="text-base font-semibold mb-4">التركيب والمبيعات والصيانة</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`${entry.name}-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [Number(v).toLocaleString('ar-SA'), '']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}

export function SalesChart({ data }: { data: SalesPoint[] }) {
  return (
    <GlassCard delay={0.3}>
      <h3 className="text-base font-semibold mb-4">المبيعات الشهرية</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="sales" name="المبيعات" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}

export function ProjectStatusChart({ data }: { data: Array<{ name: string; value: number; color: string }> }) {
  return (
    <GlassCard delay={0.35}>
      <h3 className="text-base font-semibold mb-4">حالة المشاريع</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}

export function EmployeePerformanceChart({ data }: { data: Array<{ name: string; completed: number; rating: number }> }) {
  return (
    <GlassCard delay={0.4}>
      <h3 className="text-base font-semibold mb-4">أداء الموظفين</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={60} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="completed" name="المهام المكتملة" fill="var(--color-chart-2)" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}

export function ExpensesChart({ data }: { data: ExpenseItem[] }) {
  return (
    <GlassCard delay={0.2}>
      <h3 className="text-base font-semibold mb-4">توزيع المصروفات</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={110}
            dataKey="amount"
            nameKey="category"
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={`var(--color-chart-${(index % 5) + 1})`} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toLocaleString('ar-SA')} ر.س`, '']} />
        </PieChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}

export function ExpensesBarChart({ data }: { data: ExpenseItem[] }) {
  return (
    <GlassCard delay={0.3}>
      <h3 className="text-base font-semibold mb-4">المصروفات بالفئة</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="category" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toLocaleString('ar-SA')} ر.س`, '']} />
          <Bar dataKey="amount" name="المبلغ" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}

export function ReportsRevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <GlassCard delay={0.1}>
      <h3 className="text-base font-semibold mb-4">الإيرادات والمصروفات السنوية</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [Number(v).toLocaleString('ar-SA'), '']} />
          <Legend />
          <Bar dataKey="revenue" name="الإيرادات" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expenses" name="المصروفات" fill="var(--color-chart-4)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}

export function ReportsRadialChart() {
  const data = [{ name: 'الإنجاز', value: 78, fill: 'var(--color-chart-2)' }]
  return (
    <GlassCard delay={0.2}>
      <h3 className="text-base font-semibold mb-4">نسبة تحقيق الأهداف</h3>
      <ResponsiveContainer width="100%" height={320}>
        <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={data} startAngle={180} endAngle={0}>
          <RadialBar dataKey="value" cornerRadius={10} fill="var(--color-chart-2)" />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-3xl font-bold">
            78%
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}
