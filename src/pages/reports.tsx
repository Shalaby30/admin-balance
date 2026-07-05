import { useState } from 'react'
import { BarChart3, TrendingUp, TrendingDown, DollarSign, AlertCircle, ShoppingCart, Wrench, FolderKanban } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { DateFilterSelects } from '@/components/shared/date-filter-selects'
import { PaidRevenueBarChart, PaidRevenuePieChart, ReportsRevenueChart } from '@/components/charts/dashboard-charts'
import { useNeonQuery } from '@/hooks/use-neon-query'
import { getStats, getRevenueData } from '@/lib/db-queries'
import { formatCurrency } from '@/lib/utils'

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')
  const filter = { month: selectedMonth, year: selectedYear }

  const { data: stats, loading } = useNeonQuery(() => getStats(filter), [selectedMonth, selectedYear])
  const { data: revenueData } = useNeonQuery(() => getRevenueData(filter), [selectedMonth, selectedYear])

  const summary = stats ?? {
    revenue: 0,
    salesRevenue: 0,
    maintenanceRevenue: 0,
    projectRevenue: 0,
    expenses: 0,
    profit: 0,
    unpaidTotal: 0,
  }

  const paidRevenueChartData = [
    { name: 'المبيعات', value: summary.salesRevenue, color: 'var(--color-chart-1)' },
    { name: 'الصيانة', value: summary.maintenanceRevenue, color: 'var(--color-chart-2)' },
    { name: 'التركيب', value: summary.projectRevenue, color: 'var(--color-chart-3)' },
    { name: 'المصروفات', value: summary.expenses, color: 'var(--color-chart-4)' },
  ]

  const paidSourcesPieData = [
    { name: 'المبيعات', value: summary.salesRevenue, color: 'var(--color-chart-1)' },
    { name: 'الصيانة', value: summary.maintenanceRevenue, color: 'var(--color-chart-2)' },
    { name: 'التركيب', value: summary.projectRevenue, color: 'var(--color-chart-3)' },
  ]

  return (
    <div>
      <PageHeader title="التقارير" description="تحليلات شاملة لأداء الشركة (الإيرادات المدفوعة فقط)" icon={BarChart3}>
        <DateFilterSelects
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />
      </PageHeader>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">جاري تحميل البيانات...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="إجمالي الإيرادات (مدفوع)" value={formatCurrency(summary.revenue)} icon={TrendingUp} />
            <StatCard title="إجمالي المصروفات" value={formatCurrency(summary.expenses)} icon={TrendingDown} />
            <StatCard title="صافي الربح" value={formatCurrency(summary.profit)} icon={DollarSign} />
            <StatCard title="المبالغ غير المدفوعة" value={formatCurrency(summary.unpaidTotal)} icon={AlertCircle} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard title="مبيعات (مدفوع)" value={formatCurrency(summary.salesRevenue)} icon={ShoppingCart} />
            <StatCard title="صيانة (مدفوع)" value={formatCurrency(summary.maintenanceRevenue)} icon={Wrench} />
            <StatCard title="تركيب (مدفوع)" value={formatCurrency(summary.projectRevenue)} icon={FolderKanban} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <PaidRevenueBarChart data={paidRevenueChartData} />
            <PaidRevenuePieChart data={paidSourcesPieData} />
          </div>

          {revenueData && revenueData.length > 0 && (
            <ReportsRevenueChart data={revenueData} />
          )}
        </>
      )}
    </div>
  )
}
