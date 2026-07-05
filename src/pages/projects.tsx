import { FolderKanban, Plus, Search, ChevronDown, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Modal } from '@/components/shared/modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { DateFilterSelects } from '@/components/shared/date-filter-selects'
import { useNeonQuery } from '@/hooks/use-neon-query'
import { createProject, deleteProject, getProjects, updateProject, type Project } from '@/lib/db-queries'
import { useState } from 'react'

const statusVariant = (status: string) => {
  switch (status) {
    case 'مكتمل': return 'success' as const
    case 'جاري': return 'info' as const
    case 'معلق': return 'warning' as const
    default: return 'secondary' as const
  }
}

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reloadProjects, setReloadProjects] = useState(0)
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [name, setName] = useState('')
  const [client, setClient] = useState('')
  const [status, setStatus] = useState('جاري')
  const [deadline, setDeadline] = useState('')
  const [value, setValue] = useState('0')
  const [team, setTeam] = useState('')
  const [paid, setPaid] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const filter = { month: selectedMonth, year: selectedYear }
  const { data: projectsData } = useNeonQuery(() => getProjects(filter), [reloadProjects, selectedMonth, selectedYear], [])

  const projects = projectsData ?? []

  const filteredProjects = projects.filter((project) => {
    return project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const resetForm = () => {
    setName('')
    setClient('')
    setStatus('جاري')
    setDeadline('')
    setValue('0')
    setTeam('')
    setPaid(false)
  }

  const openAddModal = () => {
    setEditingProject(null)
    resetForm()
    setIsModalOpen(true)
  }

  const normalizeDate = (value: string) => {
    if (!value) return ''
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)

    const parsedWithYear = new Date(`${value} ${new Date().getFullYear()}`)
    if (!Number.isNaN(parsedWithYear.getTime())) return parsedWithYear.toISOString().slice(0, 10)

    return ''
  }

  const openEditModal = (project: Project) => {
    setEditingProject(project)
    setName(project.name)
    setClient(project.client)
    setStatus(project.status)
    setDeadline(normalizeDate(project.deadline) || project.deadline)
    setValue(String(project.value))
    setTeam(project.team.join(', '))
    setPaid(project.paid)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProject(null)
    resetForm()
  }

  const toggleRow = (id: string) => {
    setExpandedProjectId((prev) => (prev === id ? null : id))
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id)
      setReloadProjects((prev) => prev + 1)
    } catch (error) {
      console.error('Failed to delete project', error)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    try {
      const normalizedDeadline = normalizeDate(deadline) || new Date().toISOString().slice(0, 10)
      const projectData = {
        id: editingProject?.id ?? '',
        name: name || 'تركيب جديد',
        client: client || 'عميل جديد',
        status: status || 'جاري',
        progress: editingProject?.progress ?? 0,
        deadline: normalizedDeadline,
        value: Number(value) || 0,
        team: team.split(',').map((member) => member.trim()).filter(Boolean),
        paid,
      }

      if (editingProject) {
        await updateProject(projectData)
      } else {
        await createProject(projectData)
      }

      setReloadProjects((prev) => prev + 1)
      closeModal()
    } catch (error) {
      console.error('Failed to save project', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="التركيب" description="إدارة أعمال تركيب المصاعد وجدول تنفيذ المشاريع" icon={FolderKanban}>
        <Button size="sm" onClick={openAddModal}><Plus className="h-4 w-4" /> تركيب جديد</Button>
      </PageHeader>

      <Modal
        open={isModalOpen}
        title={editingProject ? 'تعديل التركيب' : 'إضافة تركيب جديد'}
        description={editingProject ? 'عدّل بيانات التركيب ثم احفظ' : 'أضف بيانات التركيب ثم احفظ'}
        onClose={closeModal}
      >
        <form
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <label className="space-y-2 text-sm">
            <span>اسم التركيب</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم التركيب" />
          </label>
          <label className="space-y-2 text-sm">
            <span>العميل</span>
            <Input value={client} onChange={(e) => setClient(e.target.value)} placeholder="اسم العميل" />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-2 text-sm">
              <span>الموعد النهائي</span>
              <Input value={deadline} onChange={(e) => setDeadline(e.target.value)} type="date" />
            </label>
            <label className="space-y-2 text-sm">
              <span>قيمة المشروع</span>
              <Input value={value} onChange={(e) => setValue(e.target.value)} type="number" />
            </label>
          </div>
          <label className="space-y-2 text-sm">
            <span>فريق العمل (افصل بفواصل)</span>
            <Input value={team} onChange={(e) => setTeam(e.target.value)} placeholder="أحمد، سارة، نادر" />
          </label>
          <label className="space-y-2 text-sm">
            <span>الحالة</span>
            <select
              className="flex h-10 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="جاري">جاري</option>
              <option value="معلق">معلق</option>
              <option value="مكتمل">مكتمل</option>
            </select>
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
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'جارٍ الحفظ...' : 'حفظ التركيب'}</Button>
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
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث في التركيبات..."
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
                <TableHead>العميل</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الحالة المالية</TableHead>
                <TableHead>الموعد النهائي</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => {
                const isExpanded = project.id === expandedProjectId
                return (
                  <>
                    <TableRow
                      key={project.id}
                      onClick={() => toggleRow(project.id)}
                      className="cursor-pointer"
                    >
                      <TableCell>{project.client}</TableCell>
                      <TableCell><Badge variant={statusVariant(project.status)}>{project.status}</Badge></TableCell>
                      <TableCell>{formatCurrency(project.value)}</TableCell>
                      <TableCell>{project.paid ? 'مدفوع' : 'غير مدفوع'}</TableCell>
                      <TableCell className="flex items-center justify-between gap-3">
                        <span>{formatDate(project.deadline)}</span>
                        <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={5} className="bg-muted/30 p-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-3">
                              <h4 className="font-semibold">تفاصيل التركيب</h4>
                              <p><span className="font-semibold">اسم التركيب:</span> {project.name}</p>
                              <p><span className="font-semibold">الفريق:</span> {project.team.join('، ') || 'غير محدد'}</p>
                              <p><span className="font-semibold">الموعد النهائي:</span> {formatDate(project.deadline)}</p>
                            </div>
                            <div className="space-y-3">
                              <h4 className="font-semibold">خيارات</h4>
                              <Button size="sm" variant="outline" onClick={() => openEditModal(project)}>
                                <Pencil className="h-4 w-4 ml-2" /> تعديل التركيب
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(project.id)}>
                                <Trash2 className="h-4 w-4 ml-2" /> حذف التركيب
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })}
            </TableBody>
        </Table>
      </div>
    </div>
  )
}
