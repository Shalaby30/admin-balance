import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Users, Pencil, Plus, Trash2 } from 'lucide-react'
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
import { createEmployee, deleteEmployee, getEmployees, type Employee, updateEmployee } from '@/lib/db-queries'
import { formatCurrency } from '@/lib/utils'

export default function EmployeesPage() {
  const [reloadEmployees, setReloadEmployees] = useState(0)
  const { data: employees } = useNeonQuery(getEmployees, [reloadEmployees], [])
  const [currentEmployees, setCurrentEmployees] = useState<Employee[]>(employees ?? [])
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [salary, setSalary] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState('نشط')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setCurrentEmployees(employees ?? [])
  }, [employees])

  const handleOpen = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setEditingEmployee(null)
    setName('')
    setRole('')
    setSalary('')
    setPhone('')
    setStatus('نشط')
  }

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee)
    setName(employee.name)
    setRole(employee.role)
    setSalary(String(employee.salary))
    setPhone(employee.phone)
    setStatus(employee.status)
    setIsModalOpen(true)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim() || !role.trim()) return

    setIsSaving(true)
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, {
          name: name.trim(),
          role: role.trim(),
          salary: Number(salary) || 0,
          phone: phone.trim() || '0000000000',
          status: status || 'نشط',
          avatar: editingEmployee.avatar,
        })
      } else {
        await createEmployee({
          name: name.trim(),
          role: role.trim(),
          salary: Number(salary) || 0,
          phone: phone.trim() || '0000000000',
          status: status || 'نشط',
          avatar: `https://i.pravatar.cc/150?img=${Date.now() % 70}`,
        })
      }
      setReloadEmployees((prev) => prev + 1)
      handleClose()
    } catch (error) {
      console.error('Failed to save employee', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="الموظفين" description="إدارة فريق العمل والمهندسين والفنيين" icon={Users}>
        <Button size="sm" onClick={handleOpen}><Plus className="h-4 w-4" /> إضافة موظف</Button>
      </PageHeader>

      <Modal
        open={isModalOpen}
        title={editingEmployee ? 'تعديل موظف' : 'إضافة موظف جديد'}
        description={editingEmployee ? 'حدِّث بيانات الموظف ثم احفظ' : 'أضف بيانات الموظف هنا'}
        onClose={handleClose}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-2 text-sm">
              <span>الاسم</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم الموظف" />
            </label>
            <label className="space-y-2 text-sm">
              <span>الوظيفة</span>
              <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="المسمى الوظيفي" />
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-2 text-sm">
              <span>المرتب</span>
              <Input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="مثلاً 15000" type="number" />
            </label>
            <label className="space-y-2 text-sm">
              <span>الهاتف</span>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0501234567" />
            </label>
          </div>
          <label className="space-y-2 text-sm">
            <span>الحالة</span>
            <select
              className="flex h-10 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="نشط">نشط</option>
              <option value="غير نشط">غير نشط</option>
            </select>
          </label>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={handleClose}>إلغاء</Button>
            <Button type="submit" disabled={isSaving || !name.trim() || !role.trim()}>
              {isSaving ? (editingEmployee ? 'جارٍ التحديث...' : 'جارٍ الحفظ...') : editingEmployee ? 'تحديث الموظف' : 'حفظ الموظف'}
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
              <TableHead>الموظف</TableHead>
              <TableHead>الوظيفة</TableHead>
              <TableHead>المرتب</TableHead>
              <TableHead>الهاتف</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentEmployees.map((emp, i) => (
              <motion.tr
                key={emp.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-border/30 hover:bg-muted/30 transition-colors"
              >
                <TableCell>
                  <span className="font-medium">{emp.name}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{emp.role}</TableCell>
                <TableCell>{formatCurrency(emp.salary)}</TableCell>
                <TableCell dir="ltr" className="text-right">{emp.phone}</TableCell>
                <TableCell>
                  <Badge variant={emp.status === 'نشط' ? 'success' : 'warning'}>{emp.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditModal(emp)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={async () => {
                        if (!window.confirm(`هل تريد حذف ${emp.name}؟`)) {
                          return
                        }
                        try {
                          await deleteEmployee(emp.id)
                          setReloadEmployees((prev) => prev + 1)
                        } catch (error) {
                          console.error('Failed to delete employee', error)
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
