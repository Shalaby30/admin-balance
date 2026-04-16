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
  DialogDescription,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Edit2, Trash2, Download } from "lucide-react";
import * as XLSX from "xlsx";

// Initial inventory data
const initialInventory = [
  { id: 1, name: "سلك كهربائي 1.5مم", category: "كهربائية", price: 15000, quantity: 10, supplier: "شركة القاهرة", month: "2024-01" },
  { id: 2, name: "محرك مسح 5 حصان", category: "محركات", price: 32000, quantity: 2, supplier: "مصاعد علي", month: "2024-01" },
  { id: 3, name: "بطارية طوارئ 12V", category: "كهربائية", price: 2800, quantity: 5, supplier: "معدات الفهد", month: "2024-01" },
  { id: 4, name: "فلاتر زيت", category: "ميكانيكية", price: 1200, quantity: 20, supplier: "مصاعد علي", month: "2024-01" },
  { id: 5, name: "أزرار تحكم داخلية", category: "تحكم", price: 1800, quantity: 8, supplier: "هي كون", month: "2024-01" },
  { id: 6, name: "أرجوحة تاكر بلاط", category: "تحكم", price: 2600, quantity: 6, supplier: "هي كون", month: "2024-01" },
  { id: 7, name: "كابلات شبكة CAT5", category: "اتصالات", price: 3300, quantity: 10, supplier: "تركي أوليد", month: "2024-01" },
  { id: 8, name: "ريل مصنوع داخلي", category: "ميكانيكية", price: 4800, quantity: 4, supplier: "مصاعد علي", month: "2024-01" },
];

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("2024-01");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [inventoryList, setInventoryList] = useState(initialInventory);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    totalPrice: "",
    quantity: "",
    supplier: "",
    month: "2024-01",
  });

  const categories = [...new Set(inventoryList.map((p) => p.category))];
  
  const filteredParts = inventoryList.filter((part) => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         part.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || part.category === selectedCategory;
    const matchesMonth = part.month === selectedMonth;
    return matchesSearch && matchesCategory && matchesMonth;
  });

  // Calculate totals for the selected month
  const monthItems = inventoryList.filter(p => p.month === selectedMonth);
  const totalValue = monthItems.reduce((sum, p) => sum + p.price, 0);
  const totalItems = monthItems.length;

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: "", category: "", totalPrice: "", quantity: "1", supplier: "", month: selectedMonth });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      totalPrice: item.price.toString(),
      quantity: item.quantity.toString(),
      supplier: item.supplier,
      month: item.month,
    });
    setIsAddDialogOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      // Edit existing item
      setInventoryList(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { 
              ...item, 
              name: formData.name, 
              category: formData.category, 
              price: Number(formData.totalPrice),
              quantity: Number(formData.quantity),
              supplier: formData.supplier,
              month: formData.month || selectedMonth,
            }
          : item
      ));
    } else {
      // Add new item
      const newId = Math.max(...inventoryList.map(i => i.id), 0) + 1;
      setInventoryList(prev => [...prev, {
        id: newId,
        name: formData.name,
        category: formData.category,
        price: Number(formData.totalPrice),
        quantity: Number(formData.quantity) || 1,
        supplier: formData.supplier,
        month: formData.month || selectedMonth,
      }]);
    }
    setIsAddDialogOpen(false);
  };

  const handleDelete = (itemId) => {
    if (confirm("هل أنت متأكد من حذف هذا الصنف؟")) {
      setInventoryList(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const exportToExcel = () => {
    // Format month name in Arabic
    const [year, month] = selectedMonth.split("-");
    const monthNames = {
      "01": "يناير", "02": "فبراير", "03": "مارس", "04": "أبريل",
      "05": "مايو", "06": "يونيو", "07": "يوليو", "08": "أغسطس",
      "09": "سبتمبر", "10": "أكتوبر", "11": "نوفمبر", "12": "ديسمبر"
    };
    const monthName = monthNames[month];
    const title = `مصاريف ${monthName} ${year}`;

    // Calculate total
    const totalAmount = monthItems.reduce((sum, item) => sum + item.price, 0);

    // Build data with title, headers, data rows, and total row
    const data = [
      [title], // Title row
      [], // Empty row
      ["الاسم", "الفئة", "السعر الإجمالي", "الكمية", "المورد"], // Headers
      ...monthItems.map((part) => [
        part.name,
        part.category,
        part.price,
        part.quantity,
        part.supplier,
      ]),
      [], // Empty row before total
      ["الإجمالي", "", totalAmount, "", ""], // Total row
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    // Make title bold and larger
    ws["A1"].s = { font: { bold: true, sz: 14 } };
    // Make total row bold
    ws["A" + (data.length)].s = { font: { bold: true } };
    ws["C" + (data.length)].s = { font: { bold: true } };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المخزون");
    XLSX.writeFile(wb, `مخزون_${selectedMonth}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">المخزون</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">إدارة قطع الغيار والمستلزمات</p>
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
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">إجمالي مصاريف المخزون - {selectedMonth}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">عدد المصاريف</CardTitle>
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
        <Input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-40"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="all">جميع الفئات</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الصنف</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>المورد</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParts.map((part) => (
                <TableRow key={part.id}>
                  <TableCell className="font-medium">{part.name}</TableCell>
                  <TableCell>{part.category}</TableCell>
                  <TableCell>{formatCurrency(part.price)}</TableCell>
                  <TableCell>{part.quantity}</TableCell>
                  <TableCell>{part.supplier}</TableCell>
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
                <Label>الفئة</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                <Label>السعر الإجمالي</Label>
                <Input
                  type="number"
                  value={formData.totalPrice}
                  onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                  placeholder="إجمالي سعر الشراء"
                />
              </div>
              <div className="space-y-2">
                <Label>الكمية</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>الشهر</Label>
              <Input
                type="month"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              />
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
