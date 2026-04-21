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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getJobs, getClients } from "@/lib/database";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Search, Edit2, Trash2, Download, Filter } from "lucide-react";
import * as XLSX from "xlsx";

const jobTypes = {
  installation: { label: "تركيب", color: "#93c5fd" },  // blue-300
  maintenance: { label: "صيانة", color: "#86efac" },  // green-300
  repair: { label: "إصلاح", color: "#fde047" },         // yellow-300
  modernization: { label: "تحديث", color: "#c4b5fd" },   // purple-300
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
];

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobsList, setJobsList] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [jobsResult, clientsResult] = await Promise.all([
          getJobs(),
          getClients()
        ]);
        
        setJobsList(jobsResult.data || []);
        setClientsList(clientsResult.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const [formData, setFormData] = useState({
    type: "installation",
    clientId: "none",
    buildingId: "none",
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
      clientId: "none",
      buildingId: "none",
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
              clientId: formData.clientId === "none" ? 0 : Number(formData.clientId),
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
          <h1 className="text-3xl font-bold text-gray-900">الأعمال</h1>
          <p className="text-gray-500 mt-1">تتبع وإدارة أعمال التركيب والصيانة</p>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="stopped">متوقف</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="جميع الأنواع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="installation">تركيب</SelectItem>
                <SelectItem value="maintenance">صيانة</SelectItem>
                <SelectItem value="repair">إصلاح</SelectItem>
                <SelectItem value="modernization">تحديث</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardContent className="p-0">
          <Table className="border-black">
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
                      <Badge className="text-black" style={{ backgroundColor: jobTypes[job.type]?.color }}>
                        {jobTypes[job.type]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{client?.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{job.description}</TableCell>
                    <TableCell>{formatCurrency(job.cost)}</TableCell>
                    <TableCell>{formatDate(job.date)}</TableCell>
                    <TableCell>
                      <Badge className="text-black" variant={statusTypes[job.status]?.variant}>
                        {statusTypes[job.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="text-black" variant={paymentTypes[job.paymentStatus]?.variant || "default"}>
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
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="installation">تركيب</SelectItem>
                    <SelectItem value="maintenance">صيانة</SelectItem>
                    <SelectItem value="repair">إصلاح</SelectItem>
                    <SelectItem value="modernization">تحديث</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>العميل</Label>
                <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                  <SelectTrigger className="w-full">
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
                <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">كاش</SelectItem>
                    <SelectItem value="installment">تقسيط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>حالة الدفع</Label>
                <Select value={formData.paymentStatus} onValueChange={(value) => setFormData({ ...formData, paymentStatus: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">مدفوع</SelectItem>
                    <SelectItem value="installment">قسط</SelectItem>
                    <SelectItem value="unpaid">غير مدفوع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>حالة العمل</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="stopped">متوقف</SelectItem>
                  </SelectContent>
                </Select>
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
