"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const chartConfig = {
  revenue: { label: "الإيرادات", color: "#3b82f6" },
  expenses: { label: "المصروفات", color: "#ef4444" },
  installation: { label: "تركيب", color: "#3b82f6" },
  maintenance: { label: "صيانة", color: "#22c55e" },
  repair: { label: "إصلاح", color: "#f59e0b" },
  modernization: { label: "تحديث", color: "#8b5cf6" },
};

export default function DashboardPage() {
  const summary = getFinancialSummary();
  const monthlyData = getMonthlyData();
  const lowStock = getLowStockItems();

  const recentJobs = jobs.slice(-5).reverse();
  const recentTransactions = transactions.slice(-5).reverse();

  const jobTypeData = [
    { name: "تركيب", value: jobs.filter((j) => j.type === "installation").length, key: "installation" },
    { name: "صيانة", value: jobs.filter((j) => j.type === "maintenance").length, key: "maintenance" },
    { name: "إصلاح", value: jobs.filter((j) => j.type === "repair").length, key: "repair" },
    { name: "تحديث", value: jobs.filter((j) => j.type === "modernization").length, key: "modernization" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-gray-500 mt-1">نظرة عامة على أداء الشركة</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              إجمالي الإيرادات
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-green-500 inline-flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                12%
              </span>{" "}
              عن الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              إجمالي المصروفات
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-red-500 inline-flex items-center">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                8%
              </span>{" "}
              عن الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              صافي الربح
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.netProfit)}</div>
            <p className="text-xs text-gray-500 mt-1">
              هامش الربح: {" "}
              {((summary.netProfit / summary.totalRevenue) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              المبالغ المستحقة
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.unpaidRevenue)}</div>
            <p className="text-xs text-gray-500 mt-1">من {jobs.filter((j) => j.paymentStatus !== "paid").length} عملية</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 ">
        <Card>
          <CardHeader>
            <CardTitle>الأداء المالي الشهري</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(value)}
                    />
                  }
                />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>


      </div>

      {/* Quick Stats & Alerts */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">الموظفين</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-gray-500">إجمالي الرواتب: {formatCurrency(summary.totalSalaries)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">المخزون</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.inventoryValue)}</div>
            {lowStock.length > 0 && (
              <p className="text-xs text-red-500 mt-1">
                <AlertCircle className="h-3 w-3 inline mr-1" />
                {lowStock.length} عناصر منخفضة
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">الأنشطة الأخيرة</CardTitle>
            <Briefcase className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentJobs.slice(0, 3).map((job) => (
                <div key={job.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{job.description}</span>
                  <Badge
                    variant={
                      job.status === "completed"
                        ? "success"
                        : job.status === "pending"
                        ? "warning"
                        : "default"
                    }
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
      <Card>
        <CardHeader>
          <CardTitle>أحدث المعاملات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="border-black">
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>المبلغ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === "income" ? "success" : "danger"}>
                      {transaction.type === "income" ? "إيراد" : "مصروف"}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="font-medium">
                    <span className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
