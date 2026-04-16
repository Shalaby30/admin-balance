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
// mockData no longer used - using local state instead
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Search, Edit2, Trash2, Download, Filter } from "lucide-react";
import * as XLSX from "xlsx";

const jobTypes = {
  installation: { label: "تركيب", color: "blue" },
  maintenance: { label: "صيانة", color: "green" },
  repair: { label: "إصلاح", color: "yellow" },
  modernization: { label: "تحديث", color: "purple" },
};

const statusTypes = {
  in_progress: { label: "قيد التنفيذ", variant: "default" },
  completed: { label: "مكتمل", variant: "success" },
  stopped: { label: "متوقف", variant: "danger" },
};

const paymentTypes = {
  paid: { label: "مدفوع", variant: "success" },
  installment: { label: "قسط", variant: "warning" },
  unpaid: { label: "غير مدفوع", variant: "danger" },
};

// Initial jobs data
const initialJobs = [
  { id: 1, type: "installation", clientId: 1, buildingId: 1, description: "تركيب 3 مصاعد للعميل", cost: 85000, date: "2024-01-15", paymentMethod: "cash", paymentStatus: "paid", status: "completed", assignedEmployees: [1, 2] },
  { id: 2, type: "maintenance", clientId: 2, buildingId: 2, description: "صيانة دورية للمصاعد", cost: 5000, date: "2024-01-20", paymentMethod: "installment", paymentStatus: "installment", status: "in_progress", assignedEmployees: [2] },
  { id: 3, type: "repair", clientId: 3, buildingId: 3, description: "إصلاح عطل مفاجئ", cost: 12000, date: "2024-01-25", paymentMethod: "cash", paymentStatus: "unpaid", status: "in_progress", assignedEmployees: [3] },
];

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobsList, setJobsList] = useState(initialJobs);
  const [clientsList] = useState([
    { id: 1, name: "شركة النيل للتجارة" },
    { id: 2, name: "فندق الأهرام" },
    { id: 3, name: "مستشفى الشفاء" },
    { id: 4, name: "مجمع السلام" },
  ]);
  const [formData, setFormData] = useState({
    type: "installation",
    clientId: "",
    buildingId: "",
    description: "",
    cost: "",
    date: "",
    assignedEmployees: [],
    paymentMethod: "cash",
    paymentStatus: "unpaid",
    status: "in_progress",
  });

  const filteredJobs = jobsList.filter((job) => {
    const client = clientsList.find((c) => c.id === job.clientId);
    const matchesSearch =
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesType = typeFilter === "all" || job.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalRevenue = jobsList.reduce((sum, job) => sum + job.cost, 0);
  const totalPaid = jobsList
    .filter((j) => j.paymentStatus === "paid")
    .reduce((sum, j) => sum + j.cost, 0);
  const totalUnpaid = jobsList
    .filter((j) => j.paymentStatus === "unpaid" || j.paymentStatus === "installment")
    .reduce((sum, j) => sum + j.cost, 0);

  const handleAdd = () => {
    setEditingJob(null);
    setFormData({
      type: "installation",
      clientId: "",
      buildingId: "",
      description: "",
      cost: "",
      date: new Date().toISOString().split("T")[0],
      assignedEmployees: [],
      paymentMethod: "cash",
      paymentStatus: "unpaid",
      status: "in_progress",
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      type: job.type,
      clientId: job.clientId.toString(),
      buildingId: job.buildingId.toString(),
      description: job.description,
      cost: job.cost.toString(),
      date: job.date,
      assignedEmployees: job.assignedEmployees,
      paymentMethod: job.paymentMethod || "cash",
      paymentStatus: job.paymentStatus || "unpaid",
      status: job.status || "in_progress",
    });
    setIsAddDialogOpen(true);
  };

  const handleSave = () => {
    if (editingJob) {
      setJobsList(prev => prev.map(job => 
        job.id === editingJob.id 
          ? {
              ...job,
              type: formData.type,
              clientId: Number(formData.clientId),
              buildingId: Number(formData.buildingId) || 1,
              description: formData.description,
              cost: Number(formData.cost),
              date: formData.date,
              paymentMethod: formData.paymentMethod,
              paymentStatus: formData.paymentStatus,
              status: formData.status,
            }
          : job
      ));
    } else {
      const newId = Math.max(...jobsList.map(j => j.id), 0) + 1;
      setJobsList(prev => [...prev, {
        id: newId,
        type: formData.type,
        clientId: Number(formData.clientId),
        buildingId: Number(formData.buildingId) || 1,
        description: formData.description,
        cost: Number(formData.cost),
        date: formData.date,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        status: formData.status,
        assignedEmployees: [],
      }]);
    }
    setIsAddDialogOpen(false);
  };

  const handleDelete = (jobId) => {
    if (confirm("هل أنت متأكد من حذف هذا العمل؟")) {
      setJobsList(prev => prev.filter(job => job.id !== jobId));
    }
  };

  const exportToExcel = () => {
    const title = "قائمة الأعمال";
    const exportDate = new Date().toLocaleDateString("ar-EG");

    // Calculate totals
    const totalCost = jobsList.reduce((sum, job) => sum + job.cost, 0);
    const totalPaid = jobsList
      .filter((j) => j.paymentStatus === "paid")
      .reduce((sum, j) => sum + j.cost, 0);
    const totalUnpaid = jobsList
      .filter((j) => j.paymentStatus === "unpaid" || j.paymentStatus === "installment")
      .reduce((sum, j) => sum + j.cost, 0);

    // Build data with title, headers, data rows, and total row
    const data = [
      [title], // Title row
      ["تاريخ التصدير:", exportDate], // Date row
      [], // Empty row
      ["النوع", "العميل", "الوصف", "التكلفة", "التاريخ", "الحالة", "الدفع"], // Headers
      ...jobsList.map((job) => {
        const client = clientsList.find((c) => c.id === job.clientId);
        return [
          jobTypes[job.type].label,
          client?.name,
          job.description,
          job.cost,
          formatDate(job.date),
          statusTypes[job.status].label,
          paymentTypes[job.paymentStatus]?.label || job.paymentStatus,
        ];
      }),
      [], // Empty row before total
      ["الإجماليات", "", "", totalCost, "", "", ""], // Total cost row
      ["", "", "المدفوع:", totalPaid, "", "", ""], // Paid row
      ["", "", "المستحق:", totalUnpaid, "", "", ""], // Unpaid row
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    // Make title bold and larger
    ws["A1"].s = { font: { bold: true, sz: 14 } };
    // Make total rows bold
    const totalRowIndex = data.length - 2;
    ws["A" + totalRowIndex].s = { font: { bold: true } };
    ws["D" + totalRowIndex].s = { font: { bold: true } };
    ws["C" + (totalRowIndex + 1)].s = { font: { bold: true, color: { rgb: "00AA00" } } };
    ws["D" + (totalRowIndex + 1)].s = { font: { bold: true, color: { rgb: "00AA00" } } };
    ws["C" + (totalRowIndex + 2)].s = { font: { bold: true, color: { rgb: "AA0000" } } };
    ws["D" + (totalRowIndex + 2)].s = { font: { bold: true, color: { rgb: "AA0000" } } };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الأعمال");
    XLSX.writeFile(wb, "الأعمال.xlsx");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">الأعمال</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">تتبع وإدارة أعمال التركيب والصيانة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="w-4 h-4 ml-2" />
            تصدير Excel
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة عمل
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">إجمالي الأعمال</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobsList.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">إجمالي الإيرادات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">المدفوع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">المستحق</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalUnpaid)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="بحث عن عمل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="all">جميع الحالات</option>
              <option value="in_progress">قيد التنفيذ</option>
              <option value="completed">مكتمل</option>
              <option value="stopped">متوقف</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="all">جميع الأنواع</option>
              <option value="installation">تركيب</option>
              <option value="maintenance">صيانة</option>
              <option value="repair">إصلاح</option>
              <option value="modernization">تحديث</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>النوع</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>التكلفة</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الدفع</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => {
                const client = clientsList.find((c) => c.id === job.clientId);
                return (
                  <TableRow key={job.id}>
                    <TableCell>
                      <Badge style={{ backgroundColor: jobTypes[job.type]?.color }}>
                        {jobTypes[job.type]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{client?.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{job.description}</TableCell>
                    <TableCell>{formatCurrency(job.cost)}</TableCell>
                    <TableCell>{formatDate(job.date)}</TableCell>
                    <TableCell>
                      <Badge variant={statusTypes[job.status]?.variant}>
                        {statusTypes[job.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={paymentTypes[job.paymentStatus]?.variant || "default"}>
                        {paymentTypes[job.paymentStatus]?.label || job.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(job)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(job.id)} className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingJob ? "تعديل عمل" : "إضافة عمل جديد"}</DialogTitle>
            <DialogDescription>
              {editingJob ? "تعديل بيانات العمل" : "إضافة عمل جديد للنظام"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع العمل</Label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="installation">تركيب</option>
                  <option value="maintenance">صيانة</option>
                  <option value="repair">إصلاح</option>
                  <option value="modernization">تحديث</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>العميل</Label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="">اختر العميل</option>
                  {clientsList.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>الوصف</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>التكلفة</Label>
                <Input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>التاريخ</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>طريقة الدفع</Label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="cash">كاش</option>
                  <option value="installment">تقسيط</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>حالة الدفع</Label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="paid">مدفوع</option>
                  <option value="installment">قسط</option>
                  <option value="unpaid">غير مدفوع</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>حالة العمل</Label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="in_progress">قيد التنفيذ</option>
                  <option value="completed">مكتمل</option>
                  <option value="stopped">متوقف</option>
                </select>
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
