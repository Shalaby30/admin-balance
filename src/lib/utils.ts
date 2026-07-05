import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ar-SA').format(num)
}

const monthNames = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
]

export function formatDate(value: string | Date): string {
  if (!value) return ''
  
  if (value instanceof Date) {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  const normalized = String(value).trim()
  
  if (normalized.includes(' ') && !normalized.includes('-')) {
    const parsedDate = new Date(normalized)
    if (!isNaN(parsedDate.getTime())) {
      const year = parsedDate.getFullYear()
      const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
      const day = String(parsedDate.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
  
  const parts = normalized.split('T')[0].split('-')
  if (parts.length !== 3) return value
  const [year, month, day] = parts
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function formatDateArabic(value: string): string {
  if (!value) return ''
  const normalized = value.trim()
  const parts = normalized.split('T')[0].split('-')
  if (parts.length !== 3) return value
  const [year, month, day] = parts
  const monthName = monthNames[Number(month) - 1] ?? month
  return `${String(Number(day))}-${monthName}-${year}`
}
