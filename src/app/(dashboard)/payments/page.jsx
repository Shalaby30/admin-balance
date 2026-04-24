"use client";

import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTransactions, getClients, createTransaction, updateTransaction, deleteTransaction } from "@/lib/database";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Search, Download, Edit2, Trash2, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionsList, setTransactionsList] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    type: "income",
    clientId: "none",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [transRes, clientsRes] = await Promise.all([
        getTransactions(),
        getClients()
      ]);
      setTransactionsList(transRes.data || []);
      setClientsList(clientsRes.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    if (!formData.amount || !formData.description) return alert("برجاء ملء البيانات الأساسية");
    
    setIsSaving(true);
    const payload = {
      type: formData.type,
      amount: Number(formData.amount),
      date: formData.date,
      description: formData.description,
      client_id: formData.clientId !== "none" ? formData.clientId : null,
      payment_method: "نقدي" // إضافة القيمة الافتراضية
    };

    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, payload);
      } else {
        await createTransaction(payload);
      }
      await fetchData();
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      setFormData({ type: "income", clientId: "none", amount: "", date: new Date().toISOString().split("T")[0], description: "" });
    } catch (error) {
      alert("خطأ في الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذه المعاملة؟")) {
      await deleteTransaction(id);
      await fetchData();
    }
  };

  const exportToExcel = () => {
    const data = [
      ["تقرير المعاملات المالية"],
      ["تاريخ التقرير:", new Date().toLocaleDateString("ar-EG")],
      [],
      ["التاريخ", "النوع", "العميل", "الوصف", "المبلغ"],
      ...transactionsList.map(t => [
        formatDate(t.date),
        t.type === "income" ? "إيراد" : "مصروف",
        t.clients?.name || "عميل نقدي",
        t.description,
        t.amount
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المالية");
    XLSX.writeFile(wb, "المعاملات_المالية.xlsx");
  };

  const filteredTransactions = transactionsList.filter((t) => {
    const searchStr = (t.description || "") + (t.clients?.name || "");
    const matchesSearch = searchStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalIncome = transactionsList.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactionsList.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المدفوعات والمعاملات</h1>
          <p className="text-gray-500 mt-1">تتبع الحسابات والتدفق النقدي</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="w-4 h-4 ml-2" />
            تصدير Excel
          </Button>
          <Button onClick={() => { setEditingTransaction(null); setIsAddDialogOpen(true); }}>
            <Plus className="w-4 h-4 ml-2" />
            تسجيل معاملة
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="pt-6">
          <div className="text-sm font-medium text-gray-500">إجمالي الإيرادات</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="text-sm font-medium text-gray-500">إجمالي المصروفات</div>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="text-sm font-medium text-gray-500">الرصيد الحالي</div>
          <div className={`text-2xl font-bold ${balance >= 0 ? "text-blue-600" : "text-orange-600"}`}>{formatCurrency(balance)}</div>
        </CardContent></Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="بحث في الوصف أو اسم العميل..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-10" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="income">إيرادات</SelectItem>
            <SelectItem value="expense">مصروفات</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>التاريخ</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>العميل</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center">جاري التحميل...</TableCell></TableRow>
            ) : filteredTransactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{formatDate(t.date)}</TableCell>
                <TableCell><Badge variant={t.type === "income" ? "success" : "destructive"}>{t.type === "income" ? "إيراد" : "مصروف"}</Badge></TableCell>
                <TableCell className="font-medium">{t.clients?.name || "عميل نقدي"}</TableCell>
                <TableCell>{t.description}</TableCell>
                <TableCell className={t.type === "income" ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{formatCurrency(t.amount)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingTransaction(t); setFormData({ ...t, clientId: t.client_id || "none" }); setIsEditDialogOpen(true); }}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(t.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(val) => { setIsAddDialogOpen(val); setIsEditDialogOpen(val); if(!val) setEditingTransaction(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingTransaction ? "تعديل" : "إضافة"} معاملة</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>النوع</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="income">إيراد</SelectItem><SelectItem value="expense">مصروف</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>المبلغ</Label>
                <Input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>العميل (اختياري)</Label>
              <Select value={formData.clientId} onValueChange={(v) => setFormData({...formData, clientId: v})}>
                <SelectTrigger><SelectValue placeholder="اختر العميل" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">عميل نقدي / عام</SelectItem>
                  {clientsList.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الوصف</Label>
              <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="مثلاً: صيانة مصعد، شراء قطع.." />
            </div>
            <div className="space-y-2">
              <Label>التاريخ</Label>
              <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {editingTransaction ? "تحديث المعاملة" : "حفظ المعاملة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
