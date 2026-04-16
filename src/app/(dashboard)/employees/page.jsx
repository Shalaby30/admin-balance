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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200">الموظفين والرواتب</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">إدارة بيانات الموظفين وحساب الرواتب</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel} className="border-slate-200 dark:border-slate-700">
            <Download className="w-4 h-4 ml-2" />
            تصدير Excel
          </Button>
          <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 ml-2" />
            إضافة موظف
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">إجمالي الرواتب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalSalaries)}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">للشهر المحدد</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">الرواتب الأساسية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalBase)}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">{employeesList.length} موظف</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">المكافآت</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">+{formatCurrency(totalBonuses)}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">إجمالي المكافآت</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">الخصومات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">-{formatCurrency(totalDeductions)}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">إجمالي الخصومات</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="بحث عن موظف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 border-slate-200 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <Input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-40 border-slate-200 dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      {/* Employees Table */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">الاسم</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">الدور الوظيفي</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">الراتب الأساسي</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">المكافآت</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">الخصومات</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">الراتب النهائي</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <TableCell className="font-semibold text-slate-900 dark:text-white">{employee.name}</TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">{employee.role}</TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">{formatCurrency(employee.baseSalary)}</TableCell>
                    <TableCell>
                      {employee.bonuses > 0 && (
                        <Badge variant="success" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">+{formatCurrency(employee.bonuses)}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {employee.deductions > 0 && (
                        <Badge variant="danger" className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs">-{formatCurrency(employee.deductions)}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900 dark:text-white">{formatCurrency(employee.finalSalary)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openAdjustmentDialog(employee, "bonus")} title="إضافة مكافأة" className="hover:bg-green-100 dark:hover:bg-green-900/20">
                          <Gift className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openAdjustmentDialog(employee, "deduction")} title="إضافة خصم" className="hover:bg-red-100 dark:hover:bg-red-900/20">
                          <MinusCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(employee)} className="hover:bg-blue-100 dark:hover:bg-blue-900/20">
                          <Edit2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(employee.id)} className="hover:bg-red-100 dark:hover:bg-red-900/20">
                          <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
              <select
                value={adjustmentForm.type}
                onChange={(e) => setAdjustmentForm({ ...adjustmentForm, type: e.target.value })}
                className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="bonus">مكافأة</option>
                <option value="deduction">خصم</option>
              </select>
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
              <Input
                type="month"
                value={selectedMonth}
                disabled
                className="bg-gray-100 dark:bg-gray-800"
              />
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
