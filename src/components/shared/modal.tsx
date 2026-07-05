import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ModalProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ open, title, description, onClose, children }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-background p-6 shadow-2xl border border-border">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-5">{children}</div>
      </div>
    </div>
  )
}
