import { motion } from 'framer-motion'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Package, Plus, Pencil, Trash2 } from 'lucide-react'
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
import { createInventory, getInventory, updateInventory, deleteInventory, type InventoryItem } from '@/lib/db-queries'
import { formatCurrency } from '@/lib/utils'

export default function InventoryPage() {
  const [reloadInventory, setReloadInventory] = useState(0)
  const { data: inventory } = useNeonQuery(getInventory, [reloadInventory], [])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [status, setStatus] = useState('متوفر')
  const [isSaving, setIsSaving] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const resetForm = () => {
    setEditingItem(null)
    setName('')
    setQuantity('')
    setPurchasePrice('')
    setSellingPrice('')
    setStatus('متوفر')
  }

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item)
    setName(item.name)
    setQuantity(String(item.quantity))
    setPurchasePrice(String(item.purchasePrice))
    setSellingPrice(String(item.sellingPrice))
    setStatus(item.status)
    setIsModalOpen(true)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim()) return

    setIsSaving(true)
    try {
      if (editingItem) {
        await updateInventory(editingItem.id, {
          name: name.trim(),
          code: editingItem.code,
          quantity: Number(quantity) || 0,
          purchasePrice: Number(purchasePrice) || 0,
          sellingPrice: Number(sellingPrice) || 0,
          status: status || 'متوفر',
        })
      } else {
        await createInventory({
          name: name.trim(),
          code: `INV-${Date.now()}`,
          quantity: Number(quantity) || 0,
          purchasePrice: Number(purchasePrice) || 0,
          sellingPrice: Number(sellingPrice) || 0,
          status: status || 'متوفر',
        })
      }
      setReloadInventory((prev) => prev + 1)
      resetForm()
      closeModal()
    } catch (error) {
      console.error('Failed to save inventory item', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="المخزون" description="إدارة قطع الغيار والمستلزمات" icon={Package}>
        <Button size="sm" onClick={openModal}><Plus className="h-4 w-4" /> إضافة قطعة</Button>
      </PageHeader>

      <Modal
        open={isModalOpen}
        title={editingItem ? 'تعديل القطعة' : 'إضافة قطعة جديدة'}
        description={editingItem ? 'حدِّث بيانات القطعة ثم احفظ' : 'أضف بيانات القطعة ثم احفظ'}
        onClose={() => {
          closeModal()
          resetForm()
        }}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm">
            <span>اسم القطعة</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم القطعة" />
          </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-2 text-sm">
              <span>الكمية</span>
              <Input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" type="number" />
            </label>
            <label className="space-y-2 text-sm">
              <span>سعر الشراء</span>
              <Input value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="0" type="number" />
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-2 text-sm">
              <span>سعر البيع</span>
              <Input value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="0" type="number" />
            </label>
            <label className="space-y-2 text-sm">
              <span>الحالة</span>
              <select
                className="flex h-10 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="متوفر">متوفر</option>
                <option value="منخفض">منخفض</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                closeModal()
                resetForm()
              }}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSaving || !name.trim()}>
              {isSaving ? (editingItem ? 'جارٍ التحديث...' : 'جارٍ الحفظ...') : editingItem ? 'تحديث القطعة' : 'حفظ القطعة'}
            </Button>
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
              <TableHead>اسم القطعة</TableHead>
              <TableHead>الكمية</TableHead>
              <TableHead>سعر الشراء</TableHead>
              <TableHead>سعر البيع</TableHead>
              <TableHead>الربح</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(inventory ?? []).map((item, i) => {
              const profit = item.sellingPrice - item.purchasePrice
              return (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                >
                  <TableCell>
                    <span className="font-medium">{item.name}</span>
                  </TableCell>
                  <TableCell className="font-medium">{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.purchasePrice)}</TableCell>
                  <TableCell>{formatCurrency(item.sellingPrice)}</TableCell>
                  <TableCell className="text-green-600 font-semibold">{formatCurrency(profit)}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'متوفر' ? 'success' : 'destructive'}>{item.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditModal(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={async () => {
                          if (!window.confirm(`هل تريد حذف ${item.name}؟`)) {
                            return
                          }
                          try {
                            await deleteInventory(item.id)
                            setReloadInventory((prev) => prev + 1)
                          } catch (error) {
                            console.error('Failed to delete inventory item', error)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              )
            })}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  )
}
