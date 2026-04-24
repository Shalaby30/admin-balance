"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Lock, User, Eye, EyeOff, AlertCircle, Shield } from "lucide-react";
// استيراد السوبا بيس
import { supabase } from "@/lib/supabase"; 

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(""); // غيرنا username لـ email
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // دالة الدخول الفعلية باستخدام Supabase
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // عملية تسجيل الدخول الحقيقية
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) {
        // لو البيانات غلط أو الايميل مش موجود
        setError("خطأ في البريد الإلكتروني أو كلمة المرور");
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // حفظ الجلسة محلياً (إضافي للـ Auth)
        localStorage.setItem("currentUser", JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          role: 'admin' // أو حسب ما تحب تحدده
        }));

        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        }

        router.push("/");
        router.refresh(); // لتحديث حالة الـ Layout
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("حدث خطأ غير متوقع، حاول مرة أخرى");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">LIFT MASTER</h1>
          <p className="text-gray-600 mt-2">نظام إدارة المصاعد المتقدم</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">البريد الإلكتروني</Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-right"
                    placeholder="example@mail.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-right"
                    placeholder="********"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={setRememberMe} />
                <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">تذكر بيانات الدخول</Label>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? "جاري التحقق..." : "تسجيل الدخول"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
