"use client";

import React, { useState, useEffect } from "react";
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
import { getSpareParts, createSparePart, updateSparePart } from "@/lib/database";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Edit2, Download, Loader2, TrendingUp, Package, AlertTriangle } from "lucide-react";
import * as XLSX from "xlsx";

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryList, setInventoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    wholesale_price: "",
    retail_price: "",
    quantity: "1",
    supplier: "",
    min_stock: "1",
    part_number: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await getSpareParts();
      if (error) throw error;
      setInventoryList(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.wholesale_price || !formData.retail_price) {
      alert("يرجى ملء الاسم وأسعار الشراء والبيع");
      return;
    }

    setIsSaving(true);
    const payload = {
      name: formData.name,
      wholesale_price: Number(formData.wholesale_price),
      retail_price: Number(formData.retail_price),
      quantity: Number(formData.quantity),
      supplier: formData.supplier,
      min_stock: Number(formData.min_stock),
      part_number: formData.part_number,
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
      
      setIsAddDialogOpen(false);
      await fetchData();
      alert("تم حفظ البيانات بنجاح");
    } catch (error) {
      alert("فشل في الحفظ: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredParts.map(item => ({
      "اسم الصنف": item.name,
      "رقم القطعة": item.part_number,
      "المورد": item.supplier,
      "الكمية": item.quantity,
      "سعر الشراء": item.wholesale_price,
      "سعر البيع": item.retail_price,
      "صافي الربح للوحدة": item.retail_price - item.wholesale_price,
      "إجمالي الربح المتوقع": (item.retail_price - item.wholesale_price) * item.quantity
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "تقرير_المخزون.xlsx");
  };

  const filteredParts = inventoryList.filter((part) =>
    part.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    part.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.part_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // حسابات الإجماليات للـ Dashboard المصغر
  const totalValue = filteredParts.reduce((acc, item) => acc + (item.wholesale_price * item.quantity), 0);
  const expectedProfit = filteredParts.reduce((acc, item) => acc + ((item.retail_price - item.wholesale_price) * item.quantity), 0);

  return (
    <div className="p-4 space-y-6" dir="rtl">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight">إدارة المخزون</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none" onClick={exportToExcel}>
            <Download className="ml-2 h-4 w-4" /> Excel
          </Button>
          <Button className="flex-1 md:flex-none" onClick={() => { 
            setEditingItem(null); 
            setFormData({ name: "", wholesale_price: "", retail_price: "", quantity: "1", supplier: "", min_stock: "1", part_number: "" });
            setIsAddDialogOpen(true); 
          }}>
            <Plus className="ml-2 h-4 w-4" /> صنف جديد
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">إجمالي قيمة المخزون</p>
              <h3 className="text-2xl font-bold">{formatCurrency(totalValue)}</h3>
            </div>
            <Package className="h-8 w-8 text-blue-400" />
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">صافي الربح المتوقع</p>
              <h3 className="text-2xl font-bold">{formatCurrency(expectedProfit)}</h3>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">أصناف تحتاج طلب</p>
              <h3 className="text-2xl font-bold">{filteredParts.filter(i => i.quantity <= i.min_stock).length}</h3>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-400" />
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        <Input
          placeholder="ابحث بالاسم، المورد، أو رقم القطعة..."
          className="pr-10 h-12 text-lg shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden border-none shadow-lg">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="text-right font-bold text-gray-900">الصنف</TableHead>
              <TableHead className="text-right font-bold text-gray-900">الكمية</TableHead>
              <TableHead className="text-right font-bold text-gray-900">سعر البيع</TableHead>
              <TableHead className="text-right font-bold text-gray-900 text-green-700">صافي الربح</TableHead>
              <TableHead className="text-center font-bold text-gray-900 w-24">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" /></TableCell></TableRow>
            ) : filteredParts.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20 text-gray-500">لم يتم العثور على أي نتائج</TableCell></TableRow>
            ) : (
              filteredParts.map((item) => (
                <TableRow key={item.id} className="hover:bg-blue-50/50 transition-colors">
                  <TableCell>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.part_number || "بدون رقم"}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.quantity <= item.min_stock ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                      {item.quantity} وحدة
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">{formatCurrency(item.retail_price)}</TableCell>
                  <TableCell className="text-green-700 font-bold">
                    {formatCurrency(item.retail_price - item.wholesale_price)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" className="hover:bg-blue-100 hover:text-blue-600" onClick={() => {
                      setEditingItem(item);
                      setFormData({
                        name: item.name,
                        wholesale_price: item.wholesale_price.toString(),
                        retail_price: item.retail_price.toString(),
                        quantity: item.quantity.toString(),
                        supplier: item.supplier || "",
                        min_stock: item.min_stock.toString(),
                        part_number: item.part_number || ""
                      });
                      setIsAddDialogOpen(true);
                    }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle className="text-2xl">{editingItem ? "تعديل صنف" : "إضافة صنف جديد"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4" dir="rtl">
            <div className="col-span-2 space-y-2">
              <Label>اسم الصنف</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>رقم القطعة</Label>
              <Input value={formData.part_number} onChange={(e) => setFormData({...formData, part_number: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>المورد</Label>
              <Input value={formData.supplier} onChange={(e) => setFormData({...formData, supplier: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>سعر الشراء</Label>
              <Input type="number" value={formData.wholesale_price} onChange={(e) => setFormData({...formData, wholesale_price: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>سعر البيع</Label>
              <Input type="number" value={formData.retail_price} onChange={(e) => setFormData({...formData, retail_price: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>الكمية المتوفرة</Label>
              <Input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>الحد الأدنى (تنبيه)</Label>
              <Input type="number" value={formData.min_stock} onChange={(e) => setFormData({...formData, min_stock: e.target.value})} />
            </div>
          </div>
          <DialogFooter className="gap-2">
             <DialogClose asChild>
              <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 px-8">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ الصنف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
