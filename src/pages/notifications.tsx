import { Bell } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { GlassCard } from '@/components/shared/page-header'

export default function NotificationsPage() {
  return (
    <div>
      <PageHeader title="الإشعارات" description="هذه الصفحة لم تعد جزءًا من التطبيق" icon={Bell} />
      <GlassCard>
        <p className="text-sm text-muted-foreground">تم إزالة صفحة الإشعارات بالكامل من هذا الإصدار.</p>
      </GlassCard>
    </div>
  )
}
