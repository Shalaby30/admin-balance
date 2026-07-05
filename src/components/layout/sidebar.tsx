import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Package,
  DollarSign,
  UserCircle,
  FolderKanban,
  Wrench,
  Receipt,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Building2,
  ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { to: '/employees', icon: Users, label: 'الموظفين' },
  { to: '/inventory', icon: Package, label: 'المخزون' },
  { to: '/sales', icon: DollarSign, label: 'المبيعات' },
  { to: '/customers', icon: UserCircle, label: 'العملاء' },
  { to: '/projects', icon: FolderKanban, label: 'التركيب' },
  { to: '/maintenance', icon: Wrench, label: 'الصيانة' },
  { to: '/expenses', icon: Receipt, label: 'المصروفات' },
  { to: '/inputs', icon: ClipboardList, label: 'المدخلات' },
  { to: '/reports', icon: BarChart3, label: 'التقارير' },
]

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed top-0 right-0 z-50 h-screen glass border-l border-glass-border flex flex-col',
          'lg:translate-x-0 transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center gap-3 px-5 py-6 border-b border-border/50">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-hidden"
            >
              <h2 className="font-bold text-base leading-tight">بالانس للمصاعد</h2>
              <p className="text-xs text-muted-foreground">نظام إدارة متكامل</p>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onMobileClose}
            >
              {({ isActive }) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-sidebar-active text-primary shadow-sm'
                      : 'text-sidebar-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'text-primary')} />
                  {!collapsed && <span>{item.label}</span>}
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border/50 hidden lg:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center"
          >
            {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </motion.aside>
    </>
  )
}

export function useSidebarWidth() {
  return { expanded: 280, collapsed: 80 }
}
