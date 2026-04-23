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
import { 
  getClients, 
  getSpareParts, 
  updateSparePart, 
  getSales, 
  createSale, 
  updateSale, 
  deleteSale 
} from "@/lib/database";

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
  });

  // جلب البيانات من الداتابيز
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sparePartsRes, clientsRes, salesRes] = await Promise.all([
        getSpareParts(),
        getClients(),
        getSales()
      ]);
      setInventoryList(sparePartsRes.data || []);
      setClientsList(clientsRes.data || []);
      setSalesList(salesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // منطق البحث والفلترة
  const filteredSales = salesList.filter((sale) => {
    const clientName = clientsList.find(c => c.id === sale.client_id)?.name || "";
    const matchesSearch = (sale.item_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = sale.date?.startsWith(selectedMonth);
    return matchesSearch && matchesMonth;
  });

  const totalSales = filteredSales.reduce((sum, s) => sum + (s.total || 0), 0);

  // --- حفظ عملية بيع جديدة ---
  const handleSaveAdd = async () => {
    const item = inventoryList.find(i => i.id === parseInt(formData.itemId));
    if (!item || !formData.clientId || !formData.quantity) return;

    const sellQty = parseInt(formData.quantity);
    if (sellQty > item.quantity) return alert("الكمية غير كافية في المخزن!");

    setIsSaving(true);
    try {
      const totalAmount = sellQty * parseFloat(formData.price);
      
      // 1. تسجيل البيع
      await createSale({
        client_id: parseInt(formData.clientId),
        item_id: item.id,
        item_name: item.name,
        quantity: sellQty,
        price: parseFloat(formData.price),
        total: totalAmount,
        date: formData.date
      });

      // 2. تحديث المخزن (خصم الكمية)
      await updateSparePart(item.id, { quantity: item.quantity - sellQty });

      await fetchData();
      setIsAddDialogOpen(false);
    } catch (e) { alert(e.message); }
    setIsSaving(false);
  };

  // --- حفظ التعديلات ---
  const handleSaveEdit = async () => {
    if (!editingSale) return;
    setIsSaving(true);
    try {
      const newQty = parseInt(formData.quantity);
      const diff = newQty - editingSale.quantity;
      const item = inventoryList.find(i => i.id === editingSale.item_id);

      if (item && item.quantity < diff) throw new Error("المخزن لا يكفي للتعديل المطلوب");

      // 1. تحديث العملية
      await updateSale(editingSale.id, {
        client_id: parseInt(formData.clientId),
        quantity: newQty,
        price: parseFloat(formData.price),
        total: newQty * parseFloat(formData.price),
        date: formData.date
      });

      // 2. تحديث المخزن بالفرق
      if (item) {
        await updateSparePart(item.id, { quantity: item.quantity - diff });
      }

      await fetchData();
      setIsEditDialogOpen(false);
    } catch (e) { alert(e.message); }
    setIsSaving(false);
  };

  // --- الحذف وإرجاع الكمية للمخزن ---
  const handleDelete = async (sale) => {
    if (!confirm("سيتم حذف العملية وإرجاع الكمية للمخزن. هل أنت متأكد؟")) return;
    try {
      const item = inventoryList.find(i => i.id === sale.item_id);
      if (item) {
        await updateSparePart(item.id, { quantity: item.quantity + sale.quantity });
      }
      await deleteSale(sale.id);
      await fetchData();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">المبيعات</h1>
          <p className="text-gray-500">إدارة مبيعات قطع الغيار</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-black text-white">
          <Plus className="ml-2 h-4 w-4" /> عملية بيع جديدة
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-blue-50">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-blue-600 font-bold">إجمالي مبيعات الشهر</p>
            <h2 className="text-3xl font-black text-blue-900">{formatCurrency(totalSales)}</h2>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-green-600 font-bold">عدد العمليات</p>
            <h2 className="text-3xl font-black text-green-900">{filteredSales.length}</h2>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="بحث باسم العميل أو الصنف..." 
            className="pr-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Input 
          type="month" 
          className="w-48" 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">العميل</TableHead>
              <TableHead className="text-right">الصنف</TableHead>
              <TableHead className="text-right">الكمية</TableHead>
              <TableHead className="text-right">الإجمالي</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
            ) : filteredSales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.date}</TableCell>
                <TableCell>{clientsList.find(c => c.id === sale.client_id)?.name || "---"}</TableCell>
                <TableCell className="font-bold">{sale.item_name}</TableCell>
                <TableCell>{sale.quantity}</TableCell>
                <TableCell className="text-blue-700 font-bold">{formatCurrency(sale.total)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setEditingSale(sale);
                      setFormData({
                        clientId: String(sale.client_id),
                        itemId: String(sale.item_id),
                        quantity: String(sale.quantity),
                        price: String(sale.price),
                        date: sale.date
                      });
                      setIsEditDialogOpen(true);
                    }}>
                      <Edit2 className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(sale)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Dialog Add/Edit */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(val) => {
        setIsAddDialogOpen(val && !isEditDialogOpen);
        setIsEditDialogOpen(val && isEditDialogOpen);
        if(!val) setEditingSale(null);
      }}>
        <DialogContent className="bg-white text-right">
          <DialogHeader><DialogTitle>{isEditDialogOpen ? "تعديل عملية بيع" : "بيع جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>العميل</Label>
                <Select value={formData.clientId} onValueChange={(v) => setFormData({...formData, clientId: v})}>
                  <SelectTrigger><SelectValue placeholder="اختر العميل" /></SelectTrigger>
                  <SelectContent>
                    {clientsList.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
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
              <Select 
                disabled={isEditDialogOpen} // نمنع تغيير الصنف في التعديل لضمان دقة المخزن
                value={formData.itemId} 
                onValueChange={(v) => {
                  const item = inventoryList.find(i => i.id === parseInt(v));
                  setFormData({...formData, itemId: v, price: item?.retail_price || item?.price || ""});
                }}
              >
                <SelectTrigger><SelectValue placeholder="اختر من المخزن" /></SelectTrigger>
                <SelectContent>
                  {inventoryList.map(i => <SelectItem key={i.id} value={String(i.id)}>{i.name} (متاح: {i.quantity})</SelectItem>)}
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

            <div className="p-4 bg-blue-50 rounded-lg text-center font-bold text-blue-800">
              الإجمالي: {formatCurrency(Number(formData.quantity || 0) * Number(formData.price || 0))}
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="w-full bg-black text-white" 
              onClick={isEditDialogOpen ? handleSaveEdit : handleSaveAdd}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="animate-spin" /> : "حفظ العملية"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
