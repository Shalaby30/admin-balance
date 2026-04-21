"use client";

import { useState, useEffect } from "react";
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
  getJobs,
  getTransactions,
  getLowStockItems,
} from "@/lib/database";
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
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all data in parallel
        const [
          summaryResult,
          monthlyResult,
          lowStockResult,
          jobsResult,
          transactionsResult
        ] = await Promise.all([
          getFinancialSummary(),
          getMonthlyData(),
          getLowStockItems(),
          getJobs(),
          getTransactions()
        ]);

        setSummary(summaryResult.data);
        setMonthlyData(monthlyResult);
        setLowStock(lowStockResult.data || []);
        setRecentJobs(jobsResult.data?.slice(0, 5).reverse() || []);
        setRecentTransactions(transactionsResult.data?.slice(0, 5).reverse() || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const jobTypeData = recentJobs.length > 0 ? [
    { name: "installation", value: recentJobs.filter((j) => j.type === "installation").length, key: "installation" },
    { name: "maintenance", value: recentJobs.filter((j) => j.type === "maintenance").length, key: "maintenance" },
    { name: "repair", value: recentJobs.filter((j) => j.type === "repair").length, key: "repair" },
    { name: "modernization", value: recentJobs.filter((j) => j.type === "modernization").length, key: "modernization" },
  ] : [
    { name: "installation", value: 0, key: "installation" },
    { name: "maintenance", value: 0, key: "maintenance" },
    { name: "repair", value: 0, key: "repair" },
    { name: "modernization", value: 0, key: "modernization" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Fallback values if data is not available
  const safeSummary = summary || {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    unpaidRevenue: 0,
    totalSalaries: 0,
    inventoryValue: 0
  };

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
            <div className="text-2xl font-bold">{formatCurrency(safeSummary.totalRevenue)}</div>
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
            <div className="text-2xl font-bold">{formatCurrency(safeSummary.totalExpenses)}</div>
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
            <div className="text-2xl font-bold">{formatCurrency(safeSummary.netProfit)}</div>
            <p className="text-xs text-gray-500 mt-1">
              هامش الربح: {" "}
              {safeSummary.totalRevenue > 0 ? ((safeSummary.netProfit / safeSummary.totalRevenue) * 100).toFixed(1) : 0}%
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
            <div className="text-2xl font-bold">{formatCurrency(safeSummary.unpaidRevenue)}</div>
            <p className="text-xs text-gray-500 mt-1">من {recentJobs.filter((j) => j.paymentStatus !== "paid").length} عملية</p>
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
            <p className="text-xs text-gray-500">إجمالي الرواتب: {formatCurrency(safeSummary.totalSalaries)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">المخزون</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(safeSummary.inventoryValue)}</div>
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
