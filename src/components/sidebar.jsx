"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Package,
  Building2,
  Briefcase,
  CreditCard,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { href: "/", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/employees", label: "الموظفين والرواتب", icon: Users },
  { href: "/inventory", label: "المخزون", icon: Package },
  { href: "/sales", label: "المبيعات", icon: ShoppingCart },
  { href: "/clients", label: "العملاء والمباني", icon: Building2 },
  { href: "/jobs", label: "الأعمال", icon: Briefcase },
  { href: "/payments", label: "المدفوعات", icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();

  const SidebarContent = ({ onItemClick = () => {} }) => (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold tracking-tight">Balance</h1>
          <p className="text-sm text-gray-400 mt-1">نظام إدارة المصاعد</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    onClick={onItemClick}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        <Separator className="bg-gray-700" />

        {/* Bottom Section */}
        <div className="p-4">
          <div className="px-4 py-3 text-sm text-gray-400 text-center">
            الإصدار 1.0
          </div>
        </div>
      </div>
    </TooltipProvider>
  );

  return (
    <>
      {/* Mobile Menu - Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 left-4 z-50 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72 bg-black border-gray-700 p-0">
          <SheetTitle className="sr-only">القائمة الجانبية</SheetTitle>
          <SidebarContent onItemClick={() => document.querySelector('[data-state="open"]')?.click()} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="fixed top-0 right-0 z-50 h-full w-72 bg-black text-white hidden lg:block">
        <SidebarContent />
      </aside>
    </>
  );
}
