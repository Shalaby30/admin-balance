// will be working from next update

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Wrench, Users, Truck, GraduationCap } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { GlassCard } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNeonQuery } from '@/hooks/use-neon-query'
import { getCalendarEvents } from '@/lib/db-queries'
import { cn, formatDate } from '@/lib/utils'

const typeConfig: Record<string, { icon: typeof Wrench; color: string; label: string }> = {
  maintenance: { icon: Wrench, color: 'bg-info/15 text-info', label: 'صيانة' },
  meeting: { icon: Users, color: 'bg-primary/15 text-primary', label: 'اجتماع' },
  delivery: { icon: Truck, color: 'bg-success/15 text-success', label: 'تسليم' },
  training: { icon: GraduationCap, color: 'bg-warning/15 text-warning', label: 'تدريب' },
  inspection: { icon: Wrench, color: 'bg-chart-4/15 text-chart-4', label: 'فحص' },
}

const days = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت']
const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

export default function CalendarPage() {
  const { data: calendarEvents } = useNeonQuery(getCalendarEvents, [], [])
  const events = calendarEvents ?? []
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startDayOfWeek = firstDayOfMonth.getDay()
  
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }
  
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getEventsForDay = (day: number) => {
    return events.filter((e) => {
      const eventDate = new Date(e.date)
      return eventDate.getFullYear() === currentYear && 
             eventDate.getMonth() === currentMonth && 
             eventDate.getDate() === day
    })
  }

  const handleDayClick = (day: number) => {
    setSelectedDay(day)
  }

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : []

  return (
    <div>
      <PageHeader title="التقويم" description="جدولة الأحداث والمواعيد" icon={Calendar} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">{monthNames[currentMonth]} {currentYear}</h3>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPreviousMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-3" onClick={goToToday}>
                اليوم
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNextMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {days.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dayEvents = getEventsForDay(day)
              const isToday = isCurrentMonth && day === today.getDate()
              const isSelected = selectedDay === day
              
              return (
                <motion.button
                  key={day}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    'aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-colors relative',
                    isSelected ? 'bg-accent text-accent-foreground font-bold ring-2 ring-primary' : 
                    isToday ? 'bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/30' : 'hover:bg-muted/50',
                    dayEvents.length > 0 && !isToday && !isSelected && 'font-semibold'
                  )}
                >
                  {day}
                  {dayEvents.length > 0 && (
                    <div className={cn('absolute bottom-1.5 h-1 w-1 rounded-full', 
                      isToday || isSelected ? 'bg-primary-foreground' : 'bg-primary')} />
                  )}
                </motion.button>
              )
            })}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-semibold mb-4">
            {selectedDay ? `أحداث ${selectedDay} ${monthNames[currentMonth]}` : 'الأحداث القادمة'}
          </h3>
          <div className="space-y-3">
            {selectedDay ? (
              selectedDayEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">لا توجد أحداث في هذا اليوم</p>
              ) : (
                selectedDayEvents.map((event, i) => {
                  const config = typeConfig[event.type] || typeConfig.maintenance
                  const Icon = config.icon
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors"
                    >
                      <div className={cn('rounded-lg p-2', config.color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(event.date)}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{config.label}</Badge>
                    </motion.div>
                  )
                })
              )
            ) : (
              events.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">لا توجد أحداث</p>
              ) : (
                events.map((event, i) => {
                  const config = typeConfig[event.type] || typeConfig.maintenance
                  const Icon = config.icon
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors"
                    >
                      <div className={cn('rounded-lg p-2', config.color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(event.date)}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{config.label}</Badge>
                    </motion.div>
                  )
                })
              )
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
