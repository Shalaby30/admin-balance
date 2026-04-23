"use client";

import { useState, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, createEmployeeAdjustment } from "@/lib/database";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Edit2, Trash2, Download, Gift, MinusCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeesList, setEmployeesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    baseSalary: "",
    phone: "",
  });

  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [adjustmentForm, setAdjustmentForm] = useState({
    type: "bonus",
    amount: "",
    reason: "",
  });

  async function fetchData() {
    setLoading(true);
    try {
      const { data: employeesData } = await getEmployees();
      setEmployeesList(employeesData || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filteredEmployees = employeesList.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingEmployee(null);
    setFormData({ name: "", role: "", baseSalary: "", phone: "" });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      role: employee.role,
      baseSalary: employee.base_salary.toString(),
      phone: employee.phone || "",
    });
    setIsAddDialogOpen(true);
  };

  const handleSave = async () => {
    const employeeData = {
      name: formData.name,
      role: formData.role,
      base_salary: Number(formData.baseSalary),
      phone: formData.phone,
    };

    if (editingEmployee) {
      await updateEmployee(editingEmployee.id, employeeData);
    } else {
      await createEmployee({
        ...employeeData,
        is_active: true,
        join_date: new Date().toISOString().split("T")[0]
      });
    }
    setIsAddDialogOpen(false);
    fetchData();
  };

  const openAdjustmentDialog = (employee, type) => {
    setSelectedEmployee(employee);
    setAdjustmentForm({ type, amount: "", reason: "" });
    setIsAdjustmentDialogOpen(true);
  };

  const handleSaveAdjustment = async () => {
    const newAdjustment = {
      employee_id: selectedEmployee?.id,
      month: selectedMonth,
      type: adjustmentForm.type,
      amount: Number(adjustmentForm.amount),
      reason: adjustmentForm.reason,
      date: new Date().toISOString().split("T")[0],
    };
    await createEmployeeAdjustment(newAdjustment);
    setIsAdjustmentDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (employeeId) => {
    if (confirm("هل أنت متأكد من حذف هذا الموظف؟")) {
      await deleteEmployee(employeeId);
      fetchData();
    }
  };

  const exportToExcel = () => {
    const data = [
      ["الاسم", "الدور الوظيفي", "الراتب الأساسي", "الهاتف"],
      ...employeesList.map((emp) => [
        emp.name,
        emp.role,
        emp.base_salary,
        emp.phone,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الموظفين");
    XLSX.writeFile(wb, `الموظفين.xlsx`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الموظفين</h1>
          <p className="text-gray-500 mt-1">إدارة بيانات الموظفين</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="w-4 h-4 ml-2" />
            تصدير Excel
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة موظف
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="بحث عن موظف..."
              className="pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الدور الوظيفي</TableHead>
                <TableHead>الراتب الأساسي</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>{emp.role}</TableCell>
                  <TableCell>{formatCurrency(emp.base_salary)}</TableCell>
                  <TableCell>{emp.phone}</TableCell>
                  <TableCell>
                    <div className="flex justify-start gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(emp)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(emp.id)}>
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

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEmployee ? "تعديل موظف" : "إضافة موظف جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>الاسم</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>الدور الوظيفي</Label>
              <Input value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>الراتب الأساسي</Label>
              <Input type="number" value={formData.baseSalary} onChange={(e) => setFormData({...formData, baseSalary: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>الهاتف</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
