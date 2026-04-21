"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Lock, User, Eye, EyeOff, AlertCircle, Shield } from "lucide-react";

// Local users database
const localUsers = [
  { id: 1, username: 'admin', password: 'admin123', name: 'المشرف', role: 'admin', email: 'sayedifbb2@gmail.com', is_active: true },
  { id: 2, username: 'sayedifbb2@gmail.com', password: 'admin123', name: 'Sayed', role: 'admin', email: 'sayedifbb2@gmail.com', is_active: true }
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeLeft, setLockTimeLeft] = useState(0);

  // Load saved credentials on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem("rememberedUsername");
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  // Handle lockout timer
  useEffect(() => {
    if (isLocked && lockTimeLeft > 0) {
      const timer = setTimeout(() => {
        setLockTimeLeft(lockTimeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isLocked && lockTimeLeft === 0) {
      setIsLocked(false);
      setAttempts(0);
    }
  }, [isLocked, lockTimeLeft]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (isLocked) return;
    
    setIsLoading(true);
    setError("");

    try {
      // Check user credentials against local users
      const user = localUsers.find(u => u.username === username && u.password === password);
      
      if (!user) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          setIsLocked(true);
          setLockTimeLeft(30);
          setError("Account locked due to multiple failed attempts. Try again after 30 seconds.");
        } else {
          setError(`Invalid username or password. ${3 - newAttempts} attempts remaining.`);
        }
        setIsLoading(false);
        return;
      }

      if (!user.is_active) {
        setError("Your account is deactivated. Please contact administrator.");
        setIsLoading(false);
        return;
      }

      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem("rememberedUsername", username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }
      
      // Save user session
      localStorage.setItem("currentUser", JSON.stringify({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }));
      
      router.push("/");

    } catch (error) {
      console.error('Login error:', error);
      setError("An error occurred during login. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
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
              {/* Error Alert */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Lockout Alert */}
              {isLocked && (
                <Alert className="border-orange-200 bg-orange-50">
                  <Shield className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-700">
                    الحساب مغلق مؤقتاً. يتبقى {lockTimeLeft} ثانية.
                  </AlertDescription>
                </Alert>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  اسم المستخدم
                </Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pr-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="أدخل اسم المستخدم"
                    autoComplete="username"
                    disabled={isLocked}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="أدخل كلمة المرور"
                    autoComplete="current-password"
                    disabled={isLocked}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLocked}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                  disabled={isLocked}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  تذكر بيانات الدخول
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isLocked}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                    جاري تسجيل الدخول...
                  </div>
                ) : isLocked ? (
                  "الحساب مغلق مؤقتاً"
                ) : (
                  "تسجيل الدخول"
                )}
              </Button>
            </form>

            {/* Default Credentials */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2 space-x-reverse">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-2">بيانات الدخول الافتراضية:</p>
                  <div className="space-y-1 text-blue-700">
                    <p><span className="font-medium">اسم المستخدم:</span> admin</p>
                    <p><span className="font-medium">كلمة المرور:</span> admin123</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-4 text-center text-xs text-gray-500">
              <p>اتصل بالدعم الفني إذا واجهت أي مشاكل</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
