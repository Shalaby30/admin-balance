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
import { getClients, createClient, updateClient } from "@/lib/database"; // تأكد من وجود createClient و updateClient
import { formatDate } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit2, Trash2, Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clientsList, setClientsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [clientForm, setClientForm] = useState({ 
    name: "", 
    phone: "", 
    email: "", 
    address: "",
    buildingName: "", // ملاحظة: هذا يحتاج ربط بجدول buildings مستقبلاً
    buildingType: "سكني"
  });

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const { data, error } = await getClients();
      if (error) throw error;
      setClientsList(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredClients = clientsList.filter(
    (client) =>
      (client.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (client.phone || "").includes(searchTerm)
  );

  const handleAddClient = () => {
    setEditingClient(null);
    setClientForm({ name: "", phone: "", email: "", address: "", buildingName: "", buildingType: "سكني" });
    setIsAddClientOpen(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setClientForm({ 
      name: client.name || "", 
      phone: client.phone || "", 
      email: client.email || "", 
      address: client.address || "",
      buildingName: client.buildingName || "",
      buildingType: client.buildingType || "سكني"
    });
    setIsAddClientOpen(true);
  };

  const handleSaveClient = async () => {
    if (!clientForm.name) return alert("يرجى إدخال اسم العميل");
    
    setIsSaving(true);
    try {
      if (editingClient) {
        // تحديث عميل موجود
        const { error } = await updateClient(editingClient.id, {
          name: clientForm.name,
          phone: clientForm.phone,
          email: clientForm.email,
          address: clientForm.address,
          // building_info: clientForm.buildingName // إذا أردت حفظ اسم المبنى مؤقتاً
        });
        if (error) throw error;
      } else {
        // إضافة عميل جديد
        const { error } = await createClient({
          name: clientForm.name,
          phone: clientForm.phone,
          email: clientForm.email,
          address: clientForm.address,
          is_active: true
        });
        if (error) throw error;
      }
      
      await fetchData(); // تحديث القائمة
      setIsAddClientOpen(false);
    } catch (error) {
      alert("حدث خطأ أثناء الحفظ: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (clientId) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
      try {
        const { error } = await updateClient(clientId, { is_active: false });
        if (error) throw error;
        setClientsList(prev => prev.filter(c => c.id !== clientId));
      } catch (error) {
        alert("خطأ في الحذف: " + error.message);
      }
    }
  };

  const exportToExcel = () => {
    const data = [
      ["قائمة العملاء"],
      ["تاريخ التصدير:", new Date().toLocaleDateString("ar-EG")],
      [],
      ["اسم العميل", "رقم التليفون", "العنوان", "البريد الإلكتروني"],
      ...clientsList.map((client) => [
        client.name,
        client.phone,
        client.address,
        client.email
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "العملاء");
    XLSX.writeFile(wb, "العملاء.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">العملاء والمباني</h1>
          <p className="text-gray-500 mt-1">إدارة بيانات العملاء والمباني</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="w-4 h-4 ml-2" />
            تصدير Excel
          </Button>
          <Button onClick={handleAddClient}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة عميل
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">إجمالي العملاء المسجلين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : clientsList.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="بحث عن عميل برقم الهاتف أو الاسم..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">جاري تحميل البيانات...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم العميل</TableHead>
                  <TableHead>رقم التليفون</TableHead>
                  <TableHead>العنوان</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.phone || "---"}</TableCell>
                      <TableCell>{client.address || "---"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClient(client)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)} className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">لا يوجد عملاء مطابقين للبحث</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingClient ? "تعديل بيانات العميل" : "إضافة عميل جديد"}</DialogTitle>
            <DialogDescription>أدخل بيانات التواصل الخاصة بالعميل</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>اسم العميل</Label>
              <Input value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input value={clientForm.phone} onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>العنوان</Label>
              <Input value={clientForm.address} onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>البريد الإلكتروني (اختياري)</Label>
              <Input value={clientForm.email} onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
            <Button onClick={handleSaveClient} disabled={isSaving}>
              {isSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {editingClient ? "تحديث" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
