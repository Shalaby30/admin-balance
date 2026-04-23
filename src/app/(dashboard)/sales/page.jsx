"use client";

import { useState, useEffect, useCallback } from "react";
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
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Edit2, Trash2, Download, CalendarIcon, Package, User, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// استيراد الدوال اللازمة من الداتابيز
import { getClients, getSpareParts, updateSparePart, supabase } from "@/lib/database";

export default function SalesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [salesList, setSalesList] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    clientId: "",
    itemId: "",
    quantity: "",
    price: "",
    date: new Date().toISOString().split("T")[0],
    month: new Date().toISOString().slice(0, 7),
  });

  // 1. جلب البيانات من الداتابيز (المخزن، العملاء، والمبيعات)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // جلب المخزن والعملاء
      const [sparePartsResult, clientsResult] = await Promise.all([
        getSpareParts(),
        getClients()
      ]);
      
      setInventoryList(sparePartsResult.data || []);
      setClientsList(clientsResult.data || []);

      // جلب المبيعات (بفرض وجود جدول اسمه sales)
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .order('date', { ascending: false });

      if (!salesError) {
        setSalesList(salesData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. منطق الفلترة (بحث بالعميل أو الصنف + فلتر الشهر)
  const filteredSales = salesList.filter((sale) => {
    const clientName = clientsList.find(c => c.id === sale.client_id)?.name || "";
    const matchesSearch = (sale.item_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = sale.date?.startsWith(selectedMonth);
    return matchesSearch && matchesMonth;
  });

  const totalSales = filteredSales.reduce((sum, s) => sum + (s.total || 0), 0);

  // 3. منطق حفظ عملية بيع جديدة (Logic Fix: تحديث المخزن + تسجيل البيع)
  const handleSaveAdd = async () => {
    if (!formData.clientId || !formData.itemId || !formData.quantity || !formData.price) return;
    
    const item = inventoryList.find((i) => i.id === parseInt(formData.itemId));
    if (!item) return;

    const sellQuantity = parseInt(formData.quantity);
    if (sellQuantity > item.quantity) {
      alert(`الكمية غير متوفرة! المخزن يحتوي على ${item.quantity} قطعة فقط`);
      return;
    }

    setIsSaving(true);
    try {
      const totalAmount = sellQuantity * parseFloat(formData.price);

      // أ- إضافة عملية البيع للداتابيز
      const { error: saleError } = await supabase.from('sales').insert([{
        client_id: parseInt(formData.clientId),
        item_id: item.id,
        item_name: item.name,
        quantity: sellQuantity,
        price: parseFloat(formData.price),
        total: totalAmount,
        date: formData.date
      }]);

      if (saleError) throw saleError;

      // ب- تحديث الكمية في المخزن (نقص الكمية)
      const { error: invError } = await updateSparePart(item.id, {
        quantity: item.quantity - sellQuantity
      });

      if (invError) throw invError;

      await fetchData(); // تحديث الشاشة
      setIsAddDialogOpen(false);
    } catch (error) {
      alert("خطأ أثناء الحفظ: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // 4. منطق حذف عملية بيع (Logic Fix: استرجاع الكمية للمخزن)
  const handleDelete = async (id) => {
    const sale = salesList.find((s) => s.id === id);
    if (!sale) return;

    if (confirm("هل أنت متأكد من حذف عملية البيع؟ سيتم إرجاع الكمية للمخزن")) {
      try {
        // أ- إرجاع الكمية للمخزن أولاً
        const item = inventoryList.find(i => i.id === sale.item_id);
        if (item) {
          await updateSparePart(item.id, {
            quantity: item.quantity + sale.quantity
          });
        }

        // ب- حذف عملية البيع
        await supabase.from('sales').delete().eq('id', id);
        
        await fetchData();
      } catch (error) {
        alert("خطأ أثناء الحذف: " + error.message);
      }
    }
  };

  // دوال مساعدة للـ UI
  const getClientName = (clientId) => clientsList.find(c => c.id === clientId)?.name || "---";

  const exportToExcel = () => {
    const data = filteredSales.map(s => ({
      "التاريخ": s.date,
      "العميل": getClientName(s.client_id),
      "الصنف": s.item_name,
      "الكمية": s.quantity,
      "السعر": s.price,
      "الإجمالي": s.total
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales");
    XLSX.writeFile(wb, `Sales_${selectedMonth}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header - نفس الـ UI بتاعك */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold ">عمليات البيع</h1>
          <p className=" mt-1 text-gray-500">تسجيل مبيعات قطع الغيار للعملاء</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="w-4 h-4 ml-2" /> تصدير Excel
          </Button>
          <Button onClick={() => {
            setFormData({
                clientId: "", itemId: "", quantity: "", price: "",
                date: new Date().toISOString().split("T")[0],
                month: selectedMonth
            });
            setIsAddDialogOpen(true);
          }}>
            <Plus className="w-4 h-4 ml-2 " /> عملية بيع جديدة
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium ">إجمالي المبيعات</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalSales)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium ">عدد العمليات</CardTitle>
            <User className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{filteredSales.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 " />
          <Input
            placeholder="بحث في المبيعات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-40 justify-start text-right font-normal">
              <CalendarIcon className="ml-2 h-4 w-4" />
              {selectedMonth}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={new Date(selectedMonth + "-01")}
              onSelect={(date) => date && setSelectedMonth(date.toISOString().slice(0, 7))}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table className="border-black">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">الصنف</TableHead>
                <TableHead className="text-right">الكمية</TableHead>
                <TableHead className="text-right">السعر</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-gray-400">جاري التحميل...</TableCell></TableRow>
              ) : filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{getClientName(sale.client_id)}</TableCell>
                  <TableCell className="font-medium">{sale.item_name}</TableCell>
                  <TableCell>{sale.quantity}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(sale.price)}</TableCell>
                  <TableCell>{sale.date}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(sale.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Sale Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg text-black bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-black">عملية بيع جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 text-right" dir="rtl">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>العميل</Label>
                <Select value={formData.clientId} onValueChange={(v) => setFormData({...formData, clientId: v})}>
                  <SelectTrigger><SelectValue placeholder="اختر العميل" /></SelectTrigger>
                  <SelectContent>
                    {clientsList.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>التاريخ</Label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>الصنف</Label>
              <Select value={formData.itemId} onValueChange={(v) => {
                const item = inventoryList.find(i => i.id === parseInt(v));
                setFormData({...formData, itemId: v, price: item ? String(item.retail_price || 0) : ""});
              }}>
                <SelectTrigger><SelectValue placeholder="اختر الصنف" /></SelectTrigger>
                <SelectContent>
                  {inventoryList.filter(i => i.quantity > 0).map((i) => (
                    <SelectItem key={i.id} value={String(i.id)}>{i.name} (متوفر: {i.quantity})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الكمية</Label>
                <Input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>سعر البيع</Label>
                <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
              </div>
            </div>
            {formData.quantity && formData.price && (
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <span className="font-bold text-blue-600 text-lg">إجمالي: {formatCurrency(Number(formData.quantity) * Number(formData.price))}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleSaveAdd} disabled={isSaving} className="w-full bg-black text-white">
                {isSaving ? <Loader2 className="animate-spin" /> : "إتمام البيع"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
