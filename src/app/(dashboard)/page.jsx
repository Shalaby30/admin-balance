"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getFinancialSummary, getMonthlyData, getJobs, getTransactions, getLowStockItems } from "@/lib/database";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TrendingUp, TrendingDown, Users, Package, Briefcase, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

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
        const [s, m, l, j, t] = await Promise.all([
          getFinancialSummary(), getMonthlyData(), getLowStockItems(), getJobs(), getTransactions()
        ]);
        setSummary(s.data);
        setMonthlyData(m);
        setLowStock(l.data || []);
        setRecentJobs(j.data?.slice(0, 5) || []);
        setRecentTransactions(t.data?.slice(0, 5) || []);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const safeSummary = summary || { totalRevenue: 0, totalExpenses: 0, netProfit: 0, unpaidRevenue: 0, totalSalaries: 0, inventoryValue: 0 };

  if (loading) return <div className="p-10 text-center animate-pulse">جاري تحميل البيانات...</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="إجمالي الإيرادات" value={safeSummary.totalRevenue} icon={<TrendingUp className="text-green-500"/>} color="text-green-600" />
        <StatCard title="إجمالي المصروفات" value={safeSummary.totalExpenses} icon={<TrendingDown className="text-red-500"/>} color="text-red-600" />
        <StatCard title="صافي الربح" value={safeSummary.netProfit} icon={<TrendingUp className="text-blue-500"/>} color="text-blue-600" />
        <StatCard title="المبالغ المستحقة" value={safeSummary.unpaidRevenue} icon={<AlertCircle className="text-yellow-500"/>} color="text-yellow-600" />
      </div>

      <Card className="p-6">
        <CardTitle className="mb-4">أحدث المعاملات</CardTitle>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>التاريخ</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>المبلغ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{formatDate(t.date)}</TableCell>
                <TableCell>{t.description}</TableCell>
                <TableCell className={t.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(t.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{formatCurrency(value)}</div>
      </CardContent>
    </Card>
  );
}
