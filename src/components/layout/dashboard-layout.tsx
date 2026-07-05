import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { Navbar } from './navbar'
import { cn } from '@/lib/utils'

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen gradient-bg">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className={cn('transition-all duration-300 lg:mr-[280px]')}>
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <main className="p-4 lg:p-6 max-w-[1600px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
