"use client";

import { useState } from "react";
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
import { getEmployeeSalaries, salaryAdjustments } from "@/lib/mockData";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Edit2, Trash2, Download, Gift, MinusCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Initial employees data
const initialEmployees = [
  { id: 1, name: "أحمد محمد", role: "فني تركيب", baseSalary: 4500, phone: "01012345678", joinDate: "2022-01-15" },
  { id: 2, name: "خالد العلي", role: "فني صيانة", baseSalary: 4800, phone: "01023456789", joinDate: "2022-03-20" },
  { id: 3, name: "محمد حسن", role: "مهندس", baseSalary: 8500, phone: "01034567890", joinDate: "2021-06-10" },
  { id: 4, name: "عبدالله سعيد", role: "فني تركيب", baseSalary: 4200, phone: "01045678901", joinDate: "2023-01-05" },
  { id: 5, name: "فهد الزهراني", role: "مشرف", baseSalary: 6500, phone: "01056789012", joinDate: "2021-11-15" },
  { id: 6, name: "سلطان الغامدي", role: "فني صيانة", baseSalary: 4600, phone: "01067890123", joinDate: "2022-08-12" },
];

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("2024-01");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeesList, setEmployeesList] = useState(initialEmployees);
  // Local adjustments storage
  const [localAdjustments, setLocalAdjustments] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    baseSalary: "",
    phone: "",
  });

  // Adjustment (bonus/deduction) dialog state
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [adjustmentForm, setAdjustmentForm] = useState({
    type: "bonus",
    amount: "",
    reason: "",
  });

  // Calculate salaries with local employees and adjustments
  const employeeSalaries = employeesList.map(emp => {
    // Get adjustments for this employee and month
    const empAdjustments = localAdjustments.filter(
      adj => adj.employeeId === emp.id && adj.month === selectedMonth
    );
    const bonuses = empAdjustments
      .filter(adj => adj.type === "bonus")
      .reduce((sum, adj) => sum + Number(adj.amount), 0);
    const deductions = empAdjustments
      .filter(adj => adj.type === "deduction")
      .reduce((sum, adj) => sum + Number(adj.amount), 0);
    
    return {
      ...emp,
      bonuses,
      deductions,
      finalSalary: emp.baseSalary + bonuses - deductions
    };
  });
  
  const filteredEmployees = employeeSalaries.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSalaries = employeeSalaries.reduce((sum, emp) => sum + emp.finalSalary, 0);
  const totalBase = employeeSalaries.reduce((sum, emp) => sum + emp.baseSalary, 0);
  const totalBonuses = employeeSalaries.reduce((sum, emp) => sum + emp.bonuses, 0);
  const totalDeductions = employeeSalaries.reduce((sum, emp) => sum + emp.deductions, 0);

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
      baseSalary: employee.baseSalary.toString(),
      phone: employee.phone,
    });
    setIsAddDialogOpen(true);
  };

  const handleSave = () => {
    if (editingEmployee) {
      // Edit existing employee
      setEmployeesList(prev => prev.map(emp => 
        emp.id === editingEmployee.id 
          ? { 
              ...emp, 
              name: formData.name, 
              role: formData.role, 
              baseSalary: Number(formData.baseSalary), 
              phone: formData.phone 
            }
          : emp
      ));
    } else {
      // Add new employee
      const newId = Math.max(...employeesList.map(e => e.id), 0) + 1;
      setEmployeesList(prev => [...prev, {
        id: newId,
        name: formData.name,
        role: formData.role,
        baseSalary: Number(formData.baseSalary),
        phone: formData.phone,
        joinDate: new Date().toISOString().split("T")[0]
      }]);
    }
    setIsAddDialogOpen(false);
  };

  const openAdjustmentDialog = (employee, type) => {
    setSelectedEmployee(employee);
    setAdjustmentForm({ type, amount: "", reason: "" });
    setIsAdjustmentDialogOpen(true);
  };

  const handleSaveAdjustment = () => {
    const newAdjustment = {
      id: Date.now(),
      employeeId: selectedEmployee?.id,
      month: selectedMonth,
      ...adjustmentForm,
      amount: Number(adjustmentForm.amount),
      date: new Date().toISOString().split("T")[0],
    };
    setLocalAdjustments(prev => [...prev, newAdjustment]);
    setIsAdjustmentDialogOpen(false);
  };

  const handleDelete = (employeeId) => {
    if (confirm("هل أنت متأكد من حذف هذا الموظف؟")) {
      setEmployeesList(prev => prev.filter(emp => emp.id !== employeeId));
      // Also remove any adjustments for this employee
      setLocalAdjustments(prev => prev.filter(adj => adj.employeeId !== employeeId));
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
    const title = `رواتب ${monthName} ${year}`;

    // Calculate totals
    const totalBaseSalary = employeeSalaries.reduce((sum, emp) => sum + emp.baseSalary, 0);
    const totalBonuses = employeeSalaries.reduce((sum, emp) => sum + emp.bonuses, 0);
    const totalDeductions = employeeSalaries.reduce((sum, emp) => sum + emp.deductions, 0);
    const totalFinalSalary = employeeSalaries.reduce((sum, emp) => sum + emp.finalSalary, 0);

    // Build data with title, headers, data rows, and total row
    const data = [
      [title], // Title row
      [], // Empty row
      ["الاسم", "الدور الوظيفي", "الراتب الأساسي", "المكافآت", "الخصومات", "الراتب النهائي"], // Headers
      ...employeeSalaries.map((emp) => [
        emp.name,
        emp.role,
        emp.baseSalary,
        emp.bonuses,
        emp.deductions,
        emp.finalSalary,
      ]),
      [], // Empty row before total
      ["الإجمالي", "", totalBaseSalary, totalBonuses, totalDeductions, totalFinalSalary], // Total row
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    // Make title bold and larger
    ws["A1"].s = { font: { bold: true, sz: 14 } };
    // Make total row bold
    ws["A" + (data.length)].s = { font: { bold: true } };
    ws["C" + (data.length)].s = { font: { bold: true } };
    ws["D" + (data.length)].s = { font: { bold: true } };
    ws["E" + (data.length)].s = { font: { bold: true } };
    ws["F" + (data.length)].s = { font: { bold: true } };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الرواتب");
    XLSX.writeFile(wb, `رواتب_${selectedMonth}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الموظفين والرواتب</h1>
          <p className="text-gray-500 mt-1">إدارة بيانات الموظفين وحساب الرواتب</p>
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">إجمالي الرواتب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSalaries)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">الرواتب الأساسية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBase)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">المكافآت</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{formatCurrency(totalBonuses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">الخصومات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{formatCurrency(totalDeductions)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="بحث عن موظف..."
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

      {/* Employees Table */}
      <Card>
        <CardContent className="p-0">
          <Table className="border-black">
            <TableHeader className="border-black">
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الدور الوظيفي</TableHead>
                <TableHead>الراتب الأساسي</TableHead>
                <TableHead>المكافآت</TableHead>
                <TableHead>الخصومات</TableHead>
                <TableHead>الراتب النهائي</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>{formatCurrency(employee.baseSalary)}</TableCell>
                  <TableCell>
                    {employee.bonuses > 0 && (
                      <Badge variant="success">+{formatCurrency(employee.bonuses)}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {employee.deductions > 0 && (
                      <Badge variant="danger">-{formatCurrency(employee.deductions)}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-bold">{formatCurrency(employee.finalSalary)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openAdjustmentDialog(employee, "bonus")} title="إضافة مكافأة">
                        <Gift className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openAdjustmentDialog(employee, "deduction")} title="إضافة خصم">
                        <MinusCircle className="h-4 w-4 text-red-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(employee)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(employee.id)} className="text-red-500 hover:text-red-600">
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
            <DialogTitle>{editingEmployee ? "تعديل موظف" : "إضافة موظف جديد"}</DialogTitle>
            <DialogDescription>
              {editingEmployee ? "تعديل بيانات الموظف" : "إضافة موظف جديد للنظام"}
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
            <div className="space-y-2">
              <Label>الدور الوظيفي</Label>
              <Input
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>الراتب الأساسي</Label>
              <Input
                type="number"
                value={formData.baseSalary}
                onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
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

      {/* Adjustment (Bonus/Deduction) Dialog */}
      <Dialog open={isAdjustmentDialogOpen} onOpenChange={setIsAdjustmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {adjustmentForm.type === "bonus" ? "إضافة مكافأة" : "إضافة خصم"} - {selectedEmployee?.name}
            </DialogTitle>
            <DialogDescription>
              إضافة {adjustmentForm.type === "bonus" ? "مكافأة" : "خصم"} للموظف
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>نوع التعديل</Label>
              <Select value={adjustmentForm.type} onValueChange={(value) => setAdjustmentForm({ ...adjustmentForm, type: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bonus">مكافأة</SelectItem>
                  <SelectItem value="deduction">خصم</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>المبلغ (جنيه)</Label>
              <Input
                type="number"
                value={adjustmentForm.amount}
                onChange={(e) => setAdjustmentForm({ ...adjustmentForm, amount: e.target.value })}
                placeholder="أدخل المبلغ"
              />
            </div>
            <div className="space-y-2">
              <Label>السبب</Label>
              <Input
                value={adjustmentForm.reason}
                onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                placeholder={adjustmentForm.type === "bonus" ? "مثال: أداء متميز" : "مثال: تأخير، غياب"}
              />
            </div>
            <div className="space-y-2">
              <Label>الشهر</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-base px-3 py-1">
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {selectedMonth}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">يتم تطبيق التعديل على الشهر المحدد أعلاه</p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <Button 
              onClick={handleSaveAdjustment}
              className={adjustmentForm.type === "bonus" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {adjustmentForm.type === "bonus" ? "إضافة مكافأة" : "إضافة خصم"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
