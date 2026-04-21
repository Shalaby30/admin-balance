"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { ToastProvider } from "@/components/ui/toast";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const user = localStorage.getItem('currentUser');
      if (!user) {
        router.push('/login');
        return;
      }
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

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
