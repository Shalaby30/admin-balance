export const MONTH_OPTIONS = [
  { value: 'all', label: 'كل الشهور' },
  { value: '01', label: 'يناير' },
  { value: '02', label: 'فبراير' },
  { value: '03', label: 'مارس' },
  { value: '04', label: 'أبريل' },
  { value: '05', label: 'مايو' },
  { value: '06', label: 'يونيو' },
  { value: '07', label: 'يوليو' },
  { value: '08', label: 'أغسطس' },
  { value: '09', label: 'سبتمبر' },
  { value: '10', label: 'أكتوبر' },
  { value: '11', label: 'نوفمبر' },
  { value: '12', label: 'ديسمبر' },
] as const

const currentYear = new Date().getFullYear()

export const YEAR_OPTIONS = [
  { value: 'all', label: 'كل السنوات' },
  ...Array.from({ length: 7 }, (_, i) => {
    const year = String(currentYear - 3 + i)
    return { value: year, label: year }
  }),
]

export interface DateFilter {
  month?: string
  year?: string
}

export function matchesDateFilter(date: string | undefined, month: string, year: string): boolean {
  if (!date) return false
  const monthMatch = month === 'all' || date.slice(5, 7) === month
  const yearMatch = year === 'all' || date.slice(0, 4) === year
  return monthMatch && yearMatch
}
