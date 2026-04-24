import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// التحقق من وجود المتغيرات بدون إيقاف الـ Build
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('تنبيه: متغيرات Supabase غير مكتملة في إعدادات البيئة الحالية.');
}

// إنشاء الكلينت فقط إذا توفرت القيم، وإلا يتم تصدير null مؤقتاً أثناء الـ Build
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
