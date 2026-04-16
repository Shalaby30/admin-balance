import { Sidebar } from "@/components/sidebar";
import { ToastProvider } from "@/components/ui/toast";

export default function DashboardLayout({ children }) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Sidebar />
        <main className="lg:mr-72 min-h-screen transition-all duration-300">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
