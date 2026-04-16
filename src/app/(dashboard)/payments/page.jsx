"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { transactions, clients, jobs } from "@/lib/mockData";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Search, Download, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import * as XLSX from "xlsx";

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "income",
    clientId: "",
    amount: "",
    date: "",
    description: "",
  });

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const handleAdd = () => {
    setFormData({
      type: "income",
      clientId: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    });
    setIsAddDialogOpen(true);
  };

  const exportToExcel = () => {
    const title = "المعاملات المالية";
    const exportDate = new Date().toLocaleDateString("ar-EG");

    // Calculate totals
    const currentTotalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const currentTotalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const currentBalance = currentTotalIncome - currentTotalExpenses;

    // Build data with title, headers, data rows, and total rows
    const data = [
      [title], // Title row
      ["تاريخ التصدير:", exportDate], // Date row
      [], // Empty row
      ["التاريخ", "النوع", "الوصف", "المبلغ"], // Headers
      ...transactions.map((t) => [
        formatDate(t.date),
        t.type === "income" ? "إيراد" : "مصروف",
        t.description,
        t.amount,
      ]),
      [], // Empty row before totals
      ["الإجماليات", "", "", ""], // Totals header
      ["", "", "إجمالي الإيرادات:", currentTotalIncome], // Income row
      ["", "", "إجمالي المصروفات:", currentTotalExpenses], // Expense row
      ["", "", "الرصيد:", currentBalance], // Balance row
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    // Make title bold and larger
    ws["A1"].s = { font: { bold: true, sz: 14 } };
    // Make total rows bold with colors
    const totalsHeaderRow = data.length - 3;
    ws["A" + totalsHeaderRow].s = { font: { bold: true } };
    ws["C" + (totalsHeaderRow + 1)].s = { font: { bold: true, color: { rgb: "00AA00" } } };
    ws["D" + (totalsHeaderRow + 1)].s = { font: { bold: true, color: { rgb: "00AA00" } } };
    ws["C" + (totalsHeaderRow + 2)].s = { font: { bold: true, color: { rgb: "AA0000" } } };
    ws["D" + (totalsHeaderRow + 2)].s = { font: { bold: true, color: { rgb: "AA0000" } } };
    ws["C" + (totalsHeaderRow + 3)].s = { font: { bold: true, color: { rgb: "0000AA" } } };
    ws["D" + (totalsHeaderRow + 3)].s = { font: { bold: true, color: { rgb: "0000AA" } } };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المعاملات");
    XLSX.writeFile(wb, "المعاملات_المالية.xlsx");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200">المدفوعات والمعاملات</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">تتبع المدفوعات الواردة والمصروفات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel} className="border-slate-200 dark:border-slate-700">
            <Download className="w-4 h-4 ml-2" />
            تصدير Excel
          </Button>
          <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 ml-2" />
            تسجيل معاملة
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">إجمالي الإيرادات</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">ما تم تحصيله</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">إجمالي المصروفات</CardTitle>
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">ما تم صرفه</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">الرصيد</CardTitle>
            <div className={`w-3 h-3 rounded-full ${balance >= 0 ? "bg-green-500" : "bg-red-500"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">{balance >= 0 ? "فائض" : "عجز"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="بحث في المعاملات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="all">جميع المعاملات</option>
          <option value="income">إيرادات فقط</option>
          <option value="expense">مصروفات فقط</option>
        </select>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الرصيد التراكمي</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction, index) => {
                const runningBalance = filteredTransactions
                  .slice(0, index + 1)
                  .reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0);

                return (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === "income" ? "success" : "danger"}>
                        {transaction.type === "income" ? "إيراد" : "مصروف"}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <span className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(runningBalance)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Transaction Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تسجيل معاملة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع المعاملة</Label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="income">إيراد</option>
                  <option value="expense">مصروف</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>المبلغ</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>
            {formData.type === "income" && (
              <div className="space-y-2">
                <Label>العميل (اختياري)</Label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="">اختر العميل</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <Label>التاريخ</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>الوصف</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <Button onClick={() => setIsAddDialogOpen(false)}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
