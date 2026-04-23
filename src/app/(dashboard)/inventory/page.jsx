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
    wholesale_price: "",
    retail_price: "",
    quantity: "1",
    supplier: "",
    min_stock: "1"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await getSpareParts();
      if (error) throw error;
      setInventoryList(data || []);
    } catch (error) {
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
    } catch (error) {
      alert("خطأ: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredParts.map(item => ({
      "الصنف": item.name,
      "المورد": item.supplier,
      "الكمية": item.quantity,
      "سعر الشراء": item.wholesale_price,
      "سعر البيع": item.retail_price,
      "الإجمالي": item.retail_price * item.quantity
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "Inventory_Report.xlsx");
  };

  const filteredParts = inventoryList.filter((part) =>
    part.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    part.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 space-y-6" dir="rtl">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">المخزون</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel} disabled={filteredParts.length === 0}>
            <Download className="ml-2 h-4 w-4" /> Excel
          </Button>
          <Button onClick={() => { 
            setEditingItem(null); 
            setFormData({ name: "", wholesale_price: "", retail_price: "", quantity: "1", supplier: "", min_stock: "1" });
            setIsAddDialogOpen(true); 
          }}>
            <Plus className="ml-2 h-4 w-4" /> إضافة
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="بحث..."
          className="pr-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الصنف</TableHead>
              <TableHead className="text-right">الكمية</TableHead>
              <TableHead className="text-right">البيع</TableHead>
              <TableHead className="text-right">تعديل</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10">جاري التحميل...</TableCell></TableRow>
            ) : filteredParts.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{formatCurrency(item.retail_price)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => {
                    setEditingItem(item);
                    setFormData({
                      name: item.name,
                      wholesale_price: item.wholesale_price.toString(),
                      retail_price: item.retail_price.toString(),
                      quantity: item.quantity.toString(),
                      supplier: item.supplier || "",
                      min_stock: item.min_stock.toString()
                    });
                    setIsAddDialogOpen(true);
                  }}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingItem ? "تعديل" : "إضافة"}</DialogTitle></DialogHeader>
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
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
