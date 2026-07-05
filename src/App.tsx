import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/hooks/use-theme'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import DashboardPage from '@/pages/dashboard'
import EmployeesPage from '@/pages/employees'
import InventoryPage from '@/pages/inventory'
import SalesPage from '@/pages/sales'
import CustomersPage from '@/pages/customers'
import ProjectsPage from '@/pages/projects'
import MaintenancePage from '@/pages/maintenance'
import ContractsPage from '@/pages/contracts'
import ExpensesPage from '@/pages/expenses'
import InputsPage from '@/pages/inputs'
import ReportsPage from '@/pages/reports'
import CalendarPage from '@/pages/calendar'
import SettingsPage from '@/pages/settings'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="inputs" element={<InputsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
