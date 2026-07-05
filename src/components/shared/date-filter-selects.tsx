import { MONTH_OPTIONS, YEAR_OPTIONS } from '@/lib/date-filters'

interface DateFilterSelectsProps {
  selectedMonth: string
  selectedYear: string
  onMonthChange: (value: string) => void
  onYearChange: (value: string) => void
  className?: string
}

export function DateFilterSelects({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  className = '',
}: DateFilterSelectsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <select
        value={selectedYear}
        onChange={(e) => onYearChange(e.target.value)}
        className="flex h-8 rounded-xl border border-input bg-background/50 px-2  text-sm"
      >
        {YEAR_OPTIONS.map((year) => (
          <option key={year.value} value={year.value}>
            {year.label}
          </option>
        ))}
      </select>
      <select
        value={selectedMonth}
        onChange={(e) => onMonthChange(e.target.value)}
        className="flex h-8 rounded-xl border border-input bg-background/50 px-2  text-sm"
      >
        {MONTH_OPTIONS.map((month) => (
          <option key={month.value} value={month.value}>
            {month.label}
          </option>
        ))}
      </select>
    </div>
  )
}
