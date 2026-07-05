import { motion } from 'framer-motion'
import { useState } from 'react'
import { Package, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Modal } from '@/components/shared/modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useNeonQuery } from '@/hooks/use-neon-query'
import { getAllInputs, type ConsolidatedInput } from '@/lib/db-queries'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DateFilterSelects } from '@/components/shared/date-filter-selects'

const sourceVariant = (source: string) => {
  switch (source) {
    case 'sales': return 'secondary' as const
    case 'maintenance': return 'warning' as const
    case 'project': return 'info' as const
    default: return 'outline' as const
  }
}

const sourceLabel = (source: string) => {
  switch (source) {
    case 'sales': return 'مبيعات'
    case 'maintenance': return 'صيانة'
    case 'project': return 'تركيب'
    default: return source
  }
}

export default function InputsPage() {
  const [reloadInputs, setReloadInputs] = useState(0)
  const [selectedType, setSelectedType] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedPaid, setSelectedPaid] = useState('all')
  const [selectedInput, setSelectedInput] = useState<ConsolidatedInput | null>(null)
  const filter = { month: selectedMonth, year: selectedYear }
  const { data: inputs, loading } = useNeonQuery(() => getAllInputs(filter), [reloadInputs, selectedMonth, selectedYear], [])

  const filteredInputs = (inputs ?? []).filter((input) => {
    const typeMatch = selectedType === 'all' || input.source === selectedType
    const paidMatch = selectedPaid === 'all' || (selectedPaid === 'paid' && input.paid) || (selectedPaid === 'unpaid' && !input.paid)
    return typeMatch && paidMatch
  })

  return (
    <div>
      <PageHeader 
        title="المدخلات" 
        description="عرض المبيعات والصيانة والتركيب" 
        icon={Package}
      >
        <Button size="sm" onClick={() => setReloadInputs(p => p + 1)}>
          <Plus className="h-4 w-4" /> تحديث
        </Button>
      </PageHeader>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Tabs value={selectedType} onValueChange={setSelectedType} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="sales">مبيعات</TabsTrigger>
            <TabsTrigger value="maintenance">صيانة</TabsTrigger>
            <TabsTrigger value="project">تركيب</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2 flex-wrap">
          <DateFilterSelects
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
          <select
            value={selectedPaid}
            onChange={(e) => setSelectedPaid(e.target.value)}
            className="flex h-10 rounded-xl border border-input bg-background/50 px-4 py-2 text-sm"
          >
            <option value="all">كل الحالات</option>
            <option value="paid">مدفوع</option>
            <option value="unpaid">غير مدفوع</option>
          </select>
        </div>
      </div>

      <Modal 
        open={!!selectedInput} 
        title="تفاصيل المدخل" 
        description="" 
        onClose={() => setSelectedInput(null)}
      >
        {selectedInput && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">العنوان</span>
                <p className="text-lg font-semibold">{selectedInput.title}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">النوع</span>
                <p className="mt-1">
                  <Badge variant={sourceVariant(selectedInput.source)}>
                    {sourceLabel(selectedInput.source)}
                  </Badge>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">التفاصيل</span>
                <p className="text-base font-medium">{selectedInput.category}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">التاريخ</span>
                <p className="text-base font-medium">{formatDate(selectedInput.date)}</p>
              </div>
            </div>

            <div>
              <span className="text-sm text-muted-foreground">المبلغ</span>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedInput.amount)}</p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="secondary" onClick={() => setSelectedInput(null)}>
                إغلاق
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العنوان</TableHead>
              <TableHead>التفاصيل</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الحالة المالية</TableHead>
              <TableHead>النوع</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            ) : filteredInputs && filteredInputs.length > 0 ? (
              filteredInputs.map((input, index) => (
                <motion.tr
                  key={input.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedInput(input)}
                >
                  <TableCell className="font-medium">{input.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{input.category}</Badge>
                  </TableCell>
                  <TableCell className="text-green-600 font-semibold">{formatCurrency(input.amount)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(input.date)}</TableCell>
                  <TableCell>{input.paid ? 'مدفوع' : 'غير مدفوع'}</TableCell>
                  <TableCell>
                    <Badge variant={sourceVariant(input.source)}>{sourceLabel(input.source)}</Badge>
                  </TableCell>
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  لا توجد مدخلات بعد
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  )
}
