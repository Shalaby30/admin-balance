import { motion } from 'framer-motion'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Receipt, Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Modal } from '@/components/shared/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useNeonQuery } from '@/hooks/use-neon-query'
import { createExpense, deleteExpense, getExpenses, updateExpense } from '@/lib/db-queries'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DateFilterSelects } from '@/components/shared/date-filter-selects'

export default function ExpensesPage() {
  const [reloadExpenses, setReloadExpenses] = useState(0)
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const filter = { month: selectedMonth, year: selectedYear }
  const { data: expenses, loading } = useNeonQuery(() => getExpenses(filter), [reloadExpenses, selectedMonth, selectedYear], [])

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingExpenseId(null)
    setTitle('')
    setCategory('')
    setAmount('')
    setDate('')
  }

  const openEditModal = (expense: { id: string; title: string; category: string; amount: number; date: string }) => {
    setEditingExpenseId(expense.id)
    setTitle(expense.title)
    setCategory(expense.category)
    setAmount(String(expense.amount))
    setDate(expense.date)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id)
      setReloadExpenses((prev) => prev + 1)
    } catch (error) {
      console.error('Failed to delete expense', error)
      alert('خطأ في حذف المصروف')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!title || !date || !amount) return

    setIsSaving(true)
    try {
      if (editingExpenseId) {
        await updateExpense({
          id: editingExpenseId,
          title: title.trim(),
          category: category.trim() || 'عام',
          amount: Number(amount),
          date,
        })
      } else {
        await createExpense({
          title: title.trim(),
          category: category.trim() || 'عام',
          amount: Number(amount),
          date,
        })
      }

      setReloadExpenses((prev) => prev + 1)
      closeModal()
    } catch (error) {
      console.error('Failed to save expense', error)
      alert('خطأ في حفظ المصروف')
    } finally {
      setIsSaving(false)
    }
  }

  const filteredExpenses = expenses ?? []

  return (
    <div>
      <PageHeader title="المصروفات" description="المصروفات المباشرة للشركة" icon={Receipt}>
        <Button size="sm" onClick={openModal}><Plus className="h-4 w-4" /> مصروف جديد</Button>
      </PageHeader>

      <div className="mb-6 flex items-center gap-4">
        <DateFilterSelects
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />
      </div>

      <Modal open={isModalOpen} title={editingExpenseId ? 'تعديل مصروف' : 'إضافة مصروف جديد'} description={editingExpenseId ? 'عدّل بيانات المصروف ثم احفظ' : 'أضف بيانات المصروف ثم احفظ'} onClose={closeModal}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm">
            <span>الاسم</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الاسم" />
          </label>
          <label className="space-y-2 text-sm">
            <span>تفاصيل</span>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="التفاصيل " />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-2 text-sm">
              <span>المبلغ</span>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="مثلاً 45000" type="number" />
            </label>
            <label className="space-y-2 text-sm">
              <span>التاريخ</span>
              <Input value={date} onChange={(e) => setDate(e.target.value)} type="date" />
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={closeModal}>إلغاء</Button>
            <Button type="submit" disabled={isSaving || !title || !date || !amount}>{isSaving ? 'جارٍ الحفظ...' : editingExpenseId ? 'تحديث المصروف' : 'حفظ المصروف'}</Button>
          </div>
        </form>
      </Modal>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>تفاصيل</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            ) : filteredExpenses && filteredExpenses.length > 0 ? (
              filteredExpenses.map((exp, i) => (
                <motion.tr
                  key={exp.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                >
                  <TableCell>
                    <span className="font-medium">{exp.title}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{exp.category}</Badge>
                  </TableCell>
                  <TableCell className="text-destructive font-semibold">{formatCurrency(exp.amount)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(exp.date)}</TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="outline" onClick={() => openEditModal(exp)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(exp.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  لا توجد مصروفات بعد
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  )
}
