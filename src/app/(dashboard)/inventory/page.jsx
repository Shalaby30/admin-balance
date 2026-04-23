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
  DialogDescription,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSpareParts, createSparePart, updateSparePart } from "@/lib/database";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Edit2, Trash2, Download, CalendarIcon, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // الشهر الحالي افتراضياً
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [inventoryList, setInventoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    categoryId: "",
    wholesalePrice: "",
    retailPrice: "",
    quantity: "1",
    supplier: "",
    minStock: "1",
    partNumber: "",
  });

  // 1. منطق جلب البيانات (Logic Fix: تم فصله لسهولة استدعائه بعد الحفظ)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await getSpareParts();
      if (error) throw error;
      
      const transformedData = (data || []).map(part => ({
        id: part.id,
        name: part.name,
        category: part.spare_parts_categories?.name || 'عام',
        wholesalePrice: part.wholesale_price || 0,
        retailPrice: part.retail_price || 0,
        quantity: part.quantity || 0,
        supplier: part.supplier || '',
        categoryId: part.category_id,
        minStock: part.min_stock || 1,
        partNumber: part.part_number || '',
        created_at: part.created_at // مهم للفائدة في فلترة الشهور
      }));
      setInventoryList(transformedData);
    } catch (err) {
      console.error('Error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. منطق الفلترة (Logic Fix: ربط البحث والفئة والتاريخ)
  const filteredParts = inventoryList.filter((part) => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (part.supplier || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || part.category === selectedCategory;
    
    // فلترة حسب الشهر (بناءً على تاريخ الإضافة)
    const partMonth = part.created_at ? part.created_at.slice(0, 7) : "";
    const matchesMonth = !selectedMonth || partMonth === selectedMonth;

    return matchesSearch && matchesCategory && matchesMonth;
  });

  const categories = [...new Set(inventoryList.map((p) => p.category).filter(Boolean))];

  // الحسابات الإجمالية
  const totalWholesaleValue = filteredParts.reduce((sum, p) => sum + (p.wholesalePrice * p.quantity), 0);
  const totalRetailValue = filteredParts.reduce((sum, p) => sum + (p.retailPrice * p.quantity), 0);
  const totalProfit = totalRetailValue - totalWholesaleValue;
  const totalItems = filteredParts.length;

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: "", category: "", categoryId: "", wholesalePrice: "", retailPrice: "", quantity: "1", supplier: "", minStock: "1", partNumber: "" });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      categoryId: item.categoryId || "",
      wholesalePrice: item.wholesalePrice.toString(),
      retailPrice: item.retailPrice.toString(),
      quantity: item.quantity.toString(),
      supplier: item.supplier || "",
      minStock: item.minStock.toString(),
      partNumber: item.partNumber || "",
    });
    setIsAddDialogOpen(true);
  };

  // 3. منطق الحفظ (Logic Fix: التأكد من تحويل الأرقام وإعادة الجلب)
  const handleSave = async () => {
    if (!formData.name || !formData.wholesalePrice || !formData.retailPrice) {
      alert('يرجى ملء البيانات الأساسية');
      return;
    }

    setIsSaving(true);
    const payload = {
      name: formData.name,
      wholesale_price: Number(formData.wholesalePrice),
      retail_price: Number(formData.retailPrice),
      quantity: Number(formData.quantity),
      supplier: formData.supplier,
      min_stock: Number(formData.minStock),
      part_number: formData.partNumber || null,
      is_active: true
    };

    try {
      let result;
      if (editingItem) {
        result = await updateSparePart(editingItem.id, payload);
      } else {
        result = await createSparePart(payload);
      }

      if (result.error) throw result.error;

      await fetchData(); // إعادة جلب البيانات لضمان المزامنة
      setIsAddDialogOpen(false);
    } catch (err) {
      alert("خطأ في الحفظ: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm("هل أنت متأكد من حذف هذا الصنف؟")) return;
    try {
      const { error } = await updateSparePart(itemId, { is_active: false });
      if (error) throw error;
      await fetchData();
    } catch (err) {
      alert("خطأ في الحذف: " + err.message);
    }
  };

  const exportToExcel = () => {
    const data = filteredParts.map(p => ({
      "الاسم": p.name,
      "المورد": p.supplier,
      "الكمية": p.quantity,
      "سعر الشراء": p.wholesalePrice,
      "سعر البيع": p.retailPrice,
      "الربح": p.retailPrice - p.wholesalePrice
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المخزون");
    XLSX.writeFile(wb, `Inventory_${selectedMonth}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header - نفس الـ UI الخاص بك */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المخزون</h1>
          <p className="text-gray-500 mt-1">إدارة قطع الغيار والمستلزمات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="w-4 h-4 ml-2" />
            تصدير Excel
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة صنف
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">إجمالي الشراء</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(totalWholesaleValue)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">إجمالي البيع</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(totalRetailValue)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">صافي الربح</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">عدد الأصناف</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalItems}</div></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="بحث عن صنف..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-10" />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-40 justify-start text-right font-normal">
              <CalendarIcon className="ml-2 h-4 w-4" />
              {selectedMonth || "كل التواريخ"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedMonth ? new Date(selectedMonth + "-01") : null}
              onSelect={(date) => setSelectedMonth(date ? date.toISOString().slice(0, 7) : "")}
            />
          </PopoverContent>
        </Popover>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40"><SelectValue placeholder="جميع الفئات" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الفئات</SelectItem>
            {categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الصنف</TableHead>
                <TableHead className="text-right">المورد</TableHead>
                <TableHead className="text-right">الكمية</TableHead>
                <TableHead className="text-right">سعر الشراء</TableHead>
                <TableHead className="text-right">سعر البيع</TableHead>
                <TableHead className="text-right">الربح</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10">جاري التحميل...</TableCell></TableRow>
              ) : filteredParts.map((part) => (
                <TableRow key={part.id}>
                  <TableCell className="font-medium">{part.name}</TableCell>
                  <TableCell>{part.supplier}</TableCell>
                  <TableCell>{part.quantity}</TableCell>
                  <TableCell>{formatCurrency(part.wholesalePrice)}</TableCell>
                  <TableCell className="text-blue-600 font-semibold">{formatCurrency(part.retailPrice)}</TableCell>
                  <TableCell className="text-green-600 font-semibold">{formatCurrency(part.retailPrice - part.wholesalePrice)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(part)}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(part.id)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "تعديل صنف" : "إضافة صنف جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>الاسم</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>المورد</Label><Input value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} /></div>
              <div className="space-y-2"><Label>الكمية</Label><Input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>سعر الشراء</Label><Input type="number" value={formData.wholesalePrice} onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })} /></div>
              <div className="space-y-2"><Label>سعر البيع</Label><Input type="number" value={formData.retailPrice} onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })} /></div>
            </div>
            <div className="p-3 bg-green-50 text-green-700 rounded-md font-bold flex justify-between">
              <span>الربح للوحدة:</span>
              <span>{formatCurrency((Number(formData.retailPrice) || 0) - (Number(formData.wholesalePrice) || 0))}</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin h-4 w-4 ml-2" /> : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
