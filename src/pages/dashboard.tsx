import {
  Users,
  FolderKanban,
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  UserCircle,
} from 'lucide-react'
import { StatCard } from '@/components/shared/stat-card'
import { GlassCard } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  RevenueChart,
  SalesChart,
  ReportsRevenueChart,
} from '@/components/charts/dashboard-charts'
import { useNeonQuery } from '@/hooks/use-neon-query'
import {
  getStats,
  getLatestProjects,
  getUpcomingMaintenance,
  getLowStockParts,
  getRevenueData,
  getSalesData,
} from '@/lib/db-queries'
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils'

const statusVariant = (status: string) => {
  switch (status) {
    case 'مكتمل': return 'success' as const
    case 'جاري': return 'info' as const
    case 'معلق': return 'warning' as const
    default: return 'secondary' as const
  }
}

const maintenanceStatusVariant = (status: string) => {
  switch (status) {
    case 'completed': return 'success' as const
    case 'in_progress': return 'info' as const
    case 'pending': return 'warning' as const
    default: return 'secondary' as const
  }
}

export default function DashboardPage() {
  const { data: stats } = useNeonQuery(getStats, [])
  const { data: latestProjects } = useNeonQuery(getLatestProjects, [])
  const { data: upcomingMaintenance } = useNeonQuery(getUpcomingMaintenance, [])
  const { data: lowStockParts } = useNeonQuery(getLowStockParts, [])
  const { data: revenueData } = useNeonQuery(getRevenueData, [])
  const { data: salesData } = useNeonQuery(getSalesData, [])

  const summary = stats ?? {
    customers: 0,
    projects: 0,
    activeProjects: 0,
    revenue: 0,
    expenses: 0,
    profit: 0,
    employees: 0,
    inventory: 0,
  }

  const projects = latestProjects ?? []
  const maintenance = upcomingMaintenance ?? []
  const lowStock = lowStockParts ?? []
  const revenue = revenueData ?? []
  const sales = salesData ?? []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="إجمالي العملاء" value={formatNumber(summary.customers)} icon={UserCircle} delay={0} />
        <StatCard title="إجمالي المشاريع" value={formatNumber(summary.projects)} icon={FolderKanban} delay={0.05} />
        <StatCard title="المشاريع الجارية" value={formatNumber(summary.activeProjects)} icon={Activity} delay={0.1} />
        <StatCard title="الإيرادات" value={formatCurrency(summary.revenue)} icon={TrendingUp} delay={0.15} />
        <StatCard title="المصروفات" value={formatCurrency(summary.expenses)} icon={TrendingDown} delay={0.2} />
        <StatCard title="الأرباح" value={formatCurrency(summary.profit)} icon={DollarSign} delay={0.25} />
        <StatCard title="الموظفين" value={formatNumber(summary.employees)} icon={Users} delay={0.3} />
        <StatCard title="المخزون" value={formatNumber(summary.inventory)} icon={Package} delay={0.35} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <RevenueChart data={revenue} />
        <SalesChart data={sales} />
      </div>

      <ReportsRevenueChart data={revenue} />

      <GlassCard delay={0.45}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">أحدث المشاريع</h3>
          <Badge variant="outline">5 مشاريع</Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المشروع</TableHead>
              <TableHead>العميل</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>التقدم</TableHead>
              <TableHead>القيمة</TableHead>
              <TableHead>التسليم</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell className="text-muted-foreground">{project.client}</TableCell>
                <TableCell><Badge variant={statusVariant(project.status)}>{project.status}</Badge></TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <Progress value={project.progress} className="h-1.5" />
                    <span className="text-xs text-muted-foreground">{project.progress}%</span>
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(project.value)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{formatDate(project.deadline)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard delay={0.55}>
          <h3 className="text-base font-semibold mb-4">الصيانة القادمة</h3>
          <div className="space-y-3">
            {maintenance.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">{item.location}</p>
                  <p className="text-xs text-muted-foreground">{item.location} · {item.technician}</p>
                </div>
                <div className="text-left">
                  <Badge variant={maintenanceStatusVariant(item.status)}>{item.status}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(item.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard delay={0.6}>
        <h3 className="text-base font-semibold mb-4">قطع غيار منخفضة المخزون</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {lowStock.map((part) => (
            <div key={part.id} className="p-4 rounded-xl border border-destructive/20 bg-destructive/5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{part.name}</p>
                <Badge variant="destructive">{part.quantity} متبقي</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{part.code}</p>
              <Progress value={(part.quantity / part.minStock) * 100} className="h-1.5" indicatorClassName="bg-destructive" />
              <p className="text-xs text-muted-foreground mt-1">الحد الأدنى: {part.minStock}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
