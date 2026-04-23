"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
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
import { Plus, Search, Edit2, Download, Loader2 } from "lucide-react";
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
    supplier: "",
    wholesale_price: "",
    retail_price: "",
    quantity: "1"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await getSpareParts();
      if (error) throw error;
      setInventoryList(data || []);
    } catch (error) {
      console.error('Fetch Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.wholesale_price || !formData.retail_price) {
      alert("يرجى إدخال الاسم وأسعار الشراء والبيع");
      return;
    }

    setIsSaving(true);
    // نرسل فقط الحقول المطلوبة والباقي null كما طلبت
    const payload = {
      name: formData.name,
      supplier: formData.supplier || null,
      wholesale_price: Number(formData.wholesale_price),
      retail_price: Number(formData.retail_price),
      quantity: Number(formData.quantity),
      is_active: true,
      // الحقول الأخرى تترك فارغة لتكون null في القاعدة
      part_number: null,
      category_id: null,
      min_stock: 1
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
      alert("تم الحفظ بنجاح");
    } catch (error) {
      alert("حدث خطأ أثناء الحفظ: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const exportToExcel = () => {
    const data = filteredParts.map(item => ({
      "الصنف": item.name,
      "المورد": item.supplier,
      "سعر الشراء": item.wholesale_price,
      "سعر البيع": item.retail_price,
      "الربح الصافي": item.retail_price - item.wholesale_price,
      "الكمية": item.quantity
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "المخزون.xlsx");
  };

  const filteredParts = inventoryList.filter((part) =>
    part.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    part.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4" dir="rtl">
      {/* الجزء العلوي - العنوان والأزرار */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">المخزون الحالي</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToExcel}>
            <Download className="ml-1 h-4 w-4" /> إكسيل
          </Button>
          <Button size="sm" onClick={() => { 
            setEditingItem(null); 
            setFormData({ name: "", supplier: "", wholesale_price: "", retail_price: "", quantity: "1" });
            setIsAddDialogOpen(true); 
          }}>
            <Plus className="ml-1 h-4 w-4" /> إضافة صنف
          </Button>
        </div>
      </div>

      {/* شريط البحث */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="بحث سريع..."
          className="pr-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* الجدول الرئيسي بالـ UI القديم */}
      <Card className="border-none shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="text-right">الصنف</TableHead>
              <TableHead className="text-right">المورد</TableHead>
              <TableHead className="text-right text-blue-600">البيع</TableHead>
              <TableHead className="text-right text-green-600">الربح</TableHead>
              <TableHead className="text-right">الكمية</TableHead>
              <TableHead className="text-center w-16">تعديل</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10">جاري التحميل...</TableCell></TableRow>
            ) : filteredParts.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50">
                <TableCell className="font-bold">{item.name}</TableCell>
                <TableCell className="text-gray-500">{item.supplier || "---"}</TableCell>
                <TableCell className="font-semibold">{formatCurrency(item.retail_price)}</TableCell>
                <TableCell className="text-green-600 font-bold bg-green-50/30">
                  {formatCurrency(item.retail_price - item.wholesale_price)}
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell className="text-center">
                  <Button variant="ghost" size="icon" onClick={() => {
                    setEditingItem(item);
                    setFormData({
                      name: item.name,
                      supplier: item.supplier || "",
                      wholesale_price: item.wholesale_price.toString(),
                      retail_price: item.retail_price.toString(),
                      quantity: item.quantity.toString()
                    });
                    setIsAddDialogOpen(true);
                  }}>
                    <Edit2 className="h-4 w-4 text-blue-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* نافذة الإضافة والتعديل */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? "تعديل البيانات" : "إضافة صنف جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2" dir="rtl">
            <div className="space-y-1">
              <Label>اسم الصنف</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-1">
              <Label>المورد</Label>
              <Input value={formData.supplier} onChange={(e) => setFormData({...formData, supplier: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>سعر الشراء</Label>
                <Input type="number" value={formData.wholesale_price} onChange={(e) => setFormData({...formData, wholesale_price: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label>سعر البيع</Label>
                <Input type="number" value={formData.retail_price} onChange={(e) => setFormData({...formData, retail_price: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>الكمية</Label>
              <Input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
            </div>
            
            {/* حساب الربح التلقائي */}
            <div className="p-3 bg-blue-50 rounded-lg flex justify-between items-center border border-blue-100">
               <span className="text-blue-800 font-bold">الربح المتوقع:</span>
               <span className="text-lg font-black text-blue-700">
                 {formatCurrency((Number(formData.retail_price) || 0) - (Number(formData.wholesale_price) || 0))}
               </span>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : "حفظ الصنف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
