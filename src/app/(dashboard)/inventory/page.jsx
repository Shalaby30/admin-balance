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
import { getSpareParts } from "@/lib/database";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Edit2, Trash2, Download, CalendarIcon } from "lucide-react";
import * as XLSX from "xlsx";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Initial inventory data
const initialInventory = [
  { id: 1, name: "سلك كهربائي 1.5مم", category: "كهربائية", wholesalePrice: 12000, retailPrice: 15000, quantity: 10, supplier: "شركة القاهرة", month: "2024-01" },
  { id: 2, name: "محرك مسح 5 حصان", category: "محركات", wholesalePrice: 28000, retailPrice: 32000, quantity: 2, supplier: "مصاعد علي", month: "2024-01" },
  { id: 3, name: "بطارية طوارئ 12V", category: "كهربائية", wholesalePrice: 2200, retailPrice: 2800, quantity: 5, supplier: "معدات الفهد", month: "2024-01" },
  { id: 4, name: "فلاتر زيت", category: "ميكانيكية", wholesalePrice: 900, retailPrice: 1200, quantity: 20, supplier: "مصاعد علي", month: "2024-01" },
  { id: 5, name: "أزرار تحكم داخلية", category: "تحكم", wholesalePrice: 1400, retailPrice: 1800, quantity: 8, supplier: "هي كون", month: "2024-01" },
  { id: 6, name: "أرجوحة تاكر بلاط", category: "تحكم", wholesalePrice: 2000, retailPrice: 2600, quantity: 6, supplier: "هي كون", month: "2024-01" },
  { id: 7, name: "كابلات شبكة CAT5", category: "اتصالات", wholesalePrice: 2500, retailPrice: 3300, quantity: 10, supplier: "تركي أوليد", month: "2024-01" },
  { id: 8, name: "ريل مصنوع داخلي", category: "ميكانيكية", wholesalePrice: 3800, retailPrice: 4800, quantity: 4, supplier: "مصاعد علي", month: "2024-01" },
];

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
        const { data: sparePartsData } = await getSpareParts();
        setInventoryList(sparePartsData || []);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    wholesalePrice: "",
    retailPrice: "",
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

  // Calculate totals for the selected month (multiply by quantity)
  const monthItems = inventoryList.filter(p => p.month === selectedMonth);
  const totalWholesaleValue = monthItems.reduce((sum, p) => sum + (p.wholesalePrice || 0) * p.quantity, 0);
  const totalRetailValue = monthItems.reduce((sum, p) => sum + (p.retailPrice || 0) * p.quantity, 0);
  const totalProfit = totalRetailValue - totalWholesaleValue;
  const totalItems = monthItems.length;

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: "", category: "", wholesalePrice: "", retailPrice: "", quantity: "1", supplier: "", month: selectedMonth });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      wholesalePrice: item.wholesalePrice?.toString() || "",
      retailPrice: item.retailPrice?.toString() || "",
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
              wholesalePrice: Number(formData.wholesalePrice),
              retailPrice: Number(formData.retailPrice),
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
        wholesalePrice: Number(formData.wholesalePrice),
        retailPrice: Number(formData.retailPrice),
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

    // Calculate totals
    const totalWholesale = monthItems.reduce((sum, item) => sum + (item.wholesalePrice || 0), 0);
    const totalRetail = monthItems.reduce((sum, item) => sum + (item.retailPrice || 0), 0);

    // Build data with title, headers, data rows, and total row
    const data = [
      [title], // Title row
      [], // Empty row
      ["الاسم", "الفئة", "سعر الجملة", "سعر البيع", "الكمية", "المورد"], // Headers
      ...monthItems.map((part) => [
        part.name,
        part.category,
        part.wholesalePrice || 0,
        part.retailPrice || 0,
        part.quantity,
        part.supplier,
      ]),
      [], // Empty row before total
      ["الإجمالي", "", totalWholesale, totalRetail, "", ""], // Total row
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
                <TableHead className="text-right">التاريخ</TableHead>
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
                  <TableCell>{part.month}</TableCell>
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
                <Label>الربح المتوقع</Label>
                <div className="h-10 flex items-center px-3 rounded-md border border-gray-200 bg-gray-50 text-green-600 font-medium">
                  {formData.retailPrice && formData.wholesalePrice 
                    ? formatCurrency(Number(formData.retailPrice) - Number(formData.wholesalePrice))
                    : "-"
                  }
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>الشهر</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-right font-normal">
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {formData.month}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(formData.month + "-01")}
                    onSelect={(date) => date && setFormData({ ...formData, month: date.toISOString().slice(0, 7) })}
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
