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
import { formatDate } from "@/lib/utils";
import { Plus, Search, Edit2, Trash2, Download } from "lucide-react";
import * as XLSX from "xlsx";

// Initial clients data with building info included
const initialClients = [
  { id: 1, name: "شركة النيل للتجارة", phone: "01012345678", email: "nile@example.com", address: "شارع التحرير، القاهرة", buildingName: "برج النيل", buildingType: "تجاري" },
  { id: 2, name: "فندق الأهرام", phone: "01023456789", email: "pyramids@example.com", address: "الجيزة", buildingName: "فندق الأهرام", buildingType: "فندق" },
  { id: 3, name: "مستشفى الشفاء", phone: "01034567890", email: "shifa@example.com", address: "مدينة نصر، القاهرة", buildingName: "مستشفى الشفاء", buildingType: "طبي" },
  { id: 4, name: "مجمع السلام", phone: "01045678901", email: "salam@example.com", address: "الإسكندرية", buildingName: "برج السلام", buildingType: "سكني" },
];

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clientsList, setClientsList] = useState(initialClients);
  const [clientForm, setClientForm] = useState({ 
    name: "", 
    phone: "", 
    email: "", 
    address: "",
    buildingName: "",
    buildingType: "سكني"
  });

  const filteredClients = clientsList.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.buildingName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalClients = clientsList.length;

  const handleAddClient = () => {
    setEditingClient(null);
    setClientForm({ name: "", phone: "", email: "", address: "", buildingName: "", buildingType: "سكني" });
    setIsAddClientOpen(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setClientForm({ 
      name: client.name, 
      phone: client.phone, 
      email: client.email, 
      address: client.address,
      buildingName: client.buildingName,
      buildingType: client.buildingType
    });
    setIsAddClientOpen(true);
  };

  const handleSaveClient = () => {
    if (editingClient) {
      setClientsList(prev => prev.map(c => 
        c.id === editingClient.id 
          ? { ...c, ...clientForm }
          : c
      ));
    } else {
      const newId = Math.max(...clientsList.map(c => c.id), 0) + 1;
      setClientsList(prev => [...prev, { id: newId, ...clientForm }]);
    }
    setIsAddClientOpen(false);
  };

  const handleDelete = (clientId) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
      setClientsList(prev => prev.filter(c => c.id !== clientId));
    }
  };

  const exportToExcel = () => {
    const title = "قائمة العملاء";
    const exportDate = new Date().toLocaleDateString("ar-EG");

    // Build data with title, headers, data rows, and total row
    const data = [
      [title], // Title row
      ["تاريخ التصدير:", exportDate], // Date row
      [], // Empty row
      ["اسم العميل", "اسم المبنى", "رقم التليفون", "العنوان", "نوع المبنى"], // Headers
      ...clientsList.map((client) => [
        client.name,
        client.buildingName,
        client.phone,
        client.address,
        client.buildingType,
      ]),
      [], // Empty row before total
      ["إجمالي عدد العملاء:", clientsList.length, "", "", ""], // Total row
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    // Make title bold and larger
    ws["A1"].s = { font: { bold: true, sz: 14 } };
    // Make total row bold
    ws["A" + (data.length)].s = { font: { bold: true } };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "العملاء");
    XLSX.writeFile(wb, "العملاء.xlsx");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">العملاء والمباني</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">إدارة بيانات العملاء والمباني والمصاعد</p>
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

      {/* Summary Card */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">إجمالي العملاء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="بحث عن عميل أو مبنى..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم العميل</TableHead>
                <TableHead>اسم المبنى</TableHead>
                <TableHead>رقم التليفون</TableHead>
                <TableHead>العنوان</TableHead>
                <TableHead>نوع المبنى</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.buildingName}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.address}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{client.buildingType}</Badge>
                  </TableCell>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>


      {/* Add/Edit Client Dialog */}
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingClient ? "تعديل بيانات العميل" : "إضافة عميل جديد"}</DialogTitle>
            <DialogDescription>
              {editingClient ? "تعديل بيانات العميل والمبنى" : "إضافة عميل جديد مع بيانات المبنى"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>اسم العميل</Label>
              <Input value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>اسم المبنى / البرج</Label>
              <Input value={clientForm.buildingName} onChange={(e) => setClientForm({ ...clientForm, buildingName: e.target.value })} />
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
              <Label>نوع المبنى</Label>
              <select
                value={clientForm.buildingType}
                onChange={(e) => setClientForm({ ...clientForm, buildingType: e.target.value })}
                className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="سكني">سكني</option>
                <option value="تجاري">تجاري</option>
                <option value="طبي">طبي</option>
                <option value="فندقي">فندقي</option>
                <option value="تعليمي">تعليمي</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
            <Button onClick={handleSaveClient}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
