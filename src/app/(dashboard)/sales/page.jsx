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
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Edit2, Trash2, Download, CalendarIcon, Package, User } from "lucide-react";
import * as XLSX from "xlsx";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getClients, getSpareParts } from "@/lib/database";

// Initial sales data
const initialSales = [
  { id: 1, clientId: 1, itemId: 1, itemName: "سلك كهربائي 10مم", quantity: 5, price: 50, total: 250, date: "2024-01-15", month: "2024-01" },
  { id: 2, clientId: 2, itemId: 2, itemName: "محرك مصعد 5 حصان", quantity: 1, price: 4000, total: 4000, date: "2024-01-20", month: "2024-01" },
];

export default function SalesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("2024-01");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [salesList, setSalesList] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sparePartsResult, clientsResult] = await Promise.all([
          getSpareParts(),
          getClients()
        ]);
        
        setInventoryList(sparePartsResult.data || []);
        setClientsList(clientsResult.data || []);
        // TODO: Add getSales function to database.js
        // const { data: salesData } = await getSales();
        // setSalesList(salesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);
  
  const [formData, setFormData] = useState({
    clientId: "",
    itemId: "",
    quantity: "",
    price: "",
    date: new Date().toISOString().split("T")[0],
    month: "2024-01",
  });

  const filteredSales = salesList.filter((sale) => {
    const matchesSearch = sale.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getClientName(sale.clientId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = sale.month === selectedMonth;
    return matchesSearch && matchesMonth;
  });

  const totalSales = filteredSales.reduce((sum, s) => sum + s.total, 0);

  function getClientName(clientId) {
    const client = clientsList.find((c) => c.id === clientId);
    return client ? client.name : "Unknown";
  }

  function getClientPhone(clientId) {
    const client = clientsList.find((c) => c.id === clientId);
    return client ? client.phone : "";
  }

  function getItemStock(itemId) {
    const item = inventoryList.find((i) => i.id === parseInt(itemId));
    return item ? item.quantity : 0;
  }

  function getItemPrice(itemId) {
    const item = inventoryList.find((i) => i.id === parseInt(itemId));
    return item ? item.price : 0;
  }

  const handleAdd = () => {
    setFormData({
      clientId: "none",
      itemId: "none",
      quantity: "",
      price: "",
      date: new Date().toISOString().split("T")[0],
      month: selectedMonth,
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (sale) => {
    setEditingSale(sale);
    setFormData({
      clientId: String(sale.clientId),
      itemId: String(sale.itemId),
      quantity: String(sale.quantity),
      price: String(sale.price),
      date: sale.date,
      month: sale.month,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveAdd = () => {
    if (formData.clientId === "none" || formData.itemId === "none") return;
    
    const item = inventoryList.find((i) => i.id === parseInt(formData.itemId));
    if (!item) return;

    const quantity = parseInt(formData.quantity);
    if (quantity > item.quantity) {
      alert(`الكمية غير متوفرة! المخزن يحتوي على ${item.quantity} قطعة فقط`);
      return;
    }

    const total = quantity * parseFloat(formData.price);
    const newSale = {
      id: Date.now(),
      clientId: parseInt(formData.clientId),
      itemId: parseInt(formData.itemId),
      itemName: item.name,
      quantity: quantity,
      price: parseFloat(formData.price),
      total: total,
      date: formData.date,
      month: formData.month,
    };

    // Reduce inventory
    const updatedInventory = inventoryList.map((i) =>
      i.id === parseInt(formData.itemId) ? { ...i, quantity: i.quantity - quantity } : i
    );

    setSalesList([newSale, ...salesList]);
    setInventoryList(updatedInventory);
    setIsAddDialogOpen(false);
  };

  const handleSaveEdit = () => {
    if (!editingSale) return;

    const item = inventoryList.find((i) => i.id === parseInt(formData.itemId));
    if (!item) return;

    const newQuantity = parseInt(formData.quantity);
    const quantityDiff = newQuantity - editingSale.quantity;

    if (quantityDiff > 0 && quantityDiff > item.quantity) {
      alert(`الكمية غير متوفرة! المخزن يحتوي على ${item.quantity} قطعة فقط`);
      return;
    }

    const total = newQuantity * parseFloat(formData.price);
    const updatedSales = salesList.map((s) =>
      s.id === editingSale.id
        ? {
            ...s,
            clientId: parseInt(formData.clientId),
            itemId: parseInt(formData.itemId),
            itemName: item.name,
            quantity: newQuantity,
            price: parseFloat(formData.price),
            total: total,
            date: formData.date,
            month: formData.month,
          }
        : s
    );

    // Update inventory
    const updatedInventory = inventoryList.map((i) =>
      i.id === parseInt(formData.itemId) ? { ...i, quantity: i.quantity - quantityDiff } : i
    );

    setSalesList(updatedSales);
    setInventoryList(updatedInventory);
    setIsEditDialogOpen(false);
    setEditingSale(null);
  };

  const handleDelete = (id) => {
    if (confirm("هل أنت متأكد من حذف عملية البيع؟ سيتم إرجاع الكمية للمخزن")) {
      const sale = salesList.find((s) => s.id === id);
      if (sale) {
        // Return quantity to inventory
        const updatedInventory = inventoryList.map((i) =>
          i.id === sale.itemId ? { ...i, quantity: i.quantity + sale.quantity } : i
        );
        setInventoryList(updatedInventory);
      }
      setSalesList(salesList.filter((s) => s.id !== id));
    }
  };

  const exportToExcel = () => {
    const title = "عمليات البيع";
    const exportDate = new Date().toLocaleDateString("ar-EG");

    const data = [
      [title],
      ["تاريخ التصدير:", exportDate],
      [],
      ["التاريخ", "العميل", "الصنف", "الكمية", "السعر", "الإجمالي"],
      ...filteredSales.map((s) => [
        s.date,
        getClientName(s.clientId),
        s.itemName,
        s.quantity,
        s.price,
        s.total,
      ]),
      [],
      ["", "", "", "", "إجمالي المبيعات:", totalSales],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws["A1"].s = { font: { bold: true, sz: 14 } };
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المبيعات");
    XLSX.writeFile(wb, "عمليات_البيع.xlsx");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold ">عمليات البيع</h1>
          <p className=" mt-1">تسجيل مبيعات قطع الغيار للعملاء</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="w-4 h-4 ml-2" />
            تصدير Excel
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 ml-2 " />
            عملية بيع جديدة
          </Button>
        </div>
      </div>

      {/* Summary Card */}
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

      {/* Sales Table */}
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
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{getClientName(sale.clientId)}</TableCell>
                  <TableCell className="font-medium">{sale.itemName}</TableCell>
                  <TableCell>{sale.quantity}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(sale.price)}</TableCell>
                  <TableCell>{sale.date}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(sale)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
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
        <DialogContent className="max-w-lg text-black bg-white border border-gray-200 [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="text-black">عملية بيع جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>العميل</Label>
                <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">اختر العميل</SelectItem>
                    {clientsList.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>التاريخ</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    const date = e.target.value;
                    setFormData({ ...formData, date, month: date.slice(0, 7) });
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>الصنف</Label>
              <Select value={formData.itemId} onValueChange={(value) => {
                const item = inventoryList.find((i) => i.id === parseInt(value));
                setFormData({ ...formData, itemId: value, price: item ? String(item.retailPrice || item.price || 0) : "" });
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الصنف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">اختر الصنف</SelectItem>
                  {inventoryList.filter(i => i.quantity > 0).map((i) => (
                    <SelectItem key={i.id} value={String(i.id)}>
                      {i.name} (متوفر: {i.quantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.itemId && formData.itemId !== "none" && (
              <div className="text-sm text-black">
                المخزن المتاح: {getItemStock(formData.itemId)} قطعة
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الكمية</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>سعر البيع (للقطعة)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>
            {formData.quantity && formData.price && (
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <span className="text-black">الإجمالي: </span>
                <span className="font-bold text-blue-600 text-lg">
                  {formatCurrency(parseInt(formData.quantity) * parseFloat(formData.price))}
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="text-black bg-white border-black">إلغاء</Button>
            </DialogClose>
            <Button 
              onClick={handleSaveAdd}
              disabled={formData.clientId === "none" || formData.itemId === "none" || !formData.quantity || !formData.price}
              className="text-white bg-black border"
            >
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Sale Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg text-black bg-white border border-gray-200 [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="text-black">تعديل عملية البيع</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>العميل</Label>
                <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">اختر العميل</SelectItem>
                    {clientsList.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>التاريخ</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    const date = e.target.value;
                    setFormData({ ...formData, date, month: date.slice(0, 7) });
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>الصنف</Label>
              <Select value={formData.itemId} onValueChange={(value) => {
                const item = inventoryList.find((i) => i.id === parseInt(value));
                setFormData({ ...formData, itemId: value, price: item ? String(item.retailPrice || item.price || 0) : "" });
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الصنف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">اختر الصنف</SelectItem>
                  {inventoryList.map((i) => (
                    <SelectItem key={i.id} value={String(i.id)}>
                      {i.name} (متوفر: {i.quantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الكمية</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>سعر البيع (للقطعة)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>
            {formData.quantity && formData.price && (
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <span className="text-black">الإجمالي: </span>
                <span className="font-bold text-blue-600 text-lg">
                  {formatCurrency(parseInt(formData.quantity) * parseFloat(formData.price))}
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="text-black bg-white border-black">إلغاء</Button>
            </DialogClose>
            <Button 
              onClick={handleSaveEdit}
              className="text-white bg-black border"
            >
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
