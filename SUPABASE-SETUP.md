# إعداد Supabase لنظام Lift Master

## المتطلبات
- حساب Supabase مجاني أو مدفوع
- Node.js 16 أو أحدث
- npm أو yarn

## خطوات الإعداد

### 1. إنشاء مشروع Supabase جديد
1. اذهب إلى [supabase.com](https://supabase.com)
2. سجل الدخول أو أنشئ حساب جديد
3. انقر على "New Project"
4. اختر مؤسستك (organization)
5. أدخل اسم المشروع: `lift-master`
6. اختر قاعدة بيانات PostgreSQL
7. اختر المنطقة الأقرب لعملائك
8. أنشئ كلمة مرور قوية لقاعدة البيانات
9. انقر على "Create new project"

### 2. تنفيذ كود SQL
1. من لوحة تحكم Supabase، اذهب إلى "SQL Editor"
2. انقر على "New query"
3. انسخ والصق محتوى ملف `supabase-schema.sql`
4. انقر على "Run" لتنفيذ الكود

### 3. إعداد المصادقة (Authentication)
1. اذهب إلى "Authentication" > "Settings"
2. في قسم "Site URL"، أدخل: `http://localhost:3000`
3. في قسم "Redirect URLs"، أضف: `http://localhost:3000/**`
4. احفظ التغييرات

### 4. الحصول على مفاتيح API
1. اذهب إلى "Project Settings" > "API"
2. ستحتاج إلى:
   - **Project URL** (مثل: `https://your-project.supabase.co`)
   - **anon public key** (مفتاح API العام)
   - **service_role key** (للاستخدام في الخادم فقط)

### 5. تثبيت حزم Supabase في المشروع
```bash
npm install @supabase/supabase-js
```

### 6. إعداد متغيرات البيئة
أنشئ ملف `.env.local` في جذر المشروع:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 7. إنشاء عميل Supabase
أنشئ ملف `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 8. اختبار الاتصال
أنشئ ملف اختبار `src/lib/test-connection.js`:

```javascript
import { supabase } from './supabase'

async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count')
    if (error) throw error
    console.log('✅ الاتصال بقاعدة البيانات ناجح')
    return true
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error.message)
    return false
  }
}

testConnection()
```

## هيكل الجداول الرئيسية

### المستخدمين (users)
- معلومات تسجيل الدخول والأدوار
- يدعم المصادقة والصلاحيات

### الموظفين (employees)
- بيانات الموظفين والرواتب الأساسية
- معلومات الاتصال والتوظيف

### العملاء (clients)
- بيانات العملاء ومعلومات الاتصال
- معلومات الفواتير والضرائب

### المباني (buildings)
- مباني العملاء وأنواعها
- عدد الطوابق والمصاعد

### المصاعد (elevators)
- تفاصيل كل مصعد
- حالة الصيانة والضمان

### الأعمال (jobs)
- أنواع الأعمال: تركيب، صيانة، إصلاح، تحديث
- التكاليف والحالات والمدفوعات

### المعاملات المالية (transactions)
- الإيرادات والمصروفات
- ربطها بالأعمال والعملاء

### قطع الغيار (spare_parts)
- المخزون والأسعار
- تنبيهات المخزون المنخفض

## ميزات الأمان

### Row Level Security (RLS)
- حماية البيانات على مستوى الصف
- صلاحيات دقيقة حسب دور المستخدم

### السياسات (Policies)
- المستخدمون المصادق عليهم فقط يمكنهم الوصول
- حماية البيانات الحساسة

### التشغيل الآلي (Triggers)
- تحديث تلقائي للحقول (updated_at)
- حساب تلقائي للمخزون وعدد المصاعد

## الخطوات التالية

1. **ربط التطبيق بقاعدة البيانات**
   - استبدال mockData بطلبات Supabase الحقيقية
   - إدارة الأخطاء والحالات

2. **إدارة المصادقة**
   - استخدام نظام Supabase Auth
   - تسجيل الخروج وإدارة الجلسات

3. **النسخ الاحتياطي**
   - إعداد نسخ احتياطي تلقائي
   - استعادة البيانات عند الحاجة

4. **التحسينات**
   - إضافة فهارس إضافية للأداء
   - مراقبة استخدام قاعدة البيانات

## استكشاف الأخطاء

### مشاكل شائعة
- **CORS errors**: تحقق من إعدادات Redirect URLs
- **Connection timeout**: تحقق من firewall والشبكة
- **Permission denied**: تحقق من RLS policies

### أدوات مفيدة
- Supabase Dashboard Logs
- Browser Developer Tools
- Supabase CLI للتطوير المحلي

## الدعم
- [وثائق Supabase](https://supabase.com/docs)
- [مجتمع Supabase](https://github.com/supabase/supabase/discussions)
- [دعم فني](https://supabase.com/support)
