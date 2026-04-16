"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getFinancialSummary,
  getMonthlyData,
  jobs,
  transactions,
  getLowStockItems,
} from "@/lib/mockData";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  Building2,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function DashboardPage() {
  const summary = getFinancialSummary();
  const monthlyData = getMonthlyData();
  const lowStock = getLowStockItems();

  const recentJobs = jobs.slice(-5).reverse();
  const recentTransactions = transactions.slice(-5).reverse();

  const jobTypeData = [
    { name: "تركيب", value: jobs.filter((j) => j.type === "installation").length },
    { name: "صيانة", value: jobs.filter((j) => j.type === "maintenance").length },
    { name: "إصلاح", value: jobs.filter((j) => j.type === "repair").length },
    { name: "تحديث", value: jobs.filter((j) => j.type === "modernization").length },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200">لوحة التحكم</h1>
        <p className="text-slate-600 dark:text-slate-400">نظرة عامة على أداء الشركة والإحصائيات الرئيسية</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800 hover:scale-105 hover:translate-y-[-4px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-400/20 to-transparent rounded-full -mr-12 -mt-12" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
              إجمالي الإيرادات
            </CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(summary.totalRevenue)}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              <span className="text-green-600 dark:text-green-400 inline-flex items-center font-semibold">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                12%
              </span>{" "}
              عن الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800 hover:scale-105 hover:translate-y-[-4px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-400/20 to-transparent rounded-full -mr-12 -mt-12" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
              إجمالي المصروفات
            </CardTitle>
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(summary.totalExpenses)}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              <span className="text-red-600 dark:text-red-400 inline-flex items-center font-semibold">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                8%
              </span>{" "}
              عن الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800 hover:scale-105 hover:translate-y-[-4px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full -mr-12 -mt-12" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
              صافي الربح
            </CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(summary.netProfit)}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              هامش الربح: {" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">{((summary.netProfit / summary.totalRevenue) * 100).toFixed(1)}%</span>
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800 hover:scale-105 hover:translate-y-[-4px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full -mr-12 -mt-12" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
              المبالغ المستحقة
            </CardTitle>
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(summary.unpaidRevenue)}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">من <span className="font-semibold">{jobs.filter((j) => j.paymentStatus !== "paid").length}</span> عملية</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">الأداء المالي الشهري</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">مقارنة الإيرادات والمصروفات</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="month" stroke="rgb(148, 163, 184)" />
                <YAxis stroke="rgb(148, 163, 184)" />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ textAlign: "right", backgroundColor: "rgba(15, 23, 42, 0.8)", border: "1px solid rgb(30, 41, 59)" }}
                  cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                />
                <Bar dataKey="revenue" name="الإيرادات" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" name="المصروفات" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">توزيع أنواع الأعمال</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">نسبة الأعمال حسب النوع</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={jobTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {jobTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.8)", border: "1px solid rgb(30, 41, 59)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats & Alerts */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">الموظفين</CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">6</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">إجمالي الرواتب: <span className="font-semibold">{formatCurrency(summary.totalSalaries)}</span></p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">المخزون</CardTitle>
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
              <Package className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(summary.inventoryValue)}</div>
            {lowStock.length > 0 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-semibold">
                <AlertCircle className="h-3 w-3 inline mr-1" />
                {lowStock.length} عناصر منخفضة
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">الأنشطة الأخيرة</CardTitle>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Briefcase className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentJobs.slice(0, 3).map((job) => (
                <div key={job.id} className="flex items-center justify-between text-sm gap-2">
                  <span className="truncate text-slate-700 dark:text-slate-300">{job.description}</span>
                  <Badge
                    variant={
                      job.status === "completed"
                        ? "success"
                        : job.status === "pending"
                        ? "warning"
                        : "default"
                    }
                    className="text-xs shrink-0"
                  >
                    {job.status === "completed" ? "مكتمل" : job.status === "pending" ? "قيد الانتظار" : "قيد التنفيذ"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">أحدث المعاملات</CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">آخر المعاملات المالية</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-right py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">التاريخ</th>
                  <th className="text-right py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">النوع</th>
                  <th className="text-right py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">الوصف</th>
                  <th className="text-right py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4 text-slate-700 dark:text-slate-300">{formatDate(transaction.date)}</td>
                    <td className="py-4 px-4">
                      <Badge variant={transaction.type === "income" ? "success" : "danger"} className="text-xs">
                        {transaction.type === "income" ? "إيراد" : "مصروف"}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-slate-700 dark:text-slate-300">{transaction.description}</td>
                    <td className="py-4 px-4 font-semibold">
                      <span className={transaction.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
