import { Sidebar } from "@/components/sidebar";
import { ToastProvider } from "@/components/ui/toast";

export default function DashboardLayout({ children }) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <main className="lg:mr-72 min-h-screen">
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
