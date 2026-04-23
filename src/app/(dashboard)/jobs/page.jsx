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
  DialogDescription,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getJobs, getClients, createJob, updateJob, deleteJob } from "@/lib/database";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Search, Edit2, Trash2, Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

const jobTypes = {
  installation: { label: "تركيب", color: "#93c5fd" },
  maintenance: { label: "صيانة", color: "#86efac" },
  repair: { label: "إصلاح", color: "#fde047" },
  modernization: { label: "تحديث", color: "#c4b5fd" },
};

const statusTypes = {
  in_progress: { label: "قيد التنفيذ", variant: "outline" },
  completed: { label: "مكتمل", variant: "success" },
  stopped: { label: "متوقف", variant: "destructive" },
};

const paymentTypes = {
  paid: { label: "مدفوع", variant: "success" },
  installment: { label: "قسط", variant: "warning" },
  unpaid: { label: "غير مدفوع", variant: "destructive" },
};

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobsList, setJobsList] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    type: "installation",
    client_id: "",
    description: "",
    cost: "",
    date: new Date().toISOString().split("T")[0],
    payment_status: "unpaid",
    status: "in_progress",
    payment_method: "cash"
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsRes, clientsRes] = await Promise.all([getJobs(), getClients()]);
      setJobsList(jobsRes.data || []);
      setClientsList(clientsRes.data || []);
    } catch (error) { console.error(error); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        cost: parseFloat(formData.cost || 0),
      };

      if (editingJob) {
        await updateJob(editingJob.id, payload);
      } else {
        await createJob(payload);
      }
      
      await fetchData();
      setIsDialogOpen(false);
      setEditingJob(null);
    } catch (e) { alert(e.message); }
    setIsSaving(false);
  };

  const handleDeleteItem = async (id) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await deleteJob(id);
    await fetchData();
  };

  const filteredJobs = jobsList.filter((job) => {
    const client = clientsList.find(c => c.id === job.client_id);
    const matchesSearch = (job.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">الأعمال</h1>
          <p className="text-muted-foreground">إدارة التركيبات والصيانة</p>
        </div>
        <Button onClick={() => { setEditingJob(null); setIsDialogOpen(true); }}>
          <Plus className="ml-2 h-4 w-4" /> إضافة عمل جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50"><CardContent className="p-4 text-center"><p className="text-sm">إجمالي الأعمال</p><h3 className="text-2xl font-bold">{jobsList.length}</h3></CardContent></Card>
        <Card className="bg-green-50"><CardContent className="p-4 text-center"><p className="text-sm">التحصيل</p><h3 className="text-2xl font-bold text-green-700">{formatCurrency(jobsList.filter(j => j.payment_status === 'paid').reduce((s, j) => s + j.cost, 0))}</h3></CardContent></Card>
        <Card className="bg-red-50"><CardContent className="p-4 text-center"><p className="text-sm">مستحقات</p><h3 className="text-2xl font-bold text-red-700">{formatCurrency(jobsList.filter(j => j.payment_status !== 'paid').reduce((s, j) => s + j.cost, 0))}</h3></CardContent></Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          <Input placeholder="بحث بالوصف أو اسم العميل..." className="pr-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="تصفية بالحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
            <SelectItem value="completed">مكتمل</SelectItem>
            <SelectItem value="stopped">متوقف</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">النوع</TableHead>
              <TableHead className="text-right">العميل</TableHead>
              <TableHead className="text-right">الوصف</TableHead>
              <TableHead className="text-right">التكلفة</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الدفع</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={7} className="text-center"><Loader2 className="animate-spin mx-auto"/></TableCell></TableRow> :
              filteredJobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <Badge className="text-black" style={{ backgroundColor: jobTypes[job.type]?.color }}>
                    {jobTypes[job.type]?.label}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{clientsList.find(c => c.id === job.client_id)?.name || "---"}</TableCell>
                <TableCell className="max-w-[200px] truncate">{job.description}</TableCell>
                <TableCell>{formatCurrency(job.cost)}</TableCell>
                <TableCell><Badge variant={statusTypes[job.status]?.variant}>{statusTypes[job.status]?.label}</Badge></TableCell>
                <TableCell><Badge variant={paymentTypes[job.payment_status]?.variant}>{paymentTypes[job.payment_status]?.label}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setEditingJob(job);
                      setFormData({ ...job });
                      setIsDialogOpen(true);
                    }}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(job.id)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader><DialogTitle>{editingJob ? "تعديل العمل" : "إضافة عمل جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4 text-right">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع العمل</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Select value={formData.client_id} onValueChange={(v) => setFormData({...formData, client_id: v})}>
                  <SelectTrigger><SelectValue placeholder="اختر العميل" /></SelectTrigger>
                  <SelectContent>
                    {clientsList.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>الوصف</Label>
              <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>التكلفة</Label>
                <Input type="number" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>التاريخ</Label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>حالة العمل</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="stopped">متوقف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>حالة الدفع</Label>
                <Select value={formData.payment_status} onValueChange={(v) => setFormData({...formData, payment_status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">مدفوع</SelectItem>
                    <SelectItem value="installment">قسط</SelectItem>
                    <SelectItem value="unpaid">غير مدفوع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin" /> : "حفظ البيانات"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
