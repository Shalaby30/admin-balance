import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { DollarSign, Plus, Download, Pencil, Trash2 } from 'lucide-react'
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
import { createInvoice, getInventory, getSalesInvoices, updateInvoice, deleteInvoice } from '@/lib/db-queries'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DateFilterSelects } from '@/components/shared/date-filter-selects'

const statusVariant = (status: string) => {
  switch (status) {
    case 'مدفوعة': return 'success' as const
    case 'غير مدفوعة': return 'destructive' as const
    default: return 'secondary' as const
  }
}

export default function SalesPage() {
  const [reloadInvoices, setReloadInvoices] = useState(0)
  const [reloadInventory, setReloadInventory] = useState(0)
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null)
  const [client, setClient] = useState('')
  const [item, setItem] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('مدفوعة')
  const [isSaving, setIsSaving] = useState(false)
  const filter = { month: selectedMonth, year: selectedYear }
  const { data: invoices } = useNeonQuery(() => getSalesInvoices(filter), [reloadInvoices, selectedMonth, selectedYear], [])
  const { data: inventory } = useNeonQuery(getInventory, [reloadInventory], [])

  const inventoryItems = inventory ?? []

  useEffect(() => {
    if (!item && inventoryItems.length > 0) {
      setItem(inventoryItems[0].name)
    }
  }, [inventoryItems, item])

  useEffect(() => {
    if (inventoryItems.length > 0 && quantity) {
      const selected = inventoryItems.find((inv) => inv.name === item)
      if (selected) {
        setAmount(String(selected.sellingPrice * Number(quantity)))
      }
    }
  }, [item, quantity, inventoryItems])

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingInvoice(null)
  }

  const resetForm = () => {
    setEditingInvoice(null)
    setClient('')
    setItem('')
    setQuantity('1')
    setAmount('')
    setDate('')
    setStatus('مدفوعة')
  }

  const openEditModal = (invoice: any) => {
    setEditingInvoice(invoice)
    setClient(invoice.client)
    setItem(invoice.item)
    setQuantity(String(invoice.quantity))
    setAmount(String(invoice.amount))
    setDate(invoice.date)
    setStatus(invoice.status)
    setIsModalOpen(true)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!item || !client || !date) return

    setIsSaving(true)
    try {
      if (editingInvoice) {
        await updateInvoice(editingInvoice.id, {
          client: client.trim(),
          item: item.trim(),
          quantity: Number(quantity) || 0,
          amount: Number(amount) || 0,
          date,
          status,
        })
      } else {
        await createInvoice({
          client: client.trim(),
          item: item.trim(),
          quantity: Number(quantity) || 0,
          amount: Number(amount) || 0,
          date,
          status,
        })
      }

      setReloadInvoices((prev) => prev + 1)
      setReloadInventory((prev) => prev + 1)
      resetForm()
      closeModal()
    } catch (error) {
      console.error('Failed to save invoice', error)
    } finally {
      setIsSaving(false)
      closeModal()
    }
  }

  const filteredInvoices = invoices ?? []

  return (
    <div>
      <PageHeader title="المبيعات" description="إدارة الفواتير والمدفوعات" icon={DollarSign}>
        <Button variant="outline" size="sm"><Download className="h-4 w-4" /> تصدير</Button>
        <Button size="sm" onClick={openModal}><Plus className="h-4 w-4" /> فاتورة جديدة</Button>
      </PageHeader>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <DateFilterSelects
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />
      </div>

      <Modal open={isModalOpen} title={editingInvoice ? 'تعديل الفاتورة' : 'إضافة فاتورة جديدة'} description={editingInvoice ? 'عدّل بيانات الفاتورة ثم احفظ' : 'أضف بيانات الفاتورة ثم احفظ'} onClose={closeModal}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm">
            <span>العميل</span>
            <Input value={client} onChange={(e) => setClient(e.target.value)} placeholder="اسم العميل" />
          </label>
          <label className="space-y-2 text-sm">
            <span>القطعة</span>
            <select
              value={item}
              onChange={(e) => setItem(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm"
            >
              {inventoryItems.map((inv) => (
                <option key={inv.id} value={inv.name}>
                  {inv.name} ({inv.quantity} متوفر)
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-2 text-sm">
              <span>الكمية</span>
              <Input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" type="number" min="1" />
            </label>
            <label className="space-y-2 text-sm">
              <span>السعر الإجمالي</span>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" type="number" />
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-2 text-sm">
              <span>التاريخ</span>
              <Input value={date} onChange={(e) => setDate(e.target.value)} type="date" />
            </label>
            <label className="space-y-2 text-sm">
              <span>حالة الدفع</span>
              <select
                className="flex h-10 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="مدفوعة">مدفوعة</option>
                <option value="غير مدفوعة">غير مدفوعة</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={closeModal}>إلغاء</Button>
            <Button type="submit" disabled={isSaving || !client || !date || !item}>{isSaving ? (editingInvoice ? 'جارٍ التحديث...' : 'جارٍ الحفظ...') : editingInvoice ? 'تحديث الفاتورة' : 'حفظ الفاتورة'}</Button>
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
              <TableHead>العميل</TableHead>
              <TableHead>القطعة</TableHead>
              <TableHead>الكمية</TableHead>
              <TableHead>السعر الإجمالي</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>حالة الدفع</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((inv, i) => (
              <motion.tr
                key={inv.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-border/30 hover:bg-muted/30 transition-colors"
              >
                <TableCell>{inv.client}</TableCell>
                <TableCell>{inv.item}</TableCell>
                <TableCell className="font-medium">{inv.quantity}</TableCell>
                <TableCell className="font-semibold">{formatCurrency(inv.amount)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(inv.date)}</TableCell>
                <TableCell><Badge variant={statusVariant(inv.status)}>{inv.status}</Badge></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditModal(inv)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={async () => {
                        if (!window.confirm(`هل تريد حذف فاتورة ${inv.client}؟`)) {
                          return
                        }
                        try {
                          await deleteInvoice(inv.id)
                          setReloadInvoices((prev) => prev + 1)
                        } catch (error) {
                          console.error('Failed to delete invoice', error)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  )
}
