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
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getSpareParts, createSparePart, updateSparePart, deleteSparePart } from "@/lib/database";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Edit2, Trash2, Download, CalendarIcon } from "lucide-react";
import * as XLSX from "xlsx";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// No initial mock data - all data comes from database

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("2024-01");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [inventoryList, setInventoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: sparePartsData, error } = await getSpareParts();
        if (error) {
          console.error('Error fetching inventory:', error);
          setInventoryList([]);
        } else {
          // Transform database data to match UI expectations
          const transformedData = (sparePartsData || []).map(part => ({
            id: part.id,
            name: part.name,
            category: part.spare_parts_categories?.name || 'غير محدد',
            wholesalePrice: part.wholesale_price,
            retailPrice: part.retail_price,
            quantity: part.quantity,
            supplier: part.supplier || '',
            categoryId: part.category_id,
            minStock: part.min_stock,
            partNumber: part.part_number,
            isActive: part.is_active
          }));
          setInventoryList(transformedData);
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setInventoryList([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    categoryId: "",
    wholesalePrice: "",
    retailPrice: "",
    quantity: "",
    supplier: "",
    minStock: "1",
    partNumber: "",
  });

  const categories = [...new Set(inventoryList.map((p) => p.category).filter(Boolean))];
  
  const filteredParts = inventoryList.filter((part) => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (part.supplier || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || part.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate totals (multiply by quantity)
  const totalWholesaleValue = filteredParts.reduce((sum, p) => sum + (p.wholesalePrice || 0) * p.quantity, 0);
  const totalRetailValue = filteredParts.reduce((sum, p) => sum + (p.retailPrice || 0) * p.quantity, 0);
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
      wholesalePrice: item.wholesalePrice?.toString() || "",
      retailPrice: item.retailPrice?.toString() || "",
      quantity: item.quantity.toString(),
      supplier: item.supplier || "",
      minStock: item.minStock?.toString() || "1",
      partNumber: item.partNumber || "",
    });
    setIsAddDialogOpen(true);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.name || !formData.wholesalePrice || !formData.retailPrice || !formData.quantity) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      if (editingItem) {
        // Update existing item
        const { error } = await updateSparePart(editingItem.id, {
          name: formData.name,
          category_id: formData.categoryId || null,
          wholesale_price: Number(formData.wholesalePrice),
          retail_price: Number(formData.retailPrice),
          quantity: Number(formData.quantity),
          supplier: formData.supplier,
          min_stock: Number(formData.minStock) || 1,
          part_number: formData.partNumber || null,
        });
        
        if (error) {
          console.error('Error updating spare part:', error);
          alert('حدث خطأ في تحديث الصنف');
          return;
        }
        
        // Update local state
        setInventoryList(prev => prev.map(item => 
          item.id === editingItem.id 
            ? { 
                ...item, 
                name: formData.name, 
                category: formData.category,
                categoryId: formData.categoryId,
                wholesalePrice: Number(formData.wholesalePrice),
                retailPrice: Number(formData.retailPrice),
                quantity: Number(formData.quantity),
                supplier: formData.supplier,
                minStock: Number(formData.minStock),
                partNumber: formData.partNumber,
              }
            : item
        ));
      } else {
        // Add new item
        const { data, error } = await createSparePart({
          name: formData.name,
          category_id: formData.categoryId || null,
          wholesale_price: Number(formData.wholesalePrice),
          retail_price: Number(formData.retailPrice),
          quantity: Number(formData.quantity) || 1,
          supplier: formData.supplier,
          min_stock: Number(formData.minStock) || 1,
          part_number: formData.partNumber || null,
          is_active: true,
        });
        
        if (error) {
          console.error('Error creating spare part:', error);
          alert('حدث خطأ في إضافة الصنف');
          return;
        }
        
        // Add to local state with returned data
        if (data && data.length > 0) {
          const newPart = data[0];
          setInventoryList(prev => [...prev, {
            id: newPart.id,
            name: newPart.name,
            category: formData.category,
            categoryId: newPart.category_id,
            wholesalePrice: newPart.wholesale_price,
            retailPrice: newPart.retail_price,
            quantity: newPart.quantity,
            supplier: newPart.supplier,
            minStock: newPart.min_stock,
            partNumber: newPart.part_number,
            isActive: newPart.is_active,
          }]);
        }
      }
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error saving spare part:', error);
      alert('حدث خطأ في حفظ البيانات');
    }
  };

  const handleDelete = async (itemId) => {
    if (confirm("هل أنت متأكد من حذف هذا الصنف؟")) {
      try {
        const { error } = await updateSparePart(itemId, { is_active: false });
        
        if (error) {
          console.error('Error deleting spare part:', error);
          alert('حدث خطأ في حذف الصنف');
          return;
        }
        
        // Remove from local state
        setInventoryList(prev => prev.filter(item => item.id !== itemId));
      } catch (error) {
        console.error('Error deleting spare part:', error);
        alert('حدث خطأ في حذف الصنف');
      }
    }
  };

  const exportToExcel = () => {
    const today = new Date();
    const title = `المخزون - ${today.toLocaleDateString('ar-EG')}`;

    // Calculate totals
    const totalWholesale = filteredParts.reduce((sum, item) => sum + (item.wholesalePrice || 0) * item.quantity, 0);
    const totalRetail = filteredParts.reduce((sum, item) => sum + (item.retailPrice || 0) * item.quantity, 0);

    // Build data with title, headers, data rows, and total row
    const data = [
      [title], // Title row
      [], // Empty row
      ["الاسم", "الفئة", "سعر الجملة", "سعر البيع", "الكمية", "الإجمالي شراء", "الإجمالي بيع", "المورد"], // Headers
      ...filteredParts.map((part) => [
        part.name,
        part.category,
        part.wholesalePrice || 0,
        part.retailPrice || 0,
        part.quantity,
        (part.wholesalePrice || 0) * part.quantity,
        (part.retailPrice || 0) * part.quantity,
        part.supplier,
      ]),
      [], // Empty row before total
      ["الإجمالي", "", "", "", "", totalWholesale, totalRetail, ""], // Total row
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    // Make title bold and larger
    ws["A1"].s = { font: { bold: true, sz: 14 } };
    // Make total row bold
    ws["A" + (data.length)].s = { font: { bold: true } };
    ws["F" + (data.length)].s = { font: { bold: true } };
    ws["G" + (data.length)].s = { font: { bold: true } };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المخزون");
    XLSX.writeFile(wb, `مخزون_${today.toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">إجمالي الشراء - {selectedMonth}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalWholesaleValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">إجمالي البيع - {selectedMonth}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRetailValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">صافي الربح - {selectedMonth}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">عدد الأصناف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="بحث عن صنف..."
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
              captionLayout="dropdown"
              fromYear={2020}
              toYear={2030}
              monthsMode={true}
              className="rounded-md border p-4"
              classNames={{
                day: "h-10 w-10 text-base",
                head_cell: "w-10 text-base",
                caption_label: "text-base font-semibold",
                nav_button: "h-10 w-10",
                dropdowns: "flex gap-2 p-4",
                dropdown_root: "w-32",
              }}
            />
          </PopoverContent>
        </Popover>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="جميع الفئات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الفئات</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Purchases Table */}
      <Card>
        <CardContent className="p-0">
          <Table className="border-black">
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
              {filteredParts.map((part) => (
                <TableRow key={part.id}>
                  <TableCell className="font-medium">{part.name}</TableCell>
                  <TableCell>{part.supplier}</TableCell>
                  <TableCell>{part.quantity}</TableCell>
                  <TableCell>{formatCurrency(part.wholesalePrice || 0)}</TableCell>
                  <TableCell className="text-blue-600 font-semibold">{formatCurrency(part.retailPrice || 0)}</TableCell>
                  <TableCell className="text-green-600 font-semibold">{formatCurrency((part.retailPrice || 0) - (part.wholesalePrice || 0))}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(part)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(part.id)} className="text-red-500"> 
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
            <DialogDescription>
              {editingItem ? "تعديل بيانات الصنف" : "إضافة صنف جديد للمخزون"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>الاسم</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>رقم القطعة</Label>
                <Input
                  value={formData.partNumber}
                  onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                  placeholder="Part Number"
                />
              </div>
              <div className="space-y-2">
                <Label>المورد</Label>
                <Input
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>سعر الجملة (من المورد)</Label>
                <Input
                  type="number"
                  value={formData.wholesalePrice}
                  onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                  placeholder="سعر الشراء من المورد"
                />
              </div>
              <div className="space-y-2">
                <Label>سعر البيع (للعميل)</Label>
                <Input
                  type="number"
                  value={formData.retailPrice}
                  onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
                  placeholder="سعر البيع للعميل"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الكمية</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>الحد الأدنى للمخزون</Label>
                <Input
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  placeholder="1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>الربح المتوقع للوحدة</Label>
              <div className="h-10 flex items-center px-3 rounded-md border border-gray-200 bg-gray-50 text-green-600 font-medium">
                {formData.retailPrice && formData.wholesalePrice 
                  ? formatCurrency(Number(formData.retailPrice) - Number(formData.wholesalePrice))
                  : "-"
                }
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <Button onClick={handleSave}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
