import { Wrench, Search, Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/shared/modal'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useNeonQuery } from '@/hooks/use-neon-query'
import { getMaintenanceTasks, createMaintenanceTask, updateMaintenanceTask, deleteMaintenanceTask } from '@/lib/db-queries'
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import { DateFilterSelects } from '@/components/shared/date-filter-selects'

const statusConfig = {
  pending: { label: 'معلق', variant: 'warning' as const, dot: 'bg-warning' },
  in_progress: { label: 'قيد التنفيذ', variant: 'info' as const, dot: 'bg-info' },
  completed: { label: 'مكتمل', variant: 'success' as const, dot: 'bg-success' },
}

export default function MaintenancePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [reloadTasks, setReloadTasks] = useState(0)
  const filter = { month: selectedMonth, year: selectedYear }
  const { data: maintenanceTasksData } = useNeonQuery(() => getMaintenanceTasks(filter), [reloadTasks, selectedMonth, selectedYear])
  const [currentMaintenance, setCurrentMaintenance] = useState(maintenanceTasksData ?? [])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [technician, setTechnician] = useState('')
  const [date, setDate] = useState('')
  const [amount, setAmount] = useState('0')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('pending')
  const [paid, setPaid] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)

  const maintenanceTasks = currentMaintenance

  useEffect(() => {
    setCurrentMaintenance(maintenanceTasksData ?? [])
  }, [maintenanceTasksData])

  const filteredTasks = maintenanceTasks.filter((task) => {
    return task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.technician.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingTaskId(null)
  }

  const resetForm = () => {
    setTitle('')
    setLocation('')
    setTechnician('')
    setDate('')
    setAmount('0')
    setDescription('')
    setStatus('pending')
    setPaid(false)
    setEditingTaskId(null)
  }

  const handleEdit = (task: any) => {
    setEditingTaskId(task.id)
    setTitle(task.title)
    setLocation(task.location)
    setTechnician(task.technician)
    setDate(task.date)
    setAmount(String(task.amount))
    setDescription(task.description)
    setStatus(task.status)
    setPaid(Boolean(task.paid))
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMaintenanceTask(id)
      setReloadTasks((prev) => prev + 1)
    } catch (error) {
      console.error('Failed to delete maintenance task:', error)
    }
    setCurrentMaintenance((prev) => prev.filter((task: any) => task.id !== id))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const newTask = {
      title: title || 'اسم العميل غير محدد',
      description: description || 'وصف المهمة',
      location: location || 'موقع غير محدد',
      technician: technician || 'فني',
      date: date || '',
      amount: Number(amount) || 0,
      status,
      paid,
    }

    try {
      if (editingTaskId) {
        const updatedTask = await updateMaintenanceTask({ id: editingTaskId, ...newTask })
        setCurrentMaintenance((prev) => prev.map((task: any) => task.id === editingTaskId ? updatedTask : task))
      } else {
        const created = await createMaintenanceTask(newTask)
        setCurrentMaintenance([created, ...currentMaintenance])
      }
      setReloadTasks((prev) => prev + 1)
    } catch (error) {
      console.error('Failed to save maintenance task:', error)
      if (editingTaskId) {
        setCurrentMaintenance((prev) => prev.map((task: any) => task.id === editingTaskId ? { id: editingTaskId, ...newTask } : task))
      } else {
        setCurrentMaintenance([
          ...currentMaintenance,
          {
            id: String(Date.now()),
            ...newTask,
          },
        ])
      }
    }
    resetForm()
    closeModal()
  }

  return (
    <div>
      <PageHeader title="الصيانة" description="أعمال الصيانة الدورية والإصلاحات الطارئة للمصاعد" icon={Wrench}>
        <Button size="sm" onClick={openModal}><Plus className="h-4 w-4" /> مهمة جديدة</Button>
      </PageHeader>

      <Modal open={isModalOpen} title={editingTaskId ? 'تعديل مهمة صيانة' : 'إضافة مهمة صيانة'} description="أضف بيانات المهمة ثم احفظ" onClose={closeModal}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-2 text-sm">
              <span>اسم العميل</span>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="اسم العميل" />
            </label>
            <label className="space-y-2 text-sm">
              <span>الموقع</span>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="مكان الصيانة" />
            </label>
            <label className="space-y-2 text-sm">
              <span>الفني</span>
              <Input value={technician} onChange={(e) => setTechnician(e.target.value)} placeholder="اسم الفني" />
            </label>
            <label className="space-y-2 text-sm">
              <span>التاريخ</span>
              <Input value={date} onChange={(e) => setDate(e.target.value)} type="date" />
            </label>
            <label className="space-y-2 text-sm">
              <span>المبلغ</span>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" step="0.01" placeholder="0" />
            </label>
            <label className="space-y-2 text-sm">
              <span>الحالة المالية</span>
              <select
                className="flex h-10 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm"
                value={paid ? 'paid' : 'unpaid'}
                onChange={(e) => setPaid(e.target.value === 'paid')}
              >
                <option value="paid">مدفوع</option>
                <option value="unpaid">غير مدفوع</option>
              </select>
            </label>
            <label className="space-y-2 text-sm col-span-full">
              <span>الوصف</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex min-h-[100px] w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm outline-none focus:border-primary"
                placeholder="تفاصيل المهمة"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>الحالة</span>
              <select
                className="flex h-10 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="pending">معلق</option>
                <option value="in_progress">قيد التنفيذ</option>
                <option value="completed">مكتمل</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={closeModal}>إلغاء</Button>
            <Button type="submit">حفظ المهمة</Button>
          </div>
        </form>
      </Modal>

      <div className="space-y-6">
        <div className="flex gap-4 mb-6 flex-col sm:flex-row">
          <DateFilterSelects
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث في الصيانة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
        </div>

        <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead>اسم العميل</TableHead>
                <TableHead>الموقع</TableHead>
                <TableHead>الفني</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>مدفوع</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>{task.location}</TableCell>
                  <TableCell>{task.technician}</TableCell>
                  <TableCell>{Number(task.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell>{formatDate(task.date)}</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[task.status as keyof typeof statusConfig].variant}>
                      {statusConfig[task.status as keyof typeof statusConfig].label}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.paid ? 'مدفوع' : 'غير مدفوع'}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(task)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(task.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
        </Table>
      </div>
    </div>
  )
}
