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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { transactions, clients, jobs } from "@/lib/mockData";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Search, Download, ArrowDownLeft, ArrowUpRight, Edit2, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionsList, setTransactionsList] = useState(transactions);
  const [formData, setFormData] = useState({
    type: "income",
    clientId: "none",
    amount: "",
    date: "",
    description: "",
  });

  const filteredTransactions = transactionsList.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalIncome = transactionsList
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactionsList
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const handleAdd = () => {
    setFormData({
      type: "income",
      clientId: "none",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      clientId: String(transaction.clientId || "none"),
      amount: String(transaction.amount),
      date: transaction.date,
      description: transaction.description,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveAdd = () => {
    const newTransaction = {
      id: Date.now(),
      type: formData.type,
      clientId: formData.clientId && formData.clientId !== "none" ? parseInt(formData.clientId) : null,
      jobId: null,
      amount: Number(formData.amount),
      date: formData.date,
      description: formData.description,
    };
    setTransactionsList([newTransaction, ...transactionsList]);
    setIsAddDialogOpen(false);
  };

  const handleSaveEdit = () => {
    if (!editingTransaction) return;
    const updatedTransactions = transactionsList.map((t) =>
      t.id === editingTransaction.id
        ? {
            ...t,
            type: formData.type,
            clientId: formData.clientId && formData.clientId !== "none" ? parseInt(formData.clientId) : null,
            amount: Number(formData.amount),
            date: formData.date,
            description: formData.description,
          }
        : t
    );
    setTransactionsList(updatedTransactions);
    setIsEditDialogOpen(false);
    setEditingTransaction(null);
  };

  const handleDelete = (id) => {
    if (confirm("هل أنت متأكد من حذف هذه المعاملة؟")) {
      setTransactionsList(transactionsList.filter((t) => t.id !== id));
    }
  };

  const exportToExcel = () => {
    const title = "المعاملات المالية";
    const exportDate = new Date().toLocaleDateString("ar-EG");

    // Calculate totals
    const currentTotalIncome = transactionsList
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const currentTotalExpenses = transactionsList
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const currentBalance = currentTotalIncome - currentTotalExpenses;

    // Build data with title, headers, data rows, and total rows
    const data = [
      [title], // Title row
      ["تاريخ التصدير:", exportDate], // Date row
      [], // Empty row
      ["التاريخ", "النوع", "الوصف", "المبلغ"], // Headers
      ...transactionsList.map((t) => [
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المدفوعات والمعاملات</h1>
          <p className="text-gray-500 mt-1">تتبع المدفوعات الواردة والمصروفات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="w-4 h-4 ml-2" />
            تصدير Excel
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 ml-2" />
            تسجيل معاملة
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">إجمالي الإيرادات</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">إجمالي المصروفات</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">الرصيد</CardTitle>
            <div className={`h-4 w-4 rounded-full ${balance >= 0 ? "bg-green-500" : "bg-red-500"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="بحث في المعاملات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="جميع المعاملات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المعاملات</SelectItem>
            <SelectItem value="income">إيرادات فقط</SelectItem>
            <SelectItem value="expense">مصروفات فقط</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <Table className="border-black">
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الرصيد التراكمي</TableHead>
                <TableHead>الإجراءات</TableHead>
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
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(transaction)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(transaction.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
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
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">إيراد</SelectItem>
                    <SelectItem value="expense">مصروف</SelectItem>
                  </SelectContent>
                </Select>
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
                <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">اختر العميل</SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <Button onClick={handleSaveAdd}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل معاملة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع المعاملة</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">إيراد</SelectItem>
                    <SelectItem value="expense">مصروف</SelectItem>
                  </SelectContent>
                </Select>
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
                <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">اختر العميل</SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <Button onClick={handleSaveEdit}>حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
