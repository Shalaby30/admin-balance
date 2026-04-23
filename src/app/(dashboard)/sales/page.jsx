"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit2, Trash2, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
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
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    clientName: "",
    itemId: "",
    quantity: "",
    price: "",
    date: new Date().toISOString().split("T")[0],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sparePartsRes, salesRes] = await Promise.all([getSpareParts(), getSales()]);
      setInventoryList(sparePartsRes.data || []);
      setSalesList(salesRes.data || []);
    } catch (error) { console.error(error); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredSales = salesList.filter((sale) => {
    const matchesSearch = (sale.item_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (sale.client_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = sale.date?.startsWith(selectedMonth);
    return matchesSearch && matchesMonth;
  });

  const handleSaveAdd = async () => {
    const item = inventoryList.find(i => i.id === formData.itemId);
    if (!item || !formData.quantity) return;

    const sellQty = parseInt(formData.quantity);
    if (sellQty > item.quantity) return alert("الكمية في المخزن لا تكفي!");

    setIsSaving(true);
    try {
      const totalAmount = sellQty * parseFloat(formData.price);
      await createSale({
        client_name: formData.clientName || "زبون نقدي",
        item_id: item.id,
        item_name: item.name,
        quantity: sellQty,
        price: parseFloat(formData.price),
        total: totalAmount,
        date: formData.date
      });
      await updateSparePart(item.id, { quantity: item.quantity - sellQty });
      await fetchData();
      setIsAddDialogOpen(false);
      resetForm();
    } catch (e) { alert(e.message); }
    setIsSaving(false);
  };

  const handleSaveEdit = async () => {
    if (!editingSale) return;
    setIsSaving(true);
    try {
      const newQty = parseInt(formData.quantity);
      const diff = newQty - editingSale.quantity;
      const item = inventoryList.find(i => i.id === editingSale.item_id);

      if (item && item.quantity < diff) throw new Error("المخزن لا يكفي للتعديل");

      await updateSale(editingSale.id, {
        client_name: formData.clientName,
        quantity: newQty,
        price: parseFloat(formData.price),
        total: newQty * parseFloat(formData.price),
        date: formData.date
      });

      if (item) await updateSparePart(item.id, { quantity: item.quantity - diff });

      await fetchData();
      setIsEditDialogOpen(false);
    } catch (e) { alert(e.message); }
    setIsSaving(false);
  };

  const handleDelete = async (sale) => {
    if (!confirm("حذف العملية وإرجاع الكمية للمخزن؟")) return;
    try {
      const item = inventoryList.find(i => i.id === sale.item_id);
      if (item) await updateSparePart(item.id, { quantity: item.quantity + sale.quantity });
      await deleteSale(sale.id);
      await fetchData();
    } catch (e) { alert(e.message); }
  };

  const resetForm = () => {
    setFormData({ clientName: "", itemId: "", quantity: "", price: "", date: new Date().toISOString().split("T")[0] });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">حركة المبيعات</h1>
        <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
          <Plus className="ml-2 h-4 w-4" /> بيع جديد
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          <Input placeholder="بحث باسم العميل أو الصنف..." className="pr-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <Input type="month" className="w-48" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
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
            {loading ? <TableRow><TableCell colSpan={6} className="text-center"><Loader2 className="animate-spin mx-auto"/></TableCell></TableRow> : 
              filteredSales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.date}</TableCell>
                <TableCell>{sale.client_name}</TableCell>
                <TableCell className="font-bold">{sale.item_name}</TableCell>
                <TableCell>{sale.quantity}</TableCell>
                <TableCell>{sale.total} ج.م</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setEditingSale(sale);
                      setFormData({ clientName: sale.client_name, itemId: sale.item_id, quantity: String(sale.quantity), price: String(sale.price), date: sale.date });
                      setIsEditDialogOpen(true);
                    }}><Edit2 className="h-4 w-4 text-blue-500" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(sale)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(v) => { if(!v) { setIsAddDialogOpen(false); setIsEditDialogOpen(false); } }}>
        <DialogContent className="bg-white text-right">
          <DialogHeader><DialogTitle>{isEditDialogOpen ? "تعديل عملية بيع" : "تسجيل بيع جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>اسم العميل</Label>
                <Input placeholder="اختياري: اسم العميل" value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>التاريخ</Label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>اختر الصنف من المخزن</Label>
              <Select disabled={isEditDialogOpen} value={formData.itemId} onValueChange={(v) => {
                const item = inventoryList.find(i => i.id === v);
                setFormData({...formData, itemId: v, price: item?.retail_price || ""});
              }}>
                <SelectTrigger><SelectValue placeholder="ابحث عن قطعة غيار" /></SelectTrigger>
                <SelectContent>
                  {inventoryList.map(i => <SelectItem key={i.id} value={i.id}>{i.name} (متاح: {i.quantity})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الكمية</Label>
                <Input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>السعر</Label>
                <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={isEditDialogOpen ? handleSaveEdit : handleSaveAdd} disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin" /> : "إتمام العملية"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
