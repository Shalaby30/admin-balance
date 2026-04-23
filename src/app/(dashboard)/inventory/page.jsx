"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSpareParts, createSparePart, updateSparePart } from "@/lib/database";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Edit2, Trash2, Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    wholesale_price: "",
    retail_price: "",
    quantity: "1",
    supplier: "",
    min_stock: "1",
    category: "عام",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await getSpareParts();
      if (error) throw error;
      setInventoryList(data || []);
    } catch (error: any) {
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.wholesale_price || !formData.retail_price) {
      alert("يرجى ملء الحقول الأساسية");
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
      alert("تم الحفظ بنجاح");
    } catch (error: any) {
      alert("خطأ: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredParts.map(item => ({
      "اسم الصنف": item.name,
      "المورد": item.supplier,
      "الكمية": item.quantity,
      "سعر الشراء": item.wholesale_price,
      "سعر البيع": item.retail_price,
      "إجمالي الشراء": item.wholesale_price * item.quantity,
      "إجمالي البيع": item.retail_price * item.quantity,
      "صافي الربح المتوقع": (item.retail_price - item.wholesale_price) * item.quantity
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المخزون");
    XLSX.writeFile(wb, `مخزون_المصاعد_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredParts = inventoryList.filter((part) => {
    const matchesSearch = part.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         part.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-4 space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">المخزون (Excel)</h1>
          <p className="text-sm text-gray-500">إدارة الأصناف وتصدير التقارير</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel} disabled={filteredParts.length === 0}>
            <Download className="ml-2 h-4 w-4" /> تصدير Excel
          </Button>
          <Button onClick={() => { 
            setEditingItem(null); 
            setFormData({ name: "", wholesale_price: "", retail_price: "", quantity: "1", supplier: "", min_stock: "1", category: "عام" });
            setIsAddDialogOpen(true); 
          }}>
            <Plus className="ml-2 h-4 w-4" /> إضافة صنف
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="بحث عن صنف أو مورد..."
            className="pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الصنف</TableHead>
              <TableHead className="text-right">الكمية</TableHead>
              <TableHead className="text-right">سعر الشراء</TableHead>
              <TableHead className="text-right">سعر البيع</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10">جاري التحميل...</TableCell></TableRow>
            ) : filteredParts.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{formatCurrency(item.wholesale_price)}</TableCell>
                <TableCell className="text-blue-600 font-bold">{formatCurrency(item.retail_price)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setEditingItem(item);
                      setFormData({ ...item, wholesale_price: item.wholesale_price.toString(), retail_price: item.retail_price.toString(), quantity: item.quantity.toString() });
                      setIsAddDialogOpen(true);
                    }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingItem ? "تعديل" : "إضافة"} صنف</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>اسم الصنف</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>سعر الشراء</Label>
                <Input type="number" value={formData.wholesale_price} onChange={(e) => setFormData({...formData, wholesale_price: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>سعر البيع</Label>
                <Input type="number" value={formData.retail_price} onChange={(e) => setFormData({...formData, retail_price: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الكمية</Label>
                <Input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>المورد</Label>
                <Input value={formData.supplier} onChange={(e) => setFormData({...formData, supplier: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ البيانات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
