// will be working from next update
import { Settings, User, Shield, Palette, Globe } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { GlassCard } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTheme } from '@/hooks/use-theme'

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div>
      <PageHeader title="الإعدادات" description="تخصيص وإدارة حسابك والنظام" icon={Settings} />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="profile"><User className="h-4 w-4 ml-2" />الملف الشخصي</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="h-4 w-4 ml-2" />المظهر</TabsTrigger>
          <TabsTrigger value="security"><Shield className="h-4 w-4 ml-2" />الأمان</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <GlassCard>
            <div className="flex items-center gap-6 mb-8">
              <Avatar className="h-20 w-20">
                <AvatarImage src="https://i.pravatar.cc/150?img=8" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">عبدالله محمد</h3>
                <p className="text-sm text-muted-foreground">مدير عام · abdullah@awael-elevators.com</p>
                <Button variant="outline" size="sm" className="mt-2">تغيير الصورة</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">الاسم الكامل</label>
                <Input defaultValue="عبدالله محمد العتيبي" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">البريد الإلكتروني</label>
                <Input defaultValue="abdullah@awael-elevators.com" dir="ltr" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">رقم الهاتف</label>
                <Input defaultValue="0501234567" dir="ltr" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">المسمى الوظيفي</label>
                <Input defaultValue="مدير عام" />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button>حفظ التغييرات</Button>
            </div>
          </GlassCard>
        </TabsContent>


        <TabsContent value="appearance">
          <GlassCard>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">الوضع الداكن</p>
                  <p className="text-xs text-muted-foreground">تبديل بين الوضع الداكن والفاتح</p>
                </div>
                <Switch checked={theme === 'dark'} onCheckedChange={() => toggleTheme()} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">اللغة</p>
                  <p className="text-xs text-muted-foreground">لغة واجهة النظام</p>
                </div>
                <Button variant="outline" size="sm"><Globe className="h-4 w-4 ml-2" />العربية</Button>
              </div>
              <Separator />
              <div>
                <p className="font-medium text-sm mb-3">لون التمييز</p>
                <div className="flex gap-3">
                  {['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-orange-500', 'bg-rose-500'].map((color, i) => (
                    <button
                      key={color}
                      className={`h-8 w-8 rounded-full ${color} ${i === 0 ? 'ring-2 ring-offset-2 ring-primary' : ''} transition-transform hover:scale-110`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="security">
          <GlassCard>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">كلمة المرور الحالية</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">كلمة المرور الجديدة</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">تأكيد كلمة المرور</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="flex justify-end pt-4">
                <Button>تحديث كلمة المرور</Button>
              </div>
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
