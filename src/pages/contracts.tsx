// will be working from next update

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { FileText, Plus } from 'lucide-react'
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
import { getContracts } from '@/lib/db-queries'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function ContractsPage() {
  const { data: contracts } = useNeonQuery(getContracts, [], [])
  const [currentContracts, setCurrentContracts] = useState(contracts ?? [])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [client, setClient] = useState('')
  const [type, setType] = useState('')
  const [value, setValue] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState('نشط')

  useEffect(() => {
    setCurrentContracts(contracts ?? [])
  }, [contracts])

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const id = `CNT-${Date.now()}`
    setCurrentContracts([
      ...currentContracts,
      {
        id,
        client: client || 'عميل جديد',
        type: type || 'عام',
        value: Number(value) || 0,
        startDate: startDate || '',
        endDate: endDate || '',
        status: status || 'نشط',
      },
    ])
    setClient('')
    setType('')
    setValue('')
    setStartDate('')
    setEndDate('')
    setStatus('نشط')
    closeModal()
  }

  return (
    <div>
      <PageHeader title="الأعمال" description="أعمال الصيانة والمهام التشغيلية طويلة الأجل مع العملاء" icon={FileText}>
        <Button size="sm" onClick={openModal}><Plus className="h-4 w-4" /> عمل جديد</Button>
      </PageHeader>

      <Modal open={isModalOpen} title="إضافة عمل جديد" description="أضف بيانات العمل ثم احفظه" onClose={closeModal}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-2 text-sm">
              <span>العميل</span>
              <Input value={client} onChange={(e) => setClient(e.target.value)} placeholder="اسم العميل" />
            </label>
            <label className="space-y-2 text-sm">
              <span>نوع العقد</span>
              <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="نوع العقد" />
            </label>
            <label className="space-y-2 text-sm">
              <span>القيمة</span>
              <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="مثلاً 250000" type="number" />
            </label>
            <label className="space-y-2 text-sm">
              <span>تاريخ البداية</span>
              <Input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" />
            </label>
            <label className="space-y-2 text-sm">
              <span>تاريخ الانتهاء</span>
              <Input value={endDate} onChange={(e) => setEndDate(e.target.value)} type="date" />
            </label>
            <label className="space-y-2 text-sm">
              <span>الحالة</span>
              <select
                className="flex h-10 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="نشط">نشط</option>
                <option value="معلق">معلق</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={closeModal}>إلغاء</Button>
            <Button type="submit">حفظ العقد</Button>
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
              <TableHead>النوع</TableHead>
              <TableHead>القيمة</TableHead>
              <TableHead>تاريخ البداية</TableHead>
              <TableHead>تاريخ الانتهاء</TableHead>
              <TableHead>الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentContracts.map((contract) => (
              <TableRow key={contract.id} className="cursor-pointer">
                <TableCell>{contract.client}</TableCell>
                <TableCell><Badge variant="outline">{contract.type}</Badge></TableCell>
                <TableCell className="font-semibold">{formatCurrency(contract.value)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(contract.startDate)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(contract.endDate)}</TableCell>
                <TableCell>
                  <Badge variant={contract.status === 'نشط' ? 'success' : 'warning'}>{contract.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  )
}
