import { motion } from 'framer-motion'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { UserCircle, Plus, Phone, Building2, MapPin, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Modal } from '@/components/shared/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNeonQuery } from '@/hooks/use-neon-query'
import { createCustomer, getCustomers, updateCustomer, deleteCustomer, type Customer } from '@/lib/db-queries'

export default function CustomersPage() {
  const [reloadCustomers, setReloadCustomers] = useState(0)
  const { data: customers } = useNeonQuery(getCustomers, [reloadCustomers], [])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')

  const openModal = () => {
    setEditingCustomer(null)
    setName('')
    setCompany('')
    setAddress('')
    setPhone('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCustomer(null)
  }

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer)
    setName(customer.name)
    setCompany(customer.company)
    setAddress(customer.address)
    setPhone(customer.phone)
    setIsModalOpen(true)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      if (editingCustomer) {
        await updateCustomer({
          id: editingCustomer.id,
          name: name || editingCustomer.name,
          company: company || editingCustomer.company,
          address: address || editingCustomer.address,
          phone: phone || editingCustomer.phone,
        })
      } else {
        await createCustomer({
          name: name || 'عميل جديد',
          company: company || 'شركة جديدة',
          address: address || 'عنوان غير محدد',
          phone: phone || '0000000000',
        })
      }
      setReloadCustomers((prev) => prev + 1)
      setName('')
      setCompany('')
      setAddress('')
      setPhone('')
      closeModal()
    } catch (error) {
      console.error('Failed to save customer', error)
    }
  }

  return (
    <div>
      <PageHeader title="العملاء" description="إدارة قاعدة العملاء والشركات" icon={UserCircle}>
        <Button size="sm" onClick={openModal}><Plus className="h-4 w-4" /> إضافة عميل</Button>
      </PageHeader>

      <Modal
        open={isModalOpen}
        title={editingCustomer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
        description={editingCustomer ? 'عدّل بيانات العميل ثم احفظ' : 'أضف بيانات العميل ثم احفظ'}
        onClose={closeModal}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm">
            <span>الاسم</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم العميل" />
          </label>
          <label className="space-y-2 text-sm">
            <span>الشركة</span>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="اسم الشركة" />
          </label>
          <label className="space-y-2 text-sm">
            <span>العنوان</span>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="العنوان" />
          </label>
          <label className="space-y-2 text-sm">
            <span>الهاتف</span>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0501234567" />
          </label>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={closeModal}>إلغاء</Button>
            <Button type="submit">حفظ العميل</Button>
          </div>
        </form>
      </Modal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(customers ?? []).map((customer, i) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="glass rounded-2xl p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">{customer.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Building2 className="h-4 w-4" />
                  {customer.company}
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEditModal(customer)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    if (!window.confirm(`هل تريد حذف ${customer.name}؟`)) {
                      return
                    }
                    try {
                      await deleteCustomer(customer.id)
                      setReloadCustomers((prev) => prev + 1)
                    } catch (error) {
                      console.error('Failed to delete customer', error)
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2 text-sm mt-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{customer.address}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span dir="ltr">{customer.phone}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
